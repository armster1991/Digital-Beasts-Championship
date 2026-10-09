const assert=require('node:assert/strict'),C=require('../engine'),B=require('../battle');
function fixture(){const g=new C.Game(),a=g.adopt('ver1'),b=g.adopt('ver1');g.evolve(a,2);g.evolve(b,2);a.hunger=b.hunger=100;g.events=[];return{g,a,b};}
const {g,a,b}=fixture();assert.notEqual(a.instanceId,b.instanceId);assert.equal(g.adopt('ver2'),null);g.drop(a.instanceId,750,230);g.drop(b.instanceId,150,250);const old=B.canonical(g.fighter(a.instanceId));g.advance(60);assert(a.training.tp>0);assert.equal(b.training.tp,0);assert(a.fatigue>0);assert(g.valid(g.export()));let reloaded=new C.Game(g.export());assert.equal(reloaded.s.pets[0].zone,'tp');assert.equal(reloaded.s.pets[0].instanceId,a.instanceId);
a.fatigue=96;const prev=a.training.tp;g.advance(30);assert.equal(a.training.tp,prev);g.drop(a.instanceId,150,250);g.advance(120);assert(a.fatigue<=40);a.sick=a.injured=true;assert(g.medicine(a.instanceId));assert(!a.sick&&!a.injured);g.s.waste=[{x:150,y:250}];assert.equal(g.clean(150,250),1);
a.hunger=b.hunger=20;a.x=100;b.x=110;a.y=b.y=250;g.food(120,250);g.tick(.1);assert.equal(g.s.food.filter(f=>f.reserved).length,1);g.advance(5);assert.equal(g.s.food.length,0);assert((a.hunger>40)!==(b.hunger>40));
g.advance(86400);assert.equal(g.s.pets.length,2);assert(g.valid(g.export()));assert(g.delete(a.instanceId));assert(g.adopt('ver2'));
// Continuous evolution: missing age deadline never permanently blocks a pet.
const f=fixture();f.a.stageAge=2000;f.g.tryEvolution(f.a);assert.equal(f.a.speciesId,2);const r=C.evolutionRoutes(f.a).find(x=>x.to===4);f.a.training[r.primary]=r.need;f.a.training[r.secondary]=r.need/2;f.g.tryEvolution(f.a);assert.equal(f.a.speciesId,4);assert.equal(f.a.hunger,0);
// Every surfaced route must have a direct care/training/battle witness within the stage budget.
function witness(from,eggId,r){
 const st=C.catalog[from].stage,b=C.budget(st),q=b/4;
 const p={speciesId:from,eggId,stageAge:(C.TIMES[st]||0)+1,battleLock:false,careMistakes:0,stageWins:0,stageBattles:0,training:Object.fromEntries(C.STATS.map(k=>[k,0]))};
 if(!r.penc){p.careMistakes=r.care?3:0;p.training[r.primary]=r.need;p.training[r.secondary]=Math.floor(r.need/2);p.stageWins=r.winNeed||0;p.stageBattles=Math.max(r.battleNeed||0,p.stageWins);return p;}
 p.careMistakes=r.careMin||0;
 const base=(r.primary===r.secondary?r.need:r.need+Math.floor(r.need/2));
 const minTotal=(r.effortMin||0)*q,maxTotal=r.effortMax===undefined?b:Math.min(b,(r.effortMax+1)*q-.01);
 const target=Math.max(base,minTotal);
 assert(target<=maxTotal+.001,`unsatisfiable effort band ${C.catalog[from].name}->${C.catalog[r.to].name}`);
 p.training[r.primary]=r.need;p.training[r.secondary]=Math.max(p.training[r.secondary],Math.floor(r.need/2));
 let left=target-C.trainingTotal(p);
 for(const k of C.STATS){if(left<=.001)break;const room=C.trainingCap(p,k)-p.training[k],take=Math.min(left,Math.max(0,room));p.training[k]+=take;left-=take;}
 assert(left<=.01,`cannot distribute training witness ${C.catalog[from].name}->${C.catalog[r.to].name}`);
 p.stageBattles=r.battleNeed||0;p.stageWins=Math.max(r.winNeed||0,Math.ceil((r.winRatioMin||0)*p.stageBattles-1e-12));
 return p;
}
let count=0;const unreachable=[],seenRoutes=new Set();
for(const s of C.catalog){for(const egg of C.eggs){for(const route of C.evolutionRoutes({speciesId:s.id,eggId:egg.id})){
 const key=JSON.stringify([s.id,egg.id,route.to,route.penc||false,route.careMin,route.careMax,route.effortMin,route.effortMax,route.battleNeed,route.winRatioMin]);if(seenRoutes.has(key))continue;seenRoutes.add(key);
 const p=witness(s.id,egg.id,route);if(!C.eligible(p,route))unreachable.push([s.name,C.catalog[route.to].name,egg.id,route]);count++;
}}}
assert.deepEqual(unreachable,[]);assert.equal(C.colosseum.length,C.catalog.length);assert.equal(new Set(C.colosseum.map(s=>s.id)).size,C.catalog.length);
for(let id=0;id<C.catalog.length;id++){const x={species:id,stats:C.PROFILES[id].stats},y={species:(id+1)%C.catalog.length,stats:C.PROFILES[(id+1)%C.catalog.length].stats},one=B.fight(x,y,42,false),two=B.fight(x,y,42,false);assert.deepEqual(one,two);assert(one.duration<=180);assert(one.hp.every(v=>v>=0));assert(/^https:\/\//.test(C.PROFILES[id].source));if(id<134)assert(C.PROFILES[id].source.startsWith('https://digimon.net/'));}
const sim=new B.BattleSim([old,{species:3,stats:C.PROFILES[3].stats}],4321),before=sim.fighters.map(x=>x.x);for(let i=0;i<100;i++)sim.step();assert(sim.fighters.some((x,i)=>x.x!==before[i]));
assert(sim.fighters.some((x,i)=>x.y!==[225,130][i]));
// Force hesitation in a controlled fixture to verify the duration and repeat guard.
const behavior=C.PROFILES[2].behavior,prior=behavior.disobedienceChance;behavior.disobedienceChance=1;
const h=new B.BattleSim([{species:2,stats:C.PROFILES[2].stats},{species:2,stats:C.PROFILES[2].stats}],19);for(let i=0;i<600&&!h.done;i++)h.step();behavior.disobedienceChance=prior;
for(const actor of [0,1]){const ev=h.events.filter(e=>e.type==='disobey'&&e.actor===actor);assert(ev.length>=2);for(let i=1;i<ev.length;i++)assert(ev[i].time-ev[i-1].time>=17-.001);}
const healer=new B.BattleSim([{species:76,stats:C.PROFILES[76].stats},{species:10,stats:C.PROFILES[10].stats}],15);healer.fighters[0].hp=healer.fighters[0].stats.hp*.3;for(let i=0;i<600&&!healer.done;i++)healer.step();assert(healer.events.some(e=>e.type==='heal'&&e.actor===0));
console.log('PASS: independent pets, slot cap, training/rest, food reservation, medicine/clean, no death, saves, continuous evolution, '+count+' route witnesses, '+C.catalog.length+' deterministic combat profiles.');
