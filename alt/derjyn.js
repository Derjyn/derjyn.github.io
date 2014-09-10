// FUNCTION FOR MAKING ELEMENTS "ACTIVE" & "INACTIVE"
var toggleActive = function(id, classOn, classOff) {
    $(id).click(function() {
        $(id).removeClass(classOn).addClass(classOff);
        $(this).removeClass(classOff).addClass(classOn);
    });
};

$(function(){
    for(i=0;i<4;i++){
        $('.buzz_wrapper .text h1').eq(0).clone().prependTo('.buzz_wrapper .text');
    }
});

///////////////////////////////////////////////////////////////////////////////////////////////////

$(document).ready(function () {
<<<<<<< HEAD
    $("#starfield").starscroll(8, 5, 10, 2, 2, [64, 64, 64], false, true);
=======
    $("#starfield").starscroll(16, 5, 10, 3, 0.4, 2, [196,27,27], true, true);
>>>>>>> origin/master

    toggleActive("nav ul li a", "active", "inactive");
});

// EOF ////////////////////////////////////////////////////////////////////////////////////////////