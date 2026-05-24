#!/usr/bin/env python3
"""
Dedupe / clean humanoid.json images. Removes clearly mismatched proxies
(where the same image is used to illustrate a different company's robot)
and swaps a couple to same-brand alternatives.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
path = ROOT / 'data/humanoid.json'
d = json.loads(path.read_text())

# Title fragments where the image is a misleading proxy → drop image entirely
REMOVE = [
    'The First Real Humanoid',           # 1973 WABOT-1 (was Karakuri)
    'WHL-11 and WL-9DR',                 # 1980 (was Karakuri)
    'Honda E0 – E6',                     # 1986-93 (was Honda P2)
    'Sanctuary AI Incorporated',          # 2022-04 (was Ameca)
    "Apptronik's Apollo Concept",         # 2022 (was Atlas)
    '1X Closes Series A2',                # 2023-03 (was Cassie)
    'Sanctuary Phoenix Gen 6',            # 2023-08 (was Ameca)
    'Fourier Intelligence GR-1',          # 2023-10 (was Unitree G1)
    '1X NEO Beta',                        # 2024-08 (was Cassie)
    'Physical Intelligence π0',           # 2024-10 (was Atlas)
    'Apptronik Closes',                   # 2025-03 (was Atlas)
]

# Title fragments where we swap to a more accurate same-brand image
SWAP = {
    "Unitree H1": {
        'file': 'Unitree_G1.jpg',
        'credit': "Unitree G1 — sibling of the H1 (CC0)",
        'alt': "Unitree humanoid robot"
    },
    "Figure 02 on the BMW Line": {
        'file': 'Figure-ai-logo.svg',
        'credit': "Figure AI (CC-BY 4.0)",
        'alt': "Figure AI logo"
    },
}

removed = 0
swapped = 0
for era in d['eras']:
    for ev in era['events']:
        title = ev.get('titleEn') or ''
        if any(frag in title for frag in REMOVE):
            if 'image' in ev:
                del ev['image']
                removed += 1
        for frag, new in SWAP.items():
            if frag in title:
                ev['image'] = dict(new)
                swapped += 1

path.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
print(f"humanoid.json: -{removed} mismatched images removed, ↻{swapped} swapped to same-brand")

# Audit
from collections import defaultdict
by_file = defaultdict(list)
events_with_img = 0
total_events = 0
for era in d['eras']:
    for ev in era['events']:
        total_events += 1
        if ev.get('image'):
            events_with_img += 1
            by_file[ev['image']['file']].append(ev['titleEn'])
print(f"\nNow: {events_with_img}/{total_events} events have images ({events_with_img*100//total_events}%)")
print(f"Unique files: {len(by_file)}")
remaining_dups = [(f, len(u)) for f, u in by_file.items() if len(u) > 1]
print(f"\nRemaining duplicate uses (kept because contextually valid):")
for f, n in sorted(remaining_dups, key=lambda x: -x[1]):
    print(f"  [{n}×] {f}")
    for t in by_file[f]:
        print(f"        → {t}")
