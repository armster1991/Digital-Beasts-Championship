import './profiles.js';
import './battle.js';
const CATALOG=globalThis.CHAMP_DATA.map(p=>({id:p.speciesId,...p}));
export const PROTOCOL=4;
export const ROSTER_VERSION=CATALOG.length;
const LIMIT_ROOMS=24,MAX_CONNECTIONS=96;
const BY_ID=new Map(CATALOG.map(s=>[s.id,s]));
const clean=(s,max)=>typeof s==='string'&&s.trim().length>0&&s.trim().length<=max&&!/[\u0000-\u001f\u007f]/.test(s)?s.trim():null;
const fail=key=>{throw new Error(key)};
const passwordOK=p=>typeof p==='string'&&p.length<=64;
async function digest(s){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s))),x=>x.toString(16).padStart(2,'0')).join('');}
function canonicalFighter(f){const q=globalThis.ChampBattle.canonical(f);if(globalThis.CHAMP_DATA[q.species].stage<3)fail('badFighter');return q;}
export function fight(a,b,seed=1){return globalThis.ChampBattle.fight(a,b,seed,false);}
export class LobbyCore{
 constructor({rooms=[],clients=[],now=()=>Date.now()}={}){this.rooms=new Map(rooms.map(r=>[r.id,r]));this.clients=new Map(clients.map(c=>[c.id,c]));this.now=now;this.out=[];this.prune();}
 send(id,msg){this.out.push({id,message:{v:PROTOCOL,...msg}})} error(id,key){this.send(id,{type:'ERROR',key})}
 list(){return [...this.rooms.values()].map(r=>({id:r.id,name:r.name,host:this.clients.get(r.host)?.nick||'',count:r.members.length,locked:!!r.passwordHash,phase:r.phase}));}
 lists(){for(const c of this.clients.values())if(c.nick&&!c.room)this.send(c.id,{type:'LIST',rooms:this.list()});}
 room(r){for(const id of r.members)this.send(id,{type:'ROOM',room:{id:r.id,name:r.name,host:r.host,phase:r.phase,players:r.members.map(pid=>({id:pid,nick:this.clients.get(pid)?.nick||'',ready:!!r.ready[pid],rematch:!!r.rematch[pid]}))}});}
 prune(){for(const r of [...this.rooms.values()]){if(!this.clients.has(r.host)||this.now()-r.touched>7200000){for(const id of r.members){const c=this.clients.get(id);if(c){c.room=null;this.send(id,{type:'LEFT',key:'roomClosed'});}}this.rooms.delete(r.id);}else{r.members=r.members.filter(id=>this.clients.has(id));if(r.members.length<2&&r.phase!=='lobby'){r.phase='lobby';r.ready={};r.rematch={};r.round=null;}}}}
 connect(id,ip='local'){if(this.clients.size>=MAX_CONNECTIONS)fail('lobbyFull');if([...this.clients.values()].filter(c=>c.ip===ip).length>=6)fail('tooManyConnections');this.clients.set(id,{id,ip,nick:'',room:null,rateAt:this.now(),rate:0,failedAt:0,failed:0});this.send(id,{type:'WELCOME',id,roster:ROSTER_VERSION});}
 leave(id,reason='leftRoom'){const c=this.clients.get(id),r=c&&this.rooms.get(c.room);if(!r){if(c)c.room=null;return;}if(r.host===id){for(const mid of r.members){const mc=this.clients.get(mid);if(mc)mc.room=null;this.send(mid,{type:'LEFT',key:mid===id?'leftRoom':'hostLeft'});}this.rooms.delete(r.id);}else{r.members=r.members.filter(mid=>mid!==id);c.room=null;r.phase='lobby';r.ready={};r.rematch={};r.round=null;this.send(id,{type:'LEFT',key:reason});this.send(r.host,{type:'OPPONENT_LEFT',key:reason==='kicked'?'playerKicked':'opponentLeft'});this.room(r);}this.lists();}
 disconnect(id){this.leave(id);this.clients.delete(id);this.lists();}
 start(r,raw){const fighters=raw.map(canonicalFighter),values=new Uint32Array(1);crypto.getRandomValues(values);const seed=values[0]||1,result=fight(fighters[0],fighters[1],seed);r.phase='battle';r.rematch={};r.round={id:crypto.randomUUID(),seed,fighters,done:[],winner:result.winner,earliest:this.now()+Math.max(0,result.duration-1)*1000};r.ready={};r.touched=this.now();this.room(r);r.members.forEach((id,local)=>this.send(id,{type:'BATTLE_START',round:r.round.id,seed,fighters,local}));this.lists();}
 async handle(id,m){this.prune();const c=this.clients.get(id);if(!c)fail('connectionLost');if(!m||m.v!==PROTOCOL||typeof m.type!=='string')fail('wrongVersion');const now=this.now();if(now-c.rateAt>=10000){c.rateAt=now;c.rate=0;}if(++c.rate>40)fail('slowDown');
  if(m.type==='HELLO'){if(c.room)fail('leaveFirst');const nick=clean(m.nick,24);if(!nick)fail('invalidNickname');c.nick=nick;this.send(id,{type:'LIST',rooms:this.list()});return;}
  if(!c.nick)fail('invalidNickname');if(m.type==='LIST'){this.send(id,{type:'LIST',rooms:this.list()});return;}if(m.type==='LEAVE'){this.leave(id);return;}
  if(m.type==='CREATE'){if(c.room)fail('leaveFirst');if(this.rooms.size>=LIMIT_ROOMS)fail('lobbyFull');const name=clean(m.name,40);if(!name||!passwordOK(m.password))fail('invalidRoom');const rid=crypto.randomUUID(),r={id:rid,name,host:id,members:[id],ready:{},rematch:{},phase:'lobby',round:null,passwordHash:m.password?await digest(rid+'|'+m.password):'',touched:now};this.rooms.set(rid,r);c.room=rid;this.room(r);this.lists();return;}
  if(m.type==='JOIN'){if(c.room)fail('leaveFirst');if(!passwordOK(m.password))fail('invalidRoom');if(now-c.failedAt>60000){c.failedAt=now;c.failed=0;}if(c.failed>=5)fail('slowDown');const r=this.rooms.get(m.id);if(!r)fail('roomClosed');if(r.phase!=='lobby'||r.members.length>=2)fail('roomFull');if(r.passwordHash&&await digest(r.id+'|'+m.password)!==r.passwordHash){c.failed++;fail('wrongPassword');}r.members.push(id);c.room=r.id;r.ready={};r.touched=now;this.room(r);this.lists();return;}
  const r=this.rooms.get(c.room);if(!r||!r.members.includes(id))fail('roomClosed');r.touched=now;
  if(m.type==='KICK'){if(id!==r.host)fail('hostOnly');if(r.phase==='battle')fail('finishFirst');if(m.target===id||!r.members.includes(m.target))fail('roomClosed');this.leave(m.target,'kicked');return;}
  if(m.type==='READY'){if(r.phase!=='lobby'||typeof m.ready!=='boolean')fail('badMessage');r.ready[id]=m.ready?canonicalFighter(m.fighter):null;this.room(r);return;}
  if(m.type==='START'){if(id!==r.host)fail('hostOnly');if(r.phase!=='lobby'||r.members.length!==2||!r.members.every(mid=>r.ready[mid]))fail('bothReady');this.start(r,r.members.map(mid=>r.ready[mid]));return;}
  if(m.type==='DONE'){if(r.phase!=='battle'||!r.round||m.round!==r.round.id)fail('badMessage');if(now+1500<r.round.earliest)fail('battleNotFinished');if(!r.round.done.includes(id))r.round.done.push(id);if(r.round.done.length===2){r.phase='result';for(const mid of r.members)this.send(mid,{type:'RESULT',round:r.round.id,winner:r.round.winner});this.room(r);this.lists();}return;}
  if(m.type==='REMATCH'){if(r.phase!=='result'||m.round!==r.round?.id)fail('badMessage');if(r.rematch[id])return;r.rematch[id]=canonicalFighter(m.fighter);this.room(r);if(r.members.length===2&&r.members.every(mid=>r.rematch[mid]))this.start(r,r.members.map(mid=>r.rematch[mid]));return;}
  fail('badMessage');
 }
}
