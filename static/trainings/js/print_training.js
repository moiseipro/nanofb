
$(window).on('load', function () {
    //Распечатать тренировку
    $('#print-training-button').on('click', function () {
        resize_textarea()
        $('#print-training-block .form-control').each(function () {
            $(this).addClass('hide-placeholder')
        })
        $("#print-training-block").print({
            timeout: 8000,
            stylesheet: $('#print-style-href').val(),
            // prepend: `
            //     <div class="font-weight-bold px-2 py-1 text-right">nanofootball.com</div>
            // `
        });
        $('#print-training-block .form-control').each(function () {
            $(this).removeClass('hide-placeholder')
        })
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
        $('#print-training-block .training-time input').val(training.event_time)
        if(training.players_count != null){
            $('#print-training-block .training-players input').val(
                "(A) " + training.players_count[0] + " (B) " + training.players_count[1]
            )
            //$('#print-training-block .training-players-0 input').val(training.players_count[0] + " (A)")
            //$('#print-training-block .training-players-1 input').val(training.players_count[1] + " (B)")
        }
        if(training.goalkeepers_count != null){
            $('#print-training-block .training-goalkeepers input').val(
                "(A) " + training.goalkeepers_count[0] + " (B) " + training.goalkeepers_count[1]
            )
            //$('#print-training-block .training-goalkeepers-0 input').val(training.goalkeepers_count[0] + " (A)")
            //$('#print-training-block .training-goalkeepers-1 input').val(training.goalkeepers_count[1] + " (B)")
        }
        let player_count = 0
        let player_goalkeeper_count = 0
        if(training.protocol_info != null && training.protocol_info.length != 0){
            for (const player of training.protocol_info) {
                if(player.status==null){
                    if(player.is_goalkeeper) player_goalkeeper_count++
                    player_count++
                }
            }
            $('#print-training-block .training-players input').val(player_count)
            $('#print-training-block .training-goalkeepers input').val(player_goalkeeper_count)
        }
        //$('#print-training-block .training-goal input').val(training.goal)
        $('#print-training-block .training-objective_1 input').val(training.objective_1)
        $('#print-training-block .training-objective_2 input').val(training.objective_2)
        $('#print-training-block .training-objective_3 input').val(training.objective_3)
        //$('#print-training-block .training-load input').val(training.load_type)

        let html_scheme = ''
        let ck_editor_data = []
        let minutes_count = 0
        if (exercises.length > 0) {
            let num = 0;
            for (let exercise of exercises) {
                minutes_count += exercise.duration
                html_scheme += '<div class="row" style="border-top: 2px solid black">'
                let count_slide = 0
                let select_html = '', carousel_html = ''
                if (exercise.scheme_img) {
                    select_html += `<li data-target="#carouselTrainingSchema-${exercise.id}" data-slide-to="${count_slide}" class="active"></li>`
                    count_slide++
                    carousel_html+= `
                        <div class="carousel-item active">
                            <svg class="d-block bg-success mx-auto" height="100%" preserveAspectRatio="none" style="" viewBox="0 0 600 400" width="100%" xmlns="http://www.w3.org/2000/svg">
                                <image data-height="400" data-width="600" height="100%" width="100%" href="${exercise.scheme_img}" x="0" y="0"></image>
                            </svg>
                        </div>`
                }
                if(exercise.scheme_1){
                    select_html += `<li data-target="#carouselTrainingPrintSchema-${exercise.id}" data-slide-to="${count_slide}" class="${!exercise.scheme_img ? 'active': ''}"></li>`
                    count_slide++
                    carousel_html+= `
                        <div class="carousel-item ${!exercise.scheme_img ? 'active': ''}">
                            <img src="https://nanofootballdraw.ru/api/canvas-draw/v1/canvas/render?id=${exercise.scheme_1}" alt="scheme" width="100%" height="100%">
                        </div>`
                }
                if(exercise.scheme_2){
                    select_html += `<li data-target="#carouselTrainingPrintSchema-${exercise.id}" data-slide-to="${count_slide}" class="${!exercise.scheme_img && !exercise.scheme_1 ? 'active': ''}"></li>`
                    count_slide++
                    carousel_html+= `
                        <div class="carousel-item ${!exercise.scheme_img && !exercise.scheme_1 ? 'active': ''}">
                            <img src="https://nanofootballdraw.ru/api/canvas-draw/v1/canvas/render?id=${exercise.scheme_2}" alt="scheme" width="100%" height="100%">
                        </div>`
                }
                if(exercise.exercise_scheme){
                    if(exercise.exercise_scheme['scheme_1']){
                        select_html += `<li data-target="#carouselTrainingPrintSchema-${exercise.id}" data-slide-to="${count_slide}" class="${!exercise.scheme_img && !exercise.scheme_1 && !exercise.scheme_2  ? 'active': ''}"></li>`
                        count_slide++
                        carousel_html+= `
                            <div class="carousel-item ${!exercise.scheme_img && !exercise.scheme_1 && !exercise.scheme_2  ? 'active': ''}">
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
                                    <div class="col-12 px-1 border text-center">
                                        <b>${additional.name}</b>
                                    </div>
                                </div>
                            `
                            // <div class="col-6 px-1 border text-center">
                            //     ${additional.note}
                            // </div>
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
                            <textarea id="CKeditor-${num}" class="ck-editor-view-block" style="max-height: 500px; min-height: 60px; height: 150px">
                                
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
                ck_editor_data.push({'id': `CKeditor-${num}`, 'data': exercise.description ? exercise.description : ''})
                html_scheme += '</div>'
                html_scheme += '<div class="row">'
                html_scheme += `
                    <div class="col-2 text-center">---</div>
                    <div class="col-2 text-center">---</div>
                    <div class="col-8"></div>
                `
                html_scheme += '</div>'
                num++
            }

        }
        $('#print-training-block .training-minutes input').val(minutes_count)
        $('#print-training-block .exercise-list').html(html_scheme)
        create_editor(ck_editor_data)
    })
}

function resize_textarea() {
    $('#print-training-block .exercise-list .exercise-info-block').each(function() {
        let textarea = $(this).find('.ck-editor__editable');
        console.log(textarea)
        let new_height = 245 - $(this).find(".calculate-name").height() - $(this).find(".calculate-additional").height()
        console.log(new_height)
        textarea.css('min-height', new_height+"px");
        //textarea.css('height', new_height+"px");
    });
}

function create_editor(editors_array) {
    //Создание редакторов
    let cLang = $('#select-language').val();
    try {
        console.log(editors_array)
        for (let ck_data of editors_array) {
            let data = ck_data['data']
            let id = ck_data['id']
            console.log(id)
            CKSource.Editor
            .create(document.querySelector('#'+id), {
                licenseKey: '',
                language: cLang,
                removePlugins: ['Title'],
                fontSize: {
                    options: [
                        10,
                        11,
                        12,
                        13,
                        'default',
                        15,
                        16,
                        17,
                        18,
                    ]
                },
                toolbar: false
            })
            .then( editor => {
                //document.editor = editor;

                const toolbarElement = editor.ui.view.toolbar.element;
                editor.on( 'change:isReadOnly', ( evt, propertyName, isReadOnly ) => {
                    if ( isReadOnly ) {
                        toolbarElement.style.display = 'none';
                    } else {
                        toolbarElement.style.display = 'none';
                        //toolbarElement.style.display = 'flex';
                    }
                } );
                $('.resizeable-block').css('height', `100%`);
                editor.setData(data)
                return editor;
            })
        }

    } catch(e) {}
}