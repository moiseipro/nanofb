function CountExsAjaxReq(data, folder) {
    $(folder).find('.folder-exs-counter').html('<div class="lds-ring"><div></div><div></div><div></div><div></div></div>');
    return $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: data,
        type: 'POST', // GET или POST
        dataType: 'json',
        url: "/exercises/exercises_api",
        timeout: 60000,
        success: function (res) {
            if (res.success && res.data != 0) {
                $(folder).find('.folder-exs-counter').html(res.data);
            } else {
                $(folder).find('.folder-exs-counter').html('...');
            }
        },
        error: function (res) {
            $(folder).find('.folder-exs-counter').html('...');
        },
        complete: function (res) {
        }
    });
}

function CountExsInTagsFilterAjaxReq(data, tagElem) {
    $(tagElem).find('.row > div:nth-child(2)').html('<div class="lds-ring"><div></div><div></div><div></div><div></div></div>');
    return $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: data,
        type: 'POST', // GET или POST
        dataType: 'json',
        url: "/exercises/exercises_api",
        timeout: 60000,
        success: function (res) {
            if (res.success && res.data != 0) {
                $(tagElem).find('.row > div:nth-child(2)').html(res.data);
            } else {
                $(tagElem).find('.row > div:nth-child(2)').html('...');
            }
        },
        error: function (res) {
            $(tagElem).find('.row > div:nth-child(2)').html('...');
        },
        complete: function (res) {}
    });
}

function RestartCountExsInFolders(data) {
    window.count_exs_calls = [];
    for (let i = 0; i < data.length; i++) {
        let elem = data[i];
        window.count_exs_calls.push({
            'data': elem.data,
            'folderElem': elem.folderElem,
            'call': CountExsAjaxReq(elem.data, elem.folderElem)
        });
    } 
}

function CountExsInFolder(useFilter = true, skipFolders = false) {
    window.filterIsLoaded = false;
    window.count_exs_calls = [];
    if (!skipFolders) {
        let folders = $('.folders_list').find('.list-group-item > div');
        for (let i = 0; i < folders.length; i++) {
            let folder = $(folders[i]);
            if ($(folder).attr('data-root') != '1') {
                let data = {'count_exs': 1, 'folder': $(folder).attr('data-id'), 'type': "team_folders", 'filter': window.exercisesFilter};
                window.count_exs_calls.push({
                    'data': data,
                    'folderElem': folder,
                    'call': CountExsAjaxReq(data, folder)
                });
            }
        }
        folders = $('.folders_club_list').find('.list-group-item > div');
        for (let i = 0; i < folders.length; i++) {
            let folder = $(folders[i]);
            if ($(folder).attr('data-root') != '1') {
                let data = {'count_exs': 1, 'folder': $(folder).attr('data-id'), 'type': "club_folders", 'filter': window.exercisesFilter};
                window.count_exs_calls.push({
                    'data': data,
                    'folderElem': folder,
                    'call': CountExsAjaxReq(data, folder)
                });
            }
        }
        folders = $('.folders_nfb_list').find('.list-group-item > div');
        for (let i = 0; i < folders.length; i++) {
            let folder = $(folders[i]);
            if ($(folder).attr('data-root') != '1') {
                let data = {'count_exs': 1, 'folder': $(folder).attr('data-id'), 'type': "nfb_folders", 'filter': window.exercisesFilter};
                window.count_exs_calls.push({
                    'data': data,
                    'folderElem': folder,
                    'call': CountExsAjaxReq(data, folder)
                });
            }
        }
    }
    let tagsElems = $('.tags-filter-block').find('.side-filter-elem[data-type="tags"]');
    let folderType = $('.folders_div.selected').attr('data-id');
    let folderId = $('.folders_div.selected').find('.list-group-item.active > div').attr('data-id');
    let exerciseId = $('.exercises-list').find('.exs-elem.active').attr('data-id');
    for (let i = 0; i < tagsElems.length; i++) {
        let tagElem = $(tagsElems[i]);
        let data = {
            'count_exs_in_tags_filter': 1, 'tag': $(tagElem).attr('data-id'), 
            'type': folderType, 'folder': folderId, 'exercise': exerciseId,
            'filter': window.exercisesFilter
        };
        window.count_exs_calls.push({
            'data': data,
            'folderElem': tagElem,
            'call': CountExsInTagsFilterAjaxReq(data, tagElem)
        });
    }
    let callsList = window.count_exs_calls.map(obj => obj.call);
    if (useFilter) {
        $.when.apply($, callsList).then(() => {
            window.filterIsLoaded = true;
            CountFilteredExs();
        });
    }
    $.when.apply($, callsList).then(() => {
        CountExsInFoldersByType();
    });
}

function CountFilteredExs() {
    let res = 0;
    $('.folders-block').find('.folders_div.selected').find('[data-root="0"]').find('.folder-exs-counter').each((ind, elem) =>{
        let tVal = 0;
        try {
            tVal = parseInt($(elem).text());
            if (isNaN(tVal)) {tVal = 0;}
        } catch(e) {}
        res += tVal;
    });
    if (window.exercisesFilter.constructor == Object) {
        for (key in window.exercisesFilter) {
            if (window.filterIsLoaded) {
                $(`.side-filter-elem.active[data-type="${key}"]`).find('.row.count-update > div:nth-child(2)').html(`( ${res} )`);
            } else {
                $(`.side-filter-elem.active[data-type="${key}"]`).find('.row.count-update > div:nth-child(2)').html(`<div class="lds-ring"><div></div><div></div><div></div><div></div></div>`);
            }
        }
    }
}

function CountExsInFoldersByType() {
    let res = 0;
    $('.folders-block').find('.folders_div.selected').find('[data-root="0"]').find('.folder-exs-counter').each((ind, elem) =>{
        let tVal = 0;
        try {
            tVal = parseInt($(elem).text());
            if (isNaN(tVal)) {tVal = 0;}
        } catch(e) {}
        res += tVal;
    });
    $('.exs_counter').html(res > 0 ? `(${res})` : "(...)");
}



$(function() {
    $(window).on('beforeunload', (e) => {
        for (let i in window.count_exs_calls) {
            let call = window.count_exs_calls[i]['call'];
            call.abort();
        }
        return;
    });
});

