/* IVY FORGE V2 • hand-illustrated live isometric canvas renderer.
   All buildings, conveyors and resources below are drawn from simulation state. */
(function(root){ 'use strict';
const C={cyan:'#5ee9f4',purple:'#ab80ed',amber:'#ffb76b',steel:'#344760',ink:'#0c1325'};
const TAU=Math.PI*2;
const mix=(a,b,t)=>a+(b-a)*t;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function polygon(c,points,fill,stroke=null,w=1){c.beginPath();c.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)c.lineTo(...points[i]);c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.lineWidth=w;c.strokeStyle=stroke;c.stroke();}}
function stroke(c,pts,color,width=2){c.beginPath();c.moveTo(...pts[0]);for(let i=1;i<pts.length;i++)c.lineTo(...pts[i]);c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.stroke();}
function grad(c,x,y,x2,y2,a,b){const g=c.createLinearGradient(x,y,x2,y2);g.addColorStop(0,a);g.addColorStop(1,b);return g;}
function rad(c,x,y,r,a,b){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,a);g.addColorStop(1,b);return g;}
function circle(c,x,y,r,fill,outline=null,w=1){c.beginPath();c.arc(x,y,r,0,TAU);if(fill){c.fillStyle=fill;c.fill()}if(outline){c.strokeStyle=outline;c.lineWidth=w;c.stroke()}}
function rr(c,x,y,w,h,r,fill,outline=null,sw=1){c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill()}if(outline){c.lineWidth=sw;c.strokeStyle=outline;c.stroke()}}
function diamond(c,x,y,hw=50,hh=25,fill,outline=null,w=1){polygon(c,[[x,y],[x+hw,y+hh],[x,y+hh*2],[x-hw,y+hh]],fill,outline,w)}
function glow(c,x,y,r,col,alpha=.45){c.save();c.globalAlpha=alpha;c.fillStyle=rad(c,x,y,r,col,'rgba(10,10,40,0)');c.beginPath();c.arc(x,y,r,0,TAU);c.fill();c.restore()}
function panel(c,x,y,w,h,mode='cyan'){
 const color=mode==='amber'?'#ffbf77':mode==='violet'?'#d2a2ff':'#7df7ff';
 rr(c,x,y,w,h,2,'#0a1931','#7b96b9',1);
 rr(c,x+2,y+2,w-4,h-4,1,mode==='amber'?'#85533d':mode==='violet'?'#4b3d7c':'#19556a');
 glow(c,x+w*.5,y+h*.5,Math.max(w,h)*.8,color,.13);
 stroke(c,[[x+4,y+h*.5],[x+w-4,y+h*.5]],color,1.7);
}
function cube(c,height=37,palette='blue',half=42){
 const themes={blue:['#45698a','#344964','#243449','#a9e3f8'],amber:['#897064','#61465a','#442c40','#ffdea2'],violet:['#6d628a','#4a3a6c','#353050','#dfbaff'],cyan:['#42788a','#2b576b','#214053','#c9faff'],slate:['#58617a','#383f59','#252b45','#a9bcde']};
 const s=themes[palette]||themes.blue,top=-height,hh=half*.48;
 // shadow against floor
 c.save();c.globalAlpha=.4;diamond(c,0,15,47,24,'#030813');c.restore();
 polygon(c,[[-half,top+hh],[0,top+hh*2],[0,46],[-half,hh]],grad(c,-44,top,10,56,s[1],s[2]),'#1f293f',1.6);
 polygon(c,[[0,top+hh*2],[half,top+hh],[half,hh],[0,46]],grad(c,0,top,45,55,s[2],'#111c30'),'#17253a',1.6);
 diamond(c,0,top,half,hh,grad(c,-half,top,half,top+hh*2,s[0],'#293b5f'),'#97bada',1.7);
 diamond(c,0,top+4,half-6,hh-3,'rgba(8,19,40,.25)','#8cc6ed44',1.1);
 stroke(c,[[-half+2,top+hh+1],[-half+2,hh-2]],'#627f9a',2.3);
 stroke(c,[[half-2,top+hh+1],[half-2,hh-2]],'#18283f',2);
 circle(c,-32,top+18,1.7,s[3]);circle(c,32,top+18,1.7,s[3]);
 // lit cyan line along right face
 stroke(c,[[half-7,top+hh+7],[half-7,hh-9]],'#42d5e3a8',2);
}
function vent(c,x,y,color='#8ed4e5'){rr(c,x,y,23,10,2,'#15243d','#7c95b9',1);for(let i=0;i<4;i++)stroke(c,[[x+4+i*5,y+2],[x+4+i*5,y+8]],color,1)}
function ring(c,x,y,rx,ry,fill,outline='#c9e8ff',w=2){c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);if(fill){c.fillStyle=fill;c.fill()}c.lineWidth=w;c.strokeStyle=outline;c.stroke()}
function shadow(c,alpha=.3){c.save();c.globalAlpha=alpha;ring(c,0,30,39,17,'#030814','#030814',2);c.restore()}
function arrows(c,progress=.2,color='#79edfb'){
 for(let q=0;q<3;q++){const k=(q+progress)%3;const x=(k-1)*23;stroke(c,[[x-6,18],[x+1,22],[x-6,26]],color,1.5)}
}
function machine(c,t,frame){const e=t.entity,k=e.type; c.save();shadow(c,.48);
 if(k==='generator'){
  cube(c,38,'amber');panel(c,-31,-1,21,16,'amber');panel(c,9,-5,17,14);
  rr(c,-27,-30,15,9,2,'#1b2946','#b2c8e5',1.5);rr(c,15,-26,13,6,2,'#142344','#a1b9da',1);
  ring(c,1,-35,26,12,'#253953','#92bbd3',2.3);ring(c,1,-36,20,8,'#1e4055','#ffcb88',2.5);
  ring(c,1,-39,15,6,'#291d34','#ffdd8d',3);glow(c,0,-42,31,'#fdbd61',.35);
  for(let i=0;i<4;i++)circle(c,-10+i*7,-35,2,'#fdd9a8');
  rr(c,-3,-62,8,17,4,'#455a70','#99c9e2',1.3);ring(c,1,-63,7,4,'#facc77','#f6e9b7',1);
 }else if(k==='core'){
  cube(c,55,'violet',45); panel(c,-31,-12,23,19,'cyan'); panel(c,8,-10,21,13,'violet');
  diamond(c,0,-55,34,16,'#283555','#a5d9fa',2);
  ring(c,0,-53,28,13,'#0d2847','#6ed9f6',2);ring(c,0,-57,20,8,'#165b78','#7afbff',3);
  rr(c,-11,-105,22,39,5,grad(c,-12,-105,12,-65,'#708ab5','#304b83'),'#b5e4ff',2);
  ring(c,0,-105,13,7,'#68f5fb','#caffff',2);glow(c,0,-107,37,'#30eaff',.35);
  ring(c,0,-72,19,8,null,'#b18aff',2.2);
  circle(c,-26,-52,3,'#fff0ac');circle(c,26,-52,3,'#fff0ac');
 }else if(k==='miner'){
  cube(c,34,'cyan');panel(c,-32,-1,24,18);panel(c,13,-6,13,12,'violet');
  diamond(c,-2,-35,34,16,'#243d60','#a4d8ea',2);
  // drilling cylinder
  rr(c,-9,-72,18,34,6,grad(c,-8,-72,12,-40,'#7794ad','#27364f'),'#adcde6',1.5);
  ring(c,0,-72,15,7,'#35496c','#b6e5fb',2);
  ring(c,0,-81,8,5,'#9b8bc5','#f2ddff',1.6);
  rr(c,-4,-91,8,16,3,'#536f9a','#a5d7ff',1);
  ring(c,0,-92,5,3,'#80f4f0','#b5ffff',1);glow(c,0,-92,20,'#48e8ef',.4);
  for(let j=0;j<3;j++)rr(c,14,-19+j*5,15,2,1,'#5da7b8');
 }else if(k==='smelter'){
  cube(c,42,'amber');panel(c,-31,-7,25,20,'amber');
  rr(c,11,-7,15,20,3,'#241f34','#ffad6c',2);rr(c,14,-3,10,13,2,'#ffbc68');
  glow(c,22,2,25,'#ff802e',.29);
  // chimney
  rr(c,16,-77,15,44,4,'#46536a','#a1b3c8',2);ring(c,24,-77,8,5,'#111d34','#e8c2a3',1.3);
  rr(c,-25,-37,15,7,2,'#3c425f','#c5d4eb',1);ring(c,-10,-43,12,7,'#874864','#ffc099',3);
  if(Math.sin(frame*.06+t.x)>-.4){glow(c,25,-92,20,'#dfefff',.22);circle(c,28,-91,4,'#abc4d066')}
 }else if(k==='assembler'){
  cube(c,35,'violet');panel(c,-30,-2,20,15,'violet');panel(c,14,-7,14,11);
  ring(c,-2,-35,26,12,'#222e4f','#b6c7ff',2);ring(c,-2,-35,12,5,'#6c53aa','#e6c8ff',2);
  // articulated robotic arm
  stroke(c,[[0,-42],[8,-68],[24,-74]],'#15243c',11);
  stroke(c,[[0,-42],[8,-68],[24,-74]],'#8296b2',7);
  circle(c,0,-42,9,'#405371','#c2e8f7',2);circle(c,8,-68,7,'#445777','#d1eaff',2);
  ring(c,24,-74,6,4,'#313b69','#b4dcff',2);
  stroke(c,[[24,-74],[30,-64],[37,-66]],'#d4b7ff',4);
  stroke(c,[[24,-74],[28,-82],[35,-81]],'#d4b7ff',4);
  glow(c,29,-73,14,'#b78cff',.28);
 }else if(k==='turret'){
  cube(c,25,'cyan');panel(c,-31,7,20,14);ring(c,1,-27,30,13,'#2b475c','#aad9f4',2.2);
  ring(c,1,-30,19,9,'#365f73','#8aefff',3);ring(c,1,-33,12,6,'#1e334e','#d4f6ff',2);
  stroke(c,[[2,-35],[19,-56],[28,-60]],'#132b47',13);stroke(c,[[2,-35],[19,-56],[28,-60]],'#729cb2',8);
  stroke(c,[[20,-56],[44,-66]],'#21384e',9);stroke(c,[[20,-56],[44,-66]],'#99c2d8',4);
  ring(c,43,-66,6,4,'#1e384a','#adf8fa',1.5);glow(c,44,-66,13,'#6dfaf8',.30);
 }else if(k==='wall'){
  cube(c,19,'slate',43);for(let i=0;i<3;i++)rr(c,-31+i*22,-14,18,18,3,'#2d405e','#7d8baf',1);
  stroke(c,[[-35,0],[35,0]],'#9dd3e7',1.2);circle(c,-34,-11,2,'#d8ecff');circle(c,34,-11,2,'#d8ecff');
 }
 // material item lights
 if(e.buffer){const col=e.buffer==='ammo'?'#f7a4ff':e.buffer==='ore'?'#f5bc80':'#92f6ff';glow(c,-5,-20,17,col,.4);circle(c,-5,-20,4,col,'#fff',1)}
 c.restore();}
