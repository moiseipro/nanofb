
async function ajax_get_video_data(video_id){
    return await $.ajax({
        headers:{"X-CSRFToken": csrftoken },
        url: "/video/api/"+video_id,
        type: "GET",
        dataType: "JSON"
    })
}