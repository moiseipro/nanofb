// Токен для отправик AJAX запросов
const csrftoken = Cookies.get('csrftoken');

let aspectRatio = 9 / 16  // коэффициент соотношения сторон

// Функция, меняющая соотношение
function resizeBlockJS(obj, aspectRatio = 9 / 16) {
    let myPlayerWidth = obj.parent().width(), // Требуемая ширина
        myPlayerHeight = myPlayerWidth * aspectRatio; // Требуемая высота

    obj.width(myPlayerWidth).height(myPlayerHeight); // Устанавливаем размеры
}

$(document).ready(function() {
    //Отправка формы смены языка по изменению select
    $('#select-language').on('change', function() {
        console.log(this.form)
        this.form.submit();
    });
});