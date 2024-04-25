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

function blobUrlToFile(blobUrl, fileName) {
    return new Promise((resolve, reject) => {
        fetch(blobUrl)
            .then(response => response.blob())
            .then(blob => {
                var file = new File([blob], fileName);
                resolve(file);
            })
            .catch(error => {
                reject(error);
            });
    });
}

$("#commentForm").submit(function(event) {
    event.preventDefault();

    var id_test = $("#id_test").val();
    var commentText = $("#testComment").val();
//    if (commentText.trim() === "") {
//        $("#commentError").removeClass("d-none");
//        return;
//    } else {
//        $("#commentError").addClass("d-none");
//    }

    var imageComment = $("#imageComment .slick-slide:not(.slick-cloned) img");
    var imagePromises = []; // Array to store promises for image file conversions

    if (imageComment.length > 0) {
        imageComment.each(function() {
            var imageSrc = $(this).attr("src");
            var fileName = $(this).attr("name");
            var promise = blobUrlToFile(imageSrc, fileName)
                .then(file => {
                    console.log(file);
                    return file;
                })
                .catch(error => {
                    console.error('Error:', error);
                });
            imagePromises.push(promise); // Store promise for each image conversion
        });
    }

    Promise.all(imagePromises)
        .then(imageFiles => {
            // All image conversions are complete
            var formData = new FormData();
            formData.append('comment', commentText);
            imageFiles.forEach(file => {
                formData.append('image', file);
            });

            console.log(formData);

            // Send AJAX request after all image files are converted and appended to FormData
            $.ajax({
                url: "/comment/test/" + id_test + "/post",
                type: "POST",
                data: formData,
                processData: false,
                contentType: false,
                headers: {
                    'X-CSRFToken': getCSRFTokenValue(),
                },
                success: function (data, xhr) {
                    console.log(data);
                    window.location.href = '/comment/test/' + id_test;
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log(xhr.status);
                    console.log(thrownError);
                    if (xhr.textStatus == 'timeout') {
                        this.tryCount++;
                        if (this.tryCount <= this.retryLimit) {
                            $.ajax(this);
                            return;
                        }
                        return;
                    }
                },
            });
        });
});

