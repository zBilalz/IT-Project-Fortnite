function clearLocalStorage() {
    localStorage.clear();
}

window.onbeforeunload = clearLocalStorage;