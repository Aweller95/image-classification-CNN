const modelURL = 'https://teachablemachine.withgoogle.com/models/5Ym0s1f5Y/';

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
        
    const div = document.createElement('div');
    div.id = `${i}`;
    preview.appendChild(div);

		const img = document.createElement("img");
    img.classList.add("image");
    img.file = file;
    img.crossorigin = 'anonymous';
		div.appendChild(img); 
		
		const reader = new FileReader();
		reader.onload = (function(aImg) { return function(e) { aImg.src = e.target.result; }; })(img);
		reader.readAsDataURL(file);
  }
}

const labelImages = (data) => {
  for(let i = 0; i <= data.length; i++){
    const labelData = {};
    
    data[i].forEach(resultObj => {
      labelData[resultObj.label] = `${(resultObj.confidence * 100).toFixed(2)}%`;
    })
    
    const div = document.getElementById(`${i}`);
    const label = document.createElement('p');
    label.innerHTML = JSON.stringify(labelData, null, 4);
    
    div.appendChild(label);
  }
}

const startClassification = () => {
  const imageFiles = document.getElementById('input').files;
  createImageThumbnail(imageFiles);

  setTimeout(() => {
    classify().then(result => {
      console.log('result', result)
      labelImages(result);// pass result to agent => pass agent result to labelImages()
    });
  }, 500);
}
