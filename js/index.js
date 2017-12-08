
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
var savedImages = [];
var removedImages = [];
var lineWidthBefore;

var chooseNotDraw = document.getElementById("not-draw");
var chooseRectangle = document.getElementById("rectangle");
var chooseLine = document.getElementById("line");
var chooseCurvedLine = document.getElementById("curved");
/*var chooseBezier = document.getElementById("bezier");*/
var chooseTriangle = document.getElementById("triangle");
var chooseCircle = document.getElementById("circle");
var colorButton = document.getElementById('color-button');
var eraser = document.getElementById("eraser");
var spray = document.getElementById("spray");
var clearButton = document.getElementById("clear-button");
var undoButton = document.getElementById("undo-button");
var redoButton = document.getElementById("redo-button");
var save = document.getElementById("save");
var colorBefore;

var density = 50;
var timeout;
/*var bezXStart, bezYStart;
var bezierCP = [];
var j = 0;
var SPX, SPY, FPX, FPY =50;*/

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
    case 'Spray':
      sprayMouseDown();
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
  switch (drawType){
    case 'Spray':
      clearTimeout(timeout);
      break;
  }
});

//stop draw when mouse leave canvas
canvas.addEventListener('mouseleave',function(e){
  paint = false;
  switch (drawType){
    case 'Spray':
      clearTimeout(timeout);
      break;
  }
});

canvasShadow.addEventListener('click',function(e){
  mousePos(e);
  switch (drawType){
    case 'Line':
      ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(mouseX, mouseY);
      ctx.stroke();
      break;
    /*case 'Bezier':
      if (bezXStart == undefined && bezYStart == undefined){
        bezXStart = mouseX;
        bezYStart = mouseY;
      } else {
        ctxShadow.beginPath();
          ctxShadow.moveTo(bezXStart, bezYStart);
          drawCircle(circle1);
        drawCircle(circle2);
          ctxShadow.bezierCurveTo(SPX, SPY, FPX, FPY, mouseX, mouseY);
        ctxShadow.stroke();
        bezierCP[j] = new Bezier(bezXStart, bezYStart, SPX, SPY, FPX, FPY, mouseX, mouseY);
          console.log(bezierCP[j].bezXFinish);
          
        bezXStart = mouseX;
        bezYStart = mouseY;

        ctxShadow.clearRect(0, 0, canvas.width, canvas.height);
        for (var i = 0; i <= j; i++) {
          console.log(bezierCP[i].FPY);
          ctxShadow.beginPath();
            ctxShadow.moveTo(bezierCP[i].bezXStart, bezierCP[i].bezYStart);
            ctxShadow.bezierCurveTo(bezierCP[i].SPX, bezierCP[i].SPY, bezierCP[i].FPX, bezierCP[i].FPY, bezierCP[i].mouseX, bezierCP[i].mouseY);
          ctxShadow.stroke();
        }
        
        j++;
      }
      break;*/
  }
});

