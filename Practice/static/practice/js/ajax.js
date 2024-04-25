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

function getAnswers() {
    var result = [];
    var choices = document.querySelectorAll('input[type="radio"]:checked');
    var id_do_test = document.getElementById("id-do-test").value;
    var test_id = document.getElementById("test-id").value;
    result.push({
        id_do_test: id_do_test,
        test_id: test_id,
    })

    choices.forEach(function (choice) {
        result.push({
//            test_id: choice.name.split('--')[0],
            question_id: choice.name.split('--')[1], // Extract question id from the input name
            choice_id: choice.value,
        });
    });
    // console.log(JSON.stringify(result));
    return JSON.stringify(result);
}

function printHelloWorld() {
    console.log("U thi anh da on hon")
}

var id_do_test = document.getElementById("id-do-test").value;
var URL = "/practice/result/" + id_do_test;

function sendAnswer() {
//    var csrftoken = getCSRFTokenValue();

    $.ajax({
        url: URL,
        type: "POST",
        async: false,
        cache: false,
        timeout: 30000,
        data: getAnswers(),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        headers: {
            'X-CSRFToken': getCSRFTokenValue(),
        },
        success: function (data) {
            console.log(data);
            $('#test').html("<h5>Score: " + data.score + "<h5>")
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
            // $.alert({
            //     title: 'Error [' + xhr.status + '] ' + thrownError,
            //     content: xhr.responseText,
            // });
        },
    });
}
