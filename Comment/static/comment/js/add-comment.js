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

function replyButton(username, id_comment){
    var repliesSection = $("#replies_" + id_comment);
    var id_test = $("#id_test").val();
    // Check if the replies section already contains a reply article
    if (repliesSection.find('.new-reply').length === 0) {
        // If not, toggle the replies section to show it
        if (repliesSection.css('display') == 'none') {
            toggleReplies(id_comment);
        }
        var html = `
            <article class="card bg-light mb-3 new-reply" id="reply-${id_comment}">
                <input type="hidden" id="id_parent" value="${id_comment}">
                <input type="hidden" name="csrfmiddlewaretoken" value="${getCSRFTokenValue()}">
                <header class="card-header border-0 bg-transparent">
                    <img src="https://via.placeholder.com/30x30" class="rounded-circle me-2"/>
                    <a class="fw-semibold text-decoration-none">${username}</a>
                </header>
                <div class="card-body py-1">
                    <div>
                        <textarea
                            class="form-control form-control-sm border border-2 rounded-1"
                            id="replyComment"
                            style="height: 50px"
                            placeholder="Add a comment..."
                            required
                        ></textarea>
                        <small id="replyError" class="text-danger d-none">Comment cannot be empty</small>
                        <div class="mt-2 d-flex align-items-center slider" id="imageReply_${id_comment}" hidden="hidden"></div>
                    </div>
                    <footer class="card-footer bg-white border-0 d-flex justify-content-between">
                        <div>
                            <input name="imageInputRep_${id_comment}" type="file" id="imageInputRep_${id_comment}" style="display: none;" accept="image/png, image/gif, image/jpeg" multiple>
                            <a role="button" name="uploadImage" type="button" class="btn btn-link btn-sm" onclick="document.getElementById('imageInputRep_${id_comment}').click();">
                                <i class="fa-regular fa-image"></i>
                            </a>
                        </div>
                        <div>
                            <button onclick="cancelEdit(${id_comment}, 'reply-cancel')" type="reset" class="btn btn-link btn-sm me-2 text-decoration-none">
                                Cancel
                            </button>
                            <button onclick="replyForm()" class="btn btn-primary btn-sm">
                                Submit
                            </button>
                        </div>
                    </footer>
                </div>
            </article>
        `;

        repliesSection.append(html);

        imageReply(id_comment);
    }
}

function toggleReplies(commentId) {
    var repliesSection = document.getElementById('replies_' + commentId);
    if (repliesSection.classList.contains('show')) {
        repliesSection.style.maxHeight = '0';
        repliesSection.style.opacity = '0';
        setTimeout(() => {
            repliesSection.classList.remove('show');
        }, 300); // Wait for the animation to finish before removing 'show' class
    } else {
        repliesSection.classList.add('show');
        setTimeout(() => {
            repliesSection.style.maxHeight = '1000px'; // Adjust as needed
            repliesSection.style.opacity = '1';
        }, 10); // Ensure the class is added before applying styles
    }
}

function imageReply (id_comment) {
    document.getElementById('imageInputRep_' + id_comment).onchange = evt => {
        const [file] = evt.target.files;
        // Process the selected files here
        var comment = $("#imageReply_" + id_comment);
        var attr = comment.attr('hidden');
        if (file) {
            var imageContainer = $("<div>"); // Create a container for the image and delete button
            var image = $("<img>");
            var deleteButton = $("<a>");

            // Set attributes for the image element
            image.attr("src", URL.createObjectURL(file));
            image.css("height", "15rem");
            image.css("width", "auto");

            imageContainer.css("margin-right", '10px');
            imageContainer.attr("class", 'image-container');

            // Set attributes for the delete button
            deleteButton.addClass("btn btn-danger delete-button");
            deleteButton.append('<i class="fa-solid fa-trash"></i>');
            deleteButton.attr('role', 'button');
            deleteButton.click(function() {
                $('#imageReply_' + + id_comment).slick('slickRemove', this); // Remove the image container when the delete button is clicked
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
                $('#imageReply_' + id_comment).not('.slick-initialized').slick({
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    speed: 300,
                    variableWidth: true,
                    arrows: true,
                    prevArrow: '<div class="slick-prev"><a class="btn btn-outline-dark"><i class="fa fa-angle-left" aria-hidden="true"></i></a></div>',
                    nextArrow: '<div class="slick-next"><a class="btn btn-outline-dark"><i class="fa fa-angle-right" aria-hidden="true"></i></a></div>'
                });
            }

            if ($('#imageReply_' + id_comment).find('.slick-initialized')) {
                $('#imageReply_' + id_comment).slick('slickAdd', imageContainer);
            }
        } else {
            console.log("Upload image error!");
        }
    };
}