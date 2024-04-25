function likeButton(id_comment, id_reply) {
    console.log("Nani the fuck");
    var icon = null;
    var action = null;
    if (id_reply !== null) {
        icon = document.getElementById('likeIcon_' + id_reply);
    } else {
        icon = document.getElementById('likeIcon_' + id_comment);
    }

    if (icon.classList.contains('bi-hand-thumbs-up')) {
        icon.classList.replace('bi-hand-thumbs-up', 'bi-hand-thumbs-up-fill');
        action = "Like";
    } else {
        icon.classList.replace('bi-hand-thumbs-up-fill', 'bi-hand-thumbs-up');
        action = "Unlike";
    }

    sendData(id_comment, id_reply, action);
}

var id_test = $("#id_test").val();

function sendData(id_comment, id_reply, action) {
    var data = [];
    data.push({
        id_comment: id_comment,
        id_reply: id_reply,
        action: action,
    });

    // Make the AJAX call
    $.ajax({
        url: "/comment/test/" + id_test + "/like",
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
            if (id_reply === null) {
                $("#likeCount_" + id_comment).html(data.num_like);
            } else {
                $("#likeCount_" + id_reply).html(data.num_like);
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