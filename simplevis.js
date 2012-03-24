var questions = null;
var data = null;
$.ajax({
    url: '/questions.json',
    type: 'GET',
    success: function(res) {
        questions = res;
        if (questions && data) {
            render();
        }
    },
    error: function() {
        alert("Error loading page.  Refresh?");
    }
});
$.ajax({
    url: '/data.json',
    type: 'GET',
    success: function(res) {
        data = res;
        if (questions && data) {
            render();
        }
    },
    error: function() {
        alert("Error loading page.  Refresh?");
    }
});


var constraints = {};
function render() {
    // Update counts
    var counts = {};
    var total = 0;
    for (var q in questions) {
        counts[q] = {}
        if (questions[q].type == 'matrix') {
            continue;
        } else {
            for (var choice in questions[q].choices) {
                counts[q][choice] = 0;
            }
        }
    }
    for (var i = 0; i < data.length; i++) {
        var row = data[i];
        var matched = true;
        for (var q in constraints) {
            if (row[q] != constraints[q]) {
                matched = false;
                break;
            }
        }
        if (matched) {
            total += 1;
            for (var q in counts) {
               counts[q][row[q]] += 1; 
            }
        }
    }

    // Render facets
    $("#total").html(total);
    $("#questions").html("");
    for (var q in questions) {
        var qdiv = $("<div class='question'></div>");
        qdiv.append("<h2>" + questions[q].question + "</h2>");
        adiv = $("<div class='answers'></div>");
        qdiv.append(adiv);
        if (questions[q].type == 'matrix') {
        } else {
            var sortedChoices = [];
            for (var choice in questions[q].choices) {
                sortedChoices.push(choice);
            }
            sortedChoices.sort();
            for (var i = 0; i < sortedChoices.length; i++) {
                (function(choice, q) {
                    var count = counts[q][choice];
                    adiv.append(
                        $("<a href='#'>" + (choice || "(blank)") + "</a>").click(function() {
                            constraints[q] = choice;
                            render();
                            return false;
                        }).addClass(count == 0 ? 'zero' : '')
                    );
                    adiv.append("<span class='count" + (count == 0 ? ' zero' : '') + "'>(" + count + ")</span>");
                })(sortedChoices[i], q);
            }
        }
        $("#questions").append(qdiv);
    }
    $("#constraints").html("");
    for (var q in constraints) {
        (function(q) {
            var cdiv = $("<div class='constraint'></div>");
            cdiv.append(
                $("<span class='q'>" + questions[q].question + ":</span>")
            ).append($("<span class='a'>" + constraints[q] + "</span>")
            ).append(
                $("<a href='#'>(remove)</a>").click(function() {
                    delete constraints[q];
                    render();
                    return false;
                })
            );
            $("#constraints").append(cdiv);
        })(q);
    }
}
