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
    //Список выбора сезонов
    $('#select-season').select2({
        language: get_cur_lang(),
        dropdownAutoWidth: true,
    })
    console.log(get_cur_lang())
    //Отправка формы смены сезона по изменению select
    $('#select-season').on('change', function() {
        console.log(this.form)
        this.form.submit();
    });
    //Список выбора команд
    $('#select-team').select2({
        language: get_cur_lang(),
        dropdownAutoWidth: true,

    })
    //Отправка формы смены команды по изменению select
    $('#select-team').on('change', function() {
        console.log(this.form)
        this.form.submit();
    });
    //Вызов окна рекомендаций по изменению пароля
    $('#dont_show_change_password_modal').on('change', function () {
        console.log($(this).is(':checked'))
        if($(this).is(':checked')){
            Cookies.set('show_change_password_recommendation', '1', { expires: 365})
        } else {
            Cookies.remove('show_change_password_recommendation')
        }
    })
    let cookie_password_recommendation = Cookies.get('show_change_password_recommendation');
    if(!cookie_password_recommendation){
        $('#edit_password_modal').modal('show')
        Cookies.set('show_change_password_recommendation', '1', { expires: 3})
        //Cookies.remove('show_change_password_recommendation')
    }
    let warning_settings_modal = $('#empty_settings_modal')
    if(warning_settings_modal){
        let create_data = get_url_value('create_data')
        if (!create_data){
            warning_settings_modal.modal('show')
        }
    }
    //Cookies.remove('show_change_password_recommendation')

});

let select_custom_search = '';
function create_ajax_select2(obj = null, placeholder = '', href = '', parent = $(document.body), tags = true, allowClear = true, search = 0, multiple = false, multiple_count = 0, additional_data = '') {
    obj.select2({
        tags: tags,
        multiple: multiple,
        allowClear: allowClear,
        minimumResultsForSearch: search,
        dropdownParent: parent,
        placeholder: placeholder,
        maximumSelectionLength: multiple_count,
        language: get_cur_lang(),
        theme: 'bootstrap4',
        width: '100%',
        ajax: {
            url: href,
            dataType: 'json',
            data: function (params) {
                var query = {
                    search: params.term,
                    custom_search: select_custom_search
                }
                for (const paramsKey in additional_data) {
                    query[paramsKey] = additional_data[paramsKey]
                }
                console.log(query)
                return query
            },
            processResults: function (data, params) {
                console.log(data)

                return {
                    results: data,
                    pagination: {
                      more: false
                    }
                };
            },
            cache: true
        },
        templateResult: select2CountTemplate,
        templateSelection: select2BaseSelectedTemplate,
    })
}

function select2CountTemplate(state) {
    console.log(state)
    var $state = ''
    if(typeof state.short != 'undefined'){
        $state = $(`
            <div class="text-dark w-auto" title="${state.text}"><span class="border bg-light px-1">${state.text}</span> <span class="float-right">${state.count ? '('+state.count+')':''}</span></div>
        `);
    } else {
        $state = $(`
            <div class="" title="${state.text}"> ${state.text} <span class="float-right">${state.count ? '('+state.count+')':''}</span></div>
        `);
    }

    return $state;
}

function select2BaseSelectedTemplate(state) {
    console.log(state)
    var $state = ''
    if(typeof state.short != 'undefined'){
        $state = $(`
            <div class="w-auto" title="${state.text}"><span class="border bg-light px-1">${state.text}</span></div>
        `);
    } else {
        $state = $(`
            <div class="" title="${state.text}"> ${state.text}</div>
        `);
    }

    return $state;
}

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

function get_translation_name(translation_names) {
    let translation_name = ''
    if(translation_names != null){
        translation_name = (get_cur_lang() in translation_names) ? translation_names[get_cur_lang()] : Object.values(translation_names)[0]
    }
    return translation_name
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
    $('.edit-custom-input').toggleClass('disabled', !edit_mode)
    $('.view-button').toggleClass('d-none', edit_mode)
    if(edit_mode) $('.sortable-edit.ui-sortable-disabled').sortable("enable")
    else $('.sortable-edit.ui-sortable').sortable("disable")
    //ckeditor
    if (document.descriptionEditor){
        if (edit_mode) document.descriptionEditor.disableReadOnlyMode('');
        else document.descriptionEditor.enableReadOnlyMode('');
    }
    // $(document).find('.ck-editor__top').toggleClass('d-none', edit_mode);
    // $(document).find('.ck-editor__main').toggleClass('read-mode', edit_mode);
    // $(document).find('.ck-editor__main').toggleClass('edit-mode', !edit_mode);
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

var debounce = function (func, wait, immediate) {
     var timeout;
     return function() {
         var context = this, args = arguments;
         var later = function() {
                 timeout = null;
                 if (!immediate) func.apply(context, args);
         };
         var callNow = immediate && !timeout;
         clearTimeout(timeout);
         timeout = setTimeout(later, wait);
         if (callNow) func.apply(context, args);
     };
};

function getFormattedDateFromTodayWithDelta(delta=0) {
    let date = new Date(new Date().getTime() + 24 * 60 * 60 * 1000 * delta);
    return date.getFullYear()
        + "-"
        + ("0" + (date.getMonth() + 1)).slice(-2)
        + "-"
        + ("0" + date.getDate()).slice(-2);
}

function copyToClipboard(text) {
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val(text).select();
    document.execCommand("copy");
    $temp.remove();
}