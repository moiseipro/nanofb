
$(function() {
    $('#feedbackFormSubmit').on('click', (e) => {
        let dataToSend = {};
        $('#feedbackForm').find('input').each((ind, elem) => {
            dataToSend[`${$(elem).attr('name')}`] = $(elem).val();
        });
        $.ajax({
            headers:{"X-CSRFToken": csrftoken},
            data: dataToSend,
            type: 'POST', // GET или POST
            dataType: 'json',
            url: "feedback_form",
            success: function (res) {
                if (res.success) {
                    swal("Готово", "Заявка успешно отправлена. Скоро с вами свяжется менеджер.", "success");
                } else {
                    swal("Ошибка", `При отправке заявки произошла ошибка (${res.err}).`, "error");
                }
            },
            error: function (res) {
                swal("Ошибка", `При отправке заявки произошла ошибка.`, "error");
                console.error(res);
            },
            complete: function (res) {
                $('.page-loader-wrapper').fadeOut();
            }
        });
    });
});
