(()=>{'use strict';
const E=window.IvyEngine,$=id=>document.getElementById(id),canvas=$('game'),ctx=canvas.getContext('2d'),wrap=$('canvasWrap');
const SAVE='ivyAutomationV1';let game,selected='belt',dir=0,zoom=innerWidth<720?1.85:1.24,hover=null,panX=0,panY=0,camera={ox:0,oy:0,tw:52,th:26};let last=performance.now(),frame=0,saveTick=0,noticeTimer;
try{let old=JSON.parse(localStorage.getItem(SAVE)||'null');game=E.validSave(old)?old:E.newGame();}catch(e){game=E.newGame();}game.paused=false;
const TOOL=[['belt','⇢','Band'],['miner','⛏','Bohrer'],['smelter','♨','Ofen'],['assembler','⚙','Fabrik'],['generator','⚡','Generator'],['turret','⌖','Turm'],['wall','▥','Mauer'],['erase','⌫','Löschen']];
const names={belt:'Förderband',miner:'Bohrer',smelter:'Schmelzofen',assembler:'Fabrik',generator:'Generator',turret:'Geschützturm',wall:'Mauer',erase:'Löschen'};
function toolMarkup(type,ico,name){const costs=E.COST[type]||{},price=Object.entries(costs).map(([k,v])=>(k==='metal'?'⬡':'✧')+v).join(' ');return `<button class="tool ${selected===type?'selected':''}" data-tool="${type}" title="${names[type]}"><span class="ico">${ico}</span><span class="name">${name}</span><span class="price">${price||'—'}</span></button>`;}
function drawTools(){for(const id of ['tools','mobileToolList']){$(id).innerHTML=TOOL.map(a=>toolMarkup(...a)).join('');$(id).querySelectorAll('[data-tool]').forEach(b=>b.addEventListener('click',()=>choose(b.dataset.tool)));}}
function choose(type){selected=type;document.querySelectorAll('[data-tool]').forEach(b=>b.classList.toggle('selected',b.dataset.tool===selected));$('selection').textContent='WERKZEUG: '+names[selected].toUpperCase();}
function notify(msg){$('notice').textContent=msg;$('notice').classList.add('show');clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>$('notice').classList.remove('show'),1700);}
function save(){try{localStorage.setItem(SAVE,JSON.stringify(game));$('saveState').textContent='◉ AUTOMATISCH GESPEICHERT';}catch(e){$('saveState').textContent='SPEICHER FEHLER';}}
function resize(){const box=canvas.getBoundingClientRect(),dpr=Math.min(2,window.devicePixelRatio||1);canvas.width=Math.max(1,Math.round(box.width*dpr));canvas.height=Math.max(1,Math.round(box.height*dpr));ctx.setTransform(dpr,0,0,dpr,0,0);const w=box.width,h=box.height;camera.tw=Math.min(w/15.35,h/9.65)*zoom;camera.th=camera.tw*.51;camera.ox=w*.50+panX;camera.oy=h*.48+panY;}
function iso(x,y,z=0){return {x:camera.ox+(x-y)*camera.tw*.5,y:camera.oy+(x+y-(E.W+E.H)/2)*camera.th*.5-z*camera.th};}
function tilePath(x,y,height=0){const p=iso(x,y,height);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+camera.tw/2,p.y+camera.th/2);ctx.lineTo(p.x,p.y+camera.th);ctx.lineTo(p.x-camera.tw/2,p.y+camera.th/2);ctx.closePath();}
function diamond(x,y,fill,stroke){tilePath(x,y);ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle=stroke;ctx.lineWidth=.75;ctx.stroke();}
function roof(t,h,fill){tilePath(t.x,t.y,h);ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle='#c4eaff40';ctx.stroke();}
function block(t,h,colors){const c=iso(t.x,t.y,0),p=iso(t.x,t.y,h),tw=camera.tw/2,th=camera.th/2;ctx.beginPath();ctx.moveTo(p.x-tw,p.y+th);ctx.lineTo(p.x,p.y+2*th);ctx.lineTo(c.x,c.y+2*th);ctx.lineTo(c.x-tw,c.y+th);ctx.closePath();ctx.fillStyle=colors[1];ctx.fill();ctx.beginPath();ctx.moveTo(p.x,p.y+2*th);ctx.lineTo(p.x+tw,p.y+th);ctx.lineTo(c.x+tw,c.y+th);ctx.lineTo(c.x,c.y+2*th);ctx.closePath();ctx.fillStyle=colors[2];ctx.fill();roof(t,h,colors[0]);}
function textAt(t,label,color='#e0efff',size=.22,z=.7){const p=iso(t.x,t.y,z);ctx.fillStyle=color;ctx.font=`bold ${Math.max(9,camera.tw*size)}px system-ui`;ctx.textAlign='center';ctx.shadowBlur=8;ctx.shadowColor=color;ctx.fillText(label,p.x,p.y+camera.th*.7);ctx.shadowBlur=0;}
function drawGround(t){const k=t.ground,shade=(t.x+t.y)%2===0;let fill=shade?'#15233f':'#182741';if(k==='ore')fill=t.qty>0?'#265873':'#233b54';if(k==='coal')fill=t.qty>0?'#44415d':'#24283d';if(k==='crystal')fill=t.qty>0?'#55417a':'#232a45';diamond(t.x,t.y,fill,'#3f638042');if(k!=='land'&&t.qty>0){const p=iso(t.x,t.y,0);ctx.fillStyle=k==='ore'?'#55cffa':k==='coal'?'#b0a2ba':'#c99bff';ctx.globalAlpha=.78;ctx.beginPath();ctx.moveTo(p.x-6,p.y+camera.th*.36);ctx.lineTo(p.x-2,p.y+camera.th*.02);ctx.lineTo(p.x+3,p.y+camera.th*.35);ctx.lineTo(p.x+2,p.y+camera.th*.68);ctx.closePath();ctx.fill();ctx.globalAlpha=1;}}
function drawEntity(t){const e=t.entity;if(!e)return;const k=e.type,colors={core:['#68cfff','#254b8a','#162b58'],generator:['#ffca74','#997344','#634826'],miner:['#8fe9ff','#32617e','#20445b'],smelter:['#ff9c70','#945347','#5b343d'],assembler:['#b3a4ff','#625391','#34345b'],turret:['#a6eaff','#366786','#284359'],wall:['#a3bad9','#455674','#293953']};if(k==='belt'){const p=iso(t.x,t.y,.1);ctx.strokeStyle='#4bccd5';ctx.lineWidth=Math.max(2,camera.tw*.085);ctx.beginPath();ctx.moveTo(p.x-camera.tw*.22,p.y+camera.th*.51);ctx.lineTo(p.x+camera.tw*.20,p.y+camera.th*.51);ctx.stroke();const [dx,dy]=E.DIRS[e.dir],tip=iso(t.x+dx*.37,t.y+dy*.37,.12);ctx.fillStyle=e.buffer?'#ffd384':'#a9faff';ctx.beginPath();ctx.arc(tip.x,tip.y+camera.th*.48,Math.max(2,camera.tw*.06),0,Math.PI*2);ctx.fill();if(e.buffer)textAt(t,e.buffer==='ore'?'●':e.buffer==='plate'?'▣':e.buffer==='ammo'?'◆':'◇','#ffce7e',.2,.65);return;}
 const h=k==='core'?1.45:k==='wall'?1.2:k==='turret'?1.1:.95;block(t,h,colors[k]||colors.wall);let ico={core:'✦',generator:'⚡',miner:'⛏',smelter:'♨',assembler:'⚙',turret:'⌖',wall:'▥'}[k];textAt(t,ico,k==='smelter'?'#ffdcba':'#d8fdff',.3,h);if(['miner','smelter','assembler'].includes(k)){let [dx,dy]=E.DIRS[e.dir],p=iso(t.x+dx*.38,t.y+dy*.38,h+.05);ctx.fillStyle='#6dffe2';ctx.beginPath();ctx.arc(p.x,p.y+camera.th*.45,Math.max(2,camera.tw*.045),0,Math.PI*2);ctx.fill();}if(e.buffer){textAt(t,'●','#ffb866',.14,h+.5);}}
