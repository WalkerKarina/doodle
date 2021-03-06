import { fabric } from "fabric";
import "./styles.css";

var model;
var mousePressed = false;
var classNames = [];
var names;
var canvas;
var coordinates = [];

$(function () {
  canvas = window._canvas = new fabric.Canvas("canvas");
  canvas.backgroundColor = "#ffffff";
  canvas.isDrawingMode = 0;
  canvas.freeDrawingBrush.color = "black";
  canvas.freeDrawingBrush.width = 10;
  canvas.renderAll();

  //Event listeners for mouse movement
  canvas.on("mouse:up", function (e) {
    getPrediction();
    mousePressed = false;
  });
  canvas.on("mouse:down", function (e) {
    mousePressed = true;
  });
  canvas.on("mouse:move", function (e) {
    recordCoordinates(e);
  });
});

function recordCoordinates(event) {
  var pointer = canvas.getPointer(event.e);
  var posX = pointer.x;
  var posY = pointer.y;
  if (posX >= 0 && posY >= 0 && mousePressed) {
    coordinates.push(pointer);
  }
}

function getImageData() {
  //get the "minimum bounding box" around the drawing
  const mbb = getMinBox();

  //get image data according to device pixel ratio
  const dpi = window.devicePixelRatio;
  const imgData = canvas.contextContainer.getImageData(
    mbb.min.x * dpi,
    mbb.min.y * dpi,
    (mbb.max.x - mbb.min.x) * dpi,
    (mbb.max.y - mbb.min.y) * dpi
  );
  imgData.crossOrigin = "Anonymous";
  return imgData;
}

//gets minium bounding box
function getMinBox() {
  //get curser coordinates 
  var coorX = coordinates.map((point) => {
    return point.x;
  });
  var coorY = coordinates.map((point) => {
    return point.y;
  });

  //finds corner coordinates of top left and bottom right 
  var min_coordinates = {
    x: Math.min.apply(null, coorX),
    y: Math.min.apply(null, coorY),
  };
  var max_coordinates = {
    x: Math.max.apply(null, coorX),
    y: Math.max.apply(null, coorY),
  };

  return {
    min: min_coordinates,
    max: max_coordinates,
  };
}

function allowDrawing() {
  canvas.isDrawingMode = 1;
  // document.getElementById('status').innerHTML = 'Model Loaded';
  $("button").prop("disabled", false);
}

function preprocess(imgData) {
  return tf.tidy(() => {
    //converted to a tensor
    let tensor = tf.browser.fromPixels(imgData, 1);

    //resize using tf
    const resized = tf.image.resizeBilinear(tensor, [28, 28]).toFloat();

    //normalize, change dimensions
    const offset = tf.scalar(255.0);
    const normalized = tf.scalar(1.0).sub(resized.div(offset));

    //We add a dimension to get a batch shape
    const batched = normalized.expandDims(0);
    return batched;
  });
}

function getClassNames(indices) {
  var outp = [];
  for (var i = 0; i < indices.length; i++) outp[i] = classNames[indices[i]];
  return outp;
}

async function loadDict() {
  //var url = "http://127.0.0.1:8000/model/class_names.txt";
  var url = "./class_names.txt";

  fetch(url)
    .then((res) => res.text())
    .then((data) => {
      const list = data.split(/\n/);
      for (var i = 0; i < list.length - 1; i++) {
        let symbol = list[i];
        classNames[i] = symbol;
      }
      randomClassNameFirst();
    })
    .catch((err) => {
      throw err;
    });
}

//find index of x (thing drawn)
function findIndicesOfMax(inp, count) {
  var outp = [];
  for (var i = 0; i < inp.length; i++) {
    outp.push(i); // add index to output array
    if (outp.length > count) {
      outp.sort(function (a, b) {
        return inp[b] - inp[a];
      }); // descending sort the output array
      outp.pop(); // remove the last index (index of smallest element in output array)
    }
  }
  return outp;
}

//number of times x is identified
function findTopValues(inp, count) {
  var outp = [];
  let indices = findIndicesOfMax(inp, count);
  // shows 5 greatest scores
  for (var i = 0; i < indices.length; i++) outp[i] = inp[indices[i]];
  return outp;
}

function getPrediction() {
  //make sure we have at least two recorded coordinates
  if (coordinates.length >= 2) {
    //get the image data from the canvas
    const imgData = getImageData();

    //get the prediction
    const pred = model.predict(preprocess(imgData)).dataSync();

    //find the top 5 predictions
    const indices = findIndicesOfMax(pred, 5);
    const probs = findTopValues(pred, 5);
    names = getClassNames(indices);
    console.log("Names: ");
    console.log(names);
    display();
  }
}
var maxAppend = 0;

function display() {
  for (var i = 0; i < names.length; i++) {
    if (maxAppend < 5) {
      $("#list").append("<li>" + names[i].replace("_", " ") + "</li>");
      maxAppend = maxAppend + 1;
    } else if (maxAppend >= 5) {
      $("#list li").first().remove();
      $("#list").append("<li>" + names[i].replace("_", " ") + "</li>");
    }
  }
}

async function loadModel() {
  //const path = "http://127.0.0.1:8000/model/model.json";
  const path = "./model.json";
  model = await tf.loadLayersModel(path);

  console.log("Model: ");
  console.log(model);

  console.log("Model Prediction trial: ");
  console.log(model.predict(tf.zeros([1, 28, 28, 1])));

  allowDrawing();

  await loadDict();
}

loadModel();

$("#erase").click(function () {
  canvas.clear();
  canvas.backgroundColor = "#ffffff";
  coordinates = [];
  console.log("Running erase from js");
});

function randomClassNameFirst() {
  var randomNum = Math.floor(Math.random() * 100);
  var command = classNames[randomNum].replace("_", " ");
  $("#command").append(
    '<br></br> <span style="text-align: center; border:2px solid #89cff0; padding: 10px; color: #89cff0; margin: 10px 0px 10px 0px;">' +
      command +
      "</span>"
  );
}

$("#randomClassNameAppend").click(function () {
  var randomNum = Math.floor(Math.random() * 100);
  var command = classNames[randomNum].replace("_", " ");
  console.log(command + " command")
  $("#command").html(
    '<br></br> <span style="text-align: center; border:2px solid #89cff0; padding: 10px; color: #89cff0; margin: 10px 0px 10px 0px;"">' +
      command +
      "</span>"
  );
});
