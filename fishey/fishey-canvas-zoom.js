"use strict";

function fisheyeElementsCanvas(canvas, images, nx, maxSize, containerSize, boundX, boundY, viewFinderZoom) {
        
    //Avoid errors with Math.floor
    var EPS = 1e-6;
    
    //Zoom effect
    viewFinderZoom = viewFinderZoom || 0;

    var globalX = viewFinderZoom/2;
    var globalY = viewFinderZoom/2;    
        
    
    var globalScaleX = (containerSize[0] - viewFinderZoom)/containerSize[0];
    var globalScaleY = (containerSize[1] - viewFinderZoom)/containerSize[1];
    

    var ny = images.length / nx;
    
    var rangeX = boundX[1] - boundX[0];
    var rangeY = boundY[1] - boundY[0];
               
    var fishX = fisheyeScale(1, 0, 0, 1);
    var fishY = fisheyeScale(1, 0, 0, 1);
        
    var scaleX = containerSize[0];
    var scaleY = containerSize[1];
    
    var xs = new Array(nx + 1);
    var ys = new Array(ny + 1);    
        
    var pending = 0;
    var lastCoords = [0,0];

    //Find distinct images
    var imageMap = {};
    for(var i = 0; i  < images.length; i++ ) {
        if( !imageMap[images[i]] ) {
            ++pending;
            imageMap[images[i]] = true;            
        }
    }

    //Load images
    for( var src in imageMap ) {
        var img = new Image();
        img.onload = function() { 
            if( --pending == 0 ) {
                //Update when all images are loaded
                updateElements(lastCoords[0], lastCoords[1]);
            }
        };
        img.src = src;
        imageMap[src] = img;
    }
    
    
    function updateElements(offsetX, offsetY) {
        lastCoords = [offsetX, offsetY];
        if( pending ) {            
            return;
        }

        var ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        var stepX = 1/nx;    
        var stepY = 1/ny;                     
        var startX = scaleX * fishX((offsetX) * stepX);                
        for(var x = 0; x <= nx; x++) {            
            var endX = scaleX * fishX((offsetX + x + 1) * stepX);            
            xs[x] = startX;
            startX = endX;
        }        
        
        var startY = scaleY * fishY((offsetY) * stepY);                       
        for(var y = 0; y <= ny; y++) {
            var endY = scaleY * fishY((offsetY + y + 1) * stepY);            
            ys[y] = startY;
            startY = endY;
        }                         
        
        var cx = fishX.focus();
        var cy = fishY.focus();
        var ix = 0;
        for(var y = 0; y < ny; y++) {   
            var posy = ys[y];
            var h = ys[y+1] - posy;        
            for( var x = 0; x < nx; x++) {
                var posx = xs[x];
                var w = xs[x+1] - posx;
                
                var sel = x*stepX <= cx && (x + 1)*stepX >= cx && y*stepY <= cy && (y + 1)*stepY >= cy;

                var img = imageMap[images[ix++]];                      
                if( w < 1 && h < 1 ) {                    
                    
                } else {                    
                    var maxScale = Math.min(Math.min(1, maxSize[0]/img.width),Math.min(1, maxSize[1]/img.height));
                    
                    var tw = Math.min(w, maxScale*img.width);
                    var th = Math.min(h, maxScale*img.height);
                    
                    var alpha = Math.pow(w/maxSize[0] * h/maxSize[1], 1/10);
                    ctx.globalAlpha = alpha;
                    ctx.drawImage(img,
                        (img.width - tw/maxScale)/2, (img.height - th/maxScale)/2, tw/maxScale, th/maxScale,
                        globalX + globalScaleX*(posx + (w - tw)/2), globalY + globalScaleY*(posy + (h-th)/2),                        
                        globalScaleX * tw, globalScaleY * th
                    );
                    ctx.globalAlpha = 1;         
                }                           
            }                                        
        }        

        //View finder
        ctx.lineWidth = 2;

        var sx0 = scaleX*fishX(cx - (cx - offsetX)*stepX), sx1 = scaleX*fishX(cx - (cx - 1 - offsetX)*stepX);
        var sy0 = scaleY*fishY(cy - (cy - offsetY)*stepY), sy1 = scaleY*fishY(cy - (cy - 1 - offsetY)*stepY);
        
        sx0 += -cx * viewFinderZoom/2;
        sx1 += (1-cx) * viewFinderZoom/2;
        sy0 += -cy * viewFinderZoom/2;
        sy1 += (1-cy) * viewFinderZoom/2;
        /*sx0 *= globalScaleX; sx1 = sx1*globalScaleX + viewFinderZoom;
        sy0 *= globalScaleY; sy1 = sy1*globalScaleY + viewFinderZoom;*/
        
        var tw = (sx1 - sx0);
        var th = (sy1 - sy0);
        
        var ix0 = nx * (cx - cx*stepX), ix1 = nx * (cx - (cx-1)*stepX);
        var iy0 = ny * (cy - cy*stepY), iy1 = ny * (cy - (cy-1)*stepY);
                        
        
        ctx.save();                
        ctx.beginPath();        
        ctx.strokeStyle = "#2196F3";                                                
        //ctx.strokeStyle="#3F51B5";                                
        roundRect(ctx, sx0 + ctx.lineWidth/2, sy0 + ctx.lineWidth/2, (sx1-sx0) - ctx.lineWidth, (sy1-sy0) - ctx.lineWidth, 10);
        ctx.stroke();
        ctx.clip();
        ctx.clearRect(sx0 + ctx.lineWidth/2, sy0 + ctx.lineWidth/2, (sx1-sx0) - ctx.lineWidth, (sy1-sy0) - ctx.lineWidth);                
        
        for(var i = 0; i < 2; i++ ) {                        
            for( var j = 0; j < 2; j++ ) {
                var px = Math.floor(ix1 + EPS) - ix0;
                var py = Math.floor(iy1 + EPS) - iy0;                
                if( (i == 0 ? px : 1 - px) > 0 && (j == 0 ? py : 1 - py) > 0) {
                    var img = imageMap[images[(j + Math.floor(iy0 + EPS))*nx + Math.floor(ix0 + EPS) + i]];
                    
                    var scale = Math.min(Math.min(1, tw/img.width),Math.min(1, th/img.height));
                    var paddingX = Math.max(0, (tw - scale*img.width)/2);
                    var paddingY = Math.max(0, (th - scale*img.height)/2);
                    
                    var displaceX = -(1 - px)*tw + (i == 1 ? tw : 0);
                    var displaceY = -(1 - py)*tw + (j == 1 ? th : 0);
                    ctx.drawImage(img,                        
                        0, 0, img.width, img.height,
                        sx0 + displaceX + paddingX, sy0 + displaceY + paddingY,
                        scale*img.width, scale*img.height
                    );
                }
            }
        }
        ctx.restore();

        ctx.beginPath();        
        //ctx.strokeStyle = "#2196F3";                                                
        ctx.strokeStyle="#3F51B5";                                
        roundRect(ctx, sx0 + ctx.lineWidth/2, sy0 + ctx.lineWidth/2, (sx1-sx0) - ctx.lineWidth, (sy1-sy0) - ctx.lineWidth, 10);
        ctx.stroke();
    }
//{ Canvas support

var roundRect = function (canvas, x, y, w, h, r) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  canvas.beginPath();
  canvas.moveTo(x+r, y);
  canvas.arcTo(x+w, y,   x+w, y+h, r);
  canvas.arcTo(x+w, y+h, x,   y+h, r);
  canvas.arcTo(x,   y+h, x,   y,   r);
  canvas.arcTo(x,   y,   x+w, y,   r);
  canvas.closePath();
  return this;
}

