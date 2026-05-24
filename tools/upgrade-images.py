#!/usr/bin/env python3
"""
Second pass: replace proxy images with verified specific photos
(now that the second research round confirmed exact filenames on
Wikimedia Commons), and attach portraits for additional people.
This script can be re-run safely.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# (page, title-fragment EN, file, credit, alt) — overwrites existing image
REPLACE = [
    # ── humanoid.json — swap proxies for the real thing ───────────
    ('humanoid', "P3 — Down to 130 kg",
        'Honda_P3_Fan_Fun_Lab.jpg',
        "Honda P3 at the Fan Fun Lab, photo by Morio (CC-BY-SA 3.0)",
        "Honda P3 humanoid robot, 1997"),
    ('humanoid', "AIST HRP-2",
        'HRP-2_front_Science_Museum_Tokyo.jpg',
        "AIST HRP-2 'Promet' at the Science Museum Tokyo, photo by Morio (CC-BY-SA 3.0)",
        "AIST HRP-2 humanoid"),
    ('humanoid', "HRP-4C",
        'HRP-4C_-_SIGGRAPH_Asia_2009_(2009-12-18_15.06.08).jpg',
        "AIST HRP-4C 'Miim' at SIGGRAPH Asia 2009 (CC-BY 2.0)",
        "AIST HRP-4C female-form humanoid"),
    ('humanoid', "Schaft and Boston Dynamics",
        'President_Obama_Talks_to_Designers_of_the_SCHAFT_Robot.jpg',
        "President Obama meets SCHAFT's designers (Public domain, U.S. Dept. of State)",
        "SCHAFT robot and President Obama"),
    ('humanoid', "ASIMO Unveiled",
        'Asimo_at_Honda_Collection_Hall.jpg',
        "ASIMO at the Honda Collection Hall (CC0)",
        "Honda ASIMO humanoid"),
    ('humanoid', "Honda Discontinues",
        'Asimo_at_Honda_Collection_Hall_4.jpg',
        "ASIMO at the Honda Collection Hall, retired in 2018 (CC0)",
        "Honda ASIMO at retirement"),
    ('humanoid', "Sony QRIO",
        'Sony_Qrio_Robot.jpg',
        "Sony QRIO, photo by Dschen Reinecke (CC-BY-SA 3.0)",
        "Sony QRIO miniature humanoid"),
    ('humanoid', "Aldebaran NAO",
        'Innorobo_2015_-_NAO_(cropped).JPG',
        "Aldebaran NAO at Innorobo 2015, photo by Xavier Caré (CC-BY-SA 4.0)",
        "Aldebaran NAO humanoid"),
    ('humanoid', "First Humanoid Sold to Consumers",
        'Aéroport_de_Prague_Ruzyně,_Pepper_(robot).jpg',
        "SoftBank Pepper at Prague Airport, photo by Benoît Prieur (CC0)",
        "SoftBank Pepper service humanoid at airport"),
    ('humanoid', "iCub Goes Open Source",
        'ICub_Innorobo_Lyon_2014.JPG',
        "iCub at Innorobo Lyon 2014, photo by Xavier Caré (CC-BY-SA 4.0)",
        "IIT iCub humanoid"),
    ('humanoid', "Tesla Optimus Gen 2",
        'Tesla_Bot_2023.jpg',
        "Tesla Bot, 2023 (CC-BY-SA 4.0)",
        "Tesla Optimus Gen 2 humanoid"),
    ('humanoid', "Tesla Bot / Optimus Announced",
        'Optimus_Tesla.jpg',
        "Tesla Optimus, photo by Benjamin Ceci (Public domain)",
        "Tesla Optimus humanoid"),
    ('humanoid', "Optimus 'Bumblebee'",
        'Latest_Tesla_Optimus_Humanoid_Robot.jpg',
        "Tesla Optimus, photo by Steve Jurvetson (CC-BY 2.0)",
        "Tesla Optimus humanoid"),
    ('humanoid', "Figure AI Incorporated",
        'Figure-ai-logo.svg',
        "Figure AI logo (CC-BY 4.0)",
        "Figure AI"),
    ('humanoid', "Figure's $675M",
        'Figure-ai-logo.svg',
        "Figure AI logo (CC-BY 4.0)",
        "Figure AI"),

    # ── timeline.json — minor proxy replacements ──────────────────
    ('timeline', "Sony AIBO Goes on Sale",
        'Aibo_ERS-7.PNG',
        "Sony AIBO ERS-7, photo by Stuart Caie (CC-BY-SA 3.0)",
        "Sony AIBO robot dog"),
]

# (page, person-name fragment, file, credit) — attaches portrait if missing or refreshes
PORTRAITS = [
    ('humanoid', 'Brett Adcock',
        'Brett_Adcock_01.jpg',
        "Brett Adcock, Figure AI (CC-BY-SA 4.0)"),
    ('humanoid', 'Wang Xingxing',
        "Wang_Xingxing_at_the_World_Economic_Forum's_16th_Annual_Meeting_of_the_New_Champions_in_Tianjin,_China.png",
        "Wang Xingxing at the WEF, by China News Service (CC-BY 3.0)"),
    ('humanoid', 'Marc Raibert',
        'Marc_Raibert_-_Empowering_the_Future_(cropped).jpg',
        "Marc Raibert (CC-BY 2.0)"),
]

# (page, name, years, role, roleEn, quote, quoteEn, image, imageCredit) — APPENDS new people
NEW_PEOPLE = [
    ('humanoid', 'Cynthia Breazeal', '1967–',
        'MIT Media Lab；社交机器人创始人',
        'MIT Media Lab; founder of social robotics',
        '人形机器人最难的不是关节，是关系。',
        "A humanoid robot's hardest problem isn't its joints — it's its relationships.",
        'Cynthia_Breazeal.jpg',
        "Cynthia Breazeal, MIT Media Lab (CC-BY-SA 4.0)"),
    ('humanoid', 'Hiroshi Ishiguro 石黑浩', '1963–',
        '大阪大学；Geminoid 系列；Android Science 学派',
        'Osaka University; Geminoid series; founder of Android Science',
        '我们造像人的机器，是为了理解人本身。',
        'We build machines that look like us in order to understand ourselves.',
        'Hiroshi_Ishiguro_at_Italian_Tech_Week_panel_(cropped).jpg',
        "Hiroshi Ishiguro at Italian Tech Week (CC-BY-SA 4.0)"),
    ('humanoid', 'Hiroaki Kitano 北野宏明', '1961–',
        'RoboCup 共同发起人；OIST 总裁',
        'Co-founder of RoboCup; President of OIST',
        '让机器人在 2050 年前赢下世界杯——这是一个迫人前进的目标。',
        "Beat the world cup champions by 2050 — a goal that drives the field forward.",
        'Hiroaki_Kitano.jpg',
        "Hiroaki Kitano, photo by Joi Ito (CC-BY 2.0)"),
]

def apply():
    for page, file in [('timeline', 'data/timeline.json'), ('humanoid', 'data/humanoid.json')]:
        path = ROOT / file
        d = json.loads(path.read_text())
        n_replaced = 0
        n_portraits = 0

        # 1. force-replace event images
        for p, frag, fname, credit, alt in REPLACE:
            if p != page: continue
            for era in d['eras']:
                for ev in era['events']:
                    title = (ev.get('titleEn') or ev.get('title') or '')
                    if frag.lower() in title.lower():
                        if not ev.get('image') or ev['image'].get('file') != fname:
                            ev['image'] = {'file': fname, 'credit': credit, 'alt': alt}
                            n_replaced += 1
                        break

        # 2. attach / refresh portraits
        for p, frag, fname, credit in PORTRAITS:
            if p != page: continue
            for person in d.get('people', []):
                if frag.lower() in person['name'].lower():
                    if person.get('image') != fname:
                        person['image'] = fname
                        person['imageCredit'] = credit
                        n_portraits += 1
                    break

        # 3. append new people (skip if name already present)
        for entry in NEW_PEOPLE:
            if entry[0] != page: continue
            _, name, years, role, roleEn, quote, quoteEn, img, credit = entry
            if any(p['name'] == name for p in d.get('people', [])):
                continue
            d.setdefault('people', []).append({
                'name': name, 'years': years,
                'role': role, 'roleEn': roleEn,
                'quote': quote, 'quoteEn': quoteEn,
                'image': img, 'imageCredit': credit
            })
            n_portraits += 1

        path.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
        print(f"{file}: replaced {n_replaced} event images, +{n_portraits} portrait/people")

apply()
print("\nRun `npm run build` to refresh sidecars.")
