let knopNote = document.getElementById("buttonAddNote");
let errorNote = document.getElementById("errorNote");

let modalNote = document.getElementById("modalNote");
let spanNote = document.getElementsByClassName("close")[0];
let noteButton = document.getElementById("knopNotitie");

let charItem = document.getElementsByClassName("charItem");
let modalItem = document.getElementById("modalItem");
let spanItem = document.getElementsByClassName("close")[0];




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


for (let i = 0; i < charItem.length; i++) {
    charItem[i].addEventListener("click", () => {
            modalItem.style.display = "block";
    })
    
}



noteButton.onclick = function() {
    modalNote.style.display = "block";
}
    


spanNote.onclick = function() {
    modalNote.style.display = "none";
    errorNote.textContent = "";
  }

  

spanItem.onclick = function() {
    modalItem.style.display = "none";
  }
  
  window.onclick = function(event) {
    if (event.target == modalNote || event.target == modalItem) {
        modalNote.style.display = "none";
        modalItem.style.display = "none"
        errorNote.textContent = "";
    }
  }




