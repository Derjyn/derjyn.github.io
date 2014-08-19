$(function(e) {
    e.fn.starscroll = function(r, i, s, o, u, a, f, l, c) {
        var h = e(this),
            p = n.any(),
            d = new t(h, p, r, i, s, o, u, a, f, l);
        window.addEventListener("scroll", function() {
            d.parallax()
        }, false);
        if (l && !p) {
            setInterval(function() {
                d.time += c;
                d.parallax()
            }, 1e3 / 60)
        }
        return this.el
    };
    var t = function(t, n, r, i, s, o, u, a, f, l) {
        this.el = t;
        this.levels = i > 10 ? 10 : i;
        this.layers = [];
        this.dimension = o > 20 ? 20 : o;
        this.density = s;
        this.colour = !a ? [255, 255, 255] : a;
        this.hue = !f ? false : f;
        this.bit = !r ? false : r;
        this.time = 0;
        this.anim = l;
        this.smooth = u > 5 || true ? 5 : u;
        var c, h = e(window).width(),
            p, d = e(window).width();
        c = h > 700 ? 700 : h;
        p = d > 600 ? 650 : d;
        this.w = c;
        this.h = p;
        if (!n) this.init()
    };
    t.prototype.init = function() {
        for (var e = 0; e < this.levels; e++) {
            this.layers[e] = this.buildlayers(e)
        }
        this.images = this.createStars();
        this.applyImages(this.images)
    };
    t.prototype.buildlayers = function(t) {
        var n = {},
            r = document.createElement("canvas"),
            i = r.getContext("2d");
        r.width = this.w;
        r.height = this.h;
        var s = e('<div id="starchild' + t + '"/>');
        this.buildDOMels(s, t);
        n.canvas = r;
        n.context = i;
        n.DOM = s;
        return n
    };
    t.prototype.createStars = function() {
        var e = [];
        for (var t = 0; t < this.levels; t++) {
            var n = this.layers[t].canvas,
                r = this.layers[t].context,
                i = this.hsl(this.colour);
            for (var s = 0; s < this.density; s++) {
                this.drawStar(r, t, i)
            }
            e[t] = this.convertCanvasToImage(n)
        }
        return e
    };
    t.prototype.drawStar = function(e, t, n) {
        var r = this.dimension / (t * .075 + 1),
            i = Math.random() * r,
            s = 0,
            o = 0,
            u = Math.random() * i * .9,
            a = this.hue ? this.colstep(n) : this.colour;
        s = this.boundary("x", i);
        o = this.boundary("y", i);
        var f = e.createRadialGradient(s, o, u, s, o, i),
            l = .7 + Math.random() * .3;
        f.addColorStop(0, "rgba(255,255,255,.9)");
        if (a) f.addColorStop(.5, "rgba(" + a + ",.8)");
        f.addColorStop(1, "rgba(255,255,255,0)");
        e.beginPath();
        if (this.bit == 8 || false) {
            e.fillRect(s, o, i, i);
            e.fillStyle = "rgba(255,255,255," + l + ")"
        } else {
            e.arc(s, o, i, 0, Math.PI * 2, true);
            e.globalAlpha = .7 + Math.random() * .3;
            e.fillStyle = f
        }
        e.fill()
    };
    t.prototype.colstep = function(e) {
        e[0] = e[0] - ~~(Math.random() * 4) + ~~(Math.random() * 8);
        return this.rgb(e)
    };
    t.prototype.boundary = function(e, t) {
        var n = t,
            r = 0;
        if (e == "x") {
            var i = Math.random() * this.w;
            r = i;
            if (i < n) {
                r = i + n + Math.random() * t
            } else if (i > this.w - n) {
                r = i - n - Math.random() * t
            }
            return r
        } else {
            var i = Math.random() * this.h;
            r = i;
            if (i < n) {
                r = i + n + Math.random() * t
            } else if (i > this.h - n) {
                r = i - n - Math.random() * t
            }
            return r
        }
    };
    t.prototype.applyImages = function(e) {
        for (var t = 0; t < this.levels; t++) {
            var n = this.layers[t].DOM,
                r = e[t].src;
            n.css({
                "background-image": "url(" + r + ")"
            })
        }
    };
    t.prototype.parallax = function() {
        var e = window.pageYOffset - this.time;
        for (var t = 0; t < this.levels; t++) {
            var n = this.layers[t].DOM,
                r = -e * ((t + 1) / 2);
            n.css({
                "background-position": "0 " + r + "px"
            })
        }
    };
    t.prototype.buildDOMels = function(e, t) {
        this.el.append(e);
        var n = "5s";
        if (this.anim) {
            n = "0s"
        }
        this.el.css({
            position: "fixed",
            "z-index": -1,
            top: 0,
            width: "100%",
            height: "100%"
        });
        e.css({
            transition: "all " + n + " cubic-bezier(0.230, 1.000, 0.320, 1.000)",
            position: "fixed",
            width: "100%",
            height: "100%",
            "background-repeat": "repeat",
            "background-color": "transparent"
        })
    };
    t.prototype.convertCanvasToImage = function(e) {
        var t = new Image;
        t.src = e.toDataURL("image/png");
        return t
    };
    t.prototype.hsl = function(e) {
        var t = e[0] / 255;
        var n = e[1] / 255;
        var r = e[2] / 255;
        var i = Math.max(t, n, r);
        var s = Math.min(t, n, r);
        var o = (i + s) / 2;
        var u = 0;
        var a = 0;
        if (i != s) {
            if (o < .5) {
                u = (i - s) / (i + s)
            } else {
                u = (i - s) / (2 - i - s)
            } if (t == i) {
                a = (n - r) / (i - s)
            } else if (n == i) {
                a = 2 + (r - t) / (i - s)
            } else {
                a = 4 + (t - n) / (i - s)
            }
        }
        o = o * 100;
        u = u * 100;
        a = a * 60;
        if (a < 0) {
            a += 360
        }
        var f = [a, u, o];
        return f
    };
    t.prototype.rgb = function(e) {
        var t = e[0];
        var n = e[1];
        var r = e[2];
        var i, s, o;
        var u, a, f;
        n /= 100;
        r /= 100;
        if (n == 0) u = a = f = r * 255;
        else {
            if (r <= .5) s = r * (n + 1);
            else s = r + n - r * n;
            i = r * 2 - s;
            o = t / 360;
            u = this.hue2rgb(i, s, o + 1 / 3);
            a = this.hue2rgb(i, s, o);
            f = this.hue2rgb(i, s, o - 1 / 3)
        }
        return [Math.round(u), Math.round(a), Math.round(f)]
    };
    t.prototype.hue2rgb = function(e, t, n) {
        var r;
        if (n < 0) n += 1;
        else if (n > 1) n -= 1;
        if (6 * n < 1) r = e + (t - e) * n * 6;
        else if (2 * n < 1) r = t;
        else if (3 * n < 2) r = e + (t - e) * (2 / 3 - n) * 6;
        else r = e;
        return 255 * r
    };
    var n = {
        Android: function() {
            return navigator.userAgent.match(/Android/i)
        },
        BlackBerry: function() {
            return navigator.userAgent.match(/BlackBerry/i)
        },
        iOS: function() {
            return navigator.userAgent.match(/iPhone|iPod/i)
        },
        Opera: function() {
            return navigator.userAgent.match(/Opera Mini/i)
        },
        Windows: function() {
            return navigator.userAgent.match(/IEMobile/i)
        },
        any: function() {
            return n.Android() || n.BlackBerry() || n.iOS() || n.Opera() || n.Windows()
        }
    }
});

$(document).ready(function() {
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