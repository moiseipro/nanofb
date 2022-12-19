$(window).on('load', function (){

})

function show_training_card(id = ''){
    if (id == '' || id == null) console.log('id is empty')
    let data_send = {}
    ajax_training_action('GET', data_send, 'view card', id).then(function (data) {
        console.log(data)
        $('#training-content').removeClass('d-none')
    })
}

function hide_training_card() {
    $('#training-content').addClass('d-none')
}