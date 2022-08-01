// set the dimensions and margins of the graph
const year_margin = { top: 20, right: 100, bottom: 70, left: 100 },
    year_width = 1200 - year_margin.left - year_margin.right,
    year_height = 300 - year_margin.top - year_margin.bottom;

const experience_margin = { top: 20, right: 70, bottom: 70, left: 220 },
    experience_width = 1200 - experience_margin.left - experience_margin.right,
    experience_height = 300 - experience_margin.top - experience_margin.bottom;

const country_margin = { top: 20, right: 100, bottom: 70, left: 100 },
    country_width = 2800 - country_margin.left - country_margin.right,
    country_height = 800 - country_margin.top - country_margin.bottom;

// append the svg object to the body of the page
const year_svg = d3.select("#year")
    .classed("year-svg-container", true)
    .append("svg")
    // Responsive SVG needs these 2 attributes and no width and height attr.
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 1200 400")
    .append("g")
    .attr("transform", `translate(${year_margin.left}, ${year_margin.top})`);

// append the svg object to the body of the page
const experience_svg = d3.select("#experience")
    .classed("experience-svg-container", true)
    .append("svg")
    // Responsive SVG needs these 2 attributes and no width and height attr.
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 1200 400")
    .append("g")
    .attr("transform", `translate(${experience_margin.left}, ${experience_margin.top})`);

const country_svg = d3.select("#country")
    .classed("country-svg-container", true)
    .append("svg")
    // Responsive SVG needs these 2 attributes and no width and height attr.
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 2900 900")
    .append("g")
    .attr("transform", `translate(${country_margin.left}, ${country_margin.top})`);

//color list:
const colors = ['#e41a1c', '#377eb8', '#4daf4a', '#F17327', '#E551E8', '#CAD351', '#8E23A2', '#1AC6FC', '#EBA99A', '#09D4FA'];

