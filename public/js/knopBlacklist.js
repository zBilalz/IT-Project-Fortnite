
let blacklist = document.getElementById("blacklist");

let blacklistButton = document.createElement("button");
blacklistButton.setAttribute("class","buttonBlacklist")
let knopBlacklist = document.getElementsByClassName("buttonBlacklist")[0];
let blacklistIcon = document.createElement("i");
    
var modal = document.getElementById("ModalSkinBlackList");
var span = document.getElementsByClassName("close")[0];
blacklistIcon.setAttribute("class","bi bi-eye");
blacklistIcon.setAttribute("id","0");
blacklistButton.appendChild(blacklistIcon);
    blacklist.appendChild(blacklistButton);
    
   
    
  for (let i = 0; i < knopBlacklist.length; i++) {
    knopBlacklist[i].addEventListener("click", () => {
       
        if (knopBlacklist[i].children[0].id == "0") {
          
          modal.style.display = "block";
            if (redenBlacklist == null || redenBlacklist == "") {
              
            } else {
              knopBlacklist[i].children[0].setAttribute("class","bi bi-eye-slash-fill");
          knopBlacklist[i].children[0].setAttribute("id","1");
            }
           
          
        }
        else {
          knopBlacklist[i].children[0].setAttribute("class","bi bi-eye");
          knopBlacklist[i].children[0].setAttribute("id","0");     
        }
      });
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