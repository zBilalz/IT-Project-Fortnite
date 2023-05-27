let links = document.querySelectorAll(".project");
let huidigeId = 0;
var modal = document.getElementById("modalLanding");
var span = document.getElementsByClassName("close")[0];

let pModal = document.getElementById("modalTextIndex");

function controleren(i) {
    if (heeftIngelogd()) {
        if (i == 1) {
            
            window.location.href = "home.html";
        }
        else {
            pModal.textContent = "Je hebt geen toegang tot deze project.";
            modal.style.display = "block";
          
        }
    }
    else {
        pModal.textContent = "Log eerst in.";
        modal.style.display = "block";
    
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

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    modal.style.display = "none";
  }
  
  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
    