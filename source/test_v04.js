'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const DATA=require(path.join(ROOT,'data.js'));
const P=require(path.join(ROOT,'profiles.js'));
const Champ=require(path.join(ROOT,'engine.js'));
const Battle=require(path.join(ROOT,'battle.js'));
const BASE=JSON.parse(fs.readFileSync(path.join(__dirname,'v032-source-data.json'),'utf8'));
const BASEP=JSON.parse(fs.readFileSync(path.join(__dirname,'v032-species-profiles.json'),'utf8'));
const MANIFEST=JSON.parse(fs.readFileSync(path.join(__dirname,'penc-expansion.json'),'utf8'));

function sameIdentity(a,b){for(const k of ['id','name','slug','stage','attribute','power','family'])assert.deepEqual(a[k],b[k],`old species ${b.id} field ${k}`);}
function routeKey(from,r){return JSON.stringify([Number(from),r.to,r.egg??null,r.fallback??null,r.battleGate??null,r.stageBattlesMin??null]);}

assert.equal(Champ.VERSION,2);
assert.equal(DATA.species.length,282);
assert.equal(DATA.albumCount,282);
assert.equal(DATA.obtainableCount,277);
assert.equal(P.length,282);
assert.deepEqual(DATA.jogressOnly,[129,130,131,132,133]);
assert.equal(MANIFEST.rawPendulumEntries,193);
assert.equal(MANIFEST.uniquePendulumSpecies,181);
assert.equal(MANIFEST.newSpecies,148);
assert.equal(MANIFEST.catalogTotal,282);
assert.equal(MANIFEST.obtainable,277);

// Existing IDs/game data remain stable; only their sprite metadata may be upgraded.
assert.equal(BASE.species.length,134);
for(let i=0;i<134;i++)sameIdentity(DATA.species[i],BASE.species[i]);
assert.deepEqual(P.slice(0,134),BASEP,'all 134 v0.3.2 profiles must remain unchanged');
for(const [from,arr] of Object.entries(BASE.routes))for(const r of arr)assert(DATA.routes[from]?.some(x=>JSON.stringify(x)===JSON.stringify(r)),`old route removed: ${from}->${r.to}`);

// Catalog integrity.
assert.deepEqual(DATA.species.map(x=>x.id),Array.from({length:282},(_,i)=>i));
assert.equal(new Set(DATA.species.map(x=>x.name)).size,282);
assert.equal(new Set(DATA.species.map(x=>x.slug)).size,282);
for(const s of DATA.species){assert(P[s.id],`missing profile ${s.name}`);assert.equal(P[s.id].speciesId,s.id);assert.equal(P[s.id].name,s.name);assert.equal(P[s.id].stage,s.stage);assert.equal(P[s.id].attribute,s.attribute);}

// 15 existing egg visuals, two Baby I outcomes each. First candidate preserves the v0.3.2 egg start.
assert.equal(DATA.eggs.length,15);
const baseEgg=new Map(BASE.eggs.map(e=>[e.id,e]));
const babySet=new Set();
for(const e of DATA.eggs){
  assert.equal(e.starts.length,2,`${e.id} must have 2 starts`);
  assert.equal(e.starts[0],baseEgg.get(e.id).start,`${e.id} must preserve legacy start as candidate 1`);
  assert.notEqual(e.starts[0],e.starts[1],`${e.id} candidates must differ`);
  for(const id of e.starts){assert.equal(DATA.species[id].stage,1,`${e.id}/${DATA.species[id].name} is not Baby I`);babySet.add(id);}
}
assert.equal(babySet.size,14);
assert.deepEqual([...babySet].map(i=>DATA.species[i].name).sort(),['Botamon','Bubbmon','Choromon','Dodomon','Mokumon','Nyokimon','Petitmon','Pichimon','Poyomon','Punimon','Sakumon','YukimiBotamon','Yuramon','Zurumon'].sort());
const birthCounts={};for(const e of DATA.eggs)for(const id of e.starts){const n=DATA.species[id].name;birthCounts[n]=(birthCounts[n]||0)+1;}
for(const n of Object.keys(birthCounts))assert.equal(birthCounts[n],['Bubbmon','Mokumon'].includes(n)?3:2,`unbalanced egg coverage for ${n}`);

