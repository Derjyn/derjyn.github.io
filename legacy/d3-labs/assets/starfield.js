/*==============================*/
/* CANVAS SETUP
/*==============================*/
var canvas = document.createElement("canvas"), ctx = canvas.getContext("2d"), container = document.getElementById("starfield");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
container.appendChild(canvas);

/*==============================*/
/* STARFIELD SETUP
/*==============================*/
/* numLayers, numStars, radius, speedX, speedY, starColor, bgColor */
/* from d3.css palette, c-1 and c-4 seem to be good for star/bg colors */
var starfield = new Starfield(3, 24, 2, 0, 100, "#434E28", "#727B59");

/*==============================*/
/* UTILITY
/*==============================*/
var getRandomInt = function( min, max ) {
    return Math.floor( Math.random( ) * ( max - min + 1 )) + min;
}

/*==============================*/
/* MAIN LOOP
/*==============================*/
var animationFrame =
    window.requestAnimationFrame       ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame    ||
    window.oRequestAnimationFrame      ||
    window.msRequestAnimationFrame     || null;

var main = function( ) {
    var now = Date.now( ),
        delta = now - then;

    if( starfield ) {
        starfield.update( delta / 1000 );
        starfield.render( );
    }

    then = now;
};

var then = Date.now( );

if( animationFrame !== null ) {
    var mainLoop = function( ) {
        main( );
        animationFrame( mainLoop, canvas );
    }

    animationFrame( mainLoop, canvas );
} else {
    setInterval( main, 1000 / starfield.FPS );
}

/*================================================*/
/* MAIN CLASS
/*================================================*/

function Starfield(numLayers, numStars, radius, speedX, speedY, starColor, bgColor) {
    this.FPS = 60; // for setInterval fallback only
    this.started = false;
    this.bgLayers = [];
    this.baseBgColor = bgColor;
    this.numBgLayers = numLayers;
    this.baseStarNum = numStars;
    this.baseStarRadius = radius;
    this.baseStarSpeed = { x: speedX, y: speedY };
    this.baseStarColor = starColor;
}

Starfield.prototype.initBackground = function( ) {
    this.bgLayers = [];

    for( var i = this.numBgLayers; i > 0; i-- ) {
        var stars = [];

        for( var j = 0; j < this.baseStarNum * i; j++ ) {
            var star = {
                x: getRandomInt( 0, canvas.width ),
                y: getRandomInt( 0, canvas.height ),
                radius: Math.round( this.baseStarRadius / i * 100 ) / 100,
                speed: {
                    x: Math.round( this.baseStarSpeed.x / i * 100 ) / 100,
                    y: Math.round( this.baseStarSpeed.y / i * 100 ) / 100
                }
            };
            stars.push( star );
        }
        this.bgLayers.push( stars );
    }
};

Starfield.prototype.update = function(delta) {
    if ( ! this.started ) {
        this.started = true;
        this.initBackground( );
    } else {
        for( var i = 0; i < this.bgLayers.length; i++ ) {
            for( var j = 0; j < this.bgLayers[ i ].length; j++ ) {
                var star = this.bgLayers[ i ][ j ];

                if( this.inBounds( star.x, star.y )) {
                    // move star
                    star.x += star.speed.x * delta;
                    star.y += star.speed.y * delta;
                } else {
                    // reset star
                    star.x = getRandomInt( 0, canvas.width );
                    star.y = 1;
                }
            }
        }
    }
};

Starfield.prototype.render = function( ) {
    ctx.fillStyle = this.baseBgColor;
    ctx.fillRect( 0, 0, canvas.width, canvas.height );
    ctx.fillStyle = this.baseStarColor;

    for ( var i = 0; i < this.bgLayers.length; i++) {
        for( var j = 0; j < this.bgLayers[ i ].length; j++ ) {
            var star = this.bgLayers[ i ][ j ];

            if( star.radius >= 1.12 ) {
                ctx.beginPath( );
                ctx.arc( star.x, star.y, star.radius, 0, 2 * Math.PI, false );
                ctx.fill( );
            } else {
                var pixelSize = star.radius * 3;
                ctx.fillRect( star.x, star.y, pixelSize, pixelSize );
            }
        }
    }
};

Starfield.prototype.inBounds = function( x, y ) {
    return (( x > 0 && x < canvas.width ) && ( y > 0 && y < canvas.height ));
};
