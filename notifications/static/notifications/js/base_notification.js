$(window).on("load", function () {
    generate_ajax_users_table("calc(100vh - 240px)", false)
    generate_ajax_notification_table("calc(100vh - 240px)")
    generate_ajax_notification_sent_table("calc(100vh - 240px)")


    //Загрузка сохраненных фильтров
    users_table.on('preInit.dt', function () {
        users_table.columns( '.main-setting-col' ).visible( false );
        users_table.columns( '.side-info-col' ).visible( false );
    });

    notification_sent_table.on('preInit.dt', function () {
        notification_sent_table.columns( '.additional-info-col' ).visible( false );
    });

    $('.datetimepickerfilter').datetimepicker({
        format: 'DD/MM/YYYY',
        useCurrent: false,
        buttons: {
            showClear: true,
        },
        locale: get_cur_lang(),
        icons: {
            up: "fa fa-angle-up",
            down: "fa fa-angle-down",
            next: 'fa fa-angle-right',
            previous: 'fa fa-angle-left'
        }
    });

    users_table
        .on( 'select', function ( e, dt, type, indexes ) {
            console.log(type)
            let rowData = users_table.rows( indexes ).data().toArray();
            if(type=='row') {
                let cur_edit_data = rowData[0]
                console.log(cur_edit_data)
                user_select_id = cur_edit_data.id
                notification_sent_table.columns('.notification-user-filter').search( user_select_id ).draw();
                load_user_data(user_select_id)
                check_admin_button()
            }
        })
        .on( 'deselect', function ( e, dt, type, indexes ) {
            let rowData = users_table.rows( indexes ).data().toArray();
            let cur_edit_data = rowData[0]
            if(type=='row') {
                let cur_edit_data = rowData[0]
                console.log(cur_edit_data)
                user_select_id = null
                notification_sent_table.columns('.notification-user-filter').search( '' ).draw();
            }
        })

    notification_table
        .on( 'select', function ( e, dt, type, indexes ) {
            console.log(type)
            let rowData = notification_table.rows( indexes ).data().toArray();
            if(type=='row') {
                let cur_edit_data = rowData[0]
                console.log(cur_edit_data)
                notification_select_id = cur_edit_data.id
                //users_table.columns('.notification-user-filter').search( user_select_id ).draw();
            }
        })
        .on( 'deselect', function ( e, dt, type, indexes ) {
            let rowData = notification_table.rows( indexes ).data().toArray();
            let cur_edit_data = rowData[0]
            if(type=='row') {
                let cur_edit_data = rowData[0]
                console.log(cur_edit_data)
                notification_select_id = null
                //users_table.columns('.notification-user-filter').search( '' ).draw();
            }
        })

    $('#notification-create-button').on('click', function () {
        let notification_form = $('#notification-form')
        if (notification_select_id == null){
            notification_form.attr('method', 'POST')
            notification_form.find('#notification-title').val('')
            document.notificationEditor.setData('')
        }

    })

    // Submitting a notification creation form
    $('#notification-form').submit(function (event) {
        event.preventDefault();

        let form_data = $(this).serializeArray()
        let method = $(this).attr('method')
        //let id = $(this).attr('data-id')
        let form_list = {}
        for (const key in form_data) {
            if (form_data[key].name=='date_receiving'){
                form_data[key].value = moment(form_data[key].value).format('DD/MM/YYYY hh:mm')
            }
            form_list[form_data[key].name] = form_data[key].value
        }
        console.log(form_list)

        ajax_notification_action(method, form_list, 'notification', notification_select_id).then(function (data) {
            console.log(data)
            notification_table.ajax.reload();
            notification_select_id = null
            $('#notification-table-button').click()
        })
    })

    // Submitting a notification creation form
    $('#notification-send-form').submit(function (event) {
        event.preventDefault();
        let form_data = $(this).serializeArray()
        let method = $(this).attr('method')
        let id = $(this).attr('data-id')
        let user_table_data = users_table.ajax.json()
        console.log(form_data)
        let form_list = {}
        for (const key in form_data) {
            form_list[form_data[key].name] = form_data[key].value
        }
        let send_data = []
        if (user_select_id == null){
            for (const user of user_table_data.data) {
                send_data.push({
                    'user': user.id,
                    'notification': form_data.find((element) => element.name == "notification").value,
                    'date_receiving': moment(form_data.find((element) => element.name == "date_receiving").value).format('DD/MM/YYYY hh:mm')
                })
            }
        } else {
            send_data = {
                'user': user_select_id,
                'notification': form_data.find((element) => element.name == "notification").value,
                'date_receiving': moment(form_data.find((element) => element.name == "date_receiving").value).format('DD/MM/YYYY hh:mm')
            }
        }

        console.log(send_data)

        ajax_notification_send_action(method, send_data , 'notification', id).then(function (data) {
            console.log(data)
            notification_sent_table.ajax.reload();
        })


    })

    notification_table.on('click', '.delete-notification', function (){
        let id = $(this).attr('data-id')
        let send_data = {}

        ajax_notification_action('DELETE', send_data, 'notification', id).then(function (data) {
            console.log(data)
            notification_table.ajax.reload();
        })
    })

    notification_table.on('click', '.edit-notification', function (){
        let id = $(this).attr('data-id')
        let send_data = {}

        let notification_form = $('#notification-form')

        ajax_notification_action('GET', send_data, 'notification', id).then(function (data) {
            console.log(data)

            if (notification_select_id != null) {
                notification_form.attr('method', 'PUT')
                notification_form.find('#notification-title').val(data.title)
                document.notificationEditor.setData(data.content)
                $('#notification-create-button').click()
            }

        })
    })

    $('#notification-table-button').on('shown.bs.tab', function () {
        notification_table.columns.adjust();
    })

    notification_sent_table.on('click', '.delete-sent-notification', function (){
        let id = $(this).attr('data-id')
        let send_data = {}

        ajax_notification_send_action('DELETE', send_data, 'notification', id).then(function (data) {
            console.log(data)
            notification_sent_table.ajax.reload();
        })
    })

    $('#notification-send-table-button').on('shown.bs.tab', function () {
        notification_sent_table.columns.adjust();
    })
})

