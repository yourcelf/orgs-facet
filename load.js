function refreshQuestionBox() {
  var qBox = $("#questionBox");
  qBox.html("");
  for (var key in window.questions) {
    var question = questions[key];
    var elemHtml = "<option id=\"" + key + "\">" + question.question + "</option>";
    qBox.append($(elemHtml));
  }
}

function loadExhibit() {
  $("head").append("<script src=\"http://simile-widgets.org/exhibit/api/exhibit-api.js\"></script>");
}

function htmlForFacet(qId) {
  var html = "<div ex:role=\"facet\" ex:expression=\"." + qId + "\" ex:facetLabel=\"" + window.questions[qId].question + "\"></div>";
  return html;
}

function addQuestion(qId) {
  if (
      (typeof window.questions[qId]["added"] == "undefined") ||
      (window.questions[qId] == false)) {
    window.questions[qId]["added"] = true;
    $("#facets1").append(htmlForFacet(qId))  
  }
}

function createFacets() {
  for (var qId in window.questions) {
    addQuestion(qId);
  }
}

function startUp() {
  $.getJSON("questions.json", function(questions) {
    window.questions = questions;
    //refreshQuestionBox();
    createFacets();
    loadExhibit();
     
  });
}


