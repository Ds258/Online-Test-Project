imageInput.onchange = evt => {
    const file = imageInput.files;
    console.log(file);
    var comment = $("#imageComment");
    var attr = comment.attr('hidden');
    if (file && file.length > 0) {
        for (var i = 0; i < file.length; i++) {
            var imageContainer = $("<div>"); // Create a container for the image and delete button
            var image = $("<img>");
            var deleteButton = $("<a>");

            // Set attributes for the image element
            image.attr("src", URL.createObjectURL(file[i]));
            image.addClass("image");
            image.attr("name", file[i].name);

            imageContainer.css("margin-right", '10px');
            imageContainer.attr("class", 'image-container');

            // Set attributes for the delete button
            deleteButton.addClass("btn btn-danger delete-button");
            deleteButton.append('<i class="fa-solid fa-trash"></i>');
            deleteButton.attr('role', 'button');
            deleteButton.click(function() {
                $('#imageComment').slick('slickRemove', this); // Remove the image container when the delete button is clicked
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
                $('#imageComment').not('.slick-initialized').slick({
                    slidesToShow: 2,
                    slidesToScroll: 1,
                    speed: 300,
                    variableWidth: true,
                    arrows: true,
                    prevArrow: '<div class="slick-prev"><a class="btn btn-outline-dark"><i class="fa fa-angle-left" aria-hidden="true"></i></a></div>',
                    nextArrow: '<div class="slick-next"><a class="btn btn-outline-dark"><i class="fa fa-angle-right" aria-hidden="true"></i></a></div>'
                });
            }

            if ($('#imageComment').find('.slick-initialized')) {
                $('#imageComment').slick('slickAdd', imageContainer);
            }
        }
    } else {
        console.log("Upload image error!");
    }
}

function resetComment(){
    if ($('#imageComment').find('.slick-initialized')) {
        $('#imageComment').slick('unslick');
        $('#imageComment').empty();
        $('#imageComment').attr("hidden", "hidden");
    }
}

