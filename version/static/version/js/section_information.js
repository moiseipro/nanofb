$(window).on("load", function () {
    $('#section_information-video').on('click', (e) => {
        $('#videoSelectorModal').modal('show');
    });
})


function load_section_information(name = ''){
    let send_data = {}
    send_data.name = name
    console.log(send_data)

    ajax_section_information_action('GET', send_data, 'information', '', 'get_by_name').then(function (data) {
        console.log(data)
        let obj = data['obj']

        if (document.articleEditor){
            document.articleEditor.setData(obj.content)
        }
        if (document.articleViewer){
            document.articleViewer.setData(obj.content)
        }

    })
}