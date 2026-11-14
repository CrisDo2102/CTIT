"""Update the inline artwork from the editable master SVG. Python 3, no dependencies."""
from pathlib import Path
import json
import re
import xml.etree.ElementTree as ET

root = Path(__file__).resolve().parents[1]
svg = (root / 'public/images/ctit-about-chip.svg').read_text(encoding='utf-8')
ET.fromstring(svg)  # Reject malformed XML before changing either view.
jsx = svg.replace('class=', 'className=')
for attribute in ('stroke-width', 'stroke-linejoin', 'stroke-dasharray', 'font-family',
                  'font-size', 'font-weight', 'letter-spacing', 'stop-color'):
    camel = re.sub(r'-([a-z])', lambda match: match[1].upper(), attribute)
    jsx = jsx.replace(attribute + '=', camel + '=')
jsx = re.sub(r'<style>(.*?)</style>', lambda match: '<style>{' + json.dumps(match[1]) + '}</style>', jsx, flags=re.S)
for relative, attribute, artwork in (
    ('components/ctit-about/AboutPage.tsx', 'className', jsx),
):
    path = root / relative
    source = path.read_text(encoding='utf-8')
    pattern = r'(<div ' + attribute + r'="ca-chip">)\s*<svg\b.*?</svg>'
    source, count = re.subn(pattern, lambda match: match[1] + '\n' + artwork, source, count=1, flags=re.S)
    if count != 1:
        raise RuntimeError('Cannot locate artwork in ' + relative)
    path.write_text(source, encoding='utf-8')
print('Updated React artwork from ctit-about-chip.svg.')
