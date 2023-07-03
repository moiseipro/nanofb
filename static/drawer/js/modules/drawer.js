/**
 * Non-unique attributes
 */
fabric.Canvas.prototype.getItemsByAttr = (cvs, attr, val) => {
    let objectList = [];
    traverseObjects(cvs.getObjects(), attr, val, objectList);
    return objectList;
};
/**
 * Unique attribute
 */
fabric.Canvas.prototype.getItemByAttr = (cvs, attr, val) => {
    let objectList = [];
    traverseObjects(cvs.getObjects(), attr, val, objectList);
    return objectList[0];
};
/**
 * Traverse objects in groups (and subgroups)
 */
function traverseObjects(objects, attr, val, objectList) {
    for (i in objects) {
        if (objects[i]['type'] == 'group') {
            traverseObjects(objects[i].getObjects(), attr, val, objectList);
        } else if (objects[i][attr] == val) {
            objectList.push(objects[i]);
        }
    }
}

function ResizeCanvas() {
    const newWidth = $('.draw-canvas-block').width() * 0.8;
    const newHeight = $('.draw-canvas-block').height() * 0.95;
    if (window.canvas.width != newWidth || window.canvas.height != newHeight) {
        const scaleX = newWidth / window.canvas.width;
        const scaleY = newHeight / window.canvas.height;
        let objects = window.canvas.getObjects();
        for (let i in objects) {
            objects[i].scaleX = objects[i].scaleX * scaleX;
            objects[i].scaleY = objects[i].scaleY * scaleY;
            objects[i].left = objects[i].left * scaleX;
            objects[i].top = objects[i].top * scaleY;
            objects[i].setCoords();
        }
        let obj = window.canvas.backgroundImage;
        if (obj) {
            obj.scaleX = obj.scaleX * scaleX;
            obj.scaleY = obj.scaleY * scaleY;
        }
        window.canvas.discardActiveObject();
        window.canvas.setWidth(window.canvas.getWidth() * scaleX);
        window.canvas.setHeight(window.canvas.getHeight() * scaleY);
        window.canvas.renderAll();
        window.canvas.calcOffset();
    }
}

function ClearPage() {
    $('.header').remove();
    $('.sidebar').remove();
    $('.page-wrapper').removeClass("page-wrapper");
    setTimeout(() => {
        $('#jivo-iframe-container').remove();
        $('jdiv').remove();
    }, 1500);
}

function GetIcon(elem, url, style, value_text="") {
    let resData = "";
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: {'url': url, 'style': style, 'value_text': value_text},
        type: 'GET', // GET или POST
        dataType: 'json',
        url: "/drawer/get_icon",
        success: function (res) {
            if (res.success) {
                resData = `data:image/svg+xml;base64,${res.data}`;
                $(elem).attr('src', resData);
            }
        },
        error: function (res) {
        },
        complete: function (res) {
            $('.tmp-current-icon').attr('src', resData);
        }
    });
}

function CreateCanvasDraw() {
    function saveMouseCoords(opts) {
        let mouseX = opts.e.layerX;
        let mouseY = opts.e.layerY;
        window.canvasMouse = {'x': mouseX, 'y': mouseY};
    }
    function selectionHandle(obj) {
        $('.leftmenu-content-element[data-id="layers"]').find('.layer-elem').removeClass('selected');
        $('.leftmenu-content-element[data-id="layers"]').find('.layer-elem').find('[name="selectable"]').prop('checked', false);
        let elems = window.canvas.getActiveObjects();
        for (let i = 0; i < elems.length; i++) {
            let elem = elems[i];
            $('.leftmenu-content-element[data-id="layers"]').find(`.layer-elem[data-index="${elem['c_index']}"]`).addClass('selected');
            $('.leftmenu-content-element[data-id="layers"]').find(`.layer-elem[data-index="${elem['c_index']}"]`).find('[name="selectable"]').prop('checked', true);
        }
        let checkedAll = $('.leftmenu-content-element[data-id="layers"]').find('.layer-elem:not(.d-none)').length
            == $('.leftmenu-content-element[data-id="layers"]').find('.layer-elem.selected:not(.d-none)').length 
            && $('.leftmenu-content-element[data-id="layers"]').find('.layer-elem:not(.d-none)').length > 0;
        $('.leftmenu-content-element[data-id="layers"]').find('#checkAll').prop('checked', checkedAll);
    }

    let tWidth = $('.draw-canvas-block').width() * 0.8;
    let tHeight = $('.draw-canvas-block').height() * 0.95;
    let canvas = new fabric.Canvas('canvas', {
        backgroundColor: '#343a40',
        width: tWidth,
        height: tHeight,
    });
    canvas.on('mouse:move', (opt) => {
        saveMouseCoords(opt);
    });
    canvas.on('mouse:over', (opt) => {
        saveMouseCoords(opt);
        if ($('.draw-leftmenu-content').find('.cvs-elem.selected').length > 0) {
            ToggleNewObjOnCanvas(true);
        }
    });
    canvas.on('mouse:out', (opt) => {
        saveMouseCoords(opt);
        if ($('.draw-leftmenu-content').find('.cvs-elem.selected').length > 0) {
            ToggleNewObjOnCanvas(false);
        }
    });
    canvas.on('object:moving', (e) => {
        let obj = e.target;
        // if object is too big ignore
        if (obj.currentHeight > obj.canvas.height || obj.currentWidth > obj.canvas.width) {
            return;
        }
        obj.setCoords();
        // top-left  corner
        if (obj.getBoundingRect().top < 0 || obj.getBoundingRect().left < 0) {
            obj.top = Math.max(obj.top, obj.top-obj.getBoundingRect().top);
            obj.left = Math.max(obj.left, obj.left-obj.getBoundingRect().left);
        }
        // bot-right corner
        if (obj.getBoundingRect().top+obj.getBoundingRect().height  > obj.canvas.height || obj.getBoundingRect().left+obj.getBoundingRect().width  > obj.canvas.width) {
            obj.top = Math.min(obj.top, obj.canvas.height-obj.getBoundingRect().height+obj.top-obj.getBoundingRect().top);
            obj.left = Math.min(obj.left, obj.canvas.width-obj.getBoundingRect().width+obj.left-obj.getBoundingRect().left);
        }
    });
    canvas.on({
        'mouse:up': selectionHandle,
    });
    window.canvas = canvas;
    $(window).resize(ResizeCanvas);
    ChangeField();

    LoadCanvas();
}

