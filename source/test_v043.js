'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const app=fs.readFileSync(path.join(ROOT,'app.js'),'utf8');
const css=fs.readFileSync(path.join(ROOT,'style.css'),'utf8');
const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');

global.DMI18N={S:{}};
require(path.join(ROOT,'champ-i18n.js'));
const T=global.CHAMP_TUTORIAL;

assert(T && Array.isArray(T.en) && Array.isArray(T.pt));
assert.equal(T.en.length,12,'English tutorial must have 12 indexed pages');
assert.equal(T.pt.length,12,'Portuguese tutorial must have 12 indexed pages');
for(const [lang,pages] of Object.entries(T)){
  for(const [i,p] of pages.entries()){
    assert(p.short&&p.title&&p.lead,`${lang} tutorial page ${i+1} missing identity text`);
    assert(Array.isArray(p.sections)&&p.sections.length>=3,`${lang} tutorial page ${i+1} is too shallow`);
    for(const sec of p.sections){
      assert(sec.heading);
      assert((sec.paragraphs?.length||0)+(sec.bullets?.length||0)>0);
    }
  }
}
assert.equal(DMI18N.S.tutorial[0],'TUTORIAL');
assert.equal(DMI18N.S.tutorial[1],'TUTORIAL');
assert(DMI18N.S.tutorialIndex&&DMI18N.S.tutorialPrevious&&DMI18N.S.tutorialNext);

// Player-facing copy must not expose implementation jargon.
const tutorialText=JSON.stringify(T).toLowerCase();
for(const banned of ['javascript','source code','código-fonte','protocol 4','protocolo 4','cloudflare worker']){
  assert(!tutorialText.includes(banned),`tutorial leaks implementation jargon: ${banned}`);
}

// Header order and replacement contract.
const tutorialPos=html.indexOf('id="tutorial"'), menuPos=html.indexOf('id="main-menu"'), exitPos=html.indexOf('id="save-exit"');
assert(tutorialPos>=0&&menuPos>tutorialPos&&exitPos>menuPos,'header must be TUTORIAL → MAIN MENU → SAVE & EXIT');
assert(!app.includes("btn('menu-help'"),'old HELP title-menu entry must be removed');
assert(app.includes("btn('settings-help','tutorial')"),'Settings must link to TUTORIAL');
assert(app.includes("else if(view==='tutorial')tutorial()"));
assert(app.includes("tutorialReturn='settings';show('tutorial')"));
assert(app.includes("$('tutorial').disabled=screen==='battle'||!!confirmState"),'Tutorial must not strand the user on battle/result screen');
assert(app.includes('Digital Beasts Championship · v0.4.3'));

// Indexed navigation on desktop and a compact page selector on mobile.
for(const needle of ['tutorial-index-list','data-tutorial-page','tutorial-page-select','tutorial-prev','tutorial-next'])assert(app.includes(needle),needle);
assert(css.includes('.tutorial-shell{display:grid'));
assert(css.includes('.tutorial-select-label{display:none'));
assert(css.includes('@media(max-width:720px)'));
assert(css.includes('.tutorial-index>h3,.tutorial-index-list{display:none}'));
assert(css.includes('.tutorial-select-label{display:block}'));

// Portuguese MAIN MENU must stay on one line and shrink at mobile-landscape breakpoints.
assert(css.includes('.header-actions button{white-space:nowrap}'));
assert(css.includes('html[lang="pt-BR"] #main-menu{font-size:12px'));
assert(css.includes('html[lang="pt-BR"] #main-menu{font-size:8px'));
assert(css.includes('.header-actions button{min-width:84px}'));

const enSections=T.en.reduce((n,p)=>n+p.sections.length,0),ptSections=T.pt.reduce((n,p)=>n+p.sections.length,0);
assert(enSections>=45&&ptSections>=45,'tutorial should be information-rich');
console.log('PASS v0.4.3 tutorial:',T.en.length,'pages EN /',T.pt.length,'pages PT,',enSections,'sections');
