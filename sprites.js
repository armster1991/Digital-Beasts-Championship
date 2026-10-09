'use strict';
(()=>{
const legacySheet=new Image(),pencSheet=new Image();
legacySheet.src=DM20_SPRITE_DATA;pencSheet.src=(typeof DBC_PENC_SPRITE_DATA!=='undefined'?DBC_PENC_SPRITE_DATA:'assets/penc-sprites.png');
const spriteFrames=new Map(),outlinedSprites=new Set([26,28,46,60]);
function frameKey(id,f){return id+':'+f;}
function canvasFromData(d){const cv=document.createElement('canvas');cv.width=cv.height=16;cv.getContext('2d').putImageData(d,0,0);return cv;}
function prepareLegacy(){if(!legacySheet.naturalWidth)return;const raw=document.createElement('canvas');raw.width=legacySheet.naturalWidth;raw.height=legacySheet.naturalHeight;const rc=raw.getContext('2d',{willReadFrequently:true});rc.drawImage(legacySheet,0,0);
 for(const s of Champ.catalog){if(s.sprite.sheet==='penc')continue;const frames=s.sprite.frames||4,step=s.sprite.step||20;for(let f=0;f<frames;f++){const d=rc.getImageData(s.sprite.x+f*step,s.sprite.y,16,16),black=new Uint8Array(256),outside=new Uint8Array(256),q=[];for(let i=0;i<256;i++)black[i]=d.data[i*4]<8&&d.data[i*4+1]<8&&d.data[i*4+2]<8;
  const push=i=>{if(black[i]&&!outside[i]){outside[i]=1;q.push(i)}};for(let n=0;n<16;n++){push(n);push(240+n);push(n*16);push(n*16+15);}for(let n=0;n<q.length;n++){const i=q[n],x=i%16,y=i>>4;if(x)push(i-1);if(x<15)push(i+1);if(y)push(i-16);if(y<15)push(i+16);}
  for(let i=0;i<256;i++){let keep=!outside[i];if(!keep&&outlinedSprites.has(s.id)){const x=i%16,y=i>>4;keep=(x>0&&!black[i-1])||(x<15&&!black[i+1])||(y>0&&!black[i-16])||(y<15&&!black[i+16]);}if(s.id===60&&(i>>4)===[9,8,10,14][f]&&i%16>=6&&i%16<=9)keep=true;d.data[i*4+3]=keep?255:0;}
  spriteFrames.set(frameKey(s.id,f),canvasFromData(d));}}
}
function preparePenc(){if(!pencSheet.naturalWidth)return;const raw=document.createElement('canvas');raw.width=pencSheet.naturalWidth;raw.height=pencSheet.naturalHeight;const rc=raw.getContext('2d',{willReadFrequently:true});rc.drawImage(pencSheet,0,0);
 for(const s of Champ.catalog){if(s.sprite.sheet!=='penc')continue;const frames=s.sprite.frames||12,step=s.sprite.step||16;for(let f=0;f<frames;f++){const d=rc.getImageData(s.sprite.x+f*step,s.sprite.y,16,16);spriteFrames.set(frameKey(s.id,f),canvasFromData(d));}}
}
legacySheet.onload=prepareLegacy;pencSheet.onload=preparePenc;if(legacySheet.complete&&legacySheet.naturalWidth)prepareLegacy();if(pencSheet.complete&&pencSheet.naturalWidth)preparePenc();
function semanticFrame(id,state='idle',tick=0){const s=Champ.catalog[id];if(!s)return 0;const modern=s.sprite.frames>=12||s.sprite.sheet==='penc',alt=Math.abs(Math.floor(tick))%2;if(modern){const map={idle:alt,walk:alt,eat:2+alt,sleep:4+alt,refuse:6,happy:7,angry:8,hurt:9,sad:10,attack:11,train:alt?11:0};return map[state]??alt;}const map={idle:alt,walk:alt,eat:alt?2:0,sleep:3,refuse:1,happy:1,angry:2,hurt:3,sad:3,attack:2,train:alt?2:0};return Math.min((s.sprite.frames||4)-1,map[state]??alt);}
function drawSprite(c,id,frame,x,y,scale=6,flip=false,alpha=1){flip=!flip;const s=Champ.catalog[id];if(!s)return;frame=Math.max(0,Math.min((s.sprite.frames||4)-1,frame|0));const frameCanvas=spriteFrames.get(frameKey(id,frame));if(!frameCanvas)return;c.save();c.globalAlpha=alpha;c.imageSmoothingEnabled=false;c.translate(Math.round(x),Math.round(y));if(flip)c.scale(-1,1);c.drawImage(frameCanvas,flip?-16*scale:0,0,16*scale,16*scale);c.restore();}
globalThis.ChampSprites={draw:drawSprite,frame:semanticFrame};
})();
