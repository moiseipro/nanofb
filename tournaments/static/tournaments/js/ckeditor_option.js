function UpdateArticleViewer() {
    window.videoPlayerTournaments = [];
    $('#articleViewer').find('a').each((ind, elem) => {
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
            if (href.includes("/video/player/")) {
                nfbVideoId = href;
                nfbVideoId = nfbVideoId.split("/player/")[1];
            }
            $(elem).after(`
                ${nfbVideoId != null ? `
                    <video id="video-player-tournaments-${ind}" class="video-js" poster="https://nanofootball.pro/video/poster/${nfbVideoId}">
                        <source src="${href}" type="video/mp4" />
                    </video>
                ` : `
                    <video id="video-player-tournaments-${ind}" class="video-js" poster="">
                        <source src="${href}" type="video/youtube" />
                    </video>
                `}
            `);
            window.videoPlayerTournaments.push(videojs(
                $('#articleViewer').find(`#video-player-tournaments-${ind}`)[0], {
                preload: 'auto',
                autoplay: false,
                controls: true,
                aspectRatio: '16:9',
                youtube: { "iv_load_policy": 1, 'modestbranding': 1, 'rel': 0, 'showinfo': 0, 'controls': 0 },
            }));
            $(elem).remove();
        }
    });
    for (let i = 0; i < window.videoPlayerTournaments.length; i++) {
        window.videoPlayerTournaments[i].load();
        window.videoPlayerTournaments[i].ready((e) => {
            $('#articleViewer').find(`#video-player-tournaments-${i}`).parent().css('min-height', '70vh');
            $('#articleViewer').find(`#video-player-tournaments-${i}`).parent().css('max-height', '70vh');
        });
    }
}



