function LoadProtocolMatch(id, isForMatch = true) {
    if (id != null && id != undefined) {
        let data = {'get_match_protocol': 1, 'id': id};
        let resultData = [];
        $('.page-loader-wrapper').fadeIn();
        $.ajax({
            headers:{"X-CSRFToken": csrftoken},
            data: data,
            type: 'GET', // GET или POST
            dataType: 'json',
            url: "matches_api",
            success: function (res) {
                if (res.success) {
                    resultData = res.data;  
                }
            },
            error: function (res) {
                console.log(res);
            },
            complete: function (res) {
                if (isForMatch) {
                    RenderProtocolInMatch(resultData);
                } else {
                    RenderProtocolInMatches(resultData);
                }
                $('.page-loader-wrapper').fadeOut();
            }
        });
    }
}
