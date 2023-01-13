from pprint import pprint

from nanofoot import ExercisesService

exs_id=9641

e=ExercisesService()

pprint(e[exs_id].raw_data)