function ToggleNewObjOnCanvas(onCreate=true) {
    let selectedElem = $('.draw-leftmenu-content').find('.cvs-elem.selected').first();
    let cUrl = $(selectedElem).find('img:not(.d-none)').attr('src');
    let cvsClonedElem = $(selectedElem).clone();
    $(cvsClonedElem).removeClass('selected').addClass('cvs-elem-view');
    cvsClonedElem = $(cvsClonedElem).prop('outerHTML');
    if (onCreate) {
        let mousePos = window.canvasMouse;
        if (selectedElem) {
            let currentGroup = $(selectedElem).attr('data-group');
            let currentGType = $(selectedElem).attr('data-g-type');
            let scaleVal = 0.5;
            if (currentGroup == "gate") {
                if ($('.leftmenu-content-element[data-id="gates"]').find('.gates-type.active').attr('data-id') == "small") {
                    scaleVal = 1.45;
                } else {
                    scaleVal = 2.5;
                }
            }
            if (currentGroup == "player") {
                scaleVal = 0.06;
            }
            if (currentGroup == "caps") {
                scaleVal = 0.045;
            }
            if (currentGroup == "labels" || currentGroup == "numbers") {
                scaleVal = 0.25;
            }
            if (currentGroup == "equipment") {
                if (currentGType == "flag") {
                    scaleVal = 1;
                }
                if (currentGType == "beam") {
                    scaleVal = 0.95;
                }
            }
            
            window.createdObject = null;
            if (currentGroup == "line") {
                let lineType = $('.leftmenu-content-element[data-id="lines"]').find('.line-type.active').attr('data-id');
                let lineType2 = $('.leftmenu-content-element[data-id="lines"]').find('.line-type-2.active').attr('data-id');
                let lineThickness = 1;
                try {
                    lineThickness = parseInt($('.leftmenu-content-element[data-id="lines"]').find('.line-thickness-type.active').attr('data-id')) * 2;
                } catch(e) {}
                let isMarker = $('.leftmenu-content-element[data-id="lines"]').find('.line-marker').prop('checked');
                let lineColor = $('.leftmenu-content-element[data-id="lines"]').find('.color-elem.selected').css('background-color');
                let lineLength = 150;
             
                let linePath = "M0,25 L130,25";
                if (lineType == "quadratic") {
                    linePath = "M2,37.5 Q 75,0 130,37.5";
                } else if (lineType == "cubic") {
                    linePath = "M2,50 C0,0 120,50 139,18";
                } else if (lineType == "cubic2") {

                }
                let cLine = new fabric.Path(linePath, {
                    name: "c-elem",
                    name_opt: "c-line",
                    c_group: `${currentGroup}`,
                    img_parent: cvsClonedElem,
                    hoverCursor: 'pointer',
                    fill: '',
                    stroke: `${lineColor}`,
                    strokeWidth: lineThickness,
                    strokeDashArray: lineType2 == "dotted" ? [10, 10] : 0,
                    left: mousePos.x,
                    top: mousePos.y,
                    padding: 15,
                });
                cLine.setControlsVisibility({
                    bl: true,
                    br: true,
                    mb: false,
                    ml: false,
                    mr: false,
                    mt: false,
                    tl: true,
                    tr: true,
                    mtr: true,
                });
                window.canvas.add(cLine);
                window.createdObject = cline;
            } else if (currentGroup == "shape") {
                let zoneColor = $('.leftmenu-content-element[data-id="zones"]').find('.colors-panel-container-zones[data-id="color"]').find('.color-elem.selected').css('background-color');
                let zoneFillColor = $('.leftmenu-content-element[data-id="zones"]').find('.colors-panel-container-zones[data-id="fill"]').find('.color-elem.selected').css('background-color');
                let partsFillColor = zoneFillColor.match(/[\d.]+/g);
                if (partsFillColor.length === 3) {partsFillColor.push(1);}
                if (partsFillColor[3] != 0) {partsFillColor[3] = 0.3;}
                zoneFillColor = `rgba(${ partsFillColor.join(',') })`;
                let zoneThickness = 1;
                try {
                    zoneThickness = parseInt($('.leftmenu-content-element[data-id="zones"]').find('.zone-thickness-type.active').attr('data-id')) * 2;
                } catch(e) {}
                let zoneType = $('.leftmenu-content-element[data-id="zones"]').find('.zone-type.active').attr('data-id');
                let zoneName = $(selectedElem).attr('data-name');
                let objOptions = {
                    c_group: `${currentGroup}`,
                    img_parent: cvsClonedElem,
                    hoverCursor: 'pointer',
                    stroke: `${zoneColor}`,
                    strokeWidth: zoneThickness,
                    fill: `${zoneFillColor}`,
                    strokeDashArray: zoneType == "dotted" ? [10, 10] : 0,
                    left: mousePos.x,
                    top: mousePos.y,
                };
                let cObj = null;
                if (zoneName.includes("circle")) {
                    objOptions['name'] = "c-elem";
                    objOptions['name_opt'] = "c-circle";
                    objOptions['radius'] = 30;
                    cObj = new fabric.Circle(objOptions);
                } else if (zoneName.includes("ellipse")) {
                    objOptions['name'] = "c-elem";
                    objOptions['name_opt'] = "c-ellipse";
                    objOptions['rx'] = 60;
                    objOptions['ry'] = 30;
                    cObj = new fabric.Ellipse(objOptions);
                } else if (zoneName.includes("pentagon")) {
                    objOptions['name'] = "c-elem";
                    objOptions['name_opt'] = "c-pentagon";
                    cObj = new fabric.Polygon([
                        {x: 0, y: 0},
                        {x: 29.04, y: 19.8},
                        {x: 16.5, y: 52.8},
                        {x: -16.5, y: 52.8},
                        {x: -29.04, y: 19.8},
                    ], objOptions);
                } else if (zoneName.includes("square")) {
                    objOptions['name'] = "c-elem";
                    objOptions['name_opt'] = "c-square";
                    cObj = new fabric.Polygon([
                        {x: -25, y: 0},
                        {x: 25, y: 0},
                        {x: 25, y: 50},
                        {x: -25, y: 50},
                    ], objOptions);
                } else if (zoneName.includes("trapezoid")) {
                    objOptions['name'] = "c-elem";
                    objOptions['name_opt'] = "c-trapezoid";
                    cObj = new fabric.Polygon([
                        {x: -18, y: 0},
                        {x: 18, y: 0},
                        {x: 25, y: 50},
                        {x: -25, y: 50},
                    ], objOptions);
                } else if (zoneName.includes("triangle")) {
                    objOptions['name'] = "c-elem";
                    objOptions['name_opt'] = "c-triangle";
                    cObj = new fabric.Polygon([
                        {x: 0, y: 0},
                        {x: 30, y: 50},
                        {x: -30, y: 50},
                    ], objOptions);
                }
                if (cObj) {
                    cObj.setControlsVisibility({
                        bl: true,
                        br: true,
                        mb: false,
                        ml: false,
                        mr: false,
                        mt: false,
                        tl: true,
                        tr: true,
                        mtr: true,
                    });
                    window.canvas.add(cObj);
                    window.createdObject = cObj;
                }
            } else if (currentGroup == "text") {
                let textColor = $('.leftmenu-content-element[data-id="text"]').find('.colors-panel-container-text').find('.color-elem.selected').css('background-color');
                let textSize = 10;
                try {
                    textSize *= parseInt($('.leftmenu-content-element[data-id="text"]').find('.text-size-type.active').attr('data-id'));
                } catch(e) {}
                let textThickness = 400;
                try {
                    textThickness = parseInt($('.leftmenu-content-element[data-id="text"]').find('.text-thickness-type.active').attr('data-id'));
                } catch(e) {}
                let textContent = $('.leftmenu-content-element[data-id="text"]').find('input[name="text_content"]').val();
                if (textContent == "") {return;}
                let text = new fabric.Text(textContent, {
                    name: "c-elem",
                    name_opt: "c-text",
                    c_group: `${currentGroup}`,
                    img_parent: cvsClonedElem,
                    hoverCursor: 'pointer',
                    fill: `${textColor}`,
                    fontSize: textSize,
                    fontWeight: textThickness,
                    left: mousePos.x,
                    top: mousePos.y,
                });
                text.setControlsVisibility({
                    bl: true,
                    br: true,
                    mb: false,
                    ml: false,
                    mr: false,
                    mt: false,
                    tl: true,
                    tr: true,
                    mtr: true,
                });
                window.canvas.add(text);
                window.createdObject = text;
            } else if (currentGroup == "custom_field") {
                ChangeField(cUrl);
            } else {
                fabric.Image.fromURL(cUrl, (oImg) => {
                    oImg.set({
                        name: "c-elem",
                        c_group: `${currentGroup}`,
                        img_parent: cvsClonedElem,
                        hoverCursor: 'pointer',
                        scaleX: scaleVal,
                        scaleY: scaleVal,
                        left: mousePos.x,
                        top: mousePos.y,
                    });
                    oImg.setControlsVisibility({
                        bl: true,
                        br: true,
                        mb: false,
                        ml: false,
                        mr: false,
                        mt: false,
                        tl: true,
                        tr: true,
                        mtr: true,
                    });
                    window.canvas.add(oImg);
                    window.createdObject = oImg;
                });
            }
            setTimeout(() => {
                if (window.createdObject) {
                    window.createdObject.new = '1';
                    window.createdObject.moving = true;
                    window.canvas.setActiveObject(window.createdObject).renderAll();
                    
                }
            }, 150);
            $(selectedElem).removeClass('selected');
            RenderLayersContent();
        }
    } else {
        // if (window.canvas.selectedObj) {
        //     window.canvas.selectedObj.destroy();
        // }
    }
}

