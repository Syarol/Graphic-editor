
var canvas = document.getElementById('canvas');
var context = document.getElementById('canvas').getContext("2d");

var mainShadow = document.getElementById('main-shadow');
var canvasShadow = document.getElementById('canvas-shadow');
var contextShadow = document.getElementById('canvas-shadow').getContext("2d");

var mouseX, mouseY;
var startX, startY;
var clickX = [], clickY = [], clickDrag = [];
var paint = false;
var draw = drawCurved;
var isLine = false;
var drawType = 'pidor';
var lineLong;

var clearButton = document.getElementById("clear-button");
var clearShadowButton = document.getElementById("clear-shadow-button");
var chooseRectangle = document.getElementById("rectangle");
var chooseLine = document.getElementById("line");
var chooseCurvedLine = document.getElementById("curved");
var chooseTriangle = document.getElementById("triangle");
var chooseCircle = document.getElementById("circle");
var eraser = document.getElementById("eraser");
var save = document.getElementById("save");
var colorBefore;

var chooseRectangleShadow = document.getElementById("rectangle-shadow");
var chooseShadowLine = document.getElementById("line-shadow");
var chooseShadowCurvedLine = document.getElementById("curved-shadow");
var chooseTriangleShadow = document.getElementById("triangle-shadow");
var chooseCircleShadow = document.getElementById("circle-shadow");
var eraserShadow = document.getElementById("eraser-shadow");
var saveShadow = document.getElementById("save-shadow");

var wheel = {
    width: 320,
    height: 320,
    padding: 4,
    sliderMargin: 24,
    markerRadius: 8,
    borderWidth: 0,
    color: "rgb(68, 255, 158)",
};

var colorWheel = iro.ColorWheel("#colorWheel", wheel );
var colorShadowWheel = iro.ColorWheel("#colorWheelshadow", wheel );

context.strokeStyle = colorWheel.color.hexString;
context.lineJoin = "round";
context.lineWidth = 3;

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

canvas.addEventListener('mousedown',function(e){
  paint = true;
  mousePos(e);
  addClick(mouseX,mouseY,false);
  draw();
  colorWheel.on("color:change", onColorChange);
});

canvas.addEventListener('mousemove',function(e){
  if (isLine === false){
    if (paint) {
      mousePos(e);
      addClick(mouseX, mouseY, true);
      draw();
    }
  }
});

canvas.addEventListener('mouseup',function(e){
  paint = false;
});

//stop draw when mouse leave canvas
/*canvas.addEventListener('mouseleave',function(e){
  paint = false;
});*/

canvasShadow.addEventListener('mousedown',function (e) {
  switch (drawType){
    case 'Triangle':
      drawTriangleDown(e);
      break;
    case 'Rectangle':
      drawRectangleDown(e);
      break;
    case 'Circle':
      drawCircleDown(e);
      break;
  }
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
  }
});

canvasShadow.addEventListener('mouseup', function(e){
  switch (drawType){
    case 'Triangle':
      lineLong = Math.sqrt((startX-mouseX)**2 + (startY-mouseY)**2)/2;

      context.beginPath();
      context.moveTo(startX, startY - lineLong);
      context.lineTo(startX - lineLong, startY + lineLong);
      context.lineTo(startX + lineLong, startY + lineLong);
      context.lineTo(startX, startY - lineLong);
      context.stroke();
      context.closePath();
      break; 
    case 'Rectangle':
      context.strokeRect(startX, startY, mouseX - startX, mouseY - startY);
      break;
    case 'Circle':
      lineLong = Math.sqrt((startX-mouseX)**2 + (startY-mouseY)**2);
      context.beginPath();
      context.arc(startX, startY, lineLong, 0, 2 * Math.PI, false);
      context.stroke();
      break;
  }
  paint = false;
});


clearButton.addEventListener('click', function(){
  context.clearRect(0, 0, canvas.width, canvas.height);
  clearHistory();
});

clearShadowButton.addEventListener('click', function(){
  contextShadow.clearRect(0, 0, canvasShadow.width, canvasShadow.height);
  context.clearRect(0, 0, canvas.width, canvas.height);
  clearHistory();
});

chooseRectangle.addEventListener('click', function(e){
  mainShadow.style.visibility = 'visible';
  drawRectangle(e);
});

chooseRectangleShadow.addEventListener('click', function(e){
  drawRectangle(e);
});

chooseLine.addEventListener('click', function(){
  context.strokeStyle = colorBefore;
  clearHistory();
  isLine = true;
  draw = drawLine;
});

chooseShadowLine.addEventListener('click', function(){
  mainShadow.style.visibility = 'hidden'; 
  context.strokeStyle = colorBefore;
  clearHistory();
  isLine = true;
  draw = drawLine;
});

