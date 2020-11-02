const models = {
  tenDatapoints: {
    genderModel: 'j62IAURLG',
    glassesModel: '8yNVIeFL8',
    hatModel: '7snH9ESAz',
  },
  thirtyDatapoints: {
    genderModel: 'LiC1m5aQZ',
    glassesModel: '4IskUfVGv',
    hatModel: 'sgxrPrziy',
  },
  fiftyDatapoints: {
    genderModel: 'SZUi3-nQ0',
    glassesModel: 'QsODnJ6qR',
    hatModel: 'NztAi5aMZ',
  },
};

const datapoints = 'fiftyDatapoints';

const modelLoaded = () => {
  console.log(`${datapoints} gender model loaded!`);
  document.getElementById('go').addEventListener('click', startClassification);
};

const buildURL = id =>
  `https://storage.googleapis.com/tm-model/${id}/model.json`;

const genderClassifier = ml5.imageClassifier(
  buildURL(models[datapoints].genderModel),
  modelLoaded,
);
const hasHatClassifier = ml5.imageClassifier(
  buildURL(models[datapoints].hatModel),
  () => console.log(`${datapoints} hat model loaded!`),
);
const hasGlassesClassifier = ml5.imageClassifier(
  buildURL(models[datapoints].glassesModel),
  () => console.log(`${datapoints} glasses model loaded!`),
);

const classify = classifier => {
  const images = document.getElementsByClassName('image');

  return Promise.all(
    [...images].map(img => classifier.classify(img, (err, results) => results)),
  );
};

function createImageThumbnail(files) {
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const preview = document.getElementById('img_container');

    if (!file.type.startsWith('image/')) {
      continue;
    }

    const div = document.createElement('div');
    div.id = `${i}`;
    div.classList.add('image_div');
    preview.appendChild(div);

    const img = document.createElement('img');
    img.classList.add('image');
    img.file = file;
    img.crossorigin = 'anonymous';
    div.appendChild(img);

    const reader = new FileReader();
    reader.onload = (function(aImg) {
      return function(e) {
        aImg.src = e.target.result;
      };
    })(img);
    reader.readAsDataURL(file);
  }
}

const processResults = data => {
  const labelData = [];

  for (let i = 0; i < data.length; i++) {
    const classifier1Label = data[i][0].label;
    const classifier2Label = data[i][1].label;
    const classifier1Confidence = (data[i][0].confidence * 100).toFixed(2);
    const classifier2Confidence = (data[i][1].confidence * 100).toFixed(2);

    if (classifier1Confidence >= 90) {
      labelData.push(`Person is ${classifier1Label}. `);
      continue;
    } else if (classifier2Confidence >= 90) {
      labelData.push(`Person is ${classifier2Label}. `);
      continue;
    }

    if (classifier1Confidence >= 70) {
      labelData.push(`Person is probably ${classifier1Label}. `);
      continue;
    } else if (classifier2Confidence >= 70) {
      labelData.push(`Person is probably ${classifier2Label}. `);
      continue;
    }

    if (classifier1Confidence > classifier2Confidence) {
      labelData.push(`Person might be ${classifier1Label}. `);
      continue;
    } else {
      labelData.push(`Person might be ${classifier2Label}. `);
      continue;
    }
  }
  return labelData;
};

const labelImages = data => {
  for (let i = 0; i < data.length; i++) {
    const div = document.getElementById(`${i}`);
    let labelElement = document.getElementById(`label${i}`);

    if (labelElement) {
      labelElement.innerHTML = `${labelElement.innerHTML} ${data[i]}`;
    } else {
      labelElement = document.createElement('p');
      labelElement.classList.add('label');
      labelElement.id = `label${i}`;
      labelElement.innerHTML = data[i];
      div.appendChild(labelElement);
    }
  }
};

const startClassification = () => {
  const imageFiles = document.getElementById('input').files;
  createImageThumbnail(imageFiles);

  setTimeout(() => {
    classify(genderClassifier).then(result => {
      labelImages(processResults(result));
    });
    classify(hasHatClassifier).then(result => {
      labelImages(processResults(result));
    });
    classify(hasGlassesClassifier).then(result => {
      labelImages(processResults(result));
    });
  }, 1000);
};
