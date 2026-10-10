'use strict';
(function(root,factory){const api=factory(root.CHAMP_DATA||(typeof require==='function'?require('./profiles.js'):null));if(typeof module!=='undefined')module.exports=api;root.ChampBattle=api;})(globalThis,function(P){
const DT=.1,SUDDEN_AT=90,MAX_TIME=135,keys=['hp','tp','attack','defense','wisdom','speed'];
function seeded(seed){let x=seed|0||1;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};}
function canonical(f){const p=P[f?.species];if(!p||!f.stats||!keys.every(k=>Number.isFinite(f.stats[k])&&f.stats[k]>=p.stats[k]&&f.stats[k]<=p.stats[k]+240*(k==='hp'?5:k==='tp'?2:1)))throw Error('badFighter');const gains=keys.reduce((n,k)=>n+(f.stats[k]-p.stats[k])/(k==='hp'?5:k==='tp'?2:1),0),budgets=[0,12,30,90,160,250,360,480],extra=[0,0,18,60,70,90,110,0],budget=budgets[p.stage]+extra[p.stage];if(gains>budget+3)throw Error('badFighter');return{species:f.species,stats:Object.fromEntries(keys.map(k=>[k,Math.round(f.stats[k])]))};}
// Fixed, player-independent Coliseum curve. Species tendencies remain visible.
function colosseumOpponent(f,round){
 const r=Math.max(1,Math.min(P.length,Math.floor(round))),st=P[f.species].stage;
 const stats={...f.stats};
 if(st<=2){const progress=Math.min(1,(r-1)/19),floor={hp:145+progress*45,tp:28+progress*20,attack:16+progress*5,defense:12+progress*6,wisdom:16+progress*5,speed:20+progress*8};
 for(const k of keys)stats[k]=Math.round(floor[k]+stats[k]*(k==='hp'?.25:.45));
 }else{const gain=1.04+Math.min(.10,(r-21)*.0015);for(const k of keys)stats[k]=Math.round(stats[k]*gain);}
 return{species:f.species,stats};
}
// Search a small deterministic fan for a retreat/orbit vector that stays on the field.
function retreat(a,b,amount){
 const dx=a.x-b.x,dy=a.y-b.y,base=Math.atan2(dy,dx),dist=Math.hypot(dx,dy);
 a.orbitSign??=a.y<167.5?1:-1;let best=null;for(const offset of [0,.45,.9,1.35,1.8,2.25,2.7,Math.PI].map(v=>v*a.orbitSign)){
  const x=Math.max(30,Math.min(570,a.x+Math.cos(base+offset)*amount)),y=Math.max(65,Math.min(270,a.y+Math.sin(base+offset)*amount));
  const travel=Math.hypot(x-a.x,y-a.y),separation=Math.hypot(x-b.x,y-b.y)-dist;
  const edge=Math.min(x-30,570-x,y-65,270-y),score=travel*1.6+separation*.65+Math.min(30,edge)*.25+((x-a.x)*(a.retreatDX||0)+(y-a.y)*(a.retreatDY||0))*2;
  if(!best||score>best.score)best={x,y,score};
 }const moved=Math.hypot(best.x-a.x,best.y-a.y);if(moved>.001){a.retreatDX=(best.x-a.x)/moved;a.retreatDY=(best.y-a.y)/moved;}a.x=best.x;a.y=best.y;
}
const advantage=(a,b)=>(a==='Vaccine'&&b==='Virus')||(a==='Virus'&&b==='Data')||(a==='Data'&&b==='Vaccine');
class BattleSim{
 constructor(fighters,seed,options={}){if(!Array.isArray(fighters)||fighters.length!==2)throw Error('badFighter');this.rng=seeded(seed);this.time=0;this.sudden=false;this.done=false;this.winner=null;this.projectiles=[];this.events=[];this.fighters=fighters.map((f,i)=>{f=canonical(f);if(i===1&&options.colosseumRound)f=colosseumOpponent(f,options.colosseumRound);return {...f,hp:f.stats.hp,tp:f.stats.tp,x:i?500:100,y:i?130:225,action:'idle',cooldown:.3+i*.1,disobeyUntil:0,disobeyReady:0,guardUntil:0,evadeUntil:0,defensiveReady:0};});}
 event(type,actor,amount=0){this.events.push({type,actor,amount,time:this.time});}
 damage(at,df,special){const a=this.fighters[at],b=this.fighters[df],A=P[a.species],B=P[b.species];const dodge=(this.time<b.evadeUntil?.28:Math.min(.12,.025+b.stats.speed/(a.stats.speed+b.stats.speed)*.10))*(this.sudden?.5:1);if(this.rng()<dodge){this.event('miss',at);return;}const offense=special?a.stats.wisdom*.8+a.stats.attack*.35:a.stats.attack,armor=(special?b.stats.defense*.35+b.stats.wisdom*.3:b.stats.defense)*(this.sudden?.5:1);let damage=Math.max(2,offense*.42*(100/(100+armor*.65))+3);damage*=advantage(A.attribute,B.attribute)?1.22:1;if(this.time<b.guardUntil)damage*=.7;damage*=.85+this.rng()*.3;damage=Math.max(1,Math.round(damage));b.hp=Math.max(0,b.hp-damage);this.event(special?'special':'hit',at,damage);if(b.hp===0){this.done=true;this.winner=at;}}
 step(){if(this.done)return;this.time=Math.round((this.time+DT)*10)/10;if(!this.sudden&&this.time>=SUDDEN_AT){this.sudden=true;for(const f of this.fighters){for(const k of ['disobeyUntil','disobeyReady','guardUntil','evadeUntil','defensiveReady'])f[k]=this.time+Math.max(0,f[k]-this.time)/2;}this.event('suddenDeath',0);}const rate=this.sudden?2:1,dt=DT*rate;for(const shot of this.projectiles){const b=this.fighters[shot.target],dx=b.x-shot.x,dy=b.y-shot.y,d=Math.hypot(dx,dy),step=Math.min(d,dt*240);if(d>0){shot.x+=dx/d*step;shot.y+=dy/d*step;}if(Math.hypot(shot.x-b.x,shot.y-b.y)<10){this.damage(shot.actor,shot.target,true);shot.done=true;if(this.done)break;}}this.projectiles=this.projectiles.filter(p=>!p.done);if(this.done)return;
 for(let i=0;i<this.fighters.length;i++){const a=this.fighters[i],b=this.fighters[1-i],profile=P[a.species].behavior;a.cooldown=Math.max(0,a.cooldown-dt);if(this.time<a.disobeyUntil){a.action='disobey';continue;}const dx=b.x-a.x,dy=b.y-a.y,distance=Math.hypot(dx,dy),ux=dx/(distance||1),uy=dy/(distance||1),range=a.tp<8?35:Math.min(profile.preferredRange,P[a.species].specialRange),speed=(25+Math.sqrt(a.stats.speed)*5)*(.8+profile.aggression*.4);let direction=0;if(distance>range+15)direction=1;else if(distance<range-15&&range>50)direction=-1;if(direction){if(direction<0){const chase=(25+Math.sqrt(b.stats.speed)*5)*(.8+P[b.species].behavior.aggression*.4);retreat(a,b,Math.min(speed*.65,chase*.8)*dt);}else{a.x=Math.max(30,Math.min(570,a.x+ux*speed*dt));a.y=Math.max(65,Math.min(270,a.y+uy*speed*dt));}a.action=direction===1?'approach':'reposition';}else a.action='idle';if(a.cooldown>0)continue;
 if(this.time>=a.disobeyReady&&this.rng()<profile.disobedienceChance){a.action='disobey';a.disobeyUntil=this.time+2/rate;a.disobeyReady=this.time+17/rate;a.cooldown=2;this.event('disobey',i);continue;}
 const options=[['melee',profile.meleeWeight],['special',a.tp>=8?profile.specialWeight*(1+Math.min(.3,a.stats.wisdom/500)):0],['heal',a.hp<a.stats.hp*.7&&a.tp>=12?profile.healWeight:0],['defend',this.time>=a.defensiveReady?profile.defendWeight*.5:0],['evade',this.time>=a.defensiveReady?profile.evadeWeight*.4:0]];let choice=this.rng()*options.reduce((n,x)=>n+x[1],0),action='melee';for(const [key,w]of options){choice-=w;if(choice<0){action=key;break;}}
 if(action==='melee'){if(distance>42){a.x=Math.max(30,Math.min(570,a.x+ux*speed*dt*2));a.y=Math.max(65,Math.min(270,a.y+uy*speed*dt*2));a.cooldown=.1;a.action='approach';continue;}this.damage(i,1-i,false);}
 if(action==='special'){if(distance>P[a.species].specialRange){a.cooldown=.2;continue;}a.tp-=8;if(P[a.species].specialRange<=45)this.damage(i,1-i,true);else this.projectiles.push({actor:i,target:1-i,x:a.x,y:a.y,color:P[a.species].color});}
 if(action==='heal'){a.tp-=12;const amount=Math.min(a.stats.hp-a.hp,Math.round(a.stats.hp*.10+a.stats.wisdom*.15));a.hp+=amount;this.event('heal',i,amount);}
 if(action==='defend'){a.guardUntil=this.time+1.1/rate;a.defensiveReady=this.time+4/rate;}
 if(action==='evade'){a.evadeUntil=this.time+.8/rate;a.defensiveReady=this.time+4/rate;retreat(a,b,12);}
 a.action=action;a.cooldown=Math.max(.65,1.65-Math.min(.8,a.stats.speed/350))*(.85+this.rng()*.3);if(this.done)break;
 }
 if(this.time>=MAX_TIME&&!this.done){const ratios=this.fighters.map(f=>f.hp/f.stats.hp);this.winner=ratios[0]===ratios[1]?(this.rng()<.5?0:1):ratios[0]>ratios[1]?0:1;this.done=true;this.event('timeout',this.winner);}}
 snapshot(){return{time:this.time,sudden:this.sudden,fighters:this.fighters.map(f=>({...f,stats:{...f.stats}})),projectiles:this.projectiles.map(p=>({...p})),events:this.events.slice(-3),done:this.done,winner:this.winner};}
}
function fight(a,b,seed=1,frames=true,options={}){const sim=new BattleSim([a,b],seed,options),out=[];if(frames)out.push(sim.snapshot());while(!sim.done){sim.step();if(frames)out.push(sim.snapshot());}return{winner:sim.winner,duration:sim.time,frames:out,hp:sim.fighters.map(f=>f.hp),fighters:[canonical(a),canonical(b)]};}
return{DT,SUDDEN_AT,MAX_TIME,BattleSim,fight,canonical,colosseumOpponent,retreat};
});
