$( document ).ready(function() {
    var canvas = document.getElementById("imageView");
    var context = canvas.getContext("2d");

    $("#imageView").mousedown(function(e) {
    	var x = e.pageX - this.offsetLeft;
    	var y = e.pageY - this.offsetTop;
    });
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

//visual test to be removed
$('#imageView').on("mouseover", function() {
 $(this).css("background-color", drawing.nextColor );
 console.log(drawing.nextObject);
});