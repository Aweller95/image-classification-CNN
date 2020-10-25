const modelURL = 'https://teachablemachine.withgoogle.com/models/xZaleX1J0/';

const modelLoaded = () =>  {
  console.log('Model Loaded!');
  document.getElementById("go").addEventListener("click", startClassification);
}

const classifier = ml5.imageClassifier(`${modelURL}model.json`, modelLoaded);

const classify = () => {
  const images = document.getElementsByClassName('image');

  return Promise.all([...images].map(img => classifier.classify(img, (err, results) => results)));
}

function createImageThumbnail(files) {
	for (let i = 0; i < files.length; i++) {
		const file = files[i];
		const preview = document.getElementById('img_container');
		
		if (!file.type.startsWith('image/')){ continue }
		
		const img = document.createElement("img");
		img.classList.add("image");
    img.file = file;
    img.crossorigin = 'anonymous';
		preview.appendChild(img); // Assuming that "preview" is the div output where the content will be displayed.
		
		const reader = new FileReader();
		reader.onload = (function(aImg) { return function(e) { aImg.src = e.target.result; }; })(img);
		reader.readAsDataURL(file);
  }
}

const startClassification = () => {
  const imageFiles = document.getElementById('input').files;
  createImageThumbnail(imageFiles);
  
  setTimeout(() => {
    classify().then(result => console.log(result));
  }, 500);
}
