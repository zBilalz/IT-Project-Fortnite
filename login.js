


function inloggen(event) { 
    event.preventDefault(); 
    let loginFormData = new FormData(event.target);
    let name = loginFormData.get("username"); 
    let wachtwoord = loginFormData.get("password");
    if (name == "admin" && wachtwoord == "admin") {
        alert("ingelogd");
        localStorage.setItem('heeftIngelogd', true);
        window.location.href = "index.html";

    }

    else {
        alert("Verkeerde login gegevens");
    }
   
}

document.getElementById("loginForm").addEventListener("submit", inloggen);