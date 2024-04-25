// Function to convert Django duration format to seconds
function convertDurationToSeconds(duration) {
    var parts = duration.split(':');
    var hours = parseInt(parts[0]) || 0;
    var minutes = parseInt(parts[1]) || 0;
    var seconds = parseInt(parts[2]) || 0;

    return hours * 3600 + minutes * 60 + seconds;
}

var testDuration = convertDurationToSeconds(document.getElementById('timer').getAttribute('data-duration'));
// var testDuration = 18;
var timeAlert = Math.round(testDuration / 6);

function printDuration() {
    console.log(testDuration)
}

// Function to update the timer
function updateTimer() {
    // console.log(testDuration)
    var minutes = Math.floor(testDuration / 60);
    var seconds = testDuration % 60;

    // Display the remaining time in the format MM:SS
    var timerDisplay = minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
    document.getElementById('timer').innerText = timerDisplay;

    // Decrease the remaining time
    testDuration--;

    // Check if the time is up
    if (testDuration < 0) {
        // Perform actions when the time is up
        // ...
        alert("Time's up");
        // Stop the timer (optional)
        clearInterval(timerInterval);
        sendAnswer();
    }

    if (testDuration == timeAlert) {
        // alert("Time left: " + testDuration);
        $('#modal').modal('show');
        $('.modal-backdrop').removeClass("modal-backdrop");
        document.getElementById('contentAlert').innerHTML = '<h5>Time left: ' + timeAlert + ' seconds left<h5>';
    }

    if (testDuration == (timeAlert - 5)) {
        $('#modal').modal('hide');
    }
}

// Update the timer every second
var timerInterval = setInterval(updateTimer, 1000);

// Initial call to start the timer
updateTimer();

var id_do_test = document.getElementById("id-do-test").value;

$(window).bind('beforeunload', function(){
    $.ajax({
        url: "/test/save-test/" + id_do_test,
        type: "POST",
        async: false,
        cache: false,
        timeout: 30000,
        data: JSON.stringify(testDuration),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        headers: {
            'X-CSRFToken': getCSRFTokenValue(),
        },
        success: function (data) {
            console.log(data)
        },
        error: function (data) {
            var errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
            errorModal.show();
        },
    });
});