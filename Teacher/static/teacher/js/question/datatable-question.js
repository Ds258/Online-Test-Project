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

let table = $("#dataTable").DataTable({
    layout: {
        topStart: {
            buttons: [
                {
                    text: 'Create question',
                    action: function (e, dt, node, config) {
                        window.location.href = '/teacher/create-question/';
                    }
                },

            ]
        }
    },
    "processing": true,
    "serverSide": true,
    "ajax": {
        "url": '/teacher/list-question/ajax',
        "dataSrc": 'data', // Specify the key containing the data array
        "type": 'GET',
    },
    columns: [
        { 'data': 'id', 'visible': false },
        { 'data': 'name' },
        { 'data': 'subject' },
        { 'data': 'created_at' },
        { 'data': 'is_active' },
        {
            'data': null,
            'defaultContent': '<button class="edit-btn btn btn-primary"><i class="fa-solid fa-pencil"></i></button>',
            'orderable': false
        },
        {
            'data': null,
            'defaultContent': '<button class="delete-btn btn btn-danger"><i class="fa-solid fa-trash"></i></button>',
            'orderable': false
        }
    ],
    columnDefs: [
        {
            targets: [-5, -2, -1], // Targets the last column
            orderable: false, // Disable sorting on this column
            searchable: true, // Disable searching on this column
        },

    ],
    "paging": true,
    "select": true,
    "search": false,
    "autoWidth": true,
//    "language" : {
//        "decimal":        "",
//        "emptyTable":     "Khong co du lieu",
//        "info":           "Hien thi _START_ den _END_ cua _TOTAL_ muc",
//        "infoEmpty":      "Hien thi 0 den 0 cua 0 muc",
//        "infoFiltered":   "(filtered from _MAX_ total entries)",
//        "infoPostFix":    "",
//        "thousands":      ",",
//        "lengthMenu":     "Hien thi _MENU_ muc",
//        "loadingRecords": "Loading...",
//        "processing":     "",
//        "search":         "Tim kiem:",
//        "zeroRecords":    "No matching records found",
//        "paginate": {
//            "first":      "dau",
//            "last":       "cuoi",
//            "next":       "tiep",
//            "previous":   "truoc"
//        },
//        "aria": {
//            "orderable":  "Order by this column",
//            "orderableReverse": "Reverse order this column"
//        }
//    },
});

// Add event listener for edit buttons
$('#dataTable').on('click', '.edit-btn', function() {
    var data = table.row($(this).parents('tr')).data();
    window.location.href = '/teacher/edit-question/' + data.id;
    // Handle edit action using data.id or other relevant data
});

// Add event listener for delete buttons
$('#dataTable').on('click', '.delete-btn', function() {
    var rowData = table.row($(this).parents('tr')).data();
    var id = rowData.id;
    var row = table.row($(this).parents('tr'));

    // Open a confirmation dialog
    if (confirm('Are you sure you want to delete this record?')) {
        // Perform deletion here (e.g., via AJAX)
        // After successful deletion, remove the row from the DataTable
        row.remove().draw(); // Remove the row from the DataTable and redraw the table
        $.ajax({
            url: "/teacher/delete-question/" + id,
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
                // window.location.href = "/teacher/list-question/";
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
});

$('#selectSubject').on('change', function() {
    var selectedSubjects = $(this).val(); // Get the selected subject(s)
    // Make an Ajax request to the server
    $.ajax({
        url: '/teacher/list-question/ajax',
        type: 'GET',
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        headers: {
            'X-CSRFToken': getCSRFTokenValue(),
        },
        data: JSON.stringify(selectedSubjects),
        success: function(data) {
            // Update the DataTable with the new data
            table.clear().rows.add(data).draw();
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

$('#selectSubject').on('change', function() {
    var selectedSubjects = $(this).val(); // Get the selected subject(s)

    // Update DataTable's Ajax URL with selected subjects as parameters
    var url = '/list-question/ajax?subject=' + selectedSubjects.join(',');
    table.ajax.url(url).load();
});