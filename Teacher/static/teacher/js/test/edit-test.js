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

function editTest() {
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

    // console.log("Hat xi" + JSON.stringify(data));
    sendData(JSON.stringify(data));
}

var id_test = document.getElementById("id-test").value;

function sendData(data) {
    // console.log("Print " + data)
    $.ajax({
        url: "/teacher/edit-test/" + id_test,
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
//            $('#statusSuccessModal').on('hidden.bs.modal', function(e) {
//                window.location.href = '/teacher/list-test/';
//            });
            // window.location.href = '/teacher/list-test/';
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


function deleteTest() {
    $.ajax({
        url: "/teacher/delete-test/" + id_test,
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
            // console.log(data);
            window.location.href = '/teacher/list-test/';
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
    window.location.href = "/teacher/list-test/";
});

document.getElementById("okButton").addEventListener("click", function() {
    window.location.href = "/teacher/edit-test/" + id_test;
});

let table = new DataTable('#questionTable', {
    responsive: true,
    ajax: {
        url: '/teacher/edit-test/' + id_test + '/list-question',
        dataSrc: 'all_question', // Specify the key containing the data array
        type: 'GET',
    },
    columns: [
        { 'data': 'id', 'visible': false },
        { 'data': 'rtf' },
        {
            'data': null,
            'defaultContent': '<button class="edit-btn btn btn-primary"><i class="fa-solid fa-pencil"></i></button>',
            'orderable': false
        },
        {
            'data': null,
            'defaultContent': '<button class="add-btn btn btn-info"><i class="fa-solid fa-plus"></i></button>',
            'orderable': false
        }
    ],
    columnDefs: [
        {
            targets: [-2, -1], // Targets the last column
            orderable: false, // Disable sorting on this column
            searchable: true, // Disable searching on this column
        },
    ],
    paging: true,
    select: true,
    lengthMenu: [5, 10, 25, 50, 100],
});


$('#questionTable').on('click', '.add-btn', function() {
    // Get the data of the corresponding row
    var rowData = table.row($(this).closest('tr')).data();

    // Add the data to a list (you can adjust this part based on how you want to display the added rows)
    if (rowData) {
        // Assuming you have a list with id 'selectedRows'
        var html = `
            <div id="question_${rowData.id}" class="card-body d-flex justify-content-between align-items-center">
                <h6 id="${rowData.id}" style="padding-right: 10px">${rowData.rtf}</h6>
                <a id="deleteQuestion" class="mr-3 btn btn-danger" role="button" style="height: 40px; width: 40px;">
                    <i style="color: white;" class="fa fa-trash"></i>
                </a>
            </div>
        `;
        $('#questionOption').append(html);
        table.row($(this).closest('tr')).remove().draw();

        var num = parseInt($("#numberOfQuestions").val());
        $("#numberOfQuestions").prop("value", ++num);
    }
});

$('#questionTable').on('click', '.edit-btn', function() {
    // Get the data of the corresponding row
    var rowData = table.row($(this).closest('tr')).data();

    window.location.href = '/teacher/edit-question/' + rowData.id;
});