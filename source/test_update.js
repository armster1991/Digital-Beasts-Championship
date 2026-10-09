const assert=require('node:assert/strict'),C=require('../engine');
const g=new C.Game(),p=g.adopt('ver1');g.evolve(p,2);p.hunger=100;p.stageAge=0;g.drop(p.instanceId,950,240);
p.training.attack=C.trainingCap(p,'attack');const before={...p.training};g.train(p);assert.deepEqual(p.training,before);
p.training.attack=0;p.training.defense=C.budget(C.stage(p))*.6;p.training.speed=C.budget(C.stage(p))*.4;g.train(p);assert.equal(p.training.attack,1.5);assert.equal(C.STATS.reduce((n,k)=>n+p.training[k],0),C.budget(C.stage(p)));
assert(!g.medicine(p.instanceId));p.sick=true;assert(g.medicine(p.instanceId));
g.food(150,240);p.hunger=0;g.advance(3);assert.equal(g.s.food[0].reserved,null);assert(p.x>=900&&p.x<1200);assert.equal(g.clean(150,240),1);
p.stageAge=C.TIMES[C.stage(p)]+119;assert.equal(C.hints(p),null);p.stageAge++;assert(C.hints(p));
// Recover a complete but wrong allocation through ordinary half-speed training.
let checked=0;for(const species of C.catalog)for(const egg of C.eggs){const q={...p,speciesId:species.id,eggId:egg.id,stageAge:0};for(const r of C.evolutionRoutes(q).filter(r=>!r.care&&r.need)){q.training=Object.fromEntries(C.STATS.map(k=>[k,0]));const others=C.STATS.filter(k=>k!==r.primary&&k!==r.secondary);const b=C.budget(C.stage(q));q.training[others[0]]=b*.6;q.training[others[1]]=b*.4;for(const [k,n]of [[r.primary,r.need],[r.secondary,Math.floor(r.need/2)]]){q.zone=k;for(let i=0;i<100&&q.training[k]<n;i++){q.hunger=100;q.fatigue=0;g.train(q);}assert(q.training[k]>=n);}assert(q.training[r.primary]>=r.need);assert(C.STATS.reduce((n,k)=>n+q.training[k],0)<=b+.001);checked++;}}
console.log('PASS update: cap, half-speed redistribution, medicine, cage boundary, leftovers, tips, '+checked+' wrong-allocation recoveries');
