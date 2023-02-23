
function generateNewCalendar(){
    newMicrocycle = []
    newEvent = []

    let send_data ={}

    let from_date_str = $('#event_calendar .microcycle_cell.selected').attr('data-start')
    let to_date_str = $('#event_calendar .microcycle_cell.selected').attr('data-end')
    let microcycle_id = $('#event_calendar .microcycle_cell.selected').attr('data-id') ? $('#event_calendar .microcycle_cell.selected').attr('data-id'): ''
    let today = strDate
    let favourites = parseInt($('#favourites-event-filter').attr('data-filter') ? $('#favourites-event-filter').attr('data-filter') : '0')
    let load_type = $('#load-event-filter').val() ? $('#load-event-filter').val() : ''
    let keywords = $('#keywords-event-filter').val() ? $('#keywords-event-filter').val().val() : ''
    let field_size = $('#field_size-event-filter').val() ? $('#field_size-event-filter').val() : ''


    //(strDate)
    console.log(favourites)

    let from_date = undefined
    let to_date = undefined

    if(from_date_str){
        from_date = moment(from_date_str, 'DD/MM/YYYY').format('YYYY-MM-DD')
    }
    if(to_date_str){
        to_date = moment(to_date_str, 'DD/MM/YYYY').format('YYYY-MM-DD')
    }

    if(!from_date_str && !to_date_str && today){
        from_date = moment(today, 'DD/MM/YYYY').startOf('month').format('YYYY-MM-DD')
        to_date = moment(today, 'DD/MM/YYYY').endOf('month').format('YYYY-MM-DD')
    }

    send_data['microcycle_id'] = microcycle_id

    send_data['from_date'] = from_date
    send_data['to_date'] = to_date
    send_data['favourites'] = favourites
    send_data['load_type'] = load_type
    send_data['keywords'] = keywords
    send_data['field_size'] = field_size

    console.log(send_data)

    $('.page-loader-wrapper').fadeIn();
    generate_table(send_data, true, true, 'lite')
}

function generateOnlyTable() {
    newMicrocycle = []

    let send_data ={}

    let from_date_str = $('#select-season option:selected').attr('data-with')
    let to_date_str = $('#select-season option:selected').attr('data-by')
    let today = strDate
    let favourites = parseInt($('#favourites-event-filter').attr('data-filter') ? $('#favourites-event-filter').attr('data-filter') : '0')
    let load_type = $('#load-event-filter').val() ? $('#load-event-filter').val() : ''
    let keywords = $('#keywords-event-filter').val() ? $('#keywords-event-filter').val().val() : ''
    let field_size = $('#field_size-event-filter').val() ? $('#field_size-event-filter').val() : ''

    let from_date = undefined
    let to_date = undefined

    if(from_date_str){
        from_date = moment(from_date_str, 'DD/MM/YYYY').format('YYYY-MM-DD')
    }
    if(to_date_str){
        to_date = moment(to_date_str, 'DD/MM/YYYY').format('YYYY-MM-DD')
    }

    send_data['from_date'] = from_date
    send_data['to_date'] = to_date
    send_data['favourites'] = favourites
    send_data['load_type'] = load_type
    send_data['keywords'] = keywords
    send_data['field_size'] = field_size
    //console.log(send_data)

    $('.page-loader-wrapper').fadeIn();
    generate_table(send_data, false, true, 'lite')
}