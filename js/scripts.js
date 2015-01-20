$( document ).ready(function() {
    var canvas = document.getElementById("imageView");
    var context = canvas.getContext("2d");

    var isDrawing = false;

    $("#imageView").mousedown(function(e) {
    	var x = e.pageX - this.offsetLeft;
    	var y = e.pageY - this.offsetTop;
    	var nextColor = drawing.nextColor;
    	isDrawing = true;
    	if(drawing.nextObject === "square") {
    		drawing.shapes.push(new  Rect(x, y, nextColor));
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

	$('input:radio').change( function() {
		drawing.nextObject = this.value;
	});

	var drawing = {
		shapes: [],
		nextObject: "pen",
		nextColor: "#000000",
		drawAll: function drawAll() {
			for (var i = 0; i < shapes.length; ++i) {
				shapes[i].draw(/* TODO: there will be some parameters here...*/);
			}
		}
	};

	var Shape = Base.extend( {
		constructor: function(startX, startY, color) {
			this.startX = startX;
			this.startY = startY;
			this.color = color;
		},
		startX: 0,
		startT: 0,
		color: "#000000",

		isAtPoint: function(x,y) {

		}
	})

	var Rect = Shape.extend( {
		constructor: function(x, y, color) {
			this.base(x,y,color);
			//this.rWidth = rWidth;
			//this.rHeight = rHeight;
			this.draw();	
		},
		rWidth: 10,
		rHeight: 10,
		draw: function draw() {
			context.strokeStyle = this.color;
			context.strokeRect(this.startX, this.startY, this.rWidth, this.rHeight);
		}
	});




	//visual test to be removed
	// $('#imageView').on("mouseover", function() {
	//  $(this).css("background-color", drawing.nextColor );
	//  console.log(drawing.nextObject);
	// });
});