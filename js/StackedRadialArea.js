// WIDTH, HEIGHT, STACKED RADIAL FOR CLOCK AND STACKED RADIAL
var width = 960,
    height = 500,
    outerRadius = height / 2 - 10, //Adjust for upper height of stacked graph
    innerRadius = 140; //Adjust for height lower height of stacked graph
/* 
    FROM HERE
    STACKED RADIAL  
*/

var formatDate = d3.time.format("%H"),
    formatDay = function(d) { return formatDate(new Date(2007, 0, 0, d)); };

var angle = d3.time.scale()
    .range([0, 2 * Math.PI]);

var radius = d3.scale.linear()
    .range([innerRadius, outerRadius]);

var colors = ["#FFE303", "#0099CC", "#B22222"];

var stack = d3.layout.stack()
    .offset("zero")
    .values(function(d) { return d.values; })
    .x(function(d) { return d.time; })
    .y(function(d) { return d.value; });

var nest = d3.nest()
    .key(function(d) { return d.key; });

var line = d3.svg.line.radial()
    .interpolate("basis")
    .angle(function(d) { return angle(d.time); })
    .radius(function(d) { return radius(d.y0 + d.y); });

var area = d3.svg.area.radial()
    .interpolate("basis")
    .angle(function(d) { return angle(d.time); })
    .innerRadius(function(d) { return radius(d.y0); })
    .outerRadius(function(d) { return radius(d.y0 + d.y); });

var svg = d3.select("#graph").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var startingData;
var browser = get_browser_info();

var period = 12; //here
var now = new Date();
var day = now.getDay();
var hours = now.getHours(); 

var startOfHalfDay = 0;
if (hours > 11 && period === 12) {
    startOfHalfDay = 12;
} else {
    startOfHalfDay = 0;
}

function updateCurrentTime(nowObject) {
    now = nowObject;

    var newHours = now.getHours(); 
    if (newHours - hours === 1) {
        day = now.getDay(); 
        
        var startOfHalfDay;
        if (hours > 11 && period === 12) {
            startOfHalfDay = 12;
        } else {
            startOfHalfDay = 0;
        }
        plotData();    
    } 
    hours = newHours;
}

//load the data in an array
d3.csv("data/all-costs-one-week.csv",type, function (loadedRows) {  
    timeStringForButton();
    
    startingData = loadedRows;
    plotData();
});

function plotData() {
    loadedRows = startingData.clone();
    
    var correction = 0;
    if (hours > 11 && period === 12) {
        correction = 12;
    } else if (hours >= 0 && day === now.getDay() && period === 48) {
        hours = hours + 24;
    }
    
    var startSlice;
    if (period === 48 && day > 0) { startSlice = (day-1) * 24 + startOfHalfDay}
    else {
        startSlice = day * 24 + startOfHalfDay;
    }
    
    if (browser.name === 'Chrome' || browser.name === 'safari') { 
        loadedRows = loadedRows.slice(startSlice - 1,day * 24 + startOfHalfDay + hours - correction);
    }
    else {
        if (period === 48 && day === 0) {
            var lastDay = loadedRows.slice(loadedRows[loadedRows.length-24],loadedRows[loadedRows.length]);
            loadedRows = loadedRows.slice(startSlice,day * 24 + startOfHalfDay + hours - correction + 1);   
            loadedRows = lastDay.concat(loadedRows);
        } else {
            loadedRows = loadedRows.slice(startSlice,day * 24 + startOfHalfDay + hours - correction + 1); 
            
            for(var i = 0; i < loadedRows.length; i++) { if (i > 23) {loadedRows[i].time += 24;}}  
        }
    }
    
    var data = loadedRows;    
    var tmp = convertData(data);
    loadData(tmp);
}
  
function switchPeriod(hourScale) {
    if(hourScale === 0) {
        period = 12;
        if (hours > 11) {
            startOfHalfDay = 12;
        } else {
            startOfHalfDay = 0;
        }
    } 
    else if (hourScale == 1) {
        period = 24;
        startOfHalfDay = 0;
    }
    else if (hourScale == 2) {
        period = 48;
        startOfHalfDay = 0;  
    }
    d3.selectAll(".layer").remove();
    d3.selectAll(".axis").remove();
    plotData();
}
    
var previousTime = 0; 
function loadData(data) {
  var layers = stack(nest.entries(data));

  // Extend the domain slightly to match the range of [0, 2π].
  //  angle.domain([0, d3.max(data, function(d) { return d.time + 1; })]);
  angle.domain([0, period]);
  radius.domain([0, d3.max(data, function(d) { return d.y0 + d.y; })]);

  svg.selectAll(".layer")
      .data(layers)
    .enter().append("path")
      .attr("class", "layer")
      .attr("d", function(d) { return area(d.values); })
      .style("fill", function(d, i) { return colors[i]; }); 
    
  svg.selectAll(".axis")
      .data(d3.range(angle.domain()[1]))
    .enter().append("g")
      .attr("class", "axis")
      .attr("transform", function(d) { return "rotate(" + angle(d) * 180 / Math.PI + ")"; })
    .call(d3.svg.axis()
      .scale(radius.copy().range([-innerRadius, -outerRadius]))
      .orient("left"))
    .append("text")
      .attr("y", -innerRadius + 9)
      .attr("dy", ".71em")
      .attr("text-anchor", "middle")
      .attr("id", "hour-label")
      .text(function(d) { 
        //if (period !== 48) {
            return formatDay(d); 
        /*} else {
            var hourOnScale = formatDay(d);
            if (previousTime > hourOnScale) {
                previousTime = parseInt(hourOnScale) + 24;  
                return parseInt(hourOnScale) + 24;
            } 
            else {previousTime = hourOnScale; return formatDay(d); }
        }*/
      }); // text label on axis
}

function convertData(rows) {
    var temp = [];

    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      electricityVal = row.electricity;
      coldwaterVal = row.coldwater;
      hotwaterVal = row.hotwater;

      var obj = {};

      obj = {key : "electricity", time: row.time, value: electricityVal, timestamp: row.timestamp};
      temp.push(obj);

      obj = {key : "coldwater", time: row.time, value: coldwaterVal, timestamp: row.timestamp};
      temp.push(obj);

      obj = {key : "hotwater", time: row.time, value: hotwaterVal, timestamp: row.timestamp};
      temp.push(obj);
    };

    return temp;
}

function type(d) {
  d.timestamp = d.time;
  d.day = new Date(d.time).getDay(); 
  d.time = new Date(d.time).getHours();
  d.electricity = +d.electricity;
  d.coldwater = +d.coldwater;
  d.hotwater = +d.hotwater;
  return d;
}

/*
    FROM THE INTERNET 
*/
Object.prototype.clone = function() {
  var newObj = (this instanceof Array) ? [] : {};
  for (i in this) {
    if (i == 'clone') continue;
    if (this[i] && typeof this[i] == "object") {
      newObj[i] = this[i].clone();
    } else newObj[i] = this[i]
  } return newObj;
};

function get_browser_info(){
    var ua=navigator.userAgent,tem,M=ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || []; 
    if(/trident/i.test(M[1])){
        tem=/\brv[ :]+(\d+)/g.exec(ua) || []; 
        return {name:'IE ',version:(tem[1]||'')};
        }   
    if(M[1]==='Chrome'){
        tem=ua.match(/\bOPR\/(\d+)/)
        if(tem!=null)   {return {name:'Opera', version:tem[1]};}
        }   
    M=M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
    if((tem=ua.match(/version\/(\d+)/i))!=null) {M.splice(1,1,tem[1]);}
    return {
      name: M[0],
      version: M[1]
    };
}