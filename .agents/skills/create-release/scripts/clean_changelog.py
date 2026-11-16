#!/usr/bin/env python3
"""
Cleans up GitHub auto-generated release notes for Ketcher releases.

Two modes:
  clean    Take one raw (or already-sectioned) release body on stdin,
           strip "by @author in <PR URL>" suffixes, look up each ticket's
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
VERSION_BUMP_TITLE_RE = re.compile(
    r"^(update ketcher to (release candidate|public version)|bump ketcher)\b", re.IGNORECASE
)
SKIP_LINE_PREFIXES = ("**full changelog**",)

RAW_LINE_RE = re.compile(
    r"^\*\s+#(?P<num>\d+)\s*[-–]\s*(?P<title>.*?)"
    r"(?:\s+by\s+@\S+\s+in\s+https?://\S+)?\s*$"
)
SECTION_HEADER_RE = re.compile(r"^###\s+(.+?)\s*$", re.MULTILINE)
BULLET_RE = re.compile(r"^\*\s+#(?P<num>\d+)\s*[–-]\s*(?P<title>.+?)\s*$")


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
            bare_title = re.sub(r"\s+by\s+@\S+\s+in\s+https?://\S+\s*$", "", bare_title)
            if VERSION_BUMP_TITLE_RE.match(bare_title):
                excluded.append({"title": bare_title, "reason": "version bump commit, not a changelog entry"})
            elif EXCLUDE_TITLE_PREFIXES.match(bare_title):
                excluded.append({"title": bare_title, "reason": "Autotest/Backmerge/Refactor title"})
            else:
                flagged.append({"line": line, "reason": "no ticket number found"})
            continue
        num, title = m.group("num"), m.group("title").strip()

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
        categories[category].append(f"* #{num} – {title}")

    return categories, excluded, flagged


def parse_sectioned_body(body):
    """A body a human already reviewed: '### Category' headers with '* #N - title' bullets."""
    categories = {c: [] for c in CATEGORY_ORDER}
    current = None
    for line in body.splitlines():
        line = line.rstrip()
        header = SECTION_HEADER_RE.match(line)
        if header:
            current = header.group(1).strip()
            categories.setdefault(current, [])
            continue
        bullet = BULLET_RE.match(line.strip())
        if bullet and current:
            categories[current].append(f"* #{bullet.group('num')} – {bullet.group('title').strip()}")
    return categories


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
    all_excluded, all_flagged = [], []

    for path in args.files:
        with open(path) as f:
            body = f.read()
        if looks_sectioned(body):
            categories = parse_sectioned_body(body)
        else:
            categories, excluded, flagged = parse_raw_body(body, args.owner, args.repo)
            all_excluded.extend(excluded)
            all_flagged.extend(flagged)

        for name, entries in categories.items():
            merged.setdefault(name, [])
            for entry in entries:
                m = re.match(r"^\* #(\d+)", entry)
                num = m.group(1) if m else entry
                if num in seen_nums:
                    continue
                seen_nums.add(num)
                merged[name].append(entry)

    if args.report:
        report = {"excluded": all_excluded, "flagged": all_flagged}
        print(json.dumps(report, indent=2), file=sys.stderr)
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
