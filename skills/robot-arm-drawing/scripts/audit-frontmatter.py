"""Audit YAML frontmatter in markdown files.

Usage (from the book's project folder):
    python3 skills/robot-arm-drawing/scripts/audit-frontmatter.py [glob]

The glob defaults to docs/sims/*/index.md. Each file must parse as YAML, and no unquoted value may
contain a colon. An unquoted `description: A sim: it does X` is invalid YAML, and mkdocs then prints
the frontmatter at the top of the page instead of failing the build. Exits 1 if any file has a problem.
"""
import sys, re, glob, yaml

def frontmatter(path):
    t = open(path).read()
    if not t.startswith('---\n'):
        return None, None
    end = t.index('\n---', 4)
    return t[4:end], t

bad = 0
pattern = sys.argv[1] if len(sys.argv) > 1 else 'docs/sims/*/index.md'
for p in sorted(glob.glob(pattern, recursive=True)):
    fm, _ = frontmatter(p)
    if fm is None:
        print(f'NO FRONTMATTER  {p}'); continue
    problems = []
    try:
        data = yaml.safe_load(fm)
    except yaml.YAMLError as e:
        data = None
        problems.append('YAML PARSE ERROR: ' + str(e).splitlines()[0] + ' ' + (str(e.problem_mark).strip() if getattr(e, 'problem_mark', None) else ''))
    for n, line in enumerate(fm.split('\n'), 2):
        m = re.match(r'^(\s*)([A-Za-z0-9_.\-:]+):\s+(.*\S)\s*$', line)
        if not m: continue
        key, val = m.group(2), m.group(3)
        if val[0] in '"\'' or val[0] in '|>[{&*!': continue      # quoted or block/flow syntax
        if ':' in val:
            problems.append(f'line {n}: unquoted value with a colon -> {key}: {val[:70]}...')
    if problems:
        bad += 1
        print(f'FAIL {p}')
        for x in problems: print('     ', x)
    else:
        print(f'ok   {p}   keys={sorted(data) if isinstance(data, dict) else data}')
print(f'\n{bad} file(s) with problems')
sys.exit(1 if bad else 0)
