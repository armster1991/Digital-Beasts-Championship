'use strict';

const CACHE_VERSION='0.5.4';
const CACHE_NAME=`dbc-${CACHE_VERSION}`;
const CORE_ASSETS=[
  './',
  './index.html',
  './manifest.webmanifest',
  './style.css',
  './mobile.css',
  './data.js',
  './profiles.js',
  './engine.js',
  './battle.js',
  './storage.js',
  './i18n.js',
  './champ-i18n.js',
  './netplay.js',
  './sprites.js',
  './art.js',
  './app.js',
  './mobile-ui.js',
  './assets/items.js',
  './assets/sprite-data.js',
  './assets/dm20-sprites.png',
  './assets/penc-sprites.png',
  './assets/pixels.ttf',
  './assets/egg-icon.png',
  './assets/pwa-icon-192.png',
  './assets/pwa-icon-512.png',
  './assets/meat.png',
  './assets/med.png',
  './assets/trash.png',
  './assets/menu.mp3',
  './assets/game.mp3',
  './assets/battle.mp3',
  './assets/victory.mp3',
  './assets/lose.mp3',
  ...Array.from({length:15},(_,i)=>`./assets/egg-${i}.png`)
];
const OPTIONAL_ASSETS=['./assets/grave.png'];

self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE_NAME);
    await Promise.all(CORE_ASSETS.map(async asset=>{
      const url=new URL(asset,self.registration.scope).toString();
      const response=await fetch(new Request(url,{cache:'reload'}));
      if(!response.ok)throw new Error(`Failed to cache ${asset}`);
      await cache.put(url,response);
    }));
    await Promise.allSettled(OPTIONAL_ASSETS.map(async asset=>{
      const url=new URL(asset,self.registration.scope).toString();
      const response=await fetch(new Request(url,{cache:'reload'}));
      if(response.ok)await cache.put(url,response);
    }));
  })());
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key.startsWith('dbc-')&&key!==CACHE_NAME).map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('message',event=>{
  if(event.data?.type==='SKIP_WAITING')self.skipWaiting();
});

function plainRequest(request){return new Request(request.url,{method:'GET',credentials:'same-origin'});}
async function partialFrom(response,rangeHeader){
  const match=/bytes=(\d+)-(\d*)/.exec(rangeHeader||'');
  if(!match)return response;
  const data=await response.arrayBuffer(),size=data.byteLength;
  const start=Math.min(size-1,Number(match[1])||0);
  const end=match[2]?Math.min(size-1,Number(match[2])):size-1;
  if(start>end)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${size}`}});
  const headers=new Headers(response.headers);
  headers.set('Content-Range',`bytes ${start}-${end}/${size}`);
  headers.set('Accept-Ranges','bytes');
  headers.set('Content-Length',String(end-start+1));
  return new Response(data.slice(start,end+1),{status:206,statusText:'Partial Content',headers});
}
async function cacheFirst(request){
  const cache=await caches.open(CACHE_NAME);
  const key=plainRequest(request);
  let response=await cache.match(key);
  if(!response){
    response=await fetch(request);
    if(response&&response.ok)cache.put(key,response.clone()).catch(()=>{});
  }
  if(request.headers.has('range')&&response)return partialFrom(response.clone(),request.headers.get('range'));
  return response;
}

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;
  if(url.pathname.endsWith('/version.json'))return; // Always let the update checker reach the network.
  event.respondWith(cacheFirst(request).catch(async()=>{
    if(request.mode==='navigate')return caches.match(new URL('./index.html',self.registration.scope).toString());
    return Response.error();
  }));
});
