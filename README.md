# Digital Beasts Championship

A browser-based virtual pet fangame by **Armster**, inspired by **Digimon World Championship**. Raise two companions, shape their growth through training, and watch their personalities unfold in automatic battles.

![The nursery](source/previews/nursery-desktop.png)

## A small world to care for

- Raise **up to two independent Digimon**, including two of the same species.
- Explore a scrolling nursery with a resting area and six distinct training cages.
- Drag companions, drop unlimited food, apply medicine, and sweep up waste with a mouse or touchscreen.
- Develop **HP, TP, Attack, Defense, Wisdom, and Speed**. Limited training points encourage specialization while allowing you to retrain.
- Discover automatic, branching evolutions. Each companion has its own age and development timer.
- Keep your companions indefinitely: there is **no automatic death or lifespan limit**. Deleting a companion requires two confirmations.

## Prepare, then let them fight

Battles are automatic 1v1 encounters with movement, close-range attacks, projectiles, defense, evasion, and species-specific behavior. TP limits special attacks, while occasional hesitation adds personality without repeated stun-locks.

At 90 seconds, **Sudden Death** turns the arena red, accelerates actions and lowers defense and evasion for both fighters.

The **Colosseum contains 282 opponents**, one for every catalog entry, dynamically ordered by stage and combat strength. Online rooms support a host and challenger, optional passwords, ready checks, and mutually accepted rematches.

![Mobile battle](source/previews/battle-landscape.png)

## Discover with the DIGIDEX

The **DIGIDEX** contains **282 animated entries**, of which **277 are obtainable** in this version. The v0.4 expansion integrates the six Pendulum Color families while preserving all 134 original Championship IDs. Five legacy fusion-only species remain visible as Colosseum opponents; Jogress itself is still outside this fork's scope.

Once a Digimon has been registered, its DIGIDEX card can be clicked or tapped to reveal every current in-game route for obtaining it again. These details are generated from the same evolution resolver used by the pet engine, including minimum stage time, training/stat thresholds, care mistakes, Effort, battle/win requirements, win ratio, and Digi-Egg origin where applicable. Baby I entries show the existing Digi-Eggs that can hatch them and the real hatch chance.

The same **15 Digi-Eggs** remain in use, but each now has **two possible Baby I outcomes**. The result is chosen once when the egg is created and stored in the save, so reloading never rerolls the hatch. Collection milestones and battle achievements continue to unlock the existing egg artwork.

![The DIGIDEX](source/previews/album-desktop.png)

## Pendulum Color expansion

Version 0.4 adds **148 new species** from six user-provided Pendulum Color sprite sheets. In total, 181 unique Pendulum Color species have 12-frame animation rows covering idle, eating, sleep, refusal, emotion, hurt, and attack states. Existing species use the new Pendulum Color art when available; species not present in those sheets keep their legacy sprites. Evolution data for the expansion is source-traceable in `source/PENC_EXPANSION_RESEARCH.md`.

## Play and save

Open **`index.html`** to play locally, or play the hosted version in a modern browser. Local play needs no installer or account. Online matchmaking requires the Championship lobby service.

Progress autosaves in the browser every 30 seconds. **Save & exit** downloads a portable `.dbcsave` backup; **Load save** imports it. This fork uses separate saves from Digital Beasts HTML / Ver.20th. Browser storage can be cleared by the browser, so keep an exported backup of progress you want to preserve.

The interface supports **English and Brazilian Portuguese**, desktop, and mobile landscape play. Since v0.4.2 the main mobile landscape screen is constrained to the viewport so the nursery controls, pet cards, navigation, and footer do not require vertical page scrolling; long submenus retain internal vertical scrolling. The Colosseum menu has its own compact landscape arrangement. **Settings** shows the current game version (`v0.4.3`) for easy build identification. Music and sound effects have independent volume controls and start at 10%. **TUTORIAL** replaces the old Help entry and is available beside **MAIN MENU** in the top-right, with a 12-page indexed player guide in both supported languages.

## About this fan project

Armster created this project for personal enjoyment and for fellow virtual pet fans, and owns an original 20th anniversary V-Pet. This is an experimental, noncommercial fangame, unaffiliated with or endorsed by the owners of Digimon. Digimon characters and related artwork belong to their respective owners.

Combat statistics and evolution requirements are original adaptations for this game, informed by species profiles rather than exact reproductions of another game's numbers.
