#!/usr/bin/env python3
"""
Bulk-attach Wikimedia Commons images to events in timeline.json and
humanoid.json. Each match is keyed by a substring of the event title
(English) so it's resilient to small edits.

Re-runs are safe: existing image fields are overwritten only when the
mapping changes.
"""
import json, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# (page, title fragment EN, file, credit, alt)
ATTACH = [
    # ── timeline.json ──────────────────────────────────────────
    ('timeline', 'Talos',
        'Vaso_di_Talos_particolare.JPG',
        "Talos krater, c. 400 BCE, Ruvo di Puglia (CC-BY-SA)",
        "Greek vase painting of Talos"),
    ('timeline', "Hero's Automatic",
        'Heron_Alexandrie.jpg',
        "Hero of Alexandria, 9th-c. codex (Public domain)",
        "Hero of Alexandria portrait"),
    ('timeline', 'Al-Jazari',
        'Al-jazari_elephant_clock.png',
        "Al-Jazari's Elephant Clock, 1206 manuscript (Public domain)",
        "Al-Jazari's Elephant Clock manuscript illustration"),
    ('timeline', 'Jaquet-Droz',
        'Automates-Jaquet-Droz-p1030493.jpg',
        "Jaquet-Droz automata (Neuchâtel), photo by Rama (CC-BY-SA 2.0)",
        "Jaquet-Droz writing automaton"),
    ('timeline', "Tesla's Wireless",
        'Tesla_boat1.jpg',
        "Tesla's radio-controlled boat, 1898 (Public domain)",
        "Tesla wireless teleautomaton boat"),
    ('timeline', "Word 'Robot' is Born",
        'Rosumovi_Univerzální_Roboti_1920.jpg',
        "R.U.R. 1920 first edition cover, Josef Čapek (Public domain)",
        "R.U.R. play book cover"),
    ('timeline', 'Metropolis',
        'Horst_von_Harbou_-_Metropolis_Maschinenmensch.jpg',
        "Metropolis Maschinenmensch, photo by Horst von Harbou (Public domain)",
        "Metropolis film still of the Maschinenmensch"),
    ('timeline', "Britain's First Speaking Robot",
        'Eric_the_Robot_(32822317725).jpg',
        "Eric the Robot rebuild, Science Museum London (CC-BY 2.0)",
        "Eric the Robot historical reconstruction"),
    ('timeline', 'Elektro',
        'Senator_John_Heinz_History_Center_-_IMG_7802.JPG',
        "Elektro at Senator John Heinz History Center (Public domain)",
        "Elektro the Westinghouse Moto-Man"),
    ('timeline', "Grey Walter",
        "Walter's_Tortoise.jpg",
        "Grey Walter's tortoise robot (Wikimedia)",
        "Grey Walter robotic tortoise"),
    ('timeline', "Programmable Article Transfer Patent",
        'George_C_Devol_Color_Photo.jpg',
        "George Devol, inventor of the Unimate patent (CC-BY-SA 3.0)",
        "George Devol portrait"),
    ('timeline', 'Stanford Arm',
        'The_Stanford_Arm.jpg',
        "Victor Scheinman's Stanford Arm (CC-BY 2.0)",
        "Stanford Arm — Scheinman's electric 6-DOF arm"),
    ('timeline', 'Famulus',
        'KUKA_Industrial_Robots_IR.jpg',
        "KUKA industrial robots, characteristic orange livery (CC-BY-SA 3.0)",
        "KUKA industrial robots"),
    ('timeline', 'SCARA',
        'SCARA_robot_2R.png',
        "SCARA configuration diagram (CC-BY-SA 4.0)",
        "SCARA robot mechanism diagram"),
    ('timeline', 'Delta',
        'Sketchy,_portrait-drawing_delta_robot.jpg',
        "Delta parallel robot drawing portraits (CC-BY-SA 3.0)",
        "Delta parallel robot in action"),
    ('timeline', 'Honda P2',
        'Honda_P2_front_Honda_Collection_Hall.jpg',
        "Honda P2 at the Honda Collection Hall, photo by Morio (CC-BY-SA 3.0)",
        "Honda P2 humanoid robot, 1996"),
    ('timeline', 'Sojourner',
        'Sojourner_on_Mars_PIA01122.jpg',
        "Sojourner rover on Mars, NASA/JPL (Public domain)",
        "Sojourner rover on the Martian surface, 1997"),
    ('timeline', 'Deep Blue',
        'Deep_Blue.jpg',
        "IBM Deep Blue at the Computer History Museum (CC-BY 2.0)",
        "IBM Deep Blue chess machine"),
    ('timeline', 'Spirit & Opportunity',
        'Mars_Exploration_Rover.jpg',
        "Mars Exploration Rover, NASA/JPL/Cornell (Public domain)",
        "NASA Mars Exploration Rover"),
    ('timeline', 'Robonaut',
        'Robonaut2_-_first_movement_aboard_ISS.jpg',
        "Robonaut 2 aboard the ISS, NASA (Public domain)",
        "NASA Robonaut 2 on the ISS"),
    ('timeline', 'Watson',
        'IBM_Watson.PNG',
        "IBM Watson, photo by Clockready (CC-BY-SA 3.0)",
        "IBM Watson on the Jeopardy! stage"),
    ('timeline', 'Baxter',
        'Caught_Coding_(9690512888).jpg',
        "Rethink Robotics Baxter — photo by Steve Jurvetson (CC-BY 2.0)",
        "Rethink Robotics Baxter dual-arm cobot"),
    ('timeline', 'Robotics Challenge',
        'Atlas_frontview_2013.jpg',
        "Boston Dynamics Atlas at the DRC, DARPA (Public domain)",
        "Boston Dynamics Atlas humanoid for the DARPA Robotics Challenge"),
    ('timeline', 'Cassie',
        'Cassie_the_robot_01.jpg',
        "Agility Robotics Cassie (CC-BY-SA 2.0)",
        "Agility Robotics Cassie bipedal robot"),
    ('timeline', "Atlas Backflip",
        'Atlas_climbing_into_a_vehicle.jpg',
        "Boston Dynamics Atlas climbing into a vehicle, DARPA (Public domain)",
        "Boston Dynamics Atlas humanoid in action"),

    # ── humanoid.json ──────────────────────────────────────────
    ('humanoid', 'WABOT-1',
        'Automates-Jaquet-Droz-p1030493.jpg',  # historical proxy
        "European automata tradition (CC-BY-SA 2.0) — WABOT-1 successor",
        "Automaton predecessor of WABOT-1"),
    ('humanoid', "Kato Lab",
        'TeaAutomatAndMechanism.jpg',
        "Karakuri tea-doll mechanism, Japan's older humanoid tradition",
        "Karakuri tea-serving doll mechanism"),
    ('humanoid', 'WABOT-2',
        'The_Stanford_Arm.jpg',  # proxy — direct WABOT image not on Commons
        "Era contemporaneous arm (Stanford Arm) — WABOT-2 image unavailable",
        "Contemporaneous 1980s arm"),
    ('humanoid', "Honda's First Truly Humanoid",
        'Honda_P2_front_Honda_Collection_Hall.jpg',
        "Honda P-series humanoids, Honda Collection Hall (CC-BY-SA 3.0)",
        "Honda P-series humanoid robot"),
    ('humanoid', "Self-Contained Walking Robot",
        'Honda_P2_front_Honda_Collection_Hall.jpg',
        "Honda P2 at the Honda Collection Hall (CC-BY-SA 3.0)",
        "Honda P2 humanoid robot"),
    ('humanoid', "ASIMO Unveiled",
        'Honda_ASIMO_(ver._2011)_2011_Tokyo_Motor_Show.jpg',
        "Honda ASIMO (2011 version) at the Tokyo Motor Show, photo by Morio (CC-BY-SA 3.0)",
        "Honda ASIMO"),
    ('humanoid', 'QRIO',
        'Sony_Qrio_Robot.jpg',
        "Sony QRIO at RoboCup 2004 (CC-BY-SA 3.0)",
        "Sony QRIO miniature humanoid"),
    ('humanoid', 'HUBO',
        'Einstein-Hubo.jpg',
        "KAIST Einstein-HUBO (CC-BY 2.5)",
        "KAIST HUBO with Einstein head"),
    ('humanoid', 'Aldebaran NAO',
        'Nao_Robot_(Robocup_2016).jpg',
        "Aldebaran NAO at RoboCup 2016 (CC0)",
        "Aldebaran NAO humanoid"),
    ('humanoid', "HRP-4C",
        'Ameca_Generation_1.jpg',  # contemporaneous female humanoid
        "Engineered Arts Ameca — contemporaneous female-form humanoid (CC-BY-SA 4.0)",
        "Female-form humanoid robot"),
    ('humanoid', 'iCub',
        'ICub_-_Festival_Economia_2018_2.jpg',
        "iCub at Festival Economia 2018 (CC-BY-SA 4.0)",
        "IIT iCub humanoid"),
    ('humanoid', "DRC Announced",
        'Atlas_frontview_2013.jpg',
        "Boston Dynamics Atlas at the DRC, DARPA (Public domain)",
        "Boston Dynamics Atlas humanoid"),
    ('humanoid', "Atlas (DRC version)",
        'Atlas_frontview_2013.jpg',
        "Boston Dynamics Atlas at the DRC, DARPA (Public domain)",
        "Boston Dynamics Atlas at the DARPA Robotics Challenge"),
    ('humanoid', "DRC-HUBO Wins",
        'Einstein-Hubo.jpg',
        "KAIST Einstein-HUBO (CC-BY 2.5)",
        "KAIST HUBO"),
    ('humanoid', "Atlas Gen 2",
        'Atlas_climbing_into_a_vehicle.jpg',
        "Boston Dynamics Atlas in action, DARPA (Public domain)",
        "Boston Dynamics Atlas humanoid"),
    ('humanoid', "Atlas Backflip",
        'Atlas_climbing_into_a_vehicle.jpg',
        "Boston Dynamics Atlas in action, DARPA (Public domain)",
        "Boston Dynamics Atlas humanoid"),
    ('humanoid', "First Humanoid Sold to Consumers",
        'SoftBank_pepper.JPG',
        "SoftBank Pepper, photo by Tokumeigakarinoaoshima (CC0)",
        "SoftBank Pepper service humanoid"),
    ('humanoid', "Agility Robotics' Cassie",
        'Cassie_the_robot_01.jpg',
        "Agility Robotics Cassie at Oregon State (CC-BY-SA 2.0)",
        "Agility Robotics Cassie biped"),
    ('humanoid', "Tesla Optimus Gen 2",
        'Optimus_bot_at_Tesla_showroom_-_20251118_-_01.jpg',
        "Tesla Optimus at a Tesla showroom (CC-BY-SA 4.0)",
        "Tesla Optimus humanoid"),
    ('humanoid', "Unitree H1",
        'Unitree_G1.jpg',  # G1 image stands in
        "Unitree G1, the consumer-tier sibling of H1 (CC0)",
        "Unitree humanoid robot"),
    ('humanoid', "Optimus 'Bumblebee'",
        'Optimus_bot_at_Tesla_showroom_-_20251118_-_01.jpg',
        "Tesla Optimus at a Tesla showroom (CC-BY-SA 4.0)",
        "Tesla Optimus humanoid"),
    ('humanoid', "Optimus Inside the Fremont",
        'Optimus_bot_at_Tesla_showroom_-_20251118_-_01.jpg',
        "Tesla Optimus at a Tesla showroom (CC-BY-SA 4.0)",
        "Tesla Optimus humanoid"),
    ('humanoid', "Honda Discontinues",
        'Honda_ASIMO_(ver._2011)_2011_Tokyo_Motor_Show.jpg',
        "Honda ASIMO (2011), the retired final form, photo by Morio (CC-BY-SA 3.0)",
        "Honda ASIMO humanoid"),
]

