let links = document.querySelectorAll(".project");
let modal = document.getElementById("modalLanding");
let span = document.getElementsByClassName("close")[0];
let ingelogd = document.getElementById("ingelogd").value;
let pModal = document.getElementById("modalTextIndex");

function controleren(i) {
     
        if (i == 1) {
            if (ingelogd == "true") {
                window.location.href = "\home";
            }
            else {
                modal.style.display = "block";
            }
        }
        else {
            
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
    