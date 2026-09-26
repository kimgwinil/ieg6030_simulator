/* IEG-6030 시뮬레이터 서비스 워커 — 앱 설치(PWA) 및 오프라인 실행 지원
 * - HTML/JS/CSS: 네트워크 우선 (항상 최신 버전 사용, 오프라인일 때만 캐시)
 * - 이미지: 캐시 우선 (한 번 본 모듈·교재 이미지는 오프라인에서도 표시)
 */
const CACHE = 'ieg6030-v15';
const CORE = [
  './', './index.html', './manifest.webmanifest',
  './css/main.css?v=15', './css/workbench.css?v=15', './css/curriculum.css?v=15',
  './js/app.js?v=15',
  './assets/app/icon-192.png', './assets/app/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  const isImage = /\.(png|jpe?g|gif|svg|webp)$/i.test(new URL(req.url).pathname);
  if (isImage) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    })));
  } else {
    e.respondWith(fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req).then(hit => hit || caches.match('./index.html'))));
  }
});
