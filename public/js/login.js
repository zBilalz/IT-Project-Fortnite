const wrapper = document.querySelector('.wrapper');
const loginlink = document.querySelector('.login-link');
const registerLink = document.querySelector('.register-link');
let modalLogin = document.getElementById("modalLogin");
let spanLogin = document.getElementsByClassName("close")[0];
let registratie = document.getElementById("registratie").value;

registerLink.addEventListener('click',()=> {
    console.log("hallo");
    wrapper.classList.add('active')
})

loginlink.addEventListener('click',()=> {
    wrapper.classList.remove('active')
})

if (registratie == "true") {
    modalLogin.style.display = "block";
}

spanLogin.onclick = function() {
    modalLogin.style.display = "none";
  }
  
  window.onclick = function(event) {
    if (event.target == modalLogin) {
        modalLogin.style.display = "none";
    }
  }