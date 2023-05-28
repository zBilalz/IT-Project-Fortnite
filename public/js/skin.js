const apiUrl = 'https://fortnite-api.com/v2/cosmetics/br';

async function getFortniteSkins() {
  const response = await fetch(apiUrl);
  const data = await response.json();

  const skins = data.data.filter(item => item.type.value === 'outfit');

  const container = document.querySelector('.skinContainer');

  for (let index = 0; index < 12; index++) {
    const skin = skins[index];

    if(skin.name != "null"){
    const skinDiv = document.createElement('div');
    skinDiv.classList.add('skin');

    const skinImg = document.createElement('img')
    skinImg.src = skin.images.icon;

    const skinName = document.createElement('div');

    skinName.classList.add('skin-name');
    skinName.innerText = skin.name;

    skinImg.addEventListener("click", () => {
      window.open(`/skin?name=${encodeURIComponent(skin.name)}&image=${encodeURIComponent(skin.images.icon)}&backstory=${encodeURIComponent(skin.description)}`, "_self")})
      
      function goBack() {
        window.history.back();
      }
  
    skinDiv.appendChild(skinImg);
    skinDiv.appendChild(skinName);
    container.appendChild(skinDiv);
    }
  }
}

getFortniteSkins();