function SetLabelsToField(customId = null, labels = null, labelSize = "20px") {
    let fieldElem = $('#fieldEditorModal').find('.draggable-zone');
    if (customId) {
        fieldElem = $(`#${customId}`)
    }
    $(fieldElem).find('.circle-label').remove();
    let cLabels = window.fieldLabels;
    if (labels) {cLabels = labels;}
    if (cLabels && Array.isArray(cLabels) && cLabels.length > 0) {
        cLabels.forEach(label => {
            let posStr = "";
            if (customId) {
                posStr = `left:${label.coords.x}%; top:${label.coords.y}%;`;
            } else {
                if (window.labelInitPos) {
                    let zoneSize = {
                        'width': $('#fieldEditorModal').find('.draggable-zone').width(),
                        'height': $('#fieldEditorModal').find('.draggable-zone').height(),
                    };
                    let left = label.coords.x / 100 * zoneSize.width + window.labelInitPos.left;
                    let top = label.coords.y / 100 * zoneSize.height + window.labelInitPos.top;
                    posStr = `left:${left}px; top:${top}px;`;
                }
            }
            $(fieldElem).append(`
                <div class="circle-label ${customId === null ? "draggable ui-widget-content" : "custom"}" data-id="${label.id} "data-color="${label.color}"
                    style="${posStr} --lbl-size: ${labelSize};"
                >${label.id}</div>
            `);
        });
        if (customId === null) {
            $('#fieldEditorModal').find('.circle-label.draggable').draggable({
                containment: "parent",
            });
        }
    }   
}



$(function() {
    window.labelInitPos = null;
    window.fieldLabels = [];
    $('#fieldEditorModal').on('show.bs.modal', (e) => {
        let labelsCount = 100;
        $('#fieldEditorModal').find('.labels-selector').html('');
        for (let i = 0; i < labelsCount / 2; i++) {
            $('#fieldEditorModal').find('.labels-selector.selector-left').append(`
                <div class="circle-label" data-id="${i+1}" data-color="c_gray">${i+1}</div>
            `);
        }
        for (let i = labelsCount / 2; i < labelsCount-1; i++) {
            $('#fieldEditorModal').find('.labels-selector.selector-right').append(`
                <div class="circle-label" data-id="${i+1}" data-color="c_gray">${i+1}</div>
            `);
        }
        $('#fieldEditorModal').find('.draggable-zone').append(`
            <div class="circle-label draggable ui-widget-content init" data-id="0">0</div>
        `);
        setTimeout((e) => {
            window.labelInitPos = $('#fieldEditorModal').find('.circle-label.draggable.init').position();
            $('#fieldEditorModal').find('.circle-label.draggable.init').remove();

            SetLabelsToField();
        }, 600);
    });
    
    
    $('#fieldEditorModal').on('click', '.circle-label:not(.draggable)', (e) => {
        let cId = $(e.currentTarget).attr('data-id');
        let cColor = $(e.currentTarget).attr('data-color');
        $('#fieldEditorModal').find('.draggable-zone').append(`
            <div class="circle-label draggable ui-widget-content" data-id="${cId}" data-color="${cColor}">${cId}</div>
        `);
        $('#fieldEditorModal').find('.circle-label.draggable').draggable({
            containment: "parent",
        });
    });
    
    $('#fieldEditorModal').find('.draggable-zone').bind("contextmenu", (e) => {
        return false;
    });
    
    $('#fieldEditorModal').on('mousedown', '.circle-label.draggable', (e) => {
        switch (e.which) {
            case 3:
                $(e.currentTarget).remove();
                break;
            default:
                break;
        }
    });

    $('#fieldEditorModal').on('change', 'select.change-labels-color', (e) => {
        let val = $(e.currentTarget).val();
        $('#fieldEditorModal').find('.circle-label:not(.draggable)').attr('data-color', val);
    });
    
    $('#fieldEditorModal').on('click', 'button[name="save"]', (e) => {
        let labels = [];
        let zoneSize = {
            'width': $('#fieldEditorModal').find('.draggable-zone').width(),
            'height': $('#fieldEditorModal').find('.draggable-zone').height(),
        };
        $('#fieldEditorModal').find('.circle-label.draggable').each((ind, elem) => {
            let elemPos = $(elem).position();
            let elemCoords = {
                'x': ((elemPos.left - window.labelInitPos.left) / zoneSize.width * 100),
                'y': ((elemPos.top - window.labelInitPos.top) / zoneSize.height * 100),
            };
            labels.push({
                'id': $(elem).attr('data-id'),
                'color': $(elem).attr('data-color'),
                'coords': elemCoords
            });
        });
        window.fieldLabels = labels;
        $('#fieldEditorModal').modal('hide');
    });
});
