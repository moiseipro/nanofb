function RenderSplitExsCardCols() {
    $('#exerciseCard').find('div.gutter').remove();
    sizesArr = window.dataForSplitExsCardCols;
    try {
        window.splitExsCardCols = Split(['#splitCol_exscard_0', '#splitCol_exscard_1', '#splitCol_exscard_2'], {
            sizes: sizesArr,
            dragInterval: 1,
            gutterSize: 15,
            onDrag: () => {
                let sizes = window.splitExsCardCols.getSizes();
                if (sizes.length != 3) {return;} 
                if (sizes[0] < 26) {
                    sizes[0] = 26;
                    sizes[1] = 37;
                    sizes[2] = 37;
                }
                if (sizes[1] < 36) {
                    sizes[0] = 32;
                    sizes[1] = 36;
                    sizes[2] = 32;
                }
                if (sizes[2] < 26) {
                    sizes[0] = 37;
                    sizes[1] = 37;
                    sizes[2] = 26;
                }
                try {
                    window.splitExsCardCols.setSizes(sizes);
                } catch(e) {}
            },
            onDragEnd: (arr) => {
                window.dataForSplitExsCardCols = arr;
                localStorage.setItem('split_exs_card_cols', JSON.stringify(window.dataForSplitExsCardCols));
            }
        });
        $('#exerciseCard').find('div.gutter').toggleClass('d-none', true);
    } catch(e) {}
}

function ToggleEditFields(flag) {
    $('#exerciseCard').find('.exs_edit_field').removeClass('empty-field');
    $('#exerciseCard').find('.exs_edit_field').prop('disabled', !flag);
    $('#exerciseCard').find('.add-row').toggleClass('d-none', !flag);
    $('#exerciseCard').find('.remove-row').toggleClass('d-none', !flag);
    $('#exerciseCard').find('.remove-row').parent().toggleClass('d-none', !flag);

    $('#exerciseCard').find('tr.additional-params-container.empty').toggleClass('d-none', !flag);
    try {
        if (flag) {
            document.descriptionEditor2.disableReadOnlyMode('');
            $(document).find('.ck-editor__top').removeClass('d-none');
            $(document).find('.ck-editor__main').removeClass('read-mode');
            $(document).find('.ck-editor__main').addClass('edit-mode');
        } else {
            document.descriptionEditor2.enableReadOnlyMode('');
            $(document).find('.ck-editor__top').addClass('d-none');
            $(document).find('.ck-editor__main').addClass('read-mode');
            $(document).find('.ck-editor__main').removeClass('edit-mode');
        }
    } catch (e) {}

    $('#exerciseCard').find('tr.description-buttons').toggleClass('d-none', !flag);
    if (!flag) {
        $('#exerciseCard').find('tr.description-panel[data-id="original"]').removeClass('d-none');
        $('#exerciseCard').find('tr.description-panel[data-id="template"]').addClass('d-none');
        $('#exerciseCard').find('button.description-button').removeClass('active');
        $('#exerciseCard').find('button.description-button[data-id="original"]').addClass('active');
    }

    $('#exerciseCard').find('.categories-list > button').toggleClass('custom-disabled', !flag);
    $('#exerciseCard').find('.fields-list > button').toggleClass('custom-disabled', !flag);
    $('#exerciseCard').find('.ball-gates-list > button').toggleClass('custom-disabled', !flag);
    $('#exerciseCard').find('.exs-types-list > button').toggleClass('custom-disabled', !flag);
    $('#exerciseCard').find('.physical-qualities-list > button').toggleClass('custom-disabled', !flag);
    $('#exerciseCard').find('.cognitive-load-list > button').toggleClass('custom-disabled', !flag);

    window.onlyViewMode = !flag;
}

function ToggleUpperButtonsPanel(isActive) {
    $('#editExs').attr('data-active', isActive == '1' ? 0 : 1);
    $('#exerciseCard').find('.btn-view').toggleClass('d-none', isActive != '1');
    $('#exerciseCard').find('.btn-edit').toggleClass('d-none', isActive == '1');
    window.changedData = false;
    if (isActive == '1') {
        ToggleEditFields(isActive != '1');
        LoadExerciseOne();
    }
    if (isActive != '1') {
        $('#exerciseCard').find('tr.folder-container').removeClass('d-none');
        if ($('#card_drawing1').hasClass('active')) {
            $('#card_drawing1').addClass('d-none');
            $('.scheme-editor').find('iframe').contents().find('#svgparent').html($('#card_drawing1').find('.card').html());
            $('.scheme-editor').find('iframe')[0].contentWindow.svgBlockResize();
            setTimeout((e) => {
                $('.scheme-editor').find('iframe')[0].contentWindow.svgBlockResize();
            }, 100);
            $('.scheme-editor').removeClass('d-none');
        }
        if ($('#card_drawing2').hasClass('active')) {
            $('#card_drawing2').addClass('d-none');
            $('.scheme-editor').find('iframe').contents().find('#svgparent').html($('#card_drawing2').find('.card').html());
            $('.scheme-editor').find('iframe')[0].contentWindow.svgBlockResize();
            setTimeout((e) => {
                $('.scheme-editor').find('iframe')[0].contentWindow.svgBlockResize();
            }, 100);
            $('.scheme-editor').removeClass('d-none');
        }
    } else {
        if ($('#card_drawing1').hasClass('active')) {
            $('#card_drawing1').removeClass('d-none');
            $('.scheme-editor').addClass('d-none');
        }
        if ($('#card_drawing2').hasClass('active')) {
            $('#card_drawing2').removeClass('d-none');
            $('.scheme-editor').addClass('d-none');
        }
    }
    let setColumnsShort = $('.exercise-card-header').is(":visible");
    $('.left-col-card').toggleClass('short', setColumnsShort);
    $('.center-col-card').toggleClass('short', setColumnsShort);
    $('.right-col-card').toggleClass('short', setColumnsShort);
}

function LoadExerciseOne(exsID = null, fromNFB = 0, folderType = "") {
    let searchParams = new URLSearchParams(window.location.search);
    let chosenSection = searchParams.get('section');
    if (!exsID) {
        try {
            exsID = parseInt(searchParams.get('id'));
        } catch (e) {}
    }
    if (fromNFB == 0) {
        try {
            fromNFB = parseInt(searchParams.get('nfb'));
        } catch (e) {}
    }
    if (!folderType || folderType == "") {
        folderType = searchParams.get('type');
    }
    AdaptPageToSection(chosenSection, searchParams.get('id') == "new", false);
    if (searchParams.get('id') == "new") {
        window.parent.postMessage("exercise_loaded", '*');
    }
    if (!exsID) {return;}
    let data = {'get_exs_one': 1, 'exs': exsID, 'get_nfb': fromNFB, 'f_type': folderType};
    $('.page-loader-wrapper').fadeIn();
    let tCall = $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: data,
        type: 'GET', // GET или POST
        dataType: 'json',
        url: "/exercises/exercises_api",
        success: function (res) {
            if (res.success) {
                RenderExerciseOne(res.data);
                AdaptPageToSection(chosenSection, true, false);
            }
        },
        error: function (res) {
            console.log(res);
        },
        complete: function (res) {
            $('.page-loader-wrapper').fadeOut();
            window.canChangeExs = true;
            window.parent.postMessage("exercise_loaded", '*');
        }
    });
    try {
        PauseCountExsCalls(tCall);
    } catch(e) {}
}

