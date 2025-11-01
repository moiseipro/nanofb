
async function replaceSvgImageLinksWithDataUris(element) {
    async function blobToDataURI(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }
    const items = element.querySelectorAll('div.carousel-item.active');
    for (const item of items) {
        const images = item.querySelectorAll('image');
        for (const image of images) {
            // In SVG 2, href is on 'href' attribute. For legacy SVG, might be 'xlink:href'.
            const hrefAttr = image.getAttribute('href') || image.getAttributeNS('http://www.w3.org/1999/xlink', 'href');
            if (!hrefAttr) continue;
            if (hrefAttr.startsWith('data:')) continue;
            try {
                const response = await fetch(hrefAttr, { mode: 'cors' });
                if (!response.ok) {
                    console.warn(`Failed to fetch image at ${hrefAttr}: ${response.status} ${response.statusText}`);
                    continue;
                }
                const blob = await response.blob();
                const dataUri = await blobToDataURI(blob);
                if (image.hasAttribute('href')) {
                    image.setAttribute('href', dataUri);
                } else {
                    image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', dataUri);
                }
            } catch (error) {
                console.warn(`Error processing image href ${hrefAttr}:`, error);
            }
        }
        const imgs = item.querySelectorAll('img');
        for (const image of imgs) {
            const hrefAttr = image.getAttribute('src');
            if (!hrefAttr) continue;
            if (hrefAttr.startsWith('data:')) continue;
            try {
                const response = await fetch(hrefAttr, { mode: 'cors' });
                if (!response.ok) {
                    console.warn(`Failed to fetch image at ${hrefAttr}: ${response.status} ${response.statusText}`);
                    continue;
                }
                const blob = await response.blob();
                const dataUri = await blobToDataURI(blob);
                if (image.hasAttribute('src')) {
                    image.setAttribute('src', dataUri);
                }
            } catch (error) {
                console.warn(`Error processing image href ${hrefAttr}:`, error);
            }
        }
    }
}



$(window).on('load', function () {
    $('#send-email-training-button').on('click', async function () {
        let cBlock = $('#send-email-training-block')[0];
        let cEmail = $('#send-email-field').val().trim();
        if (!cEmail) {
            swal("Ошибка", "Пожалуйста, введите корректный email.", "error");
            return;
        }
        const opt = {
            margin: 0.1,
            filename: 'page.pdf',
            image: {type: 'jpeg', quality: 0.98},
            html2canvas: {
                scale: 1, useCORS: true,
                onclone: (element) => {
                    const svgElements = Array.from(element.querySelectorAll('svg'));
                    svgElements.forEach(s => {
                        const bBox = s.getBBox();
                        s.setAttribute("x", bBox.x);
                        s.setAttribute("y", bBox.y);
                        s.setAttribute("width", bBox.width);
                        s.setAttribute("height", bBox.height);
                    })
                }
            },
            jsPDF: {unit: 'in', format: 'letter', orientation: 'portrait'},
            pagebreak: {
                mode: ['css', 'legacy'],
                before: '.page-break-before',
                avoid: [
                    '.no-break-inside',
                    '.exercise-list > .row',
                    '.inventory-data-rows',
                    '.carousel-item'
                ]
            }
        };
        $('#send-email-training-block').addClass("to-send");
        $('#send-email-training-block').addClass("to-send");
        $('.page-loader-wrapper').fadeIn();
        replaceSvgImageLinksWithDataUris(cBlock).then(() => {
            html2pdf().set(opt).from(cBlock).outputPdf('blob').then((pdfBlob) => {
                $('#send-email-training-block').removeClass("to-send");
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64data = reader.result.split(',')[1];
                    let data_send = {'email': $('#send-email-field').val(), 'pdf_base64': base64data}
                    ajax_training_action('POST', data_send, 'send email', '', 'send_email').then((data) => {
                        console.log(data)
                    }).catch((err) => {
                        if (err.responseText.includes("email_error")) {
                            swal("Ошибка", "Пожалуйста, введите корректный email.", "error");
                        }
                        if (err.responseText.includes("pdf_error")) {
                            swal("Ошибка", "Не удалось создать PDF файл.", "error");
                        }
                        if (err.responseText.includes("sending_error")) {
                            swal("Ошибка", "Не удалось отправить письмо.", "error");
                        }
                    })
                };
                reader.readAsDataURL(pdfBlob);
            }).catch(function (err) {
                $('#send-email-training-block').removeClass("to-send");
                $('.page-loader-wrapper').fadeOut();
                swal("Ошибка", "Ошибка при генерации PDF. Попробуйте позже.", "error");
            });
        }).catch(function (err) {
            $('#send-email-training-block').removeClass("to-send");
            $('.page-loader-wrapper').fadeOut();
            swal("Ошибка", "Ошибка при изменении картинок.", "error");
        });
    })

    $('#send-email-training-modal').on('show.bs.modal', function (e) {
        let training_id = $(this).attr('data-id');
        load_training_send_email(Cookies.get('event_id'))
    })
})

