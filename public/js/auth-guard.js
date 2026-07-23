(function() {
  const token = localStorage.getItem('token');
  const utilisateur = JSON.parse(localStorage.getItem('utilisateur') || '{}');

  if (!token) {
    window.location.href = '/index.html';
    return;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      localStorage.removeItem('utilisateur');
      window.location.href = '/index.html';
      return;
    }
  } catch(e) {
    localStorage.removeItem('token');
    localStorage.removeItem('utilisateur');
    window.location.href = '/index.html';
  }

  window.currentUser = utilisateur;
  window.authToken = token;
})();
