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

document.addEventListener('DOMContentLoaded', function() {
    // Check if the test cookie exists and its expiration time hasn't passed
    const testCookie = getCookie('test_cookie');
    console.log(testCookie);

    if (testCookie) {
        $.ajax({
            url: '/check-test/',
            type: "POST",
            async: false,
            cache: false,
            timeout: 30000,
            data: JSON.stringify(testCookie),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            headers: {
                'X-CSRFToken': getCSRFTokenValue(),
            },
            success: function (data) {
                console.log(data);
                if (data.status === 'continue') {
                    $('#continueTest').modal('show');
                    $('#continue').click(function() {
                        console.log(data.id_do_test + " - " + data.id_test);
                        // Redirect the user to continue the test
                        window.location.href = '/test/' + data.id_test + '/' + data.id_do_test;
                        // window.location.href = 'test/1/71';
                    });

                    $('#cancel').click(function() {
                        cancelTest(data.id_do_test);
                    });
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
});

function cancelTest(id_do_test) {
    $.ajax({
        url: '/cancel-test/' + id_do_test,
        type: "POST",
        async: false,
        cache: false,
        timeout: 30000,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        headers: {
            'X-CSRFToken': getCSRFTokenValue(),
        },
        success: function (data) {
            console.log(data);
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