function RenderLayersContent() {
    const layersData = {
        'gate': {'group': "gates", 'name': "Ворота"},
        'equipment': {'group': "inventory", 'name': "Инвентарь"},
        'player': {'group': "players", 'name': "Игрок"},
        'line': {'group': "lines", 'name': "Линия"},
        'shape': {'group': "zones", 'name': "Зона"},
        'labels': {'group': "labels", 'name': "Метка"},
        'caps': {'group': "labels", 'name': "Манекен"},
        'numbers': {'group': "labels", 'name': "Метка"},
        'text': {'group': "text", 'name': "Текст"},
    };
    $('.leftmenu-content-element[data-id="layers"]').find('#checkAll').prop('checked', false);
    setTimeout(() => {
        let cHtml = "";
        let elems = window.canvas.getItemsByAttr(window.canvas, 'name', 'c-elem');
        $('.leftmenu-content-element[data-id="layers"]').find('.layer-type[data-id!="all"]').addClass('d-none');
        for (let i = 0; i < elems.length; i++) {
            let elem = elems[i];
            elem['c_index'] = i;
            $('.leftmenu-content-element[data-id="layers"]').find(`.layer-type[data-id="${layersData[elem.c_group]['group']}"]`).removeClass('d-none');
            cHtml += `
                <tr class="layer-elem" data-group="${layersData[elem.c_group]['group']}" data-index="${i}">
                    <td class="text-center align-middle">
                        <input type="checkbox" class="" name="selectable">
                    </td>
                    <td class="text-center align-middle">
                        ${elem.img_parent}
                    </td>
                    <td class="align-middle">
                        <span>${layersData[elem.c_group]['name']}</span>
                    </td>
                    <td class="text-center align-middle">
                        <button type="button" class="btn btn-sm btn-danger" name="delete" title="Удалить">
                            <i class="fa fa-trash-o" aria-hidden="true"></i>
                        </button>
                    </td>
                </tr>
            `;
        }
        $('.leftmenu-content-element[data-id="layers"]').find('.layers-body').html(cHtml);
    }, 250);
}

