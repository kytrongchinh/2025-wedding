!function(t, e){
    "object" == typeof exports && "undefined" != typeof module ? module.exports = e() : "function" == typeof define && define.amd ? define(e) : t.timer = e()
}(this, function() {
    "use strict";

    var o = {
        //init function
        i(){
            return this;
        },
        timeBegan : new Date(),
        stopWatch(id,stop = 10){
            var parts = {hh:'00',mm:'00',ss:'00',ms:'000'};
            var remaining = '00:00:00.000';
            var ms = 10;
            var currentTime = new Date();
            var endTime = new Date(this.timeBegan.getTime()+stop*1000);
            if(currentTime >= endTime){
                var endElapsed = new Date(currentTime - this.timeBegan);
                parts = {
                    hh : endElapsed.getUTCHours().toString().padStart(2,'0'),
                    mm : endElapsed.getUTCMinutes().toString().padStart(2,'0'),
                    ss : endElapsed.getUTCSeconds().toString().padStart(2,'0'),
                    ms : endElapsed.getUTCMilliseconds().toString().padStart(3,'0')
                };
                remaining = parts['hh']+':'+parts['mm']+':'+parts['ss']+'.000';
                document.getElementById(id).innerHTML = remaining;
                return;
            }

            var timeElapsed = new Date(currentTime - this.timeBegan);
            if(timeElapsed > 0){
                parts = {
                    hh : timeElapsed.getUTCHours().toString().padStart(2,'0'),
                    mm : timeElapsed.getUTCMinutes().toString().padStart(2,'0'),
                    ss : timeElapsed.getUTCSeconds().toString().padStart(2,'0'),
                    ms : timeElapsed.getUTCMilliseconds().toString().padStart(3,'0')
                };
                remaining = parts['hh']+':'+parts['mm']+':'+parts['ss']+'.'+parts['ms'];
            }
            if(!id) return parts;
            document.getElementById(id).innerHTML = remaining;
            setTimeout(function(){timer.stopWatch(id,stop);}, ms);
        },
        countDown(dd,id,ms=1000){
            var timeElapsed = +new Date(dd) - +new Date();
            var remaining = '0 day 00:00:00';
            var parts = {dd:'0 day',hh:'00',mm:'00',ss:'00'};
            if (timeElapsed > 0) {
                parts = {
                    dd: Math.floor(timeElapsed / (1000 * 60 * 60 * 24)),
                    hh: Math.floor((timeElapsed / (1000 * 60 * 60)) % 24).toString().padStart(2,'0'),
                    mm: Math.floor((timeElapsed / 1000 / 60) % 60).toString().padStart(2,'0'),
                    ss: Math.floor((timeElapsed / 1000) % 60).toString().padStart(2,'0')
                };
                remaining = parts['dd']+' day '+parts['hh']+':'+parts['mm']+':'+parts['ss'];
            }
            if(!id) return parts;
            document.getElementById(id).innerHTML = remaining;
            setInterval(function(){timer.countDown(dd,id,ms);}, ms);
        },
        clockTimer(id){
            var currentTime = new Date();
            var parts = {
                yy : currentTime.getFullYear().toString().padStart(2,'0'),
                mm : (currentTime.getMonth() + 1).toString().padStart(2,'0'),
                dd : currentTime.getDate().toString().padStart(2,'0'),
                hh : currentTime.getHours().toString().padStart(2,'0'),
                ii : currentTime.getMinutes().toString().padStart(2,'0'),
                ss : currentTime.getSeconds().toString().padStart(2,'0')
            };
            if(!id) return parts;
            document.getElementById(id).innerHTML = parts['yy']+'-'+parts['mm']+'-'+parts['dd']+' '+parts['hh']+':'+parts['mm']+':'+parts['ss'];
            setInterval(function(){timer.clockTimer(id);}, 1000);
        }
    };

    return o.i();
});
