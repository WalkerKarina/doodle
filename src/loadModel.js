import {fabric} from 'fabric';

function run() {
  let canvas = new fabric.Canvas('myCanvas');
  let rect = new fabric.Rect({
    left: 100,
    top: 100,
    fill: 'red',
    width: 20,
    height: 20
  });
  canvas.add(rect);
}

console.log("Hello World")

run();

async function loadModel() {  
	console.log("Model loading...")
	const path = 'http://127.0.0.1:8000/model/model.json';
	const model = await tf.loadLayersModel(path)


	console.log("Model: ")
	console.log(model)

	console.log("Model Prediction")
	console.log(model.predict(tf.zeros([1, 28, 28, 1])))
}


loadModel();