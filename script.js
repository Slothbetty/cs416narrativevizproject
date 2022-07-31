// set the dimensions and margins of the graph
const year_margin = { top: 20, right: 100, bottom: 70, left: 70 },
    year_width = 950 - year_margin.left - year_margin.right,
   year_height = 300 - year_margin.top - year_margin.bottom;

const experience_margin = { top: 20, right: 100, bottom: 70, left: 70 },
experience_width = 950 - experience_margin.left - experience_margin.right,
experience_height = 300 - experience_margin.top - experience_margin.bottom;

const country_margin = { top: 20, right: 100, bottom: 70, left: 70 },
    country_width = 1850 - country_margin.left - country_margin.right,
    country_height = 500 - country_margin.top - country_margin.bottom;

// append the svg object to the body of the page
const year_svg = d3.select("#year")
    .classed("year-svg-container", true) 
    .append("svg")
    // Responsive SVG needs these 2 attributes and no width and height attr.
   .attr("preserveAspectRatio", "xMinYMin meet")
   .attr("viewBox", "0 0 950 300")
    .append("g")
    .attr("transform", `translate(${year_margin.left}, ${year_margin.top})`);

// append the svg object to the body of the page
const experience_svg = d3.select("#experience")
    .classed("year-svg-container", true) 
    .append("svg")
    // Responsive SVG needs these 2 attributes and no width and height attr.
   .attr("preserveAspectRatio", "xMinYMin meet")
   .attr("viewBox", "0 0 950 300")
    .append("g")
    .attr("transform", `translate(${experience_margin.left}, ${experience_margin.top})`);

const country_svg = d3.select("#country")
    .classed("country-svg-container", true) 
    .append("svg")
     // Responsive SVG needs these 2 attributes and no width and height attr.
   .attr("preserveAspectRatio", "xMinYMin meet")
   .attr("viewBox", "0 0 1800 500")
    .append("g")
    .attr("transform", `translate(${country_margin.left}, ${country_margin.top})`);

//color list:
const colors = ['#e41a1c', '#377eb8', '#4daf4a', '#F17327', '#E551E8', '#CAD351', '#8E23A2', '#1AC6FC', '#EBA99A', '#09D4FA'];

