import math
import arpa
import warnings
from asl_data import SinglesData


def recognize(models: dict, test_set: SinglesData):
    """ Recognize test word sequences from word models set

   :param models: dict of trained models
       {'SOMEWORD': GaussianHMM model object, 'SOMEOTHERWORD': GaussianHMM model object, ...}
   :param test_set: SinglesData object
   :return: (list, list)  as probabilities, guesses
       both lists are ordered by the test set word_id
       probabilities is a list of dictionaries where each key a word and value is Log Liklihood
           [{SOMEWORD': LogLvalue, 'SOMEOTHERWORD' LogLvalue, ... },
            {SOMEWORD': LogLvalue, 'SOMEOTHERWORD' LogLvalue, ... },
            ]
       guesses is a list of the best guess words ordered by the test set word_id
           ['WORDGUESS0', 'WORDGUESS1', 'WORDGUESS2',...]
   """
    warnings.filterwarnings("ignore", category=DeprecationWarning)
    probabilities = []
    guesses = []
    # TODO implement the recognizer
    # cycle through test set
    for test_w, (X, lengths) in test_set.get_all_Xlengths().items():
        max_log = -math.inf # the closest guess could be for the highest log score
        prob_dict = {}
        word_guess = ""
        # cycle through models & words
        for train_w, model in models.items():
            try:
                log_prob = model.score(X, lengths)
                prob_dict[train_w] = log_prob
            except:
                prob_dict[train_w] = -math.inf

            if log_prob > max_log:
                max_log = log_prob
                word_guess = train_w
        guesses.append(word_guess)
        probabilities.append(prob_dict)
    return probabilities, guesses


# def recognize_ng(models: dict, test_set: SinglesData, ngrams):
#     """
#
#     :param models:
#     :param test_set:
#     :param ngrams:
#     :return:
#     """
#     warnings.filterwarnings("ignore", category=DeprecationWarning)
#     probabilities = []
#     guesses = []
#     model = arpa.loadf('./SLM/devel-lm-M3.sri.lm')
#     lm = model[0]
#
#
#     return probabilities, guesses
