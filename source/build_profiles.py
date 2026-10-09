from pathlib import Path
import json,re
ROOT=Path(__file__).resolve().parents[1]
data=json.loads((ROOT/'source-data.json').read_text());research=json.loads((ROOT/'source'/'research-index.json').read_text())
roles={'timid':[12,25,0,28,35,170],'brawler':[62,24,0,9,5,35],'caster':[12,61,0,15,12,170],'ranger':[18,49,0,10,23,190],'guardian':[35,28,0,29,8,65],'artillery':[17,66,0,13,4,210],'skirmisher':[42,31,0,8,19,80],'repair':[10,38,25,22,5,170]}
keys=['hp','tp','attack','defense','wisdom','speed'];profiles=[]
close={7,15,22,23,31,38,41,54,55,56,58,63,67,70,71,80,81,82,83,85,87,88,89,95,97,98,115}
preferred_move={14:1,84:1,101:1,102:2,105:1,107:1,119:1,126:1}
for line in (ROOT/'source'/'profile-design.txt').read_text().splitlines():
 if not line or line.startswith('#'):continue
 sid,alloc,role,dis,specialization,notes=line.split('|');i=int(sid);s=data['species'][i];r=research[i];ratios=list(map(int,alloc.split(',')));base=[0,8,14,30,60,110,180,220][s['stage']]
 stats={k:round(base*ratios[n]/7*(8 if k=='hp' else 2 if k=='tp' else 1)) for n,k in enumerate(keys)}
 weights=roles[role][:];weights[0]=round(weights[0]*ratios[2]/7);weights[1]=round(weights[1]*ratios[4]/7);weights[3]=round(weights[3]*ratios[3]/7);weights[4]=round(weights[4]*ratios[5]/7)
 behavior=dict(zip(['meleeWeight','specialWeight','healWeight','defendWeight','evadeWeight','preferredRange'],weights));behavior.update(disobedienceChance=float(dis),aggression=round(ratios[2]/(ratios[2]+ratios[3]),3))
 moves=[x.strip() for x in r.get('Special Move','').split('・') if x.strip()]
 if not moves:raise ValueError('Missing researched move '+str(i))
 if i in preferred_move:moves.insert(0,moves.pop(preferred_move[i]))
 profiles.append({'speciesId':i,'name':s['name'],'slug':s['slug'],'stage':s['stage'],'attribute':s['attribute'],'stats':stats,'specialization':specialization.split(','),'behavior':behavior,'specialRange':45 if i in close else 280,'normalMove':{'name':'Physical strike','kind':'melee'},'specialMove':{'name':moves[0],'kind':'melee' if i in close else 'projectile','tpCost':8},'supportMove':{'name':'Repair','kind':'heal','tpCost':12} if role=='repair' else None,'color':{'brawler':'#efab6f','caster':'#c2b5f0','guardian':'#dbe0a2','artillery':'#9cd9d1','ranger':'#a4ceee','skirmisher':'#d9bcf0','timid':'#c3dba4','repair':'#b5e6ab'}[role],'source':r['url'],'designRationale':notes})
assert len(profiles)==len(data['species'])
(ROOT/'profiles.js').write_text("'use strict';\n(function(r){const data="+json.dumps(profiles,ensure_ascii=False,separators=(',',':'))+";r.CHAMP_DATA=data;if(typeof module!=='undefined')module.exports=data;})(globalThis);\n")
(ROOT/'source'/'species-profiles.json').write_text(json.dumps(profiles,ensure_ascii=False,indent=2))
print('Built',len(profiles),'profiles')
