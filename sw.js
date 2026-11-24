const CACHE = 'english-daily-v15';
const CORE = ['./', './index.html', './manifest.json', './data/a1.json'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('english-daily-') && key !== CACHE).map(key => caches.delete(key)))));
  self.clients.claim();
});
self.addEventListener('fetch', event => {
  const request = event.request, url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  const appFile = url.pathname.endsWith('/') || url.pathname.endsWith('/index.html') || url.pathname.endsWith('/data/a1.json') || url.pathname.endsWith('/manifest.json');
  if (!appFile) return;
  event.respondWith(fetch(request, {cache:'no-store'}).then(response => {
    if (response && response.ok) caches.open(CACHE).then(cache => cache.put(request, response.clone())).catch(() => {});
    return response;
  }).catch(async () => (await caches.match(request)) || (url.pathname.endsWith('/data/a1.json') ? (await caches.match('./data/a1.json')) : (await caches.match('./index.html'))) || Response.error()));
});
