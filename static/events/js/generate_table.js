
function generate_table(send_data = {}, calendar = false, isLite = false, url = ''){
    newMicrocycle = []
    newEvent = []

    $('.page-loader-wrapper').fadeIn();
    if(url) url+="/"
    $.ajax({
        headers:{"X-CSRFToken": csrftoken },
        url: '/events/'+url+'api/microcycles/',
        type: 'GET',
        dataType: "JSON",
        success: function(data){
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
            //console.log(newMicrocycle)
            $.ajax({
                headers:{"X-CSRFToken": csrftoken },
                url: '/events/'+url+'api/action/',
                type: 'GET',
                dataType: "JSON",
                data: send_data,
                success: function(data){
                    console.log(data['results'])
                    let num_tr = 1, num_m = 1, count_tr = 0, count_m = 0, max_m = 0, event_date = '', event_class=''
                    let last_date = moment(send_data['to_date'], 'YYYY-MM-DD')
                    let first_date = moment(send_data['from_date'], 'YYYY-MM-DD')
                    let generated_events = []

                    let days = last_date.diff(first_date, 'days')+1
                    //console.log(days)
                    if(days!=0) {
                        for (let i = 0; i < days; i++){
                            let isSame = false
                            //console.log(last_date.format('DD/MM/YYYY'))
                            for (let event of data['results']) {
                                let cur_date = moment(event['only_date'], 'DD/MM/YYYY')
                                if(cur_date.isSame(last_date)){
                                    generated_events.push(event)
                                    isSame = true
                                    if(isSame && 'match' in event && event.match != null){
                                        count_m++
                                        max_m++
                                    }
                                }
                            }
                            if(!isSame) {
                                generated_events.push({
                                    id: null,
                                    short_name: '---',
                                    only_date: last_date.format('DD/MM/YYYY'),
                                    training: null,
                                    match: null
                                })
                            }
                            last_date.add(-1, 'days')
                        }
                    }

                    $('#events tbody').html('')
                    $.each(generated_events, function( index, event ) {
                        let event_id = event['id'],
                            event_name = '',
                            event_short_name = event['short_name']
                        let tr_html = ``
                        let td_html = ``

                        let only_date = moment(event['only_date'], 'DD/MM/YYYY')
                        let count_day = 0
                        let microcycle_days = 0
                        let microcycle_name = ""
                        let microcycle_block = ""
                        let microcycle_goal = ""
                        let objectives = {'objective_1': [], 'objective_2': [], 'objective_3': []}
                        let hasVideo = false
                        let isCurrentDate = false
                        let isFilled = true

                        if(moment().startOf('day').isSame(only_date)) isCurrentDate = true
                        newMicrocycle.forEach(function(microcycle, i) {
                            let date_with = moment(microcycle['startDate'], 'DD/MM/YYYY')
                            let date_by = moment(microcycle['endDate'], 'DD/MM/YYYY')
                            if(only_date.isBetween( date_with, date_by, undefined, '[]')){
                                microcycle_name = microcycle.name
                                microcycle_block = microcycle.block
                                microcycle_goal = microcycle.goal
                                microcycle_days = microcycle.days
                                count_day = only_date.diff(date_with, "days")+1
                                if(count_day < 3) count_day = '+'+count_day
                                else{
                                    count_day = only_date.diff(date_by, "days")
                                    if(count_day==0) count_day = '---'
                                }
                            }
                        });

                        if('training' in event && event['training'] != null){
                            num_tr = 1
                            let count_player = 0
                            let count_goalkeeper = 0
                            //console.log(event.training)
                            if(event_class === 'trainingClass' && event['only_date'] === event_date) num_tr++
                            if(('exercises_info' in event.training && event.training.exercises_info.length == 0) || ('protocol_info' in event.training && event.training.protocol_info.length == 0)) isFilled = false
                            if('protocol_info' in event.training && event.training.protocol_info.length > 0){
                                $.each(event.training.protocol_info, function( index, value ) {
                                    if(value.status==null) {
                                        count_player++;
                                        if(value.player_info.card != null && value.player_info.card.is_goalkeeper){
                                            count_goalkeeper++;
                                        }
                                    }
                                });
                            } else {
                                if(event.training.players_count != null && Object.keys(event.training.players_count).length>0){
                                    //console.log(event.training.players_count[0])
                                    count_player = event.training.players_count[0]
                                }
                                if(event.training.goalkeepers_count != null && Object.keys(event.training.goalkeepers_count).length>0){
                                    count_goalkeeper = event.training.goalkeepers_count[0]
                                }

                            }
                            hasVideo = event.training.video_href != '' && event.training.video_href != null
                            for (const objective of event.training.objectives) {
                                objectives['objective_'+(objective.type+1)].push(objective.objective.id)
                            }

                            event_name = 'tr'+num_tr
                            event_class = 'trainingClass'
                            count_tr++
                            console.log(event.training)
                            td_html += `
                                <td>${count_day==0 ? '---' : count_day}</td>
                                <td class="${!isFilled ? 'text-danger' : ''}">${event['only_date']}</td>
                                <td><a href="/trainings${isLite ? '/lite' : ''}/view/${event.training.event_id}" class="btn btn-sm btn-block btn-info py-0" data-id="${event.training.event_id}">${gettext('Training')+' '+(num_tr == 2 ? '2' : '')}</a></td>
                                <td><i class="switch-favorites fa ${event.training.favourites == 1 ? 'fa-star text-success' : (event.training.favourites == 2 ? 'fa-star text-warning' : (event.training.favourites == 3 ? 'fa-star text-danger' : 'fa-star-o'))}" data-switch="${event.training.favourites}"></i></td>
                                <td>${count_player}</td>
                                <td>${count_goalkeeper}</td>
                            `
                        } else if('match' in event && event['match'] != null){
                            event_name = 'm'+(event['match']['m_type']+1)
                            event_class = 'matchClass'+event['match']['m_type']
                            count_m--
                            count_tr = 0

                            td_html += `
                                <td>${count_day==0 ? '---' : count_day}</td>
                                <td>${event['only_date']}</td>
                                <td><a href="${isLite ? '' : '/matches/match?id='+event.match.event_id}" data-count="${count_m+1}" class="btn btn-sm btn-block ${event.match.m_type == 0 ?"btn-warning":"btn-success"} py-0" data-id="${event.match.event_id}">${gettext('Match')}</a></td>
                                <td>---</td>
                                <td>---</td>
                                <td>---</td>
                            `
                        } else {
                            event_class = 'none'
                            td_html += `
                                    <td>${count_day==0 ? '---' : count_day}</td>
                                    <td>${event['only_date']}</td>
                                    <td>${count_tr == 0 && count_m==max_m ? '---' : '---'}</td>
                                    <td>---</td>
                                    <td>---</td>
                                    <td>---</td>
                                ` //<a href="#" class="btn btn-sm btn-block btn-secondary py-0 disabled">${/*gettext('Recreation')*/'---'}</a>
                        }
                        console.log(event['only_date']+"   "+moment(event['only_date'], 'DD/MM/YYYY').endOf('month').format('DD/MM/YYYY'))
                        tr_html += `<tr id="${event['only_date']==moment().format('DD/MM/YYYY') ? 'current_day' : ''}" class="${event_id!=null ? 'hasEvent' : ''} ${event_class} ${event['only_date']==moment(event['only_date'], 'DD/MM/YYYY').endOf('month').format('DD/MM/YYYY') ? "month_top_border" : ''}" data-value="${event_id}" data-microcycle-days="${microcycle_days}" data-microcycle-day="${count_day}" data-unfilled="${!isFilled ? '1' : '0'}" data-video="${hasVideo ? '1' : '0'}" data-name="${microcycle_name}" data-block="${microcycle_block}" data-goal="${microcycle_goal}" data-objective_1="${objectives.objective_1}" data-objective_2="${objectives.objective_2}" data-objective_3="${objectives.objective_3}" style="${isCurrentDate ? 'border-top: 2px solid #dc3545!important' : ''}">`
                        tr_html += td_html
                        tr_html += `</tr>`
                        event_date = event['only_date']
                        newEvent.push({
                            id: event_id,
                            name: event_name,
                            startDate: event_date,
                            endDate: event_date,
                            customClass: event_class,
                            customValue: event_id,
                            title: 'TEST',
                            href: '#',
                            text: event_short_name
                        })
                        $('#events tbody').append(tr_html)
                    })
                },
                error: function(jqXHR, textStatus){
                    //console.log(jqXHR)
                    swal(gettext('Event save'), gettext('Error when action the event!'), "error");
                },
                complete: function () {
                    $('.page-loader-wrapper').fadeOut();

                    if(calendar){
                        $('#event_calendar').rescalendar({
                            id: 'training_calendar',
                            format: 'DD/MM/YYYY',
                            jumpSize: middleDay-1,
                            calSize: days,
                            locale: get_cur_lang(),
                            refDate: strDate,
                            lang: {
                                'today': gettext('Today'),
                                'init_error': gettext('Failed to initialize'),
                                'no_data_error' : gettext('No data was found to show')
                            },
                            data: newEvent,
                            microcycles: newMicrocycle,
                            dataKeyField: 'name',
                            dataKeyValues: ['m2', 'm1', 'tr1', 'tr2']
                        });

                        if(send_data['microcycle_id']){
                            $('#event_calendar .microcycle_cell[data-id="'+send_data['microcycle_id']+'"]').addClass('selected')
                        }
                    }


                    local_filters_events()

                    if(Cookies.get('event_id')){
                        if($('#events .hasEvent[data-value="'+Cookies.get('event_id')+'"]').length){
                            $('#events .hasEvent[data-value="'+Cookies.get('event_id')+'"] td:first').click()
                        } else {
                            Cookies.remove('event_id')
                        }
                    }

                    resize_events_table()

                    let current_date = `#current_day`
                    let date_obj = $('#events '+current_date)
                    if(date_obj.length > 0){
                        console.log(date_obj)
                        let offset = $(date_obj).offset().top-500

                        $('#events-table').animate({scrollTop: offset},'slow');
                    }

                }
            })
        },
        error: function(jqXHR, textStatus){
            //console.log(jqXHR)
            swal(gettext('Event save'), gettext('Error when action the event!'), "error");
        },
        complete: function () {
            //$('.page-loader-wrapper').fadeOut();
        }
    })
}

function resize_events_table(){
    let css = "calc(93vh - "+Math.round($('#calendar-row').height())+"px - "+Math.round($('#filters-row').height())+"px - "+Math.round($('.header').height())+"px - "+Math.round($('.card-header').height())+"px)"
    //console.log(css)
    $('#events-table').css({"max-height": css})
    $('#events-table').css({"height": css})
    $('#block-event-info .event-info').css({"max-height": css})
    $('#block-event-info .event-info').css({"height": css})
}