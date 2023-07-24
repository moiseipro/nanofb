
$(window).on('load', function (){
     render_video_block_page()
})

function render_video_block_page(url) {
    ajax_get_videos_data(url).then(function (data) {
         //console.log(data)
         let video_html = '';
         $('#video-blocks-list .video-list').html('')

         $.each(data.results, function(index, element) {
             //console.log(element)
             let img_url = `https://nanofootball.pro/video/poster/${element['links']['nftv']}`

             video_html += `
                 <div class="col-sm-6 col-md-4 col-lg-3">
                    <div class="card w-100">
                        <div class="card-header p-0" style="height: 200px">
                            <img class="card-img-top" style="width: 100%;height: 100%;object-fit: cover;" src="${img_url}" alt="Poster block image">
                        </div>
                        <div class="card-body p-2" style="height: 120px">
                            <h5 class="card-title">${element['name']}</h5>
                            <p class="card-text">${element['taggit']}</p>
                        </div>
                    </div>
                </div>
             `
         })
         $('#video-blocks-list .video-list').append(video_html)
         $('#video-blocks-list .video-list .card .card-img-top').on('error', function(){
             $(this).attr('src', 'https://main-cdn.sbermegamarket.ru/hlr-system/14/33/42/20/23/73/100026854151b0.jpg')
         });

         //Разделение на страницы
         let page_count = data.count / data.results.length
         let all_page = $('#video-blocks-list .pagination .page-item')
         all_page.each(function( index ) {
             if(index == 0) {
                 if(data.previous != null) $(this).removeClass('disabled').children('a').attr('href', data.previous)
                 else $(this).addClass('disabled').children('a').attr('href', '#')
             } else if(index == all_page.length-1) {
                 if(data.next != null) $(this).removeClass('disabled').children('a').attr('href', data.next)
                 else $(this).addClass('disabled').children('a').attr('href', '#')
             } else {

             }
         })
     })
}

async function ajax_get_videos_data(url = '/video/api/all'){
    return await $.ajax({
        headers:{"X-CSRFToken": csrftoken },
        url: url,
        type: "GET",
        dataType: "JSON"
    })
}

$('#video-blocks-list .pagination .page-link').on('click', function (e) {
    if($(this).attr('href') != '') render_video_block_page($(this).attr('href'))
    e.preventDefault()
})