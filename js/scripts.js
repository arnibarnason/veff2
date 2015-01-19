var currColor = '#000000';

$('#picker').colpick({
	flat:true,
	layout:'hex',
	submit:0,
	colorScheme: 'dark',
	color: '000000',
	onChange: function(hsb,hex,rgb,el,bySetColor) {
		currColor = '#'+hex;
	}
});



// $('#imageView').on("mouseover", function() {
// $(this).css("background-color", currColor );
// });