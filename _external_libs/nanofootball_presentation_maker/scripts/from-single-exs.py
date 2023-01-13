import nf_presentation

nf_presentation.from_single_exercise(
    input_data='test',
    output_file='single.pptx'
)


data=nf_presentation.from_single_exercise(
    input_data='test'
)

print(data)