
var mainShadow = document.getElementById('main-shadow');
var canvasShadow = document.getElementById('canvas-shadow');
var ctxShadow = document.getElementById('canvas-shadow').getContext("2d");
var chooseBezier = document.getElementById("bezier");

var bezXStart, bezYStart;
var bezierSFP = [];//Array for Start/Finish control points
var j = 0, i = 0;
var deltaCenter = null;
var CPQ = [];//Control Point array for Quadratic Bezier 

function Line(bezXStart, bezYStart, mouseX, mouseY){
  this.bezXStart = bezXStart;
  this.bezYStart = bezYStart;
  this.bezXFinish = mouseX;
  this.bezYFinish = mouseY;
  return this;
}

function Point(x,y){
  this.x = x;
  this.y = y;
  return this;
}

function Circle(point, radius) {
  this.point = point;
  this.radius = radius;
  this.isInside = function (p) {
    return Math.pow(p.x - point.x, 2) + Math.pow(p.y - point.y, 2) < Math.pow(radius, 2); 
  };
  return this;
}

canvasShadow.addEventListener('click', drawBezierSFP);

//var yio = 0;

canvasShadow.addEventListener('mousedown', function(e){
  var p = new Point(mouseX,mouseY);
  searchPoint : for (var r = 0; r < CPQ.length; r++) {
    if (drawType =='dragBezier' && CPQ[r].isInside(p)){
      startDragging(e, r);
      break searchPoint;
    }else{
      //yio++;
    }
  }
  /*if (yio == CPQ.length){
    drawType = 'Bezier';
  };*/
});

canvasShadow.addEventListener('mousemove', function(e){
  var p = new Point(mouseX,mouseY);
  if (j > 0){
    for (i = 0; i < CPQ.length; i++) {
      switch (drawType){
        case 'Bezier':
          if(CPQ[i].isInside(p)){
            drawType = 'dragBezier';
          } 
          break;
        case 'dragBezier':
          if(CPQ[i].isInside(p)){
              drag(e,i);
              break;
          }
          break;
      }
    }
  }
});

canvasShadow.addEventListener('mouseup', stopDragging);

canvasShadow.addEventListener('mouseout', stopDragging);

//Save drawed curve on main canvas
canvasShadow.addEventListener('dblclick', function(){
  bezXStart = bezYStart = undefined;
  if (j !== 0) {
    for (var k = 0; k < CPQ.length; k++) {
        ctx.beginPath();
          ctx.moveTo(bezierSFP[k].bezXStart, bezierSFP[k].bezYStart);
          ctx.quadraticCurveTo(CPQ[k].point.x, CPQ[k].point.y, bezierSFP[k].bezXFinish, bezierSFP[k].bezYFinish);
        ctx.stroke();
      }
    ctxShadow.clearRect(0, 0, canvas.width, canvas.height);
  }
  //clear arrays
  CPQ.splice(0, CPQ.length);
  bezierSFP.splice(0, bezierSFP.length);
  //clear index
  j = 0;
  //return drawType to primary 
  drawType = 'Bezier';
});

chooseBezier.addEventListener('click',function(){
  mainShadow.style.visibility = 'visible';
  bezXStart = bezYStart = undefined;
  clearHistory();
  drawType = 'Bezier';
  ctxShadow.clearRect(0, 0, canvas.width, canvas.height);
});

function startDragging(e, k) {
  mousePos(e);
  deltaCenter = new Point(mouseX - CPQ[k].point.x, mouseY - CPQ[k].point.y); 
}

function drag(e, i) {
  if(deltaCenter !== null) {
    mousePos(e);

    CPQ[i].point.x = (mouseX - deltaCenter.x);
    CPQ[i].point.y = (mouseY - deltaCenter.y);

    ctxShadow.clearRect(0, 0, canvas.width, canvas.height);
    for (var k = 0; k < CPQ.length; k++) {
      if (k != i){
        ctxShadow.beginPath();
          ctxShadow.moveTo(bezierSFP[k].bezXStart, bezierSFP[k].bezYStart);
          ctxShadow.quadraticCurveTo(CPQ[k].point.x, CPQ[k].point.y, bezierSFP[k].bezXFinish, bezierSFP[k].bezYFinish);
        ctxShadow.stroke();
        drawCircle(CPQ[k]); 
      } else{
        ctxShadow.beginPath();
          ctxShadow.moveTo(bezierSFP[i].bezXStart, bezierSFP[i].bezYStart);
          ctxShadow.quadraticCurveTo(CPQ[i].point.x, CPQ[i].point.y, bezierSFP[i].bezXFinish, bezierSFP[i].bezYFinish);
        ctxShadow.stroke(); 
        drawCircle(CPQ[i]); 
      }
    }
      
  }
}


function stopDragging(e) {
  if (drawType == 'dragBezier') deltaCenter = null;
}

//Draw Control Circle
function drawCircle(circle) {
  ctxShadow.beginPath();
    ctxShadow.arc(circle.point.x, circle.point.y, circle.radius, 0, Math.PI*2, true);
  ctxShadow.fill();
  ctxShadow.stroke();
}

//Draw Bezier Start-Finish Points
function drawBezierSFP(e){ 
  switch (drawType){
    case 'Bezier':
      if (bezXStart === undefined && bezYStart === undefined){ //If Start Point missing, then create
        bezXStart = mouseX;
        bezYStart = mouseY;
      } else {//If Start Point already created, then create Finish Point
        ctxShadow.beginPath();
          ctxShadow.moveTo(bezXStart, bezYStart);
          ctxShadow.lineTo(mouseX, mouseY);
        ctxShadow.stroke();

        bezierSFP[j] = new Line(bezXStart, bezYStart, mouseX, mouseY);//Save Finish and Start points coordinates

        bezXStart = mouseX;//Finish point for last = Start point for next
        bezYStart = mouseY;

        var CPX = (bezierSFP[j].bezXFinish + bezierSFP[j].bezXStart)/2;//X and Y coordinates of line center
        var CPY = (bezierSFP[j].bezYFinish + bezierSFP[j].bezYStart)/2;  

        CPQ[j] = new Circle(new Point(CPX, CPY), 5);

        drawCircle(CPQ[j]);
       
        j++; 
      }
      break;
  }
}
