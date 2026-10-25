// Cache limité à cette application ; ressources préchargées sous leur URL sans query-string.
const CACHE_PREFIX='royaume-ce2-';
const CACHE=CACHE_PREFIX+'v82566-cognitive-challenge';
const FILES=["./","./index.html","./style.css","./scroll-guides.js","./game.js","./recovery.js","./data.js","./pedagogy.js","./punctuation-rich.js","./lunettes-rich.js","./dialogue-pedagogy.js","./challenge.js","./challenge-data.js","./challenge-pedagogy.js","./challenge.css","./manifest.webmanifest","./icon-192.png","./icon-512.png","./apple-touch-icon.png","./favicon-32.png","./hero-1.svg","./hero-2.svg","./hero-3.svg","./hero-4.svg","./hero-5.svg","./hero-6.svg","./hero-7.svg","./hero-8.svg","./hero-9.svg","./hero-10.svg","./hero-11.svg","./hero-12.svg","./hero-1.webp","./hero-2.webp","./hero-3.webp","./hero-4.webp","./hero-5.webp","./hero-6.webp","./hero-7.webp","./hero-8.webp","./hero-9.webp","./hero-10.webp","./hero-11.webp","./hero-12.webp","./recompense-01.webp","./recompense-02.webp","./recompense-03.webp","./recompense-04.webp","./recompense-05.webp","./recompense-06.webp","./recompense-07.webp","./recompense-08.webp","./recompense-09.webp","./recompense-10.webp","./recompense-11.webp","./recompense-12.webp","./recompense-13.webp","./recompense-14.webp","./recompense-15.webp","./recompense-16.webp","./recompense-17.webp","./recompense-18.webp","./recompense-19.webp","./recompense-20.webp","./recompense-21.webp","./recompense-22.webp","./recompense-23.webp","./recompense-24.webp","./recompense-25.webp","./recompense-26.webp","./recompense-27.webp","./recompense-28.webp","./recompense-29.webp","./recompense-30.webp"];
// Installer impérativement le noyau du jeu ; tenter les visuels en complément.
const CORE=["./","./index.html","./style.css","./game.js","./recovery.js",
  "./data.js","./pedagogy.js","./punctuation-rich.js","./lunettes-rich.js",
  "./dialogue-pedagogy.js","./challenge.js","./challenge-data.js","./challenge-pedagogy.js","./challenge.css",
  "./scroll-guides.js","./manifest.webmanifest"];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(async cache=>{
    await cache.addAll(CORE);
    const optional=FILES.filter(url=>!CORE.includes(url));
    await Promise.allSettled(optional.map(url=>cache.add(url)));
  }).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith(CACHE_PREFIX)&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET'||new URL(request.url).origin!==self.location.origin)return;
  const canonical=new URL(request.url);
  // Les versions ?v=... ne doivent pas empêcher la lecture du précache hors-ligne.
  canonical.searchParams.delete('v');
  const cacheRequest=canonical.href;
  if(request.mode==='navigate'){
    event.respondWith(fetch(request).catch(()=>caches.match('./index.html')));
    return;
  }
  event.respondWith(fetch(request).then(response=>{
    if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(cacheRequest,copy)).catch(()=>{});}
    return response;
  }).catch(async()=>await caches.match(request)||await caches.match(cacheRequest)));
});
