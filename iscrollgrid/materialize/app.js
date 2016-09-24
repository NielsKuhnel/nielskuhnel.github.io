$(function() {        
    var fakeSortDesc = false;    

    var cols = 10;
    var maxRows = 8;
    var fixed = 1;
    var sparkIndex = document.location.hash == "#spark" ? 3 : -1;      
    
    var testData = [];
    Math.seedrandom(1337);    
    for( var i = 0; i < 500; i++ ) {
        var row = { id: i, cols: []};
        for( var j = 0; j < cols; j++ ) {            
            row.cols[j] = "Item " + (i+1) + "." + (j + 1);
            if( j == sparkIndex ) {   
                Math.seedrandom(i + 1);
                var ys = [];
                for( var k = 0; k < 6; k++) {
                    ys.push(10*Math.random());                    
                }
                row.cols[j] = ys;                
            } else if( j == 2 ) {
                row.cols[j] = Math.round(100*Math.random());
            }
        }
        row.id = "row-" + i;
        testData.push(row);
    }
    
    
    var nextReq = 0, prevReq = 0, reqs = 0;    
    
    function requestData (start, count, callback) {
        var req = ++nextReq;        
        ++reqs;        
        document.getElementById("loader").style.opacity = 1;                        
        setTimeout(function() {               
            if( --reqs == 0 ) {
                document.getElementById("loader").style.opacity = 0;            
            }            
            if( req <= prevReq ) return;
            prevReq = req;
            var data = [];                
            for( var i = start; i < start + count; i++) {
                var ix = fakeSortDesc ? filtered.length - i - 1 : i;
                if( ix >= 0 && ix < filtered.length ) {
                    data.push(filtered[ix]); 
                } else {                    
                    data.push(null);
                }
            }                   
            setCount(filtered.length);             
            callback(data);     
            if( start > 0 ) skipSome = true;            
        }, Math.random()*750);	        
    }

    function updateContent (el, data, hide) {         
        this.els = this.els || {};
        el.style.display = hide ? "none" : "";        
        if( hide ) return;        

        if( !data ) {            
            $(el).addClass("loading");
            //Data is unavailable. Clear row. (It's probably being loaded.)            
            for(var i = 0, n = el.children.length; i < n; i++ ) {        
                el.children[i].innerHTML = "";
                el.children[i].style.background = "";
            }        
            return;
        }	
        
        //Map data.id to elements
        var dataSource = $(el).data("dataSource");
        if( dataSource ) {
            delete this.els[dataSource.id];
        }        
        this.els[data.id] = el;
        $(el).data("dataSource", data);
        
        $(el).toggleClass("hover", data.id && data.id == hoverId);
        $(el).toggleClass("selected", selectedIds[data.id] == true);
        $(el).removeClass("loading");
        el.setAttribute("data-id", data.id);        
        for(var i = 0, n = el.children.length; i < n; i++ ) {                    
            var ix = i + (this == mScroll ? fixed : 0);
            
            if( ix == 0 ) {                               
                el.children[i].innerHTML = "<input class='filled-in' type='checkbox' id='chk" + data.id + "'" + (selectedIds[data.id] ? " checked" : "") + ">"
                    + "<label class='check-label' for='chk" + data.id + "'>" + data.cols[ix] + "</label>";
            }
            else if( ix == sparkIndex ) {                                
                //$(el.children[i]).sparkline(data.cols[ix], { width: "100px", spotRadius: 0, fillColor: "#b3e5fc", lineColor: "#03a9f4", disableTooltips: true, disableHighlight: true});                
                  var target = $("span.spark", el.children[i]);
                  if( target.length ) {
                      target.text(data.cols[ix]).change();                      
                  } else {                       
                      $("<span></span>").addClass("spark").appendTo(el.children[i]).text(data.cols[ix]).peity("line", {width: 100});
                  }                                   
            } else if( ix == 2 ) {
                var w = 100 * (data.cols[ix] - 0)/100;
                el.children[i].innerHTML = data.cols[ix];
                el.children[i].style.background = "linear-gradient(to right, #03a9f4 0%, #b3e5fc " + w + "%, transparent " + w + "%)";                
                //el.children[i].style.background = "linear-gradient(to right, #03a9f4 0%, #03a9f4 " + w + "%, white " + w + "%)";                
                //el.children[i].innerHTML = "<div class='bar' style='width:" + w + "%'></div><div class='text'>" +  data.cols[ix] + "</div>";
            } else {
                el.children[i].innerHTML = data.cols[ix];
            }
        }	    
    }

    
    var filtered = testData;
    var prevFilter = "";
    function setFilter(filter) {
        if( filter != prevFilter ) {
            filtered = filter ? testData.filter(function(d) {
                for( var i = 0; i < d.cols.length; i++ ) {
                    if( (""+d.cols[i]).indexOf(filter) != -1 ) {
                        return true;
                    }
                }
                return false;
            }) : testData;            
            mScroll.reload(false, true);
            prevFilter = filter;            
        }
    }      

    //When the total count has changed. For example, when filtering.
    var prevCount = -1;
    function setCount(count) {
        if( count == prevCount ) {
            return;
        }        
        prevCount = count;        
        $("#l > .scroller").css("height", (114 + count*51) + "px");
        $("#m > .scroller").css("height", count*51 + "px");        
        mScroll.options.infiniteScroll.totalCount = count;        
        lScroll.options.infiniteScroll.totalCount = count;                
        
        
        $("#l").css("height", (114 + Math.min(count, maxRows) * 51) + "px");
        $("#m").css("height", (Math.min(count, maxRows) * 51) + "px");
        
        mScroll.refresh();
        lScroll.refresh();
    }


    var $tl = document.getElementById("tl-inner");
    var $t = document.getElementById("t-inner");
    var $l = document.getElementById("l-inner");
    var $m = document.getElementById("m");

    function defaultOptions(options) {
        var ops = {
            mouseWheel: true,
            disableMouse: false,
            deceleration: 0.001,
            bounceTime: 400,
            click: true            
        }
        
        for(var k in options) {
            ops[k] = options[k];
        }
        
        return ops;
    }


    var tScroll = new IScroll($t, defaultOptions({
      scrollX: true,
      scrollY: false,
      probeType: 3
    }));    

    var mScroll = new IScroll($m, defaultOptions({
        scrollX: true,
        scrollY: true,
        freeScroll: true,    
        tap: true,
        
        scrollbars: true,
        interactiveScrollbars: true,      
        shrinkScrollbars: 'scale',
        fadeScrollbars: true,
        probeType: 3,

        infiniteScroll: {
            elements: '#m ul.row',
            cacheSize: 50,
            dataSource: requestData,
            updater: updateContent
        }
    }));
    
    var lScroll = new IScroll($l, defaultOptions({
          scrollX: false,
          scrollY: true,      
          probeType: 3,
          tap: true,
        infiniteScroll: { 
            elements: '#l ul.row', 
            linkWith: mScroll,
            updater: updateContent
        },        
        externallyUpdated: true
    }));

    
    
    mScroll.synchronize(tScroll);


    setCount(filtered.length);

    $("#open-search").click(function(e) {
        $("#search-container").addClass("open");
        $("#search").focus();
        e.preventDefault();
    });

    $("#close-search").click(function(e) {
        $("#search-container").removeClass("open");
        $("#search").val("");
        $("#search").blur();
        
        setFilter("");
        e.preventDefault();
    });

    $("#search").on("keydown", function(e) {
        if( e.keyCode == 13) $(this).blur();
    });
    $("#search").on("keydown", $.debounce(250, function() {
        setFilter($(this).val());        
    }));

    var headers = $(".row.head li.sortable");
    headers.on("click", function(e) {
        var i = $("i.sort-icon", this);    
        if( !$(this).is(".sorted") ) {            
            headers.removeClass("sorted");            
            $("i.sort-desc", headers).removeClass("sort-desc");
            $(this).addClass("sorted");            
        } else {
            i.toggleClass("sort-desc");             
        }
                        
        fakeSortDesc = i.is(".sort-desc");        
        
        mScroll.reload(false, true);        
        
        e.preventDefault();
    });   
    
    //Hover      
    var hl = [];
    var hoverId = null;   
    var toggleHl = function(toggle) {
        for( var i = 0; i < hl.length; i++) {            
            $(hl[i]).toggleClass("hover", toggle);
        }   
    }
           
    $("#l ul.row, #m ul.row").on("mouseenter", function() {               
        var data = $(this).data("dataSource");
        hoverId = data && data.id;
        if( hoverId ) {
            hl[0] = lScroll.els[hoverId];
            hl[1] = mScroll.els[hoverId];
            toggleHl(true);
        }
        
    }).on("mouseleave touchstart", function() {        
        toggleHl(false);        
        hoverId = null;
    });
    
    //Select

    var selectedIds = {};    
    $($l).add($m).on("tap", "ul.row", function(e) {           
        var id = $(this).data("dataSource").id;       
        if( id ) {            
            var selected = selectedIds[id];
            if( selected) {
                delete selectedIds[id];
            } else {
                selectedIds[id] = true;
            }
            $(lScroll.els[id]).add(mScroll.els[id]).toggleClass("selected", !selected);
            $("#chk" + id).prop("checked", function(i, v) { return !selected; });
        }
    });
});