const fs = require('fs');
const download = require('image-downloader');
const rawData = fs.readFileSync('card_info.json');
const data = JSON.parse(rawData).data;
const folder = "cards"
// updated card_info here https://ygoprodeck.com/api-guide/
let index = 0;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

start();

async function start() {
  crear_carpetas()
  for (let key = index; key < data.length; key++) {
    const card = data[key];

    descarga(card);
    // La api nos obliga a un maximo de 20 llamadas por segundo
    await wait(700);
  }
}

function crear_carpetas() {
  const subfolders = [`${folder}/monsters`, `${folder}/spells`, `${folder}/skills`,`${folder}/traps`, `${folder}/tokens`];
  subfolders.forEach((subfolder) => {
    fs.mkdir(subfolder, { recursive: true }, (err) => {
      if (err) throw err;
      console.log(`Carpeta ${subfolder} creada con éxito`);
    });
  });
}


function descarga(card) {
  // Donde esta la imagen
  const url = card.card_images[0].image_url;

  if (typeof url != 'undefined') {
    const name = card.name.replace(/[/\\?%*:|"<>]/g, '');

    let subfolder = '';
    if (card.type.includes('onster')) subfolder = 'monsters';
    else if (card.type.includes('oken')) subfolder = 'tokens';
    else if (card.type.includes('pell')) subfolder = 'spells';
    else if (card.type.includes('kill')) subfolder = 'skills';
    else subfolder = 'traps';

    // Encontrar el indice en donde esta el punto (.) para determinar en que indice esta la extension
    const n = url.lastIndexOf('.');
    const extension = url.substring(n + 1);

    // Generar el nombre completo del archivo de destino
    const fileDest = `../../${folder}/${subfolder}/${name}_${card.race}_${card.type}_${
      (card.type.includes('XYZ')  && card.level) ? '_rank' + card.level : (card.level ? '_lvl' + card.level : '')
    }${card.linkval ? '_link' + card.linkval : ''}${card.attribute ? '_' + card.attribute : ''}_id${card.id}.${extension}`;

    // Comprobar si el archivo ya existe
    if (!fs.existsSync(fileDest)) {
      download
        .image({ url: url, dest: fileDest, })
        .catch((err) => console.log(name, url, "err"));
    }
  }
}