#!/usr/bin/env python3
"""
Cleans up GitHub auto-generated release notes for Ketcher releases.

Two modes:
  clean    Take one raw (or already-sectioned) release body on stdin,
           strip "by @author [with @co-author] in <PR URL>" suffixes, look up each ticket's
           GitHub issue type via `gh issue view --json issueType`, drop
           Autotest/Backmerge/Refactor/Task entries into an "excluded" bucket, flag
           anything with no ticket number or no resolvable issue type, and
           print a JSON report: {"categories": {...}, "excluded": [...],
           "flagged": [...]}.

  combine  Take several release bodies (files) that are each either raw or
           already sectioned (has "### New features" / "### Bugfixes and
           improvements" headers - meaning a human already reviewed it),
           merge same-named categories across all of them, dedupe by
           ticket number, and print the combined markdown body directly
           (no JSON - nothing left to review, since sectioned bodies are
           trusted as-is and raw ones go through the same clean pipeline
           as the `clean` mode before merging).

This script only does the mechanical parts: stripping noise, categorizing
by issue type, deduping. It deliberately does NOT auto-rewrite entry
wording (proof-reading typos) or decide close judgment calls about
excluded entries - that stays a human/assistant review step downstream,
using the JSON report `clean` prints.
"""
import argparse
import json
import re
import subprocess
import sys

CATEGORY_ORDER = ["New features", "Bugfixes and improvements"]
ISSUE_TYPE_TO_CATEGORY = {
    "Feature": "New features",
    "Bug": "Bugfixes and improvements",
}
EXCLUDE_TITLE_PREFIXES = re.compile(r"^(autotest s?|backmerge|refactor)\b", re.IGNORECASE)
# Our own prepare-release commit titles - never real changelog content, always drop.
# Also matches hand-written variants seen in 3.20 ("- bumped ketcher to 3.20.0-rc.2",
# "Updated ketcher to 3.20.0-rc.3"); "update ketcher to" only counts when followed
# by a version, so a real "Update Ketcher to support X" title is not dropped.
VERSION_BUMP_TITLE_RE = re.compile(
    r"^(?:-\s*)?(updated? ketcher to (release candidate|public version|v?\d)|bump(ed)? ketcher)\b",
    re.IGNORECASE,
)
SKIP_LINE_PREFIXES = ("**full changelog**",)

# One or more ticket refs before the title: "#123 - x" or "#123, #456 - x".
TICKETS_PATTERN = r"(?P<tickets>#\d+(?:\s*,\s*#\d+)*)"
DASH_PATTERN = r"\s*[-–—]\s*"
# PR titles don't always put a dash after the ticket ("#3709 Displaying ...");
# raw lines accept a plain space too, or such entries end up flagged as having
# no ticket number. Sectioned drafts are produced by format_entry, always dashed.
RAW_SEPARATOR_PATTERN = r"(?:" + DASH_PATTERN + r"|\s+)"
# GitHub's attribution suffix: "by @a in <url>", and co-authored PRs as
# "by @a with @b in <url>" / "by @a, @b and @c in <url>".
AUTHOR_SUFFIX_PATTERN = (
    r"\s+by\s+@\S+(?:(?:\s*,|\s+and|\s+with)\s+@\S+)*\s+in\s+https?://\S+"
)
RAW_LINE_RE = re.compile(
    r"^\*\s+" + TICKETS_PATTERN + RAW_SEPARATOR_PATTERN + r"(?P<title>.*?)"
    r"(?:" + AUTHOR_SUFFIX_PATTERN + r")?\s*$"
)
SECTION_HEADER_RE = re.compile(r"^###\s+(.+?)\s*$", re.MULTILINE)
BULLET_RE = re.compile(r"^\*\s+" + TICKETS_PATTERN + DASH_PATTERN + r"(?P<title>.+?)\s*$")


def ticket_numbers(tickets):
    """'#5857, #5676' -> ['5857', '5676']"""
    return re.findall(r"\d+", tickets)


def format_entry(nums, title):
    return "* " + ", ".join(f"#{n}" for n in nums) + f" – {title}"


def gh_issue_type(owner, repo, number):
    try:
        out = subprocess.run(
            ["gh", "issue", "view", str(number), "--repo", f"{owner}/{repo}",
             "--json", "issueType"],
            capture_output=True, text=True, timeout=20, check=True,
        )
    except subprocess.CalledProcessError:
        return None
    try:
        data = json.loads(out.stdout)
    except json.JSONDecodeError:
        return None
    issue_type = data.get("issueType")
    return issue_type.get("name") if issue_type else None


