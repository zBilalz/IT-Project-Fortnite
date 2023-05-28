


function inloggen(event) { 
    event.preventDefault(); 
    let loginFormData = new FormData(event.target);
    let name = loginFormData.get("username"); 
    let wachtwoord = loginFormData.get("password");
    if (name == "admin" && wachtwoord == "admin") {
        localStorage.setItem('heeftIngelogd', true);
        window.location.href = "/";

    }

    else {
        
    }
   
}



const wrapper = document.querySelector('.wrapper');
const loginlink = document.querySelector('.login-link');
const registerLink = document.querySelector('.register-link');

registerLink.addEventListener('click',()=> {
    wrapper.classList.add('active')
})

loginlink.addEventListener('click',()=> {
    wrapper.classList.remove('active')
})