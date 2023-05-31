let knopNote = document.getElementById("buttonAddNote");
let errorNote = document.getElementById("errorNote");

let modalNote = document.getElementById("modalNote");
let spanNote = document.getElementsByClassName("close");
let noteButton = document.getElementById("knopNotitie");

let charItem = document.getElementsByClassName("charItem");
let modalItem = document.getElementById("modalItem");
let activeItem = document.getElementById("activeItem");

let images = document.getElementsByClassName("item");

let deleteItem = document.getElementsByClassName("deleteItem");

/*-----------*/

let knoppen = document.getElementsByClassName("knopKD");
let pW = document.getElementById("aantalWins");
let pL = document.getElementById("aantalLosses");
let winCounter = 0;
let losCounter = 0;

for (let i = 0; i < knoppen.length; i++) {
    knoppen[i].addEventListener("click", () => {
        if (i == 0) {
            winCounter+=1;
            pW.textContent = winCounter;
        }
        else {
            losCounter+=1;
            pL.textContent = losCounter;
        }
    })
    
}

/*-----------*/



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
          
            activeItem.value =   `item${i+1}`;
            
            modalItem.style.display = "block";
    })
    
}

for (let i = 0; i < deleteItem.length; i++) {
    deleteItem[i].addEventListener("click", () => {
        window.location.href = `/favoriet-overzicht/${document.getElementById("fav-name").textContent}/deleteItem/item${i+1}`;
            
    })
    
}

for (let i = 0; i < images.length; i++) {
    
    images[i].addEventListener("click", () => {
        window.location.href = `/favoriet-overzicht/${document.getElementById("fav-name").textContent}/addItem/${activeItem.value}/${images[i].alt}`;
    })
    
}



noteButton.onclick = function() {
    modalNote.style.display = "block";
}
    

for (let i = 0; i < spanNote.length; i++) {
    spanNote[i].addEventListener("click", () => {
        modalNote.style.display = "none";
        modalItem.style.display = "none";
        errorNote.textContent = "";
    })
    
}

  
  
  window.onclick = function(event) {
    if (event.target == modalNote || event.target == modalItem) {
        modalNote.style.display = "none";
        modalItem.style.display = "none"
        errorNote.textContent = "";
    }
  }




