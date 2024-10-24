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

    const tWidth = $('.draw-canvas-block').width() * 0.782;
    const tHeight = $('.draw-canvas-block').height() * 0.95;
    let canvas = new fabric.Canvas('canvas', {
        backgroundColor: '#595e64',
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
    window.canvas = canvas;
    ChangeField();
}

function ToggleNewObjOnCanvas(onCreate=true) {
    let selectedElem = $('.draw-leftmenu-content').find('.cvs-elem.selected').first();
    let cUrl = $(selectedElem).find('img:not(.d-none)').attr('src');
    if (onCreate) {
        let mousePos = window.canvasMouse;
        if (selectedElem) {
            let currentGroup = $(selectedElem).attr('data-group');
            let scaleVal = 0.5;
            if (currentGroup == "gate") {
                if ($('.leftmenu-content-element[data-id="gates"]').find('.gates-type.active').attr('data-id') == "small") {
                    scaleVal = 1.4;
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
                    name: "c-elem c-line",
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
                    objOptions['name'] = "c-elem c-circle";
                    objOptions['radius'] = 30;
                    cObj = new fabric.Circle(objOptions);
                } else if (zoneName.includes("ellipse")) {
                    objOptions['name'] = "c-elem c-ellipse";
                    objOptions['rx'] = 60;
                    objOptions['ry'] = 30;
                    cObj = new fabric.Ellipse(objOptions);
                } else if (zoneName.includes("pentagon")) {
                    objOptions['name'] = "c-elem c-pentagon";
                    cObj = new fabric.Polygon([
                        {x: 0, y: 0},
                        {x: 29.04, y: 19.8},
                        {x: 16.5, y: 52.8},
                        {x: -16.5, y: 52.8},
                        {x: -29.04, y: 19.8},
                    ], objOptions);
                } else if (zoneName.includes("square")) {
                    objOptions['name'] = "c-elem c-square";
                    cObj = new fabric.Polygon([
                        {x: -25, y: 0},
                        {x: 25, y: 0},
                        {x: 25, y: 50},
                        {x: -25, y: 50},
                    ], objOptions);
                } else if (zoneName.includes("trapezoid")) {
                    objOptions['name'] = "c-elem c-trapezoid";
                    cObj = new fabric.Polygon([
                        {x: -18, y: 0},
                        {x: 18, y: 0},
                        {x: 25, y: 50},
                        {x: -25, y: 50},
                    ], objOptions);
                } else if (zoneName.includes("triangle")) {
                    objOptions['name'] = "c-elem c-triangle";
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
                    name: "c-elem c-text",
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
            } else {
                fabric.Image.fromURL(cUrl, (oImg) => {
                    oImg.set({
                        name: "c-elem",
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
                });

            }
            $(selectedElem).removeClass('selected');
        }
    } else {
        // if (window.canvas.selectedObj) {
        //     window.canvas.selectedObj.destroy();
        // }
    }
}

function ChangeField(url=null) {
    if (!url) {
        url = "/static/drawer/img/assets/plane/f01.svg";
    }
    let currentField = window.canvas.getItemByAttr(window.canvas, 'name', 'field');
    if (currentField) {
        window.canvas.remove(currentField);
    }
    fabric.Image.fromURL(url, (oImg) => {
        oImg.set({
            name: "field",
            originX: 'left', 
            originY: 'top',
            selectable: false,
        });
        oImg.scaleToWidth(window.canvas.getWidth());
        oImg.scaleToHeight(window.canvas.getHeight());
        window.canvas.add(oImg);
        window.canvas.sendToBack(oImg);
    });
}

function SaveCanvas() {
    let json = window.canvas.stage.toJSON();
    console.log(json)
}


function ToggleLeftMenu(id) {
    const leftMenuTitles = {
        'layers': "Слои", 'fields': "Поля", 'gates': "Ворота", 'inventory': "Инвентарь",
        'players': "Игроки", 'lines': "Линии", 'zones': "Зоны", 'labels': "Метки",
        'text': "Добавление текста", 'image': "Загрузка изображения", 'logoNF': "Логотип NF",
    };
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
            default:
                break;
        }
    }
}

function CheckLayersTypeSectionVisible() {
    // если нет элементов, то не показывать кнопку типа слоя.   
}

function ToggleLayersTypeSection(id=null) {
    if (!id) {return;}
    $('.leftmenu-content-element[data-id="layers"]').find('.layer-type').removeClass('active');
    $('.leftmenu-content-element[data-id="layers"]').find(`.layer-type[data-id="${id}"]`).addClass('active');
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

    LoadLabelsPreview();
}

function LoadLabelsPreview() {
    let zoneColor = $('.leftmenu-content-element[data-id="labels"]').find('.colors-panel-container-labels[data-id="fill"]').find('.color-elem.selected').css('background-color');
    let finalStyle = `--color:${zoneColor};`;
    $('.leftmenu-content-element[data-id="labels"]').find('.cvs-elem').each((ind, elem) => {
        let cUrl = $(elem).find('img').attr('data-src');
        let cText = null;
        if ($(elem).attr('data-group') == "labels" || $(elem).attr('data-group') == "numbers") {
            cText = $(elem).attr('data-text');
            let isFill = $(elem).attr('data-fill') == "true";
            if (isFill) {
                finalStyle = `--fill-color:${zoneColor};`;
                finalStyle += `--font-color:#000;`;
            } else {
                finalStyle = `--fill-color:transparent;`;
                finalStyle += `--font-color:${zoneColor};`;
            }
        }
        GetIcon($(elem).find('img'), cUrl, finalStyle, cText);
    });
}



$(function() {

    ClearPage();
    CreateCanvasDraw();

    $('.a-button').on('click', (e) => {
        let cId = $(e.currentTarget).attr('data-id');
        ActionButton(cId);
    });


    CheckLayersTypeSectionVisible();
    $('.leftmenu-content-element[data-id="layers"]').on('click', '.layer-type', (e) => {
        let cId = $(e.currentTarget).attr('data-id');
        ToggleLayersTypeSection(cId);
    })

    $('.leftmenu-content-element[data-id="gates"]').on('click', '.gates-type', (e) => {
        $('.leftmenu-content-element[data-id="gates"]').find('.gates-type').removeClass('active');
        $(e.currentTarget).addClass('active');
    });


    $('.draw-leftmenu-content').on('click', '.cvs-elem', (e) => {
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

    TogglePlayersByType();
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


    LoadLinePreview();
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


    LoadZonePreview();
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


});