PEOPLE_PORTRAITS = [
    # (page, person name fragment, file, credit)
    ('timeline', 'Rodney Brooks',
        'Rodney_Brooks_in_2021.jpg', "Rodney Brooks, 2021 (CC-BY-SA 4.0)"),
    ('timeline', 'Marc Raibert',
        'Marc_Raibert_-_Empowering_the_Future_(cropped).jpg', "Marc Raibert (CC-BY 2.0)"),
    ('timeline', 'Sebastian Thrun',
        'Sebastian_Thrun_by_Christopher_Michel_-_6.jpg', "Sebastian Thrun, by Christopher Michel (CC-BY-SA 4.0)"),
    ('timeline', 'Daniela Rus',
        'UN_AI_for_Good_Summit_2025_-_Daniela_Rus_01_(cropped)_2.jpg', "Daniela Rus at UN AI for Good Summit (CC-BY-SA 4.0)"),
    ('timeline', 'George C. Devol',
        'George_C_Devol_Color_Photo.jpg', "George C. Devol (CC-BY-SA 3.0)"),
    ('humanoid', 'Rodney Brooks',
        'Rodney_Brooks_in_2021.jpg', "Rodney Brooks (CC-BY-SA 4.0)"),
    ('humanoid', 'Marc Raibert',
        'Marc_Raibert_-_Empowering_the_Future_(cropped).jpg', "Marc Raibert (CC-BY 2.0)"),
]

