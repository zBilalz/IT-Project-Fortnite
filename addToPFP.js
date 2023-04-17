let divAvatar = document.getElementById("avatar")
let divavatarImage;
let displayedCharacter = document.getElementById("skin-image").src;
let button = document.getElementById("knopAvatar");
let img = document.createElement("img");
img.setAttribute("id","avatarImage");
//<img id="avatarImage" src="" alt="">
button.addEventListener("click",()=>{
    divAvatar.innerHTML = "";

    img.setAttribute("src",displayedCharacter);
    divAvatar.appendChild(img);
})
