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

function toggleFavorite(star, id_test) {
    star.classList.toggle('favorited');
    console.log(id_test);
    console.log(star.classList.contains('favorited'));

    var data = [];

    data.push({
        is_favorited: true,
    });

    if (!star.classList.contains('favorited')) {
        console.log(id_test + " unmarked");
        data[0]['is_favorited'] = false;
        console.log(data);
    }

    sendData(data, id_test);
    searchTest(1);
}

function sendData(data, id_test) {
    $.ajax({
        url: '/test/mark-favor/' + id_test,
        type: "POST",
        async: false,
        cache: false,
        timeout: 30000,
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        headers: {
            'X-CSRFToken': getCSRFTokenValue(),
        },
        success: function (data, xhr) {
            console.log(data);
            if (xhr == 'notfound') {
                console.log("Test not found");
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
