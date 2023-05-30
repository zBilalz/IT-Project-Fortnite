let modalFav = document.getElementById("modalFav");
let spanFav = document.getElementsByClassName("close")[0];
let favChanged = document.getElementById("favChanged").value;

if (favChanged == "true") {
    modalFav.style.display = "block";
}

spanFav.onclick = function() {
    modalFav.style.display = "none";
  }
  