$(function() {
    let cLang = $('#select-language').val();
    try {
        document.notificationEditor = CKEDITOR.replace('notification-editor', {
            language: cLang,
            removePlugins: ['elementspath'],
            extraPlugins: ['openlink', 'chart'],
            toolbar: [
                {
                    name: 'clipboard',
                    groups: ['clipboard', 'undo'],
                    items: ['Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo']
                },
                {
                    name: 'editing',
                    groups: ['find', 'selection', 'spellchecker'],
                    items: ['Find', 'Replace', '-', 'SelectAll', '-', 'Scayt', 'Iframe']
                },
                {
                    name: 'basicstyles',
                    groups: ['basicstyles', 'cleanup'],
                    items: ['Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'RemoveFormat']
                },
                {
                    name: 'paragraph',
                    groups: ['list', 'indent', 'blocks', 'align', 'bidi'],
                    items: ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock']
                },
                {name: 'links', items: ['Link', 'Unlink', 'Anchor']},
                {name: 'insert', items: ['Image', 'Flash', 'Table', 'HorizontalRule', 'Smiley', 'SpecialChar']},
                {name: 'styles', items: ['Styles', 'Format', 'Font', 'FontSize']},
                {name: 'colors', items: ['TextColor', 'BGColor']},
                {name: 'new', items: ['Chart']},
            ],
            //height: '61vh',
            filebrowserBrowseUrl: '/notification/ckeditorbrowse/',
            filebrowserImageBrowseUrl: '/notification/ckeditorbrowse/',
            filebrowserUploadUrl: '/notification/ckeditorupload/',
            filebrowserImageUploadUrl: '/notification/ckeditorupload/',
        });
        document.articleEditor.on('change', (evt) => {
            $('iframe.cke_wysiwyg_frame').ready((e) => {
                $(document).find('iframe.cke_wysiwyg_frame').contents().find('body').find('div.chartjs-legend').find('.pie-legend-text').css('width', 'auto');
                $(document).find('iframe.cke_wysiwyg_frame').contents().find('body').find('div.chartjs-legend').find('.polararea-legend-text').css('width', 'auto');
                $(document).find('iframe.cke_wysiwyg_frame').contents().find('body').find('div.chartjs-legend').find('.doughnut-legend-text').css('width', 'auto');
            });
        });
    } catch (e) {
    }
    try {
        document.articleViewer = CKEDITOR.replace('articleViewer', {
            language: cLang,
            removePlugins: ['elementspath', 'resize'],
            extraPlugins: ['openlink', 'chart'],
            toolbar: [
                {
                    name: 'clipboard',
                    groups: ['clipboard', 'undo'],
                    items: ['Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo']
                },
                {
                    name: 'editing',
                    groups: ['find', 'selection', 'spellchecker'],
                    items: ['Find', 'Replace', '-', 'SelectAll', '-', 'Scayt', 'Iframe']
                },
                {
                    name: 'basicstyles',
                    groups: ['basicstyles', 'cleanup'],
                    items: ['Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'RemoveFormat']
                },
                {
                    name: 'paragraph',
                    groups: ['list', 'indent', 'blocks', 'align', 'bidi'],
                    items: ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock']
                },
                {name: 'links', items: ['Link', 'Unlink', 'Anchor']},
                {name: 'insert', items: ['Image', 'Flash', 'Table', 'HorizontalRule', 'Smiley', 'SpecialChar']},
                {name: 'styles', items: ['Styles', 'Format', 'Font', 'FontSize']},
                {name: 'colors', items: ['TextColor', 'BGColor']},
                {name: 'new', items: ['Chart']},
            ],
            height: '83vh',
            readOnly: true,
            on: {
                instanceReady: (evt) => {
                    $(`#cke_${evt.editor.name}`).find('.cke_top').addClass('d-none')
                },
                contentDom: (evt) => {
                    let editable = evt.editor.editable();
                    editable.attachListener(editable, 'click', (evt2) => {
                        let link = new CKEDITOR.dom.elementPath(evt2.data.getTarget(), this).contains('a');
                        if (link && evt2.data.$.button != 2 && link.isReadOnly()) {
                            window.open(link.getAttribute('href'));
                        }
                    }, null, null, 15);
                }
            }
        });
        document.articleViewer.on('change', (evt) => {
            $('iframe.cke_wysiwyg_frame').ready((e) => {
                $(document).find('iframe.cke_wysiwyg_frame').contents().find('body').find('div.chartjs-legend').find('.pie-legend-text').css('width', 'auto');
                $(document).find('iframe.cke_wysiwyg_frame').contents().find('body').find('div.chartjs-legend').find('.polararea-legend-text').css('width', 'auto');
                $(document).find('iframe.cke_wysiwyg_frame').contents().find('body').find('div.chartjs-legend').find('.doughnut-legend-text').css('width', 'auto');

                window.videoPlayerMethodology = [];
                $(document).find('iframe.cke_wysiwyg_frame:first').contents().find('body').find('a').each((ind, elem) => {
                    let href = $(elem).attr('href');
                    if ($(elem).hasClass('_doc_')) {
                        $(elem).parent().after(`
                            <p style="height: 86vh;">
                                <object class="content-view" width="100%" height="100%" type="application/pdf" data="${href}">
                                </object>
                            </p>
                        `);
                        // $(elem).parent().remove();
                    } else if ($(elem).hasClass('_video_')) {
                        let nfbVideoId = null;
                        if (href.includes("213.108.4.28/video/player/")) {
                            nfbVideoId = href;
                            nfbVideoId = nfbVideoId.split("/player/")[1];
                        }

                        $(document).find('iframe.cke_wysiwyg_frame:first').contents().find('head').append(`
                            <link type="text/css" rel="stylesheet" href="/static/video-js-7.20.0/video-js.min.css">
                        `);
                        $(elem).after(`
                            ${nfbVideoId != null ? `
                                <video id="video-player-methodology-${ind}" class="video-js resize-block video-modal" poster="https://nanofootball.pro/video/poster/${nfbVideoId}">
                                    <source src="${href}" type="video/mp4" />
                                </video>
                            ` : `
                                <video id="video-player-methodology-${ind}" class="video-js resize-block video-modal" poster="">
                                    <source src="${href}" type="video/youtube" />
                                </video>
                            `}
                        `);
                        window.videoPlayerMethodology.push(videojs(
                            $(document).find('iframe.cke_wysiwyg_frame:first').contents().find('body').find(`#video-player-methodology-${ind}`)[0], {
                                preload: 'auto',
                                autoplay: false,
                                controls: true,
                                aspectRatio: '16:9',
                                youtube: {
                                    "iv_load_policy": 1,
                                    'modestbranding': 1,
                                    'rel': 0,
                                    'showinfo': 0,
                                    'controls': 0
                                },
                            }));

                        $(elem).remove();
                    }
                });
                for (let i = 0; i < window.videoPlayerMethodology.length; i++) {
                    window.videoPlayerMethodology[i].load();
                    window.videoPlayerMethodology[i].ready((e) => {
                        $(document).find('iframe.cke_wysiwyg_frame:first').contents().find('body').find(`#video-player-methodology-${i}`)
                            .css('height', '88vh');
                    });
                }
            });
        });
    } catch (e) {
    }
})