$(window).load(function() {
    $(function() {
        for (i = 0; i < 4; i++) {
            $(".header .text span").eq(0).clone().prependTo(".header .text");
        }
    });

    $("#tab-links a").on("click", function(e) {
        var t = $(this).attr("href");
        $("#tabs " + t).show().siblings().hide();
        $(this).parent("li").addClass("clicked").siblings().removeClass("clicked");
        $(this).parent("li").addClass("active").siblings().removeClass("active");
        e.preventDefault();
    });        

    $("#starfield").starscroll(8, 5, 10, 2, 1, [64, 64, 64], false, true, .5); 
})