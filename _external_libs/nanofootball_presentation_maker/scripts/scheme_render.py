from nanofoot import ExercisesService,ExerciseInfo, Api
from nf_presentation.scheme_renderer import SchemeRenderer

exs_id=9649

e=ExercisesService()[exs_id]
#print(e.scheme_data)

svg1:str=e.scheme_data[0]
# links=get_links(svg1)

r=SchemeRenderer()
r.render_png(svg_text=svg1, to_file='output_module.png')