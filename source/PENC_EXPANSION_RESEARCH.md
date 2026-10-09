# Digital Beasts Championship v0.4 — Pendulum Color expansion

The six user-provided Pendulum Color sheets are the visual source. Evolution families and stage/attribute/power data were cross-checked against Humulos Pendulum Color resources and the corresponding Wikimon Pendulum Color family pages. Existing v0.3.2 IDs, profiles and route objects are preserved; new edges are additive.

- Raw sheet entries: 193
- Unique Pendulum Color species: 181
- Legacy species with upgraded PenC art: 33
- New Championship species: 148
- Final catalog: 282
- Obtainable: 277

## Adaptation rules

- Sprite extraction is exact: 16×16 cells, X=96, Y=44, 17-pixel source stride, 12 frames in Idle1/Idle2/Eat1/Eat2/Sleep1/Sleep2/Refuse/Happy/Angry/Hurt/Sad/Attack order. Duplicate species choose one documented preferred family visual.
- The original 15 egg images remain. Each has two Baby I candidates; candidate 1 is its v0.3.2 hatch species. Adoption makes one 50/50 choice and stores `hatchSpeciesId`, so load never rerolls it.
- Source Care Mistakes are represented by the existing stage care counter. Source Effort is mapped to four bands of the Championship stage training budget; no new visible stat is introduced.
- Pendulum Color evolutions listed as 15+ battles / 80%+ wins are compressed to 5 battles in the current stage while preserving the 80% win ratio.
- Device connection is not a Championship mechanic. Connected/unconnected source wording is retained in `sourceRequirement`; compatible branches are represented through the existing care/effort/stat system.
- Jogress remains out of scope. New source-Jogress results receive an explicit solo battle-gated adaptation; the five legacy Championship Jogress-only entries (IDs 129–133) remain unobtainable.
- Existing species keep their v0.3.2 stage, attribute, power, profile and old routes even when a Pendulum Color device classifies the same name differently. This intentionally protects save/balance compatibility.

## Egg distribution

- `ver1`: **Botamon** / **Bubbmon**
- `ver2`: **Punimon** / **Mokumon**
- `ver3`: **Poyomon** / **Nyokimon**
- `ver4`: **Yuramon** / **Choromon**
- `ver5`: **Zurumon** / **Bubbmon**
- `zuba`: **Sakumon** / **Mokumon**
- `hack`: **Sakumon** / **Nyokimon**
- `slayer`: **Petitmon** / **Choromon**
- `break`: **Petitmon** / **Bubbmon**
- `corona`: **Pichimon** / **Mokumon**
- `luna`: **Pichimon** / **Poyomon**
- `taichi`: **Botamon** / **Yuramon**
- `yamato`: **Punimon** / **Zurumon**
- `doru`: **Dodomon** / **YukimiBotamon**
- `meicoo`: **YukimiBotamon** / **Dodomon**

## Nature Spirits
Source: https://wikimon.net/Pendulum_COLOR_1_Nature_Spirits

