'use strict';
(()=>{const spriteSheet=new Image();spriteSheet.src=DM20_SPRITE_DATA;
const spriteFrames=new Map(),outlinedSprites=new Set([26,28,46,60]);
function prepareSprites(){const raw=document.createElement('canvas');raw.width=spriteSheet.naturalWidth;raw.height=spriteSheet.naturalHeight;const rc=raw.getContext('2d',{willReadFrequently:true});rc.drawImage(spriteSheet,0,0);
 for(const s of Champ.catalog)for(let f=0;f<4;f++){const d=rc.getImageData(s.sprite.x+f*20,s.sprite.y,16,16),black=new Uint8Array(256),outside=new Uint8Array(256),q=[];for(let i=0;i<256;i++)black[i]=d.data[i*4]<8&&d.data[i*4+1]<8&&d.data[i*4+2]<8;
 const push=i=>{if(black[i]&&!outside[i]){outside[i]=1;q.push(i)}};for(let n=0;n<16;n++){push(n);push(240+n);push(n*16);push(n*16+15);}for(let n=0;n<q.length;n++){const i=q[n],x=i%16,y=i>>4;if(x)push(i-1);if(x<15)push(i+1);if(y)push(i-16);if(y<15)push(i+16);}
 for(let i=0;i<256;i++){let keep=!outside[i];if(!keep&&outlinedSprites.has(s.id)){const x=i%16,y=i>>4;keep=(x>0&&!black[i-1])||(x<15&&!black[i+1])||(y>0&&!black[i-16])||(y<15&&!black[i+16]);}if(s.id===60&&(i>>4)===[9,8,10,14][f]&&i%16>=6&&i%16<=9)keep=true;d.data[i*4+3]=keep?255:0;}
 const cv=document.createElement('canvas');cv.width=cv.height=16;cv.getContext('2d').putImageData(d,0,0);spriteFrames.set(s.id+':'+f,cv);}}
spriteSheet.onload=prepareSprites;if(spriteSheet.complete&&spriteSheet.naturalWidth)prepareSprites();
function drawSprite(c,id,frame,x,y,scale=6,flip=false,alpha=1){flip=!flip;const s=Champ.catalog[id];if(!s)return;frame=Math.max(0,Math.min((s.sprite.frames||4)-1,frame|0));const frameCanvas=spriteFrames.get(id+':'+frame);if(!frameCanvas)return;c.save();c.globalAlpha=alpha;c.imageSmoothingEnabled=false;c.translate(Math.round(x),Math.round(y));if(flip)c.scale(-1,1);c.drawImage(frameCanvas,flip?-16*scale:0,0,16*scale,16*scale);c.restore();}

globalThis.ChampSprites={draw:drawSprite};})();