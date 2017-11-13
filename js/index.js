
var canvas = document.getElementById('canvas');
var ctx = document.getElementById('canvas').getContext("2d");

var mainShadow = document.getElementById('main-shadow');
var canvasShadow = document.getElementById('canvas-shadow');
var ctxShadow = document.getElementById('canvas-shadow').getContext("2d");

var mouseX, mouseY;
var startX, startY;
var clickX = [], clickY = [], clickDrag = [];
var paint = false;
var isLine = false;
var drawType = '';
var lineLong;
var emptyVar;
var savedImages = [];
var removedImages = [];
var lineWidthBefore;

var chooseNotDraw = document.getElementById("not-draw");
var chooseRectangle = document.getElementById("rectangle");
var chooseLine = document.getElementById("line");
var chooseCurvedLine = document.getElementById("curved");
var chooseTriangle = document.getElementById("triangle");
var chooseCircle = document.getElementById("circle");
var colorButton = document.getElementById('color-button');
var eraser = document.getElementById("eraser");
var clearButton = document.getElementById("clear-button");
var undoButton = document.getElementById("undo-button");
var redoButton = document.getElementById("redo-button");
var save = document.getElementById("save");
var colorBefore;

var wheel = {
    width: 320,
    height: 320,
    padding: 2,
    sliderMargin: 24,
    markerRadius: 5,
    borderWidth: 2,
    color: "rgb(68, 255, 158)",
};

var colorWheel = iro.ColorWheel("#colorWheel", wheel );
var colorWheelElement = document.getElementById('colorWheel');

colorWheel.on("color:change", onColorChange);

ctx.strokeStyle = colorWheel.color.hexString;
ctx.lineJoin = "round";
ctx.lineWidth = 3;

