//*****************************************************************************
// FUNCTIONS

function fadeObjectIn(object, timeLength, timeDelay, easing) {
  TweenMax.to(object, timeLength, {
    autoAlpha: 1, delay: timeDelay, ease: easing
  });
}
function fadeObjectOut(object, timeLength, timeDelay, easing) {
  TweenMax.to(object, timeLength, {
    autoAlpha: 0, delay: timeDelay, ease: easing
  });
}

function moveObjectX(object, distance, timeLength, timeDelay, easing) {
  TweenMax.to(object, timeLength, {
    x: distance,
    delay: timeDelay,
    ease: easing
  });
}
function moveObjectXPercent(object, distance, timeLength, timeDelay, easing) {
  TweenMax.to(object, timeLength, {
    xPercent: distance,
    delay: timeDelay,
    ease: easing
  });
}

function moveObjectY(object, distance, timeLength, timeDelay, easing) {
  TweenMax.to(object, timeLength, {
    y: distance,
    delay: timeDelay,
    ease: easing
  });
}
function moveObjectYPercent(object, distance, timeLength, timeDelay, easing) {
  TweenMax.to(object, timeLength, {
    yPercent: distance,
    delay: timeDelay,
    ease: easing
  });
}

function setObjectHeight(obect, objHeight, timeLength, timeDelay, easing) {
  TweenMax.to(obect, timeLength, {
    css: { height: objHeight, top: "0" },
    delay: timeDelay,
    ease: easing
  });
}

//*****************************************************************************
// GIDDEM'!

