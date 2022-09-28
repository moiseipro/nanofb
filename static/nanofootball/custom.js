// Токен для отправик AJAX запросов
const csrftoken = Cookies.get('csrftoken');
// Режим редактирования карточек
var edit_mode = false;

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
    //Отправка формы смены сезона по изменению select
    $('#select-season').on('change', function() {
        console.log(this.form)
        this.form.submit();
    });
    //Отправка формы смены команды по изменению select
    $('#select-team').on('change', function() {
        console.log(this.form)
        this.form.submit();
    });
});


function create_alert(id, options) {
    let obj = $('#'+id);
    var html = '<div class="alert alert-' + options.type + ' alert-dismissible" role="alert">'+
            options.message +
        '       <button class="close" type="button" data-dismiss="alert" aria-label="Close">'+
        '           <span aria-hidden="true">×</span>'+
        '       </button>'
        '   </div>';

    obj.append(html);
    obj.find(".alert").delay(4000).slideUp(200, function() {
        $(this).alert('close');
    });
}

function get_cur_lang() {
    return $('#select-language').val();
}

// Получить данные формы как объект
function getFormData($form){
    var unindexed_array = $form.serializeArray();
    var indexed_array = {};

    $.map(unindexed_array, function(n, i){
        indexed_array[n['name']] = n['value'];
    });

    return indexed_array;
}

// Переключение режима редактирования карточек
function toggle_edit_mode(toggle = null){
    if(toggle == null) edit_mode = !edit_mode
    else edit_mode = toggle
    $('.edit-input').prop('disabled', !edit_mode)
    $('.edit-button').toggleClass('d-none', !edit_mode)
    $('.view-button').toggleClass('d-none', edit_mode)
    if(edit_mode) $('.sortable-edit.ui-sortable-disabled').sortable("enable")
    else $('.sortable-edit.ui-sortable').sortable("disable")

}
$('.toggle-edit-mode').on('click', function () {
    toggle_edit_mode()
})

// Получить GET из ссылки или строки
function get_url_value (name, url = window.location.href){
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(url);
    if (results==null) {
       return null;
    }
    return decodeURI(results[1]) || 0;
}

function get_loader() {
    let loader = `
    <div class="load-block-wrapper">
        <div class="spinner"></div>
    </div>
    `
    return loader
}