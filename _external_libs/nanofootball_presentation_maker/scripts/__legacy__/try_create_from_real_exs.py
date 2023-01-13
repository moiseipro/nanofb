from nanofoot import ExercisesService
from nf_presentation import ReportRenderer

exs_id=9641
export_to='from_real_data.pptx'


exercice_data=ExercisesService()[exs_id].raw_data

with ReportRenderer() as renderer:
    renderer.add_exercise_slide(exercise_data=exercice_data)
    renderer.save(to=export_to)