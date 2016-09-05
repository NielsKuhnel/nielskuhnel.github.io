$(function() {
    
    var fakeSortDesc = false;
    var fakeSearch = "";
    
    var cols = 10;
    var totalCount = 500;

    var nextReq = 0, prevReq = 0, reqs = 0;    

    var prevFilter = null;
    function requestData (start, count, callback) {
        var req = ++nextReq;
    
        if( mScroll ) {
            if( prevFilter === null || prevFilter != fakeSearch) {                 
                prevFilter = fakeSearch;
                totalCount = fakeSearch ? 24 : 500;
                setCount(totalCount);
                mScroll.reload();        
                lScroll.reload();                            
                return;
            }
        }
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
                var x = fakeSortDesc ? totalCount - i : i + 1;
                if( fakeSearch ) x *= 2;
                var row = { id: i, cols: []};
                for( var j = 0; j < cols; j++ ) {
                    row.cols[j] = "Item " + (x) + "." + (j + 1);
                }            
                data.push(row); 
            }       
            callback(data);              
        }, Math.random()*1000);	
    }

    function updateContent (el, data) {        
        if( !data ) {
            //Data is unavailable. Clear row. (It's probably being loaded.)
            for(var i = 0, n = el.children.length; i < n; i++ ) {        
                el.children[i].innerHTML = "";
            }        
            return;
        }	
        
        el.setAttribute("data-id", data.id);
        for(var i = 0, n = el.children.length; i < n; i++ ) {        
            el.children[i].innerHTML = data.cols[i];
        }	    
    }

    //When the total count has changed. For example, when filtering.
    function setCount(count) {
        if( count ) {
            document.querySelector("#m > .scroller").style["height"] = count*50 + "px";
            mScroll.options.infiniteLimit = count;        
            lScroll.options.infiniteLimit = count;        
        } else {
            mScroll.options.infiniteLimit = Number.max;              
            lScroll.options.infiniteLimit = Number.max;   
        }
        
        mScroll.refresh();
        lScroll.refresh();
    }


    var $tl = document.getElementById("tl-inner");
    var $t = document.getElementById("t-inner");
    var $l = document.getElementById("l");
    var $m = document.getElementById("m");

    function defaultOptions(options) {
        var ops = {
            mouseWheel: true,
            disableMouse: false,
            deceleration: 0.001,
            bounceTime: 400,
            click: true,

            cacheSize: 50,
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
    tScroll.on("scroll", function(){
      mScroll.scrollTo(this.x, mScroll.y);  
    });

    var lScroll = new IScroll($l, defaultOptions({
      scrollX: false,
      scrollY: true,
      probeType: 3,
      
        infiniteElements: '#l ul.row',
        infiniteLimit: 50,    
        dataset: function() { /*Do nothing. Middle scroller updates. */},
        dataFiller: updateContent
    }));
    lScroll.on("scroll", function(){
      mScroll.scrollTo(mScroll.x, this.y);
    });

    var mScroll = new IScroll($m, defaultOptions({
        scrollX: true,
        scrollY: true,
        freeScroll: true,    
        
        scrollbars: true,
        interactiveScrollbars: true,      
        shrinkScrollbars: 'scale',
        fadeScrollbars: true,
        probeType: 3,

        infiniteElements: '#m ul.row',
        infiniteLimit: 50,
        deceleration: 0.001,
        dataset: requestData,
        dataFiller: updateContent,    
        infiniteParticipants: [ lScroll]      
    }));
    mScroll.on("scroll", function(){
      tScroll.scrollTo(this.x, 0);  
      lScroll.scrollTo(0, this.y);
    });


    setCount(totalCount);

    $("#open-search").click(function() {
        $("#search-container").addClass("open");
        $("#search").focus();
    });

    $("#close-search").click(function() {
        $("#search-container").removeClass("open");
        $("#search").val("");
        $("#search").blur();
        
        fakeSearch = "";
        
        mScroll.reload();        
        lScroll.reload();   
    });

    $("#search").on("keydown", $.debounce(250, function() {
        fakeSearch = $(this).val();
        
        mScroll.reload();        
        lScroll.reload();   
    }));

    var headers = $(".row.head li");
    headers.on("click", function() {
        var i = $("i.sort", this);    
        if( !$(this).is(".sorted") ) {            
            headers.removeClass("sorted");            
            $("i.sort-desc", headers).removeClass("sort-desc");
            $(this).addClass("sorted");            
        } else {
            i.toggleClass("sort-desc");             
        }
                
        i.text(i.is(".sort-desc") ? "arrow_upward" : "arrow_downward");
        fakeSortDesc = i.is(".sort-desc");        
        
        mScroll.reload();        
        lScroll.reload();        
    });
});