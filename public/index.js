d3.csv("dataset.csv").then(function(data) {

  const processAgeData = (data) => {
    data.forEach(d => {
      const [day, month, year] = d.Age.split('/').map(Number);
      const birthDate = new Date(year, month - 1, day);
      const today = new Date();
      d.Age = today.getFullYear() - birthDate.getFullYear();
    });
  };

  const createAgeDistributionChart = (data) => {
    const width = 500;
    const height = 400;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const radius = Math.min(width, height) / 2;
    const minAge = Math.floor(d3.min(data, d => +d.Age));
    const maxAge = Math.ceil(d3.max(data, d => +d.Age)) + 1;

    const createBins = (data, minAge, maxAge, numBins) => {
      const binWidth = Math.ceil((maxAge - minAge) / numBins);
      const bins = [];
      for (let i = 0; i < numBins; i++) {
        const x0 = minAge + i * binWidth;
        const x1 = x0 + binWidth;
        const binData = data.filter(d => {
          const age = +d.Age;
          return age >= x0 && age < x1;
        });
        bins.push({ x0: x0, x1: x1, length: binData.length });
      }
      return bins;
    };

    const bins = createBins(data, minAge, maxAge, 10);
    const x = d3.scaleLinear().domain([minAge, maxAge]).range([0, width]);
    const y = d3.scaleLinear().domain([0, d3.max(bins, d => d.length)]).range([height, 0]);

    const ageChart = d3.select("#age-chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom + 10)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const colorAge = "#1f77b4";
    ageChart.selectAll(".bar")
      .data(bins)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.x0))
      .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
      .attr("y", d => y(d.length))
      .attr("height", d => height - y(d.length))
      .attr("fill", colorAge)
      .on("mouseover", function(event, d) {
        d3.select(this).transition().duration(200).style("opacity", 0.7);
        tooltip.transition().duration(200).style("opacity", .9);
        tooltip.html(`Age Range: ${d.x0} - ${d.x1}<br>Count: ${d.length}`)
          .style("left", (event.pageX + 5) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function(d) {
        d3.select(this).transition().duration(200).style("opacity", 1);
        tooltip.transition().duration(500).style("opacity", 0);
      });

    const xAxis = d3.axisBottom(x).tickFormat(d3.format(".0f")).ticks(6);
    ageChart.append("g").attr("class", "axis axis--x").attr("transform", `translate(0,${height})`).call(xAxis);
    const yAxis = d3.axisLeft(y).ticks(5);
    ageChart.append("g").attr("class", "axis axis--y").call(yAxis);
    ageChart.append("text").attr("x", width / 2).attr("y", height + margin.bottom).attr("text-anchor", "middle").text("Age");
    ageChart.append("text").attr("transform", "rotate(-90)").attr("y", 0 - margin.left).attr("x", 0 - (height / 2)).attr("dy", "1em").attr("text-anchor", "middle").text("Number of Students");
  };

  const createAcademicScoresChart = (data) => {
    const width = 500;
    const height = 400;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const scoresData = data.map(d => ({
      index: data.indexOf(d),
      math: +d["score en mathématiques"],
      arabic: +d["score en langue arabe"],
      firstLanguage: +d["score en première langue"]
    }));

    const scoresChart = d3.select("#academic-scores-chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom + 20)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const xScaleScores = d3.scaleLinear().domain([0, d3.max(scoresData, d => d.index)]).range([0, width]);
    const yScaleScores = d3.scaleLinear().domain([0, d3.max(scoresData, d => Math.max(d.math, d.arabic, d.firstLanguage))]).range([height, 0]);

    const lineMath = d3.line().x(d => xScaleScores(d.index)).y(d => yScaleScores(d.math)).curve(d3.curveMonotoneX);
    const lineArabic = d3.line().x(d => xScaleScores(d.index)).y(d => yScaleScores(d.arabic)).curve(d3.curveMonotoneX);
    const lineFirstLanguage = d3.line().x(d => xScaleScores(d.index)).y(d => yScaleScores(d.firstLanguage)).curve(d3.curveMonotoneX);

    const colorMath = "blue";
    const colorArabic = "green";
    const colorFirstLanguage = "red";

    scoresChart.append("path").datum(scoresData).attr("class", "line").attr("d", lineMath).style("stroke", colorMath).style("fill", "none")
      .on("mouseover", function() { d3.select(this).style("stroke-width", "3px"); })
      .on("mouseout", function() { d3.select(this).style("stroke-width", "1.5px"); });

    scoresChart.append("path").datum(scoresData).attr("class", "line").attr("d", lineArabic).style("stroke", colorArabic).style("fill", "none")
      .on("mouseover", function() { d3.select(this).style("stroke-width", "3px"); })
      .on("mouseout", function() { d3.select(this).style("stroke-width", "1.5px"); });

    scoresChart.append("path").datum(scoresData).attr("class", "line").attr("d", lineFirstLanguage).style("stroke", colorFirstLanguage).style("fill", "none")
      .on("mouseover", function() { d3.select(this).style("stroke-width", "3px"); })
      .on("mouseout", function() { d3.select(this).style("stroke-width", "1.5px"); });

    const addTooltipCircles = (lineData, color, subject) => {
      scoresChart.selectAll(`.dot-${subject}`)
        .data(lineData)
        .enter().append("circle")
        .attr("class", `dot-${subject}`)
        .attr("cx", d => xScaleScores(d.index))
        .attr("cy", d => yScaleScores(d[subject]))
        .attr("r", 2)
        .style("fill", color);
    };

    addTooltipCircles(scoresData, "blue", "math");
    addTooltipCircles(scoresData, "green", "arabic");
    addTooltipCircles(scoresData, "red", "firstLanguage");

    scoresChart.append("g").attr("class", "axis axis--x").attr("transform", "translate(0," + height + ")").call(d3.axisBottom(xScaleScores));
    scoresChart.append("g").attr("class", "axis axis--y").call(d3.axisLeft(yScaleScores));
    scoresChart.append("text").attr("transform", "rotate(-90)").attr("y", 0 - margin.left).attr("x", 0 - (height / 2)).attr("dy", "1em").attr("text-anchor", "middle").text("Score");
    scoresChart.append("text").attr("x", width / 2).attr("y", height + margin.bottom + 10).attr("text-anchor", "middle").text("Student Index");

    // Create the legend
    const legend = scoresChart.append("g")
      .attr("transform", `translate(${width - 130}, 20)`); // Position the legend

    // Define legend items
    const legendItems = [
      { color: colorMath, label: "Math" },
      { color: colorArabic, label: "Arabic" },
      { color: colorFirstLanguage, label: "First Language" }
    ];

    // Append legend items
    legendItems.forEach((item, index) => {
      const legendItem = legend.append("g")
        .attr("transform", `translate(0, ${index * 20})`);

      legendItem.append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .attr("fill", item.color);

      legendItem.append("text")
        .attr("x", 25)
        .attr("y", 12)
        .text(item.label);
    });
  };

  const createPieChart = (data) => {
    const width = 500;
    const height = 400;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const pieDataInterneExterne = [
      { category: "Interne", value: d3.sum(data, d => d["Interne / Externe"] === "Interne" ? 1 : 0) },
      { category: "Externe", value: d3.sum(data, d => d["Interne / Externe"] === "Externe" ? 1 : 0) }
    ];

    const pieChartInterneExterne = d3.select("#interne-externe-chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + (width / 2 + margin.left - 50) + "," + (height / 2 + margin.top) + ")");

    const colorPie = d3.scaleOrdinal().domain(pieDataInterneExterne.map(d => d.category)).range(["#1f77b4", "#ff7f0e"]);
    const pieInterneExterne = d3.pie().value(d => d.value);
    const arcInterneExterne = d3.arc().innerRadius(0).outerRadius(Math.min(width, height) / 2);

    const arcsInterneExterne = pieChartInterneExterne.selectAll(".arc")
      .data(pieInterneExterne(pieDataInterneExterne))
      .enter().append("g")
      .attr("class", "arc");

    arcsInterneExterne.append("path")
      .attr("d", arcInterneExterne)
      .attr("fill", d => colorPie(d.data.category))
      .on("mouseover", function(event, d) {
        d3.select(this).transition().duration(200).style("opacity", 0.7);
        tooltip.transition().duration(200).style("opacity", .9);
        tooltip.html(`${d.data.category}: ${d.data.value}`)
          .style("left", (event.pageX + 5) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function(d) {
        d3.select(this).transition().duration(200).style("opacity", 1);
        tooltip.transition().duration(500).style("opacity", 0);
      });

    arcsInterneExterne.append("text")
      .attr("transform", d => `translate(${arcInterneExterne.centroid(d)})`)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .text(d => `${d.data.value} (${((d.data.value / d3.sum(pieDataInterneExterne, d => d.value)) * 100).toFixed(1)}%)`);

    const legend = pieChartInterneExterne.append("g").attr("transform", `translate(${Math.min(width, height) / 2 + 20}, 0)`);
    const legendItems = legend.selectAll(".legend-item")
      .data(pieDataInterneExterne)
      .enter().append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(0, ${i * 20})`);

    legendItems.append("rect")
      .attr("x", 0)
      .attr("width", 18)
      .attr("height", 18)
      .attr("fill", d => colorPie(d.category));

    legendItems.append("text")
      .attr("x", 25)
      .attr("y", 9)
      .attr("dy", ".35em")
      .text(d => d.category);
  };

  const createFamilyImpactChart = (data) => {
    const groupedData = d3.group(data, d => d["aide aux devoirs"]);
  
    const processedData =  Array.from(groupedData, ([aideAuxDevoirs, values]) => ({
    category: aideAuxDevoirs,
    totalRepetitions: d3.sum(values, d => +d["Nombre de répitition"]) // Sum the repetitions
  }));
    const margin = {top: 50, right: 50, bottom: 50, left: 50};
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#family-chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .style("font-size", "16px")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleBand()
      .domain(processedData.map(d => d.category))
      .range([0, width])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(processedData, d => d.totalRepetitions)])
      .range([height, 0]);

    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .append("text")
      .attr("x", width / 2)
      .attr("y", 35)
      .attr("fill", "black")
      .style("font-size", "16px")
      .text("Aide aux devoirs");

    svg.append("g")
      .call(d3.axisLeft(yScale))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -30)
      .attr("x", -height / 2)
      .attr("fill", "black")
      .style("font-size", "16px")
      .text("Nombre de Répitition");

    const colorFamily = d3.scaleOrdinal()
      .domain(processedData.map(d => d.category))
      .range(["#c74242", "#59ba54"]);

    svg.selectAll(".bar")
      .data(processedData)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d.category))
      .attr("y", d => yScale(d.totalRepetitions))
      .attr("width", xScale.bandwidth())
      .attr("height", d => height - yScale(d.totalRepetitions))
      .attr("fill", d => colorFamily(d.category))
      .on("mouseover", function(event, d) {
        d3.select(this).transition().duration(200).style("opacity", 0.7);
        tooltip.transition().duration(200).style("opacity", .9);
        tooltip.html(`Category: ${d.category}<br>Repetitions: ${d.totalRepetitions}`)
          .style("left", (event.pageX + 5) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function(d) {
        d3.select(this).transition().duration(200).style("opacity", 1);
        tooltip.transition().duration(500).style("opacity", 0);
      });

    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background", "white")
      .style("border", "1px solid #ccc")
      .style("padding", "5px")
      .style("border-radius", "5px");

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -20)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text("Impact of Family Assistance on Academic Failure");
  };

  processAgeData(data);
  createAgeDistributionChart(data);
  createAcademicScoresChart(data);
  createPieChart(data);
  createFamilyImpactChart(data);
});


