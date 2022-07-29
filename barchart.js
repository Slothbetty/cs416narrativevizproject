// set the dimensions and margins of the graph
const margin = { top: 20, right: 30, bottom: 40, left: 45 },
    width = 750 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

//color list:
const colors = ['#e41a1c','#377eb8','#4daf4a', '#F17327', '#E551E8', '#CAD351', '#8E23A2', '#1AC6FC', '#EBA99A', '#09D4FA'];

// Parse the Data
d3.csv("ds_salaries.csv", function (data) {
    console.log(data);
    console.log(typeof data);


    draw(200000);

    function draw(min_salary) {

        const year_count_map = new Map();
        const year_total_count_map = new Map();
        const year_count_percentage_map = new Map();
        for (let i = 0; i < data.length; i++) {
            const work_year = data[i]["work_year"]
            if (year_count_map.has(work_year)) {
                year_total_count_map.set(work_year, year_total_count_map.get(work_year) + 1);
                if (parseInt(data[i]["salary_in_usd"]) >= min_salary) {
                    year_count_map.set(work_year, year_count_map.get(work_year) + 1);
                }
            } else {
                year_total_count_map.set(work_year, 1);
                if (parseInt(data[i]["salary_in_usd"]) >= min_salary) {
                    year_count_map.set(work_year, 1);
                }
            }
        }

        year_total_count_map.forEach((value, key) => {
            if (year_count_map.has(key)) {
                year_count_percentage_map.set(key, (year_count_map.get(key) / value) * 100);
            } else {
                year_count_percentage_map.set(key, 0 / value);
            }
        });

        const arr = Array.from(year_count_percentage_map, ([key, value]) => {
            return { ['year']: key, ['count_percentage']: value };
        });

        // Add X axis
        const x = d3.scaleLinear()
            .domain([0, 100])
            .range([0, width]);
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");

        //Add Y axis
        const y = d3.scaleBand()
            .range([0, height])
            .domain([...year_count_percentage_map.keys()])
            .padding(.1);
        svg.append("g")
            .call(d3.axisLeft(y))

        //Add tooltips
        var tooltip = d3.select("body").append("div").attr("class", "toolTip");

        var subgroups = data.columns.slice(1);
        console.log('subgroups:', subgroups);
        console.log([...year_count_percentage_map.keys()]);

        var color = d3.scaleOrdinal()
        .domain([...year_count_percentage_map.keys()])
        .range(colors);

        // variable u: map data to existing bars
        var u = svg.selectAll("rect")
            .data(arr)

        // update bars
        u
            .enter()
            .append("rect")
            .merge(u)
            .attr("x", function (d) { return x(0); })
            .attr("y", function (d) { return y(d.year); })
            .attr("width", function (d) { return x(d.count_percentage); })
            .attr("height", function (d) { return y.bandwidth(); })
            .attr("fill", function(d) { return color(d.year); })
            .on("mousemove", function (d) {
                tooltip
                    .style("left", d3.event.pageX - 50 + "px")
                    .style("top", d3.event.pageY - 70 + "px")
                    .style("display", "inline-block")
                    .html((d.area) + "<br>" + "£" + (d.value));
            })
            .on("mouseout", function (d) { tooltip.style("display", "none"); });

    }

    var slider = d3.select('#salary');
    slider.on('change', function () {
        console.log(this.value);
        draw(this.value);
    });

})
