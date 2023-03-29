const apiUrl = 'https://fortnite-api.com/v2/cosmetics/br';

async function getFortniteSkins() {
  const response = await fetch(apiUrl);
  const data = await response.json();

  const skins = data.data.filter(item => item.type.value === 'outfit');

  const container = document.querySelector('.container');

  for (let index = 0; index < 25; index++) {
    const skin = skins[index];

    if(skin.name != "null"){
    const skinDiv = document.createElement('div');
    skinDiv.classList.add('skin');

    const skinImg = document.createElement('img');
    skinImg.src = skin.images.icon;

    const skinName = document.createElement('div');
    skinName.classList.add('skin-name');
    skinName.innerText = skin.name;

    skinDiv.appendChild(skinImg);
    skinDiv.appendChild(skinName);

    container.appendChild(skinDiv);
    }
  }
}

getFortniteSkins();