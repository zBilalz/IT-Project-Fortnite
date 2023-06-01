const wrapper = document.querySelector('.wrapper');
const loginlink = document.querySelector('.login-link');
const registerLink = document.querySelector('.register-link');
let modalLogin = document.getElementById("modalLogin");
let spanLogin = document.getElementsByClassName("close")[0];
let registratie = document.getElementById("registratie").value;
let errorRegistratie = document.getElementById("errorRegistratie").value;

let modalUsername = document.getElementById("modalUsername");

registerLink.addEventListener('click',()=> {
    wrapper.classList.add('active')
})

loginlink.addEventListener('click',()=> {
    wrapper.classList.remove('active')
})

if (registratie == "true") {
    modalLogin.style.display = "block";
}

if (errorRegistratie == "true") {
    modalUsername.style.display = "block";
}
spanLogin.onclick = function() {
    modalLogin.style.display = "none";
    modalUsername.style.display = "none";
  }
  
  window.onclick = function(event) {
    if (event.target == modalLogin || event.target == modalUsername) {
        modalLogin.style.display = "none";
        modalUsername.style.display = "none";
    }
  }