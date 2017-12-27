/**
 * Simple Graphic Editor
 *
 * @Author Oleh Yaroshchuk 
 */

/**
 * Global variables
*/
var canvas = document.getElementById('canvas');
var ctx = document.getElementById('canvas').getContext('2d');

var mainShadow = document.getElementById('main-shadow');
var canvasShadow = document.getElementById('canvas-shadow');
var ctxShadow = document.getElementById('canvas-shadow').getContext('2d');

var mouseX, //mouse X position
    mouseY; //mouse Y position
var startX, 
    startY;
var clickX = [], //array of clicks X position
    clickY = [], //array of clicks Y position
    clickDrag = []; 
var paint = false;
var isLine = false;
var drawType = ''; 
var lineLong;
var savedImages = [];
var removedImages = [];
var lineWidthBefore;

var chooseNotDraw = document.getElementById('not-draw');
var chooseCircle = document.getElementsByClassName('circle');
var chooseTriangle = document.getElementsByClassName('triangle');
var chooseRectangle = document.getElementsByClassName('rectangle');
var chooseRegularPolygon = document.getElementsByClassName('regular-polygon');
var regularPolygonNumberOfAngles = document.getElementById('number-of-angles');
var chooseLine = document.getElementsByClassName('line');
var chooseCurvedLine = document.getElementsByClassName('curved');
var colorButton = document.getElementById('color-button');
var eraser = document.getElementById('eraser');
var spray = document.getElementById('spray');
var clearButton = document.getElementById('clear-button');
var undoButton = document.getElementById('undo-button');
var redoButton = document.getElementById('redo-button');
var save = document.getElementById('save');
var colorBefore;
var numberOfSides;

var DENSITY = 50; //densuty of spray tool
var timeout;

var wheel = {
    width: 320,
    height: 320,
    padding: 2,
    sliderMargin: 24,
    markerRadius: 5,
    borderWidth: 2,
    color: 'rgb(68, 255, 158)',
};

var colorWheel = iro.ColorWheel('#colorWheel', wheel );
var colorWheelElement = document.getElementById('colorWheel');

var cml =  document.getElementById('context-menu-lines');
var linesMenu = document.getElementById('lines-menu');
var cmrf = document.getElementById('context-menu-right-figures');
var rightFiguresMenu = document.getElementById('right-figures-menu');

var rfItems = document.getElementById('right-figures-items');
var lItems = document.getElementById('lines-items');

/**
 * Functions
*/

function chooseDrawRectangle(){
  backDrawProperties();
  mainShadow.style.visibility = 'visible';
  drawNotLine();
  drawType = 'Rectangle';
}

function chooseDrawLine(){
  backDrawProperties();
  mainShadow.style.visibility = 'visible'; 
  clearHistory();

  startX = mouseX = undefined;
  startY = mouseY = undefined;

  isLine = true;
  drawType = 'Line';
}

function chooseDrawCurved(){
  mainShadow.style.visibility = 'hidden';
  drawNotLine();
  drawType = 'Curved';
}

function chooseDrawTriangle(){
  backDrawProperties();
  mainShadow.style.visibility = 'visible';
  drawNotLine();
  drawType = 'Triangle';
}

function chooseDrawCircle(){
  backDrawProperties();
  mainShadow.style.visibility = 'visible';
  drawNotLine();
  drawType = 'Circle';
}

function eraserCanvas(){
  drawNotLine();
  saveDrawProperties();
  ctx.strokeStyle = 'white';
  drawType = 'Curved';
}

