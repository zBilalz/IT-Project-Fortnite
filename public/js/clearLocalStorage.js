function clearLocalStorage() {
    localStorage.clear();
  }
  
window.addEventListener('beforeunload', clearLocalStorage);