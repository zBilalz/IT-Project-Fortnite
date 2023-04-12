let links = document.querySelectorAll(".project");
let huidigeId = 0;
function controleren(i) {
    if (heeftIngelogd()) {
        if (i == 1) {
            
            window.location.href = "home.html";
        }
        else {
            alert("Je hebt geen toegang tot deze project.");
        }
    }
    else {
        alert("Log eerst in.");
    }

}
    function heeftIngelogd() {
    
    const heeftIngelogd = localStorage.getItem('heeftIngelogd');
    
    return heeftIngelogd === 'true';
  }

for (let i = 0; i < links.length; i++) {
    
    links[i].addEventListener("click", () =>{
        event.preventDefault();
        controleren(i)
    })
}
    