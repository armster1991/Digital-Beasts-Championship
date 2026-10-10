# Championship fork: implementation notes

This directory documents the fork for maintainers. `index.html` is the entry point; no bundler is required for local play. The original v1.6 archive is not modified.

## Reused and separated

The original catalog IDs, corrected sprite coordinates, transparent sprite extraction, four source frames, audio, font, egg artwork, bilingual dictionary, save encoding, and lobby lifecycle were retained. Habitat state and battle simulation were replaced because a single-pet timer and volley-based battle model cannot represent independent instances, world positions, or moving combat.

The new save namespace is `db-championship-save-v1`, edition `digital-beasts-championship`, with portable `.dbcsave` files. XOR obfuscation and a checksum discourage casual text edits and detect accidental corruption; they are not encryption or cryptographic anti-cheat. The old namespace and Worker remain unchanged.

## Data and research

- `source-data.json` / `data.js`: inherited roster and base relations, stable species IDs.
- `source/research-index.json`: official reference URLs, attributes, levels and move names for the 134 legacy v0.3.2 entries. Partner variants share the corresponding species reference; their cooperation weighting is an explicit design adaptation.
- `source/profile-design.txt`: individually reviewed allocation, behavior class, hesitation probability, specialization and rationale.
- `source/species-profiles.json` / `profiles.js`: compiled, centralized gameplay profiles.
- `source/build_profiles.py`: rebuilds compiled profiles from the reviewed design and reference index. Copy the resulting `profiles.js` to `server/profiles.js` after rebuilding.

