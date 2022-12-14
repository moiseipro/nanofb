$(window).on('load', function (){

})

function show_training_card(id = ''){
    if (id == '' || id == null) console.log('id is empty')
    let data_send = {}
    ajax_training_action('GET', data_send, 'view card', id).then(function (data) {
        console.log(data)
        $('#view-training-card-modal').modal('show')
    })
}

$('#view-training-card-modal').on('show.bs.modal', function (e) {

})