function drawBelt(c,t,frame,dirs){const e=t.entity;const d=dirs[e.dir||0],u={x:d[0]*.72-d[1]*.72,y:(d[0]+d[1])*.38};const len=Math.hypot(u.x,u.y);const ex=u.x/len*32,ey=u.y/len*18;
 c.save();shadow(c,.28);diamond(c,0,9,47,22,'#1b334b','#50bcd1',2.8);diamond(c,0,6,40,18,grad(c,-32,0,35,40,'#33536d','#16283b'),'#9ccfe2',1.6);
 stroke(c,[[-ex,24-ey],[ex,24+ey]],'#0b162b',20);stroke(c,[[-ex,21-ey],[ex,21+ey]],'#5c86a0',16);stroke(c,[[-ex,21-ey],[ex,21+ey]],'#112239',12);
 stroke(c,[[-ex*1.05,14-ey],[ex*1.05,14+ey]],'#5ce4edaa',2.2);stroke(c,[[-ex*1.05,28-ey],[ex*1.05,28+ey]],'#83e8f7aa',2.2);
 for(let i=0;i<4;i++){const p=(i+((frame%40)/40)*.75)/4;const cx=mix(-ex,ex,p),cy=22+mix(-ey,ey,p);stroke(c,[[cx-3.2,cy-2],[cx+2,cy]],'#7ee6f4',1.2);}
 circle(c,-33,22,2,'#d0eeff');circle(c,33,22,2,'#d0eeff');
 if(e.buffer){const col=e.buffer==='ore'?'#e0aa72':e.buffer==='plate'?'#93e4ff':e.buffer==='ammo'?'#e6a5fe':'#a0f4f0';const p=Math.min(1,(e.progress||0)/.62);const x=mix(-ex*.85,ex*.85,p),y=20+mix(-ey*.8,ey*.8,p);glow(c,x,y,13,col,.40);rr(c,x-6,y-5,12,9,2,col,'#f5f5ff',1)}
 c.restore();}