function mousePos(e){
  var rect = canvas.getBoundingClientRect();
  mouseX = (e.clientX - rect.left) / (rect.right - rect.left) * canvas.width;//mouse position
  mouseY = (e.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height;
  return(mouseX,mouseY);
}

function addClick(mouseX, mouseY, dragging){
  clickX.push(mouseX);
  clickY.push(mouseY);
  clickDrag.push(dragging);
}

function clearHistory(){
  clickX=[];
  clickY=[];
  clickDrag=[];
}

function onColorChange(color) {
  clearHistory();
  ctx.strokeStyle = color.hexString; 
}

document.addEventListener("DOMContentLoaded", function(){
  saveDrawProperties();
});

canvas.addEventListener('mousedown',function(e){
  paint = true;
  mousePos(e);
  addClick(mouseX,mouseY,false);
  switch (drawType){
    case 'Curved':
      drawCurved(e);
      break;
  }
  saveImage();
});

canvas.addEventListener('mousemove',function(e){
  if (isLine === false){
    if (paint) {
      mousePos(e);
      addClick(mouseX, mouseY, true);
      switch (drawType){
        case 'Curved':
          drawCurved(e);
          break;
      }
    }
  }
});

canvas.addEventListener('mouseup',function(e){
  paint = false;
});

//stop draw when mouse leave canvas
canvas.addEventListener('mouseleave',function(e){
  paint = false;
});

canvasShadow.addEventListener('mouseleave',function(e){
  paint = false;
  ctxShadow.clearRect(0, 0, canvas.width, canvas.height);
});

canvasShadow.addEventListener('mousedown',function (e) {
  switch (drawType){
    case 'Triangle':
      drawCloseFigureDown(e);
      break;
    case 'Rectangle':
      drawCloseFigureDown(e);
      break;
    case 'Circle':
      drawCloseFigureDown(e);
      break;
  }
  saveImage();
});

canvasShadow.addEventListener('click',function(e){
  switch (drawType){
    case 'Line':
      ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(mouseX, mouseY);
      ctx.stroke();
      break;
  }
});

canvasShadow.addEventListener('dblclick', function(){
  paint = false;
  //clearHistory();
  startX = startY = emptyVar;
});

canvasShadow.addEventListener('mousemove',function (e) {
  switch (drawType){
    case 'Triangle':
      drawTriangleMove(e);
      break;
    case 'Rectangle':
      drawRectangleMove(e);
      break;
    case 'Circle':
      drawCircleMove(e);
      break;
    case 'Line':
      paint=true;
      drawLineMove(e);
      break;
  }
});

canvasShadow.addEventListener('mouseup', function(e){
  switch (drawType){
    case 'Triangle':
      lineLong = Math.sqrt((startX-mouseX)**2 + (startY-mouseY)**2)/2;
      ctx.beginPath();
      ctx.moveTo(startX, startY - lineLong);
      ctx.lineTo(startX - lineLong, startY + lineLong);
      ctx.lineTo(startX + lineLong, startY + lineLong);
      ctx.lineTo(startX, startY - lineLong);
      ctx.stroke();
      ctx.closePath();
      break; 
    case 'Rectangle':
      ctx.strokeRect(startX, startY, mouseX - startX, mouseY - startY);
      break;
    case 'Circle':
      lineLong = Math.sqrt((startX-mouseX)**2 + (startY-mouseY)**2);
      ctx.beginPath();
      ctx.arc(startX, startY, lineLong, 0, 2 * Math.PI, false);
      ctx.stroke();
      break;
    case 'Line':
      ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(mouseX, mouseY);
      ctx.stroke();
      startX = mouseX;
      startY = mouseY;
      break;
  }
  paint = false;
});

//Undo event on Backspace press
window.onkeydown = function(e){
  var code = e.keyCode ? e.keyCode : e.which;
  if (code === 8){
    if (savedImages.length > 0) {
      onUndoCanvas();
    } else if (savedImages.length < 1) {
      backDrawProperties();
      ctxShadow.clearRect(0, 0, canvasShadow.width, canvasShadow.height);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  } 
};

chooseNotDraw.addEventListener('click', function(){
  drawType = '';
  paint = false;
  clearHistory();
});

clearButton.addEventListener('click', function(){
  ctxShadow.clearRect(0, 0, canvasShadow.width, canvasShadow.height);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  clearHistory();
});

chooseRectangle.addEventListener('click', function(e){
  mainShadow.style.visibility = 'visible';
  drawNotLine();
  drawType = 'Rectangle';
});

chooseLine.addEventListener('click', function(){
  mainShadow.style.visibility = 'visible'; 
  clearHistory();

  startX = mouseX = emptyVar;
  startY = mouseY = emptyVar;

  isLine = true;
  drawType = 'Line';
});

chooseCurvedLine.addEventListener('click',function(){
  mainShadow.style.visibility = 'hidden';
  drawNotLine();
  drawType = 'Curved';
});

chooseTriangle.addEventListener('click', function(e){
  mainShadow.style.visibility = 'visible';
  drawNotLine();
  drawType = 'Triangle';
});

chooseCircle.addEventListener('click', function(e){
  mainShadow.style.visibility = 'visible';
  drawNotLine();
  drawType = 'Circle';
});

colorButton.addEventListener('click', function(){
  colorWheelElement.classList.toggle('colorWheelOpen');
  colorWheelElement.classList.toggle('colorWheelClose');
});

undoButton.addEventListener('click', function(){
  saveDrawProperties();
  onUndoCanvas();
  backDrawProperties();
});

redoButton.addEventListener('click', function(){
  saveDrawProperties();
  onRedoCanvas();
  backDrawProperties();
});


eraser.addEventListener('click', function(){
  mainShadow.style.visibility = 'hidden';
  eraserCanvas();
});

save.addEventListener('click', function(){
  saveCanvas();
});

function eraserCanvas(){
  drawNotLine();
  saveDrawProperties();
  ctx.strokeStyle = 'white';
  drawType = 'Curved';
}

function saveCanvas(){
  var link = document.createElement('a');
  link.download = "Your_masterpiece.png";
  link.href = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
  link.click();
}

function drawCloseFigureDown(e) {
  mousePos(e);
  startX = mouseX;
  startY = mouseY;
  paint = true;
}

function drawRectangleMove(e) {
  ctxShadow.clearRect(0, 0, canvas.width, canvas.height);
  // if we're not dragging, just return
  if (!paint) {
    return;
  }
  mousePos(e);
  ctxShadow.strokeRect(startX, startY, mouseX - startX, mouseY - startY);
}
/////////////
function drawLineMove(e){
  ctxShadow.clearRect(0, 0, canvas.width, canvas.height);
 
  mousePos(e);

  ctxShadow.beginPath();
    ctxShadow.moveTo(startX, startY);
    ctxShadow.lineTo(mouseX, mouseY);
  ctxShadow.stroke();
}
////////////////
function drawTriangleMove(e) {
  ctxShadow.clearRect(0, 0, canvas.width, canvas.height);
  // if we're not dragging, just return
  if (!paint) {
    return;
  }
  mousePos(e);
  lineLong = (Math.sqrt((startX-mouseX)**2 + (startY-mouseY)**2))/2;

  ctxShadow.beginPath();
    ctxShadow.moveTo(startX, startY - lineLong);
    ctxShadow.lineTo(startX - lineLong, startY + lineLong);
    ctxShadow.lineTo(startX + lineLong, startY + lineLong);
    ctxShadow.lineTo(startX, startY - lineLong);
    ctxShadow.stroke();
  ctxShadow.closePath();
}

function drawCircleMove(e){
  ctxShadow.clearRect(0, 0, canvas.width, canvas.height);
  // if we're not dragging, just return
  if (!paint) {
    return;
  }
  mousePos(e);

  lineLong = (Math.sqrt((startX-mouseX)**2 + (startY-mouseY)**2));

  ctxShadow.beginPath();
    ctxShadow.arc(startX, startY, lineLong, 0, 2 * Math.PI, false);
  ctxShadow.stroke();
}

function drawCurved(){
  for(var i=0; i < clickX.length; i++) {    
    ctx.beginPath();
      if(clickDrag[i] && i){
        ctx.moveTo(clickX[i-1], clickY[i-1]);
      }else{
       ctx.moveTo(clickX[i]-1, clickY[i]);
      }
      ctx.lineTo(clickX[i], clickY[i]);
      ctx.addHitRegion({id:'curve',cursor:'pointer'});
    ctx.closePath();
    ctx.stroke();
    
  }
}

function drawNotLine(){
  clearHistory();
  backDrawProperties();
  isLine = false;
}

////////Used with some changes///////////// http://jsbin.com/dulifezi/2/edit 
function rangeSlider(id, onDrag) {

  var range = document.getElementById(id),
    dragger = range.children[0],
    draggerWidth = 10, // width of your dragger
    down = false,
    rangeWidth, rangeLeft;

  dragger.style.width = draggerWidth + 'px';
  dragger.style.left = -draggerWidth + 'px';
  dragger.style.marginLeft = (draggerWidth / 2) + 'px';

  range.addEventListener("mousedown", function(e) {
    rangeWidth = this.offsetWidth;
    rangeLeft = this.offsetLeft;
    down = true;
    updateDragger(e);
    return false;
  });

  document.addEventListener("mousemove", function(e) {
    updateDragger(e);
  });

  document.addEventListener("mouseup", function() {
    down = false;
  });

  function updateDragger(e) {
    if (down && e.pageX >= rangeLeft && e.pageX <= (rangeLeft + rangeWidth)) {
      dragger.style.left = e.pageX - rangeLeft - draggerWidth + 'px';
      if (typeof onDrag == "function") onDrag(Math.round(((e.pageX - rangeLeft) / rangeWidth) * 100));
    }
  }
}

rangeSlider('range-slider', function(value) {
  ctx.lineWidth = value;
  ctxShadow.lineWidth = value;
  clearHistory();
});
/////////////////////////////////////// End of StackOwerflow user code)

function saveDrawProperties(){
  lineWidthBefore = ctx.lineWidth;
  colorBefore = ctx.strokeStyle;
}

function backDrawProperties(){
  ctx.strokeStyle = colorBefore;
  ctx.lineJoin = "round";
  ctx.lineWidth = lineWidthBefore;
}
//disable Undo/Redo buttons on Start
undoButton.setAttribute("disabled", "disabled");
redoButton.setAttribute("disabled", "disabled");

function onUndoCanvas () {  
  //save the current canvas in redo array
  removeImage();
  canvas.width = canvas.width;
  //create an image object and paint 
  var imageObj = document.createElement('img');
  imageObj.onload = function(){
      ctx.drawImage(imageObj, 0, 0);
  };
  //get from array the source for the image object 
  imageObj.src = savedImages.pop();
  //if the stack is empty then disable the undo button
  console.log(savedImages.length);  
  if (savedImages.length === 0) {
    undoButton.setAttribute("disabled", "disabled");
  }
  clearHistory();
  startX = startY = emptyVar;
}

function onRedoCanvas() {
  //save the current canvas in undo array
  saveImage();
  //clear the canvas
  canvas.width = canvas.width;
  //create an image object and paint 
  var imageObj = document.createElement('img');
  imageObj.onload = function(){
    ctx.drawImage(imageObj, 0, 0);
  };
  //get from array the source for the image object 
  imageObj.src = removedImages.pop();
  //if the stack is empty then disable the redo button
  if (removedImages.length === 0) {
    redoButton.setAttribute("disabled", "disabled");
  }
  clearHistory();
  startX = startY = emptyVar;
}

function removeImage(){
  //save the canvas image to redo array
  var imgSrc = canvas.toDataURL("image/png");
  removedImages.push(imgSrc);
  redoButton.removeAttribute("disabled");    
}

function saveImage(){
  //save the canvas image to undo array 
  if (drawType !=''){
    var imgSrc = canvas.toDataURL("image/png");
    savedImages.push(imgSrc);
    undoButton.removeAttribute("disabled");    
  }
}

