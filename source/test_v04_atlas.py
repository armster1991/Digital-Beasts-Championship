from pathlib import Path
import json, importlib.util
from PIL import Image, ImageChops
ROOT=Path(__file__).resolve().parents[1]
D=json.loads((ROOT/'source-data.json').read_text())
M=json.loads((ROOT/'source'/'penc-expansion.json').read_text())
atlas=Image.open(ROOT/'assets'/'penc-sprites.png').convert('RGBA')
assert atlas.size==(192,181*16), atlas.size
for row in range(181):
    strip=atlas.crop((0,row*16,192,(row+1)*16))
    assert strip.getbbox(), f'empty row {row}'
    for f in range(12):
        cell=atlas.crop((f*16,row*16,(f+1)*16,(row+1)*16))
        assert cell.getbbox(), f'empty cell row={row} frame={f}'

rows=[]
for s in D['species']:
    sp=s['sprite']
    if sp.get('sheet')=='penc':
        assert 0<=sp['y']<atlas.height and sp['y']%16==0
        rows.append(sp['y']//16)
assert len(set(rows))==181, len(set(rows))
assert min(rows)==0 and max(rows)==180

# Independent transcription of the visual row order in the six user-provided PNGs.
# This intentionally does NOT use penc_roster_raw.py ordering: that file is research
# metadata ordered by stage and was the source of a row-mapping regression caught
# while building v0.4.
visual_raw={
'Nature Spirits':['Bubbmon','Mochimon','Tentomon','Gottsumon','Otamamon','Angoramon','Kabuterimon','Kuwagamon','Monochromon','Tortamon','Starmon','Gekomon','Tailmon','Symbare Angoramon','Atlur Kabuterimon','Okuwamon','Triceramon','Jyagamon','Piccolomon','Tonosama Gekomon','Angewomon','Lamortmon','Herakle Kabuterimon','Saber Leomon','Metal Etemon','Holydramon','Gran Kuwagamon','Blastmon','El Doradimon','Diarbbitmon','Tlalocmon','Mastemon'],
'Deep Savers':['Pitchmon','Pukamon','Gomamon','Ganimon','Shakomon','Jellymon','Ikkakumon','Rukamon','Seadramon','Coelamon','Octmon','Gesomon','Ebidramon','Tesla Jellymon','Zudomon','Whamon','Mega Seadramon','Anomalocarimon','Dagomon','Marin Devimon','Hangyomon','Thetismon','Marin Angemon','Metal Seadramon','Pukumon','Plesiomon','Vikemon','Jumbo Gamemon','Cthyllamon','Amphimon','Aegisdramon','Mitamamon'],
'Nightmare Soldiers':['Mokumon','Peti Meramon','Bakumon','Candmon','Pico Devimon','Loogamon','Hanumon','Garurumon','Meramon','Wizarmon','Devimon','Bakemon','Dokugumon','Loogarmon','Mammon','Were Garurumon','Death Meramon','Pumpmon','Vamdemon','Fantomon','Lady Devimon','Soloogarmon','Skull Mammon','Boltmon','Piemon','Demon','Anubimon','Noble Pumpmon','Callismon','Fenriloogamon','Voltobautamon','Mastemon'],
'Wind Guardians':['Nyokimon','Pyocomon','Piyomon','Floramon','Mushmon','Palmon','Pteromon','V-dramon','Birdramon','Togemon','Kiwimon','Woodmon','Red Vegimon','Galemon','Aero V-dramon','Garudamon','Blossomon','Delumon','Jyureimon','Gerbemon','Lilimon','Grand Galemon','Hououmon','Griffomon','Pinochimon','Rosemon','Ulforce V-dramon','Rafflesimon','Hydramon','Zephagamon','Cernumon','Mitamamon'],
'Metal Empire':['Choromon','Caprimon','Toy Agumon','Kokuwamon','Hagurumon','Commandramon','Greymon','Revolmon','Clockmon','Tankmon','Guardromon','Mechanorimon','Thunderballmon','Hi-Commandramon','Metal Greymon (Vaccine)','Andromon','Knightmon','Big Mamemon','Megadramon','Waru Monzaemon','Cyberdramon','Cargodramon','War Greymon','Metal Garurumon','Mugendramon','Venom Vamdemon','Hi Andromon','Ragnamon','Zeke Greymon','Brigadramon','Omegamon','Chaosdramon'],
'Virus Busters':['Yukimibotamon','Nyaromon','Agumon','Gabumon','Plotmon','Gammamon','Greymon','Leomon','Garurumon','Igamon','Angemon','Tailmon','Betel Gammamon','Kaus Gammamon','Wezen Gammamon','Gulus Gammamon','Metal Greymon (Vaccine)','Asuramon','Were Garurumon','Metal Mamemon','Holy Angemon','Angewomon','Canoweissmon','Regulusmon','War Greymon','Metal Garurumon','Dominimon','Quantumon','Siriusmon','Arcturusmon','Omegamon','Mastemon','Proximamon'],
}
family_files={'Nature Spirits':'nature-spirits.png','Deep Savers':'deep-savers.png','Nightmare Soldiers':'nightmare-soldiers.png','Wind Guardians':'wind-guardians.png','Metal Empire':'metal-empire.png','Virus Busters':'virus-busters.png'}
alias=M['aliases']; pref=M['duplicateVisualSelection']
def canon(n): return alias.get(n,n)
visual={fam:[canon(n) for n in names] for fam,names in visual_raw.items()}

spec=importlib.util.spec_from_file_location('penc',ROOT/'source'/'penc_roster_raw.py'); mod=importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
meta={fam:{canon(n) for n,*_ in items} for fam,items in mod.PENC.items()}
for fam,names in visual.items():
    assert len(names)==len(set(names))==len(mod.PENC[fam]), fam
    assert set(names)==meta[fam], f'{fam}: visual rows and metadata species differ'

species_by_name={s['name']:s for s in D['species']}
# Validate every source row against every atlas frame. Duplicate species use the
# preferred family selected by the build; non-preferred duplicates are intentionally
# not copied into a second atlas row.
for fam,names in visual.items():
    src=Image.open(ROOT/'source'/'penc-sheets'/family_files[fam]).convert('RGBA')
    for source_row,name in enumerate(names):
        chosen_family=pref.get(name)
        if chosen_family and chosen_family!=fam:
            continue
        sp=species_by_name[name]['sprite']
        assert sp['sheet']=='penc' and sp['family']==fam, (name,sp)
        atlas_row=sp['y']//16
        for f in range(12):
            raw=src.crop((96+f*17,44+source_row*17,112+f*17,60+source_row*17))
            got=atlas.crop((f*16,atlas_row*16,(f+1)*16,(atlas_row+1)*16))
            assert ImageChops.difference(raw,got).getbbox() is None, f'pixel mismatch {fam}/{name} row {source_row} frame {f}'
print('PASS v0.4 atlas: 181 rows x 12 frames, all preferred source rows exactly verified')
