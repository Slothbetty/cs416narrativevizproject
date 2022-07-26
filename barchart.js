// set the dimensions and margins of the graph
const margin = { top: 20, right: 30, bottom: 40, left: 90 },
    width = 1300 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);


// Parse the Data
d3.csv("ds_salaries.csv").then(function (data) {
    console.log(data);
    console.log(typeof data);


    draw(0);

    function draw(min_salary) {
        const year_count_map = new Map();
        for (let i = 0; i < data.length; i++) {
            if (parseInt(data[i]["salary_in_usd"]) >= min_salary) {
                const work_year = data[i]["work_year"]
                if (year_count_map.has(work_year)) {
                    year_count_map.set(work_year, year_count_map.get(work_year) + 1);
                } else {
                    year_count_map.set(work_year, 1);
                }
            }
        }

        // Add X axis
        const x = d3.scaleLinear()
            .domain([0, 600])
            .range([0, width]);
        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");

        // Y axis
        const y = d3.scaleBand()
            .range([0, height])
            .domain([...year_count_map.keys()])
            .padding(.1);
        svg.append("g")
            .call(d3.axisLeft(y))


                // ----------------
        // Create a tooltip
        // ----------------
        const tooltip = d3.select("#my_dataviz")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px")

        // Three function that change the tooltip when user hover / move / leave a cell
        const mouseover = function(event, d) {
        tooltip
            .html("subgroup: "+ "<br>" + "Value: ")
            .style("opacity", 1)

        }
        const mousemove = function(event, d) {
        tooltip.style("left",(event.x)/2+"px")
                .style("top",(event.y)/2-30+"px")
        }
        const mouseleave = function(event, d) {
        tooltip
            .style("opacity", 0)
        }



        // variable u: map data to existing bars
        var u = svg.selectAll("rect")
            .data(year_count_map)

        // update bars
        u
            .enter()
            .append("rect")
            .merge(u)
            .attr("x", function (d) { return x(0); })
            .attr("y", function (d) { return y(d[0]); })
            .attr("width", function (d) { return x(d[1]); })
            .attr("height", function (d) { return y.bandwidth(); })
            .attr("fill", "#69b3a2")
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)
            
            

        var slider = d3.select('#salary');
        slider.on('change', function () {
            console.log(this.value);
            draw(this.value);
        });

        
    }


})
