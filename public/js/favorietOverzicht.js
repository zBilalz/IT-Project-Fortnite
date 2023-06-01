let knopNote = document.getElementById("buttonAddNote");
let errorNote = document.getElementById("errorNote");

let modalNote = document.getElementById("modalNote");
let spanNote = document.getElementsByClassName("close");
let noteButton = document.getElementById("knopNotitie");

let charItem = document.getElementsByClassName("charItem");
let modalItem = document.getElementById("modalItem");
let activeItem = "";

let images = document.getElementsByClassName("item");

let deleteItem = document.getElementsByClassName("deleteItem");





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
          
            activeItem =   `item${i+1}`;
            console.log(activeItem);
            
            modalItem.style.display = "block";
    })
    
}

for (let i = 0; i < deleteItem.length; i++) {
    deleteItem[i].addEventListener("click", () => {
        for (let j = 0; j < deleteItem.length; j++) {
            deleteItem[j].disabled  = true;
            
        }

        window.location.href = `/favoriet-overzicht/${document.getElementById("fav-name").textContent}/deleteItem/item${i+1}`;
            
    })
    
}

for (let i = 0; i < images.length; i++) {
    
    images[i].addEventListener("click", () => {
        window.location.href = `/favoriet-overzicht/${document.getElementById("fav-name").textContent}/addItem/${activeItem}/${images[i].alt}`;
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




