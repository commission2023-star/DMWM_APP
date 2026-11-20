if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker
      .register("/service-worker.js")
      .catch(function (erreur) {
        console.warn("Service worker non enregistré :", erreur);
      });
  });
}
