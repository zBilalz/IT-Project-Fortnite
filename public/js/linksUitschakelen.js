
// functie afkomstig van https://stackoverflow.com/questions/70000007/how-to-disable-all-other-links-in-a-div-on-click-of-a-link-in-div-using-javascri,
//dit is om alle links uit te schakelen wanneer de gebruiker op 1 van de links clickt, zo kan er geen error onstaan wanneer de gebruiker
//bijvoorbeeld twee calls probeerd te doen naar de database tegelijkertijd
function disableButtons() {
    const links = document.querySelectorAll("a");
  
    links.forEach(function(link) {
      link.classList.add('disabled');
    });
  }