function RenderExerciseOne(data) {
    function CheckMultiRows(exsCard, data, elem, cId) {
        let cloneRow = null;
        if (!Array.isArray(data)) {
            data = [''];
        }
        $(exsCard).find(`.wider_row.value_row[data-id="${cId}"]`).remove();
        for (let key in data) {
            let elem = data[key];
            if (cId == "additions1") {
                cloneRow = $('#exerciseCard').find('.gen-content').find(`tr[data-id="${cId}"]`).clone();
            } else {
                let cType = (elem.type == "INPUT" || elem.type == "TEXTAREA") ? "text" : elem.type == "SELECT" ? "list" : "";
                // if (cId == "notes" && cType != "text") {cType = "";}
                cloneRow = $('#exerciseCard').find('.gen-content').find(`tr[data-id="${cId}"][data-type="${cType}"]`).clone();
            }
            if ($(cloneRow).length > 0) {
                $(cloneRow).addClass('wider_row value_row');
                $(cloneRow).find('.form-control').addClass('exs_edit_field');
                $(cloneRow).find('.form-control').addClass('exs_team_param');
                $(cloneRow).find('.form-control').prop('disabled', true);
                $(cloneRow).find('.exs_edit_field').val(elem.value);
                $(cloneRow).find('.exs_edit_field').change();
                if (cId == "additional_data") {
                    $(cloneRow).find('[name="additional_data_select[]"]').val(elem.id);
                    $(cloneRow).find('[name="additional_data_select[]"]').change();
                }
                $(cloneRow).find('.remove-row').addClass('btn-on');
                $(cloneRow).find('.remove-row').prop('disabled', false);
                $(cloneRow).insertAfter($('#exerciseCard').find(`.wider_row[data-id="${cId}"]`).last());
            }
        }
    }
    function TryToSetValue(card, elem, value, isValueStrList = false) {
        if (isValueStrList) {
            let tList = Array.isArray(value) ? value : [];
            for (let i = 0; i < tList.length; i++) {
                try {
                    $(card).find(`${elem}`).eq(i).val(tList[i]);
                } catch(e) {}
            }
        } else {
            try {
                $(card).find(elem).val(value);
            } catch(e) {}
        }
    }

    let exsCard = $('#exerciseCard');
    if (data && data.id) {
        $(exsCard).attr('data-exs', data.id);

        // $('.exercise-card-header').toggleClass('disabled', data.copied_from_nfb == true);

        ToggleFoldersType(data);

        $(exsCard).find('.exs_edit_field[name="ref_goal"]').val(data.ref_goal);
        $(exsCard).find('.exs_edit_field[name="ref_ball"]').val(data.ref_ball);
        $(exsCard).find('.exs_edit_field[name="ref_team_category"]').val(data.ref_team_category);
        $(exsCard).find('.exs_edit_field[name="ref_age_category"]').val(data.ref_age_category);
        $(exsCard).find('.exs_edit_field[name="ref_train_part"]').val(data.ref_train_part);
        $(exsCard).find('.exs_edit_field[name="ref_cognitive_load"]').val(data.ref_cognitive_load);
        $(exsCard).find('.exs_edit_field[name="ref_stress_type"]').val(data.ref_stress_type);
        $(exsCard).find('.exs_edit_field[name="field_players"]').val(data.field_players);
        $(exsCard).find('.exs_edit_field[name="field_goal"]').val(data.field_goal);
        $(exsCard).find('.exs_edit_field[name="field_age"]').val(data.field_age);
        $(exsCard).find('.exs_edit_field[name="field_task"]').val(data.field_task);

        $(exsCard).find('.exs_edit_field[name="scheme_1"]').val(data.scheme_1);
        $(exsCard).find('.exs_edit_field[name="scheme_2"]').val(data.scheme_2);

        $(exsCard).find('.exs_edit_field[name="field_age_a"]').val(data.field_age_a);
        $(exsCard).find('.exs_edit_field[name="field_age_b"]').val(data.field_age_b);
        $(exsCard).find('.exs_edit_field[name="field_players_a"]').val(data.field_players_a);
        $(exsCard).find('.exs_edit_field[name="field_players_b"]').val(data.field_players_b);
        $(exsCard).find('.exs_edit_field[name="field_keyword_a"]').val(data.field_keyword_a);
        // $(exsCard).find('.exs_edit_field[name="field_keyword_b"]').val(data.field_keyword_b);
        $(exsCard).find('.exs_edit_field[name="field_exs_category_a"]').val(data.field_exs_category_a);
        $(exsCard).find('.exs_edit_field[name="field_exs_category_b"]').val(data.field_exs_category_b);
        // try {
        //     for (let i = 0; i < data.field_keywords.length; i++) {
        //         let cId = data.field_keywords[i];
        //         $(exsCard).find(`.keywords-list > li[data-id="${cId}"]`).addClass('active');
        //     }
        // } catch(e) {}
        try {
            for (let i = 0; i < data.field_categories.length; i++) {
                let cId = data.field_categories[i];
                $(exsCard).find(`.categories-list > button[data-id="${cId}"]`).addClass('active');
            }
        } catch(e) {}
        try {
            let ballShort = $(exsCard).find('.exs_edit_field[name="ref_ball"]').find(`option[value="${data.ref_ball}"]`).attr('data-short');
            $(exsCard).find('.ball-gates-list > button[data-id="ball"]').toggleClass('active', ballShort == "true");
        } catch(e) {}
        try {
            $(exsCard).find('.ball-gates-list > button[data-id="gate"]').removeClass('active');
            $(exsCard).find(`.ball-gates-list > button[data-id="gate"][data-val="${data.field_goal}"]`).addClass('active');
        } catch(e) {}

        try {
            for (let i = 0; i < data.field_types.length; i++) {
                let cId = data.field_types[i];
                $(exsCard).find(`.exs-types-list > button[data-id="${cId}"]`).addClass('active');
            }
        } catch(e) {}
        try {
            for (let i = 0; i < data.field_physical_qualities.length; i++) {
                let cId = data.field_physical_qualities[i];
                $(exsCard).find(`.physical-qualities-list > button[data-id="${cId}"]`).addClass('active');
            }
        } catch(e) {}
        try {
            for (let i = 0; i < data.field_cognitive_loads.length; i++) {
                let cId = data.field_cognitive_loads[i];
                $(exsCard).find(`.cognitive-load-list > button[data-id="${cId}"]`).addClass('active');
            }
        } catch(e) {}
        try {
            for (let i = 0; i < data.field_fields.length; i++) {
                let cId = data.field_fields[i];
                $(exsCard).find(`.fields-list > button[data-id="${cId}"]`).addClass('active');
            }
        } catch(e) {}

        try {
            if (Array.isArray(data.video_links) && data.video_links.length == 4) {
                for (let i = 0; i < data.video_links.length; i++) {
                    let cLink = data.video_links[i]['link'];
                    let cName = data.video_links[i]['name'];
                    let cNote = data.video_links[i]['note'];
                    $(exsCard).find(`.exs_video_link:nth-child(${i+1})`).find(`.exs_edit_field[name="video_links_name[]"]`).val(cName);
                    $(exsCard).find(`.exs_video_link:nth-child(${i+1})`).find(`.exs_edit_field[name="video_links_link[]"]`).val(cLink);
                    $(exsCard).find(`.exs_video_link:nth-child(${i+1})`).find(`.exs_edit_field[name="video_links_note[]"]`).val(cNote);
                }
            }
        } catch(e) {}

        $(exsCard).find('.exs_edit_field[name="tags"]').val(data.tags).trigger('change');
        window.selectedTagsInCard = data.tags;
        ToggleSelectedTagsInCard();
        window.changedData = false;

        // // CheckMultiRows(exsCard, data.additional_data, '.exs_edit_field[name="additional_data[]"]', 'additional_data');
        // CheckMultiRows(exsCard, data.keyword, '.exs_edit_field[name="keyword[]"]', 'keyword');
        // CheckMultiRows(exsCard, data.stress_type, '.exs_edit_field[name="stress_type[]"]', 'stress_type');
        // CheckMultiRows(exsCard, data.purposes, '.exs_edit_field[name="purposes[]"]', 'purposes');
        // // CheckMultiRows(exsCard, data.coaching, '.exs_edit_field[name="coaching[]"]', 'coaching');
        // CheckMultiRows(exsCard, data.notes, '.exs_edit_field[name="notes[]"]', 'notes');

        $(exsCard).find('tr.additional-params-container').remove();
        let htmlParamsStr = "";
        for (let i in data.additional_params) {
            let tmpParam = data.additional_params[i];
            htmlParamsStr += `
                <tr class="bck-custom border-y-custom additional-params-container ${!tmpParam.value || tmpParam.value == "" ? 'empty d-none' : ''}">
                    <td class="text-center align-middle">
                        ${tmpParam.title}
                    </td>
                    <td class="text-center h-100">
                        <input name="additional_params__${tmpParam.id}" class="form-control form-control-sm exs_edit_field text-center" type="text" 
                        value="${tmpParam.value ? tmpParam.value : ''}" placeholder="" autocomplete="off" disabled="" style="height: 100% !important;">
                    </td>
                </tr>
            `;
        }
        $(exsCard).find('tr.add-params-container-after').after(htmlParamsStr);

        CorrectBlockBorders();

        $(exsCard).find('.exs_edit_field[name="coaching[]"]').trigger('onkeyup');

        $(exsCard).find('.exs_edit_field[name="title"]').val(data.title);
        if (document.descriptionEditor2) {
            document.descriptionEditor2.setData(data.description);
        }
        if (document.descriptionEditorView) {
            document.descriptionEditorView.setData(data.description);
        }

        $('#carouselSchema').find('.carousel-item.new-scheme').remove();
        $('#carouselSchema').find('.carousel-indicators > li.new-scheme').remove();
        $('#carouselSchema').find('.carousel-item').first().html(data.scheme_data[0]);
        $('#carouselSchema').find('.carousel-item').last().html(data.scheme_data[1]);
        let carouselIndicatorNum = 2;
        if (data.scheme_2 && data.scheme_2 != "") {
            let link = `http://62.113.105.179/api/canvas-draw/v1/canvas/render?id=${data.scheme_2}`;
            $('#carouselSchema').find('.carousel-item').first().before(`
                <div class="carousel-item new-scheme" title="Рисунок 2 (новый)" data-type="scheme_2">
                    <img src="${link}" alt="scheme" width="100%" height="100%">
                </div>
            `);
            $('#carouselSchema').find('.carousel-indicators > li').last().after(`
                <li class="new-scheme" data-target="#carouselSchema" data-slide-to="${carouselIndicatorNum}"></li>
            `);
            carouselIndicatorNum ++;
        }
        if (data.scheme_1 && data.scheme_1 != "") {
            let link = `http://62.113.105.179/api/canvas-draw/v1/canvas/render?id=${data.scheme_1}`;
            $('#carouselSchema').find('.carousel-item').first().before(`
                <div class="carousel-item new-scheme" title="Рисунок 1 (новый)" data-type="scheme_1">
                    <img src="${link}" alt="scheme" width="100%" height="100%">
                </div>
            `);
            $('#carouselSchema').find('.carousel-indicators > li').last().after(`
                <li class="new-scheme" data-target="#carouselSchema" data-slide-to="${carouselIndicatorNum}"></li>
            `);
        }

        $('#card_drawing1').find('.card').last().html(data.scheme_data[0]);
        $('#card_drawing2').find('.card').last().html(data.scheme_data[1]);

        $('#carouselVideo').find('.carousel-item').removeClass('d-none');
        $('#carouselVideo').find('.carousel-indicators > li').removeClass('d-none');
        $('#carouselVideo').find('.carousel-control-prev').removeClass('d-none');
        $('#carouselVideo').find('.carousel-control-next').removeClass('d-none');
        $('#carouselAnim').find('.carousel-item').removeClass('d-none');
        $('#carouselAnim').find('.carousel-indicators > li').removeClass('d-none');
        $('#carouselAnim').find('.carousel-control-prev').removeClass('d-none');
        $('#carouselAnim').find('.carousel-control-next').removeClass('d-none');

        let video_1_link = $(exsCard).find(`.exs_video_link[data-type="video_1"]`).find(`.exs_edit_field[name="video_links_link[]"]`).val();
        let video_2_link = $(exsCard).find(`.exs_video_link[data-type="video_2"]`).find(`.exs_edit_field[name="video_links_link[]"]`).val();
        let anim_1_link = $(exsCard).find(`.exs_video_link[data-type="animation_1"]`).find(`.exs_edit_field[name="video_links_link[]"]`).val();
        let anim_2_link = $(exsCard).find(`.exs_video_link[data-type="animation_2"]`).find(`.exs_edit_field[name="video_links_link[]"]`).val();
        if (data.video_1 && data.video_1.id && data.video_1.id != -1) {
            $('#carouselVideo').find('.carousel-item').first().removeClass('d-none');
            $(exsCard).find('.video-value[name="video1"]').val(data.video_1.id);
            RenderVideo(data.video_1.id, $(exsCard).find('.video-value[name="video1"]'), window.videoPlayerCard1);
        } else if (video_1_link && video_1_link != "") {
            $('#carouselVideo').find('.carousel-item').first().removeClass('d-none');
        } else {
            $('#carouselVideo').find('.carousel-item').first().addClass('d-none');
            $('#carouselVideo').find('.carousel-indicators > li').first().addClass('d-none');
            $('#carouselVideo').find('.carousel-control-prev').addClass('d-none');
            $('#carouselVideo').find('.carousel-control-next').addClass('d-none');
            $(exsCard).find('.video-value[name="video1"]').val('');
        }
        // if (data.video_2 && data.video_2.id && data.video_2.id != -1) {
        //     $('#carouselVideo').find('.carousel-item').last().removeClass('d-none');
        //     $(exsCard).find('.video-value[name="video2"]').val(data.video_2.id);
        //     RenderVideo(data.video_2.id, $(exsCard).find('.video-value[name="video2"]'), window.videoPlayerCard2);
        // } else if (video_2_link && video_2_link != "") {
        //     $('#carouselVideo').find('.carousel-item').last().removeClass('d-none');
        // } else {
        //     $('#carouselVideo').find('.carousel-item').last().addClass('d-none');
        //     $('#carouselVideo').find('.carousel-indicators > li').last().addClass('d-none');
        //     $('#carouselVideo').find('.carousel-control-prev').addClass('d-none');
        //     $('#carouselVideo').find('.carousel-control-next').addClass('d-none');
        //     $(exsCard).find('.video-value[name="video2"]').val('');
        // }
        if (data.animation_1 && data.animation_1.id && data.animation_1.id != -1) {
            $('#carouselAnim').find('.carousel-item').first().removeClass('d-none');
            $(exsCard).find('.video-value[name="animation1"]').val(data.animation_1.id);
            RenderVideo(data.animation_1.id, $(exsCard).find('.video-value[name="animation1"]'), window.videoPlayerCard3);
        } else if (anim_1_link && anim_1_link != "") {
            $('#carouselAnim').find('.carousel-item').first().removeClass('d-none');
        } else {
            $('#carouselAnim').find('.carousel-item').first().addClass('d-none');
            $('#carouselAnim').find('.carousel-indicators > li').first().addClass('d-none');
            $('#carouselAnim').find('.carousel-control-prev').addClass('d-none');
            $('#carouselAnim').find('.carousel-control-next').addClass('d-none');
            $(exsCard).find('.video-value[name="animation1"]').val('');
        }
        // if (data.animation_2 && data.animation_2.id && data.animation_2.id != -1) {
        //     $('#carouselAnim').find('.carousel-item').last().removeClass('d-none');
        //     $(exsCard).find('.video-value[name="animation2"]').val(data.animation_2.id);
        //     RenderVideo(data.animation_2.id, $(exsCard).find('.video-value[name="animation2"]'), window.videoPlayerCard4);
        // } else if (anim_2_link && anim_2_link != "") {
        //     $('#carouselAnim').find('.carousel-item').last().removeClass('d-none');
        // } else {
        //     $('#carouselAnim').find('.carousel-item').last().addClass('d-none');
        //     $('#carouselAnim').find('.carousel-indicators > li').last().addClass('d-none');
        //     $('#carouselAnim').find('.carousel-control-prev').addClass('d-none');
        //     $('#carouselAnim').find('.carousel-control-next').addClass('d-none');
        //     $(exsCard).find('.video-value[name="animation2"]').val('');
        // }
        $('#carouselSchema').find('.carousel-item').removeClass('active');
        $('#carouselSchema').find('.carousel-item:not(.d-none)').first().addClass('active');
        $('#carouselSchema').find('.carousel-indicators > li').removeClass('active');
        $('#carouselSchema').find('.carousel-indicators > li:not(.d-none)').first().addClass('active');
        $('#carouselVideo').find('.carousel-item').removeClass('active');
        $('#carouselVideo').find('.carousel-item:not(.d-none)').first().addClass('active');
        $('#carouselVideo').find('.carousel-indicators > li').removeClass('active');
        $('#carouselVideo').find('.carousel-indicators > li:not(.d-none)').first().addClass('active');
        $('#carouselAnim').find('.carousel-item').removeClass('active');
        $('#carouselAnim').find('.carousel-item:not(.d-none)').first().addClass('active');
        $('#carouselAnim').find('.carousel-indicators > li').removeClass('active');
        $('#carouselAnim').find('.carousel-indicators > li:not(.d-none)').first().addClass('active');
        if ($('#carouselVideo').find('.carousel-item:not(.d-none)').length > 0 && $('#carouselAnim').find('.carousel-item:not(.d-none)').length > 0) {
            $('#carouselAnim').find('.carousel-item:not(.d-none)').addClass('d-none');
        }
        try {
            RenderCarouselAll();
        } catch(e) {}

        if (data.clone_nfb_id) {
            $('ul.list-group.exs-card-editor').find('li.nf-copy-off').addClass('d-none');
        } else {
            $('ul.list-group.exs-card-editor').find('li.nf-copy-off').removeClass('d-none');
        }
    } else {
        $(exsCard).attr('data-exs', '-1');

        // $('.exercise-card-header').toggleClass('disabled', false);

        $(exsCard).find('.btn-only-edit').prop('disabled', true);
        $(exsCard).find('.btn-not-view').toggleClass('d-none', false);
        $(exsCard).find('.exs_edit_field').prop('disabled', false);
        $(exsCard).find('.add-row').prop('disabled', false);
        $(exsCard).find('.remove-row').prop('disabled', true);
        $(exsCard).find('.remove-row.btn-on').prop('disabled', false);
        $(exsCard).find('.add-row').toggleClass('d-none', false);
        $(exsCard).find('.remove-row').toggleClass('d-none', false);

        ToggleFoldersType();

        $(exsCard).find('.exs_edit_field').val('');
        if (document.descriptionEditor2) {
            document.descriptionEditor2.disableReadOnlyMode('');
            document.descriptionEditor2.setData('');
        }
        if (document.descriptionEditorView) {
            document.descriptionEditorView.disableReadOnlyMode('');
            document.descriptionEditorView.setData('');
        }

        // CheckMultiRows(exsCard, '', '.exs_edit_field[name="additional_data[]"]', 'additional_data');
        CheckMultiRows(exsCard, '', '.exs_edit_field[name="keyword[]"]', 'keyword');
        CheckMultiRows(exsCard, '', '.exs_edit_field[name="stress_type[]"]', 'stress_type');
        CheckMultiRows(exsCard, '', '.exs_edit_field[name="purposes[]"]', 'purposes');
        // CheckMultiRows(exsCard, '', '.exs_edit_field[name="coaching[]"]', 'coaching');
        CheckMultiRows(exsCard, '', '.exs_edit_field[name="notes[]"]', 'notes');
        CorrectBlockBorders();

        $('#carouselVideo').find('.carousel-item').addClass('d-none');
        $('#carouselVideo').find('.carousel-indicators > li').addClass('d-none');
        $('#carouselVideo').find('.carousel-control-prev').addClass('d-none');
        $('#carouselVideo').find('.carousel-control-next').addClass('d-none');
        $('#carouselAnim').find('.carousel-item').addClass('d-none');
        $('#carouselAnim').find('.carousel-indicators > li').addClass('d-none');
        $('#carouselAnim').find('.carousel-control-prev').addClass('d-none');
        $('#carouselAnim').find('.carousel-control-next').addClass('d-none');
        $(exsCard).find('.video-value[name="video1"]').val('');
        $(exsCard).find('.video-value[name="video2"]').val('');
        $(exsCard).find('.video-value[name="animation1"]').val('');
        $(exsCard).find('.video-value[name="animation2"]').val('');
        $('#carouselSchema').find('.carousel-item.new-scheme').remove();
        $('#carouselSchema').find('.carousel-indicators > li.new-scheme').remove();
        $('#carouselSchema').find('.carousel-item').removeClass('active');
        $('#carouselSchema').find('.carousel-item:not(.d-none)').first().addClass('active');
        $('#carouselSchema').find('.carousel-indicators > li').removeClass('active');
        $('#carouselSchema').find('.carousel-indicators > li:not(.d-none)').first().addClass('active');
        $('#carouselVideo').find('.carousel-item').removeClass('active');
        $('#carouselVideo').find('.carousel-item:not(.d-none)').first().addClass('active');
        $('#carouselVideo').find('.carousel-indicators > li').removeClass('active');
        $('#carouselVideo').find('.carousel-indicators > li:not(.d-none)').first().addClass('active');
        $('#carouselAnim').find('.carousel-item').removeClass('active');
        $('#carouselAnim').find('.carousel-item:not(.d-none)').first().addClass('active');
        $('#carouselAnim').find('.carousel-indicators > li').removeClass('active');
        $('#carouselAnim').find('.carousel-indicators > li:not(.d-none)').first().addClass('active');
        if ($('#carouselVideo').find('.carousel-item:not(.d-none)').length > 0 && $('#carouselAnim').find('.carousel-item:not(.d-none)').length > 0) {
            $('#carouselAnim').find('.carousel-item:not(.d-none)').addClass('d-none');
        }
        try {
            RenderCarouselAll();
        } catch(e) {}
        
        $('ul.list-group.exs-card-editor').find('li.nf-copy-off').removeClass('d-none');


        $('.exs-list-group').find('.list-group-item').removeClass('active');
        // clear video, animation and scheme
    }
}

