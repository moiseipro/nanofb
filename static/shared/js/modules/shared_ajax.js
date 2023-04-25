
async function ajax_share(method = 'POST', data,) {

     $('.page-loader-wrapper').fadeIn();

     return await $.ajax({
         headers: {"X-CSRFToken": csrftoken},
         data: data,
         type: method, // GET или POST
         dataType: 'json',
         url: "/shared/shared_link_api",
         success: function (res) {

         },
         error: function (res) {
             if (res.responseJSON.type == "date") {
                 swal(gettext("Error"), gettext("Date entered incorrectly")+'!', "error");
             } else if (res.responseJSON.type == "link") {
                 swal(gettext("Error"), gettext("Unable to create shared link")+'!', "error");
             }
             console.log(res);
         },
         complete: function (res) {
             $('.page-loader-wrapper').fadeOut();
         }
     });
}