Sources were read from the [official Digimon Encyclopedia](https://digimon.net/reference_en/). Japanese directory aliases were checked through Wikimon where the official URL used an unexpected spelling. Classic Greymon and MetalGreymon are distinguished from their Xros Wars namesakes. Existing V-Pet stages and attributes take precedence where a reference profile covers another incarnation, such as Whamon.

Stat allocations, probabilities, training requirements and numerical attack effects are **game design choices**, not canonical statistics. Profiles are not generated from appearance or stage alone: each species has a reviewed six-stat allocation and temperament value. Behavior templates supply a common vocabulary; species allocation modifies their action weights. A holy identity alone does not grant healing. Nanomon's repair heritage is interpreted as self-repair; other defensive/support identities use shielding, avoidance or positioning.

## Evolution adaptation

The Ver.20th relations remain the foundation. Additional relationships and AP interpretations were checked against these Championship gameplay tables:

- [Greymon](https://wikimon.net/Greymon#Digimon_Championship): battle-gated metal evolutions and the SkullGreymon alternative.
- [Tyrannomon](https://wikimon.net/Tyranomon#Digimon_Championship): Machine AP and battles become defensive/offensive training plus a small win requirement for MetalTyrannomon.
- [Piximon](https://wikimon.net/Piccolomon#Digimon_Championship): Angemon and Kokatorimon links; Holy AP is adapted to wisdom and related training.
- [Unimon](https://wikimon.net/Unimon#Digimon_Championship): the Salamon connection is retained as an additional branch with mobility-oriented training.

This is not a complete import of Championship's 216-species tree. No Tamer Rank, calendar, AP inventory or Egg Revert requirements are introduced. v0.5 adds a visible neglect-driven Mortality meter, but there is still no age-based lifespan requirement or death from old age.

Evolution time is tracked separately for each instance. Once the minimum age is met, eligibility is tested continuously. A route normally needs training in two attributes; applicable battle gates use three stage wins, and special former 100-battle exceptions use five stage battles. Legacy overfeeding and training-count splits are replaced with specialization. Explicit fallback species require three care mistakes. Separate secondary attributes break duplicate branch requirements.

The deterministic selection order is:

1. Routes belonging to the selected egg, when such routes exist.
2. Eligibility by age, training, care and battle requirements.
3. Highest `2 × primary training + secondary training`.
4. Highest inherited route priority.
5. Lowest target species ID.

Every distinct route has a tested stat/care witness. All 277 obtainable species remain reachable from the available egg groups. Five legacy fusion-only entries remain visible and fightable, but not raisable.

## Nursery and specialization

The world has seven 300-unit zones. Pointer Events implement pet dragging, item dragging, tap-to-select tools, empty-ground panning and cancellation; wheel scrolling and zone shortcuts are also available. Save positions are world coordinates.

Every 15 seconds, a valid training cage adds up to 3 points, costs 2.5 fatigue and 1.5 hunger. Fatigue 95, hunger below 10, sickness or injury prevents gains. Rest recovers 95/60 fatigue per second. Permanent training budgets are 12, 30, 90, 160, 250, 360 and 480; one stat normally holds at most 50% of the current budget and never more than 240 training points. Outside Rest, fatigue also rises by 9 per minute. Training never redistributes or subtracts another stat: at a per-stat or total cap, the attempt simply grants no points. HP and TP convert training points at 5:1 and 2:1 respectively. Permanent `training` survives evolution; separate `stageTraining` resets on evolution and drives route thresholds and the four Effort dots.

Food is restricted to the pet’s current cage and reserves by instance ID, expires after 90 seconds and is consumed in three 0.6-second visual phases. At most six Meat objects are active at once. Hunger continues to decline during rest. Care mistakes count once per unresolved incident after two minutes. Neglect also builds Mortality: hunger at zero or ignored exhaustion is 1x, sickness/injury 2x, and three or more waste objects 0.5x, with combined pressure capped at 2x. One Mortality point requires 420 pressure-seconds. Mortality capacity is 3/4/5/6/7/8/9 from Baby I through Ultra, resets on evolution, and never rises merely from age. At the cap the partner becomes a persistent grave until the player releases that slot. Battle participants are temporarily locked; the other companion continues developing.

## Shared combat and netplay

`battle.js` is a DOM-free fixed 0.1-second simulation using seeded xorshift RNG. `BattleSim` accepts participant arrays, with a two-participant guard for this version. HP, TP, attack, defense, wisdom, speed, movement, range, guards, evasion and two-second hesitation participate in the simulation. Hesitation has a 17-second earliest repeat time. After the 90-second Sudden Death transition, at 135 seconds remaining HP percentage breaks a stalled fight; this is not a knockout and the surviving bar is not falsely zeroed.

The browser renders snapshots. The dedicated protocol-4 Worker runs the same simulation and authoritatively reports the winner after both clients finish. Fighter validation checks species, stage, base stats, per-stat bounds and the total training budget. It does not prove that a local save was honestly earned.

Host/challenger roles, room passwords, ready state, mutual rematch, disconnect notices, host-only kick and host departure closure reuse the established lobby state machine. No existing deployment was changed. Public service availability depends on publishing the included Worker.

## Validation

`test_engine.js` covers independent identities, two-slot enforcement, continuous training/rest, food reservation, medicine, cleaning, no automatic deletion, serialization, evolution witnesses, roster-sized Colosseum and deterministic combat across all species.

`test_netplay.mjs` tests the authoritative lobby state machine and browser/server simulation equality. `test_browser.js` drives real mouse and touch gestures in desktop, portrait and landscape Chromium. `test_online_ui.js` connects two actual browser clients to a WebSocket adapter running the same `LobbyCore`, including a full battle, rematch and host departure. Accelerated clocks shorten this integration test without changing the battle RNG or timestep.

The public Cloudflare deployment is not part of these local tests. Balance values are an initial tuning pass, not a claim of exhaustive multi-hour player testing.

## Assistance and presentation
After minimum stage time plus 120 seconds, TIPS identifies the nearest unmet route independently for each pet without revealing target species. Coliseum reset changes only the current round; permanent boolean unlocks, best round and clear records remain. Egg artwork is assigned in fixed roster order, left-to-right then top-to-bottom from the supplied sheet. Battle/result music is exclusive; leaving results stops the one-shot immediately.

## Combat revision 0.3
Coliseum only: fixed early-opponent stat floors and modest later-stage scaling, independent of player strength. Network canonical validation is unchanged. At 90 real seconds, simulation actions advance at 2x, armor and dodge are halved. Terminal safety limit is 135 seconds, awarded by remaining HP percentage. Defensive decisions have a shared cooldown; retreat speed is capped relative to pursuer speed. Deterministic fan steering uses both field axes and avoids zero-motion wall clamping. Client and Worker share identical simulation code; protocol 4 rejects older peers.

Audio fade and stored volume values are clamped to [0,1], including negative animation timestamps relative to the fade start. Mobile portrait uses a rotate notice with the main layout removed from flow to avoid initial viewport inflation on rotation.

## Expansion revision 0.4

The original 134 species IDs, profiles and legacy evolution route objects remain stable. Six user-provided Pendulum Color sheets contribute 193 raw rows / 181 unique species; 33 overlap legacy species and 148 are appended, producing 282 catalog entries and 277 obtainable forms. `source/PENC_EXPANSION_RESEARCH.md` and `source/penc-expansion.json` document aliases, visual-source selection and route provenance.

The same 15 egg images now expose two Baby I candidates each. The hatch candidate is selected once at adoption, stored as `hatchSpeciesId`, and preserved by save/load. All 14 Baby I are represented; legacy egg starts remain the first candidate for backward compatibility. Legacy egg-specific routes keep their filtering behavior, while additive Pendulum Color routes remain available so mixed eggs do not strand a family.

Pendulum Color art is cut at the verified 16×16 / 17-pixel-stride grid into a transparent 12-frame atlas. Existing species prefer the new atlas when present and otherwise keep the four-frame legacy path. The final atlas is independently compared pixel-for-pixel against all six source sheets.

Source-device battle evolutions recorded as 15+ battles / 80%+ wins are compressed to five stage battles while retaining the 80% ratio. Source Jogress relationships for newly added forms are represented as documented solo battle-gated adaptations because Jogress remains out of scope. The five pre-existing Jogress-only Championship forms remain unobtainable.


## Balance revision 0.5

Minimum evolution times are 30 s, 3 min, 7 min, 15 min, 25 min, 35 min and 45 min for Egg→Baby I through Mega→Ultra. Save schema is version 3; v1/v2 saves migrate by retaining permanent training and seeding `stageTraining` from the previous training distribution so an in-progress evolution is not destroyed by migration. New-stage evolution resets `stageTraining`, care mistakes and Mortality.

After a completed local or Online battle, `recordBattle()` returns the newly eligible evolution target. The result UI suppresses rematch/next while that evolution is pending; the normal engine tick performs the evolution, the client returns to the nursery and centers the partner. A Netplay client whose partner evolves closes its room connection so the peer receives the normal departure signal instead of waiting indefinitely for rematch.

`version.json` is the public update marker. The client checks it shortly after startup and every five minutes with a cache-busting query. When the hosted semantic version is newer than `GAME_VERSION`, a nursery-only banner recommends saving and explicitly instructs CTRL+F5 on desktop or page refresh/reload on mobile.