function load_training_send_email(training_id) {
    let data_send = {}

    ajax_training_action('GET', data_send, 'view card', training_id).then(function (data) {
        let training = data;
        let exercises = training.exercises_info;
        $('#send-email-training-block .training-date input').val(training.event_date)
        $('#send-email-training-block .training-time input').val(training.event_time)
        if(training.players_count != null){
            $('#send-email-training-block .training-players input').val(
                training.players_count
            )
            //$('#send-email-training-block .training-players-0 input').val(training.players_count[0] + " (A)")
            //$('#send-email-training-block .training-players-1 input').val(training.players_count[1] + " (B)")
        }
        if(training.goalkeepers_count != null){
            $('#send-email-training-block .training-goalkeepers input').val(
                training.goalkeepers_count
            )
            //$('#send-email-training-block .training-goalkeepers-0 input').val(training.goalkeepers_count[0] + " (A)")
            //$('#send-email-training-block .training-goalkeepers-1 input').val(training.goalkeepers_count[1] + " (B)")
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
            $('#send-email-training-block .training-players input').val(player_count)
            $('#send-email-training-block .training-goalkeepers input').val(player_goalkeeper_count)
        }
        //$('#send-email-training-block .training-goal input').val(training.goal)
        $('#send-email-training-block .training-objective_1 input').val(training.objective_1)
        $('#send-email-training-block .training-objective_2 input').val(training.objective_2)
        $('#send-email-training-block .training-objective_3 input').val(training.objective_3)
        //$('#send-email-training-block .training-load input').val(training.load_type)
        if (training.inventory != null){
            for (const inventory_item of training.inventory) {
                let input = $('#send-email-training-block .inventory-data-rows input[name="'+inventory_item.name+'"]');
                input.val(inventory_item.value).prop('disabled', false)
                if(input.val() == '' || input.val() == 0){
                    input.closest('.inventory-col').addClass('d-none')
                } else {
                    input.closest('.inventory-col').removeClass('d-none')
                }

            }
        } else {
            $('#send-email-training-block .inventory-data-rows input').each(function () {
                $(this).val('')
                $(this).closest('.inventory-col').addClass('d-none')
            })
        }

        if(data.players_json != null && data.players_json.length > 0){
            let players_html = players_list_to_html(data.players_json)
            $('#send-email-players-data-list').html(players_html)
        } else {
            let selected_team = $('#select-team').val()
            ajax_team_action('GET', {}, 'get players', selected_team).then(function (data) {
                let players_json = data.players_json
                //console.log(players_json)
                let players_html = players_list_to_html(data.players_json)
                $('#send-email-players-data-list').html(players_html)
            })
        }

        let html_scheme = ''
        let ck_editor_data = []
        let minutes_count = 0
        if (exercises != null && exercises.length > 0) {
            let num = 0;
            for (let exercise of exercises) {
                minutes_count += exercise.duration
                html_scheme += '<div class="row no-breako no-break-inside" style="border-top: 2px solid black">'
                let count_slide = 0
                let select_html = '', carousel_html = ''
                if (exercise.scheme_img_show_first) {
                    if (exercise.scheme_img && !exercise.scheme_img_change_order) {
                        select_html += `<li data-target="#carouselTrainingSchema-${exercise.id}" data-slide-to="${count_slide}" class=""></li>`
                        count_slide++
                        carousel_html+= `
                            <div class="carousel-item">
                                <svg class="d-block bg-success mx-auto" height="100%" preserveAspectRatio="none" style="" viewBox="0 0 600 400" width="100%" xmlns="http://www.w3.org/2000/svg">
                                    <image data-height="400" data-width="600" height="100%" width="100%" href="${exercise.scheme_img}" x="0" y="0"></image>
                                </svg>
                            </div>`
                    }
                    if (exercise.scheme_img_2) {
                        select_html += `<li data-target="#carouselTrainingSchema-${exercise.id}" data-slide-to="${count_slide}" class=""></li>`
                        count_slide++
                        carousel_html+= `
                            <div class="carousel-item">
                                <svg class="d-block bg-success mx-auto" height="100%" preserveAspectRatio="none" style="" viewBox="0 0 600 400" width="100%" xmlns="http://www.w3.org/2000/svg">
                                    <image data-height="400" data-width="600" height="100%" width="100%" href="${exercise.scheme_img_2}" x="0" y="0"></image>
                                </svg>
                            </div>`
                    }
                    if (exercise.scheme_img && exercise.scheme_img_change_order) {
                        select_html += `<li data-target="#carouselTrainingSchema-${exercise.id}" data-slide-to="${count_slide}" class=""></li>`
                        count_slide++
                        carousel_html+= `
                            <div class="carousel-item">
                                <svg class="d-block bg-success mx-auto" height="100%" preserveAspectRatio="none" style="" viewBox="0 0 600 400" width="100%" xmlns="http://www.w3.org/2000/svg">
                                    <image data-height="400" data-width="600" height="100%" width="100%" href="${exercise.scheme_img}" x="0" y="0"></image>
                                </svg>
                            </div>`
                    }
                }
                if (exercise.scheme_1) {
                    select_html += `<li data-target="#carouselTrainingsend-emailSchema-${exercise.id}" data-slide-to="${count_slide}" class=""></li>`
                    count_slide++
                    carousel_html+= `
                        <div class="carousel-item">
                            <img src="https://nanofootballdraw.ru/api/canvas-draw/v1/canvas/render?id=${exercise.scheme_1}" alt="scheme" width="100%" height="100%">
                        </div>`
                }
                if (exercise.scheme_2) {
                    select_html += `<li data-target="#carouselTrainingsend-emailSchema-${exercise.id}" data-slide-to="${count_slide}" class=""></li>`
                    count_slide++
                    carousel_html+= `
                        <div class="carousel-item">
                            <img src="https://nanofootballdraw.ru/api/canvas-draw/v1/canvas/render?id=${exercise.scheme_2}" alt="scheme" width="100%" height="100%">
                        </div>`
                }
                if (!exercise.scheme_img_show_first) {
                    if (exercise.scheme_img && !exercise.scheme_img_change_order) {
                        select_html += `<li data-target="#carouselTrainingSchema-${exercise.id}" data-slide-to="${count_slide}" class=""></li>`
                        count_slide++
                        carousel_html+= `
                            <div class="carousel-item">
                                <svg class="d-block bg-success mx-auto" height="100%" preserveAspectRatio="none" style="" viewBox="0 0 600 400" width="100%" xmlns="http://www.w3.org/2000/svg">
                                    <image data-height="400" data-width="600" height="100%" width="100%" href="${exercise.scheme_img}" x="0" y="0"></image>
                                </svg>
                            </div>`
                    }
                    if (exercise.scheme_img_2) {
                        select_html += `<li data-target="#carouselTrainingSchema-${exercise.id}" data-slide-to="${count_slide}" class=""></li>`
                        count_slide++
                        carousel_html+= `
                            <div class="carousel-item">
                                <svg class="d-block bg-success mx-auto" height="100%" preserveAspectRatio="none" style="" viewBox="0 0 600 400" width="100%" xmlns="http://www.w3.org/2000/svg">
                                    <image data-height="400" data-width="600" height="100%" width="100%" href="${exercise.scheme_img_2}" x="0" y="0"></image>
                                </svg>
                            </div>`
                    }
                    if (exercise.scheme_img && exercise.scheme_img_change_order) {
                        select_html += `<li data-target="#carouselTrainingSchema-${exercise.id}" data-slide-to="${count_slide}" class=""></li>`
                        count_slide++
                        carousel_html+= `
                            <div class="carousel-item">
                                <svg class="d-block bg-success mx-auto" height="100%" preserveAspectRatio="none" style="" viewBox="0 0 600 400" width="100%" xmlns="http://www.w3.org/2000/svg">
                                    <image data-height="400" data-width="600" height="100%" width="100%" href="${exercise.scheme_img}" x="0" y="0"></image>
                                </svg>
                            </div>`
                    }
                }
                if (exercise.exercise_scheme) {
                    if (exercise.exercise_scheme['scheme_1']) {
                        select_html += `<li data-target="#carouselTrainingsend-emailSchema-${exercise.id}" data-slide-to="${count_slide}" class=""></li>`
                        count_slide++
                        carousel_html+= `
                            <div class="carousel-item">
                                ${exercise.exercise_scheme['scheme_1']}
                            </div>`
                    }
                    if (exercise.exercise_scheme['scheme_2']) {
                        select_html += `<li data-target="#carouselTrainingsend-emailSchema-${exercise.id}" data-slide-to="${count_slide}" class=""></li>`
                        count_slide++
                        carousel_html+= `
                            <div class="carousel-item">
                                ${exercise.exercise_scheme['scheme_2']}
                            </div>`
                    }
                }
                html_scheme += `
                <div class="col-4 px-0 exercise-scheme-block">
                    <div id="carouselsend-emailSchema-${exercise.id}" class="carousel slide carouselsend-emailSchema" data-ride="carousel" data-interval="false">
                        <ol class="carousel-indicators no-send-email">
                            ${select_html}
                        </ol>
                        <div class="carousel-inner">
                            ${carousel_html}
                        </div>
                        <a class="carousel-control-prev ml-2 no-send-email" href="#carouselsend-emailSchema-${exercise.id}" role="button" data-slide="prev">
                            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                            <span class="sr-only">Previous</span>
                        </a>
                        <a class="carousel-control-next no-send-email" href="#carouselsend-emailSchema-${exercise.id}" role="button" data-slide="next">
                            <span class="carousel-control-next-icon" aria-hidden="true"></span>
                            <span class="sr-only">Next</span>
                        </a>
                    </div>
                </div>
                `

                let additional_data = ''


                if (exercise.additional_json != null && Object.keys(exercise.additional_json).length > 0) {
                    for (let number of Object.keys(exercise.additional_json)) {
                        let additional = exercise.additional_json[number];
                        if ((additional.note != null && additional.note != '') || (additional.name != null && additional.name != '')){
                            additional_data += `<div class="col-4">`

                            additional_data += `
                                <div class="row">
                                    <div class="col-12 px-1 border">
                                        <input type="text" class="form-control form-control-sm border-0 text-center" value="${additional.name}" placeholder="">
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
                            <textarea id="CKeditor-email-${num}" class="ck-editor-view-block" style="max-height: 500px; min-height: 60px; height: 150px">
                                
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
                ck_editor_data.push({'id': `CKeditor-email-${num}`, 'data': exercise.description ? exercise.description : ''})
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
        $('#send-email-training-block .training-minutes input').val(minutes_count)
        $('#send-email-training-block .exercise-list').html(html_scheme)
        $('#send-email-training-block .exercise-list .carousel-inner').find('.carousel-item:first').addClass('active')
        $('#send-email-training-block .exercise-list').find('.carousel-indicators').each((index, elem) => {
            $(elem).find('li:first').addClass('active')
            $(elem).find('li').each((index2, elem2) => {
                $(elem2).attr('data-slide-to', index2)
            })
        })
        create_editor_email(ck_editor_data)
    })
}

function resize_textarea() {
    $('#send-email-training-block .exercise-list .exercise-info-block').each(function() {
        let textarea = $(this).find('.ck-editor__editable');
        console.log(textarea)
        let new_height = 245 - $(this).find(".calculate-name").height() - $(this).find(".calculate-additional").height()
        console.log(new_height)
        textarea.css('min-height', new_height+"px");
        //textarea.css('height', new_height+"px");
    });
}

function create_editor_email(editors_array) {
    //Создание редакторов
    let cLang = $('#select-language').val();
    try {
        for (let ck_data of editors_array) {
            let data = ck_data['data']
            let id = ck_data['id']
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

    } catch(e) {console.error(e)}
}