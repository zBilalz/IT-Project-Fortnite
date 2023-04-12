
import  { avatarNamen } from './test.js';
let favoriet = document.getElementById("ster");
let knopFavoriet = document.getElementsByTagName("button")
let starButton = document.createElement("button");
    starButton.setAttribute("class","buttonFavoriet")
    let star = document.createElement("i");
      
    star.setAttribute("class","bi bi-star");
    star.setAttribute("id","0")
    starButton.appendChild(star);
    favoriet.appendChild(starButton);
console.log(avatarNamen);
  
  for (let i = 0; i < knopFavoriet.length; i++) {
    knopFavoriet[i].addEventListener("click", () => {
     
        if (knopFavoriet[i].children[0].id == "0") {
          knopFavoriet[i].children[0].setAttribute("class","bi bi-star-fill");
          knopFavoriet[i].children[0].setAttribute("style","color: rgb(255, 210, 48)");
          knopFavoriet[i].children[0].setAttribute("id","1")
        }
        else {
          knopFavoriet[i].children[0].setAttribute("class","bi bi-star");
          knopFavoriet[i].children[0].setAttribute("style","color: rgb(128, 128, 128)");
          knopFavoriet[i].children[0].setAttribute("id","0")
        }
      });
    }