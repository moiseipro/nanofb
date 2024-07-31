$(window).on('load', function (){
    let data = {'all_team_folders': 1};
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: data,
        type: 'GET', // GET или POST
        dataType: 'json',
        url: "/exercises/folders_api",
        success: function (res) {
            if (res.success) {
                console.log(res.data)
                let cur_folder_data = null
                for (const res_value of res.data) {
                    if (res_value.team.id == $('#select-team').val()) {
                        cur_folder_data = res_value.folders
                    }
                }
                console.log(cur_folder_data)
                if (cur_folder_data != null) {
                    let html_data = ''
                    let col=0

                    html_data += `<tr class="rescalendar-blocks-cells">`
                    for (const folder of cur_folder_data) {
                        for (const subfolder of folder.subfolders) {
                            if (col == 0) {
                                html_data += `<td class="block-filter-clear border border-dark" width="100px"><i class="fa fa-repeat" aria-hidden="true"></i></td>`
                            }
                            html_data += `<td width="100px" class="block_cell border border-dark" data-id="${subfolder.id}" data-num="${col + 1}" data-name="${subfolder.name}" data-short="${subfolder.short_name}"">`
                            html_data += `${subfolder.short_name}`
                            html_data += `</td>`
                            col++;
                        }
                    }
                    html_data += `</tr>`
                    console.log(html_data)
                    $('#blocks-folder-row table tbody').html(html_data)
                    $('#blocks-folder-row').removeClass('d-none')
                }
            } else {
                console.log("Error")
            }

        },
        error: function (res) {
            console.log(res);
        },
        complete: function (res) {
            console.log(res)

        }
    });
})