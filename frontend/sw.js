/* Inforia — Service Worker
 * ホーム画面から起動できるようにするための最小構成。
 * 更新が反映されないことを避けるため、通信できるときは常に最新のファイルを取りに行き、
 * 通信できないときだけ保存済みのファイルを使う(ネットワーク優先)。
 */
const CACHE = "inforia-v1";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  event.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
        return res;
      })
      .catch(() => caches.match(req))
  );
});