// Parse the Data and Display the chart
d3.csv("processed_ds_salaries.csv", function (data) {

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
            if (parseInt(data[i]["salary_in_usd"]) >= min_salary * 1000) {
                if (year_count_map.has(work_year)) {
                    year_count_map.set(work_year, year_count_map.get(work_year) + 1);
                } else {
                    year_count_map.set(work_year, 1);
                }
            }
            if (year_total_count_map.has(work_year)) {
                year_total_count_map.set(work_year, year_total_count_map.get(work_year) + 1);
            } else {
                year_total_count_map.set(work_year, 1);
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
            .style("text-anchor", "end")
            .style("font-size", "16px");

        //Add Y axis
        const year_y = d3.scaleBand()
            .range([0, year_height])
            .domain([...year_count_percentage_map.keys()])
            .padding(.1);
        year_svg.append("g")
            .call(d3.axisLeft(year_y))
            .style("font-size", "16px");

        //Add Barchart labels to X and Y axis
        year_svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -(year_height / 2))
            .attr("y", -60)
            .style("text-anchor", "middle")
            .text("Year")
            .style("font-size", "22px");

        year_svg.append("text")
            .attr("x", year_width / 2)
            .attr("y", 260)
            .attr("text-anchor", "middle")
            .style("font-size", "22px")
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
            .attr("height", function (d) { return year_y.bandwidth() - 10; })
            .attr("fill", "#69b3a2")
            .on("mousemove", function (d) {
                tooltip
                    .style("left", d3.event.pageX - 50 + "px")
                    .style("top", d3.event.pageY - 70 + "px")
                    .style("display", "inline-block")
                    .html("Year: " + (d.year) + "<br>" + "Percentage of People: " + (d.count_percentage.toFixed(1)) + "%");
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

        add_annotations(min_salary, "year");

    }


    function draw_experience(min_salary) {

        const experience_count_map = new Map();
        const experience_total_count_map = new Map();
        const experience_count_percentage_map = new Map();

        for (let i = 0; i < data.length; i++) {
            const experience_level = data[i]["experience_level"]
            if (parseInt(data[i]["salary_in_usd"]) >= min_salary * 1000) {
                if (experience_count_map.has(experience_level)) {
                    experience_count_map.set(experience_level, experience_count_map.get(experience_level) + 1);
                } else {
                    experience_count_map.set(experience_level, 1);
                }
            }
            if (experience_total_count_map.has(experience_level)) {
                experience_total_count_map.set(experience_level, experience_total_count_map.get(experience_level) + 1);
            } else {
                experience_total_count_map.set(experience_level, 1);
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
            .style("text-anchor", "end")
            .style("font-size", "16px");

        //Add Y axis
        const experience_y = d3.scaleBand()
            .range([0, experience_height])
            .domain([...experience_count_percentage_map.keys()])
            .padding(.1);
        experience_svg.append("g")
            .call(d3.axisLeft(experience_y))
            .style("font-size", "16px");

        //Add Barchart labels to X and Y axis
        experience_svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -(experience_height / 2))
            .attr("y", -200)
            .style("text-anchor", "middle")
            .text("Experience Level")
            .style("font-size", "22px");

        experience_svg.append("text")
            .attr("x", experience_width / 2)
            .attr("y", 260)
            .attr("text-anchor", "middle")
            .style("font-size", "22px")
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
            .attr("height", function (d) { return experience_y.bandwidth() - 10; })
            .attr("fill", "#69b3a2")
            .on("mousemove", function (d) {
                tooltip
                    .style("left", d3.event.pageX - 50 + "px")
                    .style("top", d3.event.pageY - 70 + "px")
                    .style("display", "inline-block")
                    .html("Experiance Level: " + (d.experience) + "<br>" + "Percentage of People: " + (d.count_percentage.toFixed(1)) + "%");
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
        add_annotations(min_salary, "experience");

    }


    function draw_country(min_salary) {

        const country_count_map = new Map();
        for (let i = 0; i < data.length; i++) {
            const country = data[i]["country"]
            if (parseInt(data[i]["salary_in_usd"]) >= min_salary * 1000) {
                if (country_count_map.has(country)) {
                    country_count_map.set(country, country_count_map.get(country) + 1);
                } else {
                    country_count_map.set(country, 1);
                }
            }
            if (!country_count_map.has(country)) {
                country_count_map.set(country, 0);
            }

        }

        const arr = Array.from(country_count_map, ([key, value]) => {
            return { ['country']: key, ['count']: value };
        });

        // X axis
        var country_x = d3.scaleBand()
            .range([0, country_width])
            .domain([...country_count_map.keys()])
            .padding(0.2);
        country_svg.append("g")
            .attr("transform", "translate(0," + country_height + ")")
            .call(d3.axisBottom(country_x))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end")
            .style("font-size", "18px");

        // Add Y axis
        var country_y = d3.scaleLog()
            .domain([0.8, 380])
            .range([country_height, 0]);
        country_svg.append("g")
            .call(d3.axisLeft(country_y).tickFormat(d3.format("d")))
            .style("font-size", "18px");

        //Add Barchart labels to X and Y axis
        country_svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -(country_height / 2))
            .attr("y", -60)
            .style("text-anchor", "middle")
            .style("font-size", "26px")
            .text("Count of People");

        country_svg.append("text")
            .attr("x", country_width / 2)
            .attr("y", 850)
            .attr("text-anchor", "middle")
            .style("font-size", "26px")
            .text("Country");

        //Initialize tooltip and colors
        var tooltip = d3.select("body").append("div").attr("class", "toolTip");

        var color = d3.scaleOrdinal()
            .domain([...country_count_map.keys()])
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
            .attr("fill", "#69b3a2")
            .on("mousemove", function (d) {
                tooltip
                    .style("left", d3.event.pageX - 50 + "px")
                    .style("top", d3.event.pageY - 70 + "px")
                    .style("display", "inline-block")
                    .html("Country: " + (d.country) + "<br>" + "Count of People: " + (d.count));
            })
            .on("mouseout", function (d) { tooltip.style("display", "none"); });

        add_annotations(min_salary, "country");

    }


    // Introduction
    const btn = document.querySelector("button");
    btn.addEventListener("click", introduction);
    var clicktimes = 0;
    function introduction() {
        var intro = document.getElementById("intro");
        var slider = document.getElementById("slider");
        var year = document.getElementById("year");
        var experience = document.getElementById("experience");
        var country = document.getElementById("country");
        var input_element = document.getElementById("salary");
        var output_element = document.getElementById("selected_salary");
        var btn = document.getElementById("btn_name");
        input_element.disabled = true;

        if (clicktimes == 0) {
            slider.style.border = "2px red solid";
            intro.innerHTML = "This is the slider bar which is the only parameter could be motified in the page."
                + "<br>You could select the minimum data science salaries as your wish to see the different reaction of the charts below.";
            btn.innerHTML = "Next";
            clicktimes++;

        } else if (clicktimes == 1) {
            slider.style.border = "";
            year.style.border = "2px red solid";
            intro.innerHTML = "This is Year vs Percentage of People chart."
                + "<br>It's mainly showing the percentage of people whose salaries are more than or equal to selected minimum data science salaries in the slider bar in different years.";
            clicktimes++;
        } else if (clicktimes == 2) {
            year.style.border = "";
            experience.style.border = "2px red solid";
            intro.innerHTML = "This is Experience Level vs Percentage of People chart."
                + "<br>It's mainly showing the percentage of people whose salaries are more than or equal to selected minimum data science salaries in the slider bar in different experience levels.";
            clicktimes++;
        } else if (clicktimes == 3) {
            experience.style.border = "";
            country.style.border = "2px red solid";
            intro.innerHTML = "This is Count of People VS Country chart."
                + "<br>It's mainly showing the amount of people whose salaries are more than or equal to selected minimum data science salaries in the slider bar in different countries.";
            clicktimes++;
        } else if (clicktimes == 4) {
            country.style.border = "";
            intro.innerHTML = "Next I will show you three different scenes generated with charts below.";
            clicktimes++;
        } else if (clicktimes == 5) { //first scene
            input_element.value = 0;
            output_element.value = 0;
            draw_year(0);
            draw_country(0);
            draw_experience(0);
            intro.innerHTML = "This is the first scene. "
                + "<br>It shows charts with 0 USD as minimum salaries. "
                + "<br>In this scene, you could view all data information since none salary filter is applied in this scene. "
                + "<br>Both Year vs Percentage of People and Experience Level vs Percentage of People charts are showing 100% in every categories. "
                + "<br>In Count of People vs Country chart, it is quite easy to find out the United States has the largest amount data science jobs in the overall dataset. "
                + "<br>You could find more information in the annotations below.";
            clicktimes++;
        } else if (clicktimes == 6) { //second scene
            input_element.value = 190;
            output_element.value = 190;
            draw_year(190);
            draw_country(190);
            draw_experience(190);
            intro.innerHTML = "This is the second scene. "
                + "<br>It shows charts with 190K USD as minimum salaries. "
                + "<br>In Year vs Percentage of People chart, 2022 has more percentage of people whose salaries are above or equal to 190K USD than the other years. "
                + "<br>In Experience level vs Percentage of People chart, Executive-level / Director has more percentage of people whose salaries are above or equal to 190K USD than the other levels. "
                + "<br>In Count of People vs Country chart, United States has more people whose salaries are above or equal to 190K USD than the other countries. "
                + "<br>Therefore, an Executive-level / Director level job in the United States in 2022 is easier to achieve above 190K USD salary. "
                + "<br>You could find more information in the annotations below.";
            clicktimes++;
        }else if (clicktimes == 7) { //third scene
            input_element.value = 300;
            output_element.value = 300;
            draw_year(300);
            draw_country(300);
            draw_experience(300);
            intro.innerHTML = "This is the third scene. "
                + "<br>It shows charts with 300K USD as minimum salaries. "
                + "<br>Different from previous scene, in Year vs Percentage of People chart, 2020 has more percentage of people whose salaries are above or equal to 300K USD than the other years. "
                + "<br>In Experience level vs Percentage of People chart, Executive-level / Director still has more percentage of people whose salaries are above or equal to 300K USD than the other levels. "
                + "<br>In Count of People vs Country chart, United States is the only country has jobs which salaries are above or equal to 300K USD. "
                + "<br>Therefore, an Executive-level / Director level job in the United States in 2020 is easier to achieve above 300K USD salary. "
                + "<br>You could find more information in the annotations below.";
            clicktimes++;
        }else if (clicktimes == 8) {
            input_element.value = 0;
            output_element.value = 0;
            draw_year(0);
            draw_country(0);
            draw_experience(0);
            intro.innerHTML ="Now you could play around the slider bar by yourself."
            +"<br><b>NOTE: You could hover over the bars in different charts to view more data information.</b>"
            btn.innerHTML = "Replay";
            input_element.disabled = false;
            clicktimes = 0;
        }
    }


    function add_annotations(min_salary, type) {
        if (type == "year") {
            // remove annotations
            year_svg.selectAll("#my_annotations").remove()
            var year_label, year_title = "";
            var x, y, dy, dx, wrap, padding = 0;
            if (min_salary == 0) {
                year_title = "0K USD Year VS Percentage of People Chart:";
                year_label = "The Percentage of people in every year is 100%.";
                x = 600;
                y = 250;
                dy = 40;
                dx = 100;
                wrap = 400;
                padding = 10;
            } else if(min_salary > 0 && min_salary <= 210){
                year_title = "0K to 210K USD Year VS Percentage of People Chart:";
                year_label = "The Percentage of people in 2022 is always more than the other years, "
                + "which indicates that a data science job in 2022 is easy to be above 0K to 210K USD salary.";
                x = 0;
                y = 35;
                dy = 230;
                dx = 200;
                wrap = 400;
                padding = 10;
            }else if(min_salary > 210){
                year_title = "Above 210K USD Year VS Percentage of People Chart:";
                year_label = "The Percentage of people in 2020 is always more than the other years, "
                + "which indicates that a data science job in 2020 is easy to be above 210K USD salary.";
                x = 0;
                y = 170;
                dy = 90;
                dx = 200;
                wrap = 400;
                padding = 10;
            }
            const year_annotations = [
                {
                    note: {
                        label: year_label,
                        title: year_title,
                        align: "middle",  // try right or left
                        wrap: wrap,  // try something smaller to see text split in several lines
                        padding: padding  // More = text lower
                    },
                    color: ["red"],
                    x: x,
                    y: y,
                    dy: dy,
                    dx: dx
                }
            ]
            // Add annotation to the chart
            const makeYearAnnotations = d3.annotation()
                .annotations(year_annotations)
            year_svg
                .append("g")
                .call(makeYearAnnotations)
                .attr("id", "my_annotations")
                .attr("font-size", "16px");
        } else if (type == "experience") {
            // remove annotations
            experience_svg.selectAll("#my_annotations").remove()
            var experience_label, experience_title = "";
            var x, y, dy, dx, wrap, padding = 0;
            if (min_salary == 0) {
                experience_title = "0K USD Experience Level VS Percentage of People Chart:";
                experience_label = "The Percentage of people in every experience level is 100%.";
                x = 560;
                y = 250;
                dy = 40;
                dx = 150;
                wrap = 400;
                padding = 10;
            }else if(min_salary > 0 && min_salary <= 210){
                experience_title = "0K to 210K USD Experience Level VS Percentage of People Chart:";
                experience_label = "The Percentage of people in Executive-level / Director is always more than the other experience levels, "
                + "which indicates that Executive-level / Director jobs are easier to achieve salaries above 0K to 210K in USD.";
                x = 0;
                y =180;
                dy = 90;
                dx = 230;
                wrap = 460;
                padding = 10;
            }else if(min_salary > 210){
                experience_title = "Above 210K USD Experience Level VS Percentage of People Chart:";
                experience_label = "The Percentage of people in Executive-level / Director is always more than the other experience levels, "
                + "which indicates that Executive-level / Director jobs are easier to achieve salaries above 210K in USD.";
                x = 0;
                y =180;
                dy = 90;
                dx = 230;
                wrap = 460;
                padding = 10;
            }
            const experience_annotations = [
                {
                    note: {
                        label: experience_label,
                        title: experience_title,
                        align: "middle",  // try right or left
                        wrap: wrap,  // try something smaller to see text split in several lines
                        padding: padding   // More = text lower
                    },
                    color: ["red"],
                    x: x,
                    y: y,
                    dy: dy,
                    dx: dx
                }
            ]
            // Add annotation to the chart
            const makeExperienceAnnotations = d3.annotation()
                .annotations(experience_annotations)
            experience_svg
                .append("g")
                .call(makeExperienceAnnotations)
                .attr("id", "my_annotations")
                .attr("font-size", "16px");
        } else if (type == "country") {
            // remove annotations
            country_svg.selectAll("#my_annotations").remove()
            var country_label, country_title = "";
            var x, y, dy, dx, wrap, padding = 0;
            if (min_salary == 0) {
                country_title = "0K USD Count of People VS Country Chart:";
                country_label = "United states has the most amount of people whose salaries are more than or equal to 0k, which are 355. "
                    + "For more information, you could hover over the bar chart to see more details.";
                x = 2520;
                y = 710;
                dy = -400;
                dx = -400;
                wrap = 350;
                padding = 20;
            }else if(min_salary > 0 && min_salary <= 210){
                country_title = "0K to 210K USD Count of People VS Country chart:";
                country_label = "United States always has more people whose salaries are more than or equal to 0K to 210K USD than the other countries, "
                + "which indicates that a data science job in the United States is easy to achieve salaries above 0K to 210K USD";
                x = 2520;
                y = 710;
                dy = -400;
                dx = -400;
                wrap = 400;
                padding = 20;
            }else if(min_salary > 210){
                country_title = "Above 210K USD Count of People VS Country chart:";
                country_label = "United States always has more people whose salaries are more than 210K USD than the other countries,"
                + "which indicates that a data science job in the United States is easy to achieve salaries above 210K USD";
                x = 2520;
                y = 710;
                dy = -400;
                dx = -400;
                wrap = 400;
                padding = 20;
            }
            const country_annotations = [
                {
                    note: {
                        label: country_label,
                        title: country_title,
                        align: "middle",  // try right or left
                        wrap: wrap,  // try something smaller to see text split in several lines
                        padding: padding   // More = text lower
                    },
                    color: ["red"],
                    x: x,
                    y: y,
                    dy: dy,
                    dx: dx
                }
            ]
            // Add annotation to the chart
            const markCountryAnnotations = d3.annotation()
                .annotations(country_annotations)
            country_svg
                .append("g")
                .call(markCountryAnnotations)
                .attr("id", "my_annotations")
                .attr("font-size", "20px");
        }
    }

    var slider = document.getElementById("salary");
    slider.disabled = true;
    draw_year(0);
    draw_country(0);
    draw_experience(0);
})
