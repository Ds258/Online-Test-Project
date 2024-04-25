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

function timeStringToSeconds(timeString) {
    // Split the time string into hours, minutes, and seconds
    // console.log("Hat xi" + timeString);
    var parts = timeString.split(':');
    var hours = parseInt(parts[0], 10);
    var minutes = parseInt(parts[1], 10);
    var seconds = parseInt(parts[2], 10);

    // Calculate the total number of seconds
    var totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
    return totalSeconds;
}

function submitTest() {
    // Get all question divs
    var questionDivs = document.getElementsByClassName("question");
    console.log(questionDivs);
    var questions = [];
    var data = [];
    var duration = timeStringToSeconds($("#timeDuration").val());
    var is_practice = false;
    if ($('#checkPractice').is(":checked")) {
        is_practice = true;
    }

    var is_active = false;
    if ($('#checkActive').is(":checked")) {
        is_active = true;
    }
    data.push({
        name: $("#nameTestInput").val(),
        description: $("#descriptionTextarea").val(),
        subject: $("#inputSubject").find(":selected").attr("id"),
        numbers_of_questions: $("#numberOfQuestions").val(),
        duration: duration,
        is_practice: is_practice,
        is_active: is_active,
    });

    console.log("Hat xi" + JSON.stringify(data));

    // Iterate over each question div
    for (var i = 0; i < questionDivs.length; i++) {
        var questionDiv = questionDivs[i];
        var questionText = questionDiv.getElementsByTagName("textarea")[0].value;
        var questionHint = questionDiv.getElementsByTagName("textarea")[1].value;

        // Get all answer inputs within the current question div
        var answerInputs = questionDiv.getElementsByClassName("answer");
        console.log(answerInputs);
        var answers = [];

        // Iterate over each answer input
        for (var j = 0; j < answerInputs.length; j++) {
            var answer = answerInputs[j].value;
            answers.push(answer);

            var radioBtn = document.getElementById("answerRadio" + (i + 1) + "_" + (j + 1));
            // console.log(radioBtn);
            var answerIndex = radioBtn.value;
            console.log("Answer index: " + answerIndex);
            if (radioBtn.checked) {
                correctAnswerIndex = answerIndex;
                // console.log("Dmm: " + correctAnswerIndex);
            }
        }

        // Construct the question object
        var question = {
            question: questionText,
            answers: answers,
            hint: questionHint,
            correctAnswerIndex: correctAnswerIndex,
        };

        // Add the question object to the questions array
        questions.push(question);
    }
    data.push({
        question: questions,
    });
    console.log(data);
    sendData(JSON.stringify(data));
}

function sendData(data) {
    console.log("Print " + data)
    $.ajax({
        url: "/teacher/create-quick-test/",
        type: "POST",
        async: false,
        cache: false,
        timeout: 5000,
        data: data,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        headers: {
            'X-CSRFToken': getCSRFTokenValue(),
        },
        success: function (data) {
            console.log(data);
            var successModal = new bootstrap.Modal(document.getElementById('statusSuccessModal'));
            successModal.show();
            $('#statusSuccessModal').on('hidden.bs.modal', function(e) {
                window.location.href = '/teacher/list-test/';
            });
        },
        error: function (xhr, ajaxOptions, thrownError) {
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