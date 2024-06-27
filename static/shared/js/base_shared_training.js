$(window).on('load', function () {
    $('.calculate-name').each(function( index ) {
        let name_obj = $(this)
        //console.log(name_obj.attr('data-value').replace(/\"/g, "`").replace(/\'/g, '"'))
        let names = $.parseJSON(name_obj.attr('data-value').replace(/\"/g, "`").replace(/\'/g, '"'));

        name_obj.find('.title').text(get_translation_name(names))
        console.log(get_translation_name(names))
    })

    let inventoryJson = $('#inventory-data-block').attr('data-json');
    if (inventoryJson != 'None'){
        let inventory = $.parseJSON(inventoryJson.replace(/\'/g, '"'))
        if (inventory != null) {
            for (const inventory_item of inventory) {
                let inventory_row = $('.inventory-data-rows input[name="' + inventory_item.name + '"]');
                inventory_row.val(inventory_item.value)
                if (inventory_item.value == '' || inventory_item.value == 0){
                    inventory_row.closest('.inventory-col').addClass('d-none')
                }
            }
        }
    }
    $('.inventory-data-rows input').each(function () {
        $(this).prop('disabled', true)
    })

    let playerJson = $('#players-data-block').attr('data-json');
    console.log(playerJson.replace(/\'/g, '"'))
    if (playerJson != 'None'){
        let player = $.parseJSON(playerJson.replace(/\'/g, '"').toLowerCase())
        if(player != null && player.length > 0){
            let players_html = players_list_to_html(player)
            $('#players-data-block').html(players_html)
        }
    }




    let items = $('.video-js');
    items.each(function( index ) {
        videojs(items[index], {
            preload: 'auto',
            autoplay: false,
            controls: true,
            aspectRatio: '16:9',
            youtube: { "iv_load_policy": 1, 'modestbranding': 1, 'rel': 0, 'showinfo': 0, 'controls': 0 },
        });
    })

    create_editors()
})

function create_editors() {
    //Создание редакторов
    let cLang = $('#select-language').val();
    try {
        $('.exercise-info-block .ck-editor-view-block').each(function( index ) {
            let data = $(this).attr('data-text')
            let id = $(this).attr('id')
            console.log(id)
            CKSource.Editor
            .create(document.querySelector('#'+id), {
                licenseKey: '',
                language: cLang,
                removePlugins: ['Title'],
                fontSize: {
                    options: [
                        10,
                        11,
                        12,
                        13,
                        'default',
                        15,
                        16,
                        17,
                        18,
                    ]
                },
                toolbar: false
            })
            .then( editor => {
                //document.editor = editor;

                const toolbarElement = editor.ui.view.toolbar.element;
                editor.on( 'change:isReadOnly', ( evt, propertyName, isReadOnly ) => {
                    if ( isReadOnly ) {
                        toolbarElement.style.display = 'none';
                    } else {
                        toolbarElement.style.display = 'none';
                        //toolbarElement.style.display = 'flex';
                    }
                } );
                $('.resizeable-block').css('height', `100%`);
                editor.setData(data)
                editor.enableReadOnlyMode('');
                return editor;
            })

        });

    } catch(e) {}
}