const genderModel = 'https://teachablemachine.withgoogle.com/models/N4LSeLyfv/';
const withHatModel =
  'https://teachablemachine.withgoogle.com/models/F-uJf71tq/';
const withGlassesModel =
  'https://teachablemachine.withgoogle.com/models/c3VUfi5Q1/';

const modelLoaded = () => {
  console.log('gender model loaded!');
  document.getElementById('go').addEventListener('click', startClassification);
};

const genderClassifier = ml5.imageClassifier(
  `${genderModel}model.json`,
  modelLoaded,
);
const hasHatClassifier = ml5.imageClassifier(`${withHatModel}model.json`, () =>
  console.log('hasHat model loaded!'),
);
const hasGlassesClassifier = ml5.imageClassifier(
  `${withGlassesModel}model.json`,
  () => console.log('hasGlasses model loaded!'),
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
      labelData.push(
        `Person is ${classifier1Label} (${classifier1Confidence}%)`,
      );
      continue;
    } else if (classifier2Confidence >= 90) {
      labelData.push(
        `Person is ${classifier2Label} (${classifier2Confidence}%)`,
      );
      continue;
    }

    if (classifier1Confidence >= 70) {
      labelData.push(
        `Person is probably ${classifier1Label} (${classifier1Confidence}%)`,
      );
      continue;
    } else if (classifier2Confidence >= 70) {
      labelData.push(
        `Person is probably ${classifier1Label} (${classifier2Confidence}%)`,
      );
      continue;
    }

    if (classifier1Confidence <= 50) {
      labelData.push(
        `Person might be ${classifier1Label} (${classifier1Confidence}%)`,
      );
      continue;
    } else if (classifier2Confidence <= 50) {
      labelData.push(
        `Person might be ${classifier1Label} (${classifier2Confidence}%)`,
      );
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
