/* IVY Automation Game – deterministic simulation, no external dependencies */
(function(root,factory){const api=factory(); if(typeof module!=='undefined'&&module.exports)module.exports=api; root.IvyEngine=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const W=16,H=12,DIRS=[[1,0],[0,1],[-1,0],[0,-1]];
const COST={belt:{metal:2},miner:{metal:15},smelter:{metal:20,crystal:2},assembler:{metal:30,crystal:5},generator:{metal:25,crystal:3},turret:{metal:22,crystal:4},wall:{metal:5}};
const PRICES={ore:1,plate:4,ammo:6,crystal:12,coal:2};
const inBounds=(x,y)=>x>=0&&x<W&&y>=0&&y<H;
const at=(g,x,y)=>g.tiles[y*W+x];
function newGame(seed=17){let rng=seed|0;const rand=()=>{rng=(rng*1664525+1013904223)|0;return (rng>>>0)/4294967296;};
 const tiles=Array.from({length:W*H},(_,i)=>({x:i%W,y:Math.floor(i/W),ground:'land',qty:0,entity:null}));
 function patch(cx,cy,kind){for(let y=cy-1;y<=cy+1;y++)for(let x=cx-1;x<=cx+1;x++)if(inBounds(x,y)&&Math.abs(x-cx)+Math.abs(y-cy)<=2&&rand()>.12){let t=tiles[y*W+x];t.ground=kind;t.qty=85+Math.floor(rand()*100);}}
 patch(5,4,'ore');patch(6,9,'ore');patch(10,3,'coal');patch(11,9,'crystal');
 const game={version:1,seed,time:0,tiles,base:{x:1,y:6,hp:260,max:260},wallet:{metal:115,crystal:24,coal:80},stock:{ore:0,plate:0,ammo:18,crystal:0,coal:0},points:0,wave:0,nextWave:55,enemies:[],shots:[],builds:{},produced:{ore:0,plate:0,ammo:0},kills:0,storyStep:0,paused:false,over:false,won:false,log:['ARCHIV IVY: Außenposten aktiviert. Errichte eine Produktionskette.']};
 tiles[6*W+1].entity={type:'core',hp:260,dir:0,progress:0,buffer:null};
 placeFree(game,3,6,'generator',0);placeFree(game,4,4,'miner',0); // initial mine on ore
 return game;
}
function placeFree(g,x,y,type,dir=0){if(!inBounds(x,y)||at(g,x,y).entity)return false;at(g,x,y).entity={type,dir,progress:0,buffer:null,hp:type==='wall'?90:100};g.builds[type]=(g.builds[type]||0)+1;return true;}
function canBuild(g,x,y,type){if(!COST[type]||!inBounds(x,y)||g.over)return 'Ungültiger Bauplatz';const t=at(g,x,y);if(t.entity)return 'Feld bereits belegt';if(type==='miner'&&!['ore','coal','crystal'].includes(t.ground))return 'Bohrer benötigt ein Vorkommen';for(const [key,n] of Object.entries(COST[type]))if((g.wallet[key]||0)<n)return 'Nicht genügend '+(key==='metal'?'Metall':'Kristalle');return null;}
function build(g,x,y,type,dir=0){const err=canBuild(g,x,y,type);if(err)return {ok:false,message:err};for(const [k,n] of Object.entries(COST[type]))g.wallet[k]-=n;placeFree(g,x,y,type,dir);return {ok:true,message:type+' gebaut'};}
function remove(g,x,y){if(!inBounds(x,y))return false;const t=at(g,x,y),e=t.entity;if(!e||e.type==='core')return false;for(const [k,n] of Object.entries(COST[e.type]||{}))g.wallet[k]=(g.wallet[k]||0)+Math.floor(n*.6);g.builds[e.type]=Math.max(0,(g.builds[e.type]||0)-1);t.entity=null;return true;}
function receive(entity,item){if(!entity||entity.buffer)return false;
 if(entity.type==='belt'){entity.buffer=item;return true;}
 if(entity.type==='smelter'&&item==='ore'){entity.buffer='ore';return true;}
 if(entity.type==='assembler'&&item==='plate'){entity.buffer='plate';return true;}
 if(entity.type==='generator'&&item==='coal'){entity.buffer='coal';return true;}
 if(entity.type==='turret'&&item==='ammo'){entity.buffer='ammo';return true;}
 return false;
}
function forward(t,e){let [dx,dy]=DIRS[e.dir||0];return [t.x+dx,t.y+dy];}
function send(g,t,e,item){const [x,y]=forward(t,e);if(!inBounds(x,y))return false;return receive(at(g,x,y).entity,item);}
function stage(g){const total=g.produced; const tasks=[
  [()=>g.builds.belt>=1,'Förderband errichten'],
  [()=>g.builds.smelter>=1,'Schmelzofen errichten'],
  [()=>total.plate>=3,'Drei Metallplatten herstellen'],
  [()=>g.builds.assembler>=1,'Munitionsfabrik errichten'],
  [()=>g.builds.turret>=1,'Geschützturm errichten'],
  [()=>g.wave>=3&&g.base.hp>0,'Drei Angriffswellen überstehen']];
 while(g.storyStep<tasks.length&&tasks[g.storyStep][0]()){g.storyStep++;g.wallet.metal+=14;g.wallet.crystal+=2;g.points+=100;g.log.unshift('KAMPAGNE: Ziel erfüllt! +14 Metall, +2 Kristalle');}
 if(g.storyStep>=tasks.length){g.won=true;}
 return tasks[Math.min(g.storyStep,tasks.length-1)][1];
}
function spawnWave(g){g.wave++;g.nextWave=45+Math.max(0,6-g.wave)*3;for(let i=0;i<4+g.wave*2;i++)g.enemies.push({x:15.4+i*.7,y:5+(i%3-1)*.8,hp:24+g.wave*6,max:24+g.wave*6,speed:.48+g.wave*.035,hit:0});g.log.unshift('WARNUNG: Feindwelle '+g.wave+' nähert sich!');}
function tick(g,dt=.1){if(g.paused||g.over)return g;dt=Math.min(Math.max(dt,0),.3);g.time+=dt;g.nextWave-=dt; if(g.nextWave<=0)spawnWave(g);
 const ents=g.tiles.filter(t=>t.entity);const gens=ents.filter(t=>t.entity.type==='generator');let supply=0,load=0;
 for(const t of gens){let e=t.entity;if(e.buffer==='coal'){e.buffer=null;g.wallet.coal+=4;}if(g.wallet.coal>0){e.progress+=dt;if(e.progress>=3){e.progress-=3;g.wallet.coal--; }supply+=4;}}
 for(const t of ents)if(['miner','smelter','assembler','turret'].includes(t.entity.type))load+=t.entity.type==='turret'?2:1;
 const powered=supply>=load&&supply>0;g.power={supply,load};
 // Resolve belts in reverse movement order to prevent multi-cell instant jumps.
 const belts=ents.filter(t=>t.entity.type==='belt').sort((a,b)=>b.x-a.x||b.y-a.y);
 for(const t of belts){let e=t.entity;if(e.buffer){e.progress+=dt;if(e.progress>=.62&&send(g,t,e,e.buffer)){e.buffer=null;e.progress=0;}}}
 for(const t of ents){let e=t.entity;if(e.type==='miner'&&powered){const item=t.ground;if(t.qty>0){e.progress+=dt;if(e.progress>=2.1){const [x,y]=forward(t,e);let output=inBounds(x,y)&&receive(at(g,x,y).entity,item);if(output){e.progress=0;t.qty--;g.produced.ore+=(item==='ore'?1:0);if(item==='crystal')g.wallet.crystal++;if(item==='coal')g.wallet.coal+=2;}}}}
 else if(e.type==='smelter'&&powered){if(e.buffer==='ore'){e.progress+=dt;if(e.progress>=2.6){if(send(g,t,e,'plate')){e.buffer=null;e.progress=0;g.produced.plate++;g.wallet.metal+=2;g.points+=2;}}}}
 else if(e.type==='assembler'&&powered){if(e.buffer==='plate'){e.progress+=dt;if(e.progress>=3){if(send(g,t,e,'ammo')){e.progress=0;e.buffer=null;g.produced.ammo++;g.stock.ammo+=3;g.points+=5;}else if(g.stock.ammo<130){e.progress=0;e.buffer=null;g.stock.ammo+=3;g.produced.ammo++;}}}}
 else if(e.type==='turret'){if(e.buffer==='ammo'){g.stock.ammo+=2;e.buffer=null;}if(powered){e.progress+=dt;let closest=null,dist=3.9;for(const enemy of g.enemies){const d=Math.hypot(enemy.x-t.x,enemy.y-t.y);if(enemy.hp>0&&d<dist){closest=enemy;dist=d;}}
 if(closest&&e.progress>=.5&&g.stock.ammo>0){e.progress=0;g.stock.ammo--;closest.hp-=16;g.shots.push({x:t.x,y:t.y,tx:closest.x,ty:closest.y,life:.16});}}}
 }
 for(const enemy of g.enemies){if(enemy.hp<=0)continue;let vx=g.base.x-enemy.x,vy=g.base.y-enemy.y,dist=Math.hypot(vx,vy);if(dist>1.05){enemy.x+=vx/dist*enemy.speed*dt;enemy.y+=vy/dist*enemy.speed*dt;}else {enemy.hit+=dt;if(enemy.hit>=.9){enemy.hit=0;g.base.hp=Math.max(0,g.base.hp-8);}}}
 g.enemies=g.enemies.filter(e=>{if(e.hp<=0){g.kills++;g.wallet.metal+=3;g.points+=12;return false;}return e.x<17&&e.hp>0;});g.shots=g.shots.filter(s=>(s.life-=dt)>0);
 if(g.base.hp<=0){g.over=true;g.log.unshift('KERNZERSTÖRUNG: Mission gescheitert.');}
 g.objective=stage(g);return g;}
function repair(g){if(g.wallet.metal<20||g.base.hp>=g.base.max)return false;g.wallet.metal-=20;g.base.hp=Math.min(g.base.max,g.base.hp+65);return true;}
function validSave(obj){return !!obj&&obj.version===1&&Array.isArray(obj.tiles)&&obj.tiles.length===W*H&&obj.wallet&&obj.base&&Array.isArray(obj.enemies);}
return {W,H,DIRS,COST,PRICES,newGame,build,remove,tick,repair,stage,validSave,at,canBuild};
});
