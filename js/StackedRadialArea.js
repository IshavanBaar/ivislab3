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
          .attr("y", -innerRadius + 9)
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