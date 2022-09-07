function CountExsInFolder() {
    window.filterIsLoaded = false;
    window.count_exs_calls = [];
    let folders = $('.folders_list').find('.list-group-item > div');
    for (let i = 0; i < folders.length; i++) {
        let folder = $(folders[i]);
        if ($(folder).attr('data-root') != '1') {
            $(folder).find('.folder-exs-counter').html('<div class="lds-ring"><div></div><div></div><div></div><div></div></div>');
            let data = {'count_exs': 1, 'folder': $(folder).attr('data-id'), 'type': "team_folders", 'filter': window.exercisesFilter};
            window.count_exs_calls.push(
                $.ajax({
                    headers:{"X-CSRFToken": csrftoken},
                    data: data,
                    type: 'POST', // GET или POST
                    dataType: 'json',
                    url: "exercises_api",
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
                })
            );
        }
    }
    folders = $('.folders_nfb_list').find('.list-group-item > div');
    for (let i = 0; i < folders.length; i++) {
        let folder = $(folders[i]);
        if ($(folder).attr('data-root') != '1') {
            $(folder).find('.folder-exs-counter').html('<div class="lds-ring"><div></div><div></div><div></div><div></div></div>');
            let data = {'count_exs': 1, 'folder': $(folder).attr('data-id'), 'type': "nfb_folders", 'filter': window.exercisesFilter};
            window.count_exs_calls.push(
                $.ajax({
                    headers:{"X-CSRFToken": csrftoken},
                    data: data,
                    type: 'POST', // GET или POST
                    dataType: 'json',
                    url: "exercises_api",
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
                    complete: function (res) {}
                })
            );
        }
    }
    $.when.apply($, window.count_exs_calls).then(() => {
        window.filterIsLoaded = true;
        CountFilteredExs();
    });
}

function CountFilteredExs() {
    let res = 0;
    $('.folders-block').find('.folders_div:not(.d-none)').find('[data-root="0"]').find('.folder-exs-counter').each((ind, elem) =>{
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
                $(`.side-filter-elem.active[data-type="${key}"]`).find('.row > div:nth-child(2)').html(`( ${res} )`);
            } else {
                $(`.side-filter-elem.active[data-type="${key}"]`).find('.row > div:nth-child(2)').html(`<div class="lds-ring"><div></div><div></div><div></div><div></div></div>`);
            }
        }
    }
}


$(function() {
    
});
