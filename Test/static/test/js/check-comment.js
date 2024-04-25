$(document).ready(function() {
    $('#selectSubject').selectpicker();
});

function submitForm(action, id_test) {
    var form = $("#test_form_" + id_test);
    if (form.find('input[name="Submit"]')) {
        form.find('input[name="Submit"]').remove();
    } else if (form.find('input[name="Comment"]')) {
        form.find('input[name="Comment"]').remove();
    } else if (form.find('input[name="id_test"]')) {
        form.find('input[name="id_test"]').remove();
    }

    var submitButton = document.createElement("input");
    submitButton.setAttribute("type", "hidden");
    submitButton.setAttribute("name", action);
    submitButton.setAttribute("value", action);
    var idButton = document.createElement("input");
    idButton.setAttribute("type", "hidden");
    idButton.setAttribute("name", "id_test");
    idButton.setAttribute("value", id_test);
    form.append(submitButton);
    form.append(idButton);
    form.submit();
}
