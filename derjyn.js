$(document).ready(function() {
	$('#starfield').starscroll(
	    8,					// MODE 			: Boolean, or 8/16 for bit mode
	    5,					// PARALLAX 		: Number of parallax layers, max 10
	    10,					// DENSITY 			: Number of stars
	    1,					// DIMENSION 		: Size of stars, max 20
	    1,					// SMOOTHNESS 		: Scroll smoothness, min 0 / max 10
	    [64,64,64],			// COLOUR 			: RGB array, 16bit only
	    false,				// COLOUR-VARIANCE 	: Subtle coloor varience boolean, 16bit only
	    true,				// ANIMATE 			: Boolean, auto scrolling starfield
	    1 					// SPEED			: 8bit speed
	);

	$(function() {
		for(i=0;i<4;i++) {
			$('.header .text span').eq(0).clone().prependTo('.header .text');
		}
	});

	$('#tab-links a').on('click', function(e) {
		var currentAttrValue = $(this).attr('href');

		// Show/Hide Tabs
		$('#tabs ' + currentAttrValue).show().siblings().hide();

		// Change/remove current tab to active
		$(this).parent('li').addClass('clicked').siblings().removeClass('clicked');
		$(this).parent('li').addClass('active').siblings().removeClass('active');

		e.preventDefault();
    });
});
