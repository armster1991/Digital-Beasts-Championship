'use strict';
(function(root,factory){
  const api=factory(
    root.DM20_DATA||(typeof require==='function'?require('./data.js'):null),
    root.CHAMP_DATA||(typeof require==='function'?require('./profiles.js'):null)
  );
  if(typeof module!=='undefined')module.exports=api;
  root.Champ=api;
})(globalThis,function(DATA,PROFILES){
const STATS=['hp','tp','attack','defense','wisdom','speed'];
const TIMES=[30,180,420,900,1500,2100,2700,0];
const VERSION=3,EDITION='digital-beasts-championship';
const catalog=DATA.species,eggs=DATA.eggs,clone=x=>JSON.parse(JSON.stringify(x)),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

// Championship relationships verified against its gameplay tables; AP becomes training.
const wcRoutes={4:[{to:27},{to:111,battleGate:true}],5:[{to:75,battleGate:true},{to:27}],22:[{to:60}],53:[{to:60}],125:[{to:36}]};
const budget=stage=>[0,12,30,90,160,250,360,480][stage]||0;
const stageAllowance=stage=>Math.max(0,budget(stage)-budget(stage-1));
const extraTrainingCap=stage=>stage>=2&&stage<=6?stageAllowance(stage):0;
const mortalityMax=stage=>[0,3,4,5,6,7,8,9][stage]||0;
const zones=['rest',...STATS],zoneWidth=300,worldWidth=zones.length*zoneWidth;

function stableEggStart(p,s){
  const e=eggs.find(x=>x.id===p.eggId),starts=e?.starts||[];
  if(!starts.length)return null;
  let h=(s.seed|0)^2166136261;
  for(const ch of String(p.instanceId)+'|'+p.eggId)h=Math.imul(h^ch.charCodeAt(0),16777619);
  return starts[(h>>>0)%starts.length];
}
function blankTraining(){return Object.fromEntries(STATS.map(k=>[k,0]));}
function blankCareState(){return {hunger:{clock:0,counted:false},fatigue:{clock:0,counted:false},medical:{clock:0,counted:false}};}
function normalizeSave(input){
  if(!input||input.edition!==EDITION||![1,2,VERSION].includes(input.version))return null;
  const oldVersion=input.version,legacy=oldVersion===1,s=clone(input);
  if(!Array.isArray(s.album)||s.album.length>catalog.length)return null;
  while(s.album.length<catalog.length)s.album.push(0);
  if(!Array.isArray(s.unlockedEggs)||s.unlockedEggs.length>eggs.length)return null;
  while(s.unlockedEggs.length<eggs.length)s.unlockedEggs.push(false);
  if(!Array.isArray(s.pets))return null;
  for(const p of s.pets){
    const e=eggs.find(x=>x.id===p?.eggId);
    if(!e)return null;
    if(!Number.isInteger(p.hatchSpeciesId)||!e.starts.includes(p.hatchSpeciesId))p.hatchSpeciesId=legacy?e.starts[0]:stableEggStart(p,s);
    p.training=Object.fromEntries(STATS.map(k=>[k,Number.isFinite(p.training?.[k])?p.training[k]:0]));
    if(!p.stageTraining||!STATS.every(k=>Number.isFinite(p.stageTraining[k])))p.stageTraining=clone(p.training);
    p.stageTrainingLegacy=oldVersion<3?true:!!p.stageTrainingLegacy;
    p.extraTrainingSpent=Number.isFinite(p.extraTrainingSpent)?Math.max(0,p.extraTrainingSpent):0;
    p.mortality=Number.isFinite(p.mortality)?Math.max(0,Math.floor(p.mortality)):0;
    p.mortalityClock=Number.isFinite(p.mortalityClock)?Math.max(0,p.mortalityClock):0;
    p.dead=!!p.dead;
    const cs=p.careState||{},fresh=blankCareState();
    for(const key of Object.keys(fresh))fresh[key]={clock:Number.isFinite(cs[key]?.clock)?Math.max(0,cs[key].clock):0,counted:!!cs[key]?.counted};
    p.careState=fresh;
    const st=p.speciesId===null?0:catalog[p.speciesId]?.stage||0,mm=mortalityMax(st);
    if(!mm){p.mortality=0;p.mortalityClock=0;p.dead=false;}
    else{p.mortality=Math.min(mm,p.mortality);if(p.mortality>=mm)p.dead=true;}
    if(!Number.isFinite(p.neglectClock))p.neglectClock=0;
  }
  if(s.colosseum){
    s.colosseum.round=clamp(Math.floor(s.colosseum.round||1),1,catalog.length);
    s.colosseum.best=clamp(Math.floor(s.colosseum.best||0),0,catalog.length);
  }
  s.version=VERSION;
  return s;
}
function fresh(){return {version:VERSION,edition:EDITION,seed:123456789^(Date.now()>>>0),nextId:1,pets:[],food:[],waste:[],clock:0,album:Array(catalog.length).fill(0),unlockedEggs:eggs.map(e=>!!e.unlocked),overall:{battles:0,wins:0,netBattles:0,netWins:0},colosseum:{round:1,best:0,clears:0}};}
function stats(p){const base=PROFILES[p.speciesId]?.stats||{hp:20,tp:5,attack:1,defense:1,wisdom:1,speed:1};return Object.fromEntries(STATS.map(k=>[k,Math.round(base[k]+(p.training[k]||0)*(k==='hp'?5:k==='tp'?2:1))]));}
function stage(p){return p.speciesId===null?0:catalog[p.speciesId].stage;}
function trainingTotal(p){return STATS.reduce((n,k)=>n+(p.training[k]||0),0);}
function stageTrainingTotal(p){return STATS.reduce((n,k)=>n+(p.stageTraining?.[k]||0),0);}
function effortHearts(p){
  const st=stage(p),b=p.stageTrainingLegacy?budget(st):stageAllowance(st);
  return b?Math.max(0,Math.min(4,Math.floor(stageTrainingTotal(p)/(b/4)+1e-9))):0;
}
function stageWinRatio(p){return p.stageBattles>0?p.stageWins/p.stageBattles:0;}
function evolutionRoutes(p){
  let raw=[...(DATA.routes[String(p.speciesId)]||[]),...(wcRoutes[p.speciesId]||[])].filter(r=>!r.egg||r.egg===p.eggId);
  if(raw.some(r=>!r.penc&&r.egg===p.eggId))raw=raw.filter(r=>r.penc||r.egg===p.eggId);
  const used=new Set(),targets=new Set();
  return raw.filter(r=>{if(targets.has(r.to))return false;targets.add(r.to);return true;}).map(r=>{
    const profile=PROFILES[r.to],st=stage(p),care=!!r.fallback;
    let [primary,secondary]=profile.specialization;
    if(used.has(primary+':'+secondary))secondary=STATS.find(k=>k!==primary&&!used.has(primary+':'+k))||secondary;
    used.add(primary+':'+secondary);
    if(r.penc){const defaultNeed=st<2?0:st===2?2:st===3?6:st===4?10:st===5?14:18;return {...r,need:r.specNeed??defaultNeed,primary,secondary,care:false,winNeed:0,battleNeed:r.stageBattlesMin||0};}
    return {...r,need:st<2?0:st===2?6:st===3?12:st===4?20:28,primary,secondary,care,winNeed:r.battleGate?3:0,battleNeed:r.stageBattlesMin?5:0};
  });
}
const reachabilityCache=new Map();
function reachableSpeciesForEgg(eggId){
  if(reachabilityCache.has(eggId))return reachabilityCache.get(eggId);
  const e=eggs.find(x=>x.id===eggId),seen=new Set(),queue=[...(e?.starts||[])];
  while(queue.length){const id=queue.shift();if(seen.has(id)||!catalog[id])continue;seen.add(id);for(const r of evolutionRoutes({speciesId:id,eggId}))if(!seen.has(r.to))queue.push(r.to);}
  reachabilityCache.set(eggId,seen);return seen;
}
function evolutionRequirements(targetId){
  const target=catalog[targetId];if(!target)return null;
  const hatch=eggs.map((e,i)=>e.starts.includes(targetId)?{eggId:e.id,eggIndex:i,chance:1/e.starts.length,minAge:TIMES[0]}:null).filter(Boolean);
  if(target.stage===1)return {species:target,hatch,routes:[]};
  const routes=[];
  for(const source of catalog){
    if(source.stage>=target.stage)continue;
    const possibleEggs=eggs.filter(e=>reachableSpeciesForEgg(e.id).has(source.id));if(!possibleEggs.length)continue;
    const variants=new Map();
    for(const e of possibleEggs){
      const liveRoutes=evolutionRoutes({speciesId:source.id,eggId:e.id}),r=liveRoutes.find(x=>x.to===targetId);if(!r)continue;
      const hasLegacyCare=liveRoutes.some(x=>!x.penc&&x.care);
      const training=r.care?[]:[{stat:r.primary,min:r.need||0},{stat:r.secondary,min:Math.floor((r.need||0)/2)}]
        .filter((x,i,a)=>x.min>0&&a.findIndex(y=>y.stat===x.stat)===i)
        .map(x=>({...x,valueMin:Math.round((PROFILES[source.id]?.stats?.[x.stat]||0)+x.min*(x.stat==='hp'?5:x.stat==='tp'?2:1))}));
      const req={fromId:source.id,minAge:TIMES[source.stage]||0,training,care:r.care?{min:3,max:null}:r.penc&&(r.careMin!==undefined||r.careMax!==undefined)?{min:r.careMin??null,max:r.careMax??null}:!r.penc&&hasLegacyCare?{min:null,max:2}:null,effort:r.penc&&(r.effortMin!==undefined||r.effortMax!==undefined)?{min:r.effortMin??null,max:r.effortMax??null}:null,stageWins:r.care?0:(r.winNeed||0),stageBattles:r.care?0:(r.battleNeed||0),winRatio:r.care?0:(r.winRatioMin||0),explicitEgg:!!r.egg,penc:!!r.penc,adaptedJogress:!!r.adaptedJogress};
      const sig=JSON.stringify([req.training,req.care,req.effort,req.stageWins,req.stageBattles,req.winRatio,req.explicitEgg,req.penc,req.adaptedJogress]);
      if(!variants.has(sig))variants.set(sig,{...req,eggIds:[]});
      variants.get(sig).eggIds.push(e.id);
    }
    for(const req of variants.values()){const allEggs=req.eggIds.length===possibleEggs.length;if(allEggs&&!req.explicitEgg)req.eggIds=[];routes.push(req);}
  }
  routes.sort((a,b)=>catalog[a.fromId].stage-catalog[b.fromId].stage||catalog[a.fromId].name.localeCompare(catalog[b.fromId].name)||JSON.stringify(a).localeCompare(JSON.stringify(b)));
  return {species:target,hatch,routes};
}
function trainingCap(p,k){return Math.max(p.training?.[k]||0,Math.min(240,budget(stage(p))*.5));}
function pencStillPossible(p,r){const eh=effortHearts(p);return !(r.careMax!==undefined&&p.careMistakes>r.careMax)&&!(r.effortMax!==undefined&&eh>r.effortMax);}
function evolutionOptions(p){
  const routes=evolutionRoutes(p);if(!routes.length)return [];
  const hasLegacyCare=routes.some(x=>!x.penc&&x.care),eh=effortHearts(p);
  return routes.filter(r=>r.penc?pencStillPossible(p,r):(p.careMistakes>=3&&hasLegacyCare?r.care:!r.care)).map(r=>{
    const primaryNeed=Math.max(0,(r.need||0)-(p.stageTraining?.[r.primary]||0)),secondaryNeed=Math.max(0,Math.floor((r.need||0)/2)-(p.stageTraining?.[r.secondary]||0)),
      missing=STATS.filter(k=>(k===r.primary?r.need:k===r.secondary?Math.floor(r.need/2):0)>(p.stageTraining?.[k]||0)+.001),
      careShort=r.penc?Math.max(0,(r.careMin||0)-p.careMistakes):0,
      effortShort=r.penc?Math.max(0,(r.effortMin||0)-eh):0,
      battleShort=Math.max(0,(r.battleNeed||0)-p.stageBattles),
      ratioShort=r.penc&&r.winRatioMin?Math.max(0,r.winRatioMin-stageWinRatio(p)):0,
      winShort=Math.max(0,(r.winNeed||0)-p.stageWins);
    return {r,missing,primaryNeed,secondaryNeed,careShort,effortShort,battleShort,ratioShort,winShort,score:primaryNeed+secondaryNeed+careShort*8+effortShort*5+battleShort*2+ratioShort*20+winShort*3};
  }).sort((a,b)=>a.score-b.score||a.r.to-b.r.to);
}
function closestEvolution(p){return evolutionOptions(p)[0]||null;}
function extraTrainingInfo(p){
  const st=stage(p),cap=extraTrainingCap(st),spent=Math.max(0,p.extraTrainingSpent||0);
  if(p.dead||p.speciesId===null||!cap||trainingTotal(p)<budget(st)-.001||spent>=cap-.001)return null;
  const best=closestEvolution(p);if(!best||best.r.care)return null;
  const allowed=blankTraining(),hardRoom=k=>Math.max(0,240-(p.training?.[k]||0));
  let room=cap-spent;
  const add=(k,n)=>{if(!k||n<=.001||room<=.001)return;const gain=Math.min(n,hardRoom(k),room);if(gain>.001){allowed[k]+=gain;room-=gain;}};
  add(best.r.primary,best.primaryNeed);add(best.r.secondary,best.secondaryNeed);
  if(best.effortShort>0&&room>.001){const basis=p.stageTrainingLegacy?budget(st):stageAllowance(st),effortNeed=Math.max(0,(best.r.effortMin||0)*(basis/4)-stageTrainingTotal(p)),direct=STATS.reduce((n,k)=>n+allowed[k],0);add(best.r.primary,Math.max(0,effortNeed-direct));}
  const left=STATS.reduce((n,k)=>n+allowed[k],0);if(left<=.001)return null;
  return {target:best.r.to,stats:STATS.filter(k=>allowed[k]>.001),allowed,left,total:spent+left,spent};
}
function canTrainStat(p,k){
  if(p.dead||p.speciesId===null||!STATS.includes(k))return false;
  const free=Math.max(0,budget(stage(p))-trainingTotal(p)),statFree=Math.max(0,trainingCap(p,k)-p.training[k]);
  if(free>.001&&statFree>.001)return true;
  const extra=extraTrainingInfo(p);return !!extra&&extra.allowed[k]>.001;
}
function hints(p){
  if(p.dead||p.speciesId===null)return null;
  const routes=evolutionRoutes(p);if(!routes.length||routes.some(r=>eligible(p,r)))return null;
  const rescue=extraTrainingInfo(p);if(p.stageAge<TIMES[stage(p)]+60&&!rescue)return null;
  const best=closestEvolution(p);if(!best)return null;
  let kind='tipBattles';if(best.careShort>0)kind='tipCare';else if(best.missing.length||best.effortShort>0)kind='tipStat';else if(best.battleShort>0)kind='tipBattles';else if(best.ratioShort>0||best.winShort>0)kind='tipWins';
  return {stats:best.missing.length?best.missing:[best.r.primary],kind};
}
function eligible(p,r){
  if(p.dead||p.stageAge<TIMES[stage(p)]||p.battleLock)return false;
  const tr=p.stageTraining||{};
  if(r.penc){
    const eh=effortHearts(p);
    if(r.careMin!==undefined&&p.careMistakes<r.careMin)return false;
    if(r.careMax!==undefined&&p.careMistakes>r.careMax)return false;
    if(r.effortMin!==undefined&&eh<r.effortMin)return false;
    if(r.effortMax!==undefined&&eh>r.effortMax)return false;
    if((tr[r.primary]||0)<r.need||(tr[r.secondary]||0)<Math.floor(r.need/2))return false;
    if(p.stageBattles<(r.battleNeed||0))return false;
    if(r.winRatioMin&&stageWinRatio(p)+1e-12<r.winRatioMin)return false;
    return !r.egg||r.egg===p.eggId;
  }
  if(r.care)return p.careMistakes>=3;
  if(p.careMistakes>=3&&evolutionRoutes(p).some(x=>!x.penc&&x.care))return false;
  return (!r.egg||r.egg===p.eggId)&&(tr[r.primary]||0)>=r.need&&(tr[r.secondary]||0)>=Math.floor(r.need/2)&&p.stageWins>=r.winNeed&&p.stageBattles>=r.battleNeed;
}
const colosseum=catalog.slice().sort((a,b)=>a.stage-b.stage||STATS.reduce((n,k)=>n+PROFILES[a.id].stats[k]-PROFILES[b.id].stats[k],0)||a.id-b.id);

class Game{
 constructor(s){this.s=fresh();if(s)this.load(s);this.events=[];}
 valid(input){
  const s=normalizeSave(input);
  if(!s||s.version!==VERSION||s.edition!==EDITION||!Array.isArray(s.pets)||s.pets.length>2||!Array.isArray(s.album)||s.album.length!==catalog.length||!s.album.every(x=>x===0||x===1)||!Array.isArray(s.unlockedEggs)||s.unlockedEggs.length!==eggs.length||!s.unlockedEggs.every(x=>typeof x==='boolean'))return false;
  const finite=(v,a=0,b=1e12)=>Number.isFinite(v)&&v>=a&&v<=b;
  if(!finite(s.clock)||!Number.isInteger(s.nextId)||s.nextId<1||!Number.isInteger(s.seed)||!s.overall||!s.colosseum||!['battles','wins','netBattles','netWins'].every(k=>Number.isInteger(s.overall[k])&&s.overall[k]>=0)||!finite(s.colosseum.round,1,catalog.length)||!finite(s.colosseum.best,0,catalog.length)||!finite(s.colosseum.clears))return false;
  const ids=new Set();
  for(const p of s.pets){
    const e=eggs.find(x=>x.id===p?.eggId),st=p?.speciesId===null?0:catalog[p?.speciesId]?.stage||0,mm=mortalityMax(st);
    if(!p||typeof p.instanceId!=='string'||ids.has(p.instanceId)||!e||!Number.isInteger(p.hatchSpeciesId)||!e.starts.includes(p.hatchSpeciesId)||!(p.speciesId===null||Number.isInteger(p.speciesId)&&catalog[p.speciesId])||!zones.includes(p.zone)||!finite(p.x,0,worldWidth)||!finite(p.y,100,310)||!finite(p.hunger,0,100)||!finite(p.fatigue,0,100)||!p.training||!p.stageTraining||!STATS.every(k=>finite(p.training[k],0,240)&&finite(p.stageTraining[k],0,240))||!['totalAge','stageAge','careMistakes','stageWins','stageBattles','wins','battles','trainingClock','poopClock','sicknessClock','neglectClock','mortality','mortalityClock'].every(k=>finite(p[k]))||!['sick','injured','dead'].every(k=>typeof p[k]==='boolean')||typeof p.stageTrainingLegacy!=='boolean'||!finite(p.extraTrainingSpent,0,extraTrainingCap(st))||!p.careState||!['hunger','fatigue','medical'].every(k=>p.careState[k]&&finite(p.careState[k].clock)&&typeof p.careState[k].counted==='boolean')||p.mortality>mm)return false;
    ids.add(p.instanceId);
    if(trainingTotal(p)>budget(st)+p.extraTrainingSpent+.01||stageTrainingTotal(p)>budget(st)+p.extraTrainingSpent+.01)return false;
  }
  return Array.isArray(s.food)&&s.food.length<=12&&s.food.every(f=>finite(f.x,0,worldWidth)&&finite(f.y,100,310)&&finite(f.age)&&finite(f.bites)&&typeof f.id==='string'&&(f.reserved===null||ids.has(f.reserved)))&&Array.isArray(s.waste)&&s.waste.length<=12&&s.waste.every(w=>finite(w.x,0,worldWidth)&&finite(w.y,100,310));
 }
 load(input){
  const s=normalizeSave(input);if(!s||!this.valid(s))throw Error('invalidSave');this.s=s;
  this.s.pets.forEach(p=>{p.battleLock=false;p.dragging=false;delete p.fullUntil;const zi=zones.indexOf(p.zone);p.x=clamp(p.x,zi*zoneWidth+24,(zi+1)*zoneWidth-24);p.targetX=p.x;p.targetY=p.y;p.action='';delete p.actionStarted;delete p.actionUntil;delete p.evolution;delete p.refuseUntil;});
  this.s.food.forEach(f=>{if(f.reserved&&this.get(f.reserved)?.dead)f.reserved=null;});
  this.refreshUnlocks();
 }
 export(){const s=clone(this.s);s.pets.forEach(p=>{p.battleLock=false;p.dragging=false;delete p.fullUntil;});return s;}
 random(){let x=this.s.seed|0;x^=x<<13;x^=x>>>17;x^=x<<5;this.s.seed=x;return (x>>>0)/4294967296;}
 get(id){return this.s.pets.find(p=>p.instanceId===id);}
 emit(key,p){this.events.push({key,id:p?.instanceId,name:p?.speciesId!==null?catalog[p?.speciesId]?.name:''});}
 refreshUnlocks(){const s=this.s,o=s.overall,c=s.colosseum,n=s.album.reduce((a,b)=>a+b,0);eggs.forEach((e,i)=>{const v=e.metric==='totalWins'?o.wins:e.metric==='album'?n:e.metric==='colosseum'?Math.max(c.best,c.round):e.metric==='colosseumClear'?c.clears:e.metric==='netWinsOrColosseum'?(o.netWins>=e.need||c.best>=90?e.need:0):0;if(e.unlocked||v>=e.need)s.unlockedEggs[i]=true;});}
 adopt(eggId){
  this.refreshUnlocks();const i=eggs.findIndex(e=>e.id===eggId);if(this.s.pets.length>=2||i<0||!this.s.unlockedEggs[i])return null;
  const e=eggs[i],hatchSpeciesId=e.starts[Math.min(e.starts.length-1,Math.floor(this.random()*e.starts.length))];
  const p={instanceId:'pet-'+this.s.nextId++,eggId,hatchSpeciesId,speciesId:null,totalAge:0,stageAge:0,hunger:80,fatigue:0,sick:false,injured:false,dead:false,mortality:0,mortalityClock:0,careState:blankCareState(),x:85+this.s.pets.length*110,y:248,zone:'rest',training:blankTraining(),stageTraining:blankTraining(),stageTrainingLegacy:false,extraTrainingSpent:0,trainingClock:0,poopClock:0,sicknessClock:0,neglectClock:0,careMistakes:0,stageWins:0,stageBattles:0,wins:0,battles:0,face:1,walkClock:0,targetX:100,targetY:248,battleLock:false};
  this.s.pets.push(p);return p;
 }
 delete(id){const p=this.get(id);if(!p||p.battleLock)return false;this.s.pets=this.s.pets.filter(x=>x!==p);this.s.food.forEach(f=>{if(f.reserved===id)f.reserved=null;});return true;}
 drop(id,x,y){const p=this.get(id);if(!p||p.battleLock||p.dead)return;p.x=clamp(x,24,worldWidth-24);p.y=clamp(y,160,290);p.zone=zones[Math.floor(p.x/zoneWidth)];p.targetX=p.x;p.targetY=p.y;p.trainingClock=0;p.dragging=false;}
 food(x,y){this.s.food=this.s.food.filter(f=>f.age<90&&f.bites<1.8);if(this.s.food.length>=6)return false;this.s.food.push({id:'food-'+this.s.nextId++,x:clamp(x,20,worldWidth-20),y:clamp(y,160,290),reserved:null,age:0,bites:0});return true;}
 medicine(id){const p=this.get(id);if(!p||p.speciesId===null||p.battleLock||p.dead||(!p.sick&&!p.injured))return false;p.sick=p.injured=false;p.neglectClock=0;p.careState.medical={clock:0,counted:false};this.emit('healed',p);return true;}
 clean(x,y){const prev=this.s.waste.length+this.s.food.length;this.s.food=this.s.food.filter(f=>Math.hypot(f.x-x,f.y-y)>45);this.s.waste=this.s.waste.filter(w=>Math.hypot(w.x-x,w.y-y)>70);return prev-this.s.waste.length-this.s.food.length;}
 train(p){
  const k=p.zone;if(p.dead||!STATS.includes(k)||p.fatigue>=95||p.hunger<10||p.sick||p.injured)return;
  const free=Math.max(0,budget(stage(p))-trainingTotal(p)),statFree=Math.max(0,trainingCap(p,k)-p.training[k]);
  let gain=Math.min(3,statFree,free),extra=false;
  if(gain<=.0001){const rescue=extraTrainingInfo(p),extraFree=rescue?.allowed?.[k]||0;if(extraFree>.0001){gain=Math.min(3,extraFree,240-p.training[k]);extra=true;}}
  if(gain<=.0001){p.fullUntil=this.s.clock+1.5;return;}
  p.training[k]+=gain;p.stageTraining[k]=(p.stageTraining[k]||0)+gain;if(extra)p.extraTrainingSpent=(p.extraTrainingSpent||0)+gain;
  p.fatigue=clamp(p.fatigue+2.5,0,100);p.hunger=clamp(p.hunger-1.5,0,100);p.action='train';p.actionStarted=this.s.clock;p.actionUntil=this.s.clock+1.5;
 }
 evolve(p,to){
  const from=p.speciesId;p.speciesId=to;p.stageAge=0;p.stageWins=p.stageBattles=p.careMistakes=0;p.hunger=0;p.neglectClock=0;p.trainingClock=0;p.stageTraining=blankTraining();p.stageTrainingLegacy=false;p.extraTrainingSpent=0;delete p.fullUntil;p.mortality=0;p.mortalityClock=0;p.dead=false;p.careState=blankCareState();this.s.album[to]=1;p.evolution={from,to,until:this.s.clock+2.6};this.emit(from===null?'hatched':'evolved',p);this.refreshUnlocks();
 }
 evolutionTarget(p){
  if(p.dead)return null;
  if(p.speciesId===null)return p.stageAge>=TIMES[0]?p.hatchSpeciesId:null;
  const routes=evolutionRoutes(p).filter(r=>eligible(p,r)).sort((a,b)=>{const tr=p.stageTraining||{},score=r=>(tr[r.primary]||0)*2+(tr[r.secondary]||0);return score(b)-score(a)||(b.priority||0)-(a.priority||0)||a.to-b.to;});
  return routes.length?routes[0].to:null;
 }
 tryEvolution(p){const to=this.evolutionTarget(p);if(to!==null)this.evolve(p,to);}
 fighter(id){const p=this.get(id);return p&&p.speciesId!==null&&!p.dead?{species:p.speciesId,stats:stats(p)}:null;}
 canBattle(id){const p=this.get(id);return !!p&&stage(p)>=3&&!p.dead&&!p.battleLock&&!p.sick&&!p.injured&&p.fatigue<95;}
 recordBattle(id,won,mode){
  const p=this.get(id);if(!p)return null;p.battleLock=false;p.battles++;p.stageBattles++;p.fatigue=clamp(p.fatigue+12,0,100);p.hunger=clamp(p.hunger-5,0,100);this.s.overall.battles++;
  if(won){p.wins++;p.stageWins++;this.s.overall.wins++;}else if(this.random()<.12)p.injured=true;
  if(mode==='netplay'){this.s.overall.netBattles++;if(won)this.s.overall.netWins++;}
  if(mode==='colosseum'&&won){const c=this.s.colosseum;c.best=Math.max(c.best,c.round);if(c.round===catalog.length){c.clears++;c.round=1;}else c.round++;}
  this.refreshUnlocks();return this.evolutionTarget(p);
 }
 tickCare(p,key,active,dt){const c=p.careState[key];if(!active){c.clock=0;c.counted=false;return;}if(c.counted)return;c.clock+=dt;if(c.clock>=120){c.clock=120;c.counted=true;p.careMistakes++;this.emit('careMistake',p);}}
 kill(p){if(p.dead)return;p.dead=true;p.mortality=mortalityMax(stage(p));p.mortalityClock=0;p.action='';p.dragging=false;p.battleLock=false;this.s.food.forEach(f=>{if(f.reserved===p.instanceId)f.reserved=null;});this.emit('died',p);}
 advance(dt){if(!Number.isFinite(dt)||dt<=0)return;for(let remain=Math.min(dt,86400);remain>0;){const step=Math.min(.25,remain);this.tick(step);remain-=step;}}
 tick(dt){
  this.s.clock+=dt;
  for(const f of this.s.food)f.age+=dt;
  this.s.food=this.s.food.filter(f=>f.age<90&&f.bites<1.8);
  for(const p of this.s.pets){
   if(p.battleLock||p.dead)continue;
   p.totalAge+=dt;p.stageAge+=dt;
   if(p.speciesId===null){this.tryEvolution(p);continue;}
   p.hunger=clamp(p.hunger-dt/18,0,100);
   if(p.zone==='rest')p.fatigue=clamp(p.fatigue-dt*(95/60),0,100);else p.fatigue=clamp(p.fatigue+dt*.15,0,100);
   p.poopClock+=dt;p.sicknessClock+=dt;
   if(p.poopClock>=480){p.poopClock-=480;if(this.s.waste.length<12)this.s.waste.push({x:p.x,y:p.y+15});}
   if(p.sicknessClock>=900){p.sicknessClock-=900;if(this.random()<.10+Math.min(3,this.s.waste.length)*.10)p.sick=true;}
   const hungry=p.hunger<=0,exhausted=p.fatigue>=95&&p.zone!=='rest',medical=p.sick||p.injured;
   this.tickCare(p,'hunger',hungry,dt);this.tickCare(p,'fatigue',exhausted,dt);this.tickCare(p,'medical',medical,dt);
   const pressure=Math.min(2,(hungry?1:0)+(exhausted?1:0)+(medical?2:0)+(this.s.waste.length>=3?.5:0));
   if(pressure>0){
    p.mortalityClock+=dt*pressure;
    while(p.mortalityClock>=420&&!p.dead){p.mortalityClock-=420;p.mortality++;this.emit('mortalityHit',p);if(p.mortality>=mortalityMax(stage(p)))this.kill(p);}
   }else p.mortalityClock=0;
   if(p.dead)continue;
   if(!p.dragging){
    for(const f of this.s.food)if(f.reserved===p.instanceId&&Math.floor(f.x/zoneWidth)!==zones.indexOf(p.zone))f.reserved=null;
    let food=this.s.food.find(f=>f.reserved===p.instanceId);
    if(!food&&p.hunger<85){food=this.s.food.filter(f=>!f.reserved&&Math.floor(f.x/zoneWidth)===zones.indexOf(p.zone)).sort((a,b)=>Math.abs(a.x-p.x)-Math.abs(b.x-p.x))[0];if(food)food.reserved=p.instanceId;}
    if(food){
     const dx=food.x-p.x,dy=food.y-p.y,len=Math.hypot(dx,dy);
     if(len>8){const move=Math.min(len,dt*65);p.x+=dx/len*move;p.y+=dy/len*move;p.face=dx<0?-1:1;p.action='walk';}
     else{p.action='eat';food.bites+=dt;if(food.bites>=1.8){p.hunger=clamp(p.hunger+35,0,100);p.action='';p.targetX=zones.indexOf(p.zone)*zoneWidth+150;p.targetY=248;}}
    }else{
     const zi=zones.indexOf(p.zone),homeX=zi*zoneWidth+150;
     if(Math.abs(p.x-homeX)>125){p.targetX=homeX;p.targetY=248;}
     p.walkClock=(p.walkClock||0)-dt;
     if(p.walkClock<=0){p.walkClock=3+this.random()*4;p.targetX=zi*zoneWidth+50+this.random()*200;p.targetY=205+this.random()*70;}
     const dx=p.targetX-p.x,dy=p.targetY-p.y,d=Math.hypot(dx,dy),resting=p.zone==='rest'&&p.fatigue>10;
     if(d>3&&!resting){const move=Math.min(d,dt*20);p.x+=dx/d*move;p.y+=dy/d*move;p.face=dx<0?-1:1;p.action='walk';}else p.action=resting?'sleep':'';
     if(p.zone!=='rest'&&Math.abs(p.x-homeX)<130){p.trainingClock+=dt;if(p.trainingClock>=15){p.trainingClock-=15;this.train(p);}}
    }
   }
   this.tryEvolution(p);
  }
 }
}
return {Game,catalog,eggs,STATS,TIMES,VERSION,EDITION,zones,zoneWidth,worldWidth,stats,stage,budget,stageAllowance,extraTrainingCap,mortalityMax,trainingCap,trainingTotal,stageTrainingTotal,effortHearts,stageWinRatio,closestEvolution,extraTrainingInfo,canTrainStat,hints,evolutionRoutes,evolutionRequirements,eligible,colosseum,PROFILES};
});
