
$(window).on('load', function () {
    //Распечатать тренировку
    $('#print-training-button').on('click', function () {
        $("#print-training-block").print({
            timeout: 8000,
            stylesheet: $('#print-style-href').val()
        });
    })

    $('#print-training-modal').on('show.bs.modal', function (e) {
        let training_id = $(this).attr('data-id');
        load_training_print(training_id)
    })
})

function load_training_print(training_id) {
    let data_send = {}

    ajax_training_action('GET', data_send, 'view card', training_id).then(function (data) {
        console.log(data)
        let training = data;
        let exercises = training.exercises_info;
        $('#print-training-block .training-date input').val(training.event_date)
        $('#print-training-block .training-time input').val(training.event_time)
        if(training.players_count != null){
            $('#print-training-block .training-players-0 input').val(training.players_count[0] + " (A)")
            $('#print-training-block .training-players-1 input').val(training.players_count[1] + " (B)")
        }
        if(training.goalkeepers_count != null){
            $('#print-training-block .training-goalkeepers-0 input').val(training.goalkeepers_count[0] + " (A)")
            $('#print-training-block .training-goalkeepers-1 input').val(training.goalkeepers_count[1] + " (B)")
        }
        $('#print-training-block .training-goal input').val(training.goal)
        $('#print-training-block .training-objective_1 input').val(training.objective_1)
        $('#print-training-block .training-objective_2 input').val(training.objective_2)
        $('#print-training-block .training-load input').val(training.load_type)

        let html_scheme = ''
        if (exercises.length > 0) {
            for (let exercise of exercises) {
                html_scheme += '<div class="row" style="border-top: 2px solid black">'
                let count_slide = 0
                let select_html = '', carousel_html = ''
                if(exercise.scheme_1){
                    select_html += `<li data-target="#carouselTrainingPrintSchema-${exercise.id}" data-slide-to="${count_slide}" class="active"></li>`
                    count_slide++
                    carousel_html+= `
                        <div class="carousel-item active">
                            <img src="http://62.113.105.179/api/canvas-draw/v1/canvas/render?id=${exercise.scheme_1}" alt="scheme" width="100%" height="100%">
                        </div>`
                }
                if(exercise.scheme_2){
                    select_html += `<li data-target="#carouselTrainingPrintSchema-${exercise.id}" data-slide-to="${count_slide}" class="${!exercise.scheme_1 ? 'active': ''}"></li>`
                    count_slide++
                    carousel_html+= `
                        <div class="carousel-item ${!exercise.scheme_1 ? 'active': ''}">
                            <img src="http://62.113.105.179/api/canvas-draw/v1/canvas/render?id=${exercise.scheme_2}" alt="scheme" width="100%" height="100%">
                        </div>`
                }
                if(exercise.exercise_scheme){
                    if(exercise.exercise_scheme['scheme_1']){
                        select_html += `<li data-target="#carouselTrainingPrintSchema-${exercise.id}" data-slide-to="${count_slide}" class="${!exercise.scheme_1 && !exercise.scheme_2  ? 'active': ''}"></li>`
                        count_slide++
                        carousel_html+= `
                            <div class="carousel-item ${!exercise.scheme_1 && !exercise.scheme_2  ? 'active': ''}">
                                ${exercise.exercise_scheme['scheme_1']}
                            </div>`
                    }
                    if(exercise.exercise_scheme['scheme_2']){
                        select_html += `<li data-target="#carouselTrainingPrintSchema-${exercise.id}" data-slide-to="${count_slide}" class=""></li>`
                        count_slide++
                        carousel_html+= `
                            <div class="carousel-item">
                                ${exercise.exercise_scheme['scheme_2']}
                            </div>`
                    }
                }
                html_scheme += `
                <div class="col-4 px-0 exercise-scheme-block">
                    <div id="carouselPrintSchema-${exercise.id}" class="carousel slide carouselPrintSchema" data-ride="carousel" data-interval="false">
                        <ol class="carousel-indicators no-print">
                            ${select_html}
                        </ol>
                        <div class="carousel-inner">
                            ${carousel_html}
                        </div>
                        <a class="carousel-control-prev ml-2 no-print" href="#carouselPrintSchema-${exercise.id}" role="button" data-slide="prev">
                            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                            <span class="sr-only">Previous</span>
                        </a>
                        <a class="carousel-control-next no-print" href="#carouselPrintSchema-${exercise.id}" role="button" data-slide="next">
                            <span class="carousel-control-next-icon" aria-hidden="true"></span>
                            <span class="sr-only">Next</span>
                        </a>
                    </div>
                </div>
                `

                let additional_data = ''


                if (exercise.additional_json != null && Object.keys(exercise.additional_json).length > 0) {
                    console.log(Object.keys(exercise.additional_json).length)
                    for (let number of Object.keys(exercise.additional_json)) {
                        let additional = exercise.additional_json[number];
                        console.log(additional)
                        if ((additional.note != null && additional.note != '') || (additional.name != null && additional.name != '')){
                            additional_data += '<div class="col-6">'

                            additional_data += `
                                <div class="row">
                                    <div class="col-6 px-1 border">
                                        <b>${additional.name}</b>
                                    </div>
                                    <div class="col-6 px-1 border text-center">
                                        ${additional.note}
                                    </div>
                                </div>
                            `

                            additional_data += '</div>'
                        }
                    }
                }
                // if (exercise.additional.length > 0) {
                //     for (let additional of exercise.additional) {
                //         if (additional.note != null && additional.note != ''){
                //             additional_data += '<div class="col-6">'
                //
                //             additional_data += `
                //                 <div class="row">
                //                     <div class="col-6 px-1 border">
                //                         <b>${get_translation_name(additional.additional_name)}</b>
                //                     </div>
                //                     <div class="col-6 px-1 border text-center">
                //                         ${additional.note}
                //                     </div>
                //                 </div>
                //             `
                //
                //             additional_data += '</div>'
                //         }
                //
                //     }
                // }

                html_scheme += `
                <div class="col-8 exercise-info-block">
                    <div class="row h-100">
                        <div class="col-10 px-1 align-self-start calculate-name border" style="background: #efefef">
                            <input type="text" class="form-control form-control-sm border-0 font-weight-bold text-center" placeholder="${gettext("Title")}" value="${get_translation_name(exercise.exercise_name)}">
                        </div>
                        <div class="col-2 px-1 align-self-start border">
                            <input type="text" class="form-control form-control-sm border-0 font-weight-bold text-center" placeholder="${gettext("Duration")}" value="(${exercise.duration}\`)">
                        </div>

                        <div class="col-12 px-0 align-self-start">
                            <textarea class="form-control form-control-sm rounded-0" rows="5" cols="5" style="max-height: 500px; min-height: 60px; height: 150px">
                                ${exercise.description ? exercise.description : ''}
                            </textarea>
                        </div>
                        <div class="col-12 align-self-end calculate-additional">
                            <div class="row">
                            ${additional_data}
                            </div>
                        </div>
                        
                    </div>
                </div>
                `
                html_scheme += '</div>'
                html_scheme += '<div class="row">'
                html_scheme += `
                    <div class="col-2 text-center">---</div>
                    <div class="col-2 text-center">---</div>
                    <div class="col-8"></div>
                `
                html_scheme += '</div>'
            }

        }
        $('#print-training-block .exercise-list').html(html_scheme)
        resize_textarea()

    })
}

function resize_textarea() {
    $('#print-training-block .exercise-list .exercise-info-block').each(function() {
        let textarea = $(this).find('textarea');
        console.log(textarea)
        let new_height = 242 - $(this).find(".calculate-name").height() - $(this).find(".calculate-additional").height()
        console.log(new_height)
        textarea.css('min-height', new_height+"px");
        textarea.css('height', new_height+"px");
    });
}