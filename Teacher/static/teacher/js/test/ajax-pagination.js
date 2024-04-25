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

document.addEventListener("DOMContentLoaded", function () {
    AjaxPagination(1);
});

function AjaxPagination(i) {
    var subject = $("#selectSubject").val();
    var search = document.getElementById("searchTest").value;
    var numData = $("#selectNum").val();
    var selectActive = $("#selectActive").val();
    var active = null;
    if (selectActive === "On") {
        active = true;
    } else if (selectActive === "Off") {
        active = false;
    }

    var selectMode = $("#selectMode").val();
    var mode = null;
    if (selectMode === 'Test') {
        mode = false;
    } else if (selectMode === 'Practice') {
        mode = true;
    }

    var data = [];
    data.push({
        subject: subject,
        search: search,
        numData: numData,
        active: active,
        mode: mode,
    });

    console.log(data);

    // Remove the 'active' class from all pagination buttons
    // Remove the current pagination buttons
    document.querySelectorAll('.pagination .page-item').forEach(item => {
        item.remove();
    });

    // Determine the total number of pages and the maximum number of buttons to display
    var totalPages = document.getElementById("page_list").value;
    console.log(totalPages);
    var maxButtons = 5; // Adjust this value as needed

    // Calculate the start and end pages for the pagination buttons
    var start = Math.max(1, i - Math.floor(maxButtons / 2));
    var end = Math.min(start + maxButtons - 1, totalPages);

    // Adjust the start and end pages if necessary to ensure maxButtons number of buttons are displayed
    if (end - start + 1 < maxButtons) {
        start = Math.max(1, end - maxButtons + 1);
    }

    // Add the pagination buttons for the calculated range
    for (var j = start; j <= end; j++) {
        var pageItem = document.createElement('li');
        pageItem.classList.add('page-item');
        pageItem.classList.add('paginate');
        if (j === i) {
            pageItem.classList.add('active');
        }
        var pageLink = document.createElement('a');
        pageLink.classList.add('page-link');
        pageLink.setAttribute('onclick', 'AjaxPagination(' + j + ')');
        pageLink.textContent = j;
        pageItem.appendChild(pageLink);
        document.querySelector('.pagination').appendChild(pageItem);
    }

    // Add the 'Previous' button
    var prevItem = document.createElement('li');
    prevItem.classList.add('page-item');
    var prevLink = document.createElement('a');
    prevLink.classList.add('page-link');
    prevLink.setAttribute('onclick', "navigate('previous')");
    prevLink.setAttribute('aria-label', 'Previous');
    prevLink.innerHTML = '<span aria-hidden="true">&laquo;</span><span class="sr-only">Previous</span>';
    prevItem.appendChild(prevLink);
    document.querySelector('.pagination').insertAdjacentElement('afterbegin', prevItem);

    // Add the 'Next' button
    var nextItem = document.createElement('li');
    nextItem.classList.add('page-item');
    var nextLink = document.createElement('a');
    nextLink.classList.add('page-link');
    nextLink.setAttribute('onclick', "navigate('next')");
    nextLink.setAttribute('aria-label', 'Next');
    nextLink.innerHTML = '<span aria-hidden="true">&raquo;</span><span class="sr-only">Next</span>';
    nextItem.appendChild(nextLink);
    document.querySelector('.pagination').appendChild(nextItem);

    $.ajax({
        url: '/teacher/list-test/page=' + i,
        type: "POST",
        async: false,
        cache: false,
        data: JSON.stringify(data),
        timeout: 30000,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        headers: {
            'X-CSRFToken': getCSRFTokenValue(),
        },
        success: function (data, xhr) {
            // console.log(data);
            // Clear existing table rows
            $("#dataTest").empty();
            if (xhr === 'nocontent') {
                $("#dataTest").html('<h4>No results found</h4>');
            } else {
                // Loop through the received data and generate table rows
                data.data.forEach(function(test) {
                    $("#dataTest").append(
                        '<tr class="table-row" data-subject="' + test.subject + '" data-active="' + test.is_active + '">' +
                        '<td><a href="/teacher/edit-test/' + test.id + '">' + test.name + '</a></td>' +
                        '<td>' + test.description + '</td>' +
                        '<td>' + convertSecondstoTime(test.duration) + '</td>' +
                        '<td>' + test.subject + '</td>' +
                        '<td>' + test.mode + '</td>' +
                        '<td>' + test.created_at + '</td>' +
                        '<td>' + test.is_active + '</td>' +
                        '</tr>'
                    );
                });

                $("#dataTest").append(`<input type="hidden" id="page_list" value="${data.page_list.length}">`);
            }
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

function navigate(direction) {
    var currentPage = parseInt(document.querySelector('.pagination .active').textContent);
    var nextPage;
    var totalPages = document.getElementById("page_list").value;
    if (direction === 'previous') {
        nextPage = currentPage - 1;
    } else {
        nextPage = currentPage + 1;
    }
    console.log(nextPage + " " + totalPages);
    if (nextPage < 1) {
        return;
    } else if (nextPage > totalPages) {
        return;
    }

    AjaxPagination(nextPage);
}

document.getElementById("selectSubject").addEventListener("change", function() {
    filterSearch();
});
//
document.getElementById("searchTest").addEventListener("input", function() {
    filterSearch();
});

document.getElementById("selectNum").addEventListener("change", function() {
    filterSearch();
});

document.getElementById("selectActive").addEventListener("change", function() {
    filterSearch();
});

document.getElementById("selectMode").addEventListener("change", function() {
    filterSearch();
});

function filterSearch() {
    var subject = $("#selectSubject").val();
    var search = document.getElementById("searchTest").value;
    var numData = $("#selectNum").val();
    var selectActive = $("#selectActive").val();
    var active = null;
    if (selectActive === "On") {
        active = true;
    } else if (selectActive === "Off") {
        active = false;
    }

    var selectMode = $("#selectMode").val();
    var mode = null;
    if (selectMode === 'Test') {
        mode = false;
    } else if (selectMode === 'Practice') {
        mode = true;
    }

    var data = [];
    data.push({
        subject: subject,
        search: search,
        numData: numData,
        active: active,
        mode: mode,
    });

    console.log("Haha " + JSON.stringify(data));

    // Make the AJAX call
    $.ajax({
        url: "/teacher/list-test/filter-test",
        type: "POST",
        async: false,
        cache: false,
        timeout: 5000,
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        headers: {
            'X-CSRFToken': getCSRFTokenValue(),
        },
        success: function (data, xhr) {
            // console.log(data);
            $("#dataTest").empty();
            if (xhr === 'nocontent') {
                $("#dataTest").html('<h4 class="mt-2">No results found</h4>');
                // console.log(xhr);
            } else {
                // Loop through the received data and generate table rows
                data.data.forEach(function(test) {
                    $("#dataTest").append(
                        '<tr class="table-row" data-subject="' + test.subject + '" data-active="' + test.is_active + '">' +
                        '<td><a href="/teacher/edit-test/' + test.id + '">' + test.name + '</a></td>' +
                        '<td>' + test.description + '</td>' +
                        '<td>' + convertSecondstoTime(test.duration) + '</td>' +
                        '<td>' + test.subject + '</td>' +
                        '<td>' + test.mode + '</td>' +
                        '<td>' + test.created_at + '</td>' +
                        '<td>' + test.is_active + '</td>' +
                        '</tr>'
                    );
                });
            }
            document.querySelectorAll('.pagination .page-item').forEach(item => {
                item.remove();
            });
            data.page_list.forEach(function(j) {
                if (j === 1) {
                    $('.pagination').append(
                        `<li class="page-item active"><a class="page-link" onclick="AjaxPagination(${j})">${j}</a></li>`
                    );
                } else {
                    $('.pagination').append(
                        `<li class="page-item"><a class="page-link" onclick="AjaxPagination(${j})">${j}</a></li>`
                    );
                }
            });
            var prevItem = document.createElement('li');
            prevItem.classList.add('page-item');
            var prevLink = document.createElement('a');
            prevLink.classList.add('page-link');
            prevLink.setAttribute('onclick', "navigate('previous')");
            prevLink.setAttribute('aria-label', 'Previous');
            prevLink.innerHTML = '<span aria-hidden="true">&laquo;</span><span class="sr-only">Previous</span>';
            prevItem.appendChild(prevLink);
            document.querySelector('.pagination').insertAdjacentElement('afterbegin', prevItem);

            // Add the 'Next' button
            var nextItem = document.createElement('li');
            nextItem.classList.add('page-item');
            var nextLink = document.createElement('a');
            nextLink.classList.add('page-link');
            nextLink.setAttribute('onclick', "navigate('next')");
            nextLink.setAttribute('aria-label', 'Next');
            nextLink.innerHTML = '<span aria-hidden="true">&raquo;</span><span class="sr-only">Next</span>';
            nextItem.appendChild(nextLink);
            document.querySelector('.pagination').appendChild(nextItem);
            $("#dataTest").append(`<input type="hidden" id="page_list" value="${data.page_list.length}">`);
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

function convertSecondstoTime(seconds) {
    var duration = moment.duration(seconds, 'seconds');
    var formatted = duration.format("hh:mm:ss");

    return formatted;
}