function SelectObjsFromLayers() {
    let canvasElems = window.canvas.getItemsByAttr(window.canvas, 'name', 'c-elem');
    let selectedObjects = [];
    $('.leftmenu-content-element[data-id="layers"]').find('.layer-elem.selected:not(.d-none)').each((ind, elem) => {
        let cIndex = -1
        try {
            cIndex = parseInt($(elem).attr('data-index'));
            selectedObjects.push(canvasElems[cIndex]);
        } catch(e) {}
    });
    window.canvas.discardActiveObject();
    let sel = new fabric.ActiveSelection(selectedObjects, {
        canvas: window.canvas,
    });
    window.canvas.setActiveObject(sel).renderAll();
}

function DeleteObjFromLayers(index) {
    let canvasElems = window.canvas.getItemsByAttr(window.canvas, 'name', 'c-elem');
    window.canvas.setActiveObject(canvasElems[index]).renderAll();
    DeleteSelectedAtCanvas();

}

function ChangeField(url=null) {
    if (!url) {
        url = "/static/drawer/img/assets/plane/f01.svg";
    }
    fabric.Image.fromURL(url, (img) => {
        window.canvas.setBackgroundImage(img, window.canvas.renderAll.bind(canvas), {
            scaleX: canvas.width / img.width,
            scaleY: canvas.height / img.height
        });
    });
}

function SaveCanvas() {
    let searchParams = new URLSearchParams(window.location.search);
    let drawId = searchParams.get('id');
    let json = window.canvas.toJSON([
        'name', 'name_opt', 'c_group', 'img_parent', 'hoverCursor', 'fill', 'stroke', 'strokeWidth',
        'strokeDashArray', 'left', 'top', 'padding', 'radius', 'rx', 'ry', 'selectable',
    ]);
    let jsonStr = JSON.stringify(json);
    let dt = window.canvas.toDataURL({
        format: 'png',
        quality: 1,
    });
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: {'save_drawing': 1, 'id': drawId, 'data': jsonStr, 'rendered_img': dt},
        type: 'POST', // GET или POST
        dataType: 'json',
        url: "drawer_api",
        success: function (res) {
            let drawId = res.id;
            if (res.success) {
                swal("Готово", "Изображение успешно сохранено.", "success")
                .then((value) => {
                    window.location.href = `/drawer/draw?id=${drawId}`;
                });
            }
        },
        error: function (res) {
            let optionalInfo = "";
            if (res.responseJSON.err == "saving_err") {optionalInfo = `Ошибка при сохранении (${res.responseJSON.err_text}).`;}
            swal("Ошибка", `Рисунок не сохранился. ${optionalInfo}`, "error");
            console.error(res);
        },
        complete: function (res) {
            $('.page-loader-wrapper').fadeOut();
        }
    });
}

function LoadCanvas() {
    let searchParams = new URLSearchParams(window.location.search);
    let drawId = searchParams.get('id');
    let data = {'get_drawing': 1, 'id': drawId};
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: data,
        type: 'GET', // GET или POST
        dataType: 'json',
        url: "drawer_api",
        success: function (res) {
            if (res.success) {
                try {
                    window.canvas.loadFromJSON(res.data, () => {
                        window.canvas.renderAll(); 
                    }, (o, object) => {
                        RenderLayersContent();
                    });
                } catch(e) {}
            }
        },
        error: function (res) {
            console.error(res);
        },
        complete: function (res) {
            ResizeCanvas();
        }
    });
}

function DeleteAllAtCanvas() {
    let elems = window.canvas.getItemsByAttr(window.canvas, 'name', 'c-elem');
    swal({
        title: "Вы точно хотите очистить всё поле ?",
        text: `После удаления всех элементов невозможно будет восстановить их !`,
        icon: "warning",
        buttons: ["Отмена", "Подтвердить"],
        dangerMode: true,
    }).then((willDelete) => {
        if (willDelete) {
            for (let i = 0; i < elems.length; i++) {
                let elem = elems[i];
                window.canvas.remove(elem);
            }
        }
    });
    RenderLayersContent();
}

function DeleteSelectedAtCanvas() {
    let elems = window.canvas.getActiveObjects();
    for (let i = 0; i < elems.length; i++) {
        let elem = elems[i];
        window.canvas.remove(elem);
    }
    RenderLayersContent();
}

function ChangeSelectedObjsSize(factor = 1) {
    let scale = factor * 0.1;
    let elems = window.canvas.getActiveObjects();
    for (let i = 0; i < elems.length; i++) {
        let elem = elems[i];
        elem.scaleX += scale;
        elem.scaleY += scale;
    }
    window.canvas.renderAll();
}

function DownloadCanvas() {
    let a = document.createElement('a');
    let dt = window.canvas.toDataURL({
        format: 'png',
        quality: 1,
    });
    dt = dt.replace(/^data:image\/[^;]*/, 'data:application/octet-stream');
    dt = dt.replace(
        /^data:application\/octet-stream/,
        'data:application/octet-stream;headers=Content-Disposition%3A%20attachment%3B%20filename=scheme.png',
    );
    a.href = dt;
    a.download = 'scheme.png';
    a.click();
}

// =======================================================