- Bubbmon → **Bubbmon** (ID 134, stage 1, Free, PenC Power None)
- Mochimon → **Motimon** (ID 135, stage 2, Free, PenC Power None)
- Tentomon → **Tentomon** (ID 136, stage 3, Vaccine, PenC Power 20)
- Gottsumon → **Gotsumon** (ID 137, stage 3, Data, PenC Power 15)
- Otamamon → **Otamamon** (ID 138, stage 3, Virus, PenC Power 10)
- Kabuterimon → **Kabuterimon** (ID 20, stage 4, Vaccine, PenC Power 50)
- Tortamon → **Tortomon** (ID 139, stage 4, Vaccine, PenC Power 40)
- Monochromon → **Monochromon** (ID 52, stage 4, Data, PenC Power 44)
- Starmon → **Starmon** (ID 140, stage 4, Data, PenC Power 32)
- Gekomon → **Gekomon** (ID 141, stage 4, Virus, PenC Power 36)
- Kuwagamon → **Kuwagamon** (ID 55, stage 4, Virus, PenC Power 48)
- Tailmon → **Gatomon** (ID 142, stage 4, Vaccine, PenC Power 55)
- Atlur Kabuterimon → **MegaKabuterimon (Blue)** (ID 143, stage 5, Vaccine, PenC Power 96)
- Jyagamon → **Jagamon** (ID 144, stage 5, Vaccine, PenC Power 80)
- Triceramon → **Triceramon** (ID 145, stage 5, Data, PenC Power 100)
- Piccolomon → **Piximon** (ID 60, stage 5, Data, PenC Power 88)
- Tonosama Gekomon → **ShogunGekomon** (ID 146, stage 5, Virus, PenC Power 84)
- Okuwamon → **Okuwamon** (ID 147, stage 5, Virus, PenC Power 92)
- Angewomon → **Angewomon** (ID 148, stage 5, Vaccine, PenC Power 105)
- Herakle Kabuterimon → **HerculesKabuterimon** (ID 149, stage 6, Vaccine, PenC Power 165)
- Saber Leomon → **SaberLeomon** (ID 150, stage 6, Data, PenC Power 170)
- Metal Etemon → **MetalEtemon** (ID 151, stage 6, Virus, PenC Power 140)
- Holydramon → **Magnadramon** (ID 152, stage 6, Vaccine, PenC Power 155)
- Blastmon → **Blastmon** (ID 153, stage 6, Vaccine, PenC Power 145)
- El Doradimon → **ElDoradimon** (ID 154, stage 6, Data, PenC Power 150)
- Gran Kuwagamon → **GranKuwagamon** (ID 155, stage 6, Free, PenC Power 160)
- Tlalocmon → **Tlalocmon** (ID 156, stage 7, Data, PenC Power 205)
- Mastemon → **Mastemon** (ID 157, stage 7, Vaccine, PenC Power 195)
- Angoramon → **Angoramon** (ID 158, stage 3, Vaccine, PenC Power 25)
- Symbare Angoramon → **SymbareAngoramon** (ID 159, stage 4, Vaccine, PenC Power 60)
- Lamortmon → **Lamortmon** (ID 160, stage 5, Vaccine, PenC Power 110)
- Diarbbitmon → **Diarbbitmon** (ID 161, stage 6, Vaccine, PenC Power 180)

## Deep Savers
Source: https://wikimon.net/Pendulum_COLOR_2_Deep_Savers

- Pitchmon → **Pichimon** (ID 99, stage 1, Free, PenC Power None)
- Pukamon → **Bukamon** (ID 100, stage 2, Free, PenC Power None)
- Gomamon → **Gomamon** (ID 162, stage 3, Vaccine, PenC Power 10)
- Ganimon → **Crabmon** (ID 163, stage 3, Data, PenC Power 20)
- Shakomon → **Syakomon** (ID 164, stage 3, Virus, PenC Power 15)
- Rukamon → **Dolphmon** (ID 165, stage 4, Vaccine, PenC Power 48)
- Ikkakumon → **Ikkakumon** (ID 166, stage 4, Vaccine, PenC Power 36)
- Seadramon → **Seadramon** (ID 9, stage 4, Data, PenC Power 50)
- Coelamon → **Coelamon** (ID 56, stage 4, Data, PenC Power 40)
- Octmon → **Octmon** (ID 167, stage 4, Virus, PenC Power 44)
- Gesomon → **Gesomon** (ID 168, stage 4, Virus, PenC Power 32)
- Ebidramon → **Ebidramon** (ID 169, stage 4, Data, PenC Power 55)
- Whamon → **Whamon** (ID 25, stage 4, Vaccine, PenC Power 100)
- Zudomon → **Zudomon** (ID 170, stage 5, Vaccine, PenC Power 88)
- Mega Seadramon → **MegaSeadramon** (ID 171, stage 5, Data, PenC Power 92)
- Anomalocarimon → **Scorpiomon** (ID 172, stage 5, Data, PenC Power 105)
- Dagomon → **Dagomon** (ID 173, stage 5, Virus, PenC Power 96)
- Marin Devimon → **MarineDevimon** (ID 174, stage 5, Virus, PenC Power 84)
- Hangyomon → **Divermon** (ID 175, stage 5, Data, PenC Power 80)
- Marin Angemon → **MarineAngemon** (ID 176, stage 6, Vaccine, PenC Power 160)
- Metal Seadramon → **MetalSeadramon** (ID 177, stage 6, Data, PenC Power 165)
- Pukumon → **Pukumon** (ID 178, stage 6, Virus, PenC Power 145)
- Plesiomon → **Plesiomon** (ID 179, stage 6, Data, PenC Power 155)
- Vikemon → **Vikemon** (ID 180, stage 6, Free, PenC Power 150)
- Jumbo Gamemon → **JumboGamemon** (ID 181, stage 6, Data, PenC Power 140)
- Cthyllamon → **Cthyllamon** (ID 182, stage 6, Virus, PenC Power 170)
- Mitamamon → **Mitamamon** (ID 183, stage 7, Vaccine, PenC Power 205)
- Aegisdramon → **Aegisdramon** (ID 62, stage 6, Vaccine, PenC Power 195)
- Jellymon → **Jellymon** (ID 184, stage 3, Data, PenC Power 25)
- Tesla Jellymon → **TeslaJellymon** (ID 185, stage 4, Data, PenC Power 60)
- Thetismon → **Thetismon** (ID 186, stage 5, Data, PenC Power 110)
- Amphimon → **Amphimon** (ID 187, stage 6, Data, PenC Power 180)

