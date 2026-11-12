/* IVY FORGE V2: offline-first shell, network-first updates, no user saves cached. */
const CACHE='ivy-automation-shell-v2';
const FILES=['./','./index.html','./style.css','./app.js','./visuals.js','./engine.js','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable-512.png','./apple-touch-icon.png','./favicon-32.png','./assets/vision.png'];
self.addEventListener('install',event=>event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  await cache.addAll(FILES);
  await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(k=>k.startsWith('ivy-automation-shell-')&&k!==CACHE).map(k=>caches.delete(k)));
  await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET'||new URL(req.url).origin!==self.location.origin)return;
  const url=new URL(req.url);
  const navigate=req.mode==='navigate'||url.pathname.endsWith('/index.html');
  event.respondWith((async()=>{
    try{
      const res=await fetch(req,{cache:'no-cache'});
      if(res.ok){const clone=res.clone();event.waitUntil(caches.open(CACHE).then(c=>c.put(req,clone)).catch(()=>{}));}
      return res;
    }catch(e){
      const cached=await caches.match(req);if(cached)return cached;
      if(navigate){const fallback=await caches.match(new URL('./index.html',self.registration.scope));if(fallback)return fallback;}
      return Response.error();
    }
  })());
});