function ToggleLeftMenu(id) {
    const leftMenuTitles = {
        'layers': "Слои", 'fields': "Поля", 'gates': "Ворота", 'inventory': "Инвентарь",
        'players': "Игроки", 'lines': "Линии", 'zones': "Зоны", 'labels': "Метки",
        'text': "Добавление текста", 'image': "Загрузка изображения", 'logoNF': "Логотип NF",
    };
    if (id == "players") {
        TogglePlayersByType();
    }
    if (id == "lines") {
        LoadLinePreview();
    }
    if (id == "zones") {
        LoadZonePreview();
    }
    if (id == "labels") {
        LoadLabelsPreview();
    }
    if (id == "image") {
        LoadBackPictures();
    }
    $('.draw-leftmenu-header').text(leftMenuTitles[id]);
    $('.draw-leftmenu-content').find('.leftmenu-content-element').addClass('d-none');
    $('.draw-leftmenu-content').find(`.leftmenu-content-element[data-id="${id}"]`).removeClass('d-none');
    $('.a-button').removeClass('selected');
    $(`.a-button[data-id="${id}"]`).addClass('selected');
}

function ActionButton(id=null) {
    if (!id) {return;}
    const leftMenus = ["layers", "fields", "gates", "inventory", "players", "lines", "zones", "labels", "text", "image", "logoNF"];
    if (leftMenus.includes(id)) {
        ToggleLeftMenu(id);
    } else {
        switch(id) {
            case "save":
                SaveCanvas();
                break;
            case "deleteAll":
                DeleteAllAtCanvas();
                break;
            case "deleteSelected":
                DeleteSelectedAtCanvas();
                break;
            case "sizeDecrease":
                ChangeSelectedObjsSize(-1);
                break;
            case "sizeIncrease":
                ChangeSelectedObjsSize(1);
                break;
            case "download":
                DownloadCanvas();
                break;
            default:
                break;
        }
    }
}

function ToggleLayersTypeSection(id=null) {
    if (!id) {return;}
    $('.leftmenu-content-element[data-id="layers"]').find('.layer-type').removeClass('active');
    $('.leftmenu-content-element[data-id="layers"]').find(`.layer-type[data-id="${id}"]`).addClass('active');

    $('.leftmenu-content-element[data-id="layers"]').find('.layer-elem').addClass('d-none');
    if (id == "all") {
        $('.leftmenu-content-element[data-id="layers"]').find('.layer-elem').removeClass('d-none');
    } else {
        $('.leftmenu-content-element[data-id="layers"]').find(`.layer-elem[data-group="${id}"]`).removeClass('d-none');
    }
}

function TogglePlayersByType() {
    let cType = $('.leftmenu-content-element[data-id="players"]').find('.players-type.active').attr('data-id');
    let cPosType = $('.leftmenu-content-element[data-id="players"]').find('.players-pos-type.active').attr('data-id');
    $('.leftmenu-content-element[data-id="players"]').find('.players-list').find('.cvs-elem').parent().addClass('d-none');
    $('.leftmenu-content-element[data-id="players"]').find('.players-list').find(`.cvs-elem[data-g-type="${cType}"][data-g-type2="${cPosType}"]`).parent().removeClass('d-none');
    ChangePlayersColor();
}

function ChangePlayersColor() {
    let shirtColor = "#000";
    let pantsColor = "#000";
    let socksColor = "#000";
    $('.colors-panel-container-players').each((ind, elem) => {
        let cId = $(elem).attr('data-id');
        let cColor = $(elem).find('.colors-clothes').css('color');
        if (cId == "up") {shirtColor = cColor;}
        if (cId == "mid") {pantsColor = cColor;}
        if (cId == "down") {socksColor = cColor;}
    });
    let finalStyle = `--shirt-color:${shirtColor};`;
    finalStyle += `--pants-color:${pantsColor};`;
    finalStyle += `--socks-color:${socksColor};`;
    $('.leftmenu-content-element[data-id="players"]').find('.players-list').find('.cvs-elem').each((ind, elem) => {
        if ($(elem).parent().hasClass('d-none')) {return;}
        let cUrl = $(elem).find('img').attr('data-src');
        GetIcon($(elem).find('img'), cUrl, finalStyle);
    });
}

function LoadLinePreview() {
    let lineType = $('.leftmenu-content-element[data-id="lines"]').find('.line-type.active').attr('data-id');
    let lineType2 = $('.leftmenu-content-element[data-id="lines"]').find('.line-type-2.active').attr('data-id');
    let lineThickness = 1;
    try {
        lineThickness = parseInt($('.leftmenu-content-element[data-id="lines"]').find('.line-thickness-type.active').attr('data-id')) * 2;
    } catch(e) {}
    let isMarker = $('.leftmenu-content-element[data-id="lines"]').find('.line-marker').prop('checked');
    let lineColor = $('.leftmenu-content-element[data-id="lines"]').find('.color-elem.selected').css('background-color');
    let previewBlockElem = $('.leftmenu-content-element[data-id="lines"]').find('.line-preview-block');
    let imageUri = $(previewBlockElem).find(`.line-preview-elem[data-g-type="${
        isMarker ? `with_arrow` : `without_arrow`
    }"][data-name*="${lineType}"] > img`).attr('src');
    if (imageUri) {
        $(previewBlockElem).find('.cvs-elem').find('svg').remove();
        $.get(imageUri, (data) => {
            let svg = $(data).find('svg');
            $(svg).removeAttr('xmlns:a');
            $(svg).addClass('img-thumbnail c-img');
            $(svg).css('--stroke-dasharray', lineType2 == "dotted" ? [10, 10] : 0);
            $(svg).css('--stroke-width', lineThickness);
            $(svg).css('--stroke-color', lineColor);
            $(previewBlockElem).find('.cvs-elem').append(svg)
        });
    }
}

