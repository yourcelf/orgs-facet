import os
import csv
import json
from collections import defaultdict
from pprint import pprint

FILE = os.path.join(os.path.dirname(__file__), "03192012_OR_data_download_clean7_2.csv")

column_maps = {
    'q0007': {
        'question': "How did you find this survey?",
        'type': 'choose_one_plus_other',
    },
    'q0008': {
        'question': "Have you ever been to an Occupy camp?",
        'type': 'free',
    },
    'q0009': {
        'question': "Please describe how frequently you have been to a camp.  Choose only one answer:",
        'type': 'choose_one',
    },
    'q0010': {
        'question': "In your visits to the Occupy camp, you have: (Select all that apply)",
        'type': 'choose_any_plus_other',
    },
    'q0011': {
        'question': "Have you participated in any of the following activities related to the Occupy movement?  Select all that apply.",
        'type': 'choose_any_plus_other',
    },
    'q0012': {
        'question': "Would you consider the Occupy movement to be the first movement you have participated in?",
        'type': 'free',
    },
    'q0013': {
        'question': "Do you participate in any of the following",
        'type': 'matrix',
        'rows': [
            'Political Party',
            'Labor Union',
            'Nonprofit Organization',
            'Church or Religious Organization',
            'Non-Government Organization',
            'Affinity Group',
            'Social justice organization',
            'Worker Center',
            "Cultural Groups",
            "Sports groups or teams",
            "Another voluntary association",
            "Professional Association",
            "Business Association",
        ],
    },
    'q0014': {
        'question': "Here are some different forms of political and social action people can take.  Please indicate, for each one, if you have done this:",
        'type': 'matrix',
        'rows': [
            'Signed a petition',
            'Boycotted, or deliberately bought, certain products for political, ethical, or environmental reasons',
            'Took part in a demonstration',
            'Attended a political meeting or rally',
            'Contacted, or attempted to contact, a politician or a civil servant to express your views',
            'Donated money or raised funds for a social or political activity',
            'Contacted or appeared in the media to express your views',
            'Joined an Internet political forum or discussion group',
        ],
    },
    'q0015': {
        'question': "These are some sources that you might or might not use for news and information about the Occupy movement.  Please indicate whether you used htese sources for news and information about hte Occupy movement.",
        'type': 'matrix',
        'rows': [
            'Word of mouth',
            'Discussions at Occupy camps or face to face',
            'groups',
            'email',
            'twitter',
            'facebook',
            'chat rooms / IRC',
            'YouTube',
            'Tumblr',
            'Blogs',
            'Local Newspaper',
            'National or international newspaper',
            'Local radio',
            'National or international radio',
            'Local television',
            'National or international television',
            'Livestreaming video site',
            'Websites of the Occupy Movement',
            'Other',
        ],
    },
    'q0016': {
        'question': "If you participate in the Occupy movement, what TOP THREE concerns motivate you TO PARTICIPATE?  Please use single words if possible, and list them in order of importance.",
        'type': 'top_three_words',
    },
    'q0017': {
        'question': "If you do not participate in the Occupy movement, what TOP THREE reasons explain why you HAVE NOT PARTICIPATED?  Please use single words if possible, and list them in order of importance.",
        'type': 'top_three_words',
    },
    'q0018_0001': {
        'question': "What year were you born?",
        'type': 'free',
    },
    'q0019': {
        'question': "Your gender (check all that apply)",
        'type': 'choose_any_plus_other',
    },
    'q0020': {
        'question': "Your sexual identity (check all that apply)",
        'type': 'choose_any_plus_other',
    },
    'q0021': {
        'question': "What best describes your employment status during the last month?  (check all that apply)",
        'type': 'choose_any_plus_other',
    },
    'q0022': {
        'question': "What best describes your present housing status?",
        'type': "choose_one_plus_other",
    },
    'q0023': {
        'question': "What is your marital status?",
        'type': "choose_one_plus_other",
    },
    'q0024': {
        'question': "How many people do you support with your income?",
        'type': 'multi',
        'rows': ['Number of children under 18?', 'Number of adults you support?'],
    },
    'q0025': {
        'question': "Do you identify as:",
        'type': 'choose_one_plus_other',
    },
    'q0026': {
        'question': "Do you live in the US?  If you are living elsewhere temporarily, select Yes.",
        'type': "yes_no",
    },
    'q0028': {
        'question': "How many years of education have you completed?",
        'type': 'free',
    },

    'q0030': {
        'question': "Describe your race or ethnicity.",
        'type': 'free',
    },
    'q0031': {
        'question': "Which political party do you identify with most closely?",
        'type': 'multi',
        'rows': ["I do or don't associate", "Political party"],
    },
    'q0032': {
         'question': "Voting activity: Did you vote in your most recent nationwide election?",
         'type': 'multi',
         'rows': ["Eligibility", "Voted for"],
     },
    'q0033': {
         'question': "Do you plan to vote in your next nationwide election?",
         'type': 'multi',
         'rows': ['Intention to vote', "Voting for"],
     },
    'q0035': {
        'question': "What is your annual household income?  (If your income is not in US Dollars, please indicate currency: (drop down if available, or write in).",
        'type': 'choose_one_plus_other',
    },
}

