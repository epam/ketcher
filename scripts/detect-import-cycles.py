#!/usr/bin/env python3
import argparse
import os
import re
from collections import defaultdict

IMPORT_RE = re.compile(
    r"^\s*import(?:[\s\w{},*]+from\s*)?['\"]([^'\"]+)['\"]"
    r"|^\s*export\s+\*\s+from\s+['\"]([^'\"]+)['\"]"
    r"|^\s*export\s*{[^}]*}\s*from\s*['\"]([^'\"]+)['\"]"
)
EXTENSIONS = ('.ts', '.tsx', '.js', '.jsx')


def collect_files(root_dirs):
    files = []
    for root in root_dirs:
        for dirpath, _, filenames in os.walk(root):
            for filename in filenames:
                if filename.endswith(EXTENSIONS):
                    files.append(os.path.normpath(os.path.join(dirpath, filename)))
    return files


def resolve_local_import(from_file, import_path, files_set):
    if not import_path.startswith('.'):
        return None

    base = os.path.normpath(os.path.join(os.path.dirname(from_file), import_path))
    candidates = [
        *(base + ext for ext in EXTENSIONS),
        *(os.path.join(base, 'index' + ext) for ext in EXTENSIONS),
    ]

    for candidate in candidates:
        if candidate in files_set:
            return candidate

    return None


def build_graph(files):
    files_set = set(files)
    graph = defaultdict(list)

    for file_path in files:
        with open(file_path, encoding='utf-8', errors='ignore') as source:
            for line in source:
                match = IMPORT_RE.match(line)
                if not match:
                    continue

                import_path = next(group for group in match.groups() if group)
                resolved = resolve_local_import(file_path, import_path, files_set)
                if resolved:
                    graph[file_path].append(resolved)

    return graph


def find_scc(files, graph):
    index = 0
    stack = []
    on_stack = set()
    indices = {}
    lowlinks = {}
    components = []

    def strongconnect(node):
        nonlocal index
        indices[node] = lowlinks[node] = index
        index += 1
        stack.append(node)
        on_stack.add(node)

        for neighbor in graph.get(node, []):
            if neighbor not in indices:
                strongconnect(neighbor)
                lowlinks[node] = min(lowlinks[node], lowlinks[neighbor])
            elif neighbor in on_stack:
                lowlinks[node] = min(lowlinks[node], indices[neighbor])

        if lowlinks[node] == indices[node]:
            component = []
            while True:
                w = stack.pop()
                on_stack.remove(w)
                component.append(w)
                if w == node:
                    break
            if len(component) > 1:
                components.append(component)

    for file_path in files:
        if file_path not in indices:
            strongconnect(file_path)

    return components


def main():
    parser = argparse.ArgumentParser(description='Detect local circular imports.')
    parser.add_argument(
        'paths',
        nargs='*',
        default=[
            'packages/ketcher-core/src',
            'packages/ketcher-react/src',
            'packages/ketcher-standalone/src',
            'packages/ketcher-macromolecules/src',
        ],
    )
    args = parser.parse_args()

    roots = [os.path.normpath(path) for path in args.paths if os.path.exists(path)]
    files = collect_files(roots)
    graph = build_graph(files)
    components = sorted(find_scc(files, graph), key=len, reverse=True)

    print(f'Circular groups: {len(components)}')
    for idx, component in enumerate(components, start=1):
        print(f'\n[{idx}] size={len(component)}')
        for file_path in component:
            print(f'  {file_path}')

    return 1 if components else 0


if __name__ == '__main__':
    raise SystemExit(main())