$(function() {
    let cLang = $('#select-language').val();

    try {
        document.articleEditor = CKEDITOR.replace('articleEditor', {
            language: cLang,
            extraPlugins: ['openlink', 'chart', 'sourcedialog', 'pagebreak'],
            toolbar: [
                {name: 'clipboard', groups: ['clipboard', 'undo' ], items: [ 'Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo']},
                {name: 'editing', groups: ['find', 'selection', 'spellchecker' ], items: [ 'Find', 'Replace', '-', 'SelectAll', '-', 'Scayt', 'Iframe']},
                {name: 'basicstyles', groups: ['basicstyles', 'cleanup' ], items: [ 'Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'RemoveFormat']},
                {name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align', 'bidi' ], items: [ 'NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock']},
                {name: 'links', items: ['Link', 'Unlink', 'Anchor']},
                {name: 'insert', items: ['Image', 'Flash', 'Table', 'HorizontalRule', 'Smiley', 'SpecialChar']},
                {name: 'styles', items: ['Styles', 'Format', 'Font', 'FontSize']},
                {name: 'colors', items: ['TextColor', 'BGColor']},
                {name: 'new', items: ['Chart', 'Source', 'PageBreak']},
            ],
            extraAllowedContent: 'iframe[*]',
            height: '70vh',
            filebrowserBrowseUrl: '/tournaments/ckeditorbrowse/',
            filebrowserImageBrowseUrl: '/tournaments/ckeditorbrowse/',
            filebrowserUploadUrl: '/tournaments/ckeditorupload/',
            filebrowserImageUploadUrl: '/tournaments/ckeditorupload/',
        });
        document.articleEditor.on('change', (evt) => {
            $('iframe.cke_wysiwyg_frame').ready((e) => {
                $(document).find('iframe.cke_wysiwyg_frame').contents().find('body').find('div.chartjs-legend').find('.pie-legend-text').css('width', 'auto');
                $(document).find('iframe.cke_wysiwyg_frame').contents().find('body').find('div.chartjs-legend').find('.polararea-legend-text').css('width', 'auto');
                $(document).find('iframe.cke_wysiwyg_frame').contents().find('body').find('div.chartjs-legend').find('.doughnut-legend-text').css('width', 'auto');
            });
        });
    } catch(e) {}

    // try {
    //     document.articleViewer = CKEDITOR.replace('articleViewer', {
    //         language: cLang,
    //         removePlugins: ['elementspath', 'resize'],
    //         extraPlugins: ['openlink', 'chart', 'pagebreak'],
    //         toolbar: [
    //             {name: 'clipboard', groups: ['clipboard', 'undo' ], items: [ 'Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo']},
    //             {name: 'editing', groups: ['find', 'selection', 'spellchecker' ], items: [ 'Find', 'Replace', '-', 'SelectAll', '-', 'Scayt', 'Iframe']},
    //             {name: 'basicstyles', groups: ['basicstyles', 'cleanup' ], items: [ 'Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'RemoveFormat']},
    //             {name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align', 'bidi' ], items: [ 'NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock']},
    //             {name: 'links', items: ['Link', 'Unlink', 'Anchor']},
    //             {name: 'insert', items: ['Image', 'Flash', 'Table', 'HorizontalRule', 'Smiley', 'SpecialChar']},
    //             {name: 'styles', items: ['Styles', 'Format', 'Font', 'FontSize']},
    //             {name: 'colors', items: ['TextColor', 'BGColor']},
    //             {name: 'new', items: ['Chart', 'Source', 'PageBreak']},
    //         ],
    //         extraAllowedContent: 'iframe[*]',
    //         height: '80vh',
    //         readOnly: true,
    //         on: {
    //             instanceReady: (evt) => {
    //                 $(`#cke_${evt.editor.name}`).find('.cke_top').addClass('d-none')
    //             },
    //             contentDom: (evt) => {
    //                 let editable = evt.editor.editable();
    //                 editable.attachListener(editable, 'click', (evt2) => {
    //                     let link = new CKEDITOR.dom.elementPath(evt2.data.getTarget(), this).contains('a');
    //                     if (link && evt2.data.$.button != 2 && link.isReadOnly()) {
    //                         window.open(link.getAttribute('href'));
    //                     }
    //                 }, null, null, 15);
    //             }
    //         }
    //     });
    //     document.articleViewer.on('change', (evt) => {
    //         $('iframe.cke_wysiwyg_frame').ready((e) => {
    //             $(document).find('iframe.cke_wysiwyg_frame').contents().find('body').find('div.chartjs-legend').find('.pie-legend-text').css('width', 'auto');
    //             $(document).find('iframe.cke_wysiwyg_frame').contents().find('body').find('div.chartjs-legend').find('.polararea-legend-text').css('width', 'auto');
    //             $(document).find('iframe.cke_wysiwyg_frame').contents().find('body').find('div.chartjs-legend').find('.doughnut-legend-text').css('width', 'auto');

    //             window.videoPlayerTournaments = [];
    //             $(document).find('iframe.cke_wysiwyg_frame:first').contents().find('body').find('a').each((ind, elem) => {
    //                 let href = $(elem).attr('href');
    //                 if ($(elem).hasClass('_doc_')) {
    //                     $(elem).parent().after(`
    //                         <p style="height: 86vh;">
    //                             <object class="content-view" width="100%" height="100%" type="application/pdf" data="${href}">
    //                             </object>
    //                         </p>
    //                     `);
    //                     // $(elem).parent().remove();
    //                 } else if ($(elem).hasClass('_video_')) {
    //                     let nfbVideoId = null;
    //                     if (href.includes("/video/player/")) {
    //                         nfbVideoId = href;
    //                         nfbVideoId = nfbVideoId.split("/player/")[1];
    //                     }

    //                     $(document).find('iframe.cke_wysiwyg_frame:first').contents().find('head').append(`
    //                         <link type="text/css" rel="stylesheet" href="/static/video-js-7.20.0/video-js.min.css">
    //                     `);
    //                     $(elem).after(`
    //                         ${nfbVideoId != null ? `
    //                             <video id="video-player-tournaments-${ind}" class="video-js resize-block video-modal" poster="https://nanofootball.pro/video/poster/${nfbVideoId}">
    //                                 <source src="${href}" type="video/mp4" />
    //                             </video>
    //                         ` : `
    //                             <video id="video-player-tournaments-${ind}" class="video-js resize-block video-modal" poster="">
    //                                 <source src="${href}" type="video/youtube" />
    //                             </video>
    //                         `}
    //                     `);
    //                     window.videoPlayerTournaments.push(videojs(
    //                         $(document).find('iframe.cke_wysiwyg_frame:first').contents().find('body').find(`#video-player-tournaments-${ind}`)[0], {
    //                         preload: 'auto',
    //                         autoplay: false,
    //                         controls: true,
    //                         aspectRatio: '16:9',
    //                         youtube: { "iv_load_policy": 1, 'modestbranding': 1, 'rel': 0, 'showinfo': 0, 'controls': 0 },
    //                     }));

    //                     $(elem).remove();
    //                 }
    //             });
    //             for (let i = 0; i < window.videoPlayerTournaments.length; i++) {
    //                 window.videoPlayerTournaments[i].load();
    //                 window.videoPlayerTournaments[i].ready((e) => {
    //                     $(document).find('iframe.cke_wysiwyg_frame:first').contents().find('body').find(`#video-player-tournaments-${i}`)
    //                         .css('height', '88vh');
    //                 });
    //             }
    //         });
    //     });
    // } catch(e) {}

});