function AdaptPageToSection(section, exerciseLoaded=false, onlyChangeSection=false) {
    let availableSections = ["card", "description", "scheme_1", "scheme_2", "video_1", "video_2", "animation_1", "animation_2", "tags"];
    if (availableSections.includes(section)) {
        if (!onlyChangeSection) {
            $(document).find('div.header').remove();
            $(document).find('div.sidebar').remove();
            $(document).find('div.page-wrapper').addClass('m-0 p-0');
            $(document).find('div.card-inside').attr('style', 'height: 95vh !important;');
            $(document).find('div.left-col-card').attr('style', 'height: 90vh !important;');
            $(document).find('div.center-col-card').attr('style', 'height: 90vh !important;');
            $(document).find('div.right-col-card').attr('style', 'height: 90vh !important;');
            $(document).find('div.exercise-card-header').find('div.btn-group-custom').addClass('justify-content-end');
            $(document).find('div.exercise-card-header').find('button').each((ind, elem) => {
                let elemId = $(elem).attr('id');
                if (elemId == "editExs" || elemId == "saveExs") {return;}
                if (section == "scheme_1" && elemId == "openDrawing1") {return;}
                if (section == "scheme_2" && elemId == "openDrawing2") {return;}
                if (section == "video_1" && elemId == "openVideo1") {return;}
                if (section == "video_2" && elemId == "openVideo2") {return;}
                if (section == "animation_1" && elemId == "openAnimation1") {return;}
                if (section == "animation_2" && elemId == "openAnimation2") {return;}
                if (section == "tags" && elemId == "openTags") {return;}
                $(elem).css('display', 'none');
            });
            $('.exs-edit-block-in-card').parent().removeClass('d-none');
            $('.exs-edit-block-in-card').removeClass('d-none');
            $('.exs-edit-block-in-card').find('.btn-o-modal').removeClass('active');
            $('.exs-edit-block-in-card').find(`.btn-o-modal[data-id="${section}"]`).addClass('active');
            $(document).find('div.page-wrapper').toggleClass('d-none', !exerciseLoaded);
        }
        if (exerciseLoaded) {
            if (section == "card") {
                if (!onlyChangeSection) {
                    $(document).find('#editExs').trigger('click');
                    $(document).find('#saveExs').addClass('d-none');
                }
                $(document).find('#openDescription').trigger('click');
                $(document).find('#openDescription').addClass('d-none');
                $(document).find('div.left-col-card').addClass('w-50');
                $(document).find('div.center-col-card').addClass('w-50');
                $(document).find('div.right-col-card').addClass('d-none');
                $(document).find('div.center-col-card').addClass('mx-3');
                let schemasElement = $(document).find('div.right-col-card').find('#carouselSchema');
                let videosElement = $(document).find('div.right-col-card').find('#carouselVideo');
                let animationsElement = $(document).find('div.right-col-card').find('#carouselAnim');
                $(document).find('div.center-col-card').prepend(animationsElement);
                $(document).find('div.center-col-card').prepend(videosElement);
                $(document).find('div.center-col-card').prepend(schemasElement);
                let descriptionBlock = $(document).find('div.center-col-card').find('div.description-table-container');
                if (descriptionBlock.length == 0) {
                    descriptionBlock = $(document).find('div.left-col-card').find('div.description-table-container');
                }
                $(document).find('div.center-col-card').append(descriptionBlock);
                $(document).find('div.left-col-card').find('div.card-table-container').removeClass('d-none');
            }
            if (section == "description") {
                if (!onlyChangeSection) {
                    $(document).find('#editExs').trigger('click');
                    $(document).find('#saveExs').addClass('d-none');
                }
                $(document).find('#openDescription').trigger('click');
                $(document).find('#openDescription').addClass('d-none');
                $(document).find('div.left-col-card').addClass('w-50');
                $(document).find('div.center-col-card').addClass('w-50');
                $(document).find('div.right-col-card').addClass('d-none');
                $(document).find('div.center-col-card').addClass('mx-3');
                let schemasElement = $(document).find('div.right-col-card').find('#carouselSchema');
                let videosElement = $(document).find('div.right-col-card').find('#carouselVideo');
                let animationsElement = $(document).find('div.right-col-card').find('#carouselAnim');
                $(document).find('div.center-col-card').prepend(animationsElement);
                $(document).find('div.center-col-card').prepend(videosElement);
                $(document).find('div.center-col-card').prepend(schemasElement);
                $(document).find('div.right-col-card').find('#carouselSchema');
                let descriptionBlock = $(document).find('div.center-col-card').find('div.description-table-container');
                if (descriptionBlock.length == 0) {
                    descriptionBlock = $(document).find('div.left-col-card').find('div.description-table-container');
                }
                $(document).find('div.left-col-card').append(descriptionBlock);
                $(document).find('div.left-col-card').find('div.card-table-container').addClass('d-none');
            }
            if (section == "scheme_1") {
                if (!onlyChangeSection) {
                    $(document).find('#editExs').trigger('click');
                    $(document).find('#saveExs').addClass('d-none');
                }
                $(document).find('#openDrawing1').trigger('click');
                $(document).find('#openDrawing1').addClass('d-none');
            }
            if (section == "scheme_2") {
                if (!onlyChangeSection) {
                    $(document).find('#editExs').trigger('click');
                    $(document).find('#saveExs').addClass('d-none');
                }
                $(document).find('#openDrawing2').trigger('click');
                $(document).find('#openDrawing2').addClass('d-none');
            }
            if (section == "video_1") {
                if (!onlyChangeSection) {
                    $(document).find('#editExs').trigger('click');
                    $(document).find('#saveExs').addClass('d-none');
                }
                $(document).find('#openVideo1').trigger('click');
                $(document).find('#openVideo1').addClass('d-none');
            }
            if (section == "video_2") {
                if (!onlyChangeSection) {
                    $(document).find('#editExs').trigger('click');
                    $(document).find('#saveExs').addClass('d-none');
                }
                $(document).find('#openVideo2').trigger('click');
                $(document).find('#openVideo2').addClass('d-none');
            }
            if (section == "animation_1") {
                if (!onlyChangeSection) {
                    $(document).find('#editExs').trigger('click');
                    $(document).find('#saveExs').addClass('d-none');
                }
                $(document).find('#openAnimation1').trigger('click');
                $(document).find('#openAnimation1').addClass('d-none');
            }
            if (section == "animation_2") {
                if (!onlyChangeSection) {
                    $(document).find('#editExs').trigger('click');
                    $(document).find('#saveExs').addClass('d-none');
                }
                $(document).find('#openAnimation2').trigger('click');
                $(document).find('#openAnimation2').addClass('d-none');
            }
            if (section == "tags") {
                if (!onlyChangeSection) {
                    $(document).find('#editExs').trigger('click');
                    $(document).find('#saveExs').addClass('d-none');
                }
                $(document).find('#openTags').trigger('click');
                $(document).find('#openTags').addClass('d-none');
            }
        }
    }
}

function SaveExerciseOne() {
    let searchParams = new URLSearchParams(window.location.search);
    let folderType = searchParams.get('type');
    let exsId = $('#exerciseCard').attr('data-exs');
    let dataToSend = {'edit_exs': 1, 'exs': exsId, type: folderType, 'data': {}};
    $('#exerciseCard').find('.exs_edit_field').each((ind, elem) => {
        if (!$(elem).hasClass('d-none') || $(elem).parent().hasClass('exs_video_link')) {
            let name = $(elem).attr('name');
            if (name in dataToSend.data) {
                if (!Array.isArray(dataToSend.data[name])) {
                    let tVal = dataToSend.data[name];
                    dataToSend.data[name] = [tVal];
                }
                dataToSend.data[name].push($(elem).val());
            } else {
                dataToSend.data[name] = $(elem).val();
            }
        }
    });
    dataToSend.data['additional_data[]'] = [];
    dataToSend.data['keyword[]'] = [];
    dataToSend.data['stress_type[]'] = [];
    dataToSend.data['purposes[]'] = [];
    dataToSend.data['coaching[]'] = [];
    dataToSend.data['notes[]'] = [];
    $('#exerciseCard').find('.exs_edit_field.exs_team_param').each((ind, elem) => {
        let cName = $(elem).attr('name');
        let dataElem = {
            'type': $(elem).prop('tagName'),
            'value': $(elem).val()
        };
        if (cName == "additional_data[]") {
            dataElem['id'] = $(elem).parent().parent().find('[name="additional_data_select[]"]').val();
        }
        try {
            dataToSend.data[cName].push(dataElem);
        } catch(e) {}
    });
    dataToSend.data['description'] = document.descriptionEditor2.getData();
    dataToSend.data['description_template'] = document.descriptionEditor2Template.getData();
    if (dataToSend.data.title == "") {
        swal("Внимание", "Добавьте название для упражнения.", "info");
        return;
    }
    if (dataToSend.data.folder_parent == "" || dataToSend.data.folder_main == "") {
        swal("Внимание", "Выберите папку для упражнения.", "info");
        return;
    }
    dataToSend.data['scheme_1_old'] = $('#card_drawing1').find('.card').html();
    dataToSend.data['scheme_2_old'] = $('#card_drawing2').find('.card').html();
    dataToSend.data['video_1'] = $('#card_video1').find('.video-value').val();
    // dataToSend.data['video_2'] = $('#card_video2').find('.video-value').val();
    dataToSend.data['animation_1'] = $('#card_animation1').find('.video-value').val();
    // dataToSend.data['animation_2'] = $('#card_animation2').find('.video-value').val();

    let selectedTags = [];
    $('#card_tags').find('li.tag-elem.active').each((ind, elem) => {
        let cId = $(elem).attr('data-name');
        selectedTags.push(cId);
    });
    dataToSend.data['tags'] = selectedTags;

    // let selectedKeywords = [];
    // $('#exerciseCard').find('.keywords-list > li.active').each((ind, elem) => {
    //     selectedKeywords.push($(elem).attr('data-id')); 
    // });
    // dataToSend.data['field_keywords'] = selectedKeywords;

    let selectedCategories = [];
    $('#exerciseCard').find('.categories-list > button.active').each((ind, elem) => {
        selectedCategories.push($(elem).attr('data-id')); 
    });
    dataToSend.data['field_categories'] = selectedCategories;

    let selectedTypes = [];
    $('#exerciseCard').find('.exs-types-list > button.active').each((ind, elem) => {
        selectedTypes.push($(elem).attr('data-id')); 
    });
    dataToSend.data['field_types'] = selectedTypes;

    let selectedPhysicalQualities = [];
    $('#exerciseCard').find('.physical-qualities-list > button.active').each((ind, elem) => {
        selectedPhysicalQualities.push($(elem).attr('data-id')); 
    });
    dataToSend.data['field_physical_qualities'] = selectedPhysicalQualities;

    let selectedCognitiveLoads = [];
    $('#exerciseCard').find('.cognitive-load-list > button.active').each((ind, elem) => {
        selectedCognitiveLoads.push($(elem).attr('data-id')); 
    });
    dataToSend.data['field_cognitive_loads'] = selectedCognitiveLoads;

    let selectedFields = [];
    $('#exerciseCard').find('.fields-list > button.active').each((ind, elem) => {
        selectedFields.push($(elem).attr('data-id')); 
    });
    dataToSend.data['field_fields'] = selectedFields;

    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: dataToSend,
        type: 'POST', // GET или POST
        dataType: 'json',
        url: "exercises_api",
        success: function (res) {
            if (res.success) {
                swal("Готово", "Упражнение успешно создано / изменено.", "success")
                .then((value) => {
                    $('.page-loader-wrapper').fadeIn();
                    let searchParams = new URLSearchParams(window.location.search);
                    let exsID = searchParams.get('id');
                    if (exsID == "new") {
                        window.parent.postMessage("exercise_created", '*');
                        window.location.href = "/exercises";
                    }
                    else {
                        window.parent.postMessage("exercise_edited", '*');
                        window.location.reload();
                    }
                });
            } else {
                swal("Ошибка", `При создании / изменении упражнения произошла ошибка (${res.err}).`, "error");
            }
        },
        error: function (res) {
            swal("Ошибка", "Упражнение не удалось создать / изменить.", "error");
            console.log(res);
        },
        complete: function (res) {
            window.parent.postMessage("exercise_end_edited", '*');
            $('.page-loader-wrapper').fadeOut();
        }
    });
}

function DeleteExerciseOne(exsId=null, folderType=null, isMultiExs=false) {
    let deleteSwal = swal({
        title: "Вы точно хотите удалить упражнение?",
        text: `После удаления данное упражнение невозможно будет восстановить!`,
        icon: "warning",
        buttons: ["Отмена", "Подтвердить"],
        dangerMode: true,
    });
    if ($('#splitCol_exscard_2').find('.delete-exs-radio').length > 0) {
        let htmlStr = `
            <br>
                <div class="delete-exs-radio">
                    <div class="form-check">
                        <label class="form-check-label">
                            <input type="radio" class="form-check-input" name="delete_exs_type" value="0" checked="">
                            Удалить только упражнение
                        </label>
                    </div>
                    <div class="form-check">
                        <label class="form-check-label">
                            <input type="radio" class="form-check-input" name="delete_exs_type" value="1">
                            Удалить только видео
                        </label>
                    </div>
                    <div class="form-check">
                        <label class="form-check-label">
                            <input type="radio" class="form-check-input" name="delete_exs_type" value="3">
                            Удалить только анимацию
                        </label>
                    </div>
                    <div class="form-check disabled">
                        <label class="form-check-label">
                            <input type="radio" class="form-check-input" name="delete_exs_type" value="5">
                            Удалить упражнение и все видео
                        </label>
                    </div> 
                </div>
            <br>
        `;
        $(document).find('.swal-modal > .swal-text').prepend(htmlStr);
    }
    deleteSwal.then((willDelete) => {
        if (willDelete) {
            let searchParams = new URLSearchParams(window.location.search);
            if (folderType == null) {folderType = searchParams.get('type');}
            if (exsId == null) {exsId = $('#exerciseCard').attr('data-exs');}
            let deleteType = $(document).find('.swal-modal').find('input[name="delete_exs_type"]:checked').val();
            let data = {'delete_exs': 1, 'exs': exsId, 'type': folderType, 'delete_type': deleteType, 'multi_exs': isMultiExs};
            $('.page-loader-wrapper').fadeIn();
            $.ajax({
                headers:{"X-CSRFToken": csrftoken},
                data: data,
                type: 'POST', // GET или POST
                dataType: 'json',
                url: "exercises_api",
                success: function (res) {
                    if (res.success) {
                        swal("Готово", "Упражнение успешно удалено.", "success")
                        .then((value) => {
                            $('.page-loader-wrapper').fadeIn();
                            window.location.href = "/exercises";
                        });
                    }
                },
                error: function (res) {
                    let errText = "Упражнение удалить не удалось.";
                    if (res.responseJSON.in_training == true) {
                        errText += "\nТак как данное упражнение прикреплено к тренировке.";
                    }
                    swal("Ошибка", errText, "error");
                    console.log(res);
                },
                complete: function (res) {
                    $('.page-loader-wrapper').fadeOut();
                    $('#exerciseCopyModal').modal('hide');
                }
            });
        } else {
            $('.exs-edit-panel').find('.btn-edit-e').removeClass('active');
        }
    });
}