function saveCanvas(){
  var link = document.createElement('a');
  link.download = 'Your_masterpiece.png';
  link.href = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
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

function drawLineMove(e){
  ctxShadow.clearRect(0, 0, canvas.width, canvas.height);

  ctxShadow.beginPath();
    ctxShadow.moveTo(startX, startY);
    ctxShadow.lineTo(mouseX, mouseY);
  ctxShadow.stroke();
}

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
  for (var i = DENSITY; i--; ) {
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

function saveDrawProperties(){
  lineWidthBefore = ctx.lineWidth;
  colorBefore = ctx.strokeStyle;
}

function backDrawProperties(){
  ctx.strokeStyle = colorBefore;
  ctx.lineJoin = 'round';
  ctx.lineWidth = lineWidthBefore;
}

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
    undoButton.setAttribute('disabled', 'disabled');
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
    redoButton.setAttribute('disabled', 'disabled');
  }
  clearHistory();
  startX = startY = undefined;
}

function removeImage(){
  //save the canvas image to redo array
  var imgSrc = canvas.toDataURL('image/png');
  removedImages.push(imgSrc);
  redoButton.removeAttribute('disabled');    
}

function saveImage(){
  //save the canvas image to undo array 
  if (drawType !==''){
    var imgSrc = canvas.toDataURL('image/png');
    savedImages.push(imgSrc);
    undoButton.removeAttribute('disabled');    
  }
}

function getRandomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

function chooseDrawRegularPolygon(){
  backDrawProperties();
  mainShadow.style.visibility = 'visible';
  console.log(regularPolygonNumberOfAngles);
  if (regularPolygonNumberOfAngles.style.display !=  'block') {
    regularPolygonNumberOfAngles.style.display = 'block';
  }
  
  drawType = 'regularPolygon';
}

function hideContextMenu(el){
  el.style.opacity = '0';
  setTimeout(function(){
    el.style.display = 'none';  
  }, 500);
}

function showContextMenu(e,el){
  el.style.left = e.pageX;
  el.style.top = e.pageY;
  el.style.opacity = '1';
  el.style.display  = 'block';
}

function onContextMenuChoose(item, menu){
  for (var i = 0; i < item.children.length; i++) {
    item.children[i].addEventListener('click', function(){
      menu.children[0].innerHTML = this.innerText;//change text at button

      if (this.className != 'regular-polygon') {
        this.style.display = 'none';//hide choose drawing type
      } else {
        chooseDrawRegularPolygon();//show input field
      }
        /*Do visible previous menu item*/
        for (var h = 0; h < item.children.length; h++) {
          if (menu.className == item.children[h].className){
            item.children[h].style.display = 'block';  
          }
        }
        
      menu.className = '';//clear class list
      menu.classList.add(this.className);//add new class 
    });
  }
}

function drawRegularPolygonMove(e){
  numberOfSides = regularPolygonNumberOfAngles.value;
  lineLong = Math.sqrt((startX-mouseX)**2 + (startY-mouseY)**2)/2;

  ctxShadow.clearRect(0, 0, canvas.width, canvas.height);
  if (!paint) {
    return;
  }
  ctxShadow.beginPath();
  ctxShadow.moveTo (startX +  lineLong * Math.cos(0), startY +  lineLong *  Math.sin(0));          
   
  for (var i = 1; i <= numberOfSides;i += 1) {
      ctxShadow.lineTo (startX + lineLong * Math.cos(i * 2 * Math.PI / numberOfSides), startY + lineLong * Math.sin(i * 2 * Math.PI / numberOfSides));
  }
  ctxShadow.stroke();
}

/**
 * Event Listeners
*/

colorWheel.on('color:change', onColorChange);