chooseCurvedLine.addEventListener('click',function(){
  drawNotLine();
  draw = drawCurved;
});

chooseShadowCurvedLine.addEventListener('click', function(){
  mainShadow.style.visibility = 'hidden';
  drawNotLine();
  draw = drawCurved;
});

chooseTriangle.addEventListener('click', function(e){
  mainShadow.style.visibility = 'visible';
  drawTriangle(e);
});

chooseTriangleShadow.addEventListener('click', function(e){
  drawTriangle(e);
});

chooseCircle.addEventListener('click', function(e){
  mainShadow.style.visibility = 'visible';
  drawCircle(e);
});

chooseCircleShadow.addEventListener('click', function(e){
  drawCircle(e);
});

eraser.addEventListener('click', function(){
  eraserCanvas();
});

eraserShadow.addEventListener('click', function(){
  eraserCanvas();
});

save.addEventListener('click', function(){
  saveCanvas();
});

saveShadow.addEventListener('click', function(){
  saveCanvas();
});

function eraserCanvas(){
  mainShadow.style.visibility = 'hidden';
  clearHistory();
  isLine = false;
  colorBefore = context.strokeStyle;
  context.strokeStyle = 'white';
  draw = drawCurved;
}

function saveCanvas(){
  var link = document.createElement('a');
  link.download = "Your_masterpiece.png";
  link.href = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
  link.click();
}

function drawRectangle(e){
  drawNotLine();
  drawType = 'Rectangle';

}

function drawRectangleDown(e) {
  mousePos(e);
  startX = mouseX;
  startY = mouseY;
  paint = true;
}

function drawRectangleMove(e) {
  contextShadow.clearRect(0, 0, canvas.width, canvas.height);
  // if we're not dragging, just return
  if (!paint) {
    return;
  }
  mousePos(e);
  contextShadow.strokeRect(startX, startY, mouseX - startX, mouseY - startY);
}

function drawTriangle(e){
  drawNotLine();
  drawType = 'Triangle';
}

function drawTriangleDown(e) {
  mousePos(e);
  startX = mouseX;
  startY = mouseY;
  paint = true;
}

function drawTriangleMove(e) {
  contextShadow.clearRect(0, 0, canvas.width, canvas.height);
  // if we're not dragging, just return
  if (!paint) {
    return;
  }
  mousePos(e);
  lineLong = (Math.sqrt((startX-mouseX)**2 + (startY-mouseY)**2))/2;

  contextShadow.beginPath();
  contextShadow.moveTo(startX, startY - lineLong);
  contextShadow.lineTo(startX - lineLong, startY + lineLong);
  contextShadow.lineTo(startX + lineLong, startY + lineLong);
  contextShadow.lineTo(startX, startY - lineLong);
  contextShadow.stroke();
  contextShadow.closePath();
}

function drawCircle(e){
  drawNotLine();
  drawType = 'Circle';
}

function drawCircleDown(e){
  mousePos(e);
  startX = mouseX;
  startY = mouseY;
  paint = true;
}

function drawCircleMove(e){
  contextShadow.clearRect(0, 0, canvas.width, canvas.height);
  // if we're not dragging, just return
  if (!paint) {
    return;
  }
  mousePos(e);
  //write code here:
  lineLong = (Math.sqrt((startX-mouseX)**2 + (startY-mouseY)**2));

  contextShadow.beginPath();
  contextShadow.arc(startX, startY, lineLong, 0, 2 * Math.PI, false);
  contextShadow.stroke();
}

function drawCurved(){
  for(var i=0; i < clickX.length; i++) {    
    context.beginPath();
    if(clickDrag[i] && i){
      context.moveTo(clickX[i-1], clickY[i-1]);
     }else{
       context.moveTo(clickX[i]-1, clickY[i]);
     }
     context.lineTo(clickX[i], clickY[i]);
     context.closePath();
     context.stroke();
  }
}

function drawLine(){
  context.beginPath();
  context.moveTo(clickX[clickX.length-1], clickY[clickY.length-1]);
  context.lineTo(clickX[clickX.length-2], clickY[clickY.length-2]);
  context.stroke();
}

function drawNotLine(){
  clearHistory();
  context.strokeStyle = colorBefore;
  isLine = false;
}

function clearHistory(){
  clickX=[];
  clickY=[];
  clickDrag=[];
}

function onColorChange(color) {
  clearHistory();
  context.strokeStyle = color.hexString; 
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
  context.lineWidth = value;
  contextShadow.lineWidth = value;
  clearHistory();
});
rangeSlider('range-slider-shadow', function(value) {
  context.lineWidth = value;
  contextShadow.lineWidth = value;
  clearHistory();
});
/////////////////////////////////////// End of StackOwerflow user code)