$(document).ready(function() {
  // HANDLE FOCUS FOR ANIMATION ACTIVITY
  window.onblur = function() { window.blurred = true; };
  window.onfocus = function() { window.blurred = false; };

  // CUSTOM SCROLLBARS
  $(".content").mCustomScrollbar({
    axis:"y",
    scrollbarPosition:"outside",
    scrollInertia:950,
    autoDraggerLength:true,
    autoHideScrollbar:true,
    mouseWheel:{
      enable:true,
      scrollAmount:"auto",
      axis:"y",
      preventDefault:false,
      deltaFactor:"auto",
      normalizeDelta:false,
      invert:false
    },
    keyboard:{
      enable:true,
      scrollType:"stepless",
      scrollAmount:"auto"
    },
    contentTouchScroll:25,
    advanced:{
      autoExpandHorizontalScroll:false,
      autoScrollOnFocus:"input,textarea,select,button,datalist,keygen,a[tabindex],area,object,[contenteditable='true']",
      updateOnContentResize:true,
      updateOnImageLoad:true,
      updateOnSelectorChange:false,
      releaseDraggableSelectors:false
    },
    theme:"dark-2",
    live:false,
    liveSelector:null
  });

  // INTRO ANIMATION
  moveObjectX("#panelLeft .logo-left-inner", -32, 0.5, 1.5, Expo.easeIn);
  moveObjectX("#panelRight .logo-right-inner", 32, 0.5, 1.5, Expo.easeIn);

  moveObjectX("#panelLeft .logo-left-outer", -32, 1.5, 2.0, Elastic.easeOut);
  moveObjectX("#panelRight .logo-right-outer", 32, 1.5, 2.0, Elastic.easeOut);

  setObjectHeight("#seal-left", "100%", 0.35, 5.0, Sine.easeIn);
  setObjectHeight("#seal-right", "100%", 0.35, 5.0, Sine.easeIn);

  moveObjectXPercent("#panelLeft", -100, 2, 5.5, Power2.easeInOut);
  moveObjectXPercent("#panelRight", 100,  2, 5.5, Power2.easeInOut);

  fadeObjectIn("nav", 1, 6.5, RoughEase.ease);
  fadeObjectIn("main", 1, 7.5, RoughEase.ease);

  // DETACH THE INTRO WRAPPER ONCE IT'S DONE WITH IT'S THANG...
  (function() {
    var time = 7500;
    var delta = 100;
    var tid;

    tid = setInterval(function() {
      if(window.blurred) {
        return;
      }

      time -= delta;

      if(time <= 0) {
        clearInterval(tid);
        $("#wrapperIntro").remove();
      }
    }, delta);
  })();

  // ANIMATE BASE LOGO ON LINK HOVER
  $("#link-main").click(function() {
    moveObjectX("#baseLeft .logo-left-inner", 0, 0.25, 0, Expo.easeIn);
    moveObjectX("#baseLeft .logo-left-outer", 0, 0.25, 0, Expo.easeIn);
    moveObjectX("#baseRight .logo-right-inner", 0, 0.25, 0, Expo.easeIn);
    moveObjectX("#baseRight .logo-right-outer", 0, 0.25, 0, Expo.easeIn);
  });
  $("#link-services").click(function() {
    moveObjectX("#baseLeft .logo-left-inner", 0, 0.25, 0, Expo.easeIn);
    moveObjectX("#baseLeft .logo-left-outer", 0, 0.25, 0, Expo.easeIn);
    moveObjectX("#baseRight .logo-right-inner", 0, 0.25, 0, Expo.easeIn);
    moveObjectX("#baseRight .logo-right-outer", 0, 0.25, 0, Expo.easeIn);
    moveObjectX("#baseLeft .logo-left-outer", 32, 0.25, 0, Expo.easeIn);
    moveObjectX("#baseRight .logo-right-outer", -32, 0.25, 0, Expo.easeIn);
  });
  $("#link-portfolio").click(function() {
    moveObjectX("#baseLeft .logo-left-inner", 0, 0.25, 0, Expo.easeIn);
    moveObjectX("#baseLeft .logo-left-outer", 0, 0.25, 0, Expo.easeIn);
    moveObjectX("#baseRight .logo-right-inner", 0, 0.25, 0, Expo.easeIn);
    moveObjectX("#baseRight .logo-right-outer", 0, 0.25, 0, Expo.easeIn);
    moveObjectX("#baseLeft .logo-left-inner", 32, 0.25, 0, Expo.easeIn);
    moveObjectX("#baseRight .logo-right-inner", -32, 0.25, 0, Expo.easeIn);
  });
  $("#link-team").click(function() {
    moveObjectX("#baseLeft .logo-left-inner", 0, 0.25, 0, Expo.easeIn);
    moveObjectX("#baseLeft .logo-left-outer", 0, 0.25, 0, Expo.easeIn);
    moveObjectX("#baseRight .logo-right-inner", 0, 0.25, 0, Expo.easeIn);
    moveObjectX("#baseRight .logo-right-outer", 0, 0.25, 0, Expo.easeIn);
    moveObjectX("#baseLeft .logo-left-inner", 32, 0.25, 0, Expo.easeIn);
    moveObjectX("#baseLeft .logo-left-outer", 32, 0.25, 0, Expo.easeIn);
    moveObjectX("#baseRight .logo-right-inner", -32, 0.25, 0, Expo.easeIn);
    moveObjectX("#baseRight .logo-right-outer", -32, 0.25, 0, Expo.easeIn);
  });

  // CONTENT SWITCHING
  $("#content-main").show();
  $("#content-services").hide();
  $("#content-portfolio").hide();
  $("#content-team").hide();

  $("#link-main").click(function() {
    $("#content-main").show();
    $("#content-services").hide();
    $("#content-portfolio").hide();
    $("#content-team").hide();
  });
  $("#link-portfolio").click(function() {
    $("#content-main").hide();
    $("#content-services").hide();
    $("#content-portfolio").show();
    $("#content-team").hide();
  });
  $("#link-services").click(function() {
    $("#content-main").hide();
    $("#content-services").show();
    $("#content-portfolio").hide();
    $("#content-team").hide();
  });
  $("#link-team").click(function() {
    $("#content-main").hide();
    $("#content-services").hide();
    $("#content-portfolio").hide();
    $("#content-team").show();
  });
});

//*** EOF *********************************************************************