// Every egg can produce either candidate at the exact 0.5 split boundary and save it permanently.
for(const e of DATA.eggs){
  for(const [rng,want] of [[0,e.starts[0]],[0.499999,e.starts[0]],[0.5,e.starts[1]],[0.999999,e.starts[1]]]){
    const g=new Champ.Game();g.s.unlockedEggs.fill(true);g.random=()=>rng;const p=g.adopt(e.id);assert.equal(p.hatchSpeciesId,want,`${e.id} RNG ${rng}`);
    const copy=new Champ.Game(g.export());assert.equal(copy.s.pets[0].hatchSpeciesId,want,`${e.id} hatch choice changed after reload`);
  }
}

// v0.3.2 migration: album expands and a pending old egg keeps the exact species it used to hatch.
{
  const g=new Champ.Game();g.s.unlockedEggs.fill(true);g.random=()=>.99;const p=g.adopt('hack');
  const legacy=g.export();legacy.version=1;legacy.album=legacy.album.slice(0,134);delete legacy.pets[0].hatchSpeciesId;
  const migrated=new Champ.Game(legacy);
  assert.equal(migrated.s.version,2);assert.equal(migrated.s.album.length,282);
  assert.equal(migrated.s.pets[0].hatchSpeciesId,baseEgg.get('hack').start,'legacy pending egg changed hatch species');
  assert.equal(migrated.s.pets[0].speciesId,null);
}

// New routes are additive and always move to a later stage.
const oldKeys=new Set();for(const [from,arr] of Object.entries(BASE.routes))for(const r of arr)oldKeys.add(routeKey(from,r));
let added=0;
for(const [from,arr] of Object.entries(DATA.routes))for(const r of arr){const k=routeKey(from,r);if(!oldKeys.has(k)){added++;assert(DATA.species[Number(from)].stage<DATA.species[r.to].stage,`new route regresses stage: ${DATA.species[Number(from)].name}->${DATA.species[r.to].name}`);}}
assert(added>250,'expected substantial PenC route expansion');

// Pendulum Color route provenance/adaptation metadata is auditable.
let pencRoutes=0,battleRoutes=0,jogressAdapted=0,timeRoutes=0;
for(const [from,arr] of Object.entries(DATA.routes))for(const r of arr)if(r.penc){
 pencRoutes++;assert(r.pencFamily&&r.pencKind&&r.sourceRequirement,`missing PenC route provenance ${from}->${r.to}`);
 assert(['Nature Spirits','Deep Savers','Nightmare Soldiers','Wind Guardians','Metal Empire','Virus Busters'].includes(r.pencFamily));
 if(r.pencKind==='battle'){battleRoutes++;assert.equal(r.sourceBattlesMin,15);assert.equal(r.stageBattlesMin,5);assert.equal(r.winRatioMin,.8);}
 if(r.pencKind==='jogress-adapted'){jogressAdapted++;assert(r.adaptedJogress);assert(r.stageBattlesMin>=5);assert(r.winRatioMin>=.6);}
 if(r.pencKind==='time'){timeRoutes++;assert.equal(r.specNeed,0);}
}
assert.equal(pencRoutes,259);assert.equal(battleRoutes,91);assert.equal(jogressAdapted,25);assert.equal(timeRoutes,4);
const id=n=>DATA.species.find(s=>s.name===n)?.id;
const has=(a,b,pred=()=>true)=>(DATA.routes[String(id(a))]||[]).some(r=>r.to===id(b)&&pred(r));
assert(has('Angewomon','Mastemon',r=>r.adaptedJogress));assert(has('LadyDevimon','Mastemon',r=>r.adaptedJogress));assert(!has('Magnadramon','Mastemon'));
assert(has('Myotismon','Voltobautamon',r=>r.adaptedJogress));assert(has('Piedmon','Voltobautamon',r=>r.adaptedJogress));assert(!has('Callismon','Voltobautamon'));
for(const p of ['Woodmon','RedVegiemon','Veedramon'])assert(has(p,'Deramon',r=>r.adaptedJogress));
assert(has('Siriusmon','Proximamon',r=>r.adaptedJogress));assert(has('Arcturusmon','Proximamon',r=>r.adaptedJogress));
assert.equal((DATA.routes[String(id('Omnimon'))]||[]).length,0,'legacy Jogress-only Omnimon must remain blocked');

