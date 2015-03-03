var w = 960,
    h = 500,
    hourScale = 0, //0 if 12h, 1 if 24h, 2 if 1 week
    days = ['Sun','Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    now = new Date();

var fields = [
  {name: "hours", value: 0, size: 12, innerRadius: 100, outerRadius: 120},
  {name: "minutes", value: 0, size: 60, innerRadius: 70, outerRadius: 90},
  {name: "seconds", value: 0, size: 60, innerRadius: 40, outerRadius: 60}
];

var outerArc = d3.svg.arc()
    .innerRadius(function(d) { return d.innerRadius})
    .outerRadius(function(d) { return d.outerRadius})
    .startAngle(0)
    .endAngle(function(d) { return (d.value / d.size) * 2 * Math.PI; });

var svg2 = d3.select("#clock").append("svg:svg")
    .attr("width", w)
    .attr("height", h)
  .append("svg:g")
    .attr("transform", "translate(0," + (h / 2) + ")");

setInterval(function(d) {
  now = new Date();
  fields[0].previous = fields[0].value; 

  fields[0].value = timeForHourPath(now.getHours(), now.getDay());
  fields[1].previous = fields[1].value; fields[1].value = now.getMinutes();
  fields[2].previous = fields[2].value; fields[2].value = now.getSeconds();

  var path = svg2.selectAll("path")
      .data(fields.filter(function(d) { return d.value; }), function(d) { return d.name; });

  path.enter().append("svg:path")
    .attr("transform", function(d, i) { return "translate(" + w/2 + ",0)"; })
    .attr("id", "circular-path");
  
  path.transition()
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
    
  updateCurrentTime(now);
}, 1000);

function arcTween(b) {
  var i = d3.interpolate({value: b.previous}, b);
  return function(t) {
    return outerArc(i(t));
  };
}

function timeForHourPath(hours, day) {
    if (hourScale === 0) {  
        if (hours > 11) {
            hours = hours - 12;
        }
        fields[0].size = 12;
    }  
    else if (hourScale === 1) {
        fields[0].size = 24;
    }
    else if (hourScale === 2) {
        fields[0].size = 48;
        if (day > 0) {hours = hours + (day-1) * 24;}
        else {hours = hours + day * 24;}
    }
    return hours;
}

function timeStringForButton() {
    var timeString = '';
    if (hourScale === 0) {  
        if (hours >= 0 && hours < 12) {
            timeString = 'A.M.';
        } else {
            timeString = 'P.M.';
        } 
    } 
    else if (hourScale === 1) {
        var minuteString = now.getMinutes() + '';
        var hourString = now.getHours() + '';
        if (now.getMinutes() < 10) { minuteString = '0' + now.getMinutes()}
        if (hours < 10) { hourString = '0' + now.getHours()}
        timeString = hourString + ":" + minuteString;    
    }
    else if (hourScale === 2) {
        if(day > 0) {timeString = days[day-1] + '&' + days[now.getDay()];}
        else {timeString = days[6] + '&' + days[now.getDay()];}
    }
    $("#time-button").text(timeString);
}

function switchTime() {
    if (hourScale === 2) {
        hourScale = 0;
    } else {
        hourScale++;
    }
    timeStringForButton();
    switchPeriod(hourScale);
}