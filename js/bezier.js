
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
};

function Point(x,y){
  this.x = x;
  this.y = y;
  return this;
};

function Circle(point, radius) {
  this.point = point;
  this.radius = radius;
  this.isInside = function (p) {
    return Math.pow(p.x - point.x, 2) + Math.pow(p.y - point.y, 2) < Math.pow(radius, 2); 
  };
  this.isDragging = false;
  return this;
};

canvasShadow.addEventListener('click', drawBezierSFP);

canvasShadow.addEventListener('mousedown', function(e){
  console.log("down");
  var p = new Point(mouseX,mouseY);
  for (i = 0; i < j/*CPQ.length*/; i++) {
    switch (drawType){
      case 'dragBezier':
        if (CPQ[j-1].isInside(p)){
          CPQ[j-1].isDragging = true;
          console.log('fd');
          startDragging(e, j-1);
        }
      }
      break;
  }

});

canvasShadow.addEventListener('mousemove', function(e){
  var p = new Point(mouseX,mouseY);
  //for (i = 0; i < CPQ.length; i++) {
    if (j > 0){
    switch (drawType){
      case 'Bezier':
        if(CPQ[j-1].isInside(p)){
          drawType = 'dragBezier';
          console.log("inside");
        } 
        break;
      case 'dragBezier':
        if(CPQ[j-1].isInside(p)){
          //if (CPQ[i].isDragging) {
            console.log("inside2");
            drag(e,j-1);
          //}
        }else{
          drawType = 'Bezier';
          console.log("outside");
        }
        break;
    }
    }
  //}
});

canvasShadow.addEventListener('mouseup', stopDragging);

canvasShadow.addEventListener('mouseout', stopDragging);

canvasShadow.addEventListener('dblclick', function(){
  bezXStart = bezYStart = undefined;
  if (j != 0) {
    console.log(j);
    ctx.beginPath();
        ctx.moveTo(bezierSFP[j-1].bezXStart, bezierSFP[j-1].bezYStart);
        ctx.quadraticCurveTo(CPQ[j-1].point.x, CPQ[j-1].point.y, bezierSFP[j-1].bezXFinish, bezierSFP[j-1].bezYFinish);
    ctx.stroke();
    ctxShadow.clearRect(0, 0, canvas.width, canvas.height);
  }
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
  console.log("I'm Start!");
  //canvasShadow.addEventListener('mousemove', drag(e, k));
}

function drag(e, i) {
  if(deltaCenter !== null) {
    mousePos(e);

    CPQ[i].point.x = (mouseX - deltaCenter.x);
    CPQ[i].point.y = (mouseY - deltaCenter.y);

      ctxShadow.clearRect(0, 0, canvas.width, canvas.height);
      ctxShadow.beginPath();
        ctxShadow.moveTo(bezierSFP[i].bezXStart, bezierSFP[i].bezYStart);
        ctxShadow.quadraticCurveTo(CPQ[i].point.x, CPQ[i].point.y, bezierSFP[i].bezXFinish, bezierSFP[i].bezYFinish);
      ctxShadow.stroke();

    drawCircle(CPQ[i]);   
  }
}

function stopDragging(e) {
  switch(drawType){
    case 'dragBezier':
      deltaCenter = null;
      for (var i = 0; i < CPQ.length; i++) {
        if(CPQ[i].isDragging){
          CPQ[i].isDragging = false;
          console.log(CPQ[i].isDragging);
        } 
      }
      //canvasShadow.removeEventListener('mousemove', drag);
      break;
  }
}

//Draw Control Circle
function drawCircle(circle) {
  //ctxShadow.clearRect(0, 0, canvas.width, canvas.height);
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