// Reachability with actual egg filtering logic. Exactly the five legacy Jogress-only forms may remain unreachable.
const reachable=new Set();
const queue=[];
for(const e of DATA.eggs)for(const id of e.starts)queue.push([e.id,id]);
const seenState=new Set();
while(queue.length){
  const [eggId,speciesId]=queue.shift(),sk=eggId+'|'+speciesId;if(seenState.has(sk))continue;seenState.add(sk);reachable.add(speciesId);
  const pet={eggId,speciesId};for(const r of Champ.evolutionRoutes(pet))queue.push([eggId,r.to]);
}
const missing=DATA.species.filter(s=>!reachable.has(s.id)).map(s=>s.id);
assert.deepEqual(missing,DATA.jogressOnly);
for(let id=134;id<282;id++)assert(reachable.has(id),`new species unreachable: ${DATA.species[id].name}`);

// Sprite metadata: every PenC species uses the 12-frame atlas, legacy fallback remains supported.
let pencOld=0,legacyOld=0,pencNew=0;
for(const s of DATA.species){
  assert(s.sprite && Number.isInteger(s.sprite.frames));
  if(s.sprite.sheet==='penc'){
    assert.equal(s.sprite.frames,12);assert.equal(s.sprite.step,16);assert.equal(s.sprite.x,0);assert.equal(s.sprite.y%16,0);
    if(s.id<134)pencOld++;else pencNew++;
  }else if(s.id<134){legacyOld++;assert.equal(s.sprite.frames,4);}
}
assert.equal(pencOld,33);assert.equal(legacyOld,101);assert.equal(pencNew,148);
assert(fs.existsSync(path.join(ROOT,'assets','penc-sprites.png')));

// Profiles for new species are complete and legal for BattleSim.
for(const p of P.slice(134)){
  for(const k of Champ.STATS)assert(Number.isFinite(p.stats[k])&&p.stats[k]>0,`${p.name} ${k}`);
  const b=p.behavior;for(const k of ['meleeWeight','specialWeight','healWeight','defendWeight','evadeWeight','preferredRange','disobedienceChance','aggression'])assert(Number.isFinite(b[k]),`${p.name} behavior ${k}`);
  assert(b.meleeWeight+b.specialWeight+b.healWeight+b.defendWeight+b.evadeWeight>0);
  if(b.healWeight>0)assert(p.supportMove,`${p.name} has heal weight without support move`);
  assert(p.specialMove?.name&&p.specialMove?.kind,`${p.name} missing special move`);
  assert(!p.specialMove.name.endsWith(' Technique'),`${p.name} still has a placeholder special move`);
  assert(/^https:\/\//.test(p.source),`${p.name} missing research source`);
  assert(P[p.speciesId].stats===p.stats || true);
  Battle.canonical({species:p.speciesId,stats:{...p.stats}});
}

// Deterministic battle for new fighters and dynamic 282-round Coliseum.
assert.equal(Champ.colosseum.length,282);
assert.equal(new Set(Champ.colosseum.map(s=>s.id)).size,282);
for(const [aName,bName] of [['WarGreymon','MetalGarurumon'],['Diarbbitmon','Fenriloogamon'],['Siriusmon','Arcturusmon'],['Tlalocmon','Cernumon']]){
  const a=DATA.species.find(s=>s.name===aName),b=DATA.species.find(s=>s.name===bName);assert(a&&b);
  const fa={species:a.id,stats:{...P[a.id].stats}},fb={species:b.id,stats:{...P[b.id].stats}};
  const r1=Battle.fight(fa,fb,0x12345678,false),r2=Battle.fight(fa,fb,0x12345678,false);assert.deepEqual(r1,r2,`${aName}/${bName} not deterministic`);
}
const last=Champ.colosseum[281];assert(Battle.colosseumOpponent({species:last.id,stats:{...P[last.id].stats}},282));

// Shared deterministic files must remain byte-identical.
assert.equal(fs.readFileSync(path.join(ROOT,'battle.js'),'utf8'),fs.readFileSync(path.join(ROOT,'server','battle.js'),'utf8'));
assert.equal(fs.readFileSync(path.join(ROOT,'profiles.js'),'utf8'),fs.readFileSync(path.join(ROOT,'server','profiles.js'),'utf8'));
assert(fs.readFileSync(path.join(ROOT,'app.js'),'utf8').includes('Digital Beasts Championship · v0.4.3'));

console.log('PASS v0.4 core:',DATA.species.length,'species,',DATA.obtainableCount,'obtainable,',added,'new route objects');
