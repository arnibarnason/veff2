$( document ).ready(function() {
    var canvas = document.getElementById("imageView");
    var context = canvas.getContext("2d");

    var isDrawing = false;

    var startX = 0;
    var startY = 0;

    $("#imageView").mousedown(function(e) {
    	startX = e.pageX - this.offsetLeft;
    	startY = e.pageY - this.offsetTop;
    	var nextColor = drawing.nextColor;
    	isDrawing = true;
    	// hægt að refactora, sjá fyrirlestur 2b
    	if(drawing.nextObject === "square") {
    		drawing.shapes.push(new  Rect(startX, startY, nextColor));
    	}
    	if(drawing.nextObject === "line") {
    		drawing.shapes.push(new Line(startX, startY, nextColor));
    	}
    });

    $("#imageView").mousemove(function(e) {
    	if(isDrawing === true) {
    		var obj = drawing.shapes[drawing.shapes.length - 1];
    		var endX = e.pageX - this.offsetLeft;
			var endY = e.pageY - this.offsetTop;
			obj.setEndPoint(endX, endY);
			drawing.drawAll();
			if(drawing.nextObject === "square") {
				obj.setHeightAndWidth();
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

	var Shape = Base.extend( {
		constructor: function(startX, startY, color) {
			this.startX = startX;
			this.startY = startY;
			this.endX = startX;
			this.endY = startY;
			this.color = color;
		},
		startX: 0,
		startT: 0,
		endX: 0,
		endY: 0,
		color: "#000000",

		setEndPoint: function(x, y) {
			this.endX = x;
			this.endY = y;
		}, 

		isAtPoint: function(x,y) {

		}
	});

	var Rect = Shape.extend( {
		constructor: function(startX, startY, color) {
			this.base(startX, startY ,color);
			this.rWidth = 1;
			this.rHeight = 1;
			this.draw();	
		},
		rWidth: 1,
		rHeight: 1,
		setHeightAndWidth: function setHeightAndWidth() {
			this.rWidth = this.endX - this.startX;
			this.rHeight = this.endY - this.startY;
		},
		draw: function draw() {	
			context.strokeStyle = this.color;
			context.strokeRect(this.startX, this.startY, this.rWidth, this.rHeight);
		}
	});

	var Line = Shape.extend( {
		constructor: function(startX, startY, color) {
			this.base(startX, startY ,color);
			this.draw();	
		},
		draw: function draw() {	
			context.strokeStyle = this.color;
			context.beginPath();
			context.moveTo(this.startX, this.startY);
			context.lineTo(this.endX, this.endY);
			context.stroke();	
		}
	});



	//visual test to be removed
	// $('#imageView').on("mouseover", function() {
	//  $(this).css("background-color", drawing.nextColor );
	//  console.log(drawing.nextObject);
	// });
});