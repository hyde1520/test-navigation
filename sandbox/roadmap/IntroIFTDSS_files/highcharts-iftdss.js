//download.js v4.2, by dandavis; 2008-2017. [MIT] see http://danml.com/download.html for tests/usage
!function(e,t){"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?module.exports=t():e.download=t()}(this,function(){return function e(t,n,o){function a(e){var t=e.split(/[:;,]/),n=t[1],o="base64"==t[2]?atob:decodeURIComponent,a=o(t.pop()),r=a.length,i=0,d=new Uint8Array(r);for(i;r>i;++i)d[i]=a.charCodeAt(i);return new b([d],{type:n})}function r(e,t){if("download"in p)return p.href=e,p.setAttribute("download",w),p.className="download-js-link",p.innerHTML="downloading...",p.style.display="none",document.body.appendChild(p),setTimeout(function(){p.click(),document.body.removeChild(p),t===!0&&setTimeout(function(){c.URL.revokeObjectURL(p.href)},250)},66),!0;if(/(Version)\/(\d+)\.(\d+)(?:\.(\d+))?.*Safari\//.test(navigator.userAgent))return e=e.replace(/^data:([\w\/\-\+]+)/,l),window.open(e)||confirm("Displaying New Document\n\nUse Save As... to download, then click back to return to this page.")&&(location.href=e),!0;var n=document.createElement("iframe");document.body.appendChild(n),t||(e="data:"+e.replace(/^data:([\w\/\-\+]+)/,l)),n.src=e,setTimeout(function(){document.body.removeChild(n)},333)}var i,d,c=window,l="application/octet-stream",s=o||l,u=t,f=!n&&!o&&u,p=document.createElement("a"),m=function(e){return String(e)},b=c.Blob||c.MozBlob||c.WebKitBlob||m,w=n||"download";if(b=b.call?b.bind(c):Blob,"true"===String(this)&&(u=[u,s],s=u[0],u=u[1]),f&&f.length<2048&&(w=f.split("/").pop().split("?")[0],p.href=f,-1!==p.href.indexOf(f))){var h=new XMLHttpRequest;return h.open("GET",f,!0),h.responseType="blob",h.onload=function(t){e(t.target.response,w,l)},setTimeout(function(){h.send()},0),h}if(/^data\:[\w+\-]+\/[\w+\-]+[,;]/.test(u)){if(!(u.length>2096103.424&&b!==m))return navigator.msSaveBlob?navigator.msSaveBlob(a(u),w):r(u);u=a(u),s=u.type||l}if(i=u instanceof b?u:new b([u],{type:s}),navigator.msSaveBlob)return navigator.msSaveBlob(i,w);if(c.URL)r(c.URL.createObjectURL(i),!0);else{if("string"==typeof i||i.constructor===m)try{return r("data:"+s+";base64,"+c.btoa(i))}catch(v){return r("data:"+s+","+encodeURIComponent(i))}d=new FileReader,d.onload=function(e){r(this.result)},d.readAsDataURL(i)}return!0}});


/*   Highcharts.seriesTypes.pie.prototype.connectorPath = function(labelPos) {
    var x = labelPos.x,
      y = labelPos.y,
      M = 'M',
      L = 'L',
      pick = Highcharts.pick;
    return pick(this.options.dataLabels.softConnector, true) ? [
      M,
      x + (labelPos[6] === 'left' ? 5 : -5), y, // end of the string at the label
      'C',
      x, y, // first break, next to the label
      2 * labelPos[2] - labelPos[4], 2 * labelPos[3] - labelPos[5],
      labelPos[2], labelPos[3], // second break
      L,
      labelPos[4], labelPos[5] // base
    ] : [
      M,
      x + (labelPos[6] === 'left' ? 5 : -5), y, // end of the string at the label
      L,
      labelPos[4], y, // second break
      L,
      labelPos[4], labelPos[5] // base
    ];
  };
*/

// Waiting to know what the IFTDSS Team Wants to do about labels
Highcharts.wrap(Highcharts.seriesTypes.pie.prototype, "drawDataLabels", function (p) {
        var x_offset = 5,
            y_offset = 12;
        
        p.call(this);

        Highcharts.each(this.points, function (p) {
            if (p.dataLabel && p.connector) {
                console.log(p.dataLabel._pos);
                p.connector.attr({
                    d: [
                        "M",
                        p.dataLabel._pos.x + (p.labelPos[6] === "left" ? -x_offset : x_offset),
                        p.dataLabel._pos.y + y_offset,
                        "L",
                        p.labelPos[4],
                        p.labelPos[5]
                    ]
                });
            }
        })
    });

// Global settings for highcharts
Highcharts.setOptions({
    chart: {
        events : {
            load: function() {
                this.credits.element.onclick = function() {
                    window.open('/#/home','_blank');
                }
            },
        },
        style: {
            fontFamily: 'Helvetica Neue,Helvetica,Arial,sans-serif'
        }
    },
    credits:{
      //enabled: false
        href: '/#/home',
        text: 'IFTDSS',
    },
    lang: {
        thousandsSep: ',',
    },
    plotOptions: {
        /*series: {
            states: {
                hover: {
                    enabled: false
                }
            }
        },*/
        pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
                enabled: true,
                style: {
                    // color: '#666',
                    fontSize: '14px',
                    fontWeight: 'normal',
                    textShadow: 'none'
                },
                // softConnector: false,
            },
            // showInLegend: false
        }
    },
    exporting: {
        buttons: {
            contextButton: {
                menuItems: [
                    /*{
                        textKey: 'printChart',
                        onclick: function () {
                            this.print();
                        }
                    },
                    {
                        separator: true
                    },*/
                    {
                        textKey: 'downloadPNG',
                        onclick: function () {
                            this.exportChart();
                        }
                    },
                    {
                        textKey: 'downloadJPEG',
                        onclick: function () {
                            this.exportChart({
                                type: 'image/jpeg'
                            });
                        }
                    },
                    {
                        textKey: 'downloadPDF',
                        onclick: function () {
                            this.exportChart({
                                type: 'application/pdf'
                            });
                        }
                    },
                    /*{
                        textKey: 'downloadSVG',
                        onclick: function () {
                            this.exportChart({
                                type: 'image/svg+xml'
                            });
                        }
                    }*/
               ]
           }
       }
   }
});


