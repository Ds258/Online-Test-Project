// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#858796';

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function getCSRFTokenValue() {
    const csrftoken = getCookie('csrftoken');
    // console.log(csrftoken);
    return csrftoken;
}

$(document).ready(function () {
    selectTest();
    // Bind the selectTest function to the change event of the select element
    $("#selectTest").change(selectTest);
});

function selectTest() {
    var existingChart = Chart.getChart("myPieChart");
    if (existingChart) {
        existingChart.destroy();
    }
    // Get the selected test ID
    var testId = $("#selectTest").val();

    // Make the AJAX call
    $.ajax({
        url: "/teacher/dashboard/" + testId,
        type: "GET",
        async: false,
        cache: false,
        timeout: 30000,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        headers: {
            'X-CSRFToken': getCSRFTokenValue(),
        },
        success: function (data) {
            // Assuming responseData has a structure like { "all_result": [...] }
            var responseData = data["dash_result"];
            var average_score = data["average_score"];
            var time_test = data["time_test"];
            document.getElementById("time-test").innerHTML = time_test;
            document.getElementById("average-score").innerHTML = average_score;
            console.log(data);
            // Extract relevant data from responseData for charting
            var chartData = extractChartData(responseData);

            // Destroy existing chart if it exists
            // var existingChart = Chart.getChart("myPieChart");
            // if (existingChart) {
            //    existingChart.destroy();
            // }
            // Now you can use chartData to create your chart
            createChart(chartData);
        },
        error: function (data) {
            console.log("Error:", data);
        },
    });
}

function extractChartData(responseData) {
    // Extract relevant data from responseData for charting
    // For example, if responseData has an array of objects with properties like id_test, time_start, score, etc.
    // You can extract these properties and format them appropriately for your charting library

    // For demonstration, let's assume we want to create a chart showing scores over time
    var totalScores = responseData.length;
    var chartData = {
        high: 0,
        medium: 0,
        low: 0
    };

    console.log("Hoho 1");

    // Iterate over all_result array and categorize scores into High, Medium, Low
    for (var i = 0; i < totalScores; i++) {
        var result = responseData[i];
        // Assuming each result object has a property 'score'
        // Categorize the score into High, Medium, Low based on score ranges
        if (result.score >= 8) {
            chartData.high++;
        } else if (result.score >= 5 && result.score < 8) {
            chartData.medium++;
        } else {
            chartData.low++;
        }
    }

    // Calculate percentages
    chartData.highPercentage = (chartData.high / totalScores) * 100;
    chartData.mediumPercentage = (chartData.medium / totalScores) * 100;
    chartData.lowPercentage = (chartData.low / totalScores) * 100;

    return chartData;
}

function createChart(chartData) {
    // Pie Chart Example
    var ctx = document.getElementById("myPieChart");
    var myPieChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ["High", "Medium", "Low"],
        datasets: [{
          data: [chartData.highPercentage, chartData.mediumPercentage, chartData.lowPercentage],
          backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc'],
          hoverBackgroundColor: ['#2e59d9', '#17a673', '#2c9faf'],
          hoverBorderColor: "rgba(234, 236, 244, 1)",
        }],
      },
      options: {
        maintainAspectRatio: false,
        tooltips: {
          backgroundColor: "rgb(255,255,255)",
          bodyFontColor: "#858796",
          borderColor: '#dddfeb',
          borderWidth: 1,
          xPadding: 15,
          yPadding: 15,
          displayColors: false,
          caretPadding: 10,
        },
        legend: {
          display: false
        },
        cutoutPercentage: 80,
      },
    });
}

