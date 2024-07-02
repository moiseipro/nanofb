function generate_microcycle_table(send_data = {}, url = ''){
    newMicrocycle = []

    $.ajax({
        headers:{"X-CSRFToken": csrftoken },
        url: '/events/'+url+'api/microcycles/',
        type: 'GET',
        dataType: "JSON",
        success: function(data){
            if (baseMicrocycle.length > 0){
                newMicrocycle = baseMicrocycle
            } else {
                microcycle_arr = data['results']
                for (var microcycle of microcycle_arr) {
                    let date_with = moment(microcycle['date_with'], 'DD/MM/YYYY')
                    let date_by = moment(microcycle['date_by'], 'DD/MM/YYYY')
                    let days = date_by.diff(date_with, 'days')+1
                    newMicrocycle.push({
                        id: microcycle['id'],
                        name: microcycle['name'],
                        block: microcycle['block'],
                        goal: microcycle['goal'],
                        startDate: microcycle['date_with'],
                        endDate: microcycle['date_by'],
                        days: days,
                        customClass: 'green_cell',
                        href: '#empty'
                    })
                }
            }
            console.log(newMicrocycle)
            let html_data = ''
            let max_col=30, max_row=2, max_col_row=12
            let col=0, row=0, col_row=0
            newMicrocycle.forEach(function(microcycle, i) {
                if (col%max_col==0){
                    html_data += `<tr class="rescalendar_microcycles_cells">`
                }
                html_data += `<td class="microcycle_cell green_cell border border-dark" data-id="${microcycle.id}" data-name="${microcycle.name}" data-days="${microcycle.days}" data-start="${microcycle.startDate}" data-end="${microcycle.endDate}">`
                html_data += `${i}`
                html_data += `</td>`
                col++;
                if (col%max_col==0){
                    html_data += `</tr>`
                }

            })
            console.log(html_data)
            $('#microcycle-row table tbody').html(html_data)
        }
    })
}