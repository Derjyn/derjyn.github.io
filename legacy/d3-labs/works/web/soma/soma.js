/****************************************************************************
**
** Soma Javascript
**
****************************************************************************/

$(document).ready(function () {
  // ParticleGround stuff
  $('#bg-fx').particleground({
  	minSpeedX: 0.05,
  	maxSpeedX: 0.35,
  	minSpeedY: 0.05,
  	maxSpeedY: 0.6,
  	directionX: 'center',		       // center/up/down. center has the dots bouncing off edge of canvas
  	dirextionY: 'center',              // center/up/down. center has the dots bouncing off edge of canvas
  	density: 5000,					   // particle density, one particle every n pixels (higher = less)
  	dotColor: 'rgba(157, 235, 112, 0.65)',
  	lineColor: 'rgba(172, 214, 130, 0.69)',
  	particleRadius: 2,			       // dot size
  	lineWidth: 0.1,
  	curvedLines: true,
  	proximity: 96,					   // proximity before dots join
  	parallax: false,
  	parallaxMultiplier: 25	           // lower values make the parallax effect more extreme
  });
});
