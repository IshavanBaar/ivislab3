// WIDTH, HEIGHT, STACKED RADIAL FOR CLOCK AND STACKED RADIAL
var width = 960,
    height = 500,
    outerRadius = height / 2 - 10, //Adjust for upper height of stacked graph
    innerRadius = 140; //Adjust for height lower height of stacked graph

/*
    FROM HERE
    ARC-TWEEN-CLOCK
*/

var fields = [
  {name: "hours", value: 0, size: 12, innerRadius: 80, outerRadius: 100},
  {name: "minutes", value: 0, size: 60, innerRadius: 50, outerRadius: 70},
  {name: "seconds", value: 0, size: 60, innerRadius: 20, outerRadius: 40}
];

var outerArc = d3.svg.arc()
    .innerRadius(function(d) { return d.innerRadius})
    .outerRadius(function(d) { return d.outerRadius})
    .startAngle(0)
    .endAngle(function(d) { return (d.value / d.size) * 2 * Math.PI; });

//var svg2 = d3.select("#graph").append("svg:path");
var path; 

setInterval(function() {
  var now = new Date();
  fields[0].previous = fields[0].value; 
  fields[0].value = timeTo12Hours(now.getHours());
  fields[1].previous = fields[1].value; fields[1].value = now.getMinutes();
  fields[2].previous = fields[2].value; fields[2].value = now.getSeconds();
  
  //TODO svg.select("path") also selects the areas, so that you could select the areas!
  path = svg.selectAll("path")
    .data(fields.filter(function(d) { return d.value; }), function(d) { return d.name; });  

  path.enter().append("svg:path")
    .attr("id", "circular-path")
    .transition()
      .ease("elastic")
      .duration(750)
      .attrTween("d", arcTween);

  path.transition()
      .ease("elastic")
      .duration(750)
      .attrTween("d", arcTween);

  path.exit().transition()
      .ease("bounce")
      .duration(750)
      .attrTween("d", arcTween)
      .remove();
    
  //Something like this: redrawStackedGraph(); 
}, 1000);

function arcTween(b) {
  var i = d3.interpolate({value: b.previous}, b);
  return function(t) {
    return outerArc(i(t));
  };
}

function timeTo12Hours(hours) {
    if (hours > 11) {
        hours = hours - 12;
    }
    return hours;
}

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

var colors = ["#0099CC", "#B22222"];

var color = d3.scale.threshold()
      .range(colors);

var z = d3.scale.category20c();

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

//function redrawStackedGraph() {
    d3.csv("data/day-data-afternoon.csv", type, function (error, data) {
      var layers = stack(nest.entries(data));

      // Extend the domain slightly to match the range of [0, 2π].
      angle.domain([0, d3.max(data, function(d) { return d.time + 1; })]);
      radius.domain([0, d3.max(data, function(d) { return d.y0 + d.y; })]);

      svg.selectAll(".layer")
          .data(layers)
        .enter().append("path")
          .attr("class", "layer")
          .attr("d", function(d) { return area(d.values); })
          .style("fill", function(d, i) { return color(i); });

      svg.selectAll(".axis")
          .data(d3.range(angle.domain()[1]))
        .enter().append("g")
          .attr("class", "axis")
          .attr("transform", function(d) { return "rotate(" + angle(d) * 180 / Math.PI + ")"; })
        .call(d3.svg.axis()
          .scale(radius.copy().range([-innerRadius, -outerRadius]))
          .orient("left"))
        .append("text")
          .attr("y", -innerRadius + 6)
          .attr("dy", ".71em")
          .attr("text-anchor", "middle")
          .attr("id", "hour-label")
          .text(function(d) { return formatDay(d + 12); }); // text label on axis
    });

    function type(d) {
      d.time = +d.time;
      d.value = +d.value;
      return d;
    }
//}