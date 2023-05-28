let knoppen = document.getElementsByClassName("knopKD");
let knopNotitie = document.getElementById("knopNotitie");
let pW = document.getElementById("aantalWins")
let pL = document.getElementById("aantalLosses")
let pNotitie = document.getElementById("notitie")
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

knopNotitie.addEventListener("click",()=>{
    let notitie = prompt("Notitie bewerken:", "");
            if (notitie == null || notitie == "") {
              
            } else {
              pNotitie.textContent = notitie;
            }
})