function ore(c,k,t,frame){const cols={ore:['#428ba7','#65f5fd','#b0faf9'],coal:['#504e65','#b2a4c0','#e6d1f1'],crystal:['#6e488d','#c77cff','#f1beff']};const v=cols[k]||cols.ore;c.save();
 // rocks and chunks scatter, do not obstruct machines
 for(let i=0;i<4;i++){const x=(i*31+t.x*13+t.y*7)%61-30, y=15+((i*13+t.y*5)%25),r=3+i%3*1.3;
  polygon(c,[[x-r,y],[x-r*.6,y-r*1.3],[x+r*.4,y-r*1.5],[x+r,y],[x,y+r*.4]],i%2?v[0]:'#31455e','#87a1b75c',.7);}
 if(k==='crystal'){glow(c,1,22,22,v[1],.20);polygon(c,[[-7,23],[-5,4],[1,-10],[8,13],[5,28]],grad(c,-4,-10,8,28,v[2],v[0]),v[2],1.5);polygon(c,[[8,26],[14,5],[19,19],[18,30]],'#9a60d6','#d8bcff',1)}
 else if(k==='ore'){polygon(c,[[-8,32],[-14,21],[-5,14],[4,20],[12,31]],'#50809f','#80e9ee',1);circle(c,0,18,4,'#75eaff')}
 c.restore();}
