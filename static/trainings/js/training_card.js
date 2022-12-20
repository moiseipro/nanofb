$(window).on('load', function (){
    $('#training-content').on('click', '.group-filter-card', function () {
        let group_id = $(this).attr('data-group')
        console.log(group_id)
        $('.training-info .exercise-visual-block').addClass('d-none').addClass('col-4').removeClass('col-12')
        $('.training-info .exercise-visual-block[data-group="'+group_id+'"]').removeClass('d-none')

        $('#training-content .group-filter-card').removeClass('active')
        $('#training-content .exs-filter-card').removeClass('active')
        $(this).addClass('active')
    })
    $('#training-content').on('click', '.exs-filter-card', function () {
        let exs_id = $(this).attr('data-id')
        console.log(exs_id)
        $('.training-info .exercise-visual-block').addClass('d-none').addClass('col-4').removeClass('col-12')
        $('.training-info .exercise-visual-block[data-id="'+exs_id+'"]').removeClass('d-none').removeClass('col-4').addClass('col-12')


        $('#training-content .group-filter-card').removeClass('active')
        $('#training-content .exs-filter-card').removeClass('active')
        $(this).addClass('active')
    })
})

function show_training_card(id = ''){
    if (id == '' || id == null) {
        $('#training-content').removeClass('d-none')
        console.log('id is empty')
        return false;
    }
    let data_send = {}
    ajax_training_action('GET', data_send, 'view card', id).then(function (data) {
        console.log(data)
        let count_1 = 0, count_2 = 0;
        let html_group_1 = `
                <div class="col px-0">
                    <button data-group="1" class="btn btn-sm btn-info btn-block border-white rounded-0 group-filter-card">A</button>
                </div>`
        let html_group_2 = `
                <div class="col px-0">
                    <button data-group="2" class="btn btn-sm btn-info btn-block border-white rounded-0 group-filter-card">B</button>
                </div>`
        $.each( data.exercises_info, function( key, value ) {
            if (value.group==1){
                html_group_1 += `
                <div class="col px-0">
                    <button data-id="${value.id}" class="btn btn-sm btn-info btn-block border-white rounded-0 exs-filter-card" title="${(get_cur_lang() in value.exercise_name) ? value.exercise_name[get_cur_lang()] : Object.values(value.exercise_name)[0]}">${count_1+1}</button>
                </div>`
                count_1++
            } else if (value.group==2){
                html_group_2 += `
                <div class="col px-0">
                    <button data-id="${value.id}" class="btn btn-sm btn-info btn-block border-white rounded-0 exs-filter-card" title="${(get_cur_lang() in value.exercise_name) ? value.exercise_name[get_cur_lang()] : Object.values(value.exercise_name)[0]}">${count_2+1}</button>
                </div>`
                count_2++
            }
        });
        if (count_1<count_2){
            for (let i=0; i < count_2-count_1; i++){
                html_group_1 += `
                <div class="col px-0">
                </div>`
            }
        } else {
            for (let i=0; i < count_1-count_2; i++){
                html_group_2 += `
                <div class="col px-0">
                </div>`
            }
        }
        $('.exercise-list[data-group="1"]').html(html_group_1)
        $('.exercise-list[data-group="2"]').html(html_group_2)

        let html_scheme = ``
        if (data.exercises_info.length > 0) {
            let exercises = data.exercises_info
            for (let exercise of exercises) {
                html_scheme += `
                <div class="col-4 pb-2 px-1 exercise-visual-block" data-id="${exercise.id}" data-exs-id="${exercise.exercise_id}" data-group="${exercise.group}">
                    <div id="carouselTrainingSchema-${exercise.id}" class="carousel slide carouselSchema" data-ride="carousel" data-interval="false">
                        <ol class="carousel-indicators">
                            <li data-target="#carouselTrainingSchema-${exercise.id}" data-slide-to="0" class="active"></li>
                            <li data-target="#carouselTrainingSchema-${exercise.id}" data-slide-to="1"></li>
                        </ol>
                        <div class="carousel-inner">
                            <div class="carousel-item active">
                                ${exercise.exercise_scheme ? exercise.exercise_scheme['scheme_1'] : ''}
                            </div>
                            <div class="carousel-item">
                                ${exercise.exercise_scheme ? exercise.exercise_scheme['scheme_2'] : ''}
                            </div>
                        </div>
                        <a class="carousel-control-prev ml-2" href="#carouselTrainingSchema-${exercise.id}" role="button" data-slide="prev">
                            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                            <span class="sr-only">Previous</span>
                        </a>
                        <a class="carousel-control-next" href="#carouselTrainingSchema-${exercise.id}" role="button" data-slide="next">
                            <span class="carousel-control-next-icon" aria-hidden="true"></span>
                            <span class="sr-only">Next</span>
                        </a>
                    </div>
                    <div class="row text-center">
                        <div class="col-12"><div class="w-100 border text-truncate">${(get_cur_lang() in exercise.exercise_name) ? exercise.exercise_name[get_cur_lang()] : Object.values(exercise.exercise_name)[0]}</div></div>
                    </div>
                    <div class="row">
                        <div class="col-12 additional-data-block"></div>
                    </div>
                </div>
                `
            }
        }

        $('#training-content .training-info').html(html_scheme)
        $('#training-content .group-filter-card[data-group="1"]').click()
        $('#training-content').removeClass('d-none')
    })
}

function hide_training_card() {
    $('#training-content').addClass('d-none')
}

function toggle_training_card() {
    $('#training-content').toggleClass('d-none')
}