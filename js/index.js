
var canvas = document.getElementById('canvas');
var context = document.getElementById('canvas').getContext("2d");

var mouseX;
var mouseY;
var clickX = new Array();
var clickY = new Array();
var clickDrag = new Array();
var paint;
var draw = drawCurved;

function mousePos(e){
	var rect = canvas.getBoundingClientRect();
	mouseX = (e.clientX - rect.left) / (rect.right - rect.left) * canvas.width;//mouse position
	mouseY = (e.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height;
	return{mouseX,mouseY};
}

function addClick(mouseX, mouseY, dragging)
{
  clickX.push(mouseX);
  clickY.push(mouseY);
  clickDrag.push(dragging);
}

canvas.addEventListener('mousedown',function(e){
  paint = true;
  mousePos(e);
  addClick(mouseX,mouseY,false);
  draw();

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

context.strokeStyle = "#df4b26";
context.lineJoin = "round";
context.lineWidth = 5;

var clearButton = document.getElementById("clear-button");

clearButton.addEventListener('click', function(){
	context.clearRect(0, 0, canvas.width, canvas.height);
	clearHistory();
});

var chooseRectangle = document.getElementById("rectangle");
var chooseLine = document.getElementById("line");
var chooseCurvedLine = document.getElementById("curved");
var eraser = document.getElementById("eraser");
var save = document.getElementById("save");

var colorBefore;

chooseRectangle.addEventListener('click', function(){
  context.strokeStyle = colorBefore; 
  clearHistory();
  draw = drawRectangle;
});

chooseLine.addEventListener('click', function(){
  context.strokeStyle = colorBefore;
  clearHistory();
  draw = drawLine;
});

chooseCurvedLine.addEventListener('click',function(){
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

save.addEventListener('click', function(){
  var link = document.createElement('a');
  link.download = "Your_masterpiece.png";
  link.href = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
  link.click();
});

function drawRectangle(){

  var width = clickX[clickX.length] - clickX[clickX.length-1];
  var height = clickY[clickY.length] - clickY[clickY.length-1];

  context.strokeRect(clickX[clickX.length-2], clickY[clickY.length-2], width, height);
  console.log('all ok');
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