## Nightmare Soldiers
Source: https://wikimon.net/Digimon_Pendulum_COLOR_3_Nightmare_Soldiers

- Mokumon → **Mokumon** (ID 188, stage 1, Free, PenC Power None)
- Peti Meramon → **DemiMeramon** (ID 189, stage 2, Free, PenC Power None)
- Bakumon → **Tapirmon** (ID 190, stage 3, Vaccine, PenC Power 10)
- Candmon → **Candlemon** (ID 191, stage 3, Data, PenC Power 15)
- Pico Devimon → **DemiDevimon** (ID 192, stage 3, Virus, PenC Power 20)
- Hanumon → **Apemon** (ID 193, stage 4, Vaccine, PenC Power 44)
- Garurumon → **Garurumon** (ID 21, stage 4, Vaccine, PenC Power 32)
- Meramon → **Meramon** (ID 7, stage 4, Data, PenC Power 36)
- Wizarmon → **Wizardmon** (ID 194, stage 4, Data, PenC Power 48)
- Devimon → **Devimon** (ID 6, stage 4, Virus, PenC Power 50)
- Bakemon → **Bakemon** (ID 39, stage 4, Virus, PenC Power 40)
- Dokugumon → **Dokugumon** (ID 195, stage 4, Virus, PenC Power 55)
- Mammon → **Mammothmon** (ID 196, stage 5, Vaccine, PenC Power 84)
- Were Garurumon → **WereGarurumon** (ID 197, stage 5, Vaccine, PenC Power 96)
- Death Meramon → **SkullMeramon** (ID 198, stage 5, Data, PenC Power 88)
- Pumpmon → **Pumpkinmon** (ID 199, stage 5, Data, PenC Power 100)
- Vamdemon → **Myotismon** (ID 200, stage 5, Virus, PenC Power 92)
- Fantomon → **Phantomon** (ID 201, stage 5, Virus, PenC Power 80)
- Lady Devimon → **LadyDevimon** (ID 202, stage 5, Virus, PenC Power 105)
- Skull Mammon → **SkullMammothmon** (ID 30, stage 6, Vaccine, PenC Power 150)
- Boltmon → **Boltmon** (ID 203, stage 6, Data, PenC Power 145)
- Demon → **Daemon** (ID 204, stage 6, Virus, PenC Power 160)
- Piemon → **Piedmon** (ID 205, stage 6, Virus, PenC Power 155)
- Anubimon → **Anubimon** (ID 206, stage 6, Vaccine, PenC Power 140)
- Noble Pumpmon → **NoblePumpkinmon** (ID 207, stage 6, Data, PenC Power 165)
- Callismon → **Callismon** (ID 208, stage 6, Virus, PenC Power 170)
- Voltobautamon → **Voltobautamon** (ID 209, stage 7, Virus, PenC Power 205)
- Mastemon → **Mastemon** (ID 157, stage 7, Vaccine, PenC Power 195)
- Loogamon → **Loogamon** (ID 210, stage 3, Virus, PenC Power 25)
- Loogarmon → **Loogarmon** (ID 211, stage 4, Virus, PenC Power 60)
- Soloogarmon → **Soloogarmon** (ID 212, stage 5, Virus, PenC Power 110)
- Fenriloogamon → **Fenriloogamon** (ID 213, stage 6, Virus, PenC Power 180)

## Wind Guardians
Source: https://wikimon.net/Pendulum_COLOR_4_Wind_Guardians