function replyForm() {
    event.preventDefault();

    // var data = [];
    var id_test = $("#id_test").val();
    var replyText = $("#replyComment").val();
    var id_parent = $("#id_parent").val()
    if (replyText.trim() === "") { // Check if comment is empty or contains only whitespace
        $("#replyError").removeClass("d-none"); // Show the error message
        return;
    } else {
        $("#replyError").addClass("d-none"); // Hide the error message if comment is not empty
        // Your code to submit the comment
    }

    var imageReply = $("#imageReply_" + id_parent + " .slick-slide:not(.slick-cloned) img");
    var imagePromises = []; // Array to store promises for image file conversions

    if (imageReply.length > 0) {
        imageReply.each(function() {
            var imageSrc = $(this).attr("src");
            var fileName = $(this).attr("name");
            var promise = blobUrlToFile(imageSrc, fileName)
                .then(file => {
                    console.log(file);
                    return file;
                })
                .catch(error => {
                    console.error('Error:', error);
                });
            imagePromises.push(promise); // Store promise for each image conversion
        });
    }

//    data.push({
//       comment: replyText,
//       id_parent: id_parent,
//    });

    Promise.all(imagePromises)
        .then(imageFiles => {
            // All image conversions are complete
            var formData = new FormData();
            formData.append('comment', replyText);
            formData.append('id_parent', id_parent);
            imageFiles.forEach(file => {
                formData.append('image', file);
            });

            $.ajax({
                url: "/comment/test/" + id_test + "/reply",
                type: "POST",
                async: false,
                cache: false,
                timeout: 5000,
                processData: false,
                contentType: false,
                data: formData,
//                contentType: "application/json; charset=utf-8",
//                dataType: "json",
                headers: {
                    'X-CSRFToken': getCSRFTokenValue(),
                },
                success: function (data) {
                    console.log(data);
                    var repliesSection = $("#replies_" + id_parent);
                    if (repliesSection.find('.new-reply').length > 0) {
                        // If not, toggle the replies section to show it
                        repliesSection.find('.new-reply').remove();

                        $("#replyLength-" + id_parent).html(data.length + " replies");

                        var html = `
                            <article class="card bg-light mb-3" id="article_reply_${data.data.id}">
                                <header class="card-header border-0 d-flex bg-transparent align-items-center">
                                    <img src="https://via.placeholder.com/30x30" class="rounded-circle me-2"/>
                                    <a class="fw-semibold text-decoration-none">${data.data.username}</a>
                                    <span class="ms-3 small text-muted" id="replyTime-${data.data.id}"></span>
                                        <script>
                                            // Convert comment.created_at to a valid date format
                                            var replyCreatedAt = '${data.data.created_at}';

                                            // Use Moment.js to format the time difference
                                            var timeDifference = moment(replyCreatedAt).fromNow();

                                            // Update the content of the span element with the formatted time difference
                                            document.getElementById('replyTime-' + ${data.data.id}).textContent = timeDifference;
                                        </script>
                                    <div class="dropdown ms-auto">
                                        <button class="btn btn-link text-decoration-none" type="button" data-bs-toggle="dropdown"
                                                aria-expanded="false">
                                            <i class="bi bi-three-dots-vertical"></i>
                                        </button>
                                        <ul class="dropdown-menu">
                                            <li><a class="dropdown-item" role="button" onclick="showEdit(${data.data.id_parent}, ${data.data.id}, '${data.data.content}', 'reply')">Edit</a></li>
                                            <li><a class="dropdown-item" role="button" onclick="deleteComment(${data.data.id_parent}, ${data.data.id})">Delete</a></li>
                                        </ul>
                                    </div>
                                </header>
                                <div class="card-body py-2 px-3">
                                    <div>
                                        ${data.data.content}
                                    </div>
                                    <div class="mt-2 d-flex align-items-center slider" id="showImgRep_${data.data.id}">`
                        data.image.forEach(function(img) {
                            html += `
                                <div>
                                    <img name="${img.name}" id="${img.id}" class="image replyImage" src="${img.image}">
                                </div>
                            `
                        });

                        html +=    `</div>
                                    <script>
                                        $('#showImgRep_' + ${data.data.id}).not('.slick-initialized').slick({
                                            slidesToShow: 2,
                                            slidesToScroll: 1,
                                            speed: 300,
                                            variableWidth: true,
                                            arrows: true,
                                            prevArrow: '<div class="slick-prev"><a class="btn btn-outline-dark"><i class="fa fa-angle-left" aria-hidden="true"></i></a></div>',
                                            nextArrow: '<div class="slick-next"><a class="btn btn-outline-dark"><i class="fa fa-angle-right" aria-hidden="true"></i></a></div>'
                                        });
                                    </script>
                                </div>
                                <footer class="card-footer bg-white border-0 py-1 px-3">
                                    <button onclick="likeButton(${id_parent}, ${data.data.id})" type="button" class="btn btn-link btn-sm text-decoration-none ps-0">
                                        <i id="likeIcon_${data.data.id}" class="bi bi-hand-thumbs-up me-1"></i>
                                        <span id="likeCount_${data.data.id}">0</span>
                                    </button>
                                    <button type="button" class="btn btn-link btn-sm text-decoration-none" onclick="replyButton('${data.data.username}', ${data.data.id_parent})">
                                        Reply
                                    </button>
                                </footer>
                            </article>
                        `;

                        repliesSection.append(html);
                    }
                    // window.location.href = "/comment/test/" + id_test;
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
}

function showEdit(id_comment, id_reply, content, action) {
    var id_cancel = 0;
    var existingImages = null;
    if (action === 'reply') {
        var article = $("#article_reply_" + id_reply);
        id_cancel = id_reply;
        existingImages = $("#showImgRep_" + id_cancel + " .slick-slide:not(.slick-cloned) img");
        var className = "replyImage";
    } else if (action === 'comment') {
        var article = $("#article_comment_" + id_comment);
        id_cancel = id_comment;
        existingImages = $("#showImgCmt_" + id_cancel + " .slick-slide:not(.slick-cloned) img");
        var className = "commentImage";
    }

    article.find('.card-body').hide();
    article.find('.card-footer').hide();

    var htmlBody = `
        <div class="card-body py-2 edit-body">
            <div>
                <input type="hidden" name="csrfmiddlewaretoken" value="${getCSRFTokenValue()}">
                <textarea
                    class="form-control form-control-sm border border-2 rounded-1"
                    id="editComment"
                    style="height: 50px"
                    placeholder="Add a comment..."
                    required
                >${content}</textarea>
                <small id="replyError" class="text-danger d-none">Comment cannot be empty</small>
                <div class="mt-2 d-flex align-items-center slider" id="imageEdit_${id_cancel}" hidden="hidden"></div>
            </div>
            <footer class="card-footer bg-white border-0 text-end edit-footer d-flex justify-content-between">
                <div>
                    <input name="imageInputEd_${id_cancel}" type="file" id="imageInputEd_${id_cancel}" style="display: none;" accept="image/png, image/gif, image/jpeg" multiple>
                    <a role="button" name="uploadImage" type="button" class="btn btn-link btn-sm" onclick="document.getElementById('imageInputEd_${id_cancel}').click();">
                        <i class="fa-regular fa-image"></i>
                    </a>
                </div>
                <div>
                    <button onclick="cancelEdit(${id_cancel}, '${action}')" type="reset" class="btn btn-link btn-sm me-2 text-decoration-none">
                        Cancel
                    </button>
                    <button onclick="editComment(${id_comment}, ${id_reply}, '${action}')" class="btn btn-primary btn-sm">
                        Submit
                    </button>
                </div>
            </footer>
        </div>
    `;

    article.append(htmlBody);

    // Check if there are existing images in the comment
    if (existingImages.length > 0) {
        var comment = $("#imageEdit_" + id_cancel);
        var attr = comment.attr('hidden');

        if (attr === 'hidden' || attr) {
            comment.removeAttr('hidden');
        }

        existingImages.each(function() {
            var imageSrc = $(this).attr('src');
            var imageName = $(this).attr('name');
            var imageId = $(this).attr('id');
            var imageContainer = $("<div>"); // Create a container for the image and delete button
            var image = $("<img>");
            var deleteButton = $("<a>");

            // Set attributes for the image element
            image.attr("src", imageSrc);
            image.addClass("image " + className);
            image.attr("name", imageName);
            image.attr("id", imageId);

            imageContainer.css("margin-right", '10px');
            imageContainer.attr("class", 'image-container');

            // Set attributes for the delete button
            deleteButton.addClass("btn btn-danger delete-button");
            deleteButton.append('<i class="fa-solid fa-trash"></i>');
            deleteButton.attr('role', 'button');
            deleteButton.click(function() {
                $('#imageEdit_' + id_cancel).slick('slickRemove', this); // Remove the image container when the delete button is clicked
                if (comment.not('.image-container')) {
                    comment.attr("hidden", "hidden");
                }
            });

            // Append the image and delete button to the container
            imageContainer.append(image);
            imageContainer.append(deleteButton);

            // Append the container to the comment div
            // comment.append(imageContainer);

            if (attr === 'hidden' || attr) {
                comment.removeAttr('hidden');
                comment.append(imageContainer);
                $('#imageEdit_' + id_cancel).not('.slick-initialized').slick({
                    slidesToShow: 2,
                    slidesToScroll: 1,
                    speed: 300,
                    variableWidth: true,
                    arrows: true,
                    prevArrow: '<div class="slick-prev"><a class="btn btn-outline-dark"><i class="fa fa-angle-left" aria-hidden="true"></i></a></div>',
                    nextArrow: '<div class="slick-next"><a class="btn btn-outline-dark"><i class="fa fa-angle-right" aria-hidden="true"></i></a></div>'
                });
            }

            if ($('#imageEdit_' + id_cancel).find('.slick-initialized')) {
                $('#imageEdit_' + id_cancel).slick('slickAdd', imageContainer);
            }
        });
    }

    document.getElementById('imageInputEd_' + id_cancel).onchange = evt => {
        const file = evt.target.files;
        // Process the selected files here
        var comment = $("#imageEdit_" + id_cancel);
        var attr = comment.attr('hidden');
        if (file) {
            for (var i = 0; i < file.length; i++) {
                var imageContainer = $("<div>"); // Create a container for the image and delete button
                var image = $("<img>");
                var deleteButton = $("<a>");

                // Set attributes for the image element
                image.attr("src", URL.createObjectURL(file[i]));
                image.attr("name", file[i].name);
                image.addClass("image newEditImg")

                imageContainer.css("margin-right", '10px');
                imageContainer.attr("class", 'image-container');

                // Set attributes for the delete button
                deleteButton.addClass("btn btn-danger delete-button");
                deleteButton.append('<i class="fa-solid fa-trash"></i>');
                deleteButton.attr('role', 'button');
                deleteButton.click(function() {
                    $('#imageEdit_' + id_cancel).slick('slickRemove', this); // Remove the image container when the delete button is clicked
                    if (comment.not('.image-container')) {
                        comment.attr("hidden", "hidden");
                    }
                });

                // Append the image and delete button to the container
                imageContainer.append(image);
                imageContainer.append(deleteButton);

                // Append the container to the comment div
                // comment.append(imageContainer);

                if (attr === 'hidden' || attr) {
                    comment.removeAttr('hidden');
                    comment.append(imageContainer);
                    $('#imageEdit_' + id_cancel).not('.slick-initialized').slick({
                        slidesToShow: 2,
                        slidesToScroll: 1,
                        speed: 300,
                        variableWidth: true,
                        arrows: true,
                        prevArrow: '<div class="slick-prev"><a class="btn btn-outline-dark"><i class="fa fa-angle-left" aria-hidden="true"></i></a></div>',
                        nextArrow: '<div class="slick-next"><a class="btn btn-outline-dark"><i class="fa fa-angle-right" aria-hidden="true"></i></a></div>'
                    });
                }

                if ($('#imageEdit_' + id_cancel).find('.slick-initialized')) {
                    $('#imageEdit_' + id_cancel).slick('slickAdd', imageContainer);
                }
            }
        } else {
            console.log("Upload image error!");
        }
    };
}

function cancelEdit(id_cancel, action) {
    if (action === 'reply-cancel') {
        var article = $("#reply-" + id_cancel);
        article.remove();
    } else {
        var article = $("#article_" + action + "_" + id_cancel);
        article.find('.edit-body').remove();
        article.find('.edit-footer').remove();
        article.find('.card-body').show();
        article.find('.card-footer').show();
    }
}

function editComment(id_comment, id_reply, action) {
    if (action === 'reply') {
        var article = $("#article_reply_" + id_reply);
        var id = id_reply;
        var className = "replyImage";
    } else if (action === 'comment') {
        var id = id_comment;
        var className = "commentImage";
        var article = $("#article_comment_" + id_comment);
    }

    var content = article.find('#editComment').val(); // get content of comment
    var id_test = $("#id_test").val();

    var imageReply = $("#imageEdit_" + id + " .slick-slide:not(.slick-cloned) img");
    var imagePromises = []; // Array to store promises for image file conversions

    if (imageReply.length > 0) {
        imageReply.each(function() {
            if ($(this).hasClass("newEditImg")) {
                var imageSrc = $(this).attr("src");
                var fileName = $(this).attr("name");
                var promise = blobUrlToFile(imageSrc, fileName)
                    .then(file => {
                        console.log(file);
                        return file;
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
                imagePromises.push(promise);
            }
        });
    }

//    var data = [];
//    data.push({
//        content: content,
//        id_comment: id_comment,
//        id_reply: id_reply,
//        action: action,
//    })

    Promise.all(imagePromises)
        .then(imageFiles => {
            // All image conversions are complete
            var formData = new FormData();
            formData.append('content', content);
            formData.append('id_comment', id_comment);
            formData.append('id_reply', id_reply);
            formData.append('action', action);
            var exist_image = [];
            imageReply.each(function() {
                // console.log($(this).attr('id'));
                if ($(this).hasClass(className)) {
                    exist_image.push($(this).attr('id'));
                }
            });
            formData.append('exist_image', exist_image);
            imageFiles.forEach(file => {
                formData.append('new_image', file);
            });

            $.ajax({
                url: "/comment/test/" + id_test + "/edit",
                type: "POST",
                async: true,
                cache: false,
                timeout: 10000,
                data: formData,
                processData: false,
                contentType: false,
//                contentType: "application/json; charset=utf-8",
//                dataType: "json",
                headers: {
                    'X-CSRFToken': getCSRFTokenValue(),
                },
                success: function (data) {
                    console.log(data);
                    window.location.href = "/comment/test/" + id_test;
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
    // console.log(content);
}

function deleteComment(id_comment, id_reply) {
    $("#deleteModal").modal('show');
    $('#yes').click(function() {
        $("#deleteModal").modal('hide');
        var id_test = $("#id_test").val();
        var data = [];
        data.push({
            id_comment: id_comment,
            id_reply: id_reply,
        })
        console.log(data)
        $.ajax({
            url: "/comment/test/" + id_test + "/delete",
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
            success: function (data) {
                console.log(data);
    //            var repliesSection = $("#replies_" + id_parent);
    //            if (repliesSection.find('.new-reply').length > 0) {
    //                // If not, toggle the replies section to show it
    //                repliesSection.find('.new-reply').remove();
    //
    //                var html = `
    //                    <article class="card bg-light mb-3">
    //                        <header class="card-header border-0 d-flex bg-transparent">
    //                            <img src="https://via.placeholder.com/30x30" class="rounded-circle me-2"/>
    //                            <a class="fw-semibold text-decoration-none">${data.username}</a>
    //                            <span class="ms-3 small text-muted">2 months ago</span>
    //                            <div class="dropdown ms-auto">
    //                                <button class="btn btn-link text-decoration-none" type="button" data-bs-toggle="dropdown"
    //                                        aria-expanded="false">
    //                                    <i class="bi bi-three-dots-vertical"></i>
    //                                </button>
    //                                <ul class="dropdown-menu">
    //                                    <li><a class="dropdown-item" href="#">Edit</a></li>
    //                                    <li><a class="dropdown-item" href="#">Delete</a></li>
    //                                </ul>
    //                            </div>
    //                        </header>
    //                        <div class="card-body py-2 px-3">
    //                            ${data.content}
    //                        </div>
    //                        <footer class="card-footer bg-white border-0 py-1 px-3">
    //                            <button type="button" class="btn btn-link btn-sm text-decoration-none ps-0">
    //                                <i class="bi bi-hand-thumbs-up me-1"></i>(3)
    //                            </button>
    //                            <button type="button" class="btn btn-link btn-sm text-decoration-none" onclick="replyButton('${data.username}', ${data.id_parent})">
    //                                Reply
    //                            </button>
    //                        </footer>
    //                    </article>
    //                `;
    //
    //                repliesSection.append(html);
    //            }
                window.location.href = "/comment/test/" + id_test;
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
}