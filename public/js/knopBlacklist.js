
let knopBlacklist = document.getElementsByClassName("blacklist")[0];

    
let  modalBlackList = document.getElementById("ModalSkinBlackList");
let spanBlackList = document.getElementsByClassName("close")[1];
    
   
knopBlacklist.onclick = function() {
  modalBlackList.style.display = "block";
  
}

spanBlackList.onclick = function() {
  console.log("hallo");
  modalBlackList.style.display = "none";
}

window.onclick = function(event) {
if (event.target == modalBlackList || event.target ==  modalFav) {
modalBlackList.style.display = "none";
modalFav.style.display = "none";
}
}
        


   
          
         /*
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
    }*/