- Nyokimon → **Nyokimon** (ID 214, stage 1, Free, PenC Power None)
- Pyocomon → **Yokomon** (ID 215, stage 2, Free, PenC Power None)
- Piyomon → **Biyomon** (ID 50, stage 3, Vaccine, PenC Power 18)
- Floramon → **Floramon** (ID 216, stage 3, Data, PenC Power 10)
- Mushmon → **Mushroomon** (ID 217, stage 3, Virus, PenC Power 14)
- Palmon → **Palmon** (ID 51, stage 3, Data, PenC Power 22)
- V-dramon → **Veedramon** (ID 218, stage 4, Vaccine, PenC Power 48)
- Birdramon → **Birdramon** (ID 24, stage 4, Vaccine, PenC Power 36)
- Togemon → **Togemon** (ID 219, stage 4, Data, PenC Power 55)
- Kiwimon → **Kiwimon** (ID 220, stage 4, Data, PenC Power 40)
- Woodmon → **Woodmon** (ID 221, stage 4, Virus, PenC Power 44)
- Red Vegimon → **RedVegiemon** (ID 222, stage 4, Virus, PenC Power 32)
- Aero V-dramon → **AeroVeedramon** (ID 223, stage 5, Vaccine, PenC Power 105)
- Garudamon → **Garudamon** (ID 224, stage 5, Vaccine, PenC Power 88)
- Blossomon → **Blossomon** (ID 225, stage 5, Data, PenC Power 92)
- Delumon → **Deramon** (ID 226, stage 5, Data, PenC Power 84)
- Jyureimon → **Cherrymon** (ID 227, stage 5, Virus, PenC Power 96)
- Gerbemon → **Garbagemon** (ID 228, stage 5, Virus, PenC Power 80)
- Lilimon → **Lillymon** (ID 229, stage 5, Data, PenC Power 100)
- Hououmon → **Phoenixmon** (ID 230, stage 6, Vaccine, PenC Power 150)
- Griffomon → **Gryphonmon** (ID 231, stage 6, Data, PenC Power 140)
- Pinochimon → **Puppetmon** (ID 79, stage 6, Virus, PenC Power 145)
- Rosemon → **Rosemon** (ID 232, stage 6, Data, PenC Power 155)
- Ulforce V-dramon → **UlforceVeedramon** (ID 233, stage 6, Vaccine, PenC Power 170)
- Rafflesimon → **Rafflesimon** (ID 234, stage 6, Data, PenC Power 165)
- Hydramon → **Hydramon** (ID 235, stage 6, Virus, PenC Power 160)
- Mitamamon → **Mitamamon** (ID 183, stage 7, Vaccine, PenC Power 205)
- Cernumon → **Cernumon** (ID 236, stage 7, Data, PenC Power 205)
- Pteromon → **Pteromon** (ID 237, stage 3, Data, PenC Power 25)
- Galemon → **Galemon** (ID 238, stage 4, Data, PenC Power 60)
- Grand Galemon → **GrandGalemon** (ID 239, stage 5, Data, PenC Power 110)
- Zephagamon → **Zephagamon** (ID 240, stage 6, Data, PenC Power 180)

## Metal Empire
Source: https://wikimon.net/Pendulum_COLOR_5_Metal_Empire

- Choromon → **Choromon** (ID 241, stage 1, Free, PenC Power None)
- Caprimon → **Kapurimon** (ID 242, stage 2, Free, PenC Power None)
- Toy Agumon → **ToyAgumon** (ID 243, stage 3, Vaccine, PenC Power 10)
- Kokuwamon → **Kokuwamon** (ID 244, stage 3, Data, PenC Power 14)
- Hagurumon → **Hagurumon** (ID 245, stage 3, Virus, PenC Power 18)
- Greymon → **Greymon** (ID 4, stage 4, Vaccine, PenC Power 48)
- Revolmon → **Deputymon** (ID 246, stage 4, Vaccine, PenC Power 32)
- Tankmon → **Tankmon** (ID 247, stage 4, Data, PenC Power 44)
- Clockmon → **Clockmon** (ID 248, stage 4, Data, PenC Power 36)
- Guardromon → **Guardromon** (ID 249, stage 4, Virus, PenC Power 50)
- Mechanorimon → **Mechanorimon** (ID 250, stage 4, Virus, PenC Power 40)
- Thunderballmon → **Thunderballmon** (ID 251, stage 4, Data, PenC Power 55)
- Metal Greymon (Vaccine) → **MetalGreymon (Vaccine)** (ID 252, stage 5, Vaccine, PenC Power 100)
- Andromon → **Andromon** (ID 43, stage 5, Vaccine, PenC Power 80)
- Knightmon → **Knightmon** (ID 253, stage 5, Data, PenC Power 96)
- Big Mamemon → **BigMamemon** (ID 254, stage 5, Data, PenC Power 84)
- Megadramon → **Megadramon** (ID 59, stage 5, Virus, PenC Power 105)
- Waru Monzaemon → **WaruMonzaemon** (ID 255, stage 5, Virus, PenC Power 88)
- Cyberdramon → **Cyberdramon** (ID 256, stage 5, Vaccine, PenC Power 92)
- War Greymon → **WarGreymon** (ID 257, stage 6, Vaccine, PenC Power 155)
- Metal Garurumon → **MetalGarurumon** (ID 258, stage 6, Data, PenC Power 145)
- Mugendramon → **Machinedramon** (ID 78, stage 6, Virus, PenC Power 170)
- Venom Vamdemon → **VenomMyotismon** (ID 259, stage 6, Virus, PenC Power 150)
- Hi Andromon → **HiAndromon** (ID 46, stage 6, Vaccine, PenC Power 140)
- Ragnamon → **Ragnamon** (ID 260, stage 6, Free, PenC Power 165)
- Zeke Greymon → **ZekeGreymon** (ID 261, stage 6, Virus, PenC Power 160)
- Omegamon → **Omnimon** (ID 133, stage 7, Vaccine, PenC Power 200)
- Chaosdramon → **Chaosdramon** (ID 262, stage 7, Virus, PenC Power 205)
- Commandramon → **Commandramon** (ID 263, stage 3, Virus, PenC Power 25)
- Hi-Commandramon → **HiCommandramon** (ID 264, stage 4, Virus, PenC Power 60)
- Cargodramon → **Cargodramon** (ID 265, stage 5, Virus, PenC Power 110)
- Brigadramon → **Brigadramon** (ID 266, stage 6, Virus, PenC Power 180)