//}
        
    var updateFish = function(pos, maxSize, min, max, fish, n, scale)  {
        var p = (pos - min)/(max - min);
        var pbound = Math.max(0, Math.min(1, p));
        fish.focus(pbound);
                
        var overflow = p < 0 ? -p : p > 1 ? p - 1 : 0;        
        
        //Gets the "d" for the fisheye that gives the desired max width        
        var size = maxSize;// + overflow;
        var d = (n*size - scale) / (scale - size);                            
        var dEnd = d;//(n*size*2 - scale) / (scale - size*1.5);
        
        fish.setD((1-pbound)*d + pbound*dEnd, n, scale);
                        
        return (p < 0 ? 1 : -1) * 4 * overflow;
    }
       
    var updateFunction = function(x, y) {
                
        var overflowX = updateFish(x, maxSize[0], boundX[0], boundX[1], fishX, nx, scaleX);
        var overflowY = updateFish(y, maxSize[1], boundY[0], boundY[1], fishY, ny, scaleY);        
        updateElements(overflowX, overflowY);
    };
    
    updateFunction.snapX = rangeX * 1/(nx-1);
    updateFunction.snapY = rangeY * 1/(ny-1);

    updateFunction.inverse = function(x,y, snap) {          
        var pos = {x: fishX.inverse(x), y: fishY.inverse(y)};
        if( snap ) {            
            var snapX = 1/(nx);
            var snapY = 1/(ny);
            pos.x = Math.floor(pos.x/snapX + EPS)*snapX + snapX/2;
            pos.y = Math.floor(pos.y/snapY + EPS)*snapY + snapY/2;            
        }
        return pos;
    };
    
    return updateFunction;
}

function fisheyeScale(d, a, min, max) {                
    var f = (function (x) {
      x = Math.min(max, Math.max(min, x));     
      var left = x < a,                      
          m = left ? a - min : max - a;
      if (m == 0) m = max - min;                  
      return (left ? -1 : 1) * m * (d + 1) / (d + (m / Math.abs(x - a))) + a;
    });     

    f.inverse = function(y) {
        return KineticHelpers.uniroot(function(x) { return f(x) - y; }, 0, 1, 0.00001, 100);
    };

    f.setD = function(x) {                        
        d = x;
    };
    
    f.focus = function(x) {                    
        if( typeof(x) != "number" ) return a;
        a = x;
    };
    
    return f;
}