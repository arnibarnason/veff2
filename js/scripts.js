$( document ).ready(function() {
    var canvas = document.getElementById("imageView");
    var context = canvas.getContext("2d");
    context.canvas.height = window.innerHeight;
    context.canvas.width = window.innerWidth * 3/4;

    var isDrawing = false;
    var isSelectedTextBox = false;
    var newTextBox;
    var textBoxPoint;
    var isSelectedObject = false;
    var theSelectedObject;

    $("#imageView").mousedown(function(e) {
   		if(newTextBox) {
       		newTextBox.remove();
    	}
    	var startPoint = new Point();
    	startPoint.x = e.pageX - this.offsetLeft;
    	startPoint.y = e.pageY - this.offsetTop;
    	var nextColor = drawing.nextColor;
    	var boldness = drawing.nextWidth;
    	isDrawing = true;
    	isSelectedTextBox = false;
    	isSelectedObject = false;
    	// hægt að refactora, sjá fyrirlestur 2b
    	if(drawing.nextObject === "square") {
    		drawing.shapes.push(new  Rect(startPoint, nextColor, boldness));
    	}
    	if(drawing.nextObject === "line") {
    		drawing.shapes.push(new Line(startPoint, nextColor, boldness));
    	}
    	if(drawing.nextObject === "circle") {
    		drawing.shapes.push(new Circle(startPoint, nextColor, boldness));
    	}
    	if(drawing.nextObject === "pen") {
    		drawing.shapes.push(new Pencil(startPoint, nextColor, boldness));
    	}
    	if(drawing.nextObject === "text") {
    		isSelectedTextBox = true;
    		newTextBox = $("<input />");
    		newTextBox.css("position", "absolute");
    		newTextBox.css("top", startPoint.y);
    		newTextBox.css("left", startPoint.x);
    		$("#canvasParent").append(newTextBox);
    		newTextBox.focus();
    		isDrawing = false;
    		textBoxPoint = startPoint;
    	}
    	if(drawing.nextObject === "selector") {
    		isDrawing = false;
    		for (var i = 0; i < drawing.shapes.length; ++i) {
				if(drawing.shapes[i].isAtPoint(startPoint)) {
					isSelectedObject = true;
					theSelectedObject = i;
					drawing.shapes[i].initLastChosenPoint(startPoint);
					break;
					// context.lineWidth = 0;
    	// 			context.shadowBlur = 30;
    	// 			context.shadowColor = "blue";
    	// 			context.strokeRect(drawing.shapes[i].startPoint.x, drawing.shapes[i].startPoint.y, drawing.shapes[i].rWidth, drawing.shapes[i].rHeight);
				}
				else {
					isSelectedObject = false;
				}
  		  	}
  		}
    });

    $("#imageView").mousemove(function(e) {
    	if(isDrawing === true) {
    		var currPoint = new Point();
			currPoint.x = e.pageX - this.offsetLeft;
			currPoint.y = e.pageY - this.offsetTop;
    		var obj = drawing.shapes[drawing.shapes.length - 1];
			obj.setEndPoint(currPoint);
			obj.setHeightAndWidth();
			if(drawing.nextObject === "circle") {
				obj.setRadius();
				obj.setCenterPoint();
			}
			if(drawing.nextObject === "pen") {
				obj.addToDrawingArr(currPoint);
			}
			drawing.drawAll();
    	}
    	else if (isSelectedObject === true) {
    		var currPoint = new Point();
			currPoint.x = e.pageX - this.offsetLeft;
			currPoint.y = e.pageY - this.offsetTop;
    		var obj = drawing.shapes[theSelectedObject];
    		obj.move(currPoint);
    		drawing.drawAll();
    	}
    });

	$("#imageView").mouseup(function(e) {
    	isDrawing = false;
    	isSelectedObject = false;
	});	
	$("#imageView").mouseout(function(e) {
    	isDrawing = false;
    	isSelectedObject = false;
	});

	$(document).keypress(function(e) {
	    if(isSelectedTextBox === true) {
			if(e.which === 13) {
				var text = newTextBox.val();
				if(text.length === 0) {
					newTextBox.remove();
				}
				else {
					var obj = new Text(textBoxPoint, drawing.nextColor, text, drawing.nextFont, drawing.nextFontSize);
		            drawing.shapes.push(obj);
		           	obj.setEndPoint();
		            newTextBox.remove();
		            isSelectedTextBox = false;				
				}
			}
	    }
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

	$("[name=options]").change( function() {
		drawing.nextObject = this.value;
	});

	$("[name=boldness]").change( function() {
		drawing.nextWidth = parseInt(this.value);
	});

	$("[name=font]").change( function() {
		drawing.nextFont = this.value;
	});

	$("[name=fontsize]").change( function() {
		drawing.nextFontSize = this.value;
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

	$("#save").click(function() {
		localStorage.setItem(canvas, canvas.toDataURL());
	});

	var drawing = {
		shapes: [],
		removedShapes: [],
		nextObject: "pen",
		nextColor: "#000000",
		nextWidth: 1,
		nextFont: "Arial",
		nextFontSize: "20px ",
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
		constructor: function(startPoint, color, boldness) {
			this.startPoint = startPoint;
			this.endPoint = startPoint;
			this.rWidth = 0;
			this.rHeight = 0;
			this.color = color;
			this.boldness = boldness;
			this.lastChosenPoint = startPoint;
		},
		startPoint: 0,
		endPoint: 0,
		rWidth: 0,
		rHeight: 0,
		color: "#000000",
		boldness: "", 
		lastChosenPoint: 0,

		initLastChosenPoint: function initLastChosenPoint (point) {
			this.lastChosenPoint = point;
		},

		setHeightAndWidth: function setHeightAndWidth() {
			this.rWidth = this.endPoint.x - this.startPoint.x;
			this.rHeight = this.endPoint.y - this.startPoint.y;
		},

		move: function move(toPoint) {
			var xDiff = toPoint.x - this.lastChosenPoint.x;
			var yDiff = toPoint.y - this.lastChosenPoint.y;
			this.startPoint.x += xDiff;
			this.startPoint.y += yDiff;
			this.endPoint.x += xDiff;
			this.endPoint.y += yDiff;
			this.lastChosenPoint = toPoint;
		},

		setEndPoint: function(endPoint) {
			this.endPoint = endPoint;
		}, 

		isAtPoint: function(point) {
		    // var canvasTemp = document.getElementById("imageView");
    		// var contextTemp = canvasTemp.getContext("2d");
    		// this.draw();
    		// if(contextTemp.isPointInPath(point.x, point.y)){
    		// 	return true;
    		// }
    		// else {
    		// 	return false;
    		// }
    		
    		if((this.startPoint.x < point.x && point.x < this.endPoint.x) || (this.startPoint.x > point.x && point.x > this.endPoint.x)) {
	    		if((this.startPoint.y < point.y && point. y < this.endPoint.y) || (this.startPoint.y > point.y && point.y > this.endPoint.y)) {
	    			return true;
	    		}
    		}
    		return false;
		}
	});

	var Rect = Shape.extend( {
		constructor: function(startPoint, color, boldness) {
			this.base(startPoint ,color, boldness);
			this.rWidth = 0;
			this.rHeight = 0;
		},
		rWidth: 0,
		rHeight: 0,

		draw: function draw() {	
			context.strokeStyle = this.color;
			context.lineWidth = this.boldness;
			context.strokeRect(this.startPoint.x, this.startPoint.y, this.rWidth, this.rHeight);
		}
	});

	var Line = Shape.extend( {
		constructor: function(startPoint, color, boldness) {
			this.base(startPoint, color, boldness);
			this.draw();	
		},
		draw: function draw() {	
			context.strokeStyle = this.color;
			context.lineWidth = this.boldness;
			context.beginPath();
			context.moveTo(this.startPoint.x, this.startPoint.y);
			context.lineTo(this.endPoint.x, this.endPoint.y);
			context.stroke();	
		}
	});

	var Circle = Shape.extend( {
		constructor: function(startPoint, color, boldness) {
			this.base(startPoint, color, boldness);
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
		move: function move(toPoint) {
			var xDiff = toPoint.x - this.lastChosenPoint.x;
			var yDiff = toPoint.y - this.lastChosenPoint.y;
			this.centerPoint.x += xDiff;
			this.centerPoint.y += yDiff;
			this.startPoint.x += xDiff;
			this.startPoint.y += yDiff;
			this.endPoint.x += xDiff;
			this.endPoint.y += yDiff;
			this.lastChosenPoint = toPoint;
		},
		draw: function draw() {
			context.strokeStyle = this.color;
			context.lineWidth = this.boldness;
			context.beginPath();
			context.arc(this.centerPoint.x, this.centerPoint.y, this.radius, 0, Math.PI*2, false);
			context.stroke();
		}
	});

	var Pencil = Base.extend( {
		constructor: function(startPoint, color, boldness) {
			this.startPoint = startPoint;
			this.endPoint = startPoint;
			this.lastChosenPoint = startPoint;
			this.color = color;
			this.boldness = boldness;
			this.drawingArr = [startPoint];
			this.topLeftMost = startPoint;
			this.bottomRightMost = startPoint;
		},
		startPoint: 0,
		endPoint: 0,
		lastChosenPoint: 0,
		color: "#000000",
		boldness: 0,
		drawingArr: [],
		addToDrawingArr: function addToDrawingArr(point) {
			this.drawingArr.push(point);
			// setTimeout(function () {
			    
  			// }, 2500);
			// if(this.topLeftMost.x > point.x) {
			// 	this.topLeftMost.x = point.x;
			// }
			// if(this.topLeftMost.y < point.y) {
			// 	this.topLeftMost.y = point.y;
			// }
			// if(this.bottomRightMost.x < point.x) {
			// 	this.bottomRightMost.x = point.x;
			// }
			// if(this.bottomRightMost.y > point.y) {
			// 	this.bottomRightMost.y = point.y;
			// }
			this.endPoint = point;
		},

		topLeftMost: 0,
		bottomRightMost: 0,
		setHeightAndWidth: function setHeightAndWidth() {
			this.rWidth = this.endPoint.x - this.startPoint.x;
			this.rHeight = this.endPoint.y - this.startPoint.y;
		},

		initLastChosenPoint: function initLastChosenPoint (point) {
			this.lastChosenPoint = point;
		},

		isAtPoint: function(point) {
    		if((this.startPoint.x < point.x && point.x < this.endPoint.x) || (this.startPoint.x > point.x && point.x > this.endPoint.x)) {
	    		if((this.startPoint.y < point.y && point. y < this.endPoint.y) || (this.startPoint.y > point.y && point.y > this.endPoint.y)) {
	    			return true;
	    		}
    		}
    		return false;
		},

		setEndPoint: function(endPoint) {
			this.endPoint = endPoint;
		}, 

		move: function move(toPoint) {
			var xDiff = toPoint.x - this.lastChosenPoint.x;
			var yDiff = toPoint.y - this.lastChosenPoint.y;
			this.lastChosenPoint = toPoint;
			for(var i = 0; i < this.drawingArr.length; i++)
			{
				this.drawingArr[i].x += xDiff;
				this.drawingArr[i].y += yDiff;
			}

		},

		draw: function draw() {
			context.strokeStyle = this.color;
			context.lineWidth = this.boldness;
			context.beginPath();
			context.moveTo(this.startPoint.x, this.startPoint.y);
			for(var i = 0; i < this.drawingArr.length; i++)
			{
				context.lineTo(this.drawingArr[i].x,this.drawingArr[i].y);
			}
			context.stroke();
			//context.closePath();
		}
	});

	var Text = Base.extend( {
		constructor: function(startPoint, color, text, font, fontsize) {
			this.startPoint = startPoint;
			this.endPoint = startPoint;
			this.lastChosenPoint = startPoint;
			this.color = color;
			this.string = text;
			this.inputBox = {};
			this.font = font;
			this.fontSize = fontsize;
			this.widthOfText = 0;
			this.draw();
		},
		startPoint: 0,
		endPoint: 0,
		lastChosenPoint: 0,
		color: 0,
		inputBox: {},
		string: "",
		font: "",
		fontSize: "",
		widthOfText: 0,
		initLastChosenPoint: function initLastChosenPoint (point) {
			this.lastChosenPoint = point;
		},
		move: function move(toPoint) {
			var xDiff = toPoint.x - this.lastChosenPoint.x;
			var yDiff = toPoint.y - this.lastChosenPoint.y;
			this.startPoint.x += xDiff;
			this.startPoint.y += yDiff;
			this.endPoint.x += xDiff;
			this.endPoint.y += yDiff;
			this.lastChosenPoint = toPoint;
		},
		setEndPoint: function() {
			var yD = 50;
			var xD = parseInt(this.widthOfText);
			var newEndPoint = {x: this.startPoint.x + xD, y: this.startPoint.y + 30};
			this.endPoint = newEndPoint;
		}, 
		isAtPoint: function(point) {
    		if((this.startPoint.x < point.x && point.x < this.endPoint.x) || (this.startPoint.x > point.x && point.x > this.endPoint.x)) {
	    		if((this.startPoint.y < point.y && point. y < this.endPoint.y) || (this.startPoint.y > point.y && point.y > this.endPoint.y)) {
	    			return true;
	    		}
    		}
    		return false;
		},
		draw: function draw() {
			context.strokeStyle = this.color;
			context.font = this.fontSize + this.font;
			context.lineWidth = 1;
			this.widthOfText = context.measureText(this.string).width;
			context.fillText(this.string, this.startPoint.x, this.startPoint.y + 15);
   		}
	})
});