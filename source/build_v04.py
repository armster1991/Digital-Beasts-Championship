from pathlib import Path
import json,re,hashlib,statistics,importlib.util,collections,shutil
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
SHEETS={
 'Nature Spirits':ROOT/'source'/'penc-sheets'/'nature-spirits.png',
 'Deep Savers':ROOT/'source'/'penc-sheets'/'deep-savers.png',
 'Nightmare Soldiers':ROOT/'source'/'penc-sheets'/'nightmare-soldiers.png',
 'Wind Guardians':ROOT/'source'/'penc-sheets'/'wind-guardians.png',
 'Metal Empire':ROOT/'source'/'penc-sheets'/'metal-empire.png',
 'Virus Busters':ROOT/'source'/'penc-sheets'/'virus-busters.png',
}
FAMILY_URL={
 'Nature Spirits':'https://wikimon.net/Pendulum_COLOR_1_Nature_Spirits',
 'Deep Savers':'https://wikimon.net/Pendulum_COLOR_2_Deep_Savers',
 'Nightmare Soldiers':'https://wikimon.net/Digimon_Pendulum_COLOR_3_Nightmare_Soldiers',
 'Wind Guardians':'https://wikimon.net/Pendulum_COLOR_4_Wind_GuardIANS'.replace('GuardIANS','Guardians'),
 'Metal Empire':'https://wikimon.net/Pendulum_COLOR_5_Metal_Empire',
 'Virus Busters':'https://wikimon.net/Digimon_Pendulum_COLOR_ZERO_Virus_Busters',
}
spec=importlib.util.spec_from_file_location('penc',ROOT/'source'/'penc_roster_raw.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod);PENC=mod.PENC
D=json.loads((ROOT/'source'/'v032-source-data.json').read_text())
OLD_SPECIES=json.loads(json.dumps(D['species']))
OLD_ROUTES=json.loads(json.dumps(D['routes']))
# Canonical English/localized names. Existing project conventions always win.
ALIAS={
'Mochimon':'Motimon','Gottsumon':'Gotsumon','Tailmon':'Gatomon','Atlur Kabuterimon':'MegaKabuterimon (Blue)','Tortamon':'Tortomon','Jyagamon':'Jagamon','Piccolomon':'Piximon','Tonosama Gekomon':'ShogunGekomon','Herakle Kabuterimon':'HerculesKabuterimon','Saber Leomon':'SaberLeomon','Metal Etemon':'MetalEtemon','Holydramon':'Magnadramon','El Doradimon':'ElDoradimon','Gran Kuwagamon':'GranKuwagamon',
'Pitchmon':'Pichimon','Pukamon':'Bukamon','Ganimon':'Crabmon','Shakomon':'Syakomon','Rukamon':'Dolphmon','Mega Seadramon':'MegaSeadramon','Anomalocarimon':'Scorpiomon','Marin Devimon':'MarineDevimon','Hangyomon':'Divermon','Marin Angemon':'MarineAngemon','Metal Seadramon':'MetalSeadramon','Jumbo Gamemon':'JumboGamemon',
'Peti Meramon':'DemiMeramon','Bakumon':'Tapirmon','Candmon':'Candlemon','Pico Devimon':'DemiDevimon','Hanumon':'Apemon','Wizarmon':'Wizardmon','Mammon':'Mammothmon','Were Garurumon':'WereGarurumon','Death Meramon':'SkullMeramon','Pumpmon':'Pumpkinmon','Vamdemon':'Myotismon','Fantomon':'Phantomon','Lady Devimon':'LadyDevimon','Skull Mammon':'SkullMammothmon','Demon':'Daemon','Piemon':'Piedmon','Noble Pumpmon':'NoblePumpkinmon',
'Pyocomon':'Yokomon','Piyomon':'Biyomon','Mushmon':'Mushroomon','V-dramon':'Veedramon','Red Vegimon':'RedVegiemon','Aero V-dramon':'AeroVeedramon','Delumon':'Deramon','Jyureimon':'Cherrymon','Gerbemon':'Garbagemon','Lilimon':'Lillymon','Hououmon':'Phoenixmon','Griffomon':'Gryphonmon','Pinochimon':'Puppetmon','Ulforce V-dramon':'UlforceVeedramon',
'Caprimon':'Kapurimon','Toy Agumon':'ToyAgumon','Revolmon':'Deputymon','Metal Greymon (Vaccine)':'MetalGreymon (Vaccine)','Big Mamemon':'BigMamemon','Waru Monzaemon':'WaruMonzaemon','War Greymon':'WarGreymon','Metal Garurumon':'MetalGarurumon','Mugendramon':'Machinedramon','Venom Vamdemon':'VenomMyotismon','Hi Andromon':'HiAndromon','Zeke Greymon':'ZekeGreymon','Omegamon':'Omnimon','Hi-Commandramon':'HiCommandramon',
'Igamon':'Ninjamon','Metal Mamemon':'MetalMamemon','Holy Angemon':'MagnaAngemon','Symbare Angoramon':'SymbareAngoramon','Tesla Jellymon':'TeslaJellymon','Grand Galemon':'GrandGalemon','Betel Gammamon':'BetelGammamon','Kaus Gammamon':'KausGammamon','Wezen Gammamon':'WezenGammamon','Gulus Gammamon':'GulusGammamon','Yukimibotamon':'YukimiBotamon','Plotmon':'Salamon',
}
def canon(n):return ALIAS.get(n,n)
# Visual row order in the six user-provided spritesheets. This is deliberately
# independent from the roster/research ordering: the PNGs are laid out by display
# order, not by stage. Keeping this explicit prevents a metadata sort from ever
# pointing a species at another Digimon's 12-frame row.
VISUAL_ROWS_RAW={
'Nature Spirits':['Bubbmon','Mochimon','Tentomon','Gottsumon','Otamamon','Angoramon','Kabuterimon','Kuwagamon','Monochromon','Tortamon','Starmon','Gekomon','Tailmon','Symbare Angoramon','Atlur Kabuterimon','Okuwamon','Triceramon','Jyagamon','Piccolomon','Tonosama Gekomon','Angewomon','Lamortmon','Herakle Kabuterimon','Saber Leomon','Metal Etemon','Holydramon','Gran Kuwagamon','Blastmon','El Doradimon','Diarbbitmon','Tlalocmon','Mastemon'],
'Deep Savers':['Pitchmon','Pukamon','Gomamon','Ganimon','Shakomon','Jellymon','Ikkakumon','Rukamon','Seadramon','Coelamon','Octmon','Gesomon','Ebidramon','Tesla Jellymon','Zudomon','Whamon','Mega Seadramon','Anomalocarimon','Dagomon','Marin Devimon','Hangyomon','Thetismon','Marin Angemon','Metal Seadramon','Pukumon','Plesiomon','Vikemon','Jumbo Gamemon','Cthyllamon','Amphimon','Aegisdramon','Mitamamon'],
'Nightmare Soldiers':['Mokumon','Peti Meramon','Bakumon','Candmon','Pico Devimon','Loogamon','Hanumon','Garurumon','Meramon','Wizarmon','Devimon','Bakemon','Dokugumon','Loogarmon','Mammon','Were Garurumon','Death Meramon','Pumpmon','Vamdemon','Fantomon','Lady Devimon','Soloogarmon','Skull Mammon','Boltmon','Piemon','Demon','Anubimon','Noble Pumpmon','Callismon','Fenriloogamon','Voltobautamon','Mastemon'],
'Wind Guardians':['Nyokimon','Pyocomon','Piyomon','Floramon','Mushmon','Palmon','Pteromon','V-dramon','Birdramon','Togemon','Kiwimon','Woodmon','Red Vegimon','Galemon','Aero V-dramon','Garudamon','Blossomon','Delumon','Jyureimon','Gerbemon','Lilimon','Grand Galemon','Hououmon','Griffomon','Pinochimon','Rosemon','Ulforce V-dramon','Rafflesimon','Hydramon','Zephagamon','Cernumon','Mitamamon'],
'Metal Empire':['Choromon','Caprimon','Toy Agumon','Kokuwamon','Hagurumon','Commandramon','Greymon','Revolmon','Clockmon','Tankmon','Guardromon','Mechanorimon','Thunderballmon','Hi-Commandramon','Metal Greymon (Vaccine)','Andromon','Knightmon','Big Mamemon','Megadramon','Waru Monzaemon','Cyberdramon','Cargodramon','War Greymon','Metal Garurumon','Mugendramon','Venom Vamdemon','Hi Andromon','Ragnamon','Zeke Greymon','Brigadramon','Omegamon','Chaosdramon'],
'Virus Busters':['Yukimibotamon','Nyaromon','Agumon','Gabumon','Plotmon','Gammamon','Greymon','Leomon','Garurumon','Igamon','Angemon','Tailmon','Betel Gammamon','Kaus Gammamon','Wezen Gammamon','Gulus Gammamon','Metal Greymon (Vaccine)','Asuramon','Were Garurumon','Metal Mamemon','Holy Angemon','Angewomon','Canoweissmon','Regulusmon','War Greymon','Metal Garurumon','Dominimon','Quantumon','Siriusmon','Arcturusmon','Omegamon','Mastemon','Proximamon'],
}
VISUAL_ROWS={fam:[canon(n) for n in rows] for fam,rows in VISUAL_ROWS_RAW.items()}
def slugify(s):
 s=s.lower().replace("'",'').replace(' (','-').replace(')','').replace(' ','-')
 s=re.sub(r'[^a-z0-9-]+','-',s);return re.sub(r'-+','-',s).strip('-')
# Choose one deterministic visual when a Digimon occurs in multiple Pendulum Color families.
PREFERRED_VISUAL={'Mastemon':'Nightmare Soldiers','Mitamamon':'Deep Savers','Gatomon':'Nature Spirits','Angewomon':'Nature Spirits','Garurumon':'Nightmare Soldiers','WereGarurumon':'Nightmare Soldiers','Greymon':'Metal Empire','MetalGreymon (Vaccine)':'Metal Empire','WarGreymon':'Metal Empire','MetalGarurumon':'Metal Empire','Omnimon':'Metal Empire'}
raw=[]
for fam,rows in PENC.items():
 visual=VISUAL_ROWS[fam]
 assert len(visual)==len(rows) and len(set(visual))==len(visual), f'Bad visual row map for {fam}'
 for rawname,st,attr,power in rows:
  name=canon(rawname)
  assert name in visual, f'{fam}: {rawname} / {name} missing from visual row map'
  raw.append({'family':fam,'row':visual.index(name),'rawName':rawname,'name':name,'stage':st,'attribute':attr,'power':power})
byname=collections.defaultdict(list)
for r in raw:byname[r['name']].append(r)
chosen={}
for name,rs in byname.items():
 pref=PREFERRED_VISUAL.get(name)
 chosen[name]=next((x for x in rs if x['family']==pref),rs[0])
assert len(raw)==193 and len(chosen)==181
# Build transparent 12-frame atlas. Exact sheet geometry: x=96,y=44, 16px cell, 17px step.
atlas_names=list(chosen)
atlas=Image.new('RGBA',(12*16,len(atlas_names)*16),(0,0,0,0))
sources={fam:Image.open(path).convert('RGBA') for fam,path in SHEETS.items()}
for atlas_row,name in enumerate(atlas_names):
 r=chosen[name];src=sources[r['family']]
 for f in range(12):
  cell=src.crop((96+f*17,44+r['row']*17,112+f*17,60+r['row']*17))
  atlas.paste(cell,(f*16,atlas_row*16),cell)
atlas.save(ROOT/'assets'/'penc-sprites.png',optimize=True)
atlas_index={n:i for i,n in enumerate(atlas_names)}
# Preserve existing species ids and data; only replace sprite metadata where a PenC sprite exists.
species=json.loads(json.dumps(OLD_SPECIES));old_by_name={s['name']:s for s in species}
for name,s in old_by_name.items():
 if name in chosen:
  r=chosen[name];s['sprite']={'sheet':'penc','x':0,'y':atlas_index[name]*16,'frames':12,'step':16,'source':'Pendulum Color','family':r['family']}
# Append genuinely new species; old name/stage/attribute/power always wins for overlaps.
for name,r in chosen.items():
 if name in old_by_name:continue
 sid=len(species)
 species.append({'id':sid,'name':name,'slug':slugify(name),'stage':r['stage'],'attribute':r['attribute'],'power':r['power'],'family':'Pendulum Color · '+r['family'],'sprite':{'sheet':'penc','x':0,'y':atlas_index[name]*16,'frames':12,'step':16,'source':'Pendulum Color','family':r['family']}})
assert len(species)==282
name_id={s['name']:s['id'] for s in species}
# Evolution graph. Existing route objects are retained byte-for-byte in meaning; these are additive PenC routes.
routes=json.loads(json.dumps(OLD_ROUTES))
def add(parent,*children,**kw):
 if parent not in name_id:raise KeyError('parent '+parent)
 arr=routes.setdefault(str(name_id[parent]),[])
 added=False
 for child in children:
  if child not in name_id:raise KeyError('child '+child)
  tid=name_id[child]
  # Existing v0.3.2 routes always win. This preserves their exact behavior while
  # allowing the Pendulum Color graph to be added around them.
  if not any(x.get('to')==tid for x in arr):
   arr.append({'to':tid,**kw});added=True
 return added

def pc(parent,child,family,care=None,effort=None,source='',connection=False,priority=20,**extra):
 """Add one researched Pendulum Color raising route.

 care/effort are inclusive (min,max) source-device bands. `None` max means no
 upper bound. Connection-only / connected alternatives are adapted because the
 Championship fork has no device-connection state; the original wording stays
 in sourceRequirement for auditability.
 """
 kw={'penc':True,'pencFamily':family,'pencKind':'raising','priority':priority}
 if care is not None:
  kw['careMin']=care[0]
  if care[1] is not None:kw['careMax']=care[1]
 if effort is not None:
  kw['effortMin']=effort[0]
  if effort[1] is not None:kw['effortMax']=effort[1]
 if source:kw['sourceRequirement']=source
 if connection:kw['connectionAdapted']=True
 kw.update(extra)
 return add(parent,child,**kw)

def pct(parent,child,family,source='Time-only Pendulum Color evolution.'):
 return pc(parent,child,family,source=source,priority=30,specNeed=0,pencKind='time')

def pcb(parent,child,family,care=(0,3),source='15+ Battles, 80%+ Win Ratio',priority=24):
 # 15 device battles are compressed to five Championship stage battles. The
 # source threshold remains recorded; the deterministic 80% requirement is kept.
 return pc(parent,child,family,care=care,source=source,priority=priority,
           sourceBattlesMin=15,stageBattlesMin=5,winRatioMin=.80,pencKind='battle')

def pcj(parent,child,family,source='Jogress route',priority=18):
 # Jogress is intentionally out of scope. A source Jogress edge becomes a
 # battle-gated solo route. Ultimate+ forms use the stricter gate.
 pst=species[name_id[parent]]['stage'];cst=species[name_id[child]]['stage']
 battles,ratio=(8,.75) if cst>=7 else (5,.60)
 return pc(parent,child,family,source=source,priority=priority,adaptedJogress=True,
           stageBattlesMin=battles,winRatioMin=ratio,specNeed=18 if cst>=7 else None,pencKind='jogress-adapted')

def family_edges():
 # ------------------------------------------------------------------
 # Nature Spirits — Wikimon Pendulum COLOR 1 / Humulos PenC guide.
 # Connected/unconnected variants are merged only where Championship has no
 # equivalent connection flag; care/effort bands retain the useful distinction.
 # ------------------------------------------------------------------
 f='Nature Spirits'
 pct('Bubbmon','Motimon',f,'Bubbmon: wait 10 minutes (adapted to Championship stage timer).')
 pc('Motimon','Angoramon',f,(0,1),(3,None),'Connected: 0-1 Care Mistakes, 3+ Effort.',True)
 pc('Motimon','Tentomon',f,(0,1),(2,None),'Unconnected: 0-1 CM, 3+ Effort OR Connected: 0-1 CM, 2 Effort.',True)
 pc('Motimon','Gotsumon',f,(0,1),(0,1),'0-1 Care Mistakes, 0-1 Effort.')
 pc('Motimon','Otamamon',f,(2,2),(0,4),'2 Care Mistakes; no Effort restriction.')
 pc('Angoramon','SymbareAngoramon',f,(0,2),(2,None),'0-2 Care Mistakes, 2+ Effort.')
 pc('Angoramon','Kabuterimon',f,(3,3),(0,0),'3 Care Mistakes, 0 Effort.')
 pc('Angoramon','Gatomon',f,(0,2),(0,1),'0-2 Care Mistakes, 0-1 Effort.')
 pc('Angoramon','Monochromon',f,(3,3),(1,None),'3 Care Mistakes, 1+ Effort.')
 pc('Tentomon','Kabuterimon',f,(0,2),(4,4),'0-2 Care Mistakes, 4 Effort.')
 pc('Tentomon','Tortomon',f,(0,2),(0,1),'0-2 Care Mistakes, 0-1 Effort.')
 pc('Tentomon','Gatomon',f,(0,2),(2,3),'0-2 Care Mistakes, 2-3 Effort.')
 pc('Tentomon','Gekomon',f,(3,3),(0,2),'3 Care Mistakes, 0-2 Effort.')
 pc('Tentomon','Kuwagamon',f,(3,3),(3,None),'3 Care Mistakes, 3+ Effort.')
 pc('Gotsumon','Tortomon',f,(0,2),(0,1),'0-2 Care Mistakes, 0-1 Effort.')
 pc('Gotsumon','Monochromon',f,(0,2),(2,None),'0-2 Care Mistakes, 2+ Effort.')
 pc('Gotsumon','Starmon',f,(3,3),(3,None),'3 Care Mistakes, 3+ Effort.')
 pc('Gotsumon','Gekomon',f,(3,3),(0,2),'3 Care Mistakes, 0-2 Effort.')
 pc('Otamamon','Gatomon',f,(0,2),(4,4),'0-2 Care Mistakes, 4 Effort.')
 pc('Otamamon','Starmon',f,(0,2),(0,3),'0-2 Care Mistakes, 0-3 Effort.')
 pc('Otamamon','Gekomon',f,(3,3),(0,1),'3 Care Mistakes, 0-1 Effort.')
 pc('Otamamon','Kuwagamon',f,(3,3),(2,None),'3 Care Mistakes, 2+ Effort.')
 # Direct battle evolutions.
 pcb('SymbareAngoramon','Lamortmon',f,(0,2))
 pcb('Kabuterimon','MegaKabuterimon (Blue)',f,(0,2));pcb('Tortomon','MegaKabuterimon (Blue)',f,(0,2))
 pcb('Gatomon','Angewomon',f,(0,2));pcb('Monochromon','Triceramon',f,(0,3));pcb('Starmon','Piximon',f,(0,3));pcb('Gekomon','ShogunGekomon',f,(0,3));pcb('Kuwagamon','Okuwamon',f,(0,3))
 # Perfect forms that are source-Jogress only from these parents.
 pcj('Tortomon','Jagamon',f,'Tortomon: Jogress with Vaccine/Data Adult.');pcj('Gatomon','Jagamon',f,'Gatomon: Jogress with Vaccine/Data Adult.');pcj('Monochromon','Jagamon',f,'Monochromon: Jogress with Vaccine Adult.')
 # Direct Ultimate evolutions.
 pcb('Lamortmon','Diarbbitmon',f,(0,3));pcb('MegaKabuterimon (Blue)','HerculesKabuterimon',f,(0,3));pcb('Jagamon','Blastmon',f,(0,2));pcb('Angewomon','Magnadramon',f,(0,3));pcb('Triceramon','SaberLeomon',f,(0,3));pcb('Piximon','ElDoradimon',f,(0,2));pcb('ShogunGekomon','MetalEtemon',f,(0,2));pcb('Okuwamon','GranKuwagamon',f,(0,3))
 # Ultimate+ source Jogress adaptations.
 for p in ('SaberLeomon','ElDoradimon','MetalEtemon'):pcj(p,'Tlalocmon',f,f'{p}: Jogress with one of the other Tlalocmon source partners.')
 pcj('Angewomon','Mastemon',f,'Angewomon: Jogress with LadyDevimon (Nightmare Soldiers).')

 # ------------------------------------------------------------------ Deep Savers
 f='Deep Savers'
 pct('Pichimon','Bukamon',f,'Pichimon: wait 10 minutes (adapted to Championship stage timer).')
 pc('Bukamon','Gomamon',f,(0,1),(0,4),'Unconnected: 0-1 CM, 0-3 Effort OR Connected: 0-1 CM, 4 Effort.',True)
 pc('Bukamon','Jellymon',f,(0,1),(0,3),'Connected: 0-1 Care Mistakes, 0-3 Effort.',True)
 pc('Bukamon','Crabmon',f,(2,2),(2,None),'2 Care Mistakes, 2+ Effort.')
 pc('Bukamon','Syakomon',f,(2,2),(0,1),'2 Care Mistakes, 0-1 Effort.')
 pc('Gomamon','Dolphmon',f,(0,2),(0,2),'0-2 CM, 0-2 Effort.');pc('Gomamon','Ikkakumon',f,(0,2),(3,None),'0-2 CM, 3+ Effort.');pc('Gomamon','Coelamon',f,(3,3),(1,2),'3 CM, 1-2 Effort.');pc('Gomamon','Ebidramon',f,(3,3),(3,None),'3 CM, 3+ Effort.');pc('Gomamon','Octmon',f,(3,3),(0,0),'3 CM, 0 Effort.')
 pc('Jellymon','Dolphmon',f,(3,3),(0,0),'3 CM, 0 Effort.');pc('Jellymon','TeslaJellymon',f,(0,2),(2,None),'0-2 CM, 2+ Effort.');pc('Jellymon','Seadramon',f,(3,3),(1,None),'3 CM, 1+ Effort.');pc('Jellymon','Ebidramon',f,(0,2),(0,1),'0-2 CM, 0-1 Effort.')
 pc('Crabmon','Dolphmon',f,(0,2),(3,None),'0-2 CM, 3+ Effort.');pc('Crabmon','Seadramon',f,(0,2),(0,2),'0-2 CM, 0-2 Effort.');pc('Crabmon','Coelamon',f,(3,3),(2,3),'3 CM, 2-3 Effort.');pc('Crabmon','Ebidramon',f,(3,3),(4,4),'3 CM, 4 Effort.');pc('Crabmon','Gesomon',f,(3,3),(0,1),'3 CM, 0-1 Effort.')
 pc('Syakomon','Ikkakumon',f,(0,1),(4,4),'0-1 CM, 4 Effort.');pc('Syakomon','Seadramon',f,(0,1),(0,3),'0-1 CM, 0-3 Effort.');pc('Syakomon','Octmon',f,(2,2),(0,2),'2 CM, 0-2 Effort.');pc('Syakomon','Gesomon',f,(2,2),(3,None),'2 CM, 3+ Effort.')
 pcb('Dolphmon','Zudomon',f,(0,2));pcb('Ikkakumon','Zudomon',f,(0,2));pcb('TeslaJellymon','Thetismon',f,(0,2));pcb('Seadramon','MegaSeadramon',f,(0,3));pcb('Coelamon','Scorpiomon',f,(0,3));pcb('Ebidramon','Divermon',f,(0,2));pcb('Octmon','Dagomon',f,(0,3));pcb('Gesomon','MarineDevimon',f,(0,3))
 # Whamon is stage 4 in the legacy Championship catalog, so its PenC Perfect
 # identity is not substituted. MarineAngemon gets a source-Jogress solo path.
 pcj('Zudomon','MarineAngemon',f,'Zudomon: Jogress with Vaccine/Data Perfect -> MarineAngemon.')
 pcb('Thetismon','Amphimon',f,(0,3));pcb('Divermon','Plesiomon',f,(0,3));pcb('Scorpiomon','JumboGamemon',f,(0,2));pcb('MegaSeadramon','MetalSeadramon',f,(0,3));pcb('MarineDevimon','Cthyllamon',f,(0,3));pcb('Dagomon','Pukumon',f,(0,2));pcb('Zudomon','Vikemon',f,(0,3))
 # Aegisdramon is an existing stage-6 Championship species and keeps its legacy
 # route; the PenC stage-7 identity is intentionally not imposed over it.
 pcj('MarineAngemon','Mitamamon',f,'MarineAngemon: Jogress with Phoenixmon (Wind Guardians).')

 # ---------------------------------------------------------- Nightmare Soldiers
 f='Nightmare Soldiers'
 pct('Mokumon','DemiMeramon',f,'Mokumon: wait 10 minutes (adapted to Championship stage timer).')
 pc('DemiMeramon','Tapirmon',f,(0,1),(0,4),'Unconnected 0-1 CM, 3+ Effort OR Connected 0-1 CM, 0-2 Effort.',True)
 pc('DemiMeramon','Candlemon',f,(2,2),(1,None),'2 Care Mistakes, 1+ Effort.')
 pc('DemiMeramon','Loogamon',f,(0,1),(3,None),'Connected: 0-1 Care Mistakes, 3+ Effort.',True)
 pc('DemiMeramon','DemiDevimon',f,(2,2),(0,0),'2 Care Mistakes, 0 Effort.')
 pc('Tapirmon','Apemon',f,(0,2),(3,None),'0-2 CM, 3+ Effort.');pc('Tapirmon','Garurumon',f,(3,3),(0,3),'3 CM, 0-3 Effort.');pc('Tapirmon','Meramon',f,(0,2),(0,2),'0-2 CM, 0-2 Effort.');pc('Tapirmon','Wizardmon',f,(3,3),(4,4),'3 CM, 4 Effort.')
 pc('Candlemon','Garurumon',f,(0,1),(4,4),'0-1 CM, 4 Effort.');pc('Candlemon','Meramon',f,(0,1),(0,3),'0-1 CM, 0-3 Effort.');pc('Candlemon','Wizardmon',f,(2,2),(4,4),'2 CM, 4 Effort.');pc('Candlemon','Devimon',f,(2,2),(0,3),'2 CM, 0-3 Effort.')
 pc('Loogamon','Apemon',f,(3,3),(4,4),'3 CM, 4 Effort.');pc('Loogamon','Bakemon',f,(3,3),(0,3),'3 CM, 0-3 Effort.');pc('Loogamon','Dokugumon',f,(0,2),(0,2),'0-2 CM, 0-2 Effort.');pc('Loogamon','Loogarmon',f,(0,2),(3,None),'0-2 CM, 3+ Effort.')
 pc('DemiDevimon','Meramon',f,(0,1),(3,3),'0-1 CM, 3 Effort.');pc('DemiDevimon','Wizardmon',f,(2,2),(3,None),'2 CM, 3+ Effort.');pc('DemiDevimon','Devimon',f,(0,1),(4,4),'0-1 CM, 4 Effort.');pc('DemiDevimon','Bakemon',f,(2,2),(0,2),'2 CM, 0-2 Effort.');pc('DemiDevimon','Dokugumon',f,(0,1),(0,2),'0-1 CM, 0-2 Effort.')
 pcb('Apemon','Mammothmon',f,(0,2));pcb('Garurumon','WereGarurumon',f,(0,2));pcb('Meramon','SkullMeramon',f,(0,3));pcb('Wizardmon','Pumpkinmon',f,(0,3));pcb('Loogarmon','Soloogarmon',f,(0,2));pcb('Devimon','Myotismon',f,(0,3));pcb('Bakemon','Phantomon',f,(0,3));pcb('Dokugumon','LadyDevimon',f,(0,2))
 pcb('Mammothmon','SkullMammothmon',f,(0,3));pcb('WereGarurumon','Anubimon',f,(0,2));pcb('SkullMeramon','Boltmon',f,(0,2));pcb('Pumpkinmon','NoblePumpkinmon',f,(0,3));pcb('Soloogarmon','Fenriloogamon',f,(0,3));pcb('Myotismon','Callismon',f,(0,3));pcb('Phantomon','Daemon',f,(0,3));pcb('LadyDevimon','Piedmon',f,(0,2))
 pcj('LadyDevimon','Mastemon',f,'LadyDevimon: Jogress with Angewomon.');pcj('Myotismon','Voltobautamon',f,'Myotismon: Jogress with Piedmon.');pcj('Piedmon','Voltobautamon',f,'Piedmon: Jogress with Myotismon.')

 # ------------------------------------------------------------- Wind Guardians
 f='Wind Guardians'
 pct('Nyokimon','Yokomon',f,'Nyokimon: wait 10 minutes (adapted to Championship stage timer).')
 pc('Yokomon','Biyomon',f,(0,1),(2,None),'Unconnected 0-1 CM, 4 Effort OR Connected 0-1 CM, 2-3 Effort.',True)
 pc('Yokomon','Pteromon',f,(0,1),(4,4),'Connected: 0-1 CM, 4 Effort.',True)
 pc('Yokomon','Palmon',f,(2,2),(4,4),'2 CM, 4 Effort.');pc('Yokomon','Floramon',f,(0,1),(0,1),'0-1 CM, 0-1 Effort.');pc('Yokomon','Mushroomon',f,(2,2),(0,3),'2 CM, 0-3 Effort.')
 pc('Pteromon','Veedramon',f,(0,2),(0,1),'0-2 CM, 0-1 Effort.');pc('Pteromon','Birdramon',f,(3,3),(1,None),'3 CM, 1+ Effort.');pc('Pteromon','Galemon',f,(0,2),(2,None),'0-2 CM, 2+ Effort.');pc('Pteromon','Togemon',f,(3,3),(0,0),'3 CM, 0 Effort.')
 pc('Biyomon','Birdramon',f,(0,2),(3,None),'0-2 CM, 3+ Effort.');pc('Biyomon','Kiwimon',f,(0,2),(0,2),'0-2 CM, 0-2 Effort.');pc('Biyomon','RedVegiemon',f,(3,3),(0,2),'3 CM, 0-2 Effort.');pc('Biyomon','Woodmon',f,(3,3),(3,None),'3 CM, 3+ Effort.')
 pc('Palmon','Togemon',f,(0,2),(2,None),'0-2 CM, 2+ Effort.');pc('Palmon','Kiwimon',f,(3,3),(1,None),'3 CM, 1+ Effort.');pc('Palmon','RedVegiemon',f,(3,3),(0,0),'3 CM, 0 Effort.');pc('Palmon','Woodmon',f,(0,2),(0,1),'0-2 CM, 0-1 Effort.')
 pc('Floramon','Veedramon',f,(3,None),(3,None),'3+ CM, 3+ Effort.');pc('Floramon','Birdramon',f,(0,2),(0,1),'0-2 CM, 0-1 Effort.');pc('Floramon','Galemon',f,(0,2),(4,4),'Connected: 0-2 CM, 4 Effort.',True);pc('Floramon','Kiwimon',f,(0,2),(2,4),'Unconnected 4 Effort OR Connected 2-3 Effort.',True);pc('Floramon','RedVegiemon',f,(3,None),(0,2),'3+ CM, 0-2 Effort.')
 pc('Mushroomon','Veedramon',f,(0,2),(4,4),'0-2 CM, 4 Effort.');pc('Mushroomon','Galemon',f,(3,None),(0,0),'Connected: 3+ CM, 0 Effort.',True);pc('Mushroomon','Togemon',f,(3,None),(3,None),'3+ CM, 3+ Effort.');pc('Mushroomon','RedVegiemon',f,(3,None),(0,2),'Unconnected 0 Effort OR Connected 1-2 Effort; 3+ CM.',True);pc('Mushroomon','Woodmon',f,(0,2),(0,3),'0-2 CM, 0-3 Effort.')
 pcb('Veedramon','AeroVeedramon',f,(0,2));pcb('Birdramon','Garudamon',f,(0,2));pcb('Galemon','GrandGalemon',f,(0,2));pcb('Togemon','Lillymon',f,(0,3));pcb('Kiwimon','Blossomon',f,(0,3));pcb('Woodmon','Cherrymon',f,(0,3));pcb('RedVegiemon','Garbagemon',f,(0,3))
 # Deramon is Jogress-only at Perfect on the source device.
 pcj('Woodmon','Deramon',f,'Woodmon: Jogress with Vaccine Adult.');pcj('RedVegiemon','Deramon',f,'RedVegiemon: Jogress with Vaccine Adult.');pcj('Veedramon','Deramon',f,'Veedramon: Jogress with Virus Adult.')
 pcb('AeroVeedramon','UlforceVeedramon',f,(0,3));pcb('Garudamon','Phoenixmon',f,(0,2));pcb('GrandGalemon','Zephagamon',f,(0,3));pcb('Deramon','Gryphonmon',f,(0,2));pcb('Lillymon','Rosemon',f,(0,3));pcb('Blossomon','Rafflesimon',f,(0,3));pcb('Garbagemon','Hydramon',f,(0,3));pcb('Cherrymon','Puppetmon',f,(0,2))
 pcj('Phoenixmon','Mitamamon',f,'Phoenixmon: Jogress with MarineAngemon (Deep Savers).')
 for p in ('Gryphonmon','Puppetmon','Hydramon'):pcj(p,'Cernumon',f,f'{p}: Jogress with one of the other Cernumon source partners.')

 # ---------------------------------------------------------------- Metal Empire
 f='Metal Empire'
 pct('Choromon','Kapurimon',f,'Choromon: wait 10 minutes (adapted to Championship stage timer).')
 pc('Kapurimon','ToyAgumon',f,(2,2),(0,1),'2 CM, 0-1 Effort.');pc('Kapurimon','Kokuwamon',f,(2,2),(2,None),'2 CM, 2+ Effort.');pc('Kapurimon','Hagurumon',f,(0,1),(0,4),'Unconnected 2+ Effort OR Connected 0-1 Effort; 0-1 CM.',True);pc('Kapurimon','Commandramon',f,(0,1),(2,None),'Connected: 0-1 CM, 2+ Effort.',True)
 pc('ToyAgumon','Greymon',f,(0,1),(3,None),'0-1 CM, 3+ Effort.');pc('ToyAgumon','Deputymon',f,(2,2),(0,0),'2 CM, 0 Effort.');pc('ToyAgumon','Clockmon',f,(2,2),(3,None),'2 CM, 3+ Effort.');pc('ToyAgumon','Thunderballmon',f,(0,1),(0,2),'0-1 CM, 0-2 Effort.');pc('ToyAgumon','Mechanorimon',f,(2,2),(1,2),'2 CM, 1-2 Effort.')
 pc('Kokuwamon','Deputymon',f,(3,3),(0,1),'3 CM, 0-1 Effort.');pc('Kokuwamon','Clockmon',f,(3,3),(2,3),'3 CM, 2-3 Effort.');pc('Kokuwamon','Thunderballmon',f,(0,2),(2,4),'Unconnected 4 Effort OR Connected 2-3 Effort; 0-2 CM.',True);pc('Kokuwamon','Tankmon',f,(3,3),(4,4),'3 CM, 4 Effort.');pc('Kokuwamon','Guardromon',f,(0,2),(0,1),'0-2 CM, 0-1 Effort.');pc('Kokuwamon','HiCommandramon',f,(0,2),(4,4),'Connected: 0-2 CM, 4 Effort.',True)
 pc('Hagurumon','Greymon',f,(2,2),(3,None),'2 CM, 3+ Effort.');pc('Hagurumon','Tankmon',f,(0,1),(0,3),'0-1 CM, 0-3 Effort.');pc('Hagurumon','Guardromon',f,(0,1),(4,4),'0-1 CM, 4 Effort.');pc('Hagurumon','Mechanorimon',f,(2,2),(0,2),'Unconnected 0 Effort OR Connected 1-2 Effort; 2 CM.',True);pc('Hagurumon','HiCommandramon',f,(0,1),(0,0),'Connected: 0-1 CM, 0 Effort.',True)
 pc('Commandramon','Greymon',f,(3,3),(1,None),'3 CM, 1+ Effort.');pc('Commandramon','Clockmon',f,(3,3),(0,0),'3 CM, 0 Effort.');pc('Commandramon','Guardromon',f,(0,2),(4,4),'0-2 CM, 4 Effort.');pc('Commandramon','HiCommandramon',f,(0,2),(0,3),'0-2 CM, 0-3 Effort.')
 pcb('Greymon','MetalGreymon (Vaccine)',f,(0,2));pcb('Deputymon','Andromon',f,(0,2));pcb('Clockmon','Andromon',f,(0,3));pcb('Thunderballmon','BigMamemon',f,(0,2));pcb('Guardromon','Megadramon',f,(0,3));pcb('Mechanorimon','WaruMonzaemon',f,(0,3));pcb('HiCommandramon','Cargodramon',f,(0,2));pcb('Tankmon','Cargodramon',f,(0,3))
 # Cyberdramon and Knightmon are Perfect-stage Jogress results in PenC.
 pcj('Deputymon','Cyberdramon',f,'Deputymon/Revolmon: Jogress with Vaccine/Data Adult.');pcj('Guardromon','Knightmon',f,'Guardromon: Jogress with Vaccine Adult.')
 pcb('MetalGreymon (Vaccine)','WarGreymon',f,(0,2));pcb('Andromon','HiAndromon',f,(0,3));pcb('BigMamemon','MetalGarurumon',f,(0,2));pcb('Cargodramon','Brigadramon',f,(0,3));pcb('Knightmon','ZekeGreymon',f,(0,3));pcb('Megadramon','Machinedramon',f,(0,2));pcb('WaruMonzaemon','VenomMyotismon',f,(0,3));pcb('Cyberdramon','Ragnamon',f,(0,3))
 # Omnimon is one of the five legacy Championship Jogress-only entries and must
 # stay non-obtainable. Chaosdramon is new and receives the solo Jogress adaptation.
 pcj('Machinedramon','Chaosdramon',f,'Machinedramon: Jogress with HiAndromon.');pcj('HiAndromon','Chaosdramon',f,'HiAndromon: Jogress with Machinedramon.')

 # --------------------------------------------------------------- Virus Busters
 f='Virus Busters'
 pct('YukimiBotamon','Nyaromon',f,'YukimiBotamon: wait 10 minutes (adapted to Championship stage timer).')
 pc('Nyaromon','Agumon',f,(0,1),(0,4),'Unconnected 4 Effort OR Connected 0-3 Effort; 0-1 CM.',True)
 pc('Nyaromon','Salamon',f,(2,2),(0,0),'2 CM, 0 Effort.');pc('Nyaromon','Gabumon',f,(2,2),(1,None),'2 CM, 1+ Effort.');pc('Nyaromon','Gammamon',f,(0,1),(4,4),'Connected: 0-1 CM, 4 Effort.',True)
 pc('Agumon','Greymon',f,(0,2),(3,4),'Unconnected 3 Effort OR Connected 4 Effort; 0-2 CM.',True);pc('Agumon','Leomon',f,(0,2),(0,2),'Unconnected 1-2 Effort OR Connected 0 Effort; 0-2 CM.',True);pc('Agumon','Angemon',f,(3,3),(4,4),'3 CM, 4 Effort.');pc('Agumon','BetelGammamon',f,(0,2),(1,3),'Connected: 0-2 CM, 1-3 Effort.',True);pc('Agumon','Ninjamon',f,(3,3),(0,3),'Unconnected 2-3 Effort OR Connected 0-1 Effort; 3 CM.',True);pc('Agumon','GulusGammamon',f,(3,3),(2,3),'Connected: 3 CM, 2-3 Effort.',True)
 pc('Salamon','Greymon',f,(2,2),(3,None),'2 CM, 3+ Effort.');pc('Salamon','Gatomon',f,(0,1),(4,4),'Source table: Tailmon from Plotmon, low care mistakes, 4 Effort.');pc('Salamon','Garurumon',f,(0,1),(0,0),'0-1 CM, 0 Effort.');pc('Salamon','Angemon',f,(0,1),(1,3),'Unconnected 1 Effort OR Connected 2-3 Effort; 0-1 CM.',True);pc('Salamon','Ninjamon',f,(2,2),(0,2),'Unconnected 1-2 Effort OR Connected 0 Effort; 2 CM.',True);pc('Salamon','WezenGammamon',f,(0,1),(1,1),'Connected: 0-1 CM, 1 Effort.',True);pc('Salamon','GulusGammamon',f,(2,2),(1,2),'Connected: 2 CM, 1-2 Effort.',True)
 pc('Gabumon','Leomon',f,(2,2),(4,4),'2 CM, 4 Effort.');pc('Gabumon','Gatomon',f,(0,1),(0,3),'Unconnected 0-1 Effort OR Connected 2-3 Effort; 0-1 CM.',True);pc('Gabumon','Garurumon',f,(0,1),(4,4),'0-1 CM, 4 Effort.');pc('Gabumon','Ninjamon',f,(2,2),(0,3),'Unconnected 2-3 Effort OR Connected 0-1 Effort; 2 CM.',True);pc('Gabumon','KausGammamon',f,(0,1),(0,1),'Connected: 0-1 CM, 0-1 Effort.',True);pc('Gabumon','WezenGammamon',f,(2,2),(2,3),'Connected: 2 CM, 2-3 Effort.',True)
 pc('Gammamon','BetelGammamon',f,(0,1),(3,4),'0-1 CM, 3-4 Effort.');pc('Gammamon','KausGammamon',f,(0,1),(0,2),'0-1 CM, 0-2 Effort.');pc('Gammamon','WezenGammamon',f,(2,2),(0,1),'2 CM, 0-1 Effort.');pc('Gammamon','GulusGammamon',f,(2,2),(2,None),'2 CM, 2+ Effort.')
 pcb('Greymon','MetalGreymon (Vaccine)',f,(0,2));pcb('Leomon','Asuramon',f,(0,2));pcb('Garurumon','WereGarurumon',f,(0,3));pcb('Angemon','MagnaAngemon',f,(0,3));pcb('Gatomon','Angewomon',f,(0,3));pcb('BetelGammamon','Canoweissmon',f,(0,2));pcb('KausGammamon','Canoweissmon',f,(0,2));pcb('WezenGammamon','Canoweissmon',f,(0,2));pcb('Ninjamon','MetalMamemon',f,(0,3));pcb('GulusGammamon','Regulusmon',f,(0,2))
 pcb('MetalGreymon (Vaccine)','WarGreymon',f,(0,2));pcb('Canoweissmon','Siriusmon',f,(0,2));pcb('MagnaAngemon','Dominimon',f,(0,3));pcb('Asuramon','Dominimon',f,(0,2));pcb('WereGarurumon','MetalGarurumon',f,(0,2));pcb('MetalMamemon','Quantumon',f,(0,3));pcb('Angewomon','Quantumon',f,(0,3));pcb('Regulusmon','Arcturusmon',f,(0,3))
 pcj('Angewomon','Mastemon',f,'Angewomon: Jogress with LadyDevimon (Nightmare Soldiers).')
 pcj('Siriusmon','Proximamon',f,'Siriusmon: Jogress with Arcturusmon.');pcj('Arcturusmon','Proximamon',f,'Arcturusmon: Jogress with Siriusmon.')
family_edges()
# 15 existing eggs; exactly two Baby I candidates per visual. Unlock conditions remain unchanged.
pairs=[('Botamon','Bubbmon'),('Punimon','Mokumon'),('Poyomon','Nyokimon'),('Yuramon','Choromon'),('Zurumon','Bubbmon'),('Sakumon','Mokumon'),('Sakumon','Nyokimon'),('Petitmon','Choromon'),('Petitmon','Bubbmon'),('Pichimon','Mokumon'),('Pichimon','Poyomon'),('Botamon','Yuramon'),('Punimon','Zurumon'),('Dodomon','YukimiBotamon'),('YukimiBotamon','Dodomon')]
eggs=json.loads(json.dumps(D['eggs']))
for e,pair in zip(eggs,pairs):
 e.pop('start',None);e['starts']=[name_id[x] for x in pair]
 if e.get('metric')=='colosseumClear':e['condition']='Clear the entire Colosseum.'
assert len(eggs)==15 and all(len(e['starts'])==2 for e in eggs)
# Old five Jogress-only entries stay non-obtainable. All new PenC forms use adapted solo routes.
jogress=D['jogressOnly'][:]
# Profile generation. First 134 are preserved exactly.
old_profiles=json.loads((ROOT/'source'/'v032-species-profiles.json').read_text())
assert len(old_profiles)==134
# Existing stage centers keep the new roster on the v0.3.2 combat scale.
KEYS=['hp','tp','attack','defense','wisdom','speed']
stage_center={}
for st in range(1,8):
 vals=[p['stats'] for p in old_profiles if p['stage']==st]
 stage_center[st]={k:(statistics.median([v[k] for v in vals]) if vals else {1:50,2:100,3:240,4:600,5:1100,6:2100,7:3400}[st] if k=='hp' else 10) for k in KEYS}
# Explicit role families for identity; everything else uses keyword/family heuristics.
HEALERS={'MarineAngemon','Magnadramon','Angewomon','Mitamamon','Thetismon'}
GUARDIANS={'Tortomon','Triceramon','ElDoradimon','Zudomon','Vikemon','Mammothmon','Knightmon','Guardromon','Tankmon','Brigadramon','HiAndromon','MegaKabuterimon (Blue)','HerculesKabuterimon','Cernumon'}
CASTERS={'Gekomon','ShogunGekomon','Wizardmon','Myotismon','Phantomon','LadyDevimon','Piedmon','Daemon','Quantumon','Angewomon','MagnaAngemon','Dominimon','Amphimon','Jellymon','TeslaJellymon','Mitamamon','Tlalocmon','Mastemon','Voltobautamon','Regulusmon'}
RANGERS={'Tentomon','Otamamon','Starmon','Piximon','MegaSeadramon','MarineDevimon','Divermon','Lillymon','Rosemon','Garbagemon','Clockmon','Deputymon','MetalGreymon (Vaccine)','WarGreymon','MetalGarurumon','Canoweissmon','Siriusmon','Arcturusmon','Proximamon'}
SKIRMISH={'Angoramon','SymbareAngoramon','Diarbbitmon','Dolphmon','AeroVeedramon','UlforceVeedramon','Pteromon','Galemon','GrandGalemon','Zephagamon','WereGarurumon','Anubimon','Loogamon','Loogarmon','Soloogarmon','Fenriloogamon','Ninjamon','Cyberdramon','KausGammamon'}
ARTILLERY={'MetalSeadramon','Pukumon','Cthyllamon','Machinedramon','Chaosdramon','Megadramon','Cargodramon','Ragnamon','ZekeGreymon','BigMamemon','Thunderballmon','JumboGamemon','HiCommandramon','Brigadramon','WezenGammamon'}
# Curated recognizable signature moves; unknown obscure forms use a neutral species-technique label rather than a false franchise claim.
MOVES={
'Tentomon':'Super Shocker','Gotsumon':'Angry Rock','Otamamon':'Lullaby Bubble','Gomamon':'Marching Fishes','Crabmon':'Scissor Magic','Syakomon':'Black Pearl Blast','Jellymon':'Bibi Thunder','Tapirmon':'Nightmare Syndrome','Candlemon':'Bonfire','DemiDevimon':'Demi Dart','Floramon':'Rain of Pollen','Mushroomon':'Poison S-Mush','ToyAgumon':'Toy Flame','Kokuwamon':'Mini Scissor Arms','Hagurumon':'Darkness Gear','Commandramon':'M16 Assassin','Gammamon':'Baby Flame',
'Starmon':'Meteor Squall','Gekomon':'Symphony Crusher','Gatomon':'Lightning Paw','Ikkakumon':'Harpoon Torpedo','Wizardmon':'Thunder Cloud','Dokugumon':'Poison Cobweb','Veedramon':'V-Nova Blast','Togemon':'Needle Spray','Kiwimon':'Little Pecker','Woodmon':'Branch Drain','RedVegiemon':'Red Thorn','Deputymon':'Justice Bullet','Tankmon':'Hyper Cannon','Clockmon':'Chrono Breaker','Guardromon':'Destruction Grenade','Ninjamon':'Ninja Knife Throw','GulusGammamon':'Dead End Skewer',
'MegaKabuterimon (Blue)':'Horn Buster','Triceramon':'Tri-Horn Attack','ShogunGekomon':'Musical Fist','Okuwamon':'Double Scissor Claw','Angewomon':'Celestial Arrow','Zudomon':'Vulcan\'s Hammer','MegaSeadramon':'Lightning Javelin','Dagomon':'Forbidden Trident','MarineDevimon':'Guilty Black','Mammothmon':'Tusk Crusher','WereGarurumon':'Wolf Claw','SkullMeramon':'Heavy Metal Fire','Pumpkinmon':'Trick or Treat','Myotismon':'Grisly Wing','Phantomon':'Soul Chopper','LadyDevimon':'Darkness Wave','AeroVeedramon':'V-Wing Blade','Garudamon':'Wing Blade','Cherrymon':'Fog of Deception','Garbagemon':'Poop Bazooka','Lillymon':'Flower Cannon','MetalGreymon (Vaccine)':'Giga Blaster','Knightmon':'Berserk Sword','BigMamemon':'Big Smiley Bomber','WaruMonzaemon':'Heartbreak Attack','Cyberdramon':'Desolation Claw','MagnaAngemon':'Gate of Destiny',
'HerculesKabuterimon':'Giga Blaster','SaberLeomon':'Howling Crusher','Magnadramon':'Dragon Fire','GranKuwagamon':'Dimension Scissor','MarineAngemon':'Ocean Love','MetalSeadramon':'River of Power','Vikemon':'Arctic Blizzard','Boltmon':'Tomahawk Steiner','Daemon':'Flame Inferno','Piedmon':'Trump Sword','Anubimon':'Pyramid Power','Phoenixmon':'Starlight Explosion','Puppetmon':'Bullet Hammer','Rosemon':'Thorn Whip','UlforceVeedramon':'Shining V Force','Rafflesimon':'Billion Smiles','Hydramon':'Bio Field','WarGreymon':'Terra Force','MetalGarurumon':'Cocytus Breath','VenomMyotismon':'Venom Infuse','HiAndromon':'Atomic Ray','Chaosdramon':'Hyper Mugen Cannon','Dominimon':'Final Excalibur','Quantumon':'Soul Digitalization','Siriusmon':'Photon Blaster','Arcturusmon':'Black Death','Proximamon':'Extinction Cloud',
# v0.4 Pendulum Color additions: canonical/recognizable attacks cross-checked
# against Wikimon/Reference Book entries rather than placeholder species labels.
'Bubbmon':'Adhesive Bubbles','Motimon':'Elastic Bubbles','Tortomon':'Shell Phalanx','Jagamon':'Smash Potato','MetalEtemon':'Mega Punch','Blastmon':'Diamond Machine Gun','ElDoradimon':'Golden Road','Tlalocmon':'Nahui Quiahuitl','Mastemon':'Chaos Degrade','Angoramon':'Petit Tornado','SymbareAngoramon':"Breakin' Stream",'Lamortmon':'Calamity Claws','Diarbbitmon':'Trusgain',
'Dolphmon':'Shaking Pulse','Octmon':'Roaring Sea Ink Gun','Gesomon':'Deadly Shade','Ebidramon':'Twin Neptune','Scorpiomon':'Stinger Surprise','Divermon':'Strike Fishing','Pukumon':'Needle Squall','Plesiomon':'Sorrow Blue','JumboGamemon':'Megaton Hydro Laser','Cthyllamon':'Ocean Hell','Mitamamon':'Gouenrin','TeslaJellymon':'Physalist','Thetismon':'Shock Smasher','Amphimon':'Aqua Zanba',
'Mokumon':'Smoke','DemiMeramon':'Small Flame Shot','Apemon':'Angry Spike','NoblePumpkinmon':'Trick or Treat Wallace','Callismon':'Rodeo Bullet','Voltobautamon':'Palazzi Valzer','Loogamon':'Howling Fire','Loogarmon':'Howling Burner','Soloogarmon':'Prominence Laser','Fenriloogamon':'Ragnarok Howling',
'Nyokimon':'Seed Cracker','Yokomon':'Soap Flower','Blossomon':'Spiral Flower','Deramon':'Royal Nuts','Gryphonmon':'Supersonic Voice','Cernumon':'Celtic Bind','Pteromon':'Wind Slicer','Galemon':'Hurricane Slicer','GrandGalemon':'Dragonic Storm','Zephagamon':'Divine Tempest',
'Choromon':'Jamming Powder','Kapurimon':'Howling Hertz','Mechanorimon':'Twinkle Beam','Thunderballmon':'Thunderball','Ragnamon':'Ragnarok Cannon','ZekeGreymon':'Plasma Railgun','HiCommandramon':'DCD Grenade','Cargodramon':'Suppression Strike','Brigadramon':'Genocide Rain','Asuramon':'Asura Shinken',
'BetelGammamon':'Sorshot','KausGammamon':'Urda Impulse','WezenGammamon':'Sedna','Canoweissmon':'Gran Nova','Regulusmon':'Gran TrES',
}
SUPPORT_MOVES={
 'MarineAngemon':'Ocean Love','Magnadramon':'Shining Heal','Angewomon':'Saint Air',
 'Mitamamon':'Kyouka Suigetsu','Thetismon':'Dokutease',
}

def role_for(name,fam):
 if name in HEALERS:return 'repair'
 if name in ARTILLERY:return 'artillery'
 if name in GUARDIANS:return 'guardian'
 if name in CASTERS:return 'caster'
 if name in RANGERS:return 'ranger'
 if name in SKIRMISH:return 'skirmisher'
 low=name.lower()
 if any(x in low for x in ['machine','metal','tank','guard','mechan','clock','command','cargo','andromon']):return 'artillery' if any(x in low for x in ['metal','cargo','machine']) else 'guardian'
 if any(x in low for x in ['angel','devimon','daemon','wizard','quantum','myotismon']):return 'caster'
 if any(x in low for x in ['monzae','mammoth','tricer','torto','kabuteri']):return 'guardian'
 if fam in ('Deep Savers','Wind Guardians'):return 'ranger'
 if fam=='Metal Empire':return 'artillery'
 if fam=='Nightmare Soldiers':return 'brawler'
 return 'brawler'
ROLE_MULT={
'brawler':   {'hp':1.05,'tp':.78,'attack':1.24,'defense':1.02,'wisdom':.78,'speed':.96},
'caster':    {'hp':.92,'tp':1.28,'attack':.76,'defense':.88,'wisdom':1.27,'speed':.98},
'ranger':    {'hp':.94,'tp':1.14,'attack':.95,'defense':.88,'wisdom':1.12,'speed':1.14},
'guardian':  {'hp':1.18,'tp':.86,'attack':.96,'defense':1.25,'wisdom':.88,'speed':.72},
'artillery': {'hp':1.04,'tp':1.18,'attack':1.10,'defense':1.02,'wisdom':1.04,'speed':.74},
'skirmisher':{'hp':.91,'tp':.98,'attack':1.08,'defense':.82,'wisdom':.92,'speed':1.35},
'repair':    {'hp':.98,'tp':1.28,'attack':.76,'defense':.98,'wisdom':1.30,'speed':.91},
}
ROLE_BEHAV={
'brawler':(58,23,0,10,9,38,.014,.72),'caster':(16,57,0,14,13,175,.010,.45),'ranger':(21,48,0,11,20,190,.012,.51),'guardian':(38,27,0,27,8,62,.008,.50),'artillery':(18,62,0,14,6,210,.012,.56),'skirmisher':(39,32,0,8,21,82,.016,.63),'repair':(15,39,24,17,5,165,.007,.42)}
COLORS={'Nature Spirits':'#d7c878','Deep Savers':'#83cde0','Nightmare Soldiers':'#bb8ed6','Wind Guardians':'#9edb96','Metal Empire':'#aab3bd','Virus Busters':'#d8d9ed'}
# power normalization ranges per PenC stage for new records
stage_powers=collections.defaultdict(list)
for r in chosen.values():
 if r['power'] is not None:stage_powers[r['stage']].append(r['power'])
def stable_jitter(name,key):
 h=int(hashlib.sha256((name+'|'+key).encode()).hexdigest()[:8],16);return .94+(h%1201)/10000 # .94..1.0600
def profile_for(s):
 r=chosen[s['name']];st=s['stage'];power=s['power'];vals=stage_powers[st]
 if power is None:pscale=1.0
 else:
  lo,hi=min(vals),max(vals);pscale=.90+(.20*((power-lo)/(hi-lo) if hi>lo else .5))
 role=role_for(s['name'],r['family']);stats={}
 for k in KEYS:
  v=stage_center[st][k]*ROLE_MULT[role][k]*pscale*stable_jitter(s['name'],k)
  stats[k]=max(1,round(v))
 # Baby stages are never used in battle; still keep sane values.
 primary={'brawler':'attack','caster':'wisdom','ranger':'wisdom','guardian':'defense','artillery':'attack','skirmisher':'speed','repair':'wisdom'}[role]
 secondary={'brawler':'hp','caster':'tp','ranger':'speed','guardian':'hp','artillery':'wisdom','skirmisher':'attack','repair':'tp'}[role]
 mw,sw,hw,dw,ew,pr,dis,agg=ROLE_BEHAV[role]
 # Temperament variation is small and deterministic; profiles remain species-specific.
 dis=max(.004,min(.035,dis*(.85+(int(hashlib.md5(s['name'].encode()).hexdigest()[:4],16)%31)/100)))
 support={'name':SUPPORT_MOVES.get(s['name'],'Restorative Light'),'kind':'heal','tpCost':12} if role=='repair' else None
 move=MOVES.get(s['name'],s['name']+' Technique')
 close=role in ('brawler','guardian','skirmisher') and s['name'] not in RANGERS
 return {'speciesId':s['id'],'name':s['name'],'slug':s['slug'],'stage':st,'attribute':s['attribute'],'stats':stats,'specialization':[primary,secondary],'behavior':{'meleeWeight':mw,'specialWeight':sw,'healWeight':hw,'defendWeight':dw,'evadeWeight':ew,'preferredRange':pr,'disobedienceChance':round(dis,4),'aggression':agg},'specialRange':45 if close else 280,'normalMove':{'name':'Physical strike','kind':'melee'},'specialMove':{'name':move,'kind':'melee' if close else 'projectile','tpCost':8},'supportMove':support,'color':COLORS[r['family']],'source':FAMILY_URL[r['family']],'designRationale':f"Pendulum Color {r['family']} Power {r['power'] if r['power'] is not None else 'N/A'}; {role} profile, scaled to the existing Championship stage curve."}
profiles=json.loads(json.dumps(old_profiles))
for s in species[134:]:profiles.append(profile_for(s))
assert len(profiles)==len(species)==282
# Dynamic source-data Colosseum list, for documentation/tools; runtime also sorts dynamically from profiles.
col=sorted(species,key=lambda s:(s['stage'],sum(profiles[s['id']]['stats'][k] for k in KEYS),s['id']))
colosseum=[{'round':i+1,'name':s['name'],'species':s['id'],'attribute':s['attribute'],'power':s.get('power'),'estimated':s['id']>=134} for i,s in enumerate(col)]
D.update({'species':species,'routes':routes,'eggs':eggs,'jogressOnly':jogress,'colosseum':colosseum,'obtainableCount':len(species)-len(jogress),'albumCount':len(species),'pencSpriteSheet':'assets/penc-sprites.png','pencSpriteCell':16,'pencSpriteFrames':12})
(ROOT/'source-data.json').write_text(json.dumps(D,ensure_ascii=False,indent=2)+'\n')
(ROOT/'data.js').write_text("'use strict';\n(function(root){const DATA="+json.dumps(D,ensure_ascii=False,separators=(',',':'))+";if(typeof module!=='undefined')module.exports=DATA;root.DM20_DATA=DATA;})(globalThis);\n")
js="'use strict';\n(function(r){const data="+json.dumps(profiles,ensure_ascii=False,separators=(',',':'))+";r.CHAMP_DATA=data;if(typeof module!=='undefined')module.exports=data;})(globalThis);\n"
(ROOT/'profiles.js').write_text(js);(ROOT/'server'/'profiles.js').write_text(js);(ROOT/'source'/'species-profiles.json').write_text(json.dumps(profiles,ensure_ascii=False,indent=2)+'\n')
# Reproducibility/research manifest
manifest={'version':'0.4','rawPendulumEntries':len(raw),'uniquePendulumSpecies':len(chosen),'existingSpeciesPreserved':134,'newSpecies':len(species)-134,'catalogTotal':len(species),'obtainable':len(species)-len(jogress),'aliases':ALIAS,'duplicateVisualSelection':PREFERRED_VISUAL,'eggPairs':[{'egg':e['id'],'species':[species[i]['name'] for i in e['starts']]} for e in eggs],'sources':FAMILY_URL,'sheetGeometry':{'x':96,'y':44,'cell':16,'step':17,'frames':12,'order':['Idle 1','Idle 2','Eat 1','Eat 2','Sleep 1','Sleep 2','Refuse','Happy','Angry','Hurt','Sad','Attack']}}
(ROOT/'source'/'penc-expansion.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
# Keep original sheets alongside source for traceability.
outdir=ROOT/'source'/'penc-sheets';outdir.mkdir(exist_ok=True)
# Sheets already live under source/penc-sheets so the build is self-contained and reproducible.
for fam,p in SHEETS.items():
 assert p.exists(), f'Missing source sheet: {p}'
# Human audit catalog
with (ROOT/'source'/'PENC_EXPANSION_RESEARCH.md').open('w') as f:
 f.write('# Digital Beasts Championship v0.4 — Pendulum Color expansion\n\n')
 f.write('The six user-provided Pendulum Color sheets are the visual source. Evolution families and stage/attribute/power data were cross-checked against Humulos Pendulum Color resources and the corresponding Wikimon Pendulum Color family pages. Existing v0.3.2 IDs, profiles and route objects are preserved; new edges are additive.\n\n')
 f.write(f'- Raw sheet entries: {len(raw)}\n- Unique Pendulum Color species: {len(chosen)}\n- Legacy species with upgraded PenC art: {sum(1 for x in species[:134] if x.get("sprite",{}).get("sheet")=="penc")}\n- New Championship species: {len(species)-134}\n- Final catalog: {len(species)}\n- Obtainable: {len(species)-len(jogress)}\n\n')
 f.write('## Adaptation rules\n\n')
 f.write('- Sprite extraction is exact: 16×16 cells, X=96, Y=44, 17-pixel source stride, 12 frames in Idle1/Idle2/Eat1/Eat2/Sleep1/Sleep2/Refuse/Happy/Angry/Hurt/Sad/Attack order. Duplicate species choose one documented preferred family visual.\n')
 f.write('- The original 15 egg images remain. Each has two Baby I candidates; candidate 1 is its v0.3.2 hatch species. Adoption makes one 50/50 choice and stores `hatchSpeciesId`, so load never rerolls it.\n')
 f.write('- Source Care Mistakes are represented by the existing stage care counter. Source Effort is mapped to four bands of the Championship stage training budget; no new visible stat is introduced.\n')
 f.write('- Pendulum Color evolutions listed as 15+ battles / 80%+ wins are compressed to 5 battles in the current stage while preserving the 80% win ratio.\n')
 f.write('- Device connection is not a Championship mechanic. Connected/unconnected source wording is retained in `sourceRequirement`; compatible branches are represented through the existing care/effort/stat system.\n')
 f.write('- Jogress remains out of scope. New source-Jogress results receive an explicit solo battle-gated adaptation; the five legacy Championship Jogress-only entries (IDs 129–133) remain unobtainable.\n')
 f.write('- Existing species keep their v0.3.2 stage, attribute, power, profile and old routes even when a Pendulum Color device classifies the same name differently. This intentionally protects save/balance compatibility.\n\n')
 f.write('## Egg distribution\n\n')
 for e in eggs:f.write(f"- `{e['id']}`: **{species[e['starts'][0]]['name']}** / **{species[e['starts'][1]]['name']}**\n")
 f.write('\n')
 for fam in PENC:
  f.write(f'## {fam}\nSource: {FAMILY_URL[fam]}\n\n')
  for rr in [x for x in raw if x['family']==fam]:
   sid=name_id[rr['name']];f.write(f"- {rr['rawName']} → **{rr['name']}** (ID {sid}, stage {species[sid]['stage']}, {species[sid]['attribute']}, PenC Power {rr['power']})\n")
  f.write('\n')
print('v0.4 data built:',len(species),'species;',len(chosen),'PenC sprite rows;',len(species)-len(jogress),'obtainable')