def load_data():
    with open(FILE) as fh:
        reader = csv.reader(fh)
        itr = iter(reader)
        top = itr.next()
        data_rows = list(itr)

        cleaned_output_rows = [{} for i in range(len(data_rows))]

        for key, q in column_maps.iteritems():
            q['choices'] = defaultdict(int)
            if q['type'] in ('free', 'yes_no', 'choose_one'):
                for i, row in enumerate(data_rows):
                    val = dict(zip(top, row))[key]
                    q['choices'][val] += 1
                    cleaned_output_rows[i][key] = val
            elif q['type'] in ("choose_one", "choose_any_plus_other", "choose_one_plus_other"):
                q_cols = [c for c in top if c.startswith(key)]
                # Throwing out the free-entry "other" column.
                if q['type'].endswith("_plus_other"):
                    q_cols.pop()
                for q_col in q_cols:
                    for i, row in enumerate(data_rows):
                        vset = cleaned_output_rows[i].get(key, set())
                        val = dict(zip(top, row))[q_col]
                        if val.lower() not in ("no answer", "not applicable"):
                            q['choices'][val] += 1
                            vset.add(val)
                        cleaned_output_rows[i][key] = vset
            elif q['type'] == 'top_three_words':
                q_cols = [key + "_000%i" % i for i in range(1, 4)]
                for q_col in q_cols:
                    for row in data_rows:
                        val = dict(zip(top, row))[q_col]
                        q['choices'][val.lower()] += 1
                # Throw out 'top three words' with only 1 response.
                for choice, count in q['choices'].items():
                    if count == 1:
                        del q['choices'][choice]
                for q_col in q_cols:
                    for i,row in enumerate(data_rows):
                        vset = cleaned_output_rows[i].get(key, set())
                        val = dict(zip(top, row))[q_col]
                        if val in q['choices']:
                            vset.add(val)
                        else:
                            vset.add("other")
                        cleaned_output_rows[i][key] = vset
            elif q['type'] in ('matrix', 'multi'):
                q_cols = [c for c in top if c.startswith(key)]
                for col, name in zip(q_cols, q['rows']):
                    q['choices'][name] = defaultdict(int)
                    for i, row in enumerate(data_rows):
                        vset = cleaned_output_rows[i].get(key, set())
                        val = dict(zip(top, row))[col]
                        q['choices'][name][val] += 1
                        vset.add(val)
                        cleaned_output_rows[i][key] = vset
                    q['choices'][name] = dict(q['choices'][name])
            q['choices'] = dict(q['choices'])
        for row in cleaned_output_rows:
            for q, answer in row.items():
                if isinstance(answer, set):
                    row[q] = list(answer)

    with open('questions.json', 'w') as fh:
        json.dump(column_maps, fh, indent=4)
    with open('data.json', 'w') as fh:
        json.dump(cleaned_output_rows, fh)

if __name__ == "__main__":
    load_data()
