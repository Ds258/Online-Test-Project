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

function editQuestion() {
    // Get all question divs
    var data = [];

    var is_active = false;
    if ($('#checkActive').is(":checked")) {
        is_active = true;
    }

    data.push({
        name: $("#questionName").val(),
        subject: $("#inputSubject").find(":selected").attr("id"),
        hint: $("#hintQuestion").val(),
        solution: $("#solutionQuestion").val(),
        is_active: is_active,
    });

    console.log(data);

    var answerInputs = document.getElementsByClassName("answer");
    // console.log(answerInputs);
    var answers = [];
    var answersId = [];
    var answerTrue = 0;
    // Iterate over each answer input
    for (var j = 0; j < answerInputs.length; j++) {
        var answer = answerInputs[j].value;
        answers.push(answer);
        var id = answerInputs[j].id
        var radioBtn = document.getElementById("radio-" + id);
        console.log(id);
        answersId.push(id);
        if (radioBtn.checked) {
            answerTrue = id;
            console.log("Dmm: " + id);
        }
    }

    data.push({
        answers: answers,
        answersId: answersId,
        answerTrue: answerTrue,
    });

    // console.log("Hat xi" + JSON.stringify(data));
    sendData(JSON.stringify(data));
}

var id_question = document.getElementById("id-question").value;

function sendData(data) {
    // console.log("Print " + data)
    $.ajax({
        url: "/teacher/edit-question/" + id_question,
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

function deleteQuestion() {
    $.ajax({
        url: "/teacher/delete-question/" + id_question,
        type: "POST",
        async: false,
        cache: false,
        timeout: 5000,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        headers: {
            'X-CSRFToken': getCSRFTokenValue(),
        },
        success: function (data) {
            console.log(data);
            window.location.href = "/teacher/list-question/";
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

document.getElementById("backButton").addEventListener("click", function() {
    window.location.href = "/teacher/list-question/";
});

document.getElementById("okButton").addEventListener("click", function() {
    location.reload();
});

var editorQuestion = new RichTextEditor("#questionName");

var editorHint = new RichTextEditor("#hintQuestion");

var editorSolution = new RichTextEditor("#solutionQuestion");

$('.answer').each(function() {
    var editorAnswer = new RichTextEditor(this);
});