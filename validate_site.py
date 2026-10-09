"""Dependency-free sanity check for T-Squared HTML assets and nav links.
Run: python validate_site.py
"""
from pathlib import Path
from html.parser import HTMLParser
import re

ROOT = Path(__file__).resolve().parent
PUBLIC = ROOT / 'dist'

class Scan(HTMLParser):
    def __init__(self):
        super().__init__()
        self.refs = []
        self.ids = set()
        self.h1 = 0
        self.mains = 0
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if attrs.get('id'):
            self.ids.add(attrs['id'])
        if tag == 'h1': self.h1 += 1
        if tag == 'main': self.mains += 1
        attr = 'src' if tag in {'img','script'} else 'href' if tag in {'a','link'} else None
        if attr and attrs.get(attr):
            self.refs.append(attrs[attr])

def scan(path):
    parser = Scan()
    parser.feed(path.read_text(encoding='utf-8'))
    return parser

pages = sorted(PUBLIC.glob('*.html'))
errors = []
scans = {page:scan(page) for page in pages}
for page, doc in scans.items():
    if doc.h1 != 1: errors.append(f'{page.name}: expected 1 H1, found {doc.h1}')
    if doc.mains != 1: errors.append(f'{page.name}: expected 1 main, found {doc.mains}')
    for ref in doc.refs:
        if ref.startswith(('http:','https:','mailto:','tel:','data:')): continue
        if ref.startswith('#'):
            if ref[1:] not in doc.ids: errors.append(f'{page.name}: missing #{ref[1:]}')
            continue
        local = ref.split('#')[0].split('?')[0]
        fragment = ref.split('#',1)[1] if '#' in ref else None
        if not local: continue
        target = page.parent / local
        if not target.exists():
            errors.append(f'{page.name}: broken file link: {ref}')
        elif fragment and target.suffix == '.html' and fragment not in scans.get(target,scan(target)).ids:
            errors.append(f'{page.name}: broken anchor: {ref}')

content = (PUBLIC/'assets/galleries.js').read_text(encoding='utf-8')

content = re.sub(r'/\*.*?\*/|//[^\n]*', '', content, flags=re.S)
photos = re.findall(r"src:\s*'([^']+)'",content)
for name in photos:
    if not (PUBLIC/name).is_file(): errors.append(f'gallery source missing: {name}')
if (PUBLIC/'wood.html').exists(): errors.append('Unpublished wood page found in the public folder!')
if not (ROOT/'UNPUBLISHED/wood.html').exists(): errors.append('Offline wood draft missing')
for path in ['assets/styles.css','assets/site.js','assets/galleries.js']:
    if not (PUBLIC/path).is_file(): errors.append(f'Shared asset missing: {path}')
print(f'Found {len(pages)} HTML pages and {len(photos)} gallery references.')
if errors:
    print('FAIL:')
    for error in errors: print(' -', error)
    raise SystemExit(1)
print('PASS: page structure, local links, anchors, gallery assets and wood publish separation.')
