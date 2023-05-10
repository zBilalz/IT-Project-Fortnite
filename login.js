


function inloggen(event) { 
    event.preventDefault(); 
    let loginFormData = new FormData(event.target);
    let name = loginFormData.get("username"); 
    let wachtwoord = loginFormData.get("password");
    if (name == "admin" && wachtwoord == "admin") {
        localStorage.setItem('heeftIngelogd', true);
        window.location.href = "index.html";

    }

    else {
        
    }
   
}

document.getElementById("loginForm").addEventListener("submit", inloggen);