def attach():
    for page, file in [('timeline', 'data/timeline.json'), ('humanoid', 'data/humanoid.json')]:
        path = ROOT / file
        d = json.loads(path.read_text())
        attached = 0
        already = 0
        not_found = []

        # 1. attach event images
        for p, frag, fname, credit, alt in ATTACH:
            if p != page: continue
            hit = False
            for era in d['eras']:
                for ev in era['events']:
                    if frag.lower() in (ev.get('titleEn') or ev.get('title') or '').lower():
                        hit = True
                        if ev.get('image') and ev['image'].get('file') == fname:
                            already += 1
                            continue
                        if not ev.get('image'):
                            ev['image'] = {'file': fname, 'credit': credit, 'alt': alt}
                            attached += 1
                        # don't overwrite existing different image
                        break
                if hit: break
            if not hit:
                not_found.append(frag)

        # 2. attach people portraits
        for p, frag, fname, credit in PEOPLE_PORTRAITS:
            if p != page: continue
            for person in d.get('people', []):
                if frag.lower() in person['name'].lower():
                    if person.get('image') != fname:
                        person['image'] = fname
                        person['imageCredit'] = credit
                        attached += 1
                    break

        path.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
        print(f"{file}: +{attached} attached, {already} already-current")
        if not_found:
            print(f"  ⚠ not found: {not_found}")

attach()
print("\nRe-run `npm run build` to regenerate sidecars.")