document.addEventListener('DOMContentLoaded', function(){
  ctx.strokeStyle = colorWheel.color.hexString;
  ctx.lineJoin = 'round';
  ctx.lineWidth = 3;
  saveDrawProperties();

  for (var n = 0; n < chooseRectangle.length; n++) {
    chooseRectangle[n].addEventListener('click', chooseDrawRectangle);
  }

  for (var n = 0; n < chooseLine.length; n++) {
    chooseLine[n].addEventListener('click', chooseDrawLine);
  }

  for (var n = 0; n < chooseCurvedLine.length; n++) {
    chooseCurvedLine[n].addEventListener('click', chooseDrawCurved);
  }

  for (var n = 0; n < chooseTriangle.length; n++) {
    chooseTriangle[n].addEventListener('click', chooseDrawTriangle);
  }

  for (var n = 0; n < chooseCircle.length; n++) {
    chooseCircle[n].addEventListener('click', chooseDrawCircle);
  }

  for (var n = 0; n < chooseRegularPolygon.length; n++) {
    chooseRegularPolygon[n].addEventListener('click', chooseDrawRegularPolygon);
  }

  rfItems.children[0].style.display = 'none';
  lItems.children[0].style.display = 'none';

  rightFiguresMenu.classList.add('circle');
  linesMenu.classList.add('curved');

  onContextMenuChoose(rfItems, rightFiguresMenu);
  onContextMenuChoose(lItems, linesMenu);

  //disable Undo/Redo buttons
  undoButton.setAttribute('disabled', 'disabled');
  redoButton.setAttribute('disabled', 'disabled');
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

/*stop draw when mouse leave canvas*/
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
  }
});

canvasShadow.addEventListener('dblclick', function(){
  paint = false;
  startX = startY = undefined;
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
    case 'regularPolygon':
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
    case 'regularPolygon':
      drawRegularPolygonMove(e);
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
    case 'regularPolygon':
      lineLong = Math.sqrt((startX-mouseX)**2 + (startY-mouseY)**2)/2;
      ctx.beginPath();
        ctx.moveTo (startX +  lineLong * Math.cos(0), startY +  lineLong *  Math.sin(0));          
        for (var i = 1; i <= numberOfSides;i += 1) {
          ctx.lineTo (startX + lineLong * Math.cos(i * 2 * Math.PI / numberOfSides), startY + lineLong * Math.sin(i * 2 * Math.PI / numberOfSides));
        }
      ctx.stroke();
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
  if ((code === 8) || (code === 90 && e.ctrlKey)){ //Undo event on Backspace press ot Ctrl+Z
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

rightFiguresMenu.addEventListener('click', function(){
  switch(rightFiguresMenu.className){
    case 'circle':
      chooseDrawCircle();
      break;
    case 'rectangle':
      chooseDrawRectangle();
      break;
    case 'triangle':
      chooseDrawTriangle();
      break;
    case 'regular-polygon':
      chooseDrawRegularPolygon();
      break;
  }
});

linesMenu.addEventListener('click', function(){
  switch(linesMenu.className){
    case 'curved':
      chooseDrawCurved();
      break;
    case 'line':
      chooseDrawLine();
      break;
    case 'Quadratic':
      chooseDrawQuadratic();
      break;
  }
});

linesMenu.addEventListener('contextmenu',function(e){
  e.preventDefault();
  showContextMenu(e,cml);
});

rightFiguresMenu.addEventListener('contextmenu',function(e){
  e.preventDefault();
  showContextMenu(e,cmrf);
});

cml.addEventListener('click',function(){
  hideContextMenu(this);
});

cmrf.addEventListener('click',function(){
  if (rightFiguresMenu.className !== 'regular-polygon') {
    hideContextMenu(this);
  }
});

cml.addEventListener('mouseleave', function(){
  hideContextMenu(this);
});

cmrf.addEventListener('mouseleave', function(){
  hideContextMenu(this);
});


/**
 *
*/


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

  range.addEventListener('mousedown', function(e) {
    rangeWidth = this.offsetWidth;
    rangeLeft = this.offsetLeft;
    down = true;
    updateDragger(e);
    return false;
  });

  document.addEventListener('mousemove', function(e) {
    updateDragger(e);
  });

  document.addEventListener('mouseup', function() {
    down = false;
  });

  function updateDragger(e) {
    if (down && e.pageX >= rangeLeft && e.pageX <= (rangeLeft + rangeWidth)) {
      dragger.style.left = e.pageX - rangeLeft - draggerWidth + 'px';
      if (typeof onDrag == 'function') onDrag(Math.round(((e.pageX - rangeLeft) / rangeWidth) * 100));
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
