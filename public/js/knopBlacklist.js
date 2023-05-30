
let knopBlacklist = document.getElementsByClassName("blacklist")[0];

    
let  modalBlackList = document.getElementById("ModalSkinBlackList");
let spanBlackList = document.getElementsByClassName("close")[1];
    
   
knopBlacklist.onclick = function() {
  modalBlackList.style.display = "block";
  
}

spanBlackList.onclick = function() {
  modalBlackList.style.display = "none";
}

window.onclick = function(event) {
if (event.target == modalBlackList || event.target ==  modalFav) {
modalBlackList.style.display = "none";
modalFav.style.display = "none";
}
}
        


   
          
    
