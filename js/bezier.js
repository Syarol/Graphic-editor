/**
 * Simple Graphic Editor
 *
 * @Author Oleh Yaroshchuk 
 */

/**
 * Global variables
*/
var mainShadow = document.getElementById('main-shadow');
var canvasShadow = document.getElementById('canvas-shadow');
var ctxShadow = document.getElementById('canvas-shadow').getContext('2d');
var chooseQuadratic = document.getElementsByClassName('quadratic');

var QuadraticSFP = [];//Array for Start/Finish control points
var j = 0;
var deltaCenter = null;
var CPQ = [];//Control Point array for Quadratic Quadratic 

/**
 * Classes
*/
class LineB{
  constructor(startX, startY, mouseX, mouseY){
    this.bezXStart = startX;
    this.bezYStart = startY;
    this.bezXFinish = mouseX;
    this.bezYFinish = mouseY;
    return this;
  }
}

class Point{
  constructor(x,y){
    this.x = x;
    this.y = y;
    return this;
  }
}

class CircleB{
  constructor(point, radius) {
    this.point = point;
    this.radius = radius;
    this.isInside = function (p) {
      return Math.pow(p.x - point.x, 2) + Math.pow(p.y - point.y, 2) < Math.pow(radius, 2); 
    };
    return this;
  }

  //Draw Control Circle
  static draw(circle){
    ctxShadow.beginPath();
      ctxShadow.arc(circle.point.x, circle.point.y, circle.radius, 0, Math.PI*2, true);
    ctxShadow.fill();
    ctxShadow.stroke();
  }
}

class Quadratic{
  static choose(){
    mainShadow.style.visibility = 'visible';
    startX = startY = undefined;
    drawType = 'Quadratic';
    ctxShadow.clearRect(0, 0, canvas.width, canvas.height);
  }

  //Draw Quadratic Start-Finish Points
  static draw(){
    switch (drawType){
      case 'Quadratic':
        if (startX === undefined && startY === undefined){ //If Start Point missing, then create
          startX = mouseX;
          startY = mouseY;
        } else {//If Start Point already created, then create Finish Point
          ctxShadow.beginPath();//Create line between points
            ctxShadow.moveTo(startX, startY);
            ctxShadow.lineTo(mouseX, mouseY);
          ctxShadow.stroke();

          QuadraticSFP[j] = new LineB(startX, startY, mouseX, mouseY);//Save Finish and Start points coordinates

          startX = mouseX;//Finish point for last = Start point for next
          startY = mouseY;

          var CPX = (QuadraticSFP[j].bezXFinish + QuadraticSFP[j].bezXStart)/2;//X and Y coordinates of line center
          var CPY = (QuadraticSFP[j].bezYFinish + QuadraticSFP[j].bezYStart)/2;  

          CPQ[j] = new CircleB(new Point(CPX, CPY), 5);

          CircleB.draw(CPQ[j]);
         
          j++; 
        }
        break;
    }
  }

  static onlyLine(context, i){
    context.beginPath();
      context.moveTo(QuadraticSFP[i].bezXStart, QuadraticSFP[i].bezYStart);
      context.quadraticCurveTo(CPQ[i].point.x, CPQ[i].point.y, QuadraticSFP[i].bezXFinish, QuadraticSFP[i].bezYFinish);
    context.stroke(); 
  }
}

class Drag{
  static start(e, k){
    mousePos(e);
    deltaCenter = new Point(mouseX - CPQ[k].point.x, mouseY - CPQ[k].point.y); 
  }

  static do(e, i){
    if(deltaCenter !== null) {
      mousePos(e);

      CPQ[i].point.x = (mouseX - deltaCenter.x);
      CPQ[i].point.y = (mouseY - deltaCenter.y);

      ctxShadow.clearRect(0, 0, canvas.width, canvas.height);
      for (var k = 0; k < CPQ.length; k++) {
        if (k != i){
          Quadratic.onlyLine(ctxShadow, k); 
          CircleB.draw(CPQ[k]);
        } else{
          Quadratic.onlyLine(ctxShadow, i);
          CircleB.draw(CPQ[i]);
        }
      }     
    }
  }

  static stop(){
    if (drawType == 'dragQuadratic') deltaCenter = null;
  }
}

/**
 * Event Listeners
*/

document.addEventListener('DOMContentLoaded', () => {
  for (let choosen of chooseQuadratic) {
    choosen.addEventListener('click', Quadratic.choose);
  }
});

canvasShadow.onclick = function(){
  Quadratic.draw();
};

canvasShadow.addEventListener('mousedown', (e) => {
  let p = new Point(mouseX,mouseY);
  searchPoint : for (let controlPoint of CPQ) {
    if (drawType == 'dragQuadratic' && controlPoint.isInside(p)){
      Drag.start(e, CPQ.indexOf(controlPoint));
      break searchPoint;
    }
  }
});

canvasShadow.addEventListener('mousemove', (e) => {
  let p = new Point(mouseX,mouseY);
  if (j > 0){
    for (let controlPoint of CPQ) {
      switch (drawType){
        case 'Quadratic':
          if(controlPoint.isInside(p)){
            drawType = 'dragQuadratic';
          } 
          break;
        case 'dragQuadratic':
          if(controlPoint.isInside(p)){
            Drag.do(e, CPQ.indexOf(controlPoint));
          }
          break;
      }
    }
  }
});

canvasShadow.addEventListener('mouseup', () => {
  switch (drawType){
    case 'dragQuadratic':
      Drag.stop();
      break;
  }
});

canvasShadow.addEventListener('mouseout', () => {
  switch (drawType){
    case 'dragQuadratic':
      Drag.stop();
      break;
  }
});

//Save drawed curve on main canvas
canvasShadow.addEventListener('dblclick', () => {
  switch (drawType){
    case 'dragQuadratic':
      startX = startY = undefined;
      if (j !== 0) {
        for (var k = 0; k < CPQ.length; k++) {
          Quadratic.onlyLine(ctx, k);
        }
        ctxShadow.clearRect(0, 0, canvas.width, canvas.height);
      }
      //clear arrays
      CPQ.splice(0, CPQ.length);
      QuadraticSFP.splice(0, QuadraticSFP.length);
      //clear index
      j = 0;
      //return drawType to primary 
      drawType = 'Quadratic';
      break;
  }
});
