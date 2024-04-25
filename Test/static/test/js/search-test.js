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

document.getElementById("selectSubject").addEventListener("change", function() {
    // var subject = document.getElementById("selectSubject").value;
    // var subject = $(this).val();
    // console.log("Oidoioi " + subject);
    searchTest(null);
});
//
document.getElementById("searchTest").addEventListener("input", function() {
    // var subject = document.getElementById("selectSubject").value;
    // console.log("Oidoioi " + subject);
    searchTest(null);
});

document.getElementById("favorite").addEventListener("click", function() {
    searchTest(null);
});

function searchTest(page) {
    // Get the selected test ID
    // var subject = document.getElementById("selectSubject").value;
    var subject = $("#selectSubject").val();
    var search = document.getElementById("searchTest").value;

    var favorite = document.getElementById('favorite').checked;

    var data = [];
    data.push({
        subject: subject,
        search: search,
        favorite: favorite,
        page: page,
    });

    console.log("Haha " + JSON.stringify(data));

    // Make the AJAX call
    $.ajax({
        url: "/test/search-test/",
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
            var html = '';
            console.log(xhr);
            console.log(data);
            if (xhr == 'nocontent') {
                html += `<h4>No results found<h4>`;
            } else {
                data.test.forEach(function(item) {
                    html += `
                        <div class="col-md-6">
                            <div class="single-blog">
                                <div class="col-lg-4 mb-4">
                                    <form action="/test/" method="post" id="test_form_${item.id}">`;
                    html += `           <input type="hidden" name="csrfmiddlewaretoken" value="${getCSRFTokenValue()}">`;
                    html += `           <input type="hidden" name="test_name" value="${item.name}">
                                        <div class="card" style="width: 24rem;">
                    `;

                    // Check if the item is favorited
                    var isFavorited = item.favor;

                    html += `
                        <span class="favorite-star ${isFavorited ? 'favorited' : ''}" style="position: absolute; bottom: 10px; right: 10px;" onclick="toggleFavorite(this, ${item.id})">
                            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="feather feather-star">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                        </span>
                    `;

                    html += `
                                            <div class="card-body">
                                                <h5 class="card-title" id="${item.id}">${item.name}</h5>
                                                <p class="card-text">${item.description}</p>
                                                <button type="submit" onclick="submitForm('Submit', ${item.id})" class="btn btn-primary">Start test</button>
                                                <button type="submit" onclick="submitForm('Comment', ${item.id})" class="btn btn-outline-primary">Comment</button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                        `;
                });
            }
            $("#listTest").html(html);

            var htmlPaginate = '';
            if (data.previous !== null) {
                // htmlPaginate += `<a href="?page=${previous}" class="pagination-back">Back</a>`;
                htmlPaginate += `<a onclick="searchTest(${data.previous})" class="pagination-back">Back</a>`;
            }

            htmlPaginate += `<ul class="pages">`;
            data.page_list.forEach(function(item) {
                if (item === data.page_number) {
                    htmlPaginate += `<li class="active"><a onclick="searchTest(${item})">${item}</a></li>`;
                } else {
                    htmlPaginate += `<li class=""><a onclick="searchTest(${item})">${item}</a></li>`;
                }
            });
            htmlPaginate += `</ul>`;
            if (data.next !== null) {
                htmlPaginate += `<a onclick="searchTest(${data.next})" class="pagination-next">Next</a>`;
            }

            $(".post-pagination").html(htmlPaginate);
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

