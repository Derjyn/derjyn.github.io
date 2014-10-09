/**
 * Soma Javascript
 *
*/

$(document).ready(function () {
	// ParticleGround stuff
  $('#bg-fx').particleground({
  	minSpeedX: 0.2,
  	maxSpeedX: 0.5,
  	minSpeedY: 0.2,
  	maxSpeedY: 0.5,
  	directionX: 'center',		// center/up/down. center has the dots bouncing off edge of canvas
  	dirextionY: 'center',		// center/up/down. center has the dots bouncing off edge of canvas
  	density: 6000,					// particle density, one particle every n pixels (higher = less)
  	dotColor: 'rgb(60,60,60)',
  	lineColor: 'rgb(120,120,120)',
  	particleRadius: 1,			// dot size
  	lineWidth: 0.3,
  	curvedLines: false,
  	proximity: 70,					// proximity before dots join
  	parallax: false,
  	parallaxMultiplier: 25	// lower values make the parallax effect more extreme
	});

  $('#vid_header').videoBG({
    mp4: 'assets/vid_header.mp4',
    ogv: 'assets/vid_header.ogv',
    webm: 'assets/vid_header.webm',
    poster: 'assets/vid_header.png',
    position: 'relative',
    loop: true,
    scale: false,
    zIndex: -1
  });
});
