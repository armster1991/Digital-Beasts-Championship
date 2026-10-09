'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const DATA=require(path.join(ROOT,'data.js'));
const Champ=require(path.join(ROOT,'engine.js'));

const id=n=>DATA.species.find(s=>s.name===n)?.id;
assert.equal(typeof Champ.evolutionRequirements,'function');

// Every obtainable Baby I must be represented by at least one of the 15 egg visuals.
for(const s of DATA.species.filter(s=>s.stage===1&&!DATA.jogressOnly.includes(s.id))){
  const info=Champ.evolutionRequirements(s.id);
  assert(info.hatch.length>0,`${s.name} has no Digi-Egg route in DIGIDEX`);
  for(const h of info.hatch){assert(h.chance>0&&h.chance<=1);assert.equal(h.minAge,Champ.TIMES[0]);assert(DATA.eggs[h.eggIndex].starts.includes(s.id));}
}

// Every obtainable non-Baby-I entry has at least one route that matches the live evolution resolver.
for(const s of DATA.species.filter(s=>s.stage>1&&!DATA.jogressOnly.includes(s.id))){
  const info=Champ.evolutionRequirements(s.id);
  assert(info.routes.length>0,`${s.name} has no obtainable evolution route in DIGIDEX`);
  for(const r of info.routes){
    assert(DATA.species[r.fromId],`${s.name} has invalid source`);
    assert(DATA.species[r.fromId].stage<s.stage,`${s.name} route does not advance stage`);
    assert.equal(r.minAge,Champ.TIMES[DATA.species[r.fromId].stage]||0);
    for(const q of r.training){
      assert(Champ.STATS.includes(q.stat));assert(q.min>0);assert(q.valueMin>0);
      const mul=q.stat==='hp'?5:q.stat==='tp'?2:1;
      assert.equal(q.valueMin,Math.round(Champ.PROFILES[r.fromId].stats[q.stat]+q.min*mul));
    }
    if(r.winRatio)assert(r.winRatio>0&&r.winRatio<=1);
  }
}

// Canonical Greymon example: the actual current live rule is exposed, not the old provenance fields.
{
  const info=Champ.evolutionRequirements(id('Greymon'));
  const route=info.routes.find(r=>DATA.species[r.fromId].name==='Agumon');
  assert(route,'Greymon must list Agumon');
  assert.equal(route.minAge,1500);
  assert.deepEqual(route.training.map(x=>[x.stat,x.min]),[['attack',12],['hp',6]]);
  assert.equal(route.stageBattles,0);assert.equal(route.stageWins,0);
  assert.deepEqual(route.care,{min:null,max:2},'normal Greymon route must surface the live <3 care-mistake gate');
}

// Bubbmon is available from three existing egg visuals at the real 50/50 hatch chance.
{
  const info=Champ.evolutionRequirements(id('Bubbmon'));
  assert.equal(info.hatch.length,3);
  assert(info.hatch.every(x=>x.chance===.5&&x.minAge===60));
}


// Every surfaced route mirrors every live eligibility gate for the egg contexts where it applies.
function reachable(eggId){
  const e=DATA.eggs.find(x=>x.id===eggId),seen=new Set(),q=[...(e?.starts||[])];
  while(q.length){const sid=q.shift();if(seen.has(sid)||!DATA.species[sid])continue;seen.add(sid);for(const r of Champ.evolutionRoutes({speciesId:sid,eggId}))if(!seen.has(r.to))q.push(r.to);}
  return seen;
}
const reachByEgg=new Map(DATA.eggs.map(e=>[e.id,reachable(e.id)]));
let mirrored=0;
for(const target of DATA.species.filter(s=>s.stage>1&&!DATA.jogressOnly.includes(s.id))){
  const info=Champ.evolutionRequirements(target.id);
  for(const req of info.routes){
    const source=DATA.species[req.fromId];
    const candidates=DATA.eggs.filter(e=>reachByEgg.get(e.id).has(source.id)&&(!req.eggIds.length||req.eggIds.includes(e.id)));
    assert(candidates.length,`${source.name} -> ${target.name} has no egg context`);
    for(const e of candidates){
      const live=Champ.evolutionRoutes({speciesId:source.id,eggId:e.id}),r=live.find(x=>x.to===target.id);
      if(!r)continue;
      mirrored++;
      const hasLegacyCare=live.some(x=>!x.penc&&x.care);
      const care=r.care?{min:3,max:null}:r.penc&&(r.careMin!==undefined||r.careMax!==undefined)?{min:r.careMin??null,max:r.careMax??null}:!r.penc&&hasLegacyCare?{min:null,max:2}:null;
      const effort=r.penc&&(r.effortMin!==undefined||r.effortMax!==undefined)?{min:r.effortMin??null,max:r.effortMax??null}:null;
      assert.deepEqual(req.care,care,`${source.name} -> ${target.name} care gate mismatch`);
      assert.deepEqual(req.effort,effort,`${source.name} -> ${target.name} effort gate mismatch`);
      assert.equal(req.stageWins,r.care?0:(r.winNeed||0),`${source.name} -> ${target.name} win gate mismatch`);
      assert.equal(req.stageBattles,r.care?0:(r.battleNeed||0),`${source.name} -> ${target.name} battle gate mismatch`);
      assert.equal(req.winRatio,r.care?0:(r.winRatioMin||0),`${source.name} -> ${target.name} ratio gate mismatch`);
      const expectedTraining=r.care?[]:[{stat:r.primary,min:r.need||0},{stat:r.secondary,min:Math.floor((r.need||0)/2)}]
        .filter((x,i,a)=>x.min>0&&a.findIndex(y=>y.stat===x.stat)===i).map(x=>[x.stat,x.min]);
      assert.deepEqual(req.training.map(x=>[x.stat,x.min]),expectedTraining,`${source.name} -> ${target.name} training gate mismatch`);
    }
  }
}
assert(mirrored>1000,`expected broad route mirror coverage, got ${mirrored}`);

// UI contract: DIGIDEX is bilingual, only registered cards are interactive, detail view exists, and mobile landscape is page-scroll-free.
const app=fs.readFileSync(path.join(ROOT,'app.js'),'utf8');
const lang=fs.readFileSync(path.join(ROOT,'champ-i18n.js'),'utf8');
const css=fs.readFileSync(path.join(ROOT,'style.css'),'utf8');
assert(app.includes("screen==='album-detail'"));
assert(app.includes(".album-card[data-dex-id]"));
assert(app.includes("if(!game.s.album[id]){show('album');return;}"));
assert(app.includes('Champ.evolutionRequirements(id)'));
assert(app.includes('Digital Beasts Championship · v0.4.4'));
assert(lang.includes("album:['DIGIDEX','DIGIDEX']"));
assert(lang.includes('dexEvolutionRequirements'));
assert(lang.includes('dexHatchTime'));
assert(css.includes('html,body{width:100%;height:100%;overflow:hidden}'));
assert(css.includes('env(safe-area-inset-left)'));
assert(css.includes('env(safe-area-inset-bottom)'));
assert(css.includes('body{min-height:0}'));
assert(css.includes('#panel-content:has(.colosseum-layout){overflow:hidden'));
assert(css.includes('.colosseum-card{height:100%'));
assert(css.includes('.album-card.registered'));

console.log('PASS v0.4.4 DIGIDEX + mobile layout:',DATA.species.length,'species');
