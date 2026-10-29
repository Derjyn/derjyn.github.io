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

    toggleActive("nav ul li a", "active c-8", "inactive c-1");
    $("main section h2").addClass("c-8");
    $("main section h3").addClass("c-7");

    $("nav").idTabs();
});

// EOF ////////////////////////////////////////////////////////////////////////////////////////////
