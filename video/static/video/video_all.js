let video_table;
$(window).on('load', function (){
    video_table = $('.datatable').DataTable()
    console.log(video_table)
})

$('.video-source').on('click', function (){
    let data_source = $( this ).attr(`data-source`)
    console.log(data_source)
    video_table.column(0).search(data_source).draw()
})