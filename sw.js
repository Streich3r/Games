const CACHE='ivy-automation-shell-v1';
const FILES=['./','./index.html','./style.css','./app.js','./engine.js','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('ivy-automation-shell-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==self.location.origin)return;e.respondWith(fetch(r).then(res=>{if(res.ok){const c=res.clone();e.waitUntil(caches.open(CACHE).then(cache=>cache.put(r,c)));}return res;}).catch(()=>caches.match(r).then(cached=>cached||caches.match('./index.html'))));});
