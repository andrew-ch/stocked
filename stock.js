function searchStock(inputStock) {

    var margin = {top: 30, right: 20, bottom: 30, left: 100},
    width = 950 - margin.left - margin.right,
    height = 270 - margin.top - margin.bottom;

    // Parse the date / time
    var parseDate = d3.time.format("%Y-%m-%d").parse;

    // Set the ranges
    var x = d3.time.scale().range([0, width]);
    var y = d3.scale.linear().range([height, 0]);

    // Define the axes
    var xAxis = d3.svg.axis().scale(x)
        .orient("bottom").ticks(10);

    var yAxis = d3.svg.axis().scale(y)
        .orient("left").ticks(5);

    // Define the line
    var valueline = d3.svg.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.close); });
        
    // Adds the svg canvas
    var svg = d3.select("#chart")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", 
                "translate(" + margin.left + "," + margin.top + ")")

    // Get the data
    var data = [];
    var count = 0;
    var sum = 0;

    var high = -9007199254740992;
    var low = 9007199254740992;
    var highDate;
    var lowDate;
    var stockData = 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=' + inputStock.value + '&interval=5min&outputsize=full&apikey=' + mykey;
    getInfo(stockData).then(([stockInfo]) => {
    Object.keys(stockInfo['Time Series (Daily)']).forEach(function(key) {
        data.push({
        date: parseDate(key),
        close: +stockInfo['Time Series (Daily)'][key]['4. close']
        });
        count++;
        sum += +stockInfo['Time Series (Daily)'][key]['4. close']
        if (+stockInfo['Time Series (Daily)'][key]['4. close'] >= high) {
        high = +stockInfo['Time Series (Daily)'][key]['4. close'];
        highDate = parseDate(key);
        }
        if (+stockInfo['Time Series (Daily)'][key]['4. close'] <= low) {
        low = +stockInfo['Time Series (Daily)'][key]['4. close'];
        lowDate = parseDate(key);
        }
    }) 
    
    var mean = parseFloat(Math.round((sum / count) * 100) / 100).toFixed(2);
    high = parseFloat(Math.round(high * 100) / 100).toFixed(2);
    low = parseFloat(Math.round(low * 100) / 100).toFixed(2);

    // Grabs the most recent price
    var value = JSON.stringify(stockInfo["Time Series (Daily)"][stockInfo['Meta Data']["3. Last Refreshed"].substring(0, 10)]["4. close"]);
    value = parseFloat(+value.substring(1, value.length - 1)).toFixed(2);
    
    var recentDate = JSON.stringify(stockInfo['Meta Data']["3. Last Refreshed"]);
    recentDate = recentDate.substring(1, recentDate.length - 1);

    var formatDate = new Date(recentDate.substring(0, 4), +recentDate.substring(5, 7) - 1, recentDate.substring(8, 10));
    var options = { year: 'numeric', month: 'long', day: 'numeric' };
    formatDate = formatDate.toLocaleDateString("en-US", options);
    
    highDate = JSON.stringify(highDate);
    var maxDate = new Date(highDate.substring(1, 5), highDate.substring(6, 8), highDate.substring(9, 11));
    maxDate = maxDate.toLocaleDateString("en-US", options);

    lowDate = JSON.stringify(lowDate);
    var minDate = new Date(lowDate.substring(1, 5), lowDate.substring(6, 8), lowDate.substring(9, 11));
    minDate = minDate.toLocaleDateString("en-US", options);

    var price = "$" + value.toString();
    document.getElementById('info').innerHTML = inputStock.value.toUpperCase().bold() + "'s stock price is " + price.bold() + " as of " + formatDate.bold()
    + "<br /><br />" + "The highest price was " + "$".bold() + high.toString().bold() + " on " + maxDate.bold()
    + "<br /><br />" + "The lowest price was " + "$".bold() + low.toString().bold() + " on " + minDate.bold()
    + "<br /><br />" + "The " + "average price is " + "$".bold() + mean.toString().bold();

    // Scale the range of the data
    x.domain(d3.extent(data, function(d) { return d.date; }));
    y.domain([0, d3.max(data, function(d) { return d.close; })]);

    // Add the valueline path.
    svg.append("path")
        .attr("class", "line")
        .attr("d", valueline(data));
    
    // Add the X Axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // Add the Y Axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    // text label for the y axis
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Price ($)"); 

    svg.append("text")
        .attr("x", (width / 2))             
        .attr("y", 15 - (margin.top / 2))
        .attr("text-anchor", "middle")  
        .style("font-size", "16px") 
        .style("text-decoration", "underline")  
        .text(inputStock.value.toUpperCase() + " Stock Price vs Time");
    });
}

function getJson(input) {
    return fetch(input)
    .then(response => response.json());
}

function getInfo(data) {
    return Promise.all([getJson(data)]);
}