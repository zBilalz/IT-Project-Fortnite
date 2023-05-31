let knopNote = document.getElementById("buttonAddNote");
let errorNote = document.getElementById("errorNote");

let modalNote = document.getElementById("modalNote");
let spanNote = document.getElementsByClassName("close")[0];
let noteButton = document.getElementById("knopNotitie");


function controle(event) {
    let note = document.getElementById("notitie").value;
    if (note.length < 1 ) {
        event.preventDefault();
        errorNote.textContent = "Add a note";
    }
    else {
        
    }
}

function controleDelete (event) {
    let notitie = document.getElementById("emptyNote").value;
    if (notitie == "empty") {
        event.preventDefault();
        errorNote.textContent = "Notes already empty";
    }
   
}

document.getElementById("addNoteForum").addEventListener("submit", controle);

document.getElementById("deleteNoteForum").addEventListener("submit", controleDelete);

noteButton.onclick = function() {
    modalNote.style.display = "block";
}
    


spanNote.onclick = function() {
    modalNote.style.display = "none";
    errorNote.textContent = "";
  }
  
  window.onclick = function(event) {
    if (event.target == modalNote) {
        modalNote.style.display = "none";
        errorNote.textContent = "";
    }
  }