def parse_raw_body(body, owner, repo):
    categories = {c: [] for c in CATEGORY_ORDER}
    excluded = []
    flagged = []

    for line in body.splitlines():
        line = line.strip()
        if line.lower().startswith(SKIP_LINE_PREFIXES):
            continue  # boilerplate "**Full Changelog**: <compare link>" - not a changelog entry
        if not line.startswith("*"):
            continue  # skip blanks, "## What's Changed", etc.
        m = RAW_LINE_RE.match(line)
        if not m:
            bare_title = re.sub(r"^\*\s+", "", line)
            bare_title = re.sub(AUTHOR_SUFFIX_PATTERN + r"\s*$", "", bare_title)
            if VERSION_BUMP_TITLE_RE.match(bare_title):
                excluded.append({"title": bare_title, "reason": "version bump commit, not a changelog entry"})
            elif EXCLUDE_TITLE_PREFIXES.match(bare_title):
                excluded.append({"title": bare_title, "reason": "Autotest/Backmerge/Refactor title"})
            else:
                flagged.append({"line": line, "reason": "no ticket number found"})
            continue
        nums, title = ticket_numbers(m.group("tickets")), m.group("title").strip()
        # Multi-ticket entries ("#5857, #5676 - ...") are categorized by their
        # first ticket's issue type; all numbers are kept in the entry.
        num = nums[0]

        if VERSION_BUMP_TITLE_RE.match(title):
            excluded.append({"num": num, "title": title, "reason": "version bump commit, not a changelog entry"})
            continue
        if EXCLUDE_TITLE_PREFIXES.match(title):
            excluded.append({"num": num, "title": title, "reason": "Autotest/Backmerge/Refactor title"})
            continue

        issue_type = gh_issue_type(owner, repo, num)
        if issue_type is None:
            flagged.append({"num": num, "title": title,
                             "reason": "no linked issue / issue type found for #" + num})
            continue
        if issue_type == "Task":
            excluded.append({"num": num, "title": title, "reason": "issue type Task"})
            continue
        category = ISSUE_TYPE_TO_CATEGORY.get(issue_type)
        if category is None:
            flagged.append({"num": num, "title": title,
                             "reason": f"unrecognized issue type '{issue_type}'"})
            continue
        categories[category].append(format_entry(nums, title))

    return categories, excluded, flagged


def parse_sectioned_body(body):
    """A body a human already reviewed: '### Category' headers with '* #N - title' bullets.

    Returns (categories, flagged). Any '*' bullet that can't be parsed, or that
    appears before the first '###' header, goes to `flagged` instead of being
    silently dropped - these entries were already human-approved, so losing one
    without a trace is the worst failure mode here.
    """
    categories = {c: [] for c in CATEGORY_ORDER}
    flagged = []
    current = None
    for line in body.splitlines():
        line = line.rstrip()
        header = SECTION_HEADER_RE.match(line)
        if header:
            current = header.group(1).strip()
            categories.setdefault(current, [])
            continue
        stripped = line.strip()
        if not stripped.startswith("*"):
            continue  # blanks, "## What's Changed", "---", "- " notes, etc.
        bullet = BULLET_RE.match(stripped)
        if not bullet:
            flagged.append({"line": stripped, "reason": "unparseable bullet in an already-sectioned body"})
            continue
        if current is None:
            flagged.append({"line": stripped, "reason": "bullet before any '###' section header"})
            continue
        nums = ticket_numbers(bullet.group("tickets"))
        categories[current].append(format_entry(nums, bullet.group("title").strip()))
    return categories, flagged


def looks_sectioned(body):
    return bool(SECTION_HEADER_RE.search(body))


def render_categories(categories):
    lines = ["## What's Changed", ""]
    ordered_names = CATEGORY_ORDER + [c for c in categories if c not in CATEGORY_ORDER]
    for name in ordered_names:
        entries = categories.get(name)
        if not entries:
            continue
        lines.append(f"### {name}")
        lines.extend(entries)
        lines.append("")
    return "\n".join(lines).rstrip() + "\n"


def cmd_clean(args):
    body = sys.stdin.read()
    categories, excluded, flagged = parse_raw_body(body, args.owner, args.repo)
    print(json.dumps({"categories": categories, "excluded": excluded, "flagged": flagged}, indent=2))


def cmd_combine(args):
    merged = {c: [] for c in CATEGORY_ORDER}
    seen_nums = set()
    all_excluded, all_flagged, sectioned_flagged = [], [], []

    for path in args.files:
        with open(path) as f:
            body = f.read()
        if looks_sectioned(body):
            categories, flagged = parse_sectioned_body(body)
            sectioned_flagged.extend({**item, "file": path} for item in flagged)
        else:
            categories, excluded, flagged = parse_raw_body(body, args.owner, args.repo)
            all_excluded.extend(excluded)
            all_flagged.extend(flagged)

        for name, entries in categories.items():
            merged.setdefault(name, [])
            for entry in entries:
                m = re.match(r"^\*\s+(#\d+(?:\s*,\s*#\d+)*)", entry)
                nums = set(ticket_numbers(m.group(1))) if m else {entry}
                if nums <= seen_nums:
                    continue  # every ticket in this entry is already listed
                seen_nums.update(nums)
                merged[name].append(entry)

    all_flagged.extend(sectioned_flagged)
    if args.report:
        report = {"excluded": all_excluded, "flagged": all_flagged}
        print(json.dumps(report, indent=2), file=sys.stderr)
    elif sectioned_flagged:
        # Entries a human already approved would otherwise vanish without a
        # trace - warn even when --report wasn't asked for.
        print("WARNING: lines left out of the combined body (not parseable as entries):",
              file=sys.stderr)
        print(json.dumps(sectioned_flagged, indent=2), file=sys.stderr)
    print(render_categories(merged))


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--owner", default="epam")
    parser.add_argument("--repo", default="ketcher")
    sub = parser.add_subparsers(dest="command", required=True)

    sub.add_parser("clean", help="Clean+categorize one raw body from stdin, print JSON report")

    p_combine = sub.add_parser("combine", help="Merge several release bodies (files) into one")
    p_combine.add_argument("files", nargs="+", help="Paths to release body text files, in rc order")
    p_combine.add_argument("--report", action="store_true",
                            help="Also print excluded/flagged JSON to stderr for any raw (unreviewed) inputs")

    args = parser.parse_args()
    if args.command == "clean":
        cmd_clean(args)
    elif args.command == "combine":
        cmd_combine(args)


if __name__ == "__main__":
    main()