function LoadZonePreview() {
    let zoneColor = $('.leftmenu-content-element[data-id="zones"]').find('.colors-panel-container-zones[data-id="color"]').find('.color-elem.selected').css('background-color');
    let zoneFillColor = $('.leftmenu-content-element[data-id="zones"]').find('.colors-panel-container-zones[data-id="fill"]').find('.color-elem.selected').css('background-color');
    let partsFillColor = zoneFillColor.match(/[\d.]+/g);
    if (partsFillColor.length === 3) {partsFillColor.push(1);}
    if (partsFillColor[3] != 0) {partsFillColor[3] = 0.3;}
    zoneFillColor = `rgba(${ partsFillColor.join(',') })`;
    let zoneThickness = 1;
    try {
        zoneThickness = parseInt($('.leftmenu-content-element[data-id="zones"]').find('.zone-thickness-type.active').attr('data-id')) * 2;
    } catch(e) {}
    let zoneType = $('.leftmenu-content-element[data-id="zones"]').find('.zone-type.active').attr('data-id');
    $('.leftmenu-content-element[data-id="zones"]').find('.zones-preview-block').find('.cvs-elem > img').each((ind, elem) => {
        let imageUri = $(elem).attr('src');
        $(elem).addClass('d-none');
        $(elem).parent().find('svg').remove();
        $.get(imageUri, (data) => {
            let svg = $(data).find('svg');
            $(svg).removeAttr('xmlns:a');
            $(svg).addClass('img-thumbnail c-img');
            $(svg).css('--stroke-color', zoneColor);
            $(svg).css('--fill-color', zoneFillColor);
            $(svg).css('--stroke-width', zoneThickness);
            $(svg).css('--stroke-dasharray', zoneType == "dotted" ? [10, 10] : 0);
            $(elem).after(svg);
        });
    });
}

function CreateLabelsInPrev() {
    const labels = [
        {'text': "A", 'fill': true},
        {'text': "B", 'fill': true},
        {'text': "C", 'fill': true},
        {'text': "D", 'fill': true},
        {'text': "E", 'fill': true},
        {'text': "F", 'fill': true},
        {'text': "G", 'fill': true},
        {'text': "H", 'fill': true},
        {'text': "N", 'fill': true},
        {'text': "n", 'fill': true},
        {'text': "", 'fill': true},
    ];
    for (let i = 0; i < 10; i ++) {
        $('.leftmenu-content-element[data-id="labels"]').find('.labels-labels-block').append(`
            <div class="col-2 col-custom-10 px-0">
                <div class="cvs-elem" data-group="labels" data-g-type="None" data-g-type2="None" data-text="${i+1}" data-fill="${false}">
                    <img src="/static/drawer/img/assets/label.svg" alt="..." class="img-thumbnail c-img px-0" data-src="/static/drawer/img/assets/label.svg">
                </div>
            </div>
        `);
    }
    for (let i = 0; i < labels.length; i ++) {
        let label = labels[i];
        $('.leftmenu-content-element[data-id="labels"]').find('.labels-labels-block').append(`
            <div class="col-2 col-custom-8 px-0">
                <div class="cvs-elem" data-group="labels" data-g-type="None" data-g-type2="None" data-text="${label.text}" data-fill="${label.fill}">
                    <img src="/static/drawer/img/assets/label.svg" alt="..." class="img-thumbnail c-img px-0" data-src="/static/drawer/img/assets/label.svg">
                </div>
            </div>
        `);
    }
    const numbersCount = 100;
    for (let i = 0; i < numbersCount; i++) {
        $('.leftmenu-content-element[data-id="labels"]').find('.labels-numbers-block').append(`
            <div class="col-2 col-custom-10 px-0">
                <div class="cvs-elem" data-group="numbers" data-g-type="None" data-g-type2="None" data-text="${i}" data-fill="true">
                    <img src="/static/drawer/img/assets/label.svg" alt="..." class="img-thumbnail c-img px-0" data-src="/static/drawer/img/assets/label.svg">
                </div>
            </div>
        `);
    }

    // LoadLabelsPreview();
}

function LoadLabelsPreview() {
    let zoneColor = $('.leftmenu-content-element[data-id="labels"]').find('.colors-panel-container-labels[data-id="fill"]').find('.color-elem.selected').css('background-color');
    let useWhiteText = $('.leftmenu-content-element[data-id="labels"]').find('.colors-panel-container-labels[data-id="fill"]').find('.color-elem.selected').hasClass('s-white');
    let finalStyle = `--color:${zoneColor};`;
    $('.leftmenu-content-element[data-id="labels"]').find('.cvs-elem').each((ind, elem) => {
        let cUrl = $(elem).find('img').attr('data-src');
        let cText = null;
        if ($(elem).attr('data-group') == "labels" || $(elem).attr('data-group') == "numbers") {
            cText = $(elem).attr('data-text');
            let isFill = $(elem).attr('data-fill') == "true";
            if (isFill) {
                finalStyle += `--fill-color:${zoneColor};`;
                finalStyle += `--font-color:${useWhiteText ? '#fff' : '#000'};`;
            } else {
                finalStyle += `--fill-color:transparent;`;
                finalStyle += `--font-color:${zoneColor};`;
            }
        }
        GetIcon($(elem).find('img'), cUrl, finalStyle, cText);
    });
}

function LoadBackPictures() {
    let imgType = $('.leftmenu-content-element[data-id="image"]').find('.img-type.active').attr('data-id');
    $('.leftmenu-content-element[data-id="image"]').find('.upload-group').toggleClass('d-none', 
        $('.leftmenu-content-element[data-id="image"]').hasClass('user-on') && imgType == "nf");
    let data = {'get_back_pictures': 1, 'i_type': imgType};
    let resData = [];
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: data,
        type: 'GET', // GET или POST
        dataType: 'json',
        url: "drawer_api",
        success: function (res) {
            if (res.success) {
                resData = res.data;
            }
        },
        error: function (res) {
            console.error(res);
        },
        complete: function (res) {
            RenderBackPictures(resData);
        }
    });
}
function RenderBackPictures(data) {
    let container = $('.leftmenu-content-element[data-id="image"]').find('.backpics-container');
    let cHtml = "";
    for (let i = 0; i < data.length; i++) {
        let elem = data[i];
        cHtml += `
            <div class="col-4">
                <div class="cvs-elem" data-group="custom_field" data-name="${elem.name}">
                    <img src="${elem.url}" alt="..." class="img-thumbnail c-img px-0">
                </div>
            </div>
        `;
    }
    $(container).html(cHtml);
}



