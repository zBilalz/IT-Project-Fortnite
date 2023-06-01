let knoppen = document.getElementsByClassName("blacklistIcon change");
let id;
let modalChange = document.getElementById("ModalChangeReason");
let spanChange = document.getElementsByClassName("close")[0];


for (let i = 0; i < knoppen.length; i++) {
    knoppen[i].addEventListener("click", () => {
        id = i;
        modalChange.style.display = "block";
    })
    
}

function redirect(event) {
    changeReasonForm.action=`/blacklist/${id}/change`;
    changeReasonForm.submit();
}

document.getElementById("changeReasonForm").addEventListener("submit", redirect);


spanChange.onclick = function() {
    modalChange.style.display = "none";
  }
  
  window.onclick = function(event) {
    if (event.target == modalChange) {
        modalChange.style.display = "none";
    }
  }