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
    
    function updateElements() {
        var stepX = 1/nx;    
        var stepY = 1/ny;                
        
        
        var startX = 0;
        for(var x = 0; x <= nx; x++) {
            var endX = scaleX * fishX((x+1) * stepX);
            endX = x == nx ? Math.ceil(endX) : Math.round(endX);
            xs[x] = startX;
            startX = endX;
        }
        
        var startY = 0;        
        for(var y = 0; y <= ny; y++) {
            var endY = scaleY * fishY((y+1) * stepY);
            endY = x == nx ? Math.ceil(endY) : Math.round(endY);
            ys[y] = startY;
            startY = endY;
        }                         
        
        var transform = ["translate3d(", 0, "px,", 0, "px,0)"]
        var ix = 0;
        for(var x = 0; x < nx; x++) {   
            var posx = xs[x];
            var w = xs[x+1] - pos;        
            for( var y = 0; y < ny; y++) {
                var posy = ys[y];
                var h = ys[y+1] - posy;
                
                var el = elements[ix++];                
                if( w < 1 && h < 1 ) {                    
                    el.style.display = "none";                    
                } else {
                    el.style.display = "block";  
                    transform[1] = posx;
                    transform[3] = posy;                   
                    el.style.transform = transform.join("");                                        
                }                           
            }                            
        }        
    }
        
    var updateFish = function(pos, maxSize, min, max, fish, n, scale)  {
        var p = (pos - min)/(max - min);
        fish.focus(Math.max(0, Math.min(1, p)));
        
        var overflow = p < 0 ? -p : p > 1 ? p - 1 : 0;
        
        //Gets the "d" for the fisheye that gives the desired max width        
        var size = maxSize + .25*overflow*(max - min);        
        var d = (n*size - scale) / (scale - size);                            
        fish.setD(d, n, scale);
    }
       
    var updateFunction = function(x, y) {
                
        updateFish(x, maxSize[0], boundX[0], boundX[1], fishX, nx, scaleX);
        updateFish(y, maxSize[1], boundY[0], boundY[1], fishY, ny, scaleY);
        
        updateElements();
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