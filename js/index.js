
var canvas = document.getElementById('canvas');
var context = document.getElementById('canvas').getContext("2d");

var mainShadow = document.getElementById('main-shadow');
var canvasShadow = document.getElementById('canvas-shadow');
var contextShadow = document.getElementById('canvas-shadow').getContext("2d");

var mouseX;
var mouseY;
var startX;
var startY;
var clickX = new Array();
var clickY = new Array();
var clickDrag = new Array();
var paint;
var draw = drawCurved;

var clearButton = document.getElementById("clear-button");
var clearShadowButton = document.getElementById("clear-shadow-button");
var chooseRectangle = document.getElementById("rectangle");
var chooseLine = document.getElementById("line");
var chooseCurvedLine = document.getElementById("curved");
var eraser = document.getElementById("eraser");
var save = document.getElementById("save");
var colorBefore;

var chooseShadowLine = document.getElementById("line-shadow");
var chooseShadowCurvedLine = document.getElementById("curved-shadow");
var eraserShadow = document.getElementById("eraser-shadow");
var saveShadow = document.getElementById("save-shadow");

var wheel = {
    width: 320,
    height: 320,
    padding: 4,
    sliderMargin: 24,
    markerRadius: 8,
    color: "rgb(68, 255, 158)",
}
var colorWheel = iro.ColorWheel("#colorWheel", wheel );
var colorShadowWheel = iro.ColorWheel("#colorWheelshadow", wheel );

context.strokeStyle = colorWheel.color.hexString;
context.lineJoin = "round";
context.lineWidth = 5;

function mousePos(e){
	var rect = canvas.getBoundingClientRect();
	mouseX = (e.clientX - rect.left) / (rect.right - rect.left) * canvas.width;//mouse position
	mouseY = (e.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height;
	return{mouseX,mouseY};
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

  canvas.addEventListener('mouseup',function(e){
    paint = false;
  });
});

canvas.addEventListener('mousemove',function(e){
  if (paint) {
    mousePos(e);
    addClick(mouseX, mouseY, true);
    draw();
  }
});

//stop draw when mouse leave canvas
/*canvas.addEventListener('mouseleave',function(e){
  paint = false;
});*/

clearButton.addEventListener('click', function(){
	context.clearRect(0, 0, canvas.width, canvas.height);
	clearHistory();
});

clearShadowButton.addEventListener('click', function(){
  contextShadow.clearRect(0, 0, canvasShadow.width, canvasShadow.height);
  context.clearRect(0, 0, canvas.width, canvas.height);
  clearHistory();
});

chooseRectangle.addEventListener('click', function(){
  mainShadow.style.visibility = 'visible';
  context.strokeStyle = colorBefore; 
  clearHistory();
  drawRectangle();
});

chooseLine.addEventListener('click', function(){
  context.strokeStyle = colorBefore;
  clearHistory();
  draw = drawLine;
});

chooseShadowLine.addEventListener('click', function(){
  mainShadow.style.visibility = 'hidden';
  context.strokeStyle = colorBefore;
  clearHistory();
  draw = drawLine;
});

chooseCurvedLine.addEventListener('click',function(){
  context.strokeStyle = colorBefore;
  clearHistory();
  draw = drawCurved;
});

chooseShadowCurvedLine.addEventListener('click', function(){
  mainShadow.style.visibility = 'hidden';
  context.strokeStyle = colorBefore;
  clearHistory();
  draw = drawCurved;
});

eraser.addEventListener('click', function(){
  clearHistory();
  colorBefore = context.strokeStyle;
  context.strokeStyle = 'white';
  draw = drawCurved;
});

eraserShadow.addEventListener('click', function(){
  mainShadow.style.visibility = 'hidden';
  clearHistory();
  colorBefore = context.strokeStyle;
  context.strokeStyle = 'white';
  draw = drawCurved;
});

save.addEventListener('click', function(){
  var link = document.createElement('a');
  link.download = "Your_masterpiece.png";
  link.href = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
  link.click();
});

saveShadow.addEventListener('click', function(){
  var link = document.createElement('a');
  link.download = "Your_masterpiece.png";
  link.href = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
  link.click();
});

function drawRectangle(){
  mainShadow.style.visibility = 'visible';
  clearHistory();
  canvasShadow.addEventListener('mousedown',function (e) {
    drawRectangleDown(e);
  });
  canvasShadow.addEventListener('mousemove',function (e) {
    drawRectangleMove(e);
  });

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
    canvasShadow.addEventListener('mouseup',function() {
      context.strokeRect(startX, startY, mouseX - startX, mouseY - startY);
      paint = false;
    });
  }
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

function clearHistory(){
  clickX=[];
  clickY=[];
  clickDrag=[];
}

function onColorChange(color) {
  context.strokeStyle = color.hexString;
  clearHistory();
};



