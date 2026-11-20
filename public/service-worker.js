// Changer la version (v1 -> v2...) quand les fichiers pré-cachés changent
const VERSION = "v2";
const CACHE_NAME = "dmwm-" + VERSION;

const PRECACHE = [
  "/pointage.html",
  "/offline.html",
  "/css/bootstrap.min.css",
  "/css/fontawesome.min.css",
  "/css/commun.css",
  "/css/pointage.css",
  "/css/offline.css",
  "/js/auth-guard.js",
  "/js/sidebar.js",
  "/js/pwa.js",
  "/js-libs/bootstrap.bundle.min.js",
  "/fonts/fa-solid-900.woff2",
  "/fonts/fa-regular-400.woff2",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        cache.addAll(
          PRECACHE.map((url) => new Request(url, { cache: "reload" })),
        ),
      )
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((noms) =>
        Promise.all(
          noms
            .filter((n) => n.startsWith("dmwm-") && n !== CACHE_NAME)
            .map((n) => caches.delete(n)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/uploads/"))
    return;

  if (req.mode === "navigate") {
    event.respondWith(reseauPuisCache(req));
  } else {
    event.respondWith(cachePuisReseau(event));
  }
});

function peutEtreMisEnCache(rep) {
  return rep.status === 200 && !rep.redirected;
}

async function reseauPuisCache(req) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const rep = await fetch(req);
    if (peutEtreMisEnCache(rep)) cache.put(req, rep.clone());
    return rep;
  } catch (erreur) {
    const copie = await cache.match(req, { ignoreSearch: true });
    return copie || cache.match("/offline.html");
  }
}

async function cachePuisReseau(event) {
  const req = event.request;
  const cache = await caches.open(CACHE_NAME);
  const copie = await cache.match(req);

  const miseAJour = fetch(req)
    .then((rep) => {
      if (peutEtreMisEnCache(rep)) cache.put(req, rep.clone());
      return rep;
    })
    .catch(() => null);

  event.waitUntil(miseAJour);
  return copie || (await miseAJour) || Response.error();
}
