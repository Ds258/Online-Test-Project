// Function to convert Django duration format to seconds
function convertDurationToSeconds(duration) {
    var parts = duration.split(':');
    var hours = parseInt(parts[0]) || 0;
    var minutes = parseInt(parts[1]) || 0;
    var seconds = parseInt(parts[2]) || 0;

    return hours * 3600 + minutes * 60 + seconds;
}

var testDuration = convertDurationToSeconds(document.getElementById('timer').getAttribute('data-duration'));
// var testDuration = 3
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
        document.getElementById('contentAlert').innerHTML = '<h3>Time left: ' + timeAlert + ' minutes<h3>';
    }

    if (testDuration == (timeAlert - 5)) {
        $('#modal').modal('hide');
    }
}

// Update the timer every second
var timerInterval = setInterval(updateTimer, 1000);

// Initial call to start the timer
updateTimer();