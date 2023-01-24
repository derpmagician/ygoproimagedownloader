const fs = require('fs');
const download = require('image-downloader');
const rawData = fs.readFileSync('card_info.json');
const data = JSON.parse(rawData).data;
const folder = "cards"
// Archivo actualizado en https://ygoprodeck.com/api-guide/
let index = 0;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
console.log("La api en este momento tiene", data.length, "cartas");
start();

async function start() {
  crear_carpetas()
  crear_nuevo_json()
  for (let key = index; key < data.length; key++) {
    const card = data[key];
    descarga(card);
    // La api nos obliga a un maximo de 20 llamadas por segundo
    await wait(650);
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
    let subfolder = separar_imagenes(card)
    // Encontrar el indice en donde esta el punto (.) para determinar en que indice esta la extension
    const punto = url.lastIndexOf('.');
    const extension = url.substring(punto + 1);

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

function separar_imagenes(card) {
  if (card.type.includes('onster')) return 'monsters';
  else if (card.type.includes('oken')) return 'tokens';
  else if (card.type.includes('pell')) return 'spells';
  else if (card.type.includes('kill')) return 'skills';
  else return 'traps';
}

function crear_nuevo_json() {
  for (let i = 0; i < data.length; i++) {
    if (data[i].type === "XYZ Monster") {
      data[i].rank = data[i].level;
      delete data[i].level;
    }
  }
  const modified_file = './modified_card_info.json';
  fs.writeFileSync(modified_file, JSON.stringify(data))
  console.log("Nuevo modified_card_info.json creado")
}