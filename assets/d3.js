// FUNCTION FOR MAKING ELEMENTS "ACTIVE" & "INACTIVE" /////////////////////////////////////////////
var toggleActive = function(id, classOn, classOff) {
    $(id).click(function() {
        $(id).removeClass(classOn).addClass(classOff);
        $(this).removeClass(classOff).addClass(classOn);
    });
};

// HEADER ABERRATION EFFECT ///////////////////////////////////////////////////////////////////////

$(function() {
    for(i=0;i<1;i++) {
        $('.buzz_wrapper .text h1').eq(0).clone().prependTo('.buzz_wrapper .text');
    }
});

///////////////////////////////////////////////////////////////////////////////////////////////////

$(document).ready(function () {
    "use strict";

    toggleActive("nav ul li a", "active c-4", "inactive c-3");

    $(".buzz_wrapper h1:nth-child(1)").addClass("c-1");

    $("nav").idTabs("#home");

    $("#starfield").starscroll(16, 5, 10, 3, 0.4, 2, [192, 196, 157], true, true);
});

// EOF ////////////////////////////////////////////////////////////////////////////////////////////