function autoGrow(element) {
    element.style.height = "5px";
    element.style.height = (element.scrollHeight - 7)+"px";
    if (element.scrollHeight == 0) {
        let text = element.value;
        let linesCount = text.split("\n").length;
        element.style.height = (linesCount * 28)+"px";
    }
}

function CorrectBlockBorders() {
    if ($('#card_description').find('tr.wider_row[data-id="additional_data"]').length == 1) {
        $('#card_description').find('tr.wider_row[data-id="additional_data"]').last().removeClass('border-y-custom');
        $('#card_description').find('tr.wider_row[data-id="additional_data"]').last().removeClass('border-top-custom');
        $('#card_description').find('tr.wider_row[data-id="additional_data"]').last().removeClass('border-bottom-custom');
    } else {
        $('#card_description').find('tr.wider_row[data-id="additional_data"]').removeClass('border-top-custom');
        $('#card_description').find('tr.wider_row[data-id="additional_data"]').removeClass('border-bottom-custom');
        $('#card_description').find('tr.wider_row[data-id="additional_data"]').addClass('border-y-custom');
        $('#card_description').find('tr.wider_row[data-id="additional_data"]').first().removeClass('border-y-custom');
        $('#card_description').find('tr.wider_row[data-id="additional_data"]').first().addClass('border-bottom-custom');
        $('#card_description').find('tr.wider_row[data-id="additional_data"]').last().removeClass('border-y-custom');
        $('#card_description').find('tr.wider_row[data-id="additional_data"]').last().addClass('border-top-custom');
    }

    if ($('#card_description').find('tr.wider_row[data-id="stress_type"]').length == 1) {
        $('#card_description').find('tr.wider_row[data-id="stress_type"]').last().removeClass('border-y-custom');
        $('#card_description').find('tr.wider_row[data-id="stress_type"]').last().removeClass('border-bottom-custom');
        $('#card_description').find('tr.wider_row[data-id="stress_type"]').last().addClass('border-top-custom');
    } else {
        $('#card_description').find('tr.wider_row[data-id="stress_type"]').removeClass('border-top-custom');
        $('#card_description').find('tr.wider_row[data-id="stress_type"]').removeClass('border-bottom-custom');
        $('#card_description').find('tr.wider_row[data-id="stress_type"]').addClass('border-y-custom');
        $('#card_description').find('tr.wider_row[data-id="stress_type"]').last().removeClass('border-y-custom');
        $('#card_description').find('tr.wider_row[data-id="stress_type"]').last().addClass('border-top-custom');
    }

    if ($('#card_description').find('tr.wider_row[data-id="notes"]').length == 1) {
        $('#card_description').find('tr.wider_row[data-id="notes"]').last().removeClass('border-y-custom');
        $('#card_description').find('tr.wider_row[data-id="notes"]').last().removeClass('border-bottom-custom');
        $('#card_description').find('tr.wider_row[data-id="notes"]').last().addClass('border-top-custom');
    } else {
        $('#card_description').find('tr.wider_row[data-id="notes"]').removeClass('border-top-custom');
        $('#card_description').find('tr.wider_row[data-id="notes"]').removeClass('border-bottom-custom');
        $('#card_description').find('tr.wider_row[data-id="notes"]').addClass('border-y-custom');
        $('#card_description').find('tr.wider_row[data-id="notes"]').last().removeClass('border-y-custom');
        $('#card_description').find('tr.wider_row[data-id="notes"]').last().addClass('border-top-custom');
    }
}

function ToggleExsDir(dir = 0) {
    let lastExsData = {};
    try {
        lastExsData = JSON.parse(sessionStorage.getItem('last_exs'));
    } catch(e) {}
    const params = new URLSearchParams(window.location.search);
    let nfbVal = params.get('nfb') == '1' ? 1 : 0;
    let folderType = params.get('type');
    let isPrevOn = false, isNextOn = false;
    try {
        isPrevOn = window.exsList.list[window.exsList.index - 1] ? true : false;
    } catch(e) {}
    try {
        isNextOn = window.exsList.list[window.exsList.index + 1] ? true : false;
    } catch(e) {}
    switch (dir) {
        // dir = 0 -> check exs list
        case 0:
            $('.exs-change[data-dir="prev"]').prop('disabled', !isPrevOn);
            $('.exs-change[data-dir="next"]').prop('disabled', !isNextOn);
            break;
        // dir = -1 -> previous exs
        case -1:
            if (isPrevOn) {
                window.location.href = `/exercises/exercise?id=${window.exsList.list[window.exsList.index - 1]}&nfb=${nfbVal}&type=${folderType}`;
                try {
                    lastExsData.exs = window.exsList.list[window.exsList.index - 1];
                } catch(e) {}
                window.exsList.index -= 1;
            }
            break;
        // dir = 1 -> next exs
        case 1:
            if (isNextOn) {
                window.location.href = `/exercises/exercise?id=${window.exsList.list[window.exsList.index + 1]}&nfb=${nfbVal}&type=${folderType}`;
                try {
                    lastExsData.exs = window.exsList.list[window.exsList.index + 1];
                } catch(e) {}
                window.exsList.index += 1;
            }
            break;
        default:
            break;
    }
    let exsListStr = JSON.stringify(window.exsList);
    sessionStorage.setItem('exs_list', exsListStr);
    let lastExsStr = JSON.stringify(lastExsData);
    sessionStorage.setItem('last_exs', lastExsStr);
}

function ToggleFoldersType(data = null) {
    let searchParams = new URLSearchParams(window.location.search);
    let folderType = searchParams.get('type');
    let exsCard = $('#exerciseCard');
    let folderName = "";
    $(exsCard).find('tr.folder-container').addClass('d-none');
    if (data == null) {
        $(exsCard).find('.exs_edit_field.nfb_folders').toggleClass('d-none', folderType != "nfb_folders");
        $(exsCard).find('.exs_edit_field.team_folders').toggleClass('d-none', folderType != "team_folders");
        $(exsCard).find(`.${folderType}[name="folder_parent"]`).val('');
        $(exsCard).find('[name="folder_main"]').find('option').addClass('d-none');
        $(exsCard).find(`.${folderType}[name="folder_main"]`).val('');
    } else {
        $(exsCard).find('.exs_edit_field.nfb_folders').toggleClass('d-none', folderType != "nfb_folders");
        $(exsCard).find('.exs_edit_field.team_folders').toggleClass('d-none', folderType != "team_folders");
        $(exsCard).find(`.${folderType}[name="folder_parent"]`).val(data.folder_parent_id);
        $(exsCard).find('[name="folder_main"]').find('option').addClass('d-none');
        $(exsCard).find('[name="folder_main"]').find(`option[data-parent=${data.folder_parent_id}]`).removeClass('d-none');
        $(exsCard).find(`.${folderType}[name="folder_main"]`).val(data.folder_id);
        folderName = $(exsCard).find(`.${folderType}[name="folder_main"]`).find(`option[value="${data.folder_id}"]`).text();
    }
}

function CheckSelectedRowInVideoTable(onlySetVideo = false) {
    let value = -1;
    if ($('#openVideo1').hasClass('selected2')) {value = $('.video-value[name="video1"]').val();}
    if ($('#openVideo2').hasClass('selected2')) {value = $('.video-value[name="video2"]').val();}
    if ($('#openAnimation1').hasClass('selected2')) {value = $('.video-value[name="animation1"]').val();}
    if ($('#openAnimation2').hasClass('selected2')) {value = $('.video-value[name="animation2"]').val();}
    try {
        value = parseInt(value);
        if (isNaN(value)) {value = -1;}
    } catch(e) {}
    window.currentVideoId = value;
    if (!onlySetVideo) {
        SelectRowInVideoTable(video_table, value);
    }
    SetCurrentVideo(value);
    RenderVideo(value, $('.video-editor').find('#video-player-card-edit'), window.videoPlayerCardEdit);
}

function SelectRowInVideoTable(table, value) {
    try {
        table.rows().deselect();
        for (let i = 0; i < table.rows().data().length; i++) {
            if (table.rows().data()[i].id == value) {
                table.row(i).select();
                break;
            }
        }
    } catch(e) {}
}

async function SetCurrentVideo(value) {
    ajax_get_video_data(value)
        .then((data) => {
            let exsFoldersStr = "";
            for (let exs_ind in data.exercises) {
                let elem = data.exercises[exs_ind];
                if (elem.folder && Array.isArray(elem.videos)) {
                    exsFoldersStr += `
                        ${elem.folder.short_name} <span class="other-exercises font-weight-bold" data-ids="${elem.videos.toString()}">(${elem.videos.length})</span>
                    `;
                }
            }
            let tags = Array.isArray(data.taggit) ? data.taggit.toString() : "";
            let htmlStr = `
                <tr id="${data.id}" role="row" class="odd current">
                    <td class="sorting_1"> -> </td>
                    <td>${data.id}</td>
                    <td>${data.videosource_name}</td>
                    <td>${exsFoldersStr}</td>
                    <td>${data.duration}</td>
                    <td></td>
                    <td></td>
                    <td>${data.name}</td>
                    <td>${tags}</td>
                </tr>
            `;
            $('#video').find('tbody').find('tr.current').remove();
            $('#video').find('tbody').prepend(htmlStr);

            $('.video-editor').find('.video-toggle').attr('data-state', '1');
            $('.video-editor').find('.video-toggle').text('Открепить');
            $('.video-editor').find('.video-info').text(`Прикреплено. ID: ${data.id}, ${data.name}`);
        })
        .catch((e) => {
            console.log(e)
            $('.video-editor').find('.video-toggle').attr('data-state', '0');
            $('.video-editor').find('.video-toggle').text('Прикрепить');
            $('.video-editor').find('.video-info').text(``);
        })
        .finally(() => {});
}

async function GoToVideoLink(value) {
    ajax_get_video_data(value)
        .then((data) => {
            window.open(`/video/?id=${data.id}`, '_blank').focus();
        });

}

function RenderVideo(value, htmlElem, windowElem) {
    try {
        windowElem.pause();
    } catch(e) {}
    if (!value || value == -1) {
        $(htmlElem).addClass('d-none');
        return;
    }
    get_video_ids(value)
    .then(data => {
        if (data) {
            $(htmlElem).removeClass('d-none');
            $(htmlElem).removeClass('not-active');
            if ('nftv' in data['links'] && data['links']['nftv'] != '') {
                windowElem.src({type: 'video/mp4', src: `https://213.108.4.28/video/player/${data['links']['nftv']}`});
                windowElem.poster(`https://213.108.4.28/video/poster/${data['links']['nftv']}`);
            } else if ('youtube' in data['links'] && data['links']['youtube'] != '') {
                windowElem.src({techOrder: ["youtube"], type: 'video/youtube', src: `https://www.youtube.com/watch?v=${data['links']['youtube']}`});
                windowElem.poster('');
            }
        } else {
            $(htmlElem).addClass('d-none');
        }
    })
    .catch(err => {
        $(htmlElem).addClass('d-none');
    });
}

function SetVideoId(value) {
    if ($('#openVideo1').hasClass('selected2')) {$('.video-value[name="video1"]').val(value);}
    if ($('#openVideo2').hasClass('selected2')) {$('.video-value[name="video2"]').val(value);}
    if ($('#openAnimation1').hasClass('selected2')) {$('.video-value[name="animation1"]').val(value);}
    if ($('#openAnimation2').hasClass('selected2')) {$('.video-value[name="animation2"]').val(value);}
    window.changedData = true;
}

function StopVideoForEdit() {
    try {
        window.videoPlayerCardEdit.pause();
    } catch (e) {}
}

function RenderExsAdditionalParams(data, disabled=true, selectedRow=null) {
    $('#exerciseAdditionalParamsModal').find('tbody').html('');
    let htmlStr = "";
    for (let i in data) {
        let elem = data[i];
        htmlStr += `
        <tr class="column-elem" data-id="${elem.id}">
            <td class=""></td>
            <td class="">
                <input name="field" class="form-control form-control-sm" type="text" value="${elem.field ? elem.field : ''}" placeholder="" autocomplete="off" ${disabled ? 'disabled=""' : ''} ">
            </td>
            <td class="text-center">
                <input type="checkbox" class="form-check-input" name="visible" ${elem.visible ? 'checked=""' : ''}>
            </td>
        </tr>
        `;
    }
    $('#exerciseAdditionalParamsModal').find('tbody').html(htmlStr);
    $('#exerciseAdditionalParamsModal').find(`.column-elem[data-id="${selectedRow}"]`).addClass('selected');

    LoadExerciseOne();
}

function EditExsAdditionalParam(mode="edit", fields={}) {
    let rowId = $('#exerciseAdditionalParamsModal').find('.column-elem.selected').attr('data-id');
    let dataToSend = {'edit_exs_additional_param': 1, 'mode': mode, 'row': rowId};
    dataToSend = Object.assign({}, dataToSend, fields);
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: dataToSend,
        type: 'POST', // GET или POST
        dataType: 'json',
        url: "exercises_api",
        success: function (res) {
            if (res.success) {
                let statusText = "";
                if (res.mode == "add") {
                    statusText = "Новый параметр успешно создан.";
                } else if (res.mode == "edit") {
                    statusText = "Параметр успешно изменён.";
                } else if (res.mode == "delete") {
                    statusText = "Параметр успешно удалён.";
                }
                swal("Готово", statusText, "success")
                .then((value) => {
                    RenderExsAdditionalParams(res.data, res.disabled, rowId);
                });
            } else {
                swal("Ошибка", `При создании / изменении параметра произошла ошибка (${res.err}).`, "error");
            }
        },
        error: function (res) {
            swal("Ошибка", "Параметр не удалось создать / изменить.", "error");
            console.log(res);
        },
        complete: function (res) {
            $('.page-loader-wrapper').fadeOut();
        }
    });
}

