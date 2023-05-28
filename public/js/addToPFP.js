let divAvatar = document.getElementById("avatar")
let divavatarImage;
let displayedCharacter = document.getElementById("skin-image").src;
let button = document.getElementById("knopAvatar");
let img = document.getElementById("avatarImage")
button.addEventListener("click",()=>{
    

    img.setAttribute("src",displayedCharacter);
    
})
