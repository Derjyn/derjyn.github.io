// FADE FUNCTION FOR idTabs
var fade = function(id,s){
  s.tabs.removeClass(s.selected);
  s.tab(id).addClass(s.selected);
  s.items.hide();
  s.item(id).fadeToggle();
  return false;
};

$.fn.fadeTab = $.idTabs.extend(fade);

// FUNCTION FOR MAKING ELEMENTS "ACTIVE" & "INACTIVE"
var toggleActive = function(id, classOn, classOff) {
    $(id).click(function() {
        $(id).removeClass(classOn).addClass(classOff);
        $(this).removeClass(classOff).addClass(classOn);
    });
};

///////////////////////////////////////////////////////////////////////////////////////////////////

$(document).ready(function () {
    $("#starfield").starscroll(8, 5, 10, 2, 2, [64, 64, 64], false, true);


    toggleActive("nav ul li a", "active", "inactive");
});

// EOF ////////////////////////////////////////////////////////////////////////////////////////////