function ToggleExsAdditionalParamsOrder(dir) {
    let wasChanged = false;
    let cID = $('#exerciseAdditionalParamsModal').find('.column-elem.selected').attr('data-id');
    let elems = $('#exerciseAdditionalParamsModal').find(`tr.column-elem`);
    let tFirst = null; let tLast = null; let newInd = 0;
    for (let i = 0; i < elems.length; i++) {
        if ($(elems[i]).attr('data-id') == cID) {
            wasChanged = true;
            if (dir == "up") {
                tLast = $(elems[i]);
                if (i - 1 < 0) {
                    newInd = elems.length - 1;
                    tFirst = $(elems[newInd]);
                    $(tLast).detach().insertAfter($(tFirst));
                } else {
                    newInd = i - 1;
                    tFirst = $(elems[newInd]);
                    $(tLast).detach().insertBefore($(tFirst));
                }
            } else if (dir == "down") {
                tFirst = $(elems[i]);
                if (i + 1 > elems.length - 1) {
                    newInd = 0;
                    tLast = $(elems[newInd]);
                    $(tFirst).detach().insertBefore($(tLast));
                } else {
                    newInd = i + 1;
                    tLast = $(elems[newInd]);
                    $(tFirst).detach().insertAfter($(tLast));
                }
            }
            break;
        }             
    }
    EditExsAdditionalParamsOrder();
}

function EditExsAdditionalParamsOrder() {
    let rowId = $('#exerciseAdditionalParamsModal').find('.column-elem.selected').attr('data-id');
    let arrForIds = []; let arrForOrder = [];
    $('#exerciseAdditionalParamsModal').find('.column-elem').each((ind, elem) => {
        let tId = $(elem).attr('data-id');
        arrForIds.push(tId);
        arrForOrder.push(ind+1);
    });
    let dataToSend = {'change_order_exs_additional_param': 1, 'ids_arr': arrForIds, 'order_arr': arrForOrder};
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: dataToSend,
        type: 'POST', // GET или POST
        dataType: 'json',
        url: "exercises_api",
        success: function (res) {
            if (res.success) {
                RenderExsAdditionalParams(res.data, res.disabled, rowId);
            } else {
                swal("Ошибка", `При изменении порядка параметров произошла ошибка (${res.err}).`, "error");
            }
        },
        error: function (res) {
            swal("Ошибка", "Не удалось изменить порядок параметров.", "error");
            console.log(res);
        },
        complete: function (res) {
            $('.page-loader-wrapper').fadeOut();
        }
    });
}

// Drag and drop functions for exercises' tags
function allowDrop(ev) {
    ev.preventDefault();
}
function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
} 
function drop(ev) {
    ev.preventDefault();
    let data = ev.dataTransfer.getData("text");
    if (ev.target.tagName.toLowerCase() === 'div' && ev.target.classList.contains('category-block')) {
        ev.target.appendChild(document.getElementById(data));
        ChangeExsTagCategory(ev.target, document.getElementById(data));
    }
}

function LoadExercisesTagsAll() {
    let dataSend = {'get_exs_all_tags': 1};
    let dataResponse = null;
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: dataSend,
        type: 'GET', // GET или POST
        dataType: 'json',
        url: "/exercises/exercises_api",
        success: function (res) {
            if (res.success) {
                dataResponse = res.data;
            }
        },
        error: function (res) {},
        complete: function (res) {
            RenderExercisesTagsAll(dataResponse);
            $('.page-loader-wrapper').fadeOut();
        }
    });
}

function RenderExercisesTagsAll(data) {
    function _rendering(data, type="nfb") {
        let categoriesHtml = "";
        let categoriesInCardHtml = "";
        let colorsPack = [
            {'color': "#000000", 'name': "Чёрный"},
            {'color': "#24ae39", 'name': "Зелёный"},
            {'color': "#e0e01f", 'name': "Жёлтый"},
            {'color': "#e31c1c", 'name': "Красный"},
            {'color': "#2417bb", 'name': "Синий"},
            {'color': "#921ab9", 'name': "Фиолетовый"},
            {'color': "#ff8040", 'name': "Оранжевый"},
            {'color': "#88dbf4", 'name': "Голубой"},
            {'color': "#b2b2b2", 'name': "Серый"},
            {'color': "#fff0", 'name': "Прозрачный"},
        ];
        if (data && data['categories'] && Array.isArray(data['categories'][type])) {
            for (let i = 0; i < data['categories'][type].length; i++) {
                let elem = data['categories'][type][i];
                let colorsOptionsHtml = "";
                colorsPack.forEach(colorElem => {
                    colorsOptionsHtml += `
                        <option value="${colorElem.color}" ${elem.color == colorElem.color ? 'selected' : ''} style="
                            color: ${colorElem.color} !important;
                        ">${colorElem.name}</option>
                    `;
                });
                /*
                    <input name="color" class="form-control form-control-sm category-field" type="color" disabled=""
                        value="${elem.color ? elem.color : ''}" style="width: 15% !important;" 
                        title="Изменить цвет категории">
                */
                categoriesHtml += `
                    <div class="row category-container" data-id="${elem.id}">
                        <div class="col-12 d-flex mb-1">
                            <input name="title" class="form-control form-control-sm category-field" type="text" 
                                value="${elem.name ? elem.name : ''}" placeholder="Название категории" autocomplete="off" disabled="" 
                                style="width: 85% !important;">
                            <select name="color" class="form-control form-control-sm category-field" type="color" disabled="" 
                                autocomplete="off" title="Изменить цвет категории" style="width: 15% !important;">
                                ${colorsOptionsHtml}
                            </select>
                        </div>
                        <div class="col-12">
                            <div class="category-block" ondrop="drop(event)" ondragover="allowDrop(event)">
                            </div>
                        </div>
                    </div>
                `;

                categoriesInCardHtml += `
                    <div class="col">
                        <div class="card category-card" data-id="${elem.id}">
                            <div class="card-body">
                                <h5 class="card-title text-center" style="color: ${elem.color} !important;">
                                    ${elem.name ? elem.name : ''}
                                </h5>
                                <p class="card-text">
                                    <ul class="list-group">
                                    </ul>
                                </p>
                            </div>
                        </div>
                    </div>
                `;
            }
        }
        $('#exerciseTagsModal').find(`.content-container[data-id="${type}"]`).find('.category-container:not(.category-no)').remove();
        $('#exerciseTagsModal').find(`.content-container[data-id="${type}"]`).prepend(categoriesHtml);
        $('#exerciseTagsModal').find(`.content-container[data-id="${type}"]`).find('.category-container').find('.category-block > span.drag').remove();
        
        $('#card_tags').find(`.tags-container[data-id="${type}"] > div.row`).html(categoriesInCardHtml);
        if (data && Array.isArray(data[type])) {
            for (let i = 0; i < data[type].length; i++) {
                let elem = data[type][i];
                let tagHtml = `
                    <span class="drag mx-1" draggable="true" ondragstart="drag(event)" id="ex_tag_${type}_${i}" data-id="${elem.id}" data-category-id="${elem.category}">
                        <a class="btn btn-sm btn-light">
                            <span class="${type == "nfb" ? `tag-dot` : `tag-square`}" style="--color: ${elem.color && elem.color != "" ? elem.color : ''};"></span>
                            <span class="mr-1">${elem.name}</span>
                            <span class="badge badge-danger tag-delete" title="Удалить элемент">
                                <i class="fa fa-trash-o" aria-hidden="true"></i>
                            </span>
                        </a>
                    </span>
                `;
                let tagInCardHtml = `
                    <li class="list-group-item tag-elem py-1 mb-1" data-id="${elem.id}" data-name="${elem.name}">
                        ${elem.name}
                    </li>
                `;
                let fContainer = $('#exerciseTagsModal').find(`.content-container[data-id="${type}"]`).find(`.category-container[data-id="${elem.category}"]`);
                if (fContainer.length == 0) {
                    fContainer = $('#exerciseTagsModal').find(`.content-container[data-id="${type}"]`).find(`.category-container.category-no`);
                }
                $(fContainer).find('.category-block').append(tagHtml);

                let fContainerInCard = $('#card_tags').find(`.tags-container[data-id="${type}"]`).find(`.category-card[data-id="${elem.category}"]`);
                if (fContainerInCard.length > 0) {
                    $(fContainerInCard).find('ul.list-group').append(tagInCardHtml);
                }
            }
        }
    }
    _rendering(data, "nfb");
    _rendering(data, "self");
    $('#exerciseTagsModal').find(`.category-container[data-id="${window.selectedCategoryId}"]`).addClass('selected');
    ToggleSelectedTagsInCard();
}

function EditExsTagCategory(id, name, color, type, toDelete=0) {
    window.selectedCategoryId = id;
    let dataSend = {'edit_exs_tag_category': 1, id, name, color, type, 'delete': toDelete};
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: dataSend,
        type: 'POST', // GET или POST
        dataType: 'json',
        url: "/exercises/exercises_api",
        success: function (res) {
            if (res.success) {
                LoadExercisesTagsAll();
            } else {
                swal("Ошибка", "Не удалось создать / изменить / удалить категорию ключевых слов!", "error");
            }
        },
        error: function (res) {
            swal("Ошибка", "Не удалось создать / изменит / удалить категорию ключевых слов!", "error");
        },
        complete: function (res) {
            $('.page-loader-wrapper').fadeOut();
        }
    });
}

function ToggleExsTagCategoryOrder(dir) {
    let wasChanged = false;
    let cID = $('#exerciseTagsModal').find('.row.category-container.selected:visible:not(.category-no)').attr('data-id');
    let elems = $('#exerciseTagsModal').find('.row.category-container:visible:not(.category-no)');
    let tFirst = null; let tLast = null; let newInd = 0;
    for (let i = 0; i < elems.length; i++) {
        if ($(elems[i]).attr('data-id') == cID) {
            wasChanged = true;
            if (dir == "up") {
                tLast = $(elems[i]);
                if (i - 1 < 0) {
                    newInd = elems.length - 1;
                    tFirst = $(elems[newInd]);
                    $(tLast).detach().insertAfter($(tFirst));
                } else {
                    newInd = i - 1;
                    tFirst = $(elems[newInd]);
                    $(tLast).detach().insertBefore($(tFirst));
                }
            } else if (dir == "down") {
                tFirst = $(elems[i]);
                if (i + 1 > elems.length - 1) {
                    newInd = 0;
                    tLast = $(elems[newInd]);
                    $(tFirst).detach().insertBefore($(tLast));
                } else {
                    newInd = i + 1;
                    tLast = $(elems[newInd]);
                    $(tFirst).detach().insertAfter($(tLast));
                }
            }
            break;
        }             
    }
}

function SaveExsTagCategoryOrder() {
    let cType = $('#exerciseTagsModal').find(`.content-container:visible`).attr('data-id');
    let arrForIds = []; let arrForOrder = [];
    $('#exerciseTagsModal').find('.row.category-container:visible:not(.category-no)').each((ind, elem) => {
        let tId = $(elem).attr('data-id');
        arrForIds.push(tId);
        arrForOrder.push(ind+1);
    });
    let dataToSend = {'change_order_exs_tag_category': 1, 'ids_arr': arrForIds, 'order_arr': arrForOrder, 'type': cType};
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: dataToSend,
        type: 'POST', // GET или POST
        dataType: 'json',
        url: "exercises_api",
        success: function (res) {
            if (res.success) {
                swal("Успешно", "Порядок категорий ключевых слов успешно обновлён.", "success");
            } else {
                swal("Ошибка", `При изменении порядка категорий ключевых слов произошла ошибка (${res.err}).`, "error");
            }
        },
        error: function (res) {
            swal("Ошибка", "Не удалось изменить порядок категорий ключевых слов.", "error");
        },
        complete: function (res) {
            $('.page-loader-wrapper').fadeOut();
        }
    });
}

function SaveExsTagsOrder() {
    let cType = $('#exerciseTagsModal').find(`.content-container:visible`).attr('data-id');
    let arrForIds = []; let arrForOrder = [];
    $('#exerciseTagsModal').find('span.drag:visible').each((ind, elem) => {
        let tId = $(elem).attr('data-id');
        arrForIds.push(tId);
        arrForOrder.push(ind+1);
    });
    let dataToSend = {'change_order_exs_tag_one': 1, 'ids_arr': arrForIds, 'order_arr': arrForOrder, 'type': cType};
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: dataToSend,
        type: 'POST', // GET или POST
        dataType: 'json',
        url: "exercises_api",
        success: function (res) {
            if (res.success) {
                swal("Успешно", "Порядок ключевых слов успешно обновлён.", "success");
            } else {
                swal("Ошибка", `При изменении порядка ключевых слов произошла ошибка (${res.err}).`, "error");
            }
        },
        error: function (res) {
            swal("Ошибка", "Не удалось изменить порядок ключевых слов.", "error");
        },
        complete: function (res) {
            $('.page-loader-wrapper').fadeOut();
        }
    });
}

function EditExsTagOne(id, name, type, category, toDelete=0) {
    let dataSend = {'edit_exs_tag_one': 1, id, name, type, category, 'delete': toDelete};
    window.selectedCategoryId = category;
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: dataSend,
        type: 'POST', // GET или POST
        dataType: 'json',
        url: "/exercises/exercises_api",
        success: function (res) {
            if (res.success) {
                LoadExercisesTagsAll();
            } else {
                swal("Ошибка", "Не удалось создать / изменить / удалить ключевое слово!", "error");
            }
        },
        error: function (res) {
            swal("Ошибка", "Не удалось создать / изменить / удалить ключевое слово!", "error");
        },
        complete: function (res) {
            $('.page-loader-wrapper').fadeOut();
        }
    });
}

function ChangeExsTagCategory(categoryElem, tagElem) {
    let cType = $('#exerciseTagsModal').find(`.content-container:visible`).attr('data-id');
    let category = $(categoryElem).parent().parent().attr('data-id');
    let id = $(tagElem).attr('data-id');
    let oldCategoryId = $(tagElem).attr('data-category-id');
    if ((oldCategoryId == category) || (oldCategoryId == "" && category == "-1")) {return;}
    window.selectedCategoryId = null;
    let dataSend = {'change_exs_tag_category': 1, id, category, 'type': cType};
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: dataSend,
        type: 'POST', // GET или POST
        dataType: 'json',
        url: "/exercises/exercises_api",
        success: function (res) {
            if (res.success) {
                LoadExercisesTagsAll();
            } else {
                swal("Ошибка", "Не удалось переместить ключевое слово!", "error");
            }
        },
        error: function (res) {
            swal("Ошибка", "Не удалось переместить ключевое слово!", "error");
        },
        complete: function (res) {
            $('.page-loader-wrapper').fadeOut();
        }
    });
}