// Parse the Data and Display the chart
d3.csv("ds_salaries.csv", function (data) {

    var slider = d3.select('#salary');
    slider.on('change', function () {
        console.log(this.value);
        draw_year(this.value);
        draw_country(this.value);
        draw_experience(this.value);
    });

    function draw_year(min_salary) {

        const year_count_map = new Map();
        const year_total_count_map = new Map();
        const year_count_percentage_map = new Map();
        for (let i = 0; i < data.length; i++) {
            const work_year = data[i]["work_year"]
            if (year_count_map.has(work_year)) {
                year_total_count_map.set(work_year, year_total_count_map.get(work_year) + 1);
                if (parseInt(data[i]["salary_in_usd"]) >= min_salary * 1000) {
                    year_count_map.set(work_year, year_count_map.get(work_year) + 1);
                }
            } else {
                year_total_count_map.set(work_year, 1);
                if (parseInt(data[i]["salary_in_usd"]) >= min_salary * 1000) {
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
        const year_x = d3.scaleLinear()
            .domain([0, 100])
            .range([0, year_width]);
        year_svg.append("g")
            .attr("transform", "translate(0," + year_height + ")")
            .call(d3.axisBottom(year_x))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");

        //Add Y axis
        const year_y = d3.scaleBand()
            .range([0, year_height])
            .domain([...year_count_percentage_map.keys()])
            .padding(.1);
        year_svg.append("g")
            .call(d3.axisLeft(year_y))

        //Add Barchart labels to X and Y axis
        year_svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -(year_height / 2))
            .attr("y", -40)
            .style("text-anchor", "middle")
            .text("Year")
            .style("font-size", "18px");

        year_svg.append("text")
            .attr("x", year_width / 2)
            .attr("y", 260)
            .attr("text-anchor", "middle")
            .style("font-size", "18px")
            .text("Percentage of People");

        //Initialize tooltip and colors
        var tooltip = d3.select("body").append("div").attr("class", "toolTip");

        var color = d3.scaleOrdinal()
            .domain([...year_count_percentage_map.keys()])
            .range(colors);

        // variable u: map data to existing bars
        var u = year_svg.selectAll("rect")
            .data(arr)

        // update bars
        u
            .enter()
            .append("rect")
            .merge(u)
            .attr("x", function (d) { return year_x(0); })
            .attr("y", function (d) { return year_y(d.year); })
            .attr("width", function (d) { return year_x(d.count_percentage); })
            .attr("height", function (d) { return year_y.bandwidth()-10; })
            .attr("fill", "#69b3a2" )
            .on("mousemove", function (d) {
                tooltip
                    .style("left", d3.event.pageX - 50 + "px")
                    .style("top", d3.event.pageY - 70 + "px")
                    .style("display", "inline-block")
                    .html((d.area) + "<br>" + "£" + (d.value));
            })
            .on("mouseout", function (d) { tooltip.style("display", "none"); });


        // Add percentage text labels    
        var label = year_svg.selectAll(".label").data(arr);

        label.exit().remove();

        label.enter().append("text").attr("class", "label");

        label.text(function (d) { return d.count_percentage.toFixed(1) + "%"; })
            .attr("x", function (d) { return year_x(d.count_percentage); })
            .attr("y", function (d) { return year_y(d.year) + year_y.bandwidth() / 2 + 10; })
            .attr("font-family", "sans-serif")
            .attr("font-size", "18px")
            .attr("fill", "black");

    }


    function draw_experience(min_salary) {

        const experience_count_map = new Map();
        const experience_total_count_map = new Map();
        const experience_count_percentage_map = new Map();
        for (let i = 0; i < data.length; i++) {
            const experience_level = data[i]["experience_level"]
            if (experience_count_map.has(experience_level)) {
                experience_total_count_map.set(experience_level, experience_total_count_map.get(experience_level) + 1);
                if (parseInt(data[i]["salary_in_usd"]) >= min_salary * 1000) {
                    experience_count_map.set(experience_level, experience_count_map.get(experience_level) + 1);
                }
            } else {
                experience_total_count_map.set(experience_level, 1);
                if (parseInt(data[i]["salary_in_usd"]) >= min_salary * 1000) {
                    experience_count_map.set(experience_level, 1);
                }
            }
        }

        experience_total_count_map.forEach((value, key) => {
            if (experience_count_map.has(key)) {
                experience_count_percentage_map.set(key, (experience_count_map.get(key) / value) * 100);
            } else {
                experience_count_percentage_map.set(key, 0 / value);
            }
        });

        const arr = Array.from(experience_count_percentage_map, ([key, value]) => {
            return { ['experience']: key, ['count_percentage']: value };
        });

        // Add X axis
        const experience_x = d3.scaleLinear()
            .domain([0, 100])
            .range([0, experience_width]);
        experience_svg.append("g")
            .attr("transform", "translate(0," + experience_height + ")")
            .call(d3.axisBottom(experience_x))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");

        //Add Y axis
        const experience_y = d3.scaleBand()
            .range([0, experience_height])
            .domain([...experience_count_percentage_map.keys()])
            .padding(.1);
        experience_svg.append("g")
            .call(d3.axisLeft(experience_y))

        //Add Barchart labels to X and Y axis
        experience_svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -(experience_height / 2))
            .attr("y", -40)
            .style("text-anchor", "middle")
            .text("Experience Level")
            .style("font-size", "18px");

        experience_svg.append("text")
            .attr("x", experience_width / 2)
            .attr("y", 260)
            .attr("text-anchor", "middle")
            .style("font-size", "18px")
            .text("Percentage of People");

        //Initialize tooltip and colors
        var tooltip = d3.select("body").append("div").attr("class", "toolTip");

        var color = d3.scaleOrdinal()
            .domain([...experience_count_percentage_map.keys()])
            .range(colors);

        // variable u: map data to existing bars
        var u = experience_svg.selectAll("rect")
            .data(arr)

        // update bars
        u
            .enter()
            .append("rect")
            .merge(u)
            .attr("x", function (d) { return experience_x(0); })
            .attr("y", function (d) { return experience_y(d.experience); })
            .attr("width", function (d) { return experience_x(d.count_percentage); })
            .attr("height", function (d) { return experience_y.bandwidth()-10; })
            .attr("fill", "#69b3a2")
            .on("mousemove", function (d) {
                tooltip
                    .style("left", d3.event.pageX - 50 + "px")
                    .style("top", d3.event.pageY - 70 + "px")
                    .style("display", "inline-block")
                    .html((d.area) + "<br>" + "£" + (d.value));
            })
            .on("mouseout", function (d) { tooltip.style("display", "none"); });


        // Add percentage text labels    
        var label = experience_svg.selectAll(".label").data(arr);

        label.exit().remove();

        label.enter().append("text").attr("class", "label");

        label.text(function (d) { return d.count_percentage.toFixed(1) + "%"; })
            .attr("x", function (d) { return experience_x(d.count_percentage); })
            .attr("y", function (d) { return experience_y(d.experience) + experience_y.bandwidth() / 2 + 10; })
            .attr("font-family", "sans-serif")
            .attr("font-size", "18px")
            .attr("fill", "black");

    }



    function draw_country(min_salary) {

        const country_count_map = new Map();
        const country_total_count_map = new Map();
        const country_count_percentage_map = new Map();
        for (let i = 0; i < data.length; i++) {
            const company_location = data[i]["company_location"]
            if (country_count_map.has(company_location)) {
                country_total_count_map.set(company_location, country_total_count_map.get(company_location) + 1);
                if (parseInt(data[i]["salary_in_usd"]) >= min_salary * 1000) {
                    country_count_map.set(company_location, country_count_map.get(company_location) + 1);
                }
            } else {
                country_total_count_map.set(company_location, 1);
                if (parseInt(data[i]["salary_in_usd"]) >= min_salary * 1000) {
                    country_count_map.set(company_location, 1);
                }
            }
        }

        country_total_count_map.forEach((value, key) => {
            if (country_count_map.has(key)) {
                country_count_percentage_map.set(key, (country_count_map.get(key) / value) * 100);
            } else {
                country_count_percentage_map.set(key, 0 / value);
            }
        });

        const arr = Array.from(country_count_map, ([key, value]) => {
            return { ['country']: key, ['count']: value };
        });

        // X axis
        var country_x = d3.scaleBand()
            .range([0, country_width])
            .domain([...country_count_percentage_map.keys()])
            .padding(0.2);
            country_svg.append("g")
            .attr("transform", "translate(0," + country_height + ")")
            .call(d3.axisBottom(country_x))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");

        // Add Y axis
        var country_y = d3.scaleLog()
        .domain([0.99, 380])
        .range([ country_height, 0])
        ;
        country_svg.append("g")
        .call(d3.axisLeft(country_y).tickFormat(d3.format("d")));

        //Add Barchart labels to X and Y axis
        country_svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -(country_height / 2))
            .attr("y", -40)
            .style("text-anchor", "middle")
            .style("font-size", "18px")
            .text("Count of People");

        country_svg.append("text")
            .attr("x", country_width / 2)
            .attr("y", 450)
            .attr("text-anchor", "middle")
            .style("font-size", "18px")
            .text("Country");

        //Initialize tooltip and colors
        var tooltip = d3.select("body").append("div").attr("class", "toolTip");

        var color = d3.scaleOrdinal()
            .domain([...country_count_percentage_map.keys()])
            .range(colors);

        // variable u: map data to existing bars
        var u = country_svg.selectAll("rect")
            .data(arr)

        // update bars
        u
            .enter()
            .append("rect")
            .merge(u)
            .attr("x", function (d) { return country_x(d.country); })
            .attr("y", function (d) { return country_y(d.count); })
            .attr("width", function (d) { return country_x.bandwidth(); })
            .attr("height", function (d) { return country_height - country_y(d.count); })
            .attr("fill",  "#69b3a2")
            .on("mousemove", function (d) {
                tooltip
                    .style("left", d3.event.pageX - 50 + "px")
                    .style("top", d3.event.pageY - 70 + "px")
                    .style("display", "inline-block")
                    .html((d.area) + "<br>" + "£" + (d.value));
            })
            .on("mouseout", function (d) { tooltip.style("display", "none"); });

    }

    draw_year(0);
    draw_country(0);
    draw_experience(0);

})