var ReportHelpers = {

    IFTDSSBase64Logo:'data:image/png;base64,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',
    FTEMBase64Logo: 'data:image/png;base64,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',
    /*
    * Function Takes a String and formated it into an array
    * Adapated from https://stackoverflow.com/a/16246459/5099722
    * @param {string} str
    * @param {number} char - Number of Characters of each line Default 48
    * @return {array}
    */
    strToNewLine: function (str,char) {
        var n = (char == undefined)?48:char;
        var response = [];
        var length = str.length;
        if(length > n){
        var i = 0;
        var j = undefined;
        var c = length;
        while (i < length && c > n) {
            j = str.lastIndexOf(" ", i + n);
            response.push(str.slice(i, j));
            i = j;
            c = length - j;
            // console.log('Place now => '+j);
            // console.log('Char Left => '+c);
        }
            response.push(str.slice(j));
        }else{
            response.push(str);
        }
        return response;
    },
    getTitleDateStr: function(){
        var self = this;
        var d = new Date();
        var curr_day = self._formatZeroBase(d.getDate());
        var curr_month = self._formatZeroBase(d.getMonth()+1); //Months are zero based
        var curr_year = d.getFullYear();
        var curr_hr = self._formatZeroBase(d.getHours());
        var curr_min = self._formatZeroBase(d.getMinutes());
        return curr_year + "" + curr_month + "" + curr_day + "_" + curr_hr + "" + curr_min + 'hrs';
    },
    _formatZeroBase : function(val){
        return (val < 10 ? '0' : '') + val;
    },
    //Formats Date to specified format.
    formatDateStr: function(date){
        var self = this;
        var monthNames = ["Jan", "Feb", "March", "April", "May", "June","July", "Aug", "Sept", "Oct", "Nov", "Dec"];
        var d = new Date(date);
        var curr_day = self._formatZeroBase(d.getDate());
        var curr_month = monthNames[d.getMonth()]; //Months are zero based
        var curr_year = d.getFullYear();
        return  curr_month + ' ' + curr_day + ', ' + curr_year;
    },
    getTimestamp: function(date){
        return new Date(date).getTime();
    },
    //https://gist.github.com/calebgrove/c285a9510948b633aa47#gistcomment-2284139
    convertRegion: function(input, to) {
        var TO_NAME = 1;
        var TO_ABBREVIATED = 2;
        var states = [
            ['Alabama', 'AL'],
            ['Alaska', 'AK'],
            ['American Samoa', 'AS'],
            ['Arizona', 'AZ'],
            ['Arkansas', 'AR'],
            ['Armed Forces Americas', 'AA'],
            ['Armed Forces Europe', 'AE'],
            ['Armed Forces Pacific', 'AP'],
            ['California', 'CA'],
            ['Colorado', 'CO'],
            ['Connecticut', 'CT'],
            ['Delaware', 'DE'],
            ['District Of Columbia', 'DC'],
            ['Florida', 'FL'],
            ['Georgia', 'GA'],
            ['Guam', 'GU'],
            ['Hawaii', 'HI'],
            ['Idaho', 'ID'],
            ['Illinois', 'IL'],
            ['Indiana', 'IN'],
            ['Iowa', 'IA'],
            ['Kansas', 'KS'],
            ['Kentucky', 'KY'],
            ['Louisiana', 'LA'],
            ['Maine', 'ME'],
            ['Marshall Islands', 'MH'],
            ['Maryland', 'MD'],
            ['Massachusetts', 'MA'],
            ['Michigan', 'MI'],
            ['Minnesota', 'MN'],
            ['Mississippi', 'MS'],
            ['Missouri', 'MO'],
            ['Montana', 'MT'],
            ['Nebraska', 'NE'],
            ['Nevada', 'NV'],
            ['New Hampshire', 'NH'],
            ['New Jersey', 'NJ'],
            ['New Mexico', 'NM'],
            ['New York', 'NY'],
            ['North Carolina', 'NC'],
            ['North Dakota', 'ND'],
            ['Northern Mariana Islands', 'NP'],
            ['Ohio', 'OH'],
            ['Oklahoma', 'OK'],
            ['Oregon', 'OR'],
            ['Pennsylvania', 'PA'],
            ['Puerto Rico', 'PR'],
            ['Rhode Island', 'RI'],
            ['South Carolina', 'SC'],
            ['South Dakota', 'SD'],
            ['Tennessee', 'TN'],
            ['Texas', 'TX'],
            ['US Virgin Islands', 'VI'],
            ['Utah', 'UT'],
            ['Vermont', 'VT'],
            ['Virginia', 'VA'],
            ['Washington', 'WA'],
            ['West Virginia', 'WV'],
            ['Wisconsin', 'WI'],
            ['Wyoming', 'WY'],
        ];

        // So happy that Canada and the US have distinct abbreviations
        var provinces = [
            ['Alberta', 'AB'],
            ['British Columbia', 'BC'],
            ['Manitoba', 'MB'],
            ['New Brunswick', 'NB'],
            ['Newfoundland', 'NF'],
            ['Northwest Territory', 'NT'],
            ['Nova Scotia', 'NS'],
            ['Nunavut', 'NU'],
            ['Ontario', 'ON'],
            ['Prince Edward Island', 'PE'],
            ['Quebec', 'QC'],
            ['Saskatchewan', 'SK'],
            ['Yukon', 'YT'],
        ];

        var regions = states.concat(provinces);
        var i; // Reusable loop variable
        if (to == TO_ABBREVIATED) {
            input = input.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
            for (i = 0; i < regions.length; i++) {
                if (regions[i][0] == input) {
                    return (regions[i][1]);
                }
            }
        } else if (to == TO_NAME) {
            input = input.toUpperCase();

            for (i = 0; i < regions.length; i++) {
                if (regions[i][1] == input) {
                    return (regions[i][0]);
                }
            }
        }
    }
}