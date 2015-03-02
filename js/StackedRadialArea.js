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
    .interpolate("basis-open")
    .angle(function(d) { return angle(d.time); })
    .radius(function(d) { return radius(d.y0 + d.y); });

var area = d3.svg.area.radial()
    .interpolate("basis-open")
    .angle(function(d) { return angle(d.time); })
    .innerRadius(function(d) { return radius(d.y0); })
    .outerRadius(function(d) { return radius(d.y0 + d.y); });

var svg = d3.select("#graph").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

// VIC FROM HERE ON
var allData; 
var period = 12; 
var now = new Date();
var day = now.getDay(); // 1
var hours = now.getHours(); // 20
var startOfHalfDay;
if (hours > 11) {
    startOfHalfDay = 12;
} else {
    startOfHalfDay = 0;
}

//load the data in an array
d3.csv("data/all-costs-one-week.csv",type, function(loadedRows) {
    //allData = loadedRows;
    
    // i = startofhalfday on the day of days[day]
    var i = day * 24 + startOfHalfDay;
    loadedRows = loadedRows.slice(i-1,i+period-2);

    //alert(1);
    // FROM HERE ON, WHAT WILL I NEED? I ONLY WANT TO SHOW THE CURRENT PERIOD HOURLY,
    //allDataSliced = loadedRows.slice(period);
    
    //currentDay = frameDataHourly(currentDay);
    //currentDay = frameData(24);
    //if (hours > 12) { hours = hours - 12};
    //var data = loadedRows.slice(0, hours+1);
    
    var data = loadedRows;
    //timestamp = new Date(data[0].timestamp).toDateString();
    //$("#message").html(timestamp);
    
    var tmp = convertData(data);
    
    loadData(tmp);
    
    //timer = setInterval(function () {tickLoad()}, 2000);
    //allData = convertData(loadedRows);
    //loadData(allData);
});

function loadData(data) {
  var layers = stack(nest.entries(data));

     // Extend the domain slightly to match the range of [0, 2π].
    //  angle.domain([0, d3.max(data, function(d) { return d.time + 1; })]);
  angle.domain([0, 12]);
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
      .text(function(d) { return formatDay(d); }); // text label on axis
}

function convertData(rows)
    {
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