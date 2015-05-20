$(function() {
    // see also: http://p5js.org/learn/examples/Instance_Mode_Instantiation.php
    var canvasGraphics, svgGraphics;
    var sync = true;
    var p5canvas = new p5(function(p) {
        p.setup = function() {
            canvasGraphics = p.createCanvas(100, 100);
            p.noLoop();
        };
    }, sync);
    var p5svg = new p5(function(p) {
        p.setup = function() {
            svgGraphics = p.createSVG(100, 100);
            p.noLoop();
        };
    }, sync);

    window.testRender = function(draw, callback) {
        var fnbody = draw.toString();
        fnbody = fnbody.substring(fnbody.indexOf('{') + 1, fnbody.lastIndexOf('}'));
        [p5svg, p5canvas].forEach(function(p) {
            p.clear();
            p.strokeWeight(1);
            p.fill(200);
            p.stroke(0);
            with (p) {
                eval(fnbody);
            }
        });

        var img, svgpng, canvaspng, match, svgimg, canvasimg;

        var $container = $('#test-graph');

        img = new Image();
        img.src = svgGraphics.toDataURL();
        img.className = 'svg';
        $container.append(img);

        svgimg = new Image();
        svgpng = svgGraphics.toDataURL('image/png');
        svgimg.src = svgpng;

        canvasimg = new Image();
        canvaspng = canvasGraphics.elt.toDataURL('image/png');
        canvasimg.src = canvaspng;
        canvasimg.className = 'canvasimg';
        $container.append(canvasimg);

        var canvas = document.createElement('canvas');
        canvas.width = canvasGraphics.width;
        canvas.height = canvasGraphics.height;
        $container.append(canvas);
        var ctx = canvas.getContext('2d');

        var $match = $('<div class="match"></div>');
        $container.append($match);
        $container.append('<div class="function">' + fnbody.replace(/;/g, ';<br>') + '</div>');
        $container.append('<br><br>');

        $(svgimg).load(function() {
            $(canvasimg).load(function() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(svgimg, 0, 0);
                var svgpngData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(canvasimg, 0, 0);
                var canvaspngData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                var count = 0;
                var mismatch = 0;
                for (var i = 0; i < svgpngData.data.length; i += 4) {
                    var r1 = svgpngData.data[i];
                    var g1 = svgpngData.data[i + 1];
                    var b1 = svgpngData.data[i + 2];
                    var a1 = svgpngData.data[i + 3];

                    var r2 = canvaspngData.data[i];
                    var g2 = canvaspngData.data[i + 1];
                    var b2 = canvaspngData.data[i + 2];
                    var a2 = canvaspngData.data[i + 3];

                    if (canvaspngData.data[i + 3] > 0 || svgpngData.data[i + 3] > 0) {
                        count++;
                    }
                    if ((r1 === r2) && (g1 === g2) && (b1 === b2) && (a1 === a2)) {
                        canvaspngData.data[i] = 0;
                        canvaspngData.data[i + 1] = 0;
                        canvaspngData.data[i + 2] = 0;
                        canvaspngData.data[i + 3] = 255;
                    } else {
                        mismatch++;
                        canvaspngData.data[i] = 255;
                        canvaspngData.data[i + 1] = 255;
                        canvaspngData.data[i + 2] = 255;
                        canvaspngData.data[i + 3] = 255;
                    }

                }

                ctx.putImageData(canvaspngData, 0, 0);

                var matchp = mismatch === 0;
                var icon = matchp ? 'fa-check': 'fa-times';
                $match.html('<i class="fa ' + icon + '"></i>');

                if (matchp) {
                    callback();
                } else {
                    var err = JSON.stringify({
                        count: count,
                        mismatch: mismatch,
                        rate: mismatch / count
                    });
                    callback(new Error(err));
                }

            });
        });

        return match;
    };

    mocha.run();
});
