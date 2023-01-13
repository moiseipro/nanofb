from typing import IO

from nf_presentation.builders import PresentationBuilder
from .exercise_info import ExerciseInfo
from nf_presentation.scheme_renderer import SchemeRenderer
from nf_presentation.html_renderer import HTMLRenderer
from .settings import (
                DEFAULT_SLIDE_TITLE,PRESENTATION_RATIO,
                ADDITIONAL_TABLE_POSITION, ADDITIONAL_TABLE_WIDTH,
                BASIC_TABLE_POSITION, BASIC_TABLE_WIDTH,
                LINKS_TABLE_POSTION,LINKS_TABLE_WIDTH,
                SCHEME_HEIGHT,SCHEME_WIDTH, SCHEME_POSITION,
                TITLE_POSITION,TITLE_SIZE, TITLE_BACKGROUND,TITLE_FOREGROUND
                
                )

class ReportRenderer:
    """A class rendering a report in pptx
    requires closing after work, or use 'with' expression
    
    with ReportRenderer() as rr:
        ..."""
    def __init__(self):
        self.presentation_builder=PresentationBuilder().with_ratio(PRESENTATION_RATIO)
        self._open_streams:list[IO]=[]
    def add_exercise_slide(self,exercise_data:dict):
        exercise=ExerciseInfo(raw_data=exercise_data)
        slide=self.presentation_builder.create_slide()

        title=slide.create_title(DEFAULT_SLIDE_TITLE).at(TITLE_POSITION).with_size(TITLE_SIZE)
        title.with_foreground(TITLE_FOREGROUND).with_background(TITLE_BACKGROUND)

        decription_text=HTMLRenderer().render(exercise.description)
        basic_info_table=slide.create_table().at(BASIC_TABLE_POSITION).with_width(BASIC_TABLE_WIDTH)
        basic_info_table.append_row(exercise.title)
        basic_info_table.append_empty_row()
        basic_info_table.append_row(decription_text)
        # mayble here add default params iter

        additional_info_table=slide.create_table().at(ADDITIONAL_TABLE_POSITION).with_width(ADDITIONAL_TABLE_WIDTH)
        for row in list(exercise.additional_params.items()):
           additional_info_table.append_row(*row) 
        #maybe exercise info should return a tuples already

        links_table=slide.create_table().at(LINKS_TABLE_POSTION).with_width(LINKS_TABLE_WIDTH)
        links_table.append_row('ссылки')
        links_table.append_row('ссылки')

        #creating a scheme
        s=SchemeRenderer()
        image_stream=s.to_stream(exercise.schemes[0])
        self._open_streams.append(image_stream)
        slide.create_image(image_stream).at(SCHEME_POSITION).set_size(SCHEME_WIDTH,None)



    def add_title_slide(self,title_data:dict):
        pass
    def save(self,to:str):
        self.presentation_builder.save(to)

    def __enter__(self) -> 'ReportRenderer':
        return self
    def __exit__(self,type,value,traceback):
        self.close()
    def close(self):
        for stream in self._open_streams:
            stream.close()

