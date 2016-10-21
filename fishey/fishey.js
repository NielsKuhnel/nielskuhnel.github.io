"use strict";

function fisheyeElements(elements, nx, maxSize, containerSize, boundX, boundY) {
        
    var ny = elements.length / nx;
    
    var rangeX = boundX[1] - boundX[0];
    var rangeY = boundY[1] - boundY[0];
               
    var fishX = fisheyeScale(1, 0, 0, 1);
    var fishY = fisheyeScale(1, 0, 0, 1);
    
    var scaleX = containerSize[0];
    var scaleY = containerSize[1];
    
    var xs = new Array(nx + 1);
    var ys = new Array(ny + 1);
    
    
    function updateElements(offsetX, offsetY) {
        var stepX = 1/nx;    
        var stepY = 1/ny;                      
        var startX = scaleX * fishX((offsetX) * stepX);                
        for(var x = 0; x <= nx; x++) {            
            var endX = scaleX * fishX((offsetX + x + 1) * stepX);
            endX = x == nx ? Math.ceil(endX) : Math.floor(endX);                                   
            xs[x] = startX;
            startX = endX;
        }        
        
        var startY = scaleY * fishY((offsetY) * stepY);                       
        for(var y = 0; y <= ny; y++) {
            var endY = scaleY * fishY((offsetY + y + 1) * stepY);
            endY = x == nx ? Math.ceil(endY) : Math.floor(endY);
            ys[y] = startY;
            startY = endY;
        }                         
        
        var transform = ["translate(", 0, "px,", 0, "px) translateZ(0)"];        
        var ix = 0;
        for(var x = 0; x < nx; x++) {   
            var posx = xs[x];
            var w = xs[x+1] - posx;        
            for( var y = 0; y < ny; y++) {
                var posy = ys[y];
                var h = ys[y+1] - posy;
                
                var sel = ((x == 0 || w - 1 > (xs[x] - xs[x-1])) && (x == nx - 1 || w - 1 > (xs[x+2] - xs[x + 1])))
                    && ((y == 0 || h - 1 > (ys[y] - ys[y-1])) && (y == ny-1 || h - 1 > (ys[y+2] - ys[y + 1])));
                
                var el = elements[ix++];                
                if( w < 1 && h < 1 ) {                    
                    el.style.display = "none";                    
                } else {
                    el.style.display = "block";  
                    transform[1] = posx;
                    transform[3] = posy;                   
                    el.style.transform = transform.join("");
                    
                    var img = el.childNodes[0];
                    transform[1] = -(1 - (w / maxSize[0]))*maxSize[0]/2;                                        
                    transform[3] = -(1 - (h / maxSize[1]))*maxSize[1]/2;
                    
                    if( sel && x < nx - 1) {
                        el.style.width = w + "px";                        
                    }
                    if( sel && y < ny - 1) {
                        el.style.height = h + "px";                        
                    }
                    
                    if( sel ) {
                        el.style.zIndex = 1;
                        el.style.border = "4px solid #ff0000";
                        el.style.margin = "-2px 0 0 -2px";                        
                    } else {
                        el.style.margin = "0";
                        el.style.border = "";
                        el.style.zIndex = 0;
                        el.style.width = el.style.height = "";                                                
                    }                    
                    img.style.transform = transform.join("");                    
                }                           
            }                            
        }        
    }
        
    var updateFish = function(pos, maxSize, min, max, fish, n, scale, log)  {
        var p = (pos - min)/(max - min);
        fish.focus(Math.max(0, Math.min(1, p)));
                
        var overflow = p < 0 ? -p : p > 1 ? p - 1 : 0;        
        
        //Gets the "d" for the fisheye that gives the desired max width        
        var size = maxSize;// + overflow;
        var d = (n*size - scale) / (scale - size);                            
        fish.setD(d, n, scale);
                        
        return (p < 0 ? 1 : -1) * 4 * overflow;
    }
       
    var updateFunction = function(x, y) {
                
        var overflowX = updateFish(x, maxSize[0], boundX[0], boundX[1], fishX, nx, scaleX, true);
        var overflowY = updateFish(y, maxSize[1], boundY[0], boundY[1], fishY, ny, scaleY);        
        updateElements(overflowX, overflowY);
    };
    
    updateFunction.snapX = rangeX * 1/(nx-1);
    updateFunction.snapY = rangeY * 1/(ny-1);
    
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

    f.setD = function(x) {                        
        d = x;
    };
    
    f.focus = function(x) {                    
        a = x;
    };
    
    return f;
}