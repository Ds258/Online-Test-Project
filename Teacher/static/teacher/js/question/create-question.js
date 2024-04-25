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

function submitQuestion() {
    // Get all question divs
    var questionDivs = document.getElementsByClassName("question");
    // console.log(questionDivs);
    var questions = [];
    var data = [];
    var subject = $("#inputSubject").find(":selected").attr("id");
    // Iterate over each question div
    for (var i = 0; i < questionDivs.length; i++) {
        var questionDiv = questionDivs[i];
        var questionText = questionDiv.getElementsByTagName("textarea")[0].value;
        var questionHint = questionDiv.getElementsByTagName("textarea")[1].value;
        var questionSolution = questionDiv.getElementsByTagName("textarea")[2].value;
        // Get all answer inputs within the current question div
        var answerInputs = questionDiv.getElementsByClassName("answer");
        console.log(answerInputs);
        var answers = [];

        var correctAnswerIndex = 0;

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

        questions.push({
            question: questionText,
            answers: answers,
            hint: questionHint,
            solution: questionSolution,
            correctAnswerIndex: correctAnswerIndex,
        });
    }
    data.push({
        question: questions,
        subject: subject,
    });
    // console.log(data);
    sendData(JSON.stringify(data));
}

function sendData(data) {
    // console.log("Print " + data)
    $.ajax({
        url: "/teacher/create-question/",
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
                window.location.href = '/teacher/list-question/';
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