function background(c,w,h,frame){const bg=grad(c,0,0,w,h,'#111124','#080c1a');c.fillStyle=bg;c.fillRect(0,0,w,h);
 const g=c.createRadialGradient(w*.42,h*.36,10,w*.5,h*.45,w*.83);g.addColorStop(0,'#322746');g.addColorStop(.42,'#1c1a36');g.addColorStop(1,'#080a13');c.fillStyle=g;c.fillRect(0,0,w,h);
 // dark industrial hangar grid under the active board
 c.save();c.strokeStyle='rgba(116,134,166,.09)';c.lineWidth=1;const sp=38;for(let x=-sp;x<w+sp;x+=sp){c.beginPath();c.moveTo(x,0);c.lineTo(x,h);c.stroke()}for(let y=0;y<h;y+=sp){c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke()}
 // ambient wall pipes, vents and consoles outside board
 rr(c,18,18,Math.min(210,w*.25),83,12,'#11182e','#485073',2);rr(c,32,31,Math.min(104,w*.12),53,7,'#12374b','#3cd0df',2);for(let n=0;n<3;n++){rr(c,42+n*25,43,16,6,1,n===0?'#72f4ed':'#556b98');rr(c,42+n*25,56,16,6,1,'#304b70');}stroke(c,[[10,130],[68,130],[84,107],[172,107]],'#4a3547',9);stroke(c,[[10,130],[68,130],[84,107],[172,107]],'#8d739a',3);
 const cx=w-38,cy=42;rr(c,cx-126,22,113,70,9,'#162039','#59537d',2);for(let i=0;i<5;i++){rr(c,cx-113+i*18,35,11,7,2,i%2?'#4c6084':'#64cad8');}rr(c,cx-112,58,81,17,3,'#203554','#53aec6',1.5);
 c.restore();
}
function floorPlate(c,E,game,cam){const p=isoFactory(cam,E);const a=p(-.48,-.48,0),b=p(E.W-.52,-.48,0),d=p(E.W-.52,E.H-.52,0),f=p(-.48,E.H-.52,0);
 const verts=[[a.x,a.y+15],[b.x,b.y+15],[d.x,d.y+15],[f.x,f.y+15]];polygon(c,verts,'rgba(0,0,0,.24)','#3f4b68',2);
 stroke(c,[[a.x,a.y+15],[b.x,b.y+15],[d.x,d.y+15]],'#ffae7640',4);
}
function isoFactory(cam,E){return (x,y,z=0)=>({x:cam.ox+(x-y)*cam.tw*.5,y:cam.oy+(x+y-(E.W+E.H)/2)*cam.th*.5-z*cam.th});}
function render(ctx,game,cam,hover,frame,box,E){const w=box.width,h=box.height;ctx.clearRect(0,0,w,h);background(ctx,w,h,frame);const iso=isoFactory(cam,E); floorPlate(ctx,E,game,cam);
 // ground panel lattice and ore deposits
 for(let sum=0;sum<E.W+E.H;sum++)for(let y=0;y<E.H;y++){const x=sum-y;if(x<0||x>=E.W)continue;const t=E.at(game,x,y),p=iso(x,y);
  ctx.save();ctx.translate(p.x,p.y);ctx.scale(cam.tw/100,cam.th/50);
  const alt=((x*13+y*17)%7);let fill=alt<3?'#222a41':'#252c44';if(t.ground==='ore')fill='#34445d';if(t.ground==='coal')fill='#303044';if(t.ground==='crystal')fill='#3a3456';
  diamond(ctx,0,0,50,25,fill,'#65708b36',.8);
  // inset engraved panel lines and small screws
  diamond(ctx,0,3,44,21,'rgba(18,24,43,.13)','rgba(116,141,178,.17)',.8);
  if((x+y)%3===0){stroke(ctx,[[-24,25],[-13,20]],'#6584a545',1.3);circle(ctx,23,29,1.5,'#8292b160');}
  if((x*7+y*11)%13===0){rr(ctx,-6,22,12,5,1,'#1b2f48','#586f8b70',.7);}
  if(t.ground!=='land'&&t.qty>0&&!t.entity)ore(ctx,t.ground,t,frame);
  ctx.restore();
 }
 // underfloor neon wiring and supply lines
 ctx.save();ctx.lineCap='round';ctx.strokeStyle='#3a81a440';ctx.lineWidth=2;for(let y=1;y<E.H;y+=3){let a=iso(1,y),b=iso(E.W-2,y);stroke(ctx,[[a.x,a.y+cam.th*.58],[b.x,b.y+cam.th*.58]],'#2caeca1e',1.2)}ctx.restore();
 if(hover){const p=iso(hover.x,hover.y);ctx.save();ctx.translate(p.x,p.y);ctx.scale(cam.tw/100,cam.th/50);diamond(ctx,0,0,50,25,'rgba(85,233,244,.18)','#96f9ff',2.6);ctx.restore()}
 for(let sum=0;sum<E.W+E.H;sum++)for(let y=0;y<E.H;y++){const x=sum-y;if(x<0||x>=E.W)continue;const t=E.at(game,x,y);if(!t.entity)continue;const p=iso(x,y);ctx.save();ctx.translate(p.x,p.y);ctx.scale(cam.tw/100,cam.tw/100);
  if(t.entity.type==='belt')drawBelt(ctx,t,frame,E.DIRS);else machine(ctx,t,frame);
  ctx.restore();}
 for(const en of game.enemies){let p=iso(en.x,en.y,.5);ctx.save();glow(ctx,p.x,p.y,cam.tw*.35,'#ff648e',.6);ctx.beginPath();ctx.moveTo(p.x,p.y-10);ctx.lineTo(p.x+10,p.y+5);ctx.lineTo(p.x,p.y+15);ctx.lineTo(p.x-10,p.y+5);ctx.closePath();ctx.fillStyle='#8c3b68';ctx.fill();ctx.strokeStyle='#ff9ebc';ctx.lineWidth=1.8;ctx.stroke();ctx.fillStyle='#fa577e';ctx.fillRect(p.x-13,p.y-17,26*clamp(en.hp/en.max,0,1),3);ctx.restore()}
 for(const s of game.shots){const a=iso(s.x,s.y,1),b=iso(s.tx,s.ty,.3);ctx.save();ctx.shadowBlur=15;ctx.shadowColor='#83fbff';stroke(ctx,[[a.x,a.y],[b.x,b.y]],'#b7fffd',2.6);ctx.restore()}
 // ambient vignette for cinematic feel
 const vign=ctx.createRadialGradient(w*.5,h*.48,Math.min(w,h)*.33,w*.5,h*.48,Math.max(w,h)*.73);vign.addColorStop(0,'rgba(0,0,0,0)');vign.addColorStop(1,'rgba(0,0,0,.57)');ctx.fillStyle=vign;ctx.fillRect(0,0,w,h);
}
root.IvyVisuals={render};
})(typeof window!=='undefined'?window:globalThis);
