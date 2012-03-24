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

function renderChoice(choice, q, count) {
    var el = $("<span class='choice'></span>");
    el.append(
        $("<a href='#' class='" + (constraints[q] == choice ? 'chosen' : '') + "'>" + (choice || "(blank)") + "</a>").click(function() {
            if (constraints[q] == choice) {
                delete constraints[q];
            } else {
                constraints[q] = choice;
            }
            render();
            return false;
        }).addClass(count == 0 ? 'zero' : '')
    );
    el.append("<span class='count" + (count == 0 ? ' zero' : '') + "'>(" + count + ")</span>");
    el.append(" ");
    return el;
}
function sortCopy(array) {
    var copy = array.slice();
    copy.sort();
    return copy;
}

var constraints = {};
function render() {
    // Update counts
    var counts = {};
    var total = 0;
    for (var q in questions) {
        counts[q] = {}
        if (questions[q].widget == 'matrix') {
//            for (var i = 0; i < questions[q].rows; i++) {
//                var subq = questions[q].rows[i];
//                for (var choice in questions[q].choices) {
//                    counts[q + "::" + subq][choice] = 0;
//                }
//            }
        } else if ($.inArray(questions[q].widget, ['single_choice', 'multi_choice']) != -1) {
            for (var choice in questions[q].choices) {
                counts[q][choice] = 0;
            }
        }
    }
    for (var i = 0; i < data.length; i++) {
        var row = data[i];
        var matched = true;
        for (var q in constraints) {
            if (questions[q].widget == 'single_choice' && row[q] != constraints[q]) {
                matched = false;
            } else if (questions[q].widget == 'multi_choice' && $.inArray(constraints[q], row[q]) == -1) {
                matched = false;
            }
            if (!matched) 
                break;
        }
        if (matched) {
            total += 1;
            for (var q in counts) {
                if (questions[q].widget == 'single_choice') {
                    counts[q][row[q]] += 1; 
                } else if (questions[q].widget == 'multi_choice') {
                    for (var j = 0; j < row[q].length; j++) {
                        counts[q][row[q][j]] += 1
                    }
                } 
            }
        }
    }
    console.log(counts);

    // Render facets
    $("#total .count").html(total);
    $("#questions").html("");
    for (var q in questions) {
        var qdiv = $("<div class='question'></div>");
        qdiv.append("<h2>" + questions[q].question + "</h2>");
        adiv = $("<div class='answers'></div>");
        if (questions[q].widget == 'matrix') {
            var table = $("<table/>");
            $.each(questions[q].rows, function(i, subq) {
                var tr = $("<tr/>");
                tr.append("<th>" + subq + "</th>");
                var sortedChoices = [];
                for (var choice in questions[q].choices[subq]) {
                    sortedChoices.push(choice);
                }
                sortedChoices.sort()
                if (sortedChoices.length > 6) {
                    var td = $("<td/>");
                    $.each(sortedChoices, function(j, choice) {
                        td.append(renderChoice(choice, q, 0));
                    });
                } else {
                    $.each(sortedChoices, function(j, choice) {
                        var td = $("<td/>");
                        td.append(renderChoice(choice, q, 0));
                        tr.append(td);
                    });
                }
                table.append(tr);
            });
            adiv.append(table);
        } else if ($.inArray(questions[q].widget, ['single_choice', 'multi_choice']) != -1) {
            var sortedChoices = [];
            for (var choice in questions[q].choices) {
                sortedChoices.push(choice);
            }
            sortedChoices.sort();
            for (var i = 0; i < sortedChoices.length; i++) {
                adiv.append(renderChoice(sortedChoices[i], q, counts[q][sortedChoices[i]]));
            }
        }
        qdiv.append(adiv);
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
