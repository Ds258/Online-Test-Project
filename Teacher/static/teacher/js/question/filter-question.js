// Search bar
$(document).ready(function(){
  $("#searchQuestion").on("keyup", function() {
    var value = $(this).val().toLowerCase();
    $("#dataQuestion tr").filter(function() {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
    });
  });
});

document.getElementById("selectSubject").addEventListener("click", function() {
    filterTable();
});

document.getElementById("selectActive").addEventListener("click", function() {
    filterTable();
});

function filterTable() {
    var subject = document.getElementById("selectSubject").value;
    var active = document.getElementById("selectActive").value;
    // console.log(subject + " " + mode);

    document.querySelectorAll('.table-row').forEach(row => {
        // Check if the row's subject matches the selected subject
        is_display = true;
        if (row.dataset.subject !== subject && subject !== "") {
            // Show the row
            is_display = false;
        }

        if (row.dataset.active !== active && active !== "") {
            is_display = false;
        }

        console.log(is_display)

        if (is_display) {
            row.style.display = "table-row";
        } else {
            row.style.display = "none";
        }
    });
}