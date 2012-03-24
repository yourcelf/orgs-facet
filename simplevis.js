var questions = null;
var data = null;
$.ajax({
    url: '/questions.json',
    type: 'GET',
    success: function(res) {
        questions = res;
        for (var q in questions) {
            if (questions[q].widget == 'matrix') {
                questions[q].rev_rows = {};
                for (var i = 0; i < questions[q].rows.length; i++) {
                    questions[q].rev_rows[questions[q].rows[i]] = i;
                }
            }
        }
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
        if (questions[q].widget == 'matrix') {
            for (var i = 0; i < questions[q].rows.length; i++) {
                var subq = questions[q].rows[i];
                counts[q + "::" + subq] = {};
                for (var choice in questions[q].choices[subq]) {
                    counts[q + "::" + subq][choice] = 0;
                }
            }
        } else if ($.inArray(questions[q].widget, ['single_choice', 'multi_choice']) != -1) {
            counts[q] = {}
            for (var choice in questions[q].choices) {
                counts[q][choice] = 0;
            }
        }
    }

    for (var i = 0; i < data.length; i++) {
        var row = data[i];
        var matched = true;
        for (var question in constraints) {
            var parts = question.split("::");
            var q = parts[0];
            if (parts.length > 0) {
                var subq = parts[1];
            }

            if (questions[q].widget == 'single_choice' && row[q] != constraints[q]) {
                matched = false;
            } else if (questions[q].widget == 'multi_choice') {
                if ($.inArray(constraints[q], row[q]) == -1) {
                    matched = false;
                }
            } else if (questions[q].widget == 'matrix') {
                if (row[q][questions[q].rev_rows[subq]] != constraints[question]) {
                    matched = false;
                }
            }
            if (!matched) 
                break;
        }
        if (matched) {
            total += 1;
            for (var question in counts) {
                var parts = question.split("::");
                var q = parts[0];
                if (parts.length > 1) {
                    var subq = parts[1];
                }
                if (questions[q].widget == 'single_choice') {
                    counts[q][row[q]] += 1; 
                } else if (questions[q].widget == 'multi_choice') {
                    for (var j = 0; j < row[q].length; j++) {
                        counts[q][row[q][j]] += 1
                    }
                } else if (questions[q].widget == 'matrix') {
                    // HACK XXX -- this should already have been initialized....
                    if (counts[q + "::" + subq][ row[q][questions[q].rev_rows[subq]] ] == null) {
                        counts[q + "::" + subq][ row[q][questions[q].rev_rows[subq]] ] = 0;
                    }
                    counts[q + "::" + subq][ row[q][questions[q].rev_rows[subq]] ] += 1;
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
        /*
        * Matrix Questions
        */
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
                var constraint = q + "::" + subq;
                if (sortedChoices.length > 6) {
                    var td = $("<td colspan='6'></td>");
                    $.each(sortedChoices, function(j, choice) {
                        td.append(renderChoice(choice, constraint, counts[constraint][choice]));
                    });
                    tr.append(td);
                } else {
                    $.each(sortedChoices, function(j, choice) {
                        var td = $("<td/>");
                        td.append(renderChoice(choice, constraint, counts[constraint][choice]));
                        tr.append(td);
                    });
                }
                table.append(tr);
            });
            adiv.append(table);
        /*
        *  Single and multiple choice
        */
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
    for (var question in constraints) {
        (function(question) {
            var parts = question.split("::");
            var q = parts[0];
            if (parts.length > 1) {
                var subq = parts[1];
            }
            var cdiv = $("<div class='constraint'></div>");
            if (parts.length > 1) {
                cdiv.append($("<span class='q'>" + questions[q].question + ": " + subq + ": </span>"));
            } else {
                cdiv.append($("<span class='q'>" + questions[q].question + ":</span>"));
            }
            cdiv.append($("<span class='a'>" + constraints[question] + "</span>"))
            cdiv.append(
                $("<a href='#'>(remove)</a>").click(function() {
                    delete constraints[question];
                    render();
                    return false;
                })
            );
            $("#constraints").append(cdiv);
        })(question);
    }
}
