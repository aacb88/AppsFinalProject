var margin = {top: 20, right:80, bottom: 30, left: 50};
    width = $(".chart").width() - margin.left - margin.right;
    height = $(".chart").height() - margin.top - margin.bottom;

var parseDate = d3.time.format("%Y").parse;

var x = d3.time.scale()
    .range([0, width]);
var y = d3.scale.linear()
    .range([height, 0]);

var color = d3.scale.category20();

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");
var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var line = d3.svg.line()
    .interpolate("basis")
    .defined(function(d) { return d.Time > 0; })
    .x(function(d) {return x(d.Year); })
    .y(function(d) {return y(d.Time); })
    

var svg = d3.select(".chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");




d3.csv("data/mlb_time.csv", function(error, data) {
    if (error) throw error;

    color.domain(d3.keys(data[0]).filter(function(key) { return key !== "Year"; }));

    data.forEach(function(d) {
        d.Year = parseDate(d.Year);
    });

    var teams = color.domain().map(function(name){
        return {
            

            name: name,
            values: data.map(function(d){
                var minutes = +d[name];
                if (!minutes) {
                    minutes = null;
                } 

                return {Year: d.Year, Time: minutes};
                
            })    
        };
    });
x.domain(d3.extent(data, function(d) {return d.Year;}));
y.domain([
    d3.min(teams, function(c) { return d3.min(c.values, function(v) {return v.Time;});}),
    d3.max(teams, function(c) { return d3.max(c.values, function(v) {return v.Time;});})
    ]);



svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

svg.append("g")
    .attr("class", "y-axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Time (Minutes)");


var team = svg.selectAll(".team")
    .data(teams)
    .enter().append("g")
    .attr("class", "team");    
team.append("path")
    .attr("class", "line")
    .attr("d", function(d) { return line(d.values); })
    .style("stroke", function(d) {return color(d.name); });
team.append("text")
    .datum(function(d) {return {name: d.name, value: d.values[d.values.length - 1]}; })
    .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.Time) + ")";})
    .attr("x", 3)
    .attr("dy", ".35em")
    .text(function(d) {return d.name; });

});

//first class line, second class team name, 