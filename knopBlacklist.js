
let blacklist = document.getElementById("blacklist");
let knopBlacklist = document.getElementsByClassName("buttonBlacklist")
let blacklistButton = document.createElement("button");
blacklistButton.setAttribute("class","buttonBlacklist")
let blacklistIcon = document.createElement("i");
    
  
blacklistIcon.setAttribute("class","bi bi-eye");
blacklistIcon.setAttribute("id","0");
blacklistButton.appendChild(blacklistIcon);
    blacklist.appendChild(blacklistButton);
    
   
    
  for (let i = 0; i < knopBlacklist.length; i++) {
    knopBlacklist[i].addEventListener("click", () => {
       
        if (knopBlacklist[i].children[0].id == "0") {
          
            let redenBlacklist = prompt("Reden voor blacklisten:", "");
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