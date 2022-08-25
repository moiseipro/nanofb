
$(window).on('load', function (){
     ajax_get_videos_data().then(function (data) {
         console.log(data)
         let video_html = '';
         $.each(data.results, function(index, element) {
             console.log(element)
             let img_url = `https://213.108.4.28/video/poster/${element['links']['nftv']}`

             video_html += `
                 <div class="col-sm-6 col-md-4 col-lg-3">
                    <div class="card w-100">
                        <div class="card-header p-0" style="height: 300px">
                            <img class="card-img-top" style="width: 100%;height: 100%;object-fit: cover;" src="${img_url}" alt="Poster block image">
                        </div>
                        <div class="card-body" style="height: 100px">
                            <h5 class="card-title">${element['name']}</h5>
                        </div>
                    </div>
                </div>
             `
         })
         $('#video-blocks-list .row').append(video_html)
         $('#video-blocks-list .row .card .card-img-top').on('error', function(){
             $(this).attr('src', 'https://main-cdn.sbermegamarket.ru/hlr-system/14/33/42/20/23/73/100026854151b0.jpg')
         });

     })
})

async function ajax_get_videos_data(){
    return await $.ajax({
        headers:{"X-CSRFToken": csrftoken },
        url: "/video/api/",
        type: "GET",
        dataType: "JSON"
    })
}