/*var Bezier = function(bezXStart, bezYStart, SPX, SPY, FPX, FPY, mouseX, mouseY){
  this.bezXStart = bezXStart;
  this.bezYStart = bezYStart;
  this.SPX = SPX;
  this.SPY = SPY;
  this.FPX = FPX;
  this.FPY = FPY;
  this.bezXFinish = mouseX;
  this.bezYFinish = mouseY;
  return this;
}
/////////////
window.onload = function() {
    drawCircle(circle1);
    drawCircle(circle2);
    canvasShadow.addEventListener('mousedown', startDragging);
    canvasShadow.addEventListener('mousemove', drag, false);
    canvasShadow.addEventListener('mouseup', stopDragging);
    canvasShadow.addEventListener('mouseout', stopDragging);
};

var Point = function(x,y){
  this.x = x;
  this.y = y;
  return this;
};

var Circle = function (point, radius) {
    this.point = point;
    this.radius = radius;
    this.isInside = function (p) {
      return Math.pow(p.x - point.x, 2) + Math.pow(p.y - point.y, 2) < Math.pow(radius, 2); 
    };
    return this;
};

var draggableEl;

function startDragging(e) {
  mousePos(e);
    var p = new Point(mouseX, mouseY);
    if(circle1.isInside(p)) {
        deltaCenter = new Point(p.x - circle1.point.x, p.y - circle1.point.y);
        draggableEl = 1;
    }
    if(circle2.isInside(p)) {
        deltaCenter = new Point(p.x - circle2.point.x, p.y - circle2.point.y);
        draggableEl = 2;
    }
    canvasShadow.addEventListener('mousemove', drag);
}

function drag(e) {
    //ctx.clearRect(0, 0, canvas.width, canvas.height);
      if(deltaCenter !== null) {
      mousePos(e);
      if (draggableEl === 1){
        circle1.point.x = (mouseX - deltaCenter.x);
        circle1.point.y = (mouseY - deltaCenter.y);
      }
      if (draggableEl === 2){
        circle2.point.x = (mouseX - deltaCenter.x);
        circle2.point.y = (mouseY - deltaCenter.y); 
      }    
        drawCircle(circle1);
        drawCircle(circle2);
        bezierCP[j].SPX = circle1.point.x;
        bezierCP[j].SPY = circle1.point.y;
        bezierCP[j].FPX = circle2.point.x;
        bezierCP[j].FPY = circle2.point.y;
        console.log(bezierCP[j].FPY);
    }
}

function stopDragging(e) {
    deltaCenter = null;
    canvasShadow.removeEventListener('mousemove', drag);
}

function drawCircle(circle) {
    ctxShadow.clearRect(0, 0, canvas.width, canvas.height);
    ctxShadow.beginPath();
      ctxShadow.arc(circle1.point.x, circle1.point.y, circle1.radius, 0, Math.PI*2, true);
    ctxShadow.fill();
    ctxShadow.beginPath();
    ctxShadow.arc(circle2.point.x, circle2.point.y, circle2.radius, 0, Math.PI*2, true);
    ctxShadow.fill();
    console.log(j);
    bezierCP[j].SPX = circle1.point.x;
        bezierCP[j].SPY = circle1.point.y;
        bezierCP[j].FPX = circle2.point.x;
        bezierCP[j].FPY = circle2.point.y;
}

var circle1 = new Circle(new Point(30, 40), 5);
var circle2 = new Circle(new Point(70, 20), 5);
var deltaCenter = null;*/
//////////////