function ToggleSelectedTagsInCard() {
    if (!window.selectedTagsInCard) {
        window.selectedTagsInCard = [];
    }
    $('#card_tags').find('li.tag-elem').each((ind, elem) => {
        let cId = $(elem).attr('data-name');
        $(elem).toggleClass('active', window.selectedTagsInCard.includes(cId));
    });
}



$(function() {

    let cLang = $('#select-language').val();
    try {
        let watchdog_descriptionEditor2 = new CKSource.EditorWatchdog();
		watchdog_descriptionEditor2.setCreator((element, config) => {
			return CKSource.Editor
            .create(element, config)
            .then( editor => {
                document.descriptionEditor2 = editor;
                if (window.onlyViewMode) {
                    document.descriptionEditor2.enableReadOnlyMode('');
                    $('#descriptionEditor2').next().find('.ck-editor__top').addClass('d-none');
                    $('#descriptionEditor2').next().find('.ck-content.ck-editor__editable').addClass('borders-off');
                }
                $('.resizeable-block').css('height', `100%`);
				return editor;
			})
		});
        watchdog_descriptionEditor2.setDestructor(editor => {
            return editor.destroy();
        });
		watchdog_descriptionEditor2.on('error', (error) => {
            console.error("Error with CKEditor5: ", error);
        });
        watchdog_descriptionEditor2
		.create(document.querySelector('#descriptionEditor2'), {
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
            toolbar: {
                items: [
                    'heading', '|',
                    'fontSize', 'fontColor', 'fontBackgroundColor', '|',
                    'specialCharacters', '|',
                    'undo', 'redo', '|',
                    'bold', 'italic', 'underline', '|',
                    'bulletedList', 'numberedList', 'toDoList', '|',
                    'outdent', 'indent', 'alignment', '|',
                    'link', 'insertImage', 'blockQuote', 'insertTable', '|'
                ],
                shouldNotGroupWhenFull: true,
            },
		})
		.catch((error) => {
            console.error("Error with CKEditor5: ", error);
        });
        
        // ClassicEditor
        //     .create(document.querySelector('#descriptionEditor2'), {
        //         language: cLang,
        //         fontSize: {
        //             options: [
        //                 'tiny',
        //                 'small',
        //                 'default',
        //                 'big',
        //                 'huge'
        //             ]
        //         },
        //         toolbar: [
        //             'heading', 'bulletedList', 'numberedList', 'fontSize', 'undo', 'redo'
        //         ]
        //     })
        //     .then(editor => {
        //         document.descriptionEditor2 = editor;
        //         if (window.onlyViewMode) {
        //             document.descriptionEditor2.enableReadOnlyMode('');
        //             $('#descriptionEditor2').next().find('.ck-editor__top').addClass('d-none');
        //             $('#descriptionEditor2').next().find('.ck-content.ck-editor__editable').addClass('borders-off');
        //         }
        //         $('.resizeable-block').css('height', `75vh`);
        //     })
        //     .catch(err => {
        //         console.error(err);
        //     });
    } catch(e) {}
    try {
        let watchdog_descriptionEditor2Template = new CKSource.EditorWatchdog();
		watchdog_descriptionEditor2Template.setCreator((element, config) => {
			return CKSource.Editor
            .create(element, config)
            .then( editor => {
                editor.setData($('#descriptionEditor2Template').attr('data-content'));
                document.descriptionEditor2Template = editor;
                $('.resizeable-block').css('height', `100%`);
				return editor;
			})
		});
        watchdog_descriptionEditor2Template.setDestructor(editor => {
            return editor.destroy();
        });
		watchdog_descriptionEditor2Template.on('error', (error) => {
            console.error("Error with CKEditor5: ", error);
        });
        watchdog_descriptionEditor2Template
		.create(document.querySelector('#descriptionEditor2Template'), {
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
            toolbar: {
                items: [
                    'heading', '|',
                    'fontSize', 'fontColor', 'fontBackgroundColor', '|',
                    'specialCharacters', '|',
                    'undo', 'redo', '|',
                    'bold', 'italic', 'underline', '|',
                    'bulletedList', 'numberedList', 'toDoList', '|',
                    'outdent', 'indent', 'alignment', '|',
                    'link', 'insertImage', 'blockQuote', 'insertTable', '|'
                ],
                shouldNotGroupWhenFull: true,
            },
		})
		.catch((error) => {
            console.error("Error with CKEditor5: ", error);
        });

        // ClassicEditor
        //     .create(document.querySelector('#descriptionEditor2Template'), {
        //         language: cLang
        //     })
        //     .then(editor => {
        //         editor.setData($('#descriptionEditor2Template').attr('data-content'));
        //         document.descriptionEditor2Template = editor;
        //         $('.resizeable-block').css('height', `75vh`);
        //     })
        //     .catch(err => {
        //         console.error(err);
        //     });
    } catch(e) {}

    window.dataForSplitExsCardCols = JSON.parse(localStorage.getItem('split_exs_card_cols'));
    if (!window.dataForSplitExsCardCols) {
        window.dataForSplitExsCardCols = [27, 45, 28];
        localStorage.setItem('split_exs_card_cols', JSON.stringify(window.dataForSplitExsCardCols));
    }
    RenderSplitExsCardCols();


    ToggleEditFields(false);

    let templateSelect2 = (state) => {
        if (!state.id) {
            return state.text;
        }
        let text = state.text;
        let color = $(state.element).attr('data-color');
        let tagClass = $(state.element).attr('data-tag-class');
        let $state = $(`
            <span class="${tagClass}" style="--color: ${color};"></span>
            <span>${text}</span>
        `);
        return $state;
    };
    $('#exerciseCard').find('.exs_edit_field[name="tags"]').select2({
        maximumSelectionLength: 20,
        closeOnSelect: false,
        templateSelection: templateSelect2,
        templateResult: templateSelect2
    })
    .on('select2:selecting', e => $(e.currentTarget).data('scrolltop', $('.select2-results__options').scrollTop()))
    .on('select2:select', e => $('.select2-results__options').scrollTop($(e.currentTarget).data('scrolltop')))
    .on('select2:unselecting', e => $(e.currentTarget).data('scrolltop', $('.select2-results__options').scrollTop()))
    .on('select2:unselect', e => $('.select2-results__options').scrollTop($(e.currentTarget).data('scrolltop')));

    $('#exerciseCard').on('click', '#openDescription', (e) => {
        $('#exerciseCard').find('.tab-btn').removeClass('selected2');
        $(e.currentTarget).addClass('selected2');
        $('#exerciseCard').find('#cardBlock').find('.c-block').addClass('d-none');
        $('#exerciseCard').find('#cardBlock').find('.tab-pane').addClass('d-none');
        $('#exerciseCard').find('#cardBlock').find('.tab-pane').removeClass('show active');
        $('#exerciseCard').find('#cardBlock').find('#card_description').parent().removeClass('d-none');
        $('#exerciseCard').find('#cardBlock').find('#card_description').removeClass('d-none');
        $('#exerciseCard').find('#cardBlock').find('#card_description').addClass('show active');
        $('#exerciseCard').find('button[data-type="add"]').removeClass('d-none');

        $('.scheme-editor').parent().addClass('d-none');
        $('.scheme-editor').addClass('d-none');
        StopVideoForEdit();
        $('.video-editor').parent().addClass('d-none');
        $('.video-editor').addClass('d-none');
    });
    $('#exerciseCard').on('click', '#openDrawing1', (e) => {
        $('#exerciseCard').find('.tab-btn').removeClass('selected2');
        $(e.currentTarget).addClass('selected2');
        $('#exerciseCard').find('#cardBlock').find('.c-block').addClass('d-none');
        $('#exerciseCard').find('#cardBlock').find('.tab-pane').addClass('d-none');
        $('#exerciseCard').find('#cardBlock').find('.tab-pane').removeClass('show active');
        $('#exerciseCard').find('#cardBlock').find('#card_drawing1').parent().removeClass('d-none');
        $('#exerciseCard').find('#cardBlock').find('#card_drawing1').removeClass('d-none');
        $('#exerciseCard').find('#cardBlock').find('#card_drawing1').addClass('show active');
        $('#exerciseCard').find('button[data-type="add"]').addClass('d-none');

        if ($('#editExs').attr('data-active') == '1') {
            $('#card_drawing1').addClass('d-none');
            // $('.scheme-editor').find('iframe').contents().find('#svgparent').html($('#card_drawing1').find('.card').html());
            // $('.scheme-editor').find('iframe')[0].contentWindow.svgBlockResize();
            // setTimeout((e) => {
            //     $('.scheme-editor').find('iframe')[0].contentWindow.svgBlockResize();
            // }, 100);
            let cId = $('#exerciseCard').find('.exs_edit_field[name="scheme_1"]').val();
            let cSrc = "http://62.113.105.179/canvas/new";
            if (cId && cId != "") {
                cSrc = `http://62.113.105.179/canvas/edit/${cId}`;
            }
            $('.scheme-editor').find('iframe').attr('src', cSrc);
            window.addEventListener('message', (e) => {
                if (e.origin === "http://62.113.105.179") {
                    const { event, payload } = e.data;
                    let newId = null;
                    try {
                        newId = payload.canvas.id;
                    } catch (e) {}
                    if (event == "canvas::load") {return;}
                    if (newId && newId != "") {
                        // let cSrc = `http://62.113.105.179/canvas/edit/${newId}`;
                        // $('.scheme-editor').find('iframe').attr('src', cSrc);
                        if ($('#openDrawing1').hasClass('selected2')) {
                            $('#exerciseCard').find('.exs_edit_field[name="scheme_1"]').val(newId);
                        }
                    }
                }
            });
            $('.scheme-editor').parent().removeClass('d-none');
            $('.scheme-editor').removeClass('d-none');
        }
        StopVideoForEdit();
        $('.video-editor').parent().addClass('d-none');
        $('.video-editor').addClass('d-none');
    });
    $('#exerciseCard').on('click', '#openDrawing2', (e) => {
        $('#exerciseCard').find('.tab-btn').removeClass('selected2');
        $(e.currentTarget).addClass('selected2');
        $('#exerciseCard').find('#cardBlock').find('.c-block').addClass('d-none');
        $('#exerciseCard').find('#cardBlock').find('.tab-pane').addClass('d-none');
        $('#exerciseCard').find('#cardBlock').find('.tab-pane').removeClass('show active');
        $('#exerciseCard').find('#cardBlock').find('#card_drawing2').parent().removeClass('d-none');
        $('#exerciseCard').find('#cardBlock').find('#card_drawing2').removeClass('d-none');
        $('#exerciseCard').find('#cardBlock').find('#card_drawing2').addClass('show active');
        $('#exerciseCard').find('button[data-type="add"]').addClass('d-none');

        if ($('#editExs').attr('data-active') == '1') {
            $('#card_drawing2').addClass('d-none');
            // $('.scheme-editor').find('iframe').contents().find('#svgparent').html($('#card_drawing2').find('.card').html());
            // $('.scheme-editor').find('iframe')[0].contentWindow.svgBlockResize();
            // setTimeout((e) => {
            //     $('.scheme-editor').find('iframe')[0].contentWindow.svgBlockResize();
            // }, 100);
            let cId = $('#exerciseCard').find('.exs_edit_field[name="scheme_2"]').val();
            let cSrc = "http://62.113.105.179/canvas/new";
            if (cId && cId != "") {
                cSrc = `http://62.113.105.179/canvas/edit/${cId}`;
            }
            $('.scheme-editor').find('iframe').attr('src', cSrc);
            window.addEventListener('message', (e) => {
                if (e.origin === "http://62.113.105.179") {
                    const { event, payload } = e.data;
                    let newId = null;
                    try {
                        newId = payload.canvas.id;
                    } catch (e) {}
                    if (event == "canvas::load") {return;}
                    if (newId && newId != "") {
                        // let cSrc = `http://62.113.105.179/canvas/edit/${newId}`;
                        // $('.scheme-editor').find('iframe').attr('src', cSrc);
                        if ($('#openDrawing2').hasClass('selected2')) {
                            $('#exerciseCard').find('.exs_edit_field[name="scheme_2"]').val(newId);
                        }
                    }
                }
            });
            $('.scheme-editor').parent().removeClass('d-none');
            $('.scheme-editor').removeClass('d-none');
        }
        StopVideoForEdit();
        $('.video-editor').parent().addClass('d-none');
        $('.video-editor').addClass('d-none');
    });
    $('#exerciseCard').on('click', '#openVideo1', (e) => {
        $('#exerciseCard').find('.tab-btn').removeClass('selected2');
        $(e.currentTarget).addClass('selected2');
        $('#exerciseCard').find('#cardBlock').find('.c-block').addClass('d-none');
        $('#exerciseCard').find('#cardBlock').find('.tab-pane').addClass('d-none');
        $('#exerciseCard').find('#cardBlock').find('.tab-pane').removeClass('show active');
        $('#exerciseCard').find('#cardBlock').find('#card_video1').parent().removeClass('d-none');
        $('#exerciseCard').find('#cardBlock').find('#card_video1').removeClass('d-none');
        $('#exerciseCard').find('#cardBlock').find('#card_video1').addClass('show active');
        $('#exerciseCard').find('button[data-type="add"]').addClass('d-none');

        $('.scheme-editor').parent().addClass('d-none');
        $('.scheme-editor').addClass('d-none');
        StopVideoForEdit();
        CheckSelectedRowInVideoTable();
        $('.video-editor').parent().removeClass('d-none');
        $('.video-editor').removeClass('d-none');
        try {
            video_table.columns.adjust().draw();
        } catch(e) {}

        $('#exerciseCard').find('.exs_video_link').addClass('d-none');
        $('#exerciseCard').find('.exs_video_link[data-type="video_1"]').removeClass('d-none');
    });
    $('#exerciseCard').on('click', '#openVideo2', (e) => {
        $('#exerciseCard').find('.tab-btn').removeClass('selected2');
        $(e.currentTarget).addClass('selected2');
        $('#exerciseCard').find('#cardBlock').find('.c-block').addClass('d-none');
        $('#exerciseCard').find('#cardBlock').find('.tab-pane').addClass('d-none');
        $('#exerciseCard').find('#cardBlock').find('.tab-pane').removeClass('show active');
        $('#exerciseCard').find('#cardBlock').find('#card_video2').parent().removeClass('d-none');
        $('#exerciseCard').find('#cardBlock').find('#card_video2').removeClass('d-none');
        $('#exerciseCard').find('#cardBlock').find('#card_video2').addClass('show active');
        $('#exerciseCard').find('button[data-type="add"]').addClass('d-none');

        $('.scheme-editor').parent().addClass('d-none');
        $('.scheme-editor').addClass('d-none');
        StopVideoForEdit();
        CheckSelectedRowInVideoTable();
        $('.video-editor').parent().removeClass('d-none');
        $('.video-editor').removeClass('d-none');
        try {
            video_table.columns.adjust().draw();
        } catch(e) {}

        $('#exerciseCard').find('.exs_video_link').addClass('d-none');
        $('#exerciseCard').find('.exs_video_link[data-type="video_2"]').removeClass('d-none');
    });
    $('#exerciseCard').on('click', '#openAnimation1', (e) => {
        $('#exerciseCard').find('.tab-btn').removeClass('selected2');
        $(e.currentTarget).addClass('selected2');
        $('#exerciseCard').find('#cardBlock').find('.c-block').addClass('d-none');
        $('#exerciseCard').find('#cardBlock').find('.tab-pane').addClass('d-none');
        $('#exerciseCard').find('#cardBlock').find('.tab-pane').removeClass('show active');
        $('#exerciseCard').find('#cardBlock').find('#card_animation1').parent().removeClass('d-none');
        $('#exerciseCard').find('#cardBlock').find('#card_animation1').removeClass('d-none');
        $('#exerciseCard').find('#cardBlock').find('#card_animation1').addClass('show active');
        $('#exerciseCard').find('button[data-type="add"]').addClass('d-none');

        $('.scheme-editor').parent().addClass('d-none');
        $('.scheme-editor').addClass('d-none');
        StopVideoForEdit();
        CheckSelectedRowInVideoTable();
        $('.video-editor').parent().removeClass('d-none');
        $('.video-editor').removeClass('d-none');
        try {
            video_table.columns.adjust().draw();
        } catch(e) {}

        $('#exerciseCard').find('.exs_video_link').addClass('d-none');
        $('#exerciseCard').find('.exs_video_link[data-type="animation_1"]').removeClass('d-none');
    });
    $('#exerciseCard').on('click', '#openAnimation2', (e) => {
        $('#exerciseCard').find('.tab-btn').removeClass('selected2');
        $(e.currentTarget).addClass('selected2');
        $('#exerciseCard').find('#cardBlock').find('.c-block').addClass('d-none');
        $('#exerciseCard').find('#cardBlock').find('.tab-pane').addClass('d-none');
        $('#exerciseCard').find('#cardBlock').find('.tab-pane').removeClass('show active');
        $('#exerciseCard').find('#cardBlock').find('#card_animation2').parent().removeClass('d-none');
        $('#exerciseCard').find('#cardBlock').find('#card_animation2').removeClass('d-none');
        $('#exerciseCard').find('#cardBlock').find('#card_animation2').addClass('show active');
        $('#exerciseCard').find('button[data-type="add"]').addClass('d-none');

        $('.scheme-editor').parent().addClass('d-none');
        $('.scheme-editor').addClass('d-none');
        StopVideoForEdit();
        CheckSelectedRowInVideoTable();
        $('.video-editor').parent().removeClass('d-none');
        $('.video-editor').removeClass('d-none');
        try {
            video_table.columns.adjust().draw();
        } catch(e) {}

        $('#exerciseCard').find('.exs_video_link').addClass('d-none');
        $('#exerciseCard').find('.exs_video_link[data-type="animation_2"]').removeClass('d-none');
    });
    $('#exerciseCard').on('click', '#openTags', (e) => {
        $('#exerciseCard').find('.tab-btn').removeClass('selected2');
        $(e.currentTarget).addClass('selected2');
        $('#exerciseCard').find('#cardBlock').find('.c-block').addClass('d-none');
        $('#exerciseCard').find('#cardBlock').find('.tab-pane').addClass('d-none');
        $('#exerciseCard').find('#cardBlock').find('.tab-pane').removeClass('show active');
        $('#exerciseCard').find('#cardBlock').find('#card_tags').parent().removeClass('d-none');
        $('#exerciseCard').find('#cardBlock').find('#card_tags').removeClass('d-none');
        $('#exerciseCard').find('#cardBlock').find('#card_tags').addClass('show active');

        $('.scheme-editor').parent().addClass('d-none');
        $('.scheme-editor').addClass('d-none');
        StopVideoForEdit();
        $('.video-editor').parent().addClass('d-none');
        $('.video-editor').addClass('d-none');
    });

    $('#exerciseCard').on('click', 'button[data-type="add"]', (e) => {
        $('#exerciseCard').find('button[data-type="add"]').removeClass('selected');
        $(e.currentTarget).addClass('selected');
    });


    $('#exerciseCard').on('click', '.graphics-block-toggle', (e) => {
        let cId = $(e.currentTarget).attr('data-id');
        $('#exerciseCard').find('.graphics-block-toggle').removeClass('selected');
        $(e.currentTarget).addClass('selected');
        $('#exerciseCard').find('.graphics-block').addClass('d-none');
        $('#exerciseCard').find(`.graphics-block[data-id=${cId}]`).removeClass('d-none');
    });


    $('#columnsSizeInCard2').on('click', (e) => {
        $('#exerciseCard').find('div.gutter').toggleClass('d-none');
    });


    $('#exerciseCard').on('click', '.add-row', (e) => {
        let cId = $(e.currentTarget).attr('data-id');
        let cloneRow = null;
        if (cId == "additions1") {
            cloneRow = $('#exerciseCard').find('.gen-content').find(`tr[data-id="${cId}"]`).clone();
        } else {
            let cType = $('#exerciseCard').find('.selected[data-type="add"]').attr('data-id');
            // if (cId == "notes" || cId == "additional_data") {cType = "text";}
            cloneRow = $('#exerciseCard').find('.gen-content').find(`tr[data-id="${cId}"][data-type="${cType}"]`).clone();
        }
        $(cloneRow).addClass('wider_row value_row');
        $(cloneRow).find('.form-control').addClass('exs_edit_field');
        $(cloneRow).find('.form-control').addClass('exs_team_param');
        $(cloneRow).find('.exs_edit_field').val('');
        $(cloneRow).find('.remove-row').addClass('btn-on');
        $(cloneRow).find('.remove-row').prop('disabled', false);
        $(cloneRow).insertAfter($('#exerciseCard').find(`.wider_row[data-id="${cId}"]`).last());
        CorrectBlockBorders();
        window.changedData = true;
    });
    $('#exerciseCard').on('click', '.remove-row', (e) => {
        if (!$(e.currentTarget).hasClass('btn-on')) {return;}
        $(e.currentTarget).parent().parent().parent().parent().remove();
        CorrectBlockBorders();
        window.changedData = true;
    });


    $('#exerciseCard').on('change', '.nfb_folders[name="folder_parent"]', (e) => {
        let cId = $(e.currentTarget).val();
        $('#exerciseCard').find('.nfb_folders[name="folder_main"]').val('');
        $('#exerciseCard').find('.nfb_folders[name="folder_main"] > option').each((ind, elem) => {
            $(elem).toggleClass('d-none', !($(elem).attr('data-parent') == cId));
        });
    });
    $('#exerciseCard').on('change', '.team_folders[name="folder_parent"]', (e) => {
        let cId = $(e.currentTarget).val();
        $('#exerciseCard').find('.team_folders[name="folder_main"]').val('');
        $('#exerciseCard').find('.team_folders[name="folder_main"] > option').each((ind, elem) => {
            $(elem).toggleClass('d-none', !($(elem).attr('data-parent') == cId));
        });
    });


    $('#exerciseCard').on('change', '.exs_edit_field', (e) => {
        window.changedData = true;
        if (!$(e.currentTarget).prop('required') && !$(e.currentTarget).hasClass('field_pair')) {return;}
        if ($(e.currentTarget).prop('required')) {
            let isEmpty = $(e.currentTarget).val() == '';
            $(e.currentTarget).toggleClass('empty-field', isEmpty);
        } else if ($(e.currentTarget).hasClass('field_pair')) {
            let cName = $(e.currentTarget).attr('name');
            if (cName == "field_age_a") {
                let secondValElem = $('#exerciseCard').find('.exs_edit_field[name="field_age_b"]');
                if (secondValElem.val() == "") {
                    $(secondValElem).val($(e.currentTarget).val());
                }
            } else if (cName == "field_age_b") {
                let secondValElem = $('#exerciseCard').find('.exs_edit_field[name="field_age_a"]');
                if (secondValElem.val() == "") {
                    $(secondValElem).val($(e.currentTarget).val());
                }
            } else if (cName == "field_players_a") {
                let secondValElem = $('#exerciseCard').find('.exs_edit_field[name="field_players_b"]');
                if (secondValElem.val() == "") {
                    $(secondValElem).val($(e.currentTarget).val());
                }
            } else if (cName == "field_players_b") {
                let secondValElem = $('#exerciseCard').find('.exs_edit_field[name="field_players_a"]');
                if (secondValElem.val() == "") {
                    $(secondValElem).val($(e.currentTarget).val());
                }
            }
        }
    });

    $('#exerciseCard').on('click', '.video-link-open', (e) => {
        let cLink = $('#exerciseCard').find('input[name="video_links_link[]"]:visible').val();
        window.open(cLink, '_blank').focus();
    });
    $('#exerciseCard').on('click', '.video-link-copy', (e) => {
        let cLink = $('#exerciseCard').find('input[name="video_links_link[]"]:visible').val();
        navigator.clipboard.writeText(cLink);
    });


    $('#exerciseCard').find('.btn-view').toggleClass('d-none', false);
    $('#exerciseCard').find('.btn-edit').toggleClass('d-none', true);

    $('#editExs').on('click', (e) => {
        let isActive = $(e.currentTarget).attr('data-active');
        ToggleUpperButtonsPanel(isActive);
        ToggleEditFields(isActive != '1');
    });

    // scheme autosave
    $('#saveScheme').on('click', (e) => {
        let cloneSvgParent = $('.scheme-editor').find('iframe').contents().find('#svgparent').clone();
        $(cloneSvgParent).find('#block').css({'width' : '', 'height' : ''});
        $(cloneSvgParent).find('#selects').html('');
        $(cloneSvgParent).find('#dots').html('');
        let content = $(cloneSvgParent).html();
        if ($('#card_drawing1').hasClass('active')) {
            $('#card_drawing1').find('.card').html(content);
        }
        if ($('#card_drawing2').hasClass('active')) {
            $('#card_drawing2').find('.card').html(content);
        }
        window.changedData = true;
    });

    // scheme copy
    $('#copyScheme').on('click', (e) => {
        if ($('#card_drawing1').hasClass('active')) {
            $('#card_drawing2').find('.card').html(
                $('#card_drawing1').find('.card').html()
            );
        }
        if ($('#card_drawing2').hasClass('active')) {
            $('#card_drawing1').find('.card').html(
                $('#card_drawing2').find('.card').html()
            );
        }
        window.changedData = true;
    });


    // Save and Load exercise
    ToggleFoldersType();
    LoadExerciseOne();
    $('#exerciseCard').on('click', '#saveExs', (e) => {
        window.changedData = false;
        SaveExerciseOne();
    });

    $('#exerciseCard').on('click', '#deleteExercise', (e) => {
        window.changedData = false;
        DeleteExerciseOne();
    });
    

    window.exsList = {'list': [], 'index': -1};
    try {
        window.exsList = JSON.parse(sessionStorage.getItem('exs_list'));
        ToggleExsDir();
    } catch(e) {}
    $('.exs-change').on('click', (e) => {
        let dir = $(e.currentTarget).attr('data-dir');
        dir = dir == "prev" ? -1 : dir == "next" ? 1 : 0;
        ToggleExsDir(dir);
    });

    try {
        window.videoPlayerCardEdit = videojs('video-player-card-edit', {
            preload: 'auto',
            autoplay: false,
            controls: true,
            aspectRatio: '16:9',
            youtube: { "iv_load_policy": 1, 'modestbranding': 1, 'rel': 0, 'showinfo': 0, 'controls': 0 },
        });
    } catch (e) {}

    try {
        window.videoPlayerCard1 = videojs('video-player-card-1', {
            preload: 'auto',
            autoplay: false,
            controls: true,
            aspectRatio: '16:9',
            youtube: { "iv_load_policy": 1, 'modestbranding': 1, 'rel': 0, 'showinfo': 0, 'controls': 0 },
        });
        // window.videoPlayerCard2 = videojs('video-player-card-2', {
        //     preload: 'auto',
        //     autoplay: false,
        //     controls: true,
        //     aspectRatio: '16:9',
        //     youtube: { "iv_load_policy": 1, 'modestbranding': 1, 'rel': 0, 'showinfo': 0, 'controls': 0 },
        // });
        window.videoPlayerCard3 = videojs('video-player-card-3', {
            preload: 'auto',
            autoplay: false,
            controls: true,
            aspectRatio: '16:9',
            youtube: { "iv_load_policy": 1, 'modestbranding': 1, 'rel': 0, 'showinfo': 0, 'controls': 0 },
        });
        // window.videoPlayerCard4 = videojs('video-player-card-4', {
        //     preload: 'auto',
        //     autoplay: false,
        //     controls: true,
        //     aspectRatio: '16:9',
        //     youtube: { "iv_load_policy": 1, 'modestbranding': 1, 'rel': 0, 'showinfo': 0, 'controls': 0 },
        // });
    } catch (e) {}
 

    window.currentVideoId = -1;
    try {
        generate_ajax_video_table('56vh');
        $('#video').on('xhr.dt', (e, settings, json, xhr) => {
            setTimeout(() => {
                let value = -1;
                if ($('#openVideo1').hasClass('selected2')) {value = $('.video-value[name="video1"]').val();}
                if ($('#openVideo2').hasClass('selected2')) {value = $('.video-value[name="video2"]').val();}
                if ($('#openAnimation1').hasClass('selected2')) {value = $('.video-value[name="animation1"]').val();}
                if ($('#openAnimation2').hasClass('selected2')) {value = $('.video-value[name="animation2"]').val();}
                try {
                    value = parseInt(value);
                    if (isNaN(value)) {value = -1;}
                } catch(e) {}
                SelectRowInVideoTable(video_table, value);
            }, 500);
        });

        $('#video').on('draw.dt', () => {
            SetCurrentVideo(window.currentVideoId);
        });

        video_table
            .on( 'select', (e, dt, type, indexes) => {
                let rowData = video_table.rows( indexes ).data().toArray();
                if (type=='row') {
                    let currentData = rowData[0];
                    window.currentVideoId = currentData.id;
                    RenderVideo(currentData.id, $('.video-editor').find('#video-player-card-edit'), window.videoPlayerCardEdit);
                    $('.video-editor').find('.video-toggle').attr('data-state', '0');
                    $('.video-editor').find('.video-toggle').text('Прикрепить');
                }
            })
            .on( 'deselect', (e, dt, type, indexes) => {});
        $('#video').on('click', 'tr', (e) => {
            let isSelected = $(e.currentTarget).hasClass('selected');
            if (!isSelected) {
                RenderVideo(-1, $('.video-editor').find('#video-player-card-edit'), window.videoPlayerCardEdit);
                CheckSelectedRowInVideoTable(true);
            }
        });

        $('.video-editor').on('click', '.video-toggle', (e) => {
            let selectedRow = video_table.rows({selected: true}).data().toArray()[0];
            let selectedId = selectedRow ? selectedRow.id : null;
            if ($(e.currentTarget).attr('data-state') == '1') {
                window.currentVideoId = -1;
                SetVideoId('');
                SetCurrentVideo(-1);
                RenderVideo(-1, $('.video-editor').find('#video-player-card-edit'), window.videoPlayerCardEdit);
            } else {
                if (selectedId) {
                    window.currentVideoId = selectedId;
                    SetVideoId(selectedId);
                    SetCurrentVideo(selectedId);
                }
            }
        });
        $('.video-editor').on('click', '.video-link', (e) => {
            GoToVideoLink(window.currentVideoId);
        });

        $('#video-card-modal-open').on('click', (e) => {
            let cId = -1;
            try {
                cId = parseInt($('#video').find('tbody > tr.selected').attr('id'));
                if (isNaN(cId)) {cId = -1;}
            } catch(e) {}
            if (cId != -1) {
                ajax_get_video_data(cId)
                .then((data) => {
                    render_json_block(data);
                });
            }
        });

    } catch(e) {}

    $('#exerciseCard').on('click', 'tr.add-params-container-after', (e) => {
        $('#exerciseCard').find('tr.additional-params-container:not(.empty)').toggleClass('d-none');
    });

    $('#exsAdditionalParamsRef').on('click', (e) => {
        $('#exerciseAdditionalParamsModal').modal();
    });
    $('#exerciseAdditionalParamsModal').on('click', '.column-elem', (e) => {
        let wasActive = $(e.currentTarget).hasClass('selected');
        $('#exerciseAdditionalParamsModal').find('.column-elem').removeClass('selected');
        $(e.currentTarget).toggleClass('selected', !wasActive);
    });
    $('#exerciseAdditionalParamsModal').on('click', '.col-add', (e => {
        $('#exerciseAdditionalParamsModal').find('.column-elem').removeClass('selected');
        EditExsAdditionalParam("edit");
    }));
    $('#exerciseAdditionalParamsModal').on('click', '.col-edit', (e => {
        $('#exerciseAdditionalParamsModal').find('input').prop('disabled', false);
    }));
    $('#exerciseAdditionalParamsModal').on('change', 'input', (e => {
        $('#exerciseAdditionalParamsModal').find('.column-elem').removeClass('selected');
        $(e.currentTarget).parent().parent().addClass('selected');
        let fieldName = $(e.currentTarget).attr('name');
        let fieldVal = $(e.currentTarget).attr('type') == "checkbox" ? $(e.currentTarget).prop('checked') : $(e.currentTarget).val();
        let field = {[fieldName]: fieldVal};
        EditExsAdditionalParam("edit", field);
    }));
    $('#exerciseAdditionalParamsModal').on('click', '.col-delete', (e => {
        if ($('#exerciseAdditionalParamsModal').find('.column-elem.selected').length > 0) {
            EditExsAdditionalParam("delete");
        }
    }));
    $('#exerciseAdditionalParamsModal').on('click', '.col-up', (e => {
        ToggleExsAdditionalParamsOrder("up");
    }));
    $('#exerciseAdditionalParamsModal').on('click', '.col-down', (e => {
        ToggleExsAdditionalParamsOrder("down");
    }));


    $('#exsTagsRef').on('click', (e) => {
        $('#exerciseTagsModal').modal();
    });
    $('#exerciseTagsModal').on('show.bs.modal', (e) => {
        LoadExercisesTagsAll();
    });
    $('#exerciseTagsModal').on('click', 'a.nav-link', (e) => {
        let cId = $(e.currentTarget).attr('data-id');
        $('#exerciseTagsModal').find('a.nav-link').removeClass('active');
        $('#exerciseTagsModal').find('.content-container').addClass('d-none');
        $(e.currentTarget).addClass('active');
        $('#exerciseTagsModal').find(`.content-container[data-id="${cId}"]`).removeClass('d-none');
        $('#exerciseTagsModal').find('.row.category-container').removeClass('selected');
        $('#exerciseTagsModal').find('.tag-add-control').addClass('d-none');
    });
    $('#exerciseTagsModal').on('click', '.row.category-container', (e) => {
        if ($(e.target).is('span') || $(e.target).is('a') || $(e.target).is('i')) {
            return;
        }
        let isSelected = $(e.currentTarget).hasClass('selected');
        $('#exerciseTagsModal').find('.row.category-container').removeClass('selected');
        $(e.currentTarget).toggleClass('selected', !isSelected);
        $('#exerciseTagsModal').find('.tag-add-control').toggleClass('d-none', isSelected);
    });
    $('#exerciseTagsModal').on('click', '.col-add', (e) => {
        let cType = $('#exerciseTagsModal').find(`.content-container:visible`).attr('data-id');
        EditExsTagCategory(null, "", null, cType);
    });
    $('#exerciseTagsModal').on('click', '.col-edit', (e) => {
        $('#exerciseTagsModal').find('.category-field').prop('disabled', false);
    });
    $('#exerciseTagsModal').on('change', '.category-field', (e) => {
        let cType = $('#exerciseTagsModal').find(`.content-container:visible`).attr('data-id');
        let cId = $(e.currentTarget).parent().parent().attr('data-id');
        let cName = $(e.currentTarget).parent().find('.category-field[name="title"]').val();
        let cColor = $(e.currentTarget).parent().find('.category-field[name="color"]').val();
        EditExsTagCategory(cId, cName, cColor, cType);
    });
    $('#exerciseTagsModal').on('click', '.col-delete', (e) => {
        let cType = $('#exerciseTagsModal').find(`.content-container:visible`).attr('data-id');
        let cId = $('#exerciseTagsModal').find('.row.category-container.selected:visible').attr('data-id');
        EditExsTagCategory(cId, "", null, cType, 1);
    });
    $('#exerciseTagsModal').on('click', '.col-up', (e) => {
        ToggleExsTagCategoryOrder("up");
    });
    $('#exerciseTagsModal').on('click', '.col-down', (e) => {
        ToggleExsTagCategoryOrder("down");
    });
    $('#exerciseTagsModal').on('click', 'button.save', (e) => {
        window.selectedCategoryId = null;
        SaveExsTagCategoryOrder();
        SaveExsTagsOrder();
    });
    $('#exerciseTagsModal').on('click', '.tag-edit', (e) => {
        let cType = $('#exerciseTagsModal').find(`.content-container:visible`).attr('data-id');
        let cCategory = $('#exerciseTagsModal').find('.row.category-container.selected:visible').attr('data-id');
        let cName = $('#exerciseTagsModal').find('input[name="edit_tag"]').val();
        let tagId = $('#exerciseTagsModal').find('span.drag.selected').first().attr('data-id');
        if (cCategory && cName != "") {
            EditExsTagOne(tagId, cName, cType, cCategory);
        }
        $('#exerciseTagsModal').find('input[name="add_new_tag"]').val('');
    });
    $('#exerciseTagsModal').on('click', '.tag-delete', (e) => {
        let cType = $('#exerciseTagsModal').find(`.content-container:visible`).attr('data-id');
        let cId = $(e.currentTarget).parent().parent().attr('data-id');
        EditExsTagOne(cId, "", cType, null, 1);
    });
    $('#exerciseTagsModal').on('click', 'span.drag', (e) => {
        let wasSelected = $(e.currentTarget).hasClass('selected');
        let cVal = $(e.currentTarget).find('a > span:nth-child(2)').text();
        $('#exerciseTagsModal').find('span.drag').removeClass('selected');
        $(e.currentTarget).toggleClass('selected', !wasSelected);
        if (!wasSelected) {
            $('#exerciseTagsModal').find('input[name="edit_tag"]').val(cVal);
            $('#exerciseTagsModal').find('span.tag-edit').text("Изменить");
        } else {
            $('#exerciseTagsModal').find('input[name="edit_tag"]').val('');
            $('#exerciseTagsModal').find('span.tag-edit').text("Добавить");
        }
    });


    $('#exerciseCard').on('click', '.toggle-additional-characteristics-block', (e) => {
        $('#exerciseCard').find('tr[data-id="additional_characteristics_data_block"]').toggleClass('d-none');
    });
    $('#exerciseCard').on('click', '.toggle-card-block', (e) => {
        $('#exerciseCard').find('tr[data-id="card_block"]').toggleClass('d-none');
    });
    $('#exerciseCard').on('click', '.toggle-categories-block', (e) => {
        $('#exerciseCard').find('tr[data-id="categories_block"]').toggleClass('d-none');
    });
    $('#exerciseCard').on('click', '.toggle-ball-gates-block', (e) => {
        $('#exerciseCard').find('tr[data-id="ball_gates_block"]').toggleClass('d-none');
    });
    $('#exerciseCard').on('click', '.toggle-additional-information-block', (e) => {
        $('#exerciseCard').find('tr[data-id="additional_information_block"]').toggleClass('d-none');
    });
    $('#exerciseCard').on('click', '.toggle-keywords-block', (e) => {
        $('#exerciseCard').find('tr[data-id="keywords_block"]').toggleClass('d-none');
    });

    LoadExercisesTagsAll();
    $('#card_tags').on('click', '.nav-link', (e) => {
        let cId = $(e.currentTarget).attr('data-id');
        $('#card_tags').find('a.nav-link').removeClass('active');
        $('#card_tags').find('.tags-container').addClass('d-none');
        $(e.currentTarget).addClass('active');
        $('#card_tags').find(`.tags-container[data-id="${cId}"]`).removeClass('d-none');
    });
    $('#card_tags').on('click', 'li.tag-elem', (e) => {
        $(e.currentTarget).toggleClass('active');
        window.changedData = true;
    });

    $('#exerciseCard').on('click', 'button.description-button', (e) => {
        let cId = $(e.currentTarget).attr('data-id');
        $('#exerciseCard').find('button.description-button').removeClass('active');
        $(e.currentTarget).addClass('active');
        $('#exerciseCard').find('tr.description-panel').addClass('d-none');
        $('#exerciseCard').find(`tr.description-panel[data-id="${cId}"]`).removeClass('d-none');
    });

    $('.exs-edit-block-in-card').on('click', '.btn-o-modal', (e) => {
        let cId = $(e.currentTarget).attr('data-id');
        $('.exs-edit-block-in-card').find('.btn-o-modal').removeClass('active');
        $(e.currentTarget).addClass('active');
        AdaptPageToSection(cId, true, true);
    });

    $('#exerciseCard').find('.keywords-blocks-toggle > button').first().addClass('active');
    let tmpKeywordKey = $('#exerciseCard').find('.keywords-blocks-toggle > button').first().attr('data-id');
    $('#exerciseCard').find(`.keywords-list > li[data-key="${tmpKeywordKey}"]`).removeClass('d-none');
    $('#exerciseCard').on('click', '.keywords-blocks-toggle > button', (e) => {
        let cId = $(e.currentTarget).attr('data-id');
        $('#exerciseCard').find('.keywords-list > li').addClass('d-none');
        $('#exerciseCard').find(`.keywords-list > li[data-key="${cId}"]`).removeClass('d-none');
        $('#exerciseCard').find('.keywords-blocks-toggle > button').removeClass('active');
        $(e.currentTarget).addClass('active');
    });
    $('#exerciseCard').on('click', '.keywords-list > li', (e) => {
        let isActive = $(e.currentTarget).hasClass('active');
        let activeKeywordsAmount = $('#exerciseCard').find('.keywords-list > li.active').length;
        if ($('#editExs').attr('data-active') == '1') {
            if (!isActive && activeKeywordsAmount < 2) {
                $(e.currentTarget).addClass('active');
            } else if (isActive) {
                $(e.currentTarget).removeClass('active');
            }
        }
    });

    $('#exerciseCard').on('click', '.categories-list > button', (e) => {
        if ($('#editExs').attr('data-active') == '1') {
            $(e.currentTarget).toggleClass('active');
        }
    });

    $('#exerciseCard').on('click', '.fields-list > button', (e) => {
        let isActive = $(e.currentTarget).hasClass('active');
        if ($('#editExs').attr('data-active') == '1') {
            $('#exerciseCard').find('.fields-list > button').removeClass('active');
            $(e.currentTarget).toggleClass('active', !isActive);
        }
    });

    $('#exerciseCard').on('click', '.ball-gates-list > button', (e) => {
        if ($('#editExs').attr('data-active') == '1') {
            let cId = $(e.currentTarget).attr('data-id');
            let isActive = $(e.currentTarget).hasClass('active');
            if (cId == "ball") {
                let short = `${!isActive}`;
                let val = $('#exerciseCard').find('.exs_edit_field[name="ref_ball"]').find(`option[data-short="${short}"]`).attr('value');
                $('#exerciseCard').find('.exs_edit_field[name="ref_ball"]').val(val);
                $(e.currentTarget).toggleClass('active');
            } else if (cId == "gate") {
                let val = !isActive ? $(e.currentTarget).attr('data-val') : "";
                $('#exerciseCard').find('.exs_edit_field[name="field_goal"]').val(val);
                $('#exerciseCard').find('.ball-gates-list > button[data-id="gate"]').removeClass('active');
                $(e.currentTarget).toggleClass('active', !isActive);
            }
        }
    });

    $('#exerciseCard').on('click', '.exs-types-list > button', (e) => {
        let isActive = $(e.currentTarget).hasClass('active');
        if ($('#editExs').attr('data-active') == '1') {
            $('#exerciseCard').find('.exs-types-list > button').removeClass('active');
            $(e.currentTarget).toggleClass('active', !isActive);
        }
    });

    $('#exerciseCard').on('click', '.physical-qualities-list > button', (e) => {
        let isActive = $(e.currentTarget).hasClass('active');
        if ($('#editExs').attr('data-active') == '1') {
            $(e.currentTarget).toggleClass('active', !isActive);
        }
    });

    $('#exerciseCard').on('click', '.cognitive-load-list > button', (e) => {
        let isActive = $(e.currentTarget).hasClass('active');
        if ($('#editExs').attr('data-active') == '1') {
            $('#exerciseCard').find('.cognitive-load-list > button').removeClass('active');
            $(e.currentTarget).toggleClass('active', !isActive);
        }
    });

});