function draw(){if(!canvas.width)return;const box=canvas.getBoundingClientRect();window.IvyVisuals.render(ctx,game,camera,hover,frame,box,E);}
function pointToTile(clientX,clientY){const r=canvas.getBoundingClientRect(),xp=clientX-r.left-camera.ox,yp=clientY-r.top-camera.oy;const a=xp/(camera.tw*.5),b=(yp-camera.th*.52)/(camera.th*.5)+(E.W+E.H)/2;let x=(a+b)/2,y=(b-a)/2;return {x:Math.floor(x+.5),y:Math.floor(y+.5)};}
// Tap to build; drag to move the camera; two-finger pinch for smooth mobile zoom.
let drag=null;const pointers=new Map();let pinch=null;
canvas.addEventListener('pointerdown',e=>{
 canvas.setPointerCapture?.(e.pointerId);
 pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(pointers.size===1)drag={x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,moved:false};
 else if(pointers.size===2){const [a,b]=[...pointers.values()];pinch={distance:Math.hypot(a.x-b.x,a.y-b.y),zoom};drag=null;}
});
canvas.addEventListener('pointermove',e=>{
 const p=pointToTile(e.clientX,e.clientY);
 hover=(p.x>=0&&p.x<E.W&&p.y>=0&&p.y<E.H)?p:null;
 if(!pointers.has(e.pointerId))return;
 pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(pointers.size>=2&&pinch){const [a,b]=[...pointers.values()];const distance=Math.hypot(a.x-b.x,a.y-b.y);if(pinch.distance>10){zoom=Math.min(3,Math.max(.6,pinch.zoom*distance/pinch.distance));resize();}return;}
 if(drag){const dx=e.clientX-drag.lastX,dy=e.clientY-drag.lastY;if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>7)drag.moved=true;
   if(drag.moved){panX+=dx;panY+=dy;resize();}drag.lastX=e.clientX;drag.lastY=e.clientY;}
});
canvas.addEventListener('pointerleave',()=>{if(!pointers.size)hover=null});
canvas.addEventListener('pointercancel',e=>{pointers.delete(e.pointerId);drag=null;pinch=null});
canvas.addEventListener('pointerup',e=>{
 const single=pointers.size===1;
 pointers.delete(e.pointerId);if(!pointers.size)pinch=null;
 if(!single||!drag||drag.moved){drag=null;return;}
 drag=null;const p=pointToTile(e.clientX,e.clientY);
 if(p.x<0||p.x>=E.W||p.y<0||p.y>=E.H)return;
 if(selected==='erase'||e.button===2){if(E.remove(game,p.x,p.y)){notify('Gebäude entfernt');save();updateHud();}return;}
 const result=E.build(game,p.x,p.y,selected,dir);notify(result.message);
 if(result.ok){E.stage(game);save();updateHud();}
});
canvas.addEventListener('contextmenu',e=>{e.preventDefault();const p=pointToTile(e.clientX,e.clientY);if(E.remove(game,p.x,p.y)){notify('Gebäude entfernt');save();updateHud();}});
canvas.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.min(3,Math.max(.58,zoom+(e.deltaY<0?.12:-.12)));resize();},{passive:false});
function rotate(){dir=(dir+1)%4;$('dirTxt').textContent=['OST','SÜD','WEST','NORD'][dir];}
function cinematic(){const on=document.body.classList.toggle('forge-cinema');$('cinematic').setAttribute('aria-pressed',String(on));requestAnimationFrame(resize);}
$('cinematic').onclick=cinematic;
$('rotate').onclick=rotate;const focus=()=>{panX=0;panY=0;zoom=innerWidth<720?1.85:1.24;resize();};document.getElementById('centerView')?.addEventListener('click',focus);$('plus').onclick=()=>{zoom=Math.min(3,zoom+.15);resize();};$('minus').onclick=()=>{zoom=Math.max(.58,zoom-.15);resize();};
window.addEventListener('keydown',e=>{if(e.target.matches('input,textarea'))return;if(e.key==='r'||e.key==='R')rotate();if(e.key==='c'||e.key==='C')cinematic();if(e.key==='Escape')$('overlay').classList.add('hidden');if(e.key===' ') {e.preventDefault();pause();}});
function pause(){game.paused=!game.paused;$('pauseBtn').textContent=game.paused?'▶ WEITER':'Ⅱ PAUSE';notify(game.paused?'Simulation pausiert':'Simulation läuft');}
$('pauseBtn').onclick=pause;$('repairBtn').onclick=()=>{if(E.repair(game)){save();notify('Basiskern repariert');}else notify('Reparatur nicht möglich (20 Metall)');};$('skipBtn').onclick=()=>{game.nextWave=0;notify('Feindwelle aktiviert');};
const menu=()=>$('overlay').classList.remove('hidden');$('menuBtn').onclick=menu;$('closeMenu').onclick=()=>$('overlay').classList.add('hidden');$('resume').onclick=()=>$('overlay').classList.add('hidden');
$('newGame').onclick=()=>{if(!confirm('Neue Kampagne starten? Der bisherige Spielstand wird überschrieben.'))return;game=E.newGame();save();$('overlay').classList.add('hidden');notify('Neuer Außenposten aktiv');};
$('exportSave').onclick=()=>{const blob=new Blob([JSON.stringify(game,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='IVY_Automation_Spielstand.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),500);};
$('importSave').onclick=()=>$('importFile').click();$('importFile').onchange=async e=>{try{const f=e.target.files[0];if(!f)return;const data=JSON.parse(await f.text());if(!E.validSave(data))throw Error('Ungültiges Format');game=data;game.paused=false;save();$('overlay').classList.add('hidden');notify('Spielstand importiert');}catch(err){notify('Import fehlgeschlagen: '+err.message)}e.target.value='';};
function updateHud(){let fmt=n=>Math.max(0,Math.floor(n));$('metal').textContent='⬡ '+fmt(game.wallet.metal);$('crystal').textContent='✧ '+fmt(game.wallet.crystal);$('coal').textContent='◈ '+fmt(game.wallet.coal);$('ammo').textContent='⌁ '+fmt(game.stock.ammo);$('hpLabel').textContent=`${fmt(game.base.hp)} / ${game.base.max}`;$('hpBar').style.width=(game.base.hp/game.base.max*100)+'%';const p=game.power||{supply:4,load:1};$('powerLabel').textContent=`${p.supply} / ${p.load}`;$('powerBar').style.width=(p.load?Math.min(100,p.supply/p.load*100):100)+'%';$('waveTimer').textContent=`${String(Math.floor(Math.max(0,game.nextWave)/60)).padStart(2,'0')}:${String(Math.floor(Math.max(0,game.nextWave)%60)).padStart(2,'0')}`;$('waveLabel').textContent='WELLE '+game.wave;$('objective').textContent=game.over?'Basis verloren':game.won?'Sektor gesichert!':game.objective||E.stage(game);$('step').textContent=`${Math.min(game.storyStep+1,6)} / 6`;$('log').innerHTML=game.log.slice(0,5).map(s=>{let d=document.createElement('div');d.textContent=s;return d.outerHTML;}).join('');}
function loop(now){const dt=Math.min(.20,(now-last)/1000);last=now;frame++;if(!game.paused&&!game.over){E.tick(game,dt);saveTick+=dt;if(saveTick>7){save();saveTick=0;}}if(frame%5===0)updateHud();draw();requestAnimationFrame(loop);}
window.addEventListener('resize',resize);new ResizeObserver(resize).observe(wrap);drawTools();E.stage(game);resize();updateHud();requestAnimationFrame(loop);document.addEventListener('visibilitychange',()=>{if(document.hidden){save();last=performance.now();}});window.addEventListener('beforeunload',save);
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(r=>r.update()).catch(console.warn));
})();
