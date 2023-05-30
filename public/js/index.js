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

for (let i = 0; i < links.length; i++) {
    
    links[i].addEventListener("click", () =>{
        controleren(i)
    })
}

span.onclick = function() {
    modal.style.display = "none";
  }
  
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
     
    }
  }
    