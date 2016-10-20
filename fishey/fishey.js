

function fisheyeElements(elements, nx, maxSize, containerSize, boundX, boundY) {
        
    var ny = elements.length / nx;
    
    var rangeX = boundX[1] - boundX[0];
    var rangeY = boundY[1] - boundY[0];
               
    var fishX = fisheyeScale(1, 0, 0, 1);
    var fishY = fisheyeScale(1, 0, 0, 1);
    
    var scaleX = containerSize[0];
    var scaleY = containerSize[1];
    
    function updateElements() {
        var stepX = 1/nx;    
        var stepY = 1/ny;                
        var ix = 0;
        var startX = 0;
        for(var x = 0; x < nx; x++) {                                  
            var endX = Math.round(scaleX * fishX((x+1) * stepX));            
            var startY = 0;
            for( var y = 0; y < ny; y++) {
                var el = elements[ix++];                
                var endY = Math.round(scaleY * fishY((y+1) * stepY));                
                if( (endX - startX) < 0 && (endY - startY) < 0 ) {                    
                    el.style.display = "none";
                    
                } else {
                    var widthX = endX - startX;
                    var widthY = endY - startY;
                                        
                    /*var scaleX = widthX/maxSize[0];
                    var scaleY = widthY/maxSize[1];*/
                    el.style.transform = "translate3d(" + startX + "px," + startY + "px,0)"
                    + " scaleX(" + widthX/maxSize[0] + ")"
                    + " scaleY(" + widthY/maxSize[1] + ")";
                    
                    el.style.display = "block";                                
                    // el.style.left = startX + "px";
                    // el.style.width = widthX + "px";                                        
                    // el.style.top = startY + "px";
                    // el.style.height = widthY + "px";                                     
                    
                    var opacityX = widthX > 0.25*maxSize[0] ? 1 : 0.2 + 0.8*widthX/(0.25*maxSize[0]);                    
                    var opacityY = widthY > 0.25*maxSize[1] ? 1 : 0.2 + 0.8*widthY/(0.25*maxSize[1]);                    
                    el.style.opacity = opacityX * opacityY;
                }                
                startY = endY;
            }            
            startX = endX;            
        }        
    }
        
    var updateFish = function(pos, maxSize, min, max, fish, n, scale)  {
        var p = (pos - min)/(max - min);
        fish.focus(Math.max(0, Math.min(1, p)));
        
        var overflow = p < 0 ? -p : p > 1 ? p - 1 : 0;
        
        //Gets the "d" for the fisheye that gives the desired max width        
        var size = maxSize + overflow*(max - min);
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