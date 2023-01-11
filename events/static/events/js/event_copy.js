$(window).on('load', function (){

    $('#event-copy-modal-button').on('click', function () {
        let event_id = $('tr.hasEvent.selected').attr('data-value')
        if(!event_id) return;
        $('#form-event-copy-modal').modal('show')
    })

    $('#event-copy-button').on('click', function () {
        let event_id = $('tr.hasEvent.selected').attr('data-value')

        let send_data = {}
        let date = $('#form-event-copy-modal .datepicker-event').val()
        let time = $('#form-event-copy-modal .timepicker').val()
        date = moment(date, 'DD/MM/YYYY').format('YYYY-MM-DD')
        send_data['date'] = date+' '+time
        send_data['team'] = $('#copy-event-team').val()
        console.log(send_data)
        ajax_event_action('POST', send_data, 'copy event', event_id, 'copy_event').then(function( data ) {
            console.log(data)
            location.reload();
        })
    })

})