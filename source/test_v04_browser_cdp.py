#!/usr/bin/env python3
"""Dependency-light Chromium smoke test for v0.4 using the DevTools protocol."""
from __future__ import annotations
import base64, json, subprocess, tempfile, time, urllib.request
from pathlib import Path
import websocket

ROOT=Path(__file__).resolve().parents[1]
DEBUG_PORT=19223
HTTP_PORT=19331
URL=f'http://127.0.0.1:{HTTP_PORT}/index.html'

def wait_url(url,timeout=12):
    end=time.time()+timeout
    while time.time()<end:
        try:
            with urllib.request.urlopen(url,timeout=.5) as r:return r.read()
        except Exception:time.sleep(.1)
    raise RuntimeError('timeout waiting for '+url)

profile=tempfile.TemporaryDirectory(prefix='dbc-v04-chrome-',ignore_cleanup_errors=True)
server=subprocess.Popen(['python3','-m','http.server',str(HTTP_PORT),'--bind','127.0.0.1','--directory',str(ROOT)],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
wait_url(f'http://127.0.0.1:{HTTP_PORT}/index.html')
chrome=subprocess.Popen([
    '/usr/bin/chromium','--headless=new','--disable-gpu','--no-sandbox','--disable-dev-shm-usage',
    '--allow-file-access-from-files','--remote-allow-origins=*',f'--remote-debugging-port={DEBUG_PORT}',
    f'--user-data-dir={profile.name}','--window-size=1200,900',URL
],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
ws=None
try:
    wait_url(f'http://127.0.0.1:{DEBUG_PORT}/json/version')
    targets=json.loads(wait_url(f'http://127.0.0.1:{DEBUG_PORT}/json'))
    page=next((x for x in targets if x.get('type')=='page' and 'index.html' in x.get('url','')),next(x for x in targets if x.get('type')=='page'))
    ws=websocket.create_connection(page['webSocketDebuggerUrl'],timeout=8,origin='http://127.0.0.1')
    seq=0;exceptions=[];failed=[]
    def call(method,params=None):
        nonlocal_stub=None
        global seq
        seq+=1;ident=seq
        ws.send(json.dumps({'id':ident,'method':method,'params':params or {}}))
        while True:
            msg=json.loads(ws.recv())
            if msg.get('method')=='Runtime.exceptionThrown':exceptions.append(msg)
            if msg.get('method')=='Network.loadingFailed':failed.append(msg)
            if msg.get('id')==ident:
                if 'error' in msg:raise RuntimeError(msg['error'])
                return msg.get('result',{})
    call('Runtime.enable');call('Page.enable');call('Network.enable')
    deadline=time.time()+12
    while True:
        r=call('Runtime.evaluate',{'expression':'document.readyState+"|"+String(!!globalThis.DM20_DATA)+"|"+String(!!globalThis.CHAMP_DATA)+"|"+String(!!globalThis.Champ)+"|"+String(!!globalThis.ChampSprites)+"|scripts="+document.scripts.length','returnByValue':True})
        value=r['result'].get('value','')
        if value=='complete|true|true|true|true|scripts=13':break
        if time.time()>deadline:
            dbg=call('Runtime.evaluate',{'expression':'document.title+"|"+location.href+"|"+document.documentElement.outerHTML.slice(0,300)','returnByValue':True})['result'].get('value','')
            raise AssertionError('app did not finish loading: '+value+' '+dbg)
        time.sleep(.1)
    def ev(expr):
        r=call('Runtime.evaluate',{'expression':expr,'returnByValue':True,'awaitPromise':True})
        if r.get('exceptionDetails'):raise AssertionError(r['exceptionDetails'])
        return r['result'].get('value')
    core=ev('({catalog:Champ.catalog.length,eggs:Champ.eggs.length,version:Champ.VERSION,album:Champ.catalog.filter(Boolean).length})')
    assert core=={'catalog':282,'eggs':15,'version':2,'album':282},core
    settings=ev('(show("settings"),document.querySelector("#panel-content").innerText)')
    assert 'Digital Beasts Championship · v0.4.4' in settings,settings
    egg=ev('''(()=>{let g1=new Champ.Game();g1.s.unlockedEggs.fill(true);g1.random=()=>0;let a=g1.adopt('ver1').hatchSpeciesId;let g2=new Champ.Game();g2.s.unlockedEggs.fill(true);g2.random=()=>.5;let b=g2.adopt('ver1').hatchSpeciesId;return {a,b,n1:Champ.catalog[a].name,n2:Champ.catalog[b].name};})()''')
    assert egg['a']!=egg['b'] and {egg['n1'],egg['n2']}=={'Botamon','Bubbmon'},egg
    image=ev('''new Promise(resolve=>{const i=new Image();i.onload=()=>resolve({ok:true,w:i.naturalWidth,h:i.naturalHeight});i.onerror=()=>resolve({ok:false});i.src='assets/penc-sprites.png?smoke=1';})''')
    assert image=={'ok':True,'w':192,'h':2896},image
    # Give the sheet onload handlers a beat before drawing the prepared frame cache.
    time.sleep(.4)
    sprite=ev('''(()=>{const test=id=>{const c=document.createElement('canvas');c.width=c.height=96;const x=c.getContext('2d');ChampSprites.draw(x,id,ChampSprites.frame(id,'attack',1),8,8,5,false);const d=x.getImageData(0,0,96,96).data;for(let i=3;i<d.length;i+=4)if(d[i])return true;return false};return {legacy:test(1),penc:test(134),upgraded:test(2)};})()''')
    assert sprite=={'legacy':True,'penc':True,'upgraded':True},sprite
    shot=call('Page.captureScreenshot',{'format':'png','captureBeyondViewport':False})['data']
    out=ROOT/'source'/'previews'/'settings-v04.png';out.write_bytes(base64.b64decode(shot))
    bad=[]
    for e in failed:
        p=e.get('params',{});url=p.get('url','')
        if any(url.split('?')[0].endswith(x) for x in ('.js','.css','.png','.html')):bad.append((url,p.get('errorText')))
    assert not bad,bad
    assert not exceptions,exceptions
    print('PASS v0.4 Chromium smoke: 282 catalog, 15 eggs, Settings v0.4.4, dual hatch, legacy/PenC render, atlas 192x2896')
finally:
    try:
        if ws:ws.close()
    except Exception:pass
    chrome.terminate()
    try:chrome.wait(timeout=3)
    except Exception:chrome.kill()
    server.terminate()
    try:server.wait(timeout=2)
    except Exception:server.kill()
    profile.cleanup()