canvasShadow.addEventListener('dblclick', function(){
  paint = false;
  startX = startY = undefined;
  /*bezXStart = bezYStart = undefined;*/
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

canvasShadow.addEventListener('mousemove',function (e) {
  mousePos(e);
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
      paint = true;
      drawLineMove(e);
      break;
    /*case 'Bezier':
      if ((bezXStart !== undefined) && (bezYStart !== undefined)){
        //ctxShadow.clearRect(0, 0, canvas.width, canvas.height);
        ctxShadow.beginPath();
          ctxShadow.moveTo(bezXStart, bezYStart);
          ctxShadow.bezierCurveTo(200, 50, 300, 50, mouseX, mouseY);
        ctxShadow.stroke();
      }
      break;*/
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
  //ctxShadow.clearRect(0, 0, canvasShadow.width, canvasShadow.height);
});

canvasShadow.addEventListener('mouseleave',function(e){
  paint = false;
  //ctxShadow.clearRect(0, 0, canvas.width, canvas.height);
});

window.onkeydown = function(e){
  var code = e.keyCode ? e.keyCode : e.which;
  if ((code === 8) | (code === 90 && e.ctrlKey)){ //Undo event on Backspace press ot Ctrl+Z
    if (savedImages.length > 0) {
      onUndoCanvas();
      backDrawProperties();
    } else if (savedImages.length === 0) {
      backDrawProperties();
      ctxShadow.clearRect(0, 0, canvasShadow.width, canvasShadow.height);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    } 
  } else if (code === 89 && e.ctrlKey){ //Redo event on Ctrl+Y press
    if (removedImages.length > 0){
      onRedoCanvas();
      backDrawProperties();
    }
  }
};

chooseNotDraw.addEventListener('click', function(){
  mainShadow.style.visibility = 'visible';
  drawType = undefined;
  paint = false;
  clearHistory();
});

clearButton.addEventListener('click', function(){
  ctxShadow.clearRect(0, 0, canvasShadow.width, canvasShadow.height);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  clearHistory();
});

chooseRectangle.addEventListener('click', function(e){
  backDrawProperties();
  mainShadow.style.visibility = 'visible';
  drawNotLine();
  drawType = 'Rectangle';
});

chooseLine.addEventListener('click', function(){
  backDrawProperties();
  mainShadow.style.visibility = 'visible'; 
  clearHistory();

  startX = mouseX = undefined;
  startY = mouseY = undefined;

  isLine = true;
  drawType = 'Line';
});

chooseCurvedLine.addEventListener('click',function(){
  mainShadow.style.visibility = 'hidden';
  drawNotLine();
  drawType = 'Curved';
});

/*chooseBezier.addEventListener('click',function(){
  mainShadow.style.visibility = 'visible';
  bezXStart = bezYStart = undefined;
  drawNotLine();
  clearHistory();
  drawType = 'Bezier';
  ctxShadow.clearRect(0, 0, canvas.width, canvas.height);
});
*/
chooseTriangle.addEventListener('click', function(e){
  backDrawProperties();
  mainShadow.style.visibility = 'visible';
  drawNotLine();
  drawType = 'Triangle';
});

chooseCircle.addEventListener('click', function(e){
  backDrawProperties();
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

spray.addEventListener('click', function(){
  mainShadow.style.visibility = 'hidden';
  drawType = 'Spray';
  ctx.fillStyle = 'black';
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
  ctxShadow.strokeRect(startX, startY, mouseX - startX, mouseY - startY);
}
/////////////
function drawLineMove(e){
  ctxShadow.clearRect(0, 0, canvas.width, canvas.height);

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
    ctx.closePath();
    ctx.stroke(); 
  }
}

function sprayMouseDown(){
  ctx.lineJoin = ctx.lineCap = 'round';
  ctx.moveTo(mouseX, mouseY);
  timeout = setTimeout(drawSpray(), 50);
}
 
function drawSpray() {
  for (var i = density; i--; ) {
    var angle = getRandomFloat(0, Math.PI*2);
    var radius = getRandomFloat(0, ctx.lineWidth);
    ctx.fillRect(mouseX + radius * Math.cos(angle), mouseY + radius * Math.sin(angle), 1, 1);
  }
  if (!timeout) return;
  timeout = setTimeout(drawSpray, 50);
  }

function drawNotLine(){
  clearHistory();
  backDrawProperties();
  isLine = false;
}

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
  ctx.fillStyle = color.hexString; 
  saveDrawProperties();
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
  saveDrawProperties();
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
  startX = startY = undefined;
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
  startX = startY = undefined;
}

function removeImage(){
  //save the canvas image to redo array
  var imgSrc = canvas.toDataURL("image/png");
  removedImages.push(imgSrc);
  redoButton.removeAttribute("disabled");    
}

function saveImage(){
  //save the canvas image to undo array 
  if (drawType !==''){
    var imgSrc = canvas.toDataURL("image/png");
    savedImages.push(imgSrc);
    undoButton.removeAttribute("disabled");    
  }
}
//////////
function getRandomFloat(min, max) {
  return Math.random() * (max - min) + min;
}
//////////

/*window.onload = function() {
    drawCircle(circle);
    canvasShadow.addEventListener('mousedown', startDragging);
    //canvas.addEventListener('mousemove', drag, false);
    canvasShadow.addEventListener('mouseup', stopDragging);
    canvasShadow.addEventListener('mouseout', stopDragging);
};

var Point = function (x, y) {
    this.x = x;
    this.y = y;
    return this;
};

var Circle = function (point, radius) {
    this.point = point;
    this.radius = radius;
    this.isInside = function (pt) {
      return Math.pow(pt.x - point.x, 2) + Math.pow(pt.y - point.y, 2) < Math.pow(radius, 2); 
    };
    return this;
};

function startDragging(e) {
  mousePos(e);
    var p = new Point(mouseX, mouseY);
    if(circle.isInside(p)) {
        deltaCenter = new Point(p.x - circle.point.x, p.y - circle.point.y);
    }
    canvasShadow.addEventListener('mousemove', drag);
}

function drag(e) {
    //ctx.clearRect(0, 0, canvas.width, canvas.height);
      if(deltaCenter !== null) {
      mousePos(e);
        circle.point.x = (mouseX - deltaCenter.x);
        circle.point.y = (mouseY - deltaCenter.y);   
        drawCircle(circle);

    }
}

function stopDragging(e) {
    deltaCenter = null;
    canvasShadow.removeEventListener('mousemove', drag);
}

function drawCircle(circle) {
    ctxShadow.clearRect(0, 0, canvas.width, canvas.height);
    ctxShadow.beginPath();
      ctxShadow.arc(circle.point.x, circle.point.y, circle.radius, 0, Math.PI*2, true);
    ctxShadow.fill();
}

var circle = new Circle(new Point(30, 40), 5);
var deltaCenter = null;*/

