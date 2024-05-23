var baseMicrocycle = []

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
            //console.log(newMicrocycle)
            $.ajax({
                headers:{"X-CSRFToken": csrftoken },
                url: '/events/'+url+'api/action/',
                type: 'GET',
                dataType: "JSON",
                data: send_data,
                success: function(data){
                    console.log(data)
                    let events_data = data;
                    let num_tr = 1, num_m = 1, count_tr = 0, count_m = 0, max_m = 0, event_date = '', event_time = '', event_class=''
                    let last_date = moment(send_data['to_date'], 'YYYY-MM-DD')
                    let first_date = moment(send_data['from_date'], 'YYYY-MM-DD')
                    let generated_events = []

                    let days = last_date.diff(first_date, 'days')+1
                    //console.log(days)
                    if(days!=0) {
                        for (let i = 0; i < days; i++){
                            let isSame = false
                            //console.log(last_date.format('DD/MM/YYYY'))
                            for (let event of events_data) {
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
                    let skip_row = 0
                    $.each(generated_events, function( index, event ) {
                        if(skip_row != 0){
                            skip_row -= 1;
                            return true;
                        }
                        let event_id = [],
                            event_name = '',
                            event_short_name = event['short_name']
                        let tr_html = ``
                        let td_html = ``

                        let only_date = moment(event['only_date'], 'DD/MM/YYYY')
                        let count_day = 0
                        let microcycle_days = 0
                        let microcycle_name = ""
                        let training_block = []
                        let training_load = []
                        let microcycle_goal = ""
                        let objectives = []
                        let hasVideo = false
                        let isCurrentDate = false
                        let isFilled = true

                        if(moment().startOf('day').isSame(only_date)) isCurrentDate = true
                        newMicrocycle.forEach(function(microcycle, i) {
                            let date_with = moment(microcycle['startDate'], 'DD/MM/YYYY')
                            let date_by = moment(microcycle['endDate'], 'DD/MM/YYYY')
                            if(only_date.isBetween( date_with, date_by, undefined, '[]')){
                                microcycle_name = microcycle.name
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
                            // console.log(event.training)
                            let count_player = ''
                            let count_goalkeeper = ''
                            let count_minutes = ''
                            let merged_loads = ''
                            //console.log(event.training)
                            if(event_class === 'trainingClass' && event['only_date'] === event_date) {
                                num_tr++
                            }
                            if(('exercises_info' in event.training && event.training.exercises_info.length == 0) || ('protocol_info' in event.training && event.training.protocol_info.length == 0)) isFilled = false

                            hasVideo = event.training.video_href != '' && event.training.video_href != null
                            for (const block of event.training.blocks){
                                training_block.push(block.block.id)
                            }
                            if (event.training.load){
                                training_load.push(event.training.load)
                            }

                            event_name = 'tr'+num_tr
                            event_class = 'trainingClass'
                            count_tr++

                            let merged_btn = ''
                            let merged_events = []
                            for (let i = index; i < generated_events.length; i++){
                                if (generated_events[i]['time'] === event['time'] && generated_events[i]['date'] === event['date'] && 'training' in generated_events[i] && generated_events[i]['training'] != null){
                                    if (i != index) skip_row++;
                                    merged_events.push(generated_events[i])

                                } else {
                                    break;
                                }
                            }
                            console.log(merged_events)
                            let all_players = 0, all_goalkeeper = 0, all_minutes = 0;
                            let all_load = ''
                            $.each(merged_events, function( index, merged_event ) {
                                event_id.push(merged_event['id'])

                                let load = merged_event.training.load_info ? merged_event.training.load_info.short_name : '---'
                                if (all_load != ''){
                                    all_load += ' | '+load
                                } else {
                                    all_load += load;
                                }


                                merged_btn += `
                                <div class="col px-1">
                                    <button href="/trainings/view/${merged_event['id']}" class="btn btn-sm btn-block ${merged_events.length > 1 ? 'btn-info' : 'btn-info'} py-0 event-select" data-id="${merged_event['id']}">${merged_events.length > 1 ? gettext('Gr.')+' '+(index+1) : gettext('T.') +' '+(num_tr == 2 ? '2' : '')}</button>
                                </div>
                                `
                                for (const objective of merged_event.training.objectives) {
                                    objectives.push(objective.objective.id)
                                }

                                let duration = 0
                                if('exercises_info' in merged_event.training && merged_event.training.exercises_info.length > 0){
                                    $.each(merged_event.training.exercises_info, function( index, value ) {
                                        duration += value.duration;
                                        all_minutes += value.duration;
                                    })
                                }

                                let player = 0, goalkeeper = 0;
                                if('protocol_info' in merged_event.training && merged_event.training.protocol_info.length > 0){
                                    $.each(merged_event.training.protocol_info, function( index, value ) {
                                        if(value.status==null) {
                                            player++;
                                            all_players++;
                                            if(value.player_info.card != null && value.player_info.card.is_goalkeeper){
                                                goalkeeper++;
                                                all_goalkeeper++;
                                            }
                                        }
                                    });
                                } else {
                                    if(merged_event.training.players_count != null && Object.keys(merged_event.training.players_count).length>0){
                                        //console.log(event.training.players_count[0])
                                        player = merged_event.training.players_count[0]
                                        all_players += merged_event.training.players_count[0]
                                    }
                                    if(merged_event.training.goalkeepers_count != null && Object.keys(merged_event.training.goalkeepers_count).length>0){
                                        goalkeeper = merged_event.training.goalkeepers_count[0]
                                        all_goalkeeper += merged_event.training.goalkeepers_count[0]
                                    }
                                }
                                merged_loads+=`
                                    <div class="col px-0 d-none event-row-info" data-id="${merged_event.training.event_id}">
                                        ${load ? load : '---'}
                                    </div>
                                `
                                count_minutes+=`
                                    <div class="col px-0 d-none event-row-info" data-id="${merged_event.training.event_id}">
                                        ${duration ? duration+'`' : '---'}
                                    </div>
                                `
                                count_player+=`
                                    <div class="col px-0 d-none event-row-info" data-id="${merged_event.training.event_id}">
                                        ${player ? player : '---'}
                                    </div>
                                `
                                count_goalkeeper+=`
                                    <div class="col px-0 d-none event-row-info" data-id="${merged_event.training.event_id}">
                                        ${goalkeeper ? goalkeeper : '---'}
                                    </div>
                                `
                            })

                            merged_loads+=`
                                <div class="col px-0 event-row-info" data-id="">
                                    ${all_load ? all_load : '---'}
                                </div>
                            `
                            count_minutes+=`
                                <div class="col px-0 event-row-info" data-id="">
                                    ${all_minutes ? all_minutes+'`' : '---'}
                                </div>
                            `
                            count_player+=`
                                <div class="col px-0 event-row-info" data-id="">
                                    ${all_players ? all_players : '---'}
                                </div>
                            `
                            count_goalkeeper+=`
                                <div class="col px-0 event-row-info" data-id="">
                                    ${all_goalkeeper ? all_goalkeeper : '---'}
                                </div>
                            `

                            //<td>${count_day==0 ? '---' : count_day}</td>
                            td_html += `
                            
                            <td width="15%" class="${!isFilled ? 'text-danger' : ''}">${event['only_date']}</td>
                            <td>
                                <div class="row mx-0 merged-event">
                                    ${merged_btn}
                                </div>
                            </td>
                            <td>
                                <div class="row mx-0">
                                    ${count_player}
                                </div>
                            </td>
                            <td>
                                <div class="row mx-0">
                                    ${count_goalkeeper}
                                </div>
                            </td>
                            <td>
                                <div class="row mx-0">
                                    ${count_minutes}
                                </div>
                            </td>
                            <td>
                                <div class="row mx-0">
                                    ${merged_loads ? merged_loads : '---'}
                                </div>
                            </td>
                            <td class="${parseInt($('#favourites-event-filter').attr('data-filter')) > 0 ? '' : 'd-none'} favorites-col"><i class="switch-favorites fa ${event.training.favourites == 1 ? 'fa-star text-success' : (event.training.favourites == 2 ? 'fa-star text-warning' : (event.training.favourites == 3 ? 'fa-star text-danger' : 'fa-star-o'))}" data-switch="${event.training.favourites}"></i></td>
                            `

                        } else if('match' in event && event['match'] != null){
                            event_name = 'm'+(event['match']['m_type']+1)
                            event_class = 'matchClass matchClass'+event['match']['m_type']
                            count_m--
                            count_tr = 0

                            event_id.push(event['id'])

                            //<td>${count_day==0 ? '---' : count_day}</td>
                            td_html += `
                                
                                <td>${event['only_date']}</td>
                                <td class="px-1"><button href="${isLite ? '' : '/matches/match?id='+event.match.event_id}" data-count="${count_m+1}" class="btn btn-sm btn-block ${event.match.m_type == 0 ?"btn-warning":"btn-success"} py-0 event-select" data-id="${event.match.event_id}">${gettext('Match')}</button></td>
                                <td colspan="5">${event.match.opponent ? event.match.opponent : '---'}</td>
                            `
                        } else {
                            event_class = 'none'
                            //<td>${count_day==0 ? '---' : count_day}</td>
                            td_html += `
                                    
                                    <td>${event['only_date']}</td>
                                    <td colspan="6">---</td>
                                ` //<a href="#" class="btn btn-sm btn-block btn-secondary py-0 disabled">${/*gettext('Recreation')*/'---'}</a>
                        }
                        console.log(event['only_date']+"   "+moment(event['only_date'], 'DD/MM/YYYY').endOf('month').format('DD/MM/YYYY'))

                        tr_html += `<tr id="${event['only_date']==moment().format('DD/MM/YYYY') ? 'current_day' : ''}" class="${event_id.length>0 ? 'hasEvent' : ''} ${event_class} ${event['only_date']==moment(event['only_date'], 'DD/MM/YYYY').endOf('month').format('DD/MM/YYYY') ? "month_top_border" : ''}" data-value="${event_id}" data-microcycle-days="${microcycle_days}" data-microcycle-day="${count_day}" data-unfilled="${!isFilled ? '1' : '0'}" data-video="${hasVideo ? '1' : '0'}" data-name="${microcycle_name}" data-block="${training_block}" data-goal="${microcycle_goal}" data-load="${training_load}" data-objective_1="${objectives}" style="${isCurrentDate ? 'border-top: 2px solid #dc3545!important' : ''}">`
                        tr_html += td_html
                        tr_html += `</tr>`


                        event_date = event['only_date']
                        event_time = event['time']
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
                        if($('#events .hasEvent .event-select[data-id="'+Cookies.get('event_id')+'"]').length){
                            $('#events .hasEvent .event-select[data-id="'+Cookies.get('event_id')+'"]').click()
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
    let css_2 = "calc(93vh - "+Math.round($('#calendar-row').height())+"px - "+Math.round($('.header').height())+"px - "+Math.round($('.card-header').height())+"px)"
    //console.log(css)
    $('#events-table').css({"max-height": css})
    $('#events-table').css({"height": css})
    $('#block-event-info .event-info').css({"max-height": css_2})
    $('#block-event-info .event-info').css({"height": css_2})
}