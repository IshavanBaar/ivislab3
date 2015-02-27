
var w = 960,
    h = 500;

var fields = [
  {id: 0, name: "hours", value: 0, size: 12, innerRadius: 80, outerRadius: 100},
  {id: 1, name: "minutes", value: 0, size: 60, innerRadius: 50, outerRadius: 70},
  {name: "seconds", value: 0, size: 60, innerRadius: 20, outerRadius: 40}
];

var outerArc = d3.svg.arc()
    .innerRadius(function(d) { return d.innerRadius})
    .outerRadius(function(d) { return d.outerRadius})
    .startAngle(0)
    .endAngle(function(d) { return (d.value / d.size) * 2 * Math.PI; });

var svg = d3.select("#graph").append("svg:svg")
    .attr("width", w)
    .attr("height", h)
  .append("svg:g")
    .attr("transform", "translate(0," + (h / 2) + ")");

setInterval(function() {
  var now = new Date();
  fields[0].previous = fields[0].value; 
  fields[0].value = timeTo12Hours(now.getHours());
  fields[1].previous = fields[1].value; fields[1].value = now.getMinutes();
  fields[2].previous = fields[2].value; fields[2].value = now.getSeconds();

  var path = svg.selectAll("path")
      .data(fields.filter(function(d) { return d.value; }), function(d) { return d.name; });

  path.enter().append("svg:path")
    .attr("transform", function(d, i) { return "translate(" + w/2 + ",0)"; })
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