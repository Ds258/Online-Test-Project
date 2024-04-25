// Function to generate question inputs
function generateQuestionInputs(numQuestions) {
    if (numQuestions > 150) {
        document.getElementById("numHelp").innerHTML = "The limit is 150!";
    } else {
        var questionInputsHtml = '';
        for (var i = 1; i <= numQuestions; i++) {
            questionInputsHtml += `
            <div class="card mb-4" style="width: 100%; margin: auto">
                <div class="card-body">
                    <div class="form-group question">
                        <label for="questionName${i}">Question ${i}</label>
                        <textarea class="form-control name" id="questionName${i}" rows="2"></textarea>
                        <div class="mt-3">
                            <h6 class="ml-4">Answer 1</h6>
                            <div class=" mb-3 d-flex align-items-center">
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="answerRadio${i}" id="answerRadio${i}_1" value="1">
                                </div>
                                <input type="text" class="form-control answer ml-2" id="answerQuestion${i}_1" placeholder="Answer 1">
                            </div>
                            <h6 class="ml-4">Answer 2</h6>
                            <div class="mb-3 d-flex align-items-center">
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="answerRadio${i}" id="answerRadio${i}_2" value="2">
                                </div>
                                <input type="text" class="form-control answer ml-2" id="answerQuestion${i}_2" placeholder="Answer 2">
                            </div>
                            <h6 class="ml-4">Answer 3</h6>
                            <div class="mb-3 d-flex align-items-center">
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="answerRadio${i}" id="answerRadio${i}_3" value="3">
                                </div>
                                <input type="text" class="form-control answer ml-2" id="answerQuestion${i}_3" placeholder="Answer 3">
                            </div>
                            <h6 class="ml-4">Answer 4</h6>
                            <div class="mb-3 d-flex align-items-center">
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="answerRadio${i}" id="answerRadio${i}_4" value="4">
                                </div>
                                <input type="text" class="form-control answer ml-2" id="answerQuestion${i}_4" placeholder="Answer 4">
                            </div>
                        </div>
                        <h6>Hint</h6>
                        <textarea class="form-control hint mt-3" id="questionHint${i}" rows="2" placeholder="Hint"></textarea>
                        <h6 class="mt-3">Solution</h6>
                        <textarea class="form-control hint mt-3" id="questionSolution${i}" rows="2" placeholder="Solution"></textarea>
                    </div>
                </div>
            </div>
            `;
        }
        $('#questionInputs').html(questionInputsHtml);

        // Initialize rich text editors for each textarea
        $('.name').each(function() {
            var editorQuestion = new RichTextEditor(this);
        });

        $('.answer').each(function() {
            var editorAnswer = new RichTextEditor(this);
        });

        $('.hint').each(function() {
            var editorHint = new RichTextEditor(this);
        });
    }
}

// Listen for changes in the number of questions input
$('#numberOfQuestions').on('input', function() {
    var numQuestions = parseInt($(this).val());
    generateQuestionInputs(numQuestions);
});
