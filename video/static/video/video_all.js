let video_table;
$(window).on('load', function (){
    video_table = $('.datatable').DataTable()
})

$('.video-source').on('click', function (){
    let data_source = $( this ).attr(`data-source`)
    console.log(data_source)
    video_table.column(0).search(data_source).draw()
})

$('.datatable').on('click', 'tbody tr', function() {
    let row_data = video_table.row(this).data()
    console.log('API row values : ', row_data)
    let request = $.ajax({
        url: "api/view/"+row_data.id,
        method: "GET",
        dataType: "JSON"
    })

    request.done(function( data ) {
        console.log(data)
        render_json_block(data)

    })

    request.fail(function( jqXHR, textStatus ) {
        alert( "Request failed: " + textStatus );
        $('#block-video-info').addClass('d-none')
    })
})

function render_json_block(data) {
    $('#block-video-info').removeClass('d-none')

    $('#block-video-info .row div[data-name]').each(function () {
        let in_data = $(this).attr('data-name').split('.')
        let html = '';
        if(in_data[0] in data){
            if(in_data.length>1){
                console.log(data[in_data[0]][in_data[1]])
                html = data[in_data[0]][in_data[1]].toString()
            } else {
                console.log(data[in_data[0]])
                if(typeof data[in_data[0]] === "boolean"){
                    html = data[in_data[0]] ?
                        '<i class="fa fa-check" aria-hidden="true"></i>' :
                        '<i class="fa fa-times" aria-hidden="true"></i>'
                } else {
                    html = data[in_data[0]].toString()
                }
            }
        } else {
            html = '---'
        }
        $(this).html(html)
    })
}