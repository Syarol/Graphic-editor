
context = document.getElementById('canvas').getContext("2d");
canvas = document.getElementById('canvas');

var mouseX;
var mouseY;

function mousePos(evt){
	var rect = canvas.getBoundingClientRect();
	mouseX = (evt.clientX - rect.left) / (rect.right - rect.left) * canvas.width;//mouse position
	mouseY = (evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height;
	return{mouseX,mouseY};
}

canvas.addEventListener('mousedown',function(evt){
	mousePos(evt);
  	paint = true;
  	addClick(mouseX,mouseY);
  	redraw();
});

canvas.addEventListener('mousemove',function(evt){
  	if(paint){
  		mousePos(evt);
    	addClick(mouseX, mouseY, true);
    	redraw();
  	}
});

canvas.addEventListener('mouseup',function(e){
  	paint = false;
});

canvas.addEventListener('mouseleave',function(e){
  	paint = false;
});

function paintFalse(e){
	paint = false;
}

var clickX = new Array();
var clickY = new Array();
var clickDrag = new Array();
var paint;

function addClick(x, y, dragging)
{
  	clickX.push(x);
  	clickY.push(y);
  	clickDrag.push(dragging);
}

function redraw(){
  	context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas
  
 	context.strokeStyle = "#df4b26";
  	context.lineJoin = "round";
  	context.lineWidth = 2;
  	context.lineCap = 'round';
			
  	for(var i=0; i < clickX.length; i++) {		
    	context.beginPath();
    	if(clickDrag[i] && i){
      		context.moveTo(clickX[i-1], clickY[i-1]);
     	}else{
       		context.moveTo(clickX[i], clickY[i]);
     	}
     	context.lineTo(clickX[i], clickY[i]);
     	//context.fill();
     	context.closePath();
     	context.stroke();
  	}
}

clearButton=document.getElementById("clear-button");

clearButton.addEventListener('click', function(){
	context.clearRect(0, 0, canvas.width, canvas.height);
	clickX=[];
	clickY=[];
	clickDrag=[];
});