$(function() {
    ClearPage();
    CreateCanvasDraw();
    $('.a-button').on('click', (e) => {
        let cId = $(e.currentTarget).attr('data-id');
        ActionButton(cId);
    });


    $('.leftmenu-content-element[data-id="layers"]').on('click', '.layer-type', (e) => {
        let cId = $(e.currentTarget).attr('data-id');
        ToggleLayersTypeSection(cId);
    });
    $('.leftmenu-content-element[data-id="layers"]').on('click', '.layer-elem', (e) => {
        let isSelected = $(e.currentTarget).hasClass('selected');
        if ($(e.target).attr('name') == "delete" || $(e.target).parent().attr('name') == "delete") {
            console.log('delete');
            DeleteObjFromLayers($(e.currentTarget).attr('data-index'));
            return;
        }
        if ($(e.target).attr('name') != "selectable") {
            $('.leftmenu-content-element[data-id="layers"]').find('.layer-elem').removeClass('selected');
            $('.leftmenu-content-element[data-id="layers"]').find('.layer-elem').find('[name="selectable"]').prop('checked', false);
        }
        $(e.currentTarget).toggleClass('selected', !isSelected);
        $(e.currentTarget).find('[name="selectable"]').prop('checked', !isSelected);
        let checkedAll = true;
        $('.leftmenu-content-element[data-id="layers"]').find('.layer-elem:not(.d-none)').each((ind, elem) => {
            if (!$(elem).hasClass('selected')) {checkedAll = false;}
        });
        $('.leftmenu-content-element[data-id="layers"]').find('#checkAll').prop('checked', checkedAll);
        SelectObjsFromLayers();
    });
    $('.leftmenu-content-element[data-id="layers"]').on('click', '#checkAll', (e) => {
        let isChecked = $(e.currentTarget).prop('checked');
        $('.leftmenu-content-element[data-id="layers"]').find('.layer-elem:not(.d-none)').toggleClass('selected', isChecked);
        $('.leftmenu-content-element[data-id="layers"]').find('.layer-elem:not(.d-none)').find('[name="selectable"]').prop('checked', isChecked);
        SelectObjsFromLayers();
    });

    $('.leftmenu-content-element[data-id="gates"]').on('click', '.gates-type', (e) => {
        $('.leftmenu-content-element[data-id="gates"]').find('.gates-type').removeClass('active');
        $(e.currentTarget).addClass('active');
    });


    $('.draw-leftmenu-content').on('click', '.cvs-elem', (e) => {
        if ($(e.currentTarget).hasClass('cvs-elem-view')) {return;}
        let cGroup = $(e.currentTarget).attr('data-group');
        let cUrl = $(e.currentTarget).find('img').attr('src');
        if (cGroup == "plane") {
            ChangeField(cUrl);
        } else {
            let isSelected = $(e.currentTarget).hasClass('selected');
            $('.draw-leftmenu-content').find('.cvs-elem').removeClass('selected');
            $(e.currentTarget).toggleClass('selected', !isSelected);
        }
    });

    // Players panel
    $('.colors-panel-container-players').on('click', '.color-elem', (e) => {
        let cId = $(e.delegateTarget).attr('data-id');
        let cColor = $(e.currentTarget).css('background-color');
        $(`.colors-panel-container-players[data-id="${cId}"]`).find('.color-elem').removeClass('selected');
        $(e.currentTarget).addClass('selected');
        $(`.colors-panel-container-players[data-id="${cId}"]`).find('.colors-clothes').css('color', cColor);
        TogglePlayersByType();
    });

    // TogglePlayersByType();
    $('.leftmenu-content-element[data-id="players"]').on('click', '.players-type', (e) => {
        $('.leftmenu-content-element[data-id="players"]').find('.players-type').removeClass('active');
        $(e.currentTarget).addClass('active');
        TogglePlayersByType();
    });
    $('.leftmenu-content-element[data-id="players"]').on('click', '.players-pos-type', (e) => {
        $('.leftmenu-content-element[data-id="players"]').find('.players-pos-type').removeClass('active');
        $(e.currentTarget).addClass('active');
        TogglePlayersByType();
    });


    // LoadLinePreview();
    $('.leftmenu-content-element[data-id="lines"]').on('click', '.line-type', (e) => {
        $('.leftmenu-content-element[data-id="lines"]').find('.line-type').removeClass('active');
        $(e.currentTarget).addClass('active');
        LoadLinePreview();
    });
    $('.leftmenu-content-element[data-id="lines"]').on('click', '.line-type-2', (e) => {
        $('.leftmenu-content-element[data-id="lines"]').find('.line-type-2').removeClass('active');
        $(e.currentTarget).addClass('active');
        LoadLinePreview();
    });
    $('.leftmenu-content-element[data-id="lines"]').on('click', '.line-thickness-type', (e) => {
        $('.leftmenu-content-element[data-id="lines"]').find('.line-thickness-type').removeClass('active');
        $(e.currentTarget).addClass('active');
        LoadLinePreview();
    });
    $('.leftmenu-content-element[data-id="lines"]').on('change', '.line-marker', (e) => {
        LoadLinePreview();
    });
    $('.colors-panel-container-lines').on('click', '.color-elem', (e) => {
        let cId = $(e.delegateTarget).attr('data-id');
        let cColor = $(e.currentTarget).css('background-color');
        $(`.colors-panel-container-lines[data-id="${cId}"]`).find('.color-elem').removeClass('selected');
        $(e.currentTarget).addClass('selected');
        LoadLinePreview();
    });


    // LoadZonePreview();
    $('.colors-panel-container-zones').on('click', '.color-elem', (e) => {
        let cId = $(e.delegateTarget).attr('data-id');
        let cColor = $(e.currentTarget).css('background-color');
        $(`.colors-panel-container-zones[data-id="${cId}"]`).find('.color-elem').removeClass('selected');
        $(e.currentTarget).addClass('selected');
        LoadZonePreview();
    });
    $('.leftmenu-content-element[data-id="zones"]').on('click', '.zone-thickness-type', (e) => {
        $('.leftmenu-content-element[data-id="zones"]').find('.zone-thickness-type').removeClass('active');
        $(e.currentTarget).addClass('active');
        LoadZonePreview();
    });
    $('.leftmenu-content-element[data-id="zones"]').on('click', '.zone-type', (e) => {
        $('.leftmenu-content-element[data-id="zones"]').find('.zone-type').removeClass('active');
        $(e.currentTarget).addClass('active');
        LoadZonePreview();
    });


    CreateLabelsInPrev();
    $('.colors-panel-container-labels').on('click', '.color-elem', (e) => {
        let cId = $(e.delegateTarget).attr('data-id');
        $(`.colors-panel-container-labels[data-id="${cId}"]`).find('.color-elem').removeClass('selected');
        $(e.currentTarget).addClass('selected');
        LoadLabelsPreview();
    });


    $('.colors-panel-container-text').on('click', '.color-elem', (e) => {
        let cColor = $(e.currentTarget).css('background-color');
        $(`.colors-panel-container-text`).find('.color-elem').removeClass('selected');
        $(e.currentTarget).addClass('selected');
    });
    $('.leftmenu-content-element[data-id="text"]').on('click', '.text-size-type', (e) => {
        $('.leftmenu-content-element[data-id="text"]').find('.text-size-type').removeClass('active');
        $(e.currentTarget).addClass('active');
    });
    $('.leftmenu-content-element[data-id="text"]').on('click', '.text-thickness-type', (e) => {
        $('.leftmenu-content-element[data-id="text"]').find('.text-thickness-type').removeClass('active');
        $(e.currentTarget).addClass('active');
    });


    // LoadBackPictures();
    $('.leftmenu-content-element[data-id="image"]').on('click', '.img-type', (e) => {
        let cId = $(e.currentTarget).attr('data-id');
        $('.leftmenu-content-element[data-id="image"]').find('.img-type').removeClass('active');
        $(e.currentTarget).addClass('active');
        LoadBackPictures();
    });
    $('.leftmenu-content-element[data-id="image"]').on('click', 'button[name="fileUpload"]', (e) => {
        let dataToSend = new FormData();
        let imgType = $('.leftmenu-content-element[data-id="image"]').find('.img-type.active').attr('data-id');
        let fileImg = $('.leftmenu-content-element[data-id="image"]').find('#fileImgPhoto')[0].files[0];
        if (fileImg) {
            dataToSend.append('file_image', fileImg);
        } else {
            swal("Внимание", "Выберите файл для загрузки.", "info");
            return;
        }
        dataToSend.append('add_back_picture', 1);
        dataToSend.append('i_type', imgType);
        $('.page-loader-wrapper').fadeIn();
        $.ajax({
            headers:{"X-CSRFToken": csrftoken},
            data: dataToSend,
            processData: false,
            contentType: false,
            type: 'POST', // GET или POST
            dataType: 'json',
            url: "drawer_api",
            success: function (res) {
                if (res.success) {
                    swal("Готово", "Изображение успешно добавлено.", "success")
                    .then((value) => {
                        LoadBackPictures();
                    });
                }
            },
            error: function (res) {
                let optionalInfo = "";
                if (res.responseJSON.err == "img_none") {optionalInfo = "Не выбрано изображение.";}
                if (res.responseJSON.err == "access_denied") {optionalInfo = "Нет доступа к операции.";}
                if (res.responseJSON.err == "max_count") {optionalInfo = "Превышено количество загружаемых изображений.";}
                if (res.responseJSON.err == "adding_err") {optionalInfo = `Ошибка при сохранении (${res.responseJSON.err_text}).`;}
                swal("Ошибка", `Изображение не добавлено. ${optionalInfo}`, "error");
                console.error(res);
            },
            complete: function (res) {
                $('.leftmenu-content-element[data-id="image"]').find('#fileImgPhoto').val('');
                $('.page-loader-wrapper').fadeOut();
            }
        });
    });
    $('.leftmenu-content-element[data-id="image"]').on('click', 'button[name="fileDelete"]', (e) => {
        let selectedName = $('.leftmenu-content-element[data-id="image"]').find('.cvs-elem.selected').attr('data-name');
        if (!selectedName) {
            swal("Внимание", "Выберите изображение для удаления.", "warning");
            return;
        }
        let imgType = $('.leftmenu-content-element[data-id="image"]').find('.img-type.active').attr('data-id');
        if ($('.leftmenu-content-element[data-id="image"]').hasClass('user-on') && imgType == "nf") {
            swal("Внимание", "Вы не можете удалить данное изображение.", "warning");
            return;
        }
        $('.page-loader-wrapper').fadeIn();
        $.ajax({
            headers:{"X-CSRFToken": csrftoken},
            data: {'delete_back_picture': 1, 'name': selectedName, 'i_type': imgType},
            type: 'POST', // GET или POST
            dataType: 'json',
            url: "drawer_api",
            success: function (res) {
                if (res.success) {
                    swal("Готово", "Изображение успешно удалено.", "success")
                    .then((value) => {
                        LoadBackPictures();
                    });
                }
            },
            error: function (res) {
                let optionalInfo = "";
                if (res.responseJSON.err == "access_denied") {optionalInfo = "Нет доступа к операции.";}
                if (res.responseJSON.err == "deleting_err") {optionalInfo = `Ошибка при сохранении (${res.responseJSON.err_text}).`;}
                swal("Ошибка", `Изображение не удалено. ${optionalInfo}`, "error");
                console.error(res);
            },
            complete: function (res) {
                $('.page-loader-wrapper').fadeOut();
            }
        });
    });


});
