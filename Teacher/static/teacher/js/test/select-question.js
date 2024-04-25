var i = 0;

//document.addEventListener('DOMContentLoaded', function() {
//    var id_test = document.getElementById("id-test").value;
//    $.ajax({
//        url: "/teacher/edit-test/" + id_test + "/list-question",
//        type: "GET",
//        async: false,
//        cache: false,
//        timeout: 5000,
//        contentType: "application/json; charset=utf-8",
//        dataType: "json",
//        headers: {
//            'X-CSRFToken': getCSRFTokenValue(),
//        },
//        success: function (data) {
//            // console.log(data);
//            var selectQuestion = $('#selectQuestion');
//            selectQuestion.empty(); // Clear previous options (if any)
//            selectQuestion.append('<option disabled selected value>--Select question--</option>');
//            data.all_question.forEach(function(question) {
//                // console.log("Name: " + question.name);
//                selectQuestion.append('<option data-tokens="' + question.name + '" value="' + question.id + '">' + question.name + '</option>');
//            });
//            // Refresh the Bootstrap Select plugin after appending options
//            selectQuestion.selectpicker('refresh');
//        },
//        error: function (xhr, ajaxOptions, thrownError) {
//            console.log(xhr.status);
//            console.log(thrownError);
//            if (xhr.textStatus == 'timeout') {
//                this.tryCount++;
//                if (this.tryCount <= this.retryLimit) {
//                    // try again
//                    $.ajax(this);
//                    return;
//                }
//                return;
//            }
//        },
//    });
//});

var numQues = document.getElementById("numberOfQuestions").value;

//document.getElementById("selectQuestion").addEventListener("change", function() {
//    var questionDivs = document.getElementsByClassName("card-body");
//    // if (numQues <= questionDivs.length) {
//    if (1 == 2) {
//        alert("The number of questions is beyond the limit!");
//    } else {
//        var selectedOption = this.options[this.selectedIndex].text;
//        var selectedValue = this.options[this.selectedIndex].value;
//        var selectedOptionDiv = document.getElementById("questionOption");
//        selectedOption.disabled = true;
//        // selectedOptionDiv.textContent = "Selected option: " + selectedOption;
//        selectedOptionDiv.innerHTML += '<div class="card-body d-flex justify-content-between"><h6 class="" id=' + selectedValue + '>' + selectedOption + '</h6><a id="deleteQuestion" class="mr-3 btn btn-danger" role="button"><i class="fa fa-trash"></i></a></div>';
//    }
//});

$(document).on('click', '#deleteQuestion', function() {
    // Get the parent div element (card-body) of the clicked delete button
    // Log the element matched by the selector to see if it's correct
    // console.log($(this).prev().attr("id"));

    // Check if the id attribute is set on the h6 element
    var id_question = $(this).prev().attr("id");
    // console.log("ID:", id_question);
    var name = document.getElementById(id_question).innerHTML;
    console.log(name);
    var cardBody = $(this).closest('.card-body');
    // console.log(cardBody);
    // Remove the parent div element from the DOM
    cardBody.remove();

    var id_test = document.getElementById("id-test").value;
    $.ajax({
        url: "/teacher/edit-test/" + id_test + "/delete-question",
        type: "POST",
        async: false,
        cache: false,
        timeout: 5000,
        data: JSON.stringify(id_question),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        headers: {
            'X-CSRFToken': getCSRFTokenValue(),
        },
        success: function (data) {
            // console.log(data);
            // table.ajax.reload();
            table.row.add({
                id: id_question,
                rtf: name,
            }).draw(false);
            var num = $("#numberOfQuestions").val();
            $("#numberOfQuestions").prop("value", num - 1);
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
});

function getQuestions() {
    var data = [];
    var questionDivs = document.getElementsByClassName("card-body");
    console.log(questionDivs);
    for (var i = 0; i < questionDivs.length; i++) {
        var questionDiv = questionDivs[i];
        var questionId = questionDiv.querySelector("h6").id;
        console.log(questionId);
        data.push({
            questionId: questionId,
        })
    }

    return JSON.stringify(data);
}

function updateQuestions() {
    // var questionDivs = document.getElementsByClassName("card-body");
    // if (numQues > questionDivs.length) {
    if (1 == 2) {
        alert("The number of questions is insufficient");
    } else {
        var id_test = document.getElementById("id-test").value;
        $.ajax({
            url: "/teacher/edit-test/" + id_test + "/update-question",
            type: "POST",
            async: false,
            cache: false,
            timeout: 5000,
            data: getQuestions(),
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
                     location.reload();
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
}
