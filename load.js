function refreshQuestionBox() {
  var qBox = $("#questionBox");
  qBox.html("");
  for (var key in window.questions) {
    var question = questions[key];
    var elemHtml = "<option id=\"" + key + "\">" + question.question + "</option>";
    qBox.append($(elemHtml));
  }
}

function loadQuestions() {
  $.getJSON("questions.json", function(questions) {
    window.questions = questions;
    refreshQuestionBox();
  });
}

