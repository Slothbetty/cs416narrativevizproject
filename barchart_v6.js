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

        console.log(year_count_map);

        svg.append("g")
            .call(d3.axisLeft(y))


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
            

        var slider = d3.select('#salary');
        slider.on('change', function () {
            console.log(this.value);
            draw(this.value);
        });

        // // ----------------
        // // Create a tooltip
        // // ----------------
        // var tooltip = d3.select("#my_dataviz")
        // .append("div")
        // .style("opacity", 0)
        // .attr("class", "tooltip")
        // .style("background-color", "white")
        // .style("border", "solid")
        // .style("border-width", "1px")
        // .style("border-radius", "5px")
        // .style("padding", "10px")

        // // Three function that change the tooltip when user hover / move / leave a cell
        // var mouseover = function(d) {
        //     console.log("hit mouseover");
        // var subgroupName = d3.select(this.parentNode).datum().key;
        // var subgroupValue = d.data[subgroupName];
        // tooltip
        //     .html("subgroup: " + subgroupName + "<br>" + "Value: " + subgroupValue)
        //     .style("opacity", 1)
        // }
        // var mousemove = function(d) {
        // tooltip
        //     .style("left", (d3.mouse(this)[0]+90) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
        //     .style("top", (d3.mouse(this)[1]) + "px")
        // }
        // var mouseleave = function(d) {
        // tooltip
        //     .style("opacity", 0)
        // }
    }


})
