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
    // Get the selected test ID
    var testId = $("#selectTest").val();

    // Make the AJAX call
    $.ajax({
        url: "/user/profile/dashboard/" + testId,
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
            // console.log(data);
            // Extract relevant data from responseData for charting
            var chartData = extractChartData(responseData);

            chartData.reverse();
            // Destroy existing chart if it exists
            var existingChart = Chart.getChart("scoreChart");
            if (existingChart) {
                existingChart.destroy();
            }
            // Now you can use chartData to create your chart
            createChart(chartData);
        },
        error: function (xhr, ajaxOptions, thrownError) {
            var existingChart = Chart.getChart("scoreChart");
            if (existingChart) {
                existingChart.destroy();
            }
            console.log(xhr.status);
            console.log(thrownError);
            if (xhr.textStatus == 'timeout') {
                this.tryCount++;
                if (this.tryCount <= this.retryLimit) {
                    // try again
                    $.ajax(this);
                    return;
                }
                return;
            }
        },
    });
}

function extractChartData(responseData) {
    // Extract relevant data from responseData for charting
    // For example, if responseData has an array of objects with properties like id_test, time_start, score, etc.
    // You can extract these properties and format them appropriately for your charting library

    // For demonstration, let's assume we want to create a chart showing scores over time
    var chartData = [];

    // Iterate over all_result array and extract relevant data
    for (var i = 0; i < responseData.length; i++) {
        var result = responseData[i];
        // Assuming each result object has properties like time_start and score
        // Push the relevant data into chartData array
        chartData.push({
            time_start: result.time_start,
            score: result.score
        });
    }

    return chartData;
}

function createChart(chartData) {
    const ctx = document.getElementById('scoreChart');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.map(function(data) { return data.time_start; }),
            datasets: [
                {
                  label: 'Score',
                  data: chartData.map(function(data) { return data.score; }), // Samples.utils.numbers({count: 7, min: 0, max: 10})
                  borderColor: window.chartColors.red,
                  backgroundColor: Samples.utils.transparentize(255, 99, 132, 0.5),
                  pointStyle: 'circle',
                  pointRadius: 10,
                  pointHoverRadius: 15
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                  title: {
                    display: true,
                    text: (ctx) => 'Point Style: ' + ctx.chart.data.datasets[0].pointStyle,
                  }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    suggestedMin: 0,  // Set the minimum value for the y-axis
                    suggestedMax: 10, // Set the maximum value for the y-axis
                }
            },
        }
    });
}

selectTest();

