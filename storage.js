'use strict';
(function(root){
  const CACHE_KEY='db-championship-save-v1';
  const SETTINGS_KEY='db-championship-settings-v1';
  const MAGIC='DB-CHAMPIONSHIP-SAVE';
  const navLang=typeof navigator!=='undefined'?(navigator.language||'en'):'en';
  const defaults={lang:'en',music:true,volume:.10,sfxVolume:.10};
  function safeParse(raw){try{return JSON.parse(raw);}catch{return null;}}
  // Obfuscation + corruption detection, not encryption or tamper-proof anti-cheat.
  const PREFIX='DBCSAVE1:';
  function checksum(bytes){let h=2166136261;for(const b of bytes)h=Math.imul(h^b,16777619);return (h>>>0).toString(16).padStart(8,'0');}
  function encode(value){const bytes=new TextEncoder().encode(JSON.stringify(value)),salt=new Uint8Array(16);crypto.getRandomValues(salt);const out=new Uint8Array(bytes.length+16);out.set(salt);for(let i=0;i<bytes.length;i++)out[i+16]=bytes[i]^salt[i%16]^((i*31+137)&255);let raw='';for(const b of out)raw+=String.fromCharCode(b);return PREFIX+checksum(bytes)+':'+btoa(raw);}
  function decode(text){if(typeof text!=='string'||text.length>2000000)throw Error('invalidSave');if(!text.startsWith(PREFIX)){const legacy=safeParse(text);if(!legacy)throw Error('invalidSave');return legacy;}const parts=text.slice(PREFIX.length).split(':');if(parts.length!==2)throw Error('invalidSave');const raw=atob(parts[1]);if(raw.length<17)throw Error('invalidSave');const bytes=new Uint8Array(raw.length-16);for(let i=0;i<bytes.length;i++)bytes[i]=raw.charCodeAt(i+16)^raw.charCodeAt(i%16)^((i*31+137)&255);if(checksum(bytes)!==parts[0])throw Error('invalidSave');return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));}
  function loadCache(){try{const raw=localStorage.getItem(CACHE_KEY);return raw?decode(raw):null;}catch{return null;}}
  function saveCache(state){try{localStorage.setItem(CACHE_KEY,encode(state));return true;}catch{return false;}}
  function clearCache(){try{localStorage.removeItem(CACHE_KEY);return true;}catch{return false;}}
  function loadSettings(){try{return {...defaults,...(safeParse(localStorage.getItem(SETTINGS_KEY))||{})};}catch{return {...defaults};}}
  function saveSettings(s){try{localStorage.setItem(SETTINGS_KEY,JSON.stringify({...defaults,...s}));return true;}catch{return false;}}
  function packet(state,settings){return {magic:MAGIC,created:new Date().toISOString(),state,settings:{...defaults,...settings}};}
  function download(state,settings){
    const blob=new Blob([encode(packet(state,settings))],{type:'application/octet-stream'});
    const a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download='DBCsave.dbcsave';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  async function readFile(file){if(file.size>2000000)throw Error('invalidSave');const text=await file.text();const p=decode(text);if(!p||p.magic!==MAGIC||!p.state)throw new Error('invalidSave');return p;}
  root.DMStore={CACHE_KEY,SETTINGS_KEY,MAGIC,defaults,encode,decode,loadCache,saveCache,clearCache,loadSettings,saveSettings,download,readFile};
})(globalThis);
