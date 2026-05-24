#!/usr/bin/env python3
"""
Final accuracy audit: every image must accurately depict its event.
Removes ALL duplicates within a single page (keeping only the canonical
event), removes incorrect cross-page reuses, and fixes one wrong file.
Accuracy is the priority; coverage % is no longer a target.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# ── 1. timeline.json — single swap (Sojourner used the wrong rover photo) ─
tl_path = ROOT / 'data/timeline.json'
tl = json.loads(tl_path.read_text())
swap_count = 0
for era in tl['eras']:
    for ev in era['events']:
        if 'Sojourner on Mars' in (ev.get('titleEn') or ''):
            ev['image'] = {
                'file': 'Sojourner_on_Mars_PIA01122.jpg',
                'credit': "Sojourner rover on Mars, 1997 — NASA/JPL (Public domain)",
                'alt': "Mars Pathfinder's Sojourner rover on the Martian surface"
            }
            swap_count += 1
tl_path.write_text(json.dumps(tl, ensure_ascii=False, indent=2) + '\n')
print(f"timeline.json: {swap_count} corrected (Sojourner: was Curiosity 2012 → now Sojourner 1997)")


# ── 2. humanoid.json — drop EVERY duplicate keeping only the best match ──
hu_path = ROOT / 'data/humanoid.json'
hu = json.loads(hu_path.read_text())

# Per-file: which event-title fragment to KEEP; all others lose the image.
KEEP_ONLY = {
    'Unitree_G1.jpg':                        'Unitree G1',                    # not H1/Six tigers/outlook
    'Atlas_frontview_2013.jpg':              'Atlas (DRC version)',           # not 'DRC Announced' (same era)
    'Cassie_the_robot_01.jpg':               "Agility Robotics' Cassie",      # not Digit
    'Einstein-Hubo.jpg':                     'KAIST HUBO',                    # not DRC Finals
    'Honda_P2_front_Honda_Collection_Hall.jpg': 'P2 — The Self-Contained',    # not P1
    'Figure-ai-logo.svg':                    'Figure AI Incorporated',        # not Series B or BMW
    'Atlas_climbing_into_a_vehicle.jpg':     None,                            # remove ALL — image is DRC-era, not Gen 2 / backflip / retirement
}

# Cross-page wrong reuses (humanoid pages reusing timeline.json files
# for events where the image doesn't actually depict the subject)
DROP_TITLES = {
    'Vukobratović Proposes the ZMP',         # Jaquet-Droz → ZMP is math, not automata
    'Kato Lab Begins',                       # Karakuri → too tenuous a link
    'WABOT-2 — The Organ Player',            # Stanford Arm → wrong robot
}

removed = 0
for era in hu['eras']:
    for ev in era['events']:
        if not ev.get('image'):
            continue
        title = ev.get('titleEn') or ''
        fname = ev['image']['file']

        # 2a. drop the cross-page wrong reuses
        if any(d in title for d in DROP_TITLES):
            del ev['image']
            removed += 1
            continue

        # 2b. for each duplicated file, keep only the canonical event
        if fname in KEEP_ONLY:
            keep = KEEP_ONLY[fname]
            if keep is None or keep not in title:
                del ev['image']
                removed += 1

hu_path.write_text(json.dumps(hu, ensure_ascii=False, indent=2) + '\n')
print(f"humanoid.json: removed {removed} mismatched / duplicate image attachments")

# ── Final audit ────────────────────────────────────────────────────────────
print("\n=== FINAL AUDIT ===")
from collections import defaultdict
for fname in [tl_path, hu_path]:
    d = json.loads(fname.read_text())
    by_file = defaultdict(list)
    for era in d['eras']:
        for ev in era['events']:
            if ev.get('image'):
                by_file[ev['image']['file']].append(ev['titleEn'])
    total = sum(len(era['events']) for era in d['eras'])
    imgs = sum(len(v) for v in by_file.values())
    dups = [f for f, u in by_file.items() if len(u) > 1]
    print(f"{fname.name}: {imgs}/{total} images, {len(by_file)} unique, {len(dups)} duplicated files")
    for f in dups:
        print(f"  STILL DUPLICATED: [{len(by_file[f])}×] {f}")
        for t in by_file[f]:
            print(f"     → {t}")
