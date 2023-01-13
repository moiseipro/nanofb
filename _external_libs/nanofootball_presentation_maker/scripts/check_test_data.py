import json
from nf_presentation.data_classes import TrainingInfo
data_file='test_data.json'
with open(data_file,'r',encoding='utf8') as f:
    data=json.load(f)

exercises=data.get('exercises_info')
print(len(exercises))



t=TrainingInfo(data=data)
for exercise in t.exercises:
    print(exercise.name)
    