## Virus Busters
Source: https://wikimon.net/Digimon_Pendulum_COLOR_ZERO_Virus_Busters

- Yukimibotamon → **YukimiBotamon** (ID 123, stage 1, Free, PenC Power None)
- Nyaromon → **Nyaromon** (ID 124, stage 2, Free, PenC Power None)
- Agumon → **Agumon** (ID 2, stage 3, Vaccine, PenC Power 20)
- Gabumon → **Gabumon** (ID 18, stage 3, Data, PenC Power 14)
- Plotmon → **Salamon** (ID 125, stage 3, Vaccine, PenC Power 10)
- Greymon → **Greymon** (ID 4, stage 4, Vaccine, PenC Power 48)
- Leomon → **Leomon** (ID 54, stage 4, Vaccine, PenC Power 40)
- Garurumon → **Garurumon** (ID 21, stage 4, Vaccine, PenC Power 44)
- Igamon → **Ninjamon** (ID 267, stage 4, Data, PenC Power 32)
- Angemon → **Angemon** (ID 22, stage 4, Vaccine, PenC Power 50)
- Tailmon → **Gatomon** (ID 142, stage 4, Vaccine, PenC Power 55)
- Metal Greymon (Vaccine) → **MetalGreymon (Vaccine)** (ID 252, stage 5, Vaccine, PenC Power 100)
- Asuramon → **Asuramon** (ID 268, stage 5, Vaccine, PenC Power 80)
- Were Garurumon → **WereGarurumon** (ID 197, stage 5, Vaccine, PenC Power 96)
- Metal Mamemon → **MetalMamemon** (ID 28, stage 5, Data, PenC Power 84)
- Holy Angemon → **MagnaAngemon** (ID 269, stage 5, Vaccine, PenC Power 110)
- Angewomon → **Angewomon** (ID 148, stage 5, Vaccine, PenC Power 105)
- War Greymon → **WarGreymon** (ID 257, stage 6, Vaccine, PenC Power 155)
- Metal Garurumon → **MetalGarurumon** (ID 258, stage 6, Data, PenC Power 145)
- Dominimon → **Dominimon** (ID 270, stage 6, Vaccine, PenC Power 160)
- Quantumon → **Quantumon** (ID 271, stage 6, Data, PenC Power 165)
- Omegamon → **Omnimon** (ID 133, stage 7, Vaccine, PenC Power 200)
- Mastemon → **Mastemon** (ID 157, stage 7, Vaccine, PenC Power 195)
- Gammamon → **Gammamon** (ID 272, stage 3, Virus, PenC Power 25)
- Betel Gammamon → **BetelGammamon** (ID 273, stage 4, Vaccine, PenC Power 60)
- Kaus Gammamon → **KausGammamon** (ID 274, stage 4, Data, PenC Power 57)
- Wezen Gammamon → **WezenGammamon** (ID 275, stage 4, Data, PenC Power 65)
- Gulus Gammamon → **GulusGammamon** (ID 276, stage 4, Virus, PenC Power 92)
- Canoweissmon → **Canoweissmon** (ID 277, stage 5, Vaccine, PenC Power 120)
- Regulusmon → **Regulusmon** (ID 278, stage 5, Virus, PenC Power 150)
- Siriusmon → **Siriusmon** (ID 279, stage 6, Vaccine, PenC Power 180)
- Arcturusmon → **Arcturusmon** (ID 280, stage 6, Virus, PenC Power 175)
- Proximamon → **Proximamon** (ID 281, stage 7, Virus, PenC Power 205)

