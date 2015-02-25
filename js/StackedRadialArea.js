var formatDate = d3.time.format("%a"),
    formatDay = function(d) { return formatDate(new Date(2007, 0, d)); };

var width = 960,
    height = 500,
    outerRadius = height / 2 - 10,
    innerRadius = 120;

  var clockGroup, fields, formatHour, formatMinute, formatSecond, height, pi, render, scaleHours, scaleSecsMins, vis, width;

  formatSecond = d3.time.format("%S");

  formatMinute = d3.time.format("%M");

  formatHour = d3.time.format("%H");

  fields = function() {
    var d, data, hour, minute, second;
    d = new Date();
    second = d.getSeconds();
    minute = d.getMinutes();
    hour = d.getHours() + minute / 60;
    return data = [
      {
        "unit": "seconds",
        "text": formatSecond(d),
        "numeric": second
      }, {
        "unit": "minutes",
        "text": formatMinute(d),
        "numeric": minute
      }, {
        "unit": "hours",
        "text": formatHour(d),
        "numeric": hour
      }
    ];
  };

  pi = Math.PI;

  scaleSecsMins = d3.scale.linear().domain([0, 59 + 59 / 60]).range([0, 2 * pi]);

  scaleHours = d3.scale.linear().domain([0, 11 + 59 / 60]).range([0, 2 * pi]);




  render = function(data) {
    var hourArc, minuteArc, secondArc;
    clockGroup.selectAll(".clockhand").remove();
    secondArc = d3.svg.arc().innerRadius(0).outerRadius(70).startAngle(function(d) {
      return scaleSecsMins(d.numeric);
    }).endAngle(function(d) {
      return scaleSecsMins(d.numeric);
    });
    minuteArc = d3.svg.arc().innerRadius(0).outerRadius(70).startAngle(function(d) {
      return scaleSecsMins(d.numeric);
    }).endAngle(function(d) {
      return scaleSecsMins(d.numeric);
    });
    hourArc = d3.svg.arc().innerRadius(0).outerRadius(50).startAngle(function(d) {
      return scaleHours(d.numeric % 12);
    }).endAngle(function(d) {
      return scaleHours(d.numeric % 12);
    });
    clockGroup.selectAll(".clockhand").data(data).enter().append("svg:path").attr("d", function(d) {
      if (d.unit === "seconds") {
        return secondArc(d);
      } else if (d.unit === "minutes") {
        return minuteArc(d);
      } else if (d.unit === "hours") {
        return hourArc(d);
      }
    }).attr("class", "clockhand").attr("stroke", "black").attr("stroke-width", function(d) {
      if (d.unit === "seconds") {
        return 2;
      } else if (d.unit === "minutes") {
        return 3;
      } else if (d.unit === "hours") {
        return 3;
      }
    }).attr("fill", "none");
  };

  setInterval(function() {
    var data;
    data = fields();
    return render(data);
  }, 1000);


var angle = d3.time.scale()
    .range([0, 2 * Math.PI]);

var radius = d3.scale.linear()
    .range([innerRadius, outerRadius]);

var z = d3.scale.category20c();

var stack = d3.layout.stack()
    .offset("zero")
    .values(function(d) { return d.values; })
    .x(function(d) { return d.time; })
    .y(function(d) { return d.value; });

var nest = d3.nest()
    .key(function(d) { return d.key; });

var line = d3.svg.line.radial()
    .interpolate("cardinal-closed")
    .angle(function(d) { return angle(d.time); })
    .radius(function(d) { return radius(d.y0 + d.y); });

var area = d3.svg.area.radial()
    .interpolate("cardinal-closed")
    .angle(function(d) { return angle(d.time); })
    .innerRadius(function(d) { return radius(d.y0); })
    .outerRadius(function(d) { return radius(d.y0 + d.y); });

var svg = d3.select("#graph").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

d3.csv("data/data.csv", type, function(error, data) {
  var layers = stack(nest.entries(data));

  // Extend the domain slightly to match the range of [0, 2π].
  angle.domain([0, d3.max(data, function(d) { return d.time + 1; })]);
  radius.domain([0, d3.max(data, function(d) { return d.y0 + d.y; })]);

  svg.selectAll(".layer")
      .data(layers)
    .enter().append("path")
      .attr("class", "layer")
      .attr("d", function(d) { return area(d.values); })
      .style("fill", function(d, i) { return z(i); });

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
      .text(function(d) { return formatDay(d); });
});


  clockGroup = svg.append("svg:g").attr("transform", "translate(" + 0 + "," + 0 + ")");

  clockGroup.append("svg:circle").attr("r", 80).attr("fill", "none").attr("class", "clock outercircle").attr("stroke", "black").attr("stroke-width", 2);

  clockGroup.append("svg:circle").attr("r", 4).attr("fill", "black").attr("class", "clock innercircle");


function type(d) {
  d.time = +d.time;
  d.value = +d.value;
  return d;
}
