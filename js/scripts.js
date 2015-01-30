$( document ).ready(function() {
    var canvas = document.getElementById("imageView");
    var context = canvas.getContext("2d");

    var isDrawing = false;

    $("#imageView").mousedown(function(e) {
    	var startPoint = new Point();
    	startPoint.x = e.pageX - this.offsetLeft;
    	startPoint.y = e.pageY - this.offsetTop;
    	var nextColor = drawing.nextColor;
    	isDrawing = true;
    	// hægt að refactora, sjá fyrirlestur 2b
    	if(drawing.nextObject === "square") {
    		drawing.shapes.push(new  Rect(startPoint, nextColor));
    	}
    	if(drawing.nextObject === "line") {
    		drawing.shapes.push(new Line(startPoint, nextColor));
    	}
    	if(drawing.nextObject === "circle") {
    		drawing.shapes.push(new Circle(startPoint, nextColor));
    	}
    	if(drawing.nextObject === "pen") {
    		drawing.shapes.push(new Pencil(startPoint, nextColor));
    	}
    });

    $("#imageView").mousemove(function(e) {
    	if(isDrawing === true) {
    		var obj = drawing.shapes[drawing.shapes.length - 1];
    		var currPoint = new Point();
    		currPoint.x = e.pageX - this.offsetLeft;
			currPoint.y = e.pageY - this.offsetTop;
			obj.setEndPoint(currPoint);
			drawing.drawAll();
			if(drawing.nextObject === "square") {
				obj.setHeightAndWidth();
			}
			if(drawing.nextObject === "circle") {
				obj.setRadius();
				obj.setCenterPoint();
			}
			if(drawing.nextObject === "pen") {
				obj.addToDrawingArr(currPoint);
			}
    	}
    });

	$("#imageView").mouseup(function(e) {
    	isDrawing = false;
	});	

	$('#picker').colpick({
		flat:true,
		layout:'hex',
		submit:0,
		colorScheme: 'dark',
		color: '000000',
		onChange: function(hsb,hex,rgb,el,bySetColor) {
			drawing.nextColor = '#'+hex;
		}
	});

	$('input:radio').change( function() {
		drawing.nextObject = this.value;
	});

	$("#undo").click(function() {
		if(drawing.shapes.length > 0) {
			var removedObj = drawing.shapes.pop();
			drawing.drawAll();
			drawing.removedShapes.push(removedObj);
		}

	});

	$("#redo").click(function() {
		if(drawing.removedShapes.length > 0) {
			var objToAdd = drawing.removedShapes.pop();
			drawing.shapes.push(objToAdd);
			drawing.drawAll();
		}
	});

	var drawing = {
		shapes: [],
		removedShapes: [],
		nextObject: "pen",
		nextColor: "#000000",
		drawAll: function drawAll() {
			context.clearRect(0, 0, canvas.width, canvas.height);
			for (var i = 0; i < this.shapes.length; ++i) {
				this.shapes[i].draw();
			}
		}
	};

	function Point() { 
		this.x = 0;
		this.y = 0;
	};

	var Shape = Base.extend( {
		constructor: function(startPoint, color) {
			this.startPoint = startPoint;
			this.endPoint = startPoint;
			this.color = color;
		},
		startPoint: 0,
		endPoint: 0,
		color: "#000000",

		setEndPoint: function(endPoint) {
			this.endPoint = endPoint;
		}, 

		isAtPoint: function(x,y) {

		}
	});

	var Rect = Shape.extend( {
		constructor: function(startPoint, color) {
			this.base(startPoint ,color);
			this.rWidth = 0;
			this.rHeight = 0;
		},
		rWidth: 0,
		rHeight: 0,
		setHeightAndWidth: function setHeightAndWidth() {
			this.rWidth = this.endPoint.x - this.startPoint.x;
			this.rHeight = this.endPoint.y - this.startPoint.y;
		},
		draw: function draw() {	
			context.strokeStyle = this.color;
			context.strokeRect(this.startPoint.x, this.startPoint.y, this.rWidth, this.rHeight);
		}
	});

	var Line = Shape.extend( {
		constructor: function(startPoint, color) {
			this.base(startPoint ,color);
			this.draw();	
		},
		draw: function draw() {	
			context.strokeStyle = this.color;
			context.beginPath();
			context.moveTo(this.startPoint.x, this.startPoint.y);
			context.lineTo(this.endPoint.x, this.endPoint.y);
			context.stroke();	
		}
	});

	var Circle = Shape.extend( {
		constructor: function(startPoint, color) {
			this.base(startPoint, color);
		},
		radius: 0,
		centerPoint: 0,
		setRadius: function setRadius() {
			this.radius = Math.max(
				Math.abs(this.endPoint.x - this.startPoint.x),
				Math.abs(this.endPoint.y - this.startPoint.y)
				)/2;
		},
		setCenterPoint: function setCenterPoint() {
			var cPoint = new Point();
			cPoint.x = (this.endPoint.x + this.startPoint.x)/2;
			cPoint.y = (this.endPoint.y + this.startPoint.y)/2;
			this.centerPoint = cPoint;
		},
		draw: function draw() {
			context.strokeStyle = this.color;
			context.beginPath();
			context.arc(this.centerPoint.x, this.centerPoint.y, this.radius, 0, Math.PI*2, false);
			context.stroke();
		}
	});

	var Pencil = Shape.extend( {
		constructor: function(startPoint, color) {
			this.base(startPoint, color);
			this.drawingArr = [startPoint];
		},
		drawingArr: [],
		addToDrawingArr: function addToDrawingArr(point) {
			this.drawingArr.push(point);
		},
		draw: function draw() {
			context.strokeStyle = this.color;
			context.beginPath();
			context.moveTo(this.startPoint.x, this.startPoint.y);
			for(var i = 0; i < this.drawingArr.length; i++)
			{
				context.lineTo(this.drawingArr[i].x,this.drawingArr[i].y);
			}
			context.stroke();
			context.closePath();
		}
	});



	//visual test to be removed
	// $('#imageView').on("mouseover", function() {
	//  $(this).css("background-color", drawing.nextColor );
	//  console.log(drawing.nextObject);
	// });
});