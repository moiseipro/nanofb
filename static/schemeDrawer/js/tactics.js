const even = n => !(n % 2);
var
    drag,
    d = {},
    mX, mY, mX1, mY1, Qx1, Qy1, Qx2, Qy2, Z1, Z2,
    Id = Date.now(),
    slideNumber = 0,
    sliedes = [],
    objImg = [],
    lineType,
    figureType,
    offset = [],
    xPoints = [], yPoints = [],
    viewBoxParams,
    svgHeight, svgWidth, svgMouseX, svgMouseY,
    strokeValueOld = '#000000';

$(window).on('load', function () {
    var $preloader = $('#page-preloader'),
        $loadtext = $preloader.find('.loader-text')
    $spinner = $preloader.find('.loader')
    $spinner.fadeOut()
    $loadtext.html('Приступаем..').delay(150).fadeOut('slow')
    $preloader.delay(350).fadeOut('slow')
})

$(window).on('beforeunload', function (e) {
    return 'Возможно Вы забыли сохранить данные. Закрыть сайт?'
})

$(document).ready(function () {
    svgBlockResize()
    viewBoxParams = $('#block').attr('viewBox').split(' ')
    $('.btn:not(".btn-line")').on('mousedown', function () {
        removeDrawning()
    })
    $('.nav-link').on('mousedown', function () {
        removeDrawning()
    })
})

$(window).resize(function () {
    svgBlockResize()
})

$("#block").on('mousemove', function (e) {
    svgMouseX = Math.floor((e.clientX - offset.left) * viewBoxParams[2] / $('#block').outerWidth())
    svgMouseY = Math.floor((e.clientY - offset.top) * viewBoxParams[3] / $('#block').outerHeight())
})

$('#textColor').on('change', function () {
    removeDrawning()
    var color = this.value
    $('#textForInsert').css('color', color)
    objects.querySelectorAll('text[data-select="1"]').forEach(function (text) {
        $(text).css('fill', color)
    })
})

$('.color-selector').on('click', (e) => {
    let allSelectors = $('.color-selector');
    for (let i=0; i<allSelectors.length; i++) {
        $(allSelectors[i]).removeClass("selected-color");
    }
    $(e.currentTarget).addClass("selected-color");
    

    let color = $(e.currentTarget).css("background-color");
    $('#textColor').val(color);
    removeDrawning()
    $('#textForInsert').css('color', color);
    objects.querySelectorAll('text[data-select="1"]').forEach(function (text) {
        $(text).css('fill', color);
    })
})
$('.color-selector-block').on('click', (e) => {
    let allSelectors = $('.color-selector-block');
    for (let i=0; i<allSelectors.length; i++) {
        $(allSelectors[i]).removeClass("selected-color");
    }
    $(e.currentTarget).addClass("selected-color");
    

    let color = $(e.currentTarget).css("background-color");
    $('#blockColor').val(color);
    removeDrawning()
    //$('#textForInsert').css('color', color);
    objects.querySelectorAll('text[data-select="1"]').forEach(function (text) {
        let border_id = text.getAttribute('border-id');
        if(border_id){
            let border_text = block.getElementById(border_id);
            $(border_text).css('fill', color);
        }
    })
})
$('.color-selector-border').on('click', (e) => {
    let allSelectors = $('.color-selector-border');
    for (let i=0; i<allSelectors.length; i++) {
        $(allSelectors[i]).removeClass("selected-color");
    }
    $(e.currentTarget).addClass("selected-color");
    

    let color = $(e.currentTarget).css("background-color");
    $('#blockBorderColor').val(color);
    removeDrawning()
    //$('#textForInsert').css('color', color);
    objects.querySelectorAll('text[data-select="1"]').forEach(function (text) {
        let border_id = text.getAttribute('border-id');
        if(border_id){
            let border_text = block.getElementById(border_id);
            $(border_text).css('stroke', color);
        }
    })
})

$('#textWeight').on('change', function () {
    removeDrawning()
    var weight = this.value
    $('#textForInsert').css('font-weight', weight)
    objects.querySelectorAll('text[data-select="1"]').forEach(function (text) {
        let border_id = text.getAttribute('border-id');
        $(text).css('font-weight', weight)
        if(border_id){
            block.getElementById(border_id).setAttribute('width', text.getBBox().width*1.25);
            block.getElementById(border_id).setAttribute('height', text.getBBox().height*1.25);
            block.getElementById(border_id).setAttribute('x', text.getAttribute("x")-text.getBBox().width/8);
            block.getElementById(border_id).setAttribute('y', text.getAttribute("y")-text.getBBox().height/1.5*1.25);
        }
    })
})

$('#textSize').on('change', function () {
    removeDrawning()
    var font = this.value
    $('#textForInsert').css('font-size', font)
    objects.querySelectorAll('text[data-select="1"]').forEach(function (text) {
        let border_id = text.getAttribute('border-id');
        $(text).css('font-size', font)
        if(border_id){
            block.getElementById(border_id).setAttribute('width', text.getBBox().width*1.25);
            block.getElementById(border_id).setAttribute('height', text.getBBox().height*1.25);
            block.getElementById(border_id).setAttribute('x', text.getAttribute("x")-text.getBBox().width/8);
            block.getElementById(border_id).setAttribute('y', text.getAttribute("y")-text.getBBox().height/1.5*1.25);
        }
    })
})

$('#blockBorder').on('change', function () {
    removeDrawning()
    var borderSize = this.value
    $('#textForInsert').css('border', borderSize)
    objects.querySelectorAll('text[data-select="1"]').forEach(function (text) {
        let border_id = text.getAttribute('border-id');
        if(border_id){
            let border_text = block.getElementById(border_id);
            $(border_text).css('stroke-width', borderSize);
        }
    })
})

$('#strokeWidth').on('change', function () {
    removeDrawning()
    btnLine.setAttribute("stroke-width", strokeWidth.value)
    btnQLine.setAttribute("stroke-width", strokeWidth.value)
    btnCLine.setAttribute("stroke-width", strokeWidth.value)
    btn2QLine.setAttribute("stroke-width", strokeWidth.value)
    btnWLine.setAttribute("stroke-width", strokeWidth.value)
    btn2WLine.setAttribute("stroke-width", strokeWidth.value)
    lines.querySelectorAll('path[data-select="1"]').forEach(item =>{
        item.style.strokeWidth = strokeWidth.value;
    })
})

$('#strokeWidthFL').on('change', function () {
    btnCircle.setAttribute("stroke-width", strokeWidthFL.value)
    btnRect.setAttribute("stroke-width", strokeWidthFL.value)
    btnPoly.setAttribute("stroke-width", strokeWidthFL.value)
    btnPolyFive.setAttribute("stroke-width", strokeWidthFL.value)
    btnPolyTr.setAttribute("stroke-width", strokeWidthFL.value)
    btnEllipse.setAttribute("stroke-width", strokeWidthFL.value)
    figures.querySelectorAll('[data-select="1"]').forEach(item => {
        item.style.strokeWidth = strokeWidthFL.value;
    })
})

$('input:radio[name="color"]').change(function () {
    removeDrawning()
    stroke.value = String(this.value)
    strokeValueOld = String(this.value)
    arrow.setAttribute("fill", stroke.value)
    btnLine.setAttribute("stroke", stroke.value)
    btnQLine.setAttribute("stroke", stroke.value)
    btnCLine.setAttribute("stroke", stroke.value)
    btn2QLine.setAttribute("stroke", stroke.value)
    btnWLine.setAttribute("stroke", stroke.value)
    btn2WLine.setAttribute("stroke", stroke.value)
    lines.querySelectorAll('[data-select="1"]').forEach(item => {
        item.setAttribute('stroke', stroke.value)
        item.getAttribute('marker-end') != 'none' ? item.setAttribute('marker-end', 'url(' + stroke.value + 'arrow)') : false;
    })
    
})

$('input:radio[name="colorFL"]').change(function () {
    removeDrawning()
    strokeFL.value = String(this.value)
    btnCircle.setAttribute("stroke", strokeFL.value)
    btnRect.setAttribute("stroke", strokeFL.value)
    btnPoly.setAttribute("stroke", strokeFL.value)
    btnPolyFive.setAttribute("stroke", strokeFL.value)
    btnPolyTr.setAttribute("stroke", strokeFL.value)
    btnEllipse.setAttribute("stroke", strokeFL.value)
    figures.querySelectorAll('[data-select="1"]').forEach(item => {
        item.style.stroke = strokeFL.value;
    })
    
})

$('input:radio[name="colorFB"]').change(function () {
    removeDrawning()
    fillFL.value = String(this.value)
    fillFL.value != 'transparent' ? fillFL.value = fillFL.value + '1a' :  false;
    btnCircle.setAttribute("fill", fillFL.value)
    btnRect.setAttribute("fill", fillFL.value)
    btnPoly.setAttribute("fill", fillFL.value)
    btnPolyFive.setAttribute("fill", fillFL.value)
    btnPolyTr.setAttribute("fill", fillFL.value)
    btnEllipse.setAttribute("fill", fillFL.value)
    figures.querySelectorAll('[data-select="1"]').forEach(item => {
        item.style.fill = fillFL.value;
    })
})

$('input:radio[name="marker"]').change(function () {
    removeDrawning()
    marker.value = this.value
    if (marker.value == "arrow") {
        btnLine.setAttribute("marker-end", "url(#arrow)")
        btnLine.setAttribute("d", "M 0 25 L 135 25")
        btnQLine.setAttribute("marker-end", "url(#arrow)")
        btnQLine.setAttribute("d", "M 0 37.5 Q 75 12.5 135 37.5")
        btnCLine.setAttribute("marker-end", "url(#arrow)")
        btnCLine.setAttribute("d", "M 0 40 C 40 -10 80 40 120 20")
        btn2QLine.setAttribute("marker-end", "url(#arrow)")
        btn2QLine.setAttribute("d", "M 0 25 Q 25 0 50 25 70 50 100 25 125 0 140 25")
        btnWLine.setAttribute("marker-end", "url(#arrow)")
        btnWLine.setAttribute("d", "M 0 25 Q 25 0 50 25 70 50 100 25 125 0 140 25")
        btn2WLine.setAttribute("marker-end", "url(#arrow)")
        btn2WLine.setAttribute("d", "M 0 25 Q 25 0 50 25 70 50 100 25 125 0 140 25")
        lines.querySelectorAll('[data-select="1"]').forEach(function (line) {
            var color = line.getAttribute('stroke')
            line.setAttribute('marker-end', 'url(' + String(color) + 'arrow)')
        })
    } else {
        btnLine.setAttribute("marker-end", "none")
        btnLine.setAttribute("d", "M 0 25 L 150 25")
        btnQLine.setAttribute("marker-end", "none")
        btnQLine.setAttribute("d", "M 0 37.5 Q 75 12.5 150 37.5")
        btnCLine.setAttribute("marker-end", "none")
        btnCLine.setAttribute("d", "M 0 40 C 40 -10 80 40 120 20")
        btn2QLine.setAttribute("marker-end", "none")
        btn2QLine.setAttribute("d", "M 0 25 Q 25 0 50 25 70 50 100 25 125 0 150 25")
        btnWLine.setAttribute("marker-end", "none")
        btnWLine.setAttribute("d", "M 0 25 Q 25 0 50 25 70 50 100 25 125 0 140 25")
        btn2WLine.setAttribute("marker-end", "none")
        btn2WLine.setAttribute("d", "M 0 25 Q 25 0 50 25 70 50 100 25 125 0 140 25")
        lines.querySelectorAll('[data-select="1"]').forEach(function (line) {
            line.setAttribute('marker-end', 'none')
        })
    }
})

$('input:radio[name="dasharray"]').change(function () {
    removeDrawning();
    btnLine.setAttribute("stroke-dasharray", this.value);
    btnQLine.setAttribute("stroke-dasharray", this.value);
    btnCLine.setAttribute("stroke-dasharray", this.value);
    btn2QLine.setAttribute("stroke-dasharray", this.value);
    btnWLine.setAttribute("stroke-dasharray", this.value);
    btn2WLine.setAttribute("stroke-dasharray", this.value);
    strokeDasharray.value = this.value
    lines.querySelectorAll('[data-select="1"]').forEach(item=> {
        item.setAttribute('stroke-dasharray', strokeDasharray.value);
    })
})

$('input:radio[name="dasharrayF"]').change(function () {
    removeDrawning()
    btnCircle.setAttribute("stroke-dasharray", this.value)
    btnRect.setAttribute("stroke-dasharray", this.value)
    btnPoly.setAttribute("stroke-dasharray", this.value)
    btnPolyFive.setAttribute("stroke-dasharray", this.value)
    btnPolyTr.setAttribute("stroke-dasharray", this.value)
    btnEllipse.setAttribute("stroke-dasharray", this.value)
    strokeDasharrayFL.value = this.value
    figures.querySelectorAll('[data-select="1"]').forEach(item => {
        item.style.strokeDasharray = strokeDasharrayFL.value
    })
})

// Кнопка загрузки своей картинки
imgLoadButton.addEventListener('change', (event) => {
   var files = event.target.files
    for (var i = 0, f; f = files[i]; i++) {
        if (!f.type.match('image.*')) continue;
        var fr = new FileReader()
        fr.onload = (function (theFile) {
            return function (e) {
                var originalImg = new Image();
                originalImg.src = this.result;
                CompressImage(originalImg.src)
                
            }
        })(f)
        fr.readAsDataURL(f)
    }
});

//Сжатие изображения
function CompressImage(base64) {
    const canvas = document.createElement('canvas')
    const img = document.createElement('img')

    img.onload = function(){
        let width = img.width
        let height = img.height

        // const maxHeight = 150
        // const maxWidth = 150
        // if(width>height){
        //     if(width > maxWidth){
        //         height = Math.round((height *= maxWidth/width))
        //         width = maxWidth
        //     }
        // } else {
        //     if(height > maxHeight){
        //         width = Math.round((width *= maxHeight/height))
        //         height = maxHeight
        //     }
        // }
        canvas.width = width*0.9
        canvas.height = height*0.9

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        let compressData = canvas.toDataURL('image/jpeg', 1.0)
        $("#imgForLoad").attr("src", compressData).css("display", "block");
    }
    img.onerror = function(err){
        console.log("img load error")
    }
    img.src = base64;
    
}

/*$("#imgLoadButton").on('input', function (e) {
    var files = this.files
    for (var i = 0, f; f = files[i]; i++) {
        if (!f.type.match('image.*')) continue;
        var fr = new FileReader()
        fr.onload = (function (theFile) {
            return function (e) {
                $("#imgForLoad").attr("src", this.result).css("display", "block")
            }
        })(f)
        fr.readAsDataURL(f)
    }
})*/

$("a.plane").on('click', function (e) {
    e.preventDefault()
    plane.setAttribute("href", $(this).find("img").data("svg"))
})

function svgBlockResize() {
    svgHeight = $('#svgparent').height('100%').outerHeight(),
        svgWidth = $('#svgparent').width('100%').outerWidth(),
        ratioHeightWidth = 100 * svgHeight / svgWidth
    if (ratioHeightWidth >= 66) {
        $('#svgparent').height(2 * svgWidth / 3)
        $('#svgparent').width(svgWidth)
        $('#block').height(2 * svgWidth / 3)
        $('#block').width(svgWidth)
    } else {
        $('#svgparent').width(3 * svgHeight / 2)
        $('#svgparent').height(svgHeight)
        $('#block').width(3 * svgHeight / 2)
        $('#block').height(svgHeight)
    }
    offset = $('#svgparent').offset()
}

function clearField() {
    selects.innerHTML = ""
    figures.innerHTML = ""
    lines.innerHTML = ""
    objects.innerHTML = ""
    dots.innerHTML = ""
    $('#modalClear').modal('hide')
}

function clearSelected() {
    sObjects = document.querySelectorAll('[data-select="1"]')
    sObjects.forEach(function (sObject) {
        sObject.remove()
    });
    selects.innerHTML = ""
    dots.innerHTML = ""
    $('#modalSelectedClear').modal('hide')
}
// Удаление выделенного объекта на delete
$(document).keydown(function(e){
    if (e.keyCode == 46) {
        clearSelected()
    }
  });

function saveJPG() {
    var canvasVg = document.getElementById('canvas')
    canvasVg.width = 1800
    canvasVg.height = 1200
    var str = new XMLSerializer().serializeToString(document.querySelector('#block'))
    canvasVg.getContext('2d').drawSvg(str, 0, 0, 1800, 1200)
    $('#modalSaveJPG').modal('show')
}

function saveEXR() {
    var selected = block.querySelectorAll('[data-select]')
    selects.innerHTML = ''
    dots.innerHTML = ''
    selected.forEach(function (elem) {
        elem.removeAttribute('data-select')
    })
    if (slides.length > 0) {
        $('#animation').val(JSON.stringify(slides))
        $('#sch').val(slides[0])
    } else {
        $('#sch').val(block.innerHTML)
    }
    $('#modalSaveEXR').modal('show')
}

function download(canvas, filename) {
    var lnk = document.createElement('a'), e
    filename != '' ? lnk.download = filename : lnk.download = "nf_" + Date.now() + ".png"
    lnk.href = canvas.toDataURL("image/png;base64")
	
	console.log( canvas.toDataURL("image/png;base64") );

    if (document.createEvent) {
        e = document.createEvent("MouseEvents")
        e.initMouseEvent("click", true, true, window,
            0, 0, 0, 0, 0, false, false, false,
            false, 0, null)
        lnk.dispatchEvent(e)
    } else if (lnk.fireEvent) {
        lnk.fireEvent("onclick")
    }
}

//Сохранение картинки на сервер
function savePHP(canvas) {

    //Канвас
    var canvasVg = document.getElementById('canvas')
    canvasVg.width = 1800
    canvasVg.height = 1200
    var str = new XMLSerializer().serializeToString(document.querySelector('#block'))
    canvasVg.getContext('2d').drawSvg(str, 0, 0, 1800, 1200)

    //Созданная картинка в base64
    var canvas_data = canvas.toDataURL("image/png;base64");
    //Переменная время содания
    var exs_id = $('#exs_id').val();
	//Переменная время содания
    var img_num = $('#img_num').val();
    //Парсинг нарисованного
    var html = $('.jquery_parse').html();

    //console.log( canvas_data );
    

    //$('#base64canvas').val( canvas.toDataURL("image/png;base64") );

    let animationOpts = {};
    try {
        let animObj = JSON.parse(localStorage.getItem('animation'));
        animationOpts = {speed: animObj.speed, anims: animObj.anims};
    } catch (e) {
        animationOpts = {speed: 1000, anims: []};
    }

    console.log(animationOpts)
    
    //Записо в БД
    $.ajax({
        type: "POST",
        url: '/exercises_add/',
        data: { PicAjaxSave: exs_id, img_num: img_num, img_data: canvas_data, svg_data: html, anim_data: JSON.stringify(animationOpts)},
        dataType: 'json',
        success: function(result){
            //console.log(result);
            //alert('Сохранено в БД');
        }
    });
    
    alert('Сохранено в Базу Данных');
    window.close();
}

function drawLine(lType) {
    removeDrawning('line')
    block.addEventListener("drawline", drlHandler)
    var event = new Event("drawline")
    block.dispatchEvent(event)
    lineType = lType
}

function drawFigure(fType) {
    removeDrawning('figure')
    block.addEventListener("drawfigure", drcHandler)
    var event = new Event("drawfigure")
    block.dispatchEvent(event)
    figureType = fType
}

function drawText() {
    removeDrawning('text')
    block.addEventListener("drawtext", drtHandler)
    var event = new Event("drawtext")
    block.dispatchEvent(event)
}

function removeDrawning(type) {
    if (type != 'line') {
        block.removeEventListener("drawline", drlHandler)
        block.removeEventListener("mousedown", mddrlHandler)
    }

    if (type != 'figure') {
        plane.classList.remove("figureCreation")
        block.removeEventListener("drawfigure", drcHandler)
        block.removeEventListener("mousedown", mddrcHandler)
    }

    if (type != 'text') {
        block.removeEventListener("drawtext", drtHandler)
        block.removeEventListener("mousedown", mddrtHandler)
    }

    block.addEventListener("mousedown", mdHandler)
}

function reSizeGroup(rType) {
    rObject = block.querySelector('[data-select="1"]')
    if (rObject != null) {
        rObjects = block.querySelectorAll('[data-group="' + rObject.dataset.group + '"]')
        dataScale = +rObject.dataset.scale
        switch (rType) {
            case 0:
                if (dataScale > 10) {
                    dataScale = dataScale - 5
                }
                break
            case 1:
                if (dataScale < 150) {
                    dataScale = dataScale + 5
                }
                break
        }
        rObjects.forEach(function (rObject) {
            if ((rObject instanceof SVGImageElement) && (!rObject.classList.contains('self'))) {

                numSizeGroup.innerHTML = dataScale
                rObject.dataset.scale = dataScale
                rObject.setAttribute("width", rObject.dataset.width * dataScale / 100)
                rObject.setAttribute("height", rObject.dataset.height * dataScale / 100)
                points = document.querySelectorAll('[data-object="' + rObject.id + '"]')
                points.forEach(function (point) {
                    point.setAttribute("width", rObject.getAttribute("width"))
                    point.setAttribute("height", rObject.getAttribute("height"))
                })
            }
        })
    }
}

function rotateObj(rType) {
    degs = [-45, 0, 45, -90, 90, -135, 180, 135]
    rObjects = document.querySelectorAll('[data-select="1"]')
    rObjects.forEach(function (rObject) {
        if (rObject instanceof SVGImageElement) {
            var x = +rObject.getAttribute("x"), y = +rObject.getAttribute("y"), w = +rObject.getAttribute("width"), h = +rObject.getAttribute("height")
            xCenter = Math.floor(x + w / 2)
            yCenter = Math.floor(y + h / 2)
            rObject.setAttribute("transform", "rotate(" + degs[rType] + " " + xCenter + " " + yCenter + ")")
            points = document.querySelectorAll('[data-object="' + rObject.id + '"]')
            points.forEach(function (point) {
                point.setAttribute("transform", "rotate(" + degs[rType] + " " + xCenter + " " + yCenter + ")")
            })
        }
        if (rObject instanceof SVGTextElement) {
            var x = +rObject.getAttribute("x"), y = +rObject.getAttribute("y"), w = +rObject.getAttribute("width"), h = +rObject.getAttribute("height")
            xCenter = Math.floor(x + w / 2)
            yCenter = Math.floor(y - h / 2)
            rObject.setAttribute("transform", "rotate(" + degs[rType] + " " + xCenter + " " + yCenter + ")")
        }
    })
}

function drawDoubleLine(varX1, varY1, varX2, varY2) {
    lineX = varX1 - varX2
    lineY = varY1 - varY2
    lineD = Math.sqrt(Math.pow(Math.abs(lineX), 2) + Math.pow(Math.abs(lineY), 2))
    console.log(lineD)
    ratioLineXLineD = lineX / lineD
    ratioLineYLineD = lineY / lineD
    stepX = ratioLineXLineD
    stepY = ratioLineYLineD
    console.log(stepX+":"+stepY)

    var var2X1, var2Y1, var2X2, var2Y2

    var2X1 = varX1 + stepX
    var2X2 = varX2 + stepX
    var2Y1 = varY1 + stepY
    var2Y2 = varY2 + stepY
    varX1 = varX1 - stepX
    varY1 = varY1 - stepY

    waveResult = "M " + Math.floor(varX1) + " " + Math.floor(varY1) + " L " + Math.floor(varX2) + " " + Math.floor(varY2) + " M " + Math.floor(var2X1) + " " + Math.floor(var2Y1) + " L " + Math.floor(var2X2) + " " + Math.floor(var2Y2)

    return waveResult
}

function drawWave(varX1, varY1, varX2, varY2) {
    lineX = varX1 - varX2
    lineY = varY1 - varY2
    lineD = Math.sqrt(Math.pow(Math.abs(lineX), 2) + Math.pow(Math.abs(lineY), 2))
    console.log(lineD)
    pointCount = Math.floor(lineD / 10)
    if (pointCount % 2 != 0) {
        --pointCount
    }
    ratioLineXLineD = lineX / lineD
    ratioLineYLineD = lineY / lineD
    stepX = ratioLineXLineD * 10
    stepY = ratioLineYLineD * 10
    var z = 0, cordiX, cordiY
    waveResult = "M " + Math.floor(varX1) + " " + Math.floor(varY1) + " Q "

    for (i = 0; i <= pointCount; i++) {
        if (!even(i)) {
            z++;
            if (!even(z)) {
                cordiX = varX1 - stepY
                cordiY = varY1 + stepX
            } else {
                cordiX = varX1 + stepY
                cordiY = varY1 - stepX
            }
        } else {
            cordiX = varX1
            cordiY = varY1
        }
        if (i != 0) { waveResult += Math.floor(cordiX) + " " + Math.floor(cordiY) + " " }
        varX1 = varX1 - stepX
        varY1 = varY1 - stepY
    }
    waveResult += "L " + Math.floor(varX2) + " " + Math.floor(varY2)
    return waveResult
}

function drawWave2(varX1, varY1, varX2, varY2, varX3, varY3) {
    lineX = varX1 - varX2
    lineY = varY1 - varY2
    lineX2 = varX2 - varX3
    lineY2 = varY2 - varY3
    lineD = Math.sqrt(Math.pow(Math.abs(lineX), 2) + Math.pow(Math.abs(lineY), 2))
    lineD2 = Math.sqrt(Math.pow(Math.abs(lineX2), 2) + Math.pow(Math.abs(lineY2), 2))
    console.log(lineD+":"+lineD2)
    pointCount = Math.floor(lineD / 10)
    pointCount2 = Math.floor(lineD2 / 10)
    if (pointCount % 2 != 0) {
        --pointCount
    }
    if (pointCount2 % 2 != 0) {
        --pointCount2
    }
    ratioLineXLineD = lineX / lineD
    ratioLineYLineD = lineY / lineD
    stepX = ratioLineXLineD * 10
    stepY = ratioLineYLineD * 10
    ratioLineXLineD2 = lineX2 / lineD2
    ratioLineYLineD2 = lineY2 / lineD2
    stepX2 = ratioLineXLineD2 * 10
    stepY2 = ratioLineYLineD2 * 10
    var z = 0, cordiX, cordiY
    waveResult = "M " + Math.floor(varX1) + " " + Math.floor(varY1) + " Q "

    for (i = 0; i <= pointCount; i++) {
        if (!even(i)) {
            z++;
            if (!even(z)) {
                cordiX = varX1 - stepY
                cordiY = varY1 + stepX
            } else {
                cordiX = varX1 + stepY
                cordiY = varY1 - stepX
            }
        } else {
            cordiX = varX1
            cordiY = varY1
        }
        if (i != 0) { waveResult += Math.floor(cordiX) + " " + Math.floor(cordiY) + " " }
        varX1 = varX1 - stepX
        varY1 = varY1 - stepY
    }

    for (i = 0; i <= pointCount2; i++) {
        if (!even(i)) {
            z++;
            if (!even(z)) {
                cordiX2 = varX2 - stepY2
                cordiY2 = varY2 + stepX2
            } else {
                cordiX2 = varX2 + stepY2
                cordiY2 = varY2 - stepX2
            }
        } else {
            cordiX2 = varX2
            cordiY2 = varY2
        }
        if (i != 0) { waveResult += Math.floor(cordiX2) + " " + Math.floor(cordiY2) + " " }
        varX2 = varX2 - stepX2
        varY2 = varY2 - stepY2
    }
    waveResult += "L " + Math.floor(varX3) + " " + Math.floor(varY3)
    return waveResult
}
function drawWave3(varX1, varY1, varX2, varY2, varX3, varY3, varX4, varY4) {
    lineX = varX1 - varX2
    lineY = varY1 - varY2
    lineX2 = varX2 - varX3
    lineY2 = varY2 - varY3
    lineX3 = varX3 - varX4
    lineY3 = varY3 - varY4
    lineD = Math.sqrt(Math.pow(Math.abs(lineX), 2) + Math.pow(Math.abs(lineY), 2))
    lineD2 = Math.sqrt(Math.pow(Math.abs(lineX2), 2) + Math.pow(Math.abs(lineY2), 2))
    lineD3 = Math.sqrt(Math.pow(Math.abs(lineX3), 2) + Math.pow(Math.abs(lineY3), 2))
    console.log(lineD+":"+lineD2+":"+lineD3)
    pointCount = Math.floor(lineD / 10)
    pointCount2 = Math.floor(lineD2 / 10)
    pointCount3 = Math.floor(lineD3 / 10)
    if (pointCount % 2 != 0) {
        --pointCount
    }
    if (pointCount2 % 2 != 0) {
        --pointCount2
    }
    if (pointCount3 % 2 != 0) {
        --pointCount3
    }
    ratioLineXLineD = lineX / lineD
    ratioLineYLineD = lineY / lineD
    stepX = ratioLineXLineD * 10
    stepY = ratioLineYLineD * 10
    ratioLineXLineD2 = lineX2 / lineD2
    ratioLineYLineD2 = lineY2 / lineD2
    stepX2 = ratioLineXLineD2 * 10
    stepY2 = ratioLineYLineD2 * 10
    ratioLineXLineD3 = lineX3 / lineD3
    ratioLineYLineD3 = lineY3 / lineD3
    stepX3 = ratioLineXLineD3 * 10
    stepY3 = ratioLineYLineD3 * 10
    var z = 0, cordiX, cordiY
    waveResult = "M " + Math.floor(varX1) + " " + Math.floor(varY1) + " Q "

    for (i = 0; i <= pointCount; i++) {
        if (!even(i)) {
            z++;
            if (!even(z)) {
                cordiX = varX1 - stepY
                cordiY = varY1 + stepX
            } else {
                cordiX = varX1 + stepY
                cordiY = varY1 - stepX
            }
        } else {
            cordiX = varX1
            cordiY = varY1
        }
        if (i != 0) { waveResult += Math.floor(cordiX) + " " + Math.floor(cordiY) + " " }
        varX1 = varX1 - stepX
        varY1 = varY1 - stepY
    }

    for (i = 0; i <= pointCount2; i++) {
        if (!even(i)) {
            z++;
            if (!even(z)) {
                cordiX2 = varX2 - stepY2
                cordiY2 = varY2 + stepX2
            } else {
                cordiX2 = varX2 + stepY2
                cordiY2 = varY2 - stepX2
            }
        } else {
            cordiX2 = varX2
            cordiY2 = varY2
        }
        if (i != 0) { waveResult += Math.floor(cordiX2) + " " + Math.floor(cordiY2) + " " }
        varX2 = varX2 - stepX2
        varY2 = varY2 - stepY2
    }
    for (i = 0; i <= pointCount3; i++) {
        if (!even(i)) {
            z++;
            if (!even(z)) {
                cordiX3 = varX3 - stepY3
                cordiY3 = varY3 + stepX3
            } else {
                cordiX3 = varX3 + stepY3
                cordiY3 = varY3 - stepX3
            }
        } else {
            cordiX3 = varX3
            cordiY3 = varY3
        }
        if (i != 0) { waveResult += Math.floor(cordiX3) + " " + Math.floor(cordiY3) + " " }
        varX3 = varX3 - stepX3
        varY3 = varY3 - stepY3
    }
    waveResult += "L " + Math.floor(varX4) + " " + Math.floor(varY4)
    return waveResult
}

function drawWaveNew(varX1, varY1, varX2, varY2, varX3, varY3) {

    lineX = varX1 - varX3
    lineY = varY1 - varY3
    lineD = Math.sqrt(Math.pow(Math.abs(lineX), 2) + Math.pow(Math.abs(lineY), 2))
    console.log(lineD)
    pointCount = Math.floor(lineD / 10)
    if (pointCount % 2 != 0) {
        ++pointCount
    }

    waveResult = "M " + Math.floor(varX1) + " " + Math.floor(varY1) + " Q "

    cordiXpred = Math.pow((1-0), 2)*varX1 + 0*2*(1-0)*varX2 + Math.pow(0, 2)*varX3
    cordiYpred = Math.pow((1-0), 2)*varY1 + 0*2*(1-0)*varY2 + Math.pow(0, 2)*varY3
    var z=0, a=0, t=1/pointCount


    for(i=0; i<1; i+=t){
        cordiX = Math.pow((1-i), 2)*varX1 + i*2*(1-i)*varX2 + Math.pow(i, 2)*varX3
        cordiY = Math.pow((1-i), 2)*varY1 + i*2*(1-i)*varY2 + Math.pow(i, 2)*varY3
        
        a++
        if(even(a)){
            z++
            if(even(z)){
                cordiX *= 1.06
                cordiY *= 0.96
            } else {
                cordiX *= 0.96
                cordiY *= 1.06
            }
        }
        
        if (i != 0) { waveResult += Math.floor(cordiX) + " " + Math.floor(cordiY) + " " }
    }

    waveResult += "L " + Math.floor(varX3) + " " + Math.floor(varY3)
    return waveResult
}
function drawWaveNew2(varX1, varY1, varX2, varY2, varX3, varY3, varX4, varY4) {

    lineX = varX1 - varX4
    lineY = varY1 - varY4
    lineD = Math.sqrt(Math.pow(Math.abs(lineX), 2) + Math.pow(Math.abs(lineY), 2))
    console.log(lineD)
    pointCount = Math.floor(lineD / 10)
    if (pointCount % 2 != 0) {
        ++pointCount
    }

    waveResult = "M " + Math.floor(varX1) + " " + Math.floor(varY1) + " Q "

    cordiXpred = Math.pow((1-0), 2)*varX1 + 0*2*(1-0)*varX2 + Math.pow(0, 2)*varX3
    cordiYpred = Math.pow((1-0), 2)*varY1 + 0*2*(1-0)*varY2 + Math.pow(0, 2)*varY3
    var z=0, a=0, t=1/pointCount
    var sdvig = 0

    for(i=0; i<1; i+=t){
        cordiX = Math.pow((1-i), 3)*varX1 + 3*i*Math.pow((1-i), 2)*varX2 + 3*Math.pow(i,2)*(1-i)*varX3 + Math.pow(i, 3)*varX4
        cordiY = Math.pow((1-i), 3)*varY1 + 3*i*Math.pow((1-i), 2)*varY2 + 3*Math.pow(i,2)*(1-i)*varY3 + Math.pow(i, 3)*varY4
        
        var posY, posX
        sdvig += Math.PI/2
        a++
        if(even(a)){
            z++
            if(even(z)){
                cordiX *= 1.06
                cordiY *= 0.96
            } else {
                cordiX *= 0.96
                cordiY *= 1.06
            }
        }
        //posY = cordiY + Math.sin(sdvig)*10;
        //posX = cordiX + Math.sin(sdvig)*10;
        
        if (i != 0) { waveResult += Math.floor(cordiX) + " " + Math.floor(cordiY) + " " }
    }

    waveResult += "L " + Math.floor(varX4) + " " + Math.floor(varY4)
    return waveResult
}

block.addEventListener("contextmenu", cmHandler)
block.addEventListener("mousedown", mdHandler)
block.ondragstart = function () { return false }

$('.draggable').on('click', function () {
    removeDrawning('object')
    var groupScale
    switch (this.dataset.group) {
        case 'ball':
            groupScale = 15
            break;
        case 'cone':
            groupScale = 15
            break;
        case 'cone2':
            groupScale = 20
            break;
        case 'flag':
            groupScale = 30
            break;
        case 'beam':
            groupScale = 40
            break;
        case 'beam2':
            groupScale = 40
            break;
        case 'ring':
            groupScale = 40
            break;
        case 'stick':
            groupScale = 40
            break;
        case 'barrier':
            groupScale = 30
            break;
        case 'label':
            groupScale = 20
            break;
        case 'number':
            groupScale = 20
            break;
        case 'gateBig':
            groupScale = 100
            break;
        case 'gateSmall':
            groupScale = 60
            break;
        case 'logoLong':
            groupScale = 120
            break;
        case 'logoShort':
            groupScale = 120
            break;
        default:
            groupScale = 50
            break;
    }
    
    objImg.img = this.src.replace(window.location.origin, '')
    objImg.hght = 100/*this.dataset.height*/
    objImg.wdth = 100/*this.dataset.width*/
    objImg.dshght = 100/*this.dataset.height*/
    objImg.dswdth = 100/*this.dataset.width*/
    objImg.group = this.dataset.group
    objImg.id = this.id
    objImg.scale = groupScale
    block.addEventListener("crtobject", crtobjHandler)
    var event = new Event("crtobject")
    block.dispatchEvent(event)
})

function crtobjHandler() {    
    block.addEventListener("mousedown", mdcrtobjHandler)
    block.addEventListener("mouseup", mucrtobjHandler)
}

function mdcrtobjHandler(e) {
    svgMouseX = Math.floor((e.clientX - offset.left) * viewBoxParams[2] / $('#block').outerWidth())
    svgMouseY = Math.floor((e.clientY - offset.top) * viewBoxParams[3] / $('#block').outerHeight())
    var elementId = 'element-' + Id
    if (objImg.id == 'imgForLoad') { imgClass = "self" } else { imgClass = "" }
    findObj = block.querySelector('[data-group="' + objImg.group + '"]')
    if (findObj) {
        objImg.scale = findObj.dataset.scale
    }
    objImg.hght = Math.floor(objImg.hght * objImg.scale / 100)
    objImg.wdth = Math.floor(objImg.wdth * objImg.scale / 100)

    object = SVG.createElement("image", {
        "x": svgMouseX,
        "y": svgMouseY,
        "width": objImg.wdth,
        "height": objImg.hght,
        "class": imgClass,
        "data-width": objImg.dswdth,
        "data-height": objImg.dshght,
        "data-group": objImg.group,
        "transform": "rotate(0 " + (svgMouseX + objImg.wdth / 2) + " " + (svgMouseY - objImg.hght / 2) + ")",
        "style": "",
        "href": objImg.img,
        "id": elementId,
        "data-scale": objImg.scale
    })
    objects.appendChild(object)
    Id = Date.now()
}

function mucrtobjHandler() {
    block.removeEventListener("crtobject", mucrtobjHandler)
    block.removeEventListener("mousedown", mdcrtobjHandler)
    block.removeEventListener("mouseup", mucrtobjHandler)
}

function drtHandler() {
    block.removeEventListener("mousedown", mdHandler)
    block.addEventListener("mousedown", mddrtHandler)
}

function mddrtHandler(e) {
    var elementId = 'element-' + Id;
    var borderId = 'element-' + Id + 'B';

    var style = "stroke:" + blockBorderColor.value + ";stroke-width:" + blockBorder.value + ";stroke-dasharray:" + 0 + ";fill:" + blockColor.value +";"
    object = SVG.createElement("text", {
        "x": svgMouseX,
        "y": svgMouseY,
        "transform": "rotate(0 0 0)",
        "id": elementId,
        "data-scale": 50,
        "style": "font-size:" + textSize.value + ";fill:" + textColor.value + ";font-weight:" + textWeight.value + ";",
        "border-id":borderId,
    })
    object.innerHTML = document.getElementById("textForInsert").value
    objects.appendChild(object)
    var bbox = object.getBBox()
    block.getElementById(elementId).setAttribute("width", Math.floor(bbox.width))
    block.getElementById(elementId).setAttribute("height", Math.floor(bbox.height))
    if(withBlock.value != ''){
        figure = SVG.createElement("rect", { "x": svgMouseX-Math.floor(bbox.width)/8, "y": svgMouseY-Math.floor(bbox.height)/1.5*1.25, "width": Math.floor(bbox.width)*1.25, "height": Math.floor(bbox.height)*1.25, "style": style, "id": borderId })
        figures.appendChild(figure)
    }
    Id = Date.now()
    block.removeEventListener("mousedown", mddrtHandler)
    block.addEventListener("mousedown", mdHandler)
}

function drlHandler() {
    block.removeEventListener("mousedown", mdHandler)
    block.addEventListener("mousedown", mddrlHandler)
}

function mddrlHandler(e) {
    var elementId = 'element-' + Id
    var style = "fill:transparent;", color
    if (stroke.value == 'transparent') {
        color = strokeValueOld
    } else {
        color = stroke.value
    }
    if (marker.value == "arrow") {
        markerType = "url(" + color + "arrow)"
    } else {
        markerType = "none"
    }
    Id = Date.now()
    mX = Math.floor(svgMouseX)
    mY = Math.floor(svgMouseY)
    Qx2 = mX + 80
    Qy2 = mY
    optLine = null
    switch (lineType) {
        case 1:
            line = SVG.createElement("path", { "d": `M ${mX} ${mY} L ${Qx2} ${Qy2}`, "style": style, "id": elementId, "marker-end": markerType, "stroke": color, "stroke-width": strokeWidth.value, "stroke-dasharray": strokeDasharray.value })
            optLine = SVG.createElement("path", { "d": `M ${mX} ${mY} L ${Qx2} ${Qy2}`, "style": style, "id": `${elementId}-opt`, "marker-end": '', "stroke": 'transparent', "stroke-width": strokeWidth.value*20, "stroke-dasharray": strokeDasharray.value })
            break
        case 2:
            Qx1 = mX + 40
            Qy1 = mY - 40
            line = SVG.createElement("path", { "d": `M ${mX} ${mY} Q ${Qx1} ${Qy1} ${Qx2} ${Qy2}`, "style": style, "id": elementId, "marker-end": markerType, "stroke": color, "stroke-width": strokeWidth.value, "stroke-dasharray": strokeDasharray.value })
            break
        case 3:
            line = SVG.createElement("path", { "d": `M ${mX} ${mY} L ${Qx2} ${Qy2}`, "style": style, "id": elementId, "data-wave": 1, "marker-end": markerType, "stroke": color, "stroke-width": strokeWidth.value, "stroke-dasharray": strokeDasharray.value })
            break
        case 4: //Волна с одной точкой
            Qx1 = mX + 40
            Qy1 = mY - 40
            line = SVG.createElement("path", { "d": `M ${mX} ${mY} Q ${Qx1} ${Qy1} ${Qx2} ${Qy2}`, "style": style, "id": elementId, "data-wave": 2, "marker-end": markerType, "stroke": color, "stroke-width": strokeWidth.value, "stroke-dasharray": strokeDasharray.value })
            break
        case 5:
            Qx1 = mX + 30
            Qy1 = mY - 40
            Qx3 = mX + 60
            Qy3 = mY + 10
            line = SVG.createElement("path", { "d": `M ${mX} ${mY} C ${Qx1} ${Qy1} ${Qx3} ${Qy3} ${Qx2} ${Qy2}`, "style": style, "id": elementId, "marker-end": markerType, "stroke": color, "stroke-width": strokeWidth.value, "stroke-dasharray": strokeDasharray.value })
            break
        case 6: //Волна с двумя точками
            Qx1 = mX + 30
            Qy1 = mY - 40
            Qx3 = mX + 60
            Qy3 = mY + 10
            line = SVG.createElement("path", { "d": `M ${mX} ${mY} С ${Qx1} ${Qy1} ${Qx3} ${Qy3} ${Qx2} ${Qy2}`, "style": style, "id": elementId, "data-wave": 3, "marker-end": markerType, "stroke": color, "stroke-width": strokeWidth.value, "stroke-dasharray": strokeDasharray.value })
            break
        case 7:
            line = SVG.createElement("path", { "d": `M ${mX} ${mY} L ${Qx2} ${Qy2} M ${mX} ${mY} L ${Qx2} ${Qy2}`, "style": style, "id": elementId, "data-double": 1, "marker-end": markerType, "stroke": color, "stroke-width": strokeWidth.value, "stroke-dasharray": strokeDasharray.value })
            break
    }

    lines.appendChild(line)
    if (optLine) {lines.appendChild(optLine)}
    drag = block.getElementById(elementId)
    block.addEventListener("mouseup", mudrlHandler)
}

function mudrlHandler(e) {
    block.removeEventListener("mousedown", mddrlHandler)
    switch (lineType) {
        case 1:
        case 2:
            block.removeEventListener("mouseup", mudrlHandler)
            block.addEventListener("mousedown", mdHandler)
            break
        case 3:
            block.removeEventListener("mouseup", mudrlHandler)
            drag.setAttribute("d", drawWave(mX, mY, Qx2, Qy2))
            block.addEventListener("mousedown", mdHandler)
            break
        case 4:
            block.removeEventListener("mouseup", mudrlHandler)
            drag.setAttribute("d", drawWave2(mX, mY, Qx1, Qy1, Qx2, Qy2))
            block.addEventListener("mousedown", mdHandler)
            break
        case 5:
            block.removeEventListener("mouseup", mudrlHandler)
            block.addEventListener("mousedown", mdHandler)
            break
        case 6:
            block.removeEventListener("mouseup", mudrlHandler)
            drag.setAttribute("d", drawWave3(mX, mY, Qx1, Qy1, Qx2, Qy2, Qx3, Qy3))
            block.addEventListener("mousedown", mdHandler)
            break
        case 7:
            block.removeEventListener("mouseup", mudrlHandler)
            drag.setAttribute("d", drawDoubleLine(mX, mY, Qx2, Qy2))
            block.addEventListener("mousedown", mdHandler)
            break
    }

}

function mcdrlHandler(e) {
    block.removeEventListener("mouseup", mudrlHandler)
    block.addEventListener("mousedown", mdHandler)
}

function drcHandler() {
    plane.classList.add("figureCreation")
    block.removeEventListener("mousedown", mdHandler)
    block.addEventListener("mousedown", mddrcHandler)
}

function mddrcHandler(e) {
    var elementId = 'element-' + Id
    
    var style = "stroke:" + strokeFL.value + ";stroke-width:" + strokeWidthFL.value + ";stroke-dasharray:" + strokeDasharrayFL.value + ";fill:" + fillFL.value
    Id = Date.now()
    mX = svgMouseX
    mY = svgMouseY
    switch (figureType) {
        case 1:
            figure = SVG.createElement("circle", { "cx": mX, "cy": mY, "r": 15, "style": style, "id": elementId })
            figures.appendChild(figure)
            break
        case 2:
            figure = SVG.createElement("rect", { "x": mX, "y": mY, "width": 30, "height": 30, "style": style, "id": elementId })
            figures.appendChild(figure)
            break
        case 3:
            mX1 = mX + 29
            Qx1 = mX - 1
            Qx2 = mX + 30
            Qy2 = mY + 29
            figure = SVG.createElement("polygon", { "points": `${mX},${mY} ${mX1},${mY} ${Qx2},${Qy2} ${Qx1},${Qy2}`, "style": style, "id": elementId })
            figures.appendChild(figure)
            break
        case 4:
            figure = SVG.createElement("ellipse", { "cx": mX, "cy": mY, "rx": 30, "ry": 15, "style": style, "id": elementId })
            figures.appendChild(figure)
            break
        case 5:
            mX1 = mX + 20
            Qx1 = mX - 6
            Qx2 = mX + 26
            Qy2 = mY + 20
            Qx3 = mX + 11
            Qy3 = mY + 30
            figure = SVG.createElement("polygon", { "points": `${mX},${mY} ${mX1},${mY} ${Qx2},${Qy2} ${Qx3},${Qy3} ${Qx1},${Qy2}`, "style": style, "id": elementId })
            figures.appendChild(figure)
            break
        case 6:
            mX1 = mX + 29
            Qx1 = mX - 1
            Qy1 = mY + 29
            figure = SVG.createElement("polygon", { "points": `${mX},${mY} ${mX1},${mY} ${Qx1},${Qy1}`, "style": style, "id": elementId })
            figures.appendChild(figure)
            break
    }
    drag = block.getElementById(elementId)
    block.addEventListener("mouseup", mudrcHandler)
}

function mudrcHandler(e) {    
    block.removeEventListener("mousedown", mddrcHandler)
    block.removeEventListener("mouseup", mudrcHandler)
    plane.classList.remove("figureCreation")
    block.addEventListener("mousedown", mdHandler)
};

function checkPoint(poInt) {
    return poInt == this
}

function mdHandler(e) {
    drag = e.srcElement;

    if (e.which == 1) {
        block.addEventListener("mouseup", Select)
        if ((drag instanceof SVGCircleElement) || (drag instanceof SVGEllipseElement)) {
            drag.crdX = drag.getAttribute("cx")
            drag.crdY = drag.getAttribute("cy")
            drag.clientX = svgMouseX
            drag.clientY = svgMouseY
            block.addEventListener("mousemove", mmHandler)
            block.addEventListener("mouseup", muHandler)
        }
        if (drag instanceof SVGRectElement) {
            drag.crdX = drag.getAttribute("x")
            drag.crdY = drag.getAttribute("y")
            drag.clientX = svgMouseX
            drag.clientY = svgMouseY
            if (drag.id == '') {
                drag.object = drag.getAttribute("data-object")
                block.addEventListener("mousemove", mmRHandler)
                block.addEventListener("mouseup", muRHandler)
            } else {
                block.addEventListener("mousemove", mmObjHandler)
                block.addEventListener("mouseup", muObjHandler)
            }
        }
        if ((drag instanceof SVGImageElement) && (drag.id != 'plane')) {
            drag.crdX = drag.getAttribute("x")
            drag.crdY = drag.getAttribute("y")
            drag.clientX = svgMouseX
            drag.clientY = svgMouseY
            drag.transFull = drag.getAttribute("transform").split(" ")
            drag.transAngel = drag.transFull[0]
            objectsList = document.querySelectorAll('image')
            xPoints = []
            yPoints = []
            objectsList.forEach(function (object) {
                if ((object.id != "plane") && (object.id != drag.id)) {
                    var x = [], y = []
                    x[0] = object.getAttribute("x")
                    y[0] = object.getAttribute("y")
                    x[1] = +object.getAttribute("x") + +object.getAttribute("width")
                    y[1] = +object.getAttribute("y") + +object.getAttribute("height")
                    x.forEach(function (x) {
                        if (!xPoints.some(checkPoint, x)) {
                            xPoints.push(x)
                        }
                    })
                    y.forEach(function (y) {
                        if (!yPoints.some(checkPoint, y)) {
                            yPoints.push(y)
                        }
                    })
                }
            })
            block.addEventListener("mousemove", mmObjHandler)
            block.addEventListener("mouseup", muObjHandler)
        }
        if (drag instanceof SVGTextElement) {
            drag.crdX = drag.getAttribute("x")
            drag.crdY = drag.getAttribute("y")
            drag.transFull = drag.getAttribute("transform").split(" ")
            drag.transAngel = drag.transFull[0]
            drag.clientX = svgMouseX
            drag.clientY = svgMouseY
            /*if(drag.getAttribute("border-id")){
                let border_id = drag.getAttribute("border-id");
                block.getElementById(border_id).setAttribute('x', drag.getAttribute("x")-drag.getAttribute("width")/8);
                block.getElementById(border_id).setAttribute('y', drag.getAttribute("y")-drag.getAttribute("height")/1.5*1.2);
            }*/
            block.addEventListener("mousemove", mmTextHandler)
            block.addEventListener("mouseup", muTextHandler)
        }
    }
    if (e.which == 2) {
        block.removeEventListener("mouseup", Select)
        if (([SVGPolygonElement, SVGPathElement, SVGTextElement, SVGRectElement, SVGCircleElement, SVGEllipseElement, SVGImageElement].some(item => drag instanceof item)) && (drag.id != 'plane') && (drag.id != '')) {
            var parent = drag.parentNode
            points = document.querySelectorAll('[data-object="' + drag.id + '"]')
            points.forEach(function (point) {
                var pointparent = point.parentNode
                pointparent.removeChild(point)
            })
            parent.removeChild(drag)
        }
    }
}

function mmHandler(e) {
    unSelect()
    block.removeEventListener("mouseup", Select)
    if (drag.getAttribute("data-type") == 'rotate') {
        object = document.getElementById(drag.dataset.object)
        if (object instanceof SVGTextElement) {
            var x = +object.getAttribute("x"), y = +object.getAttribute("y"), w = +object.getAttribute("width"), h = +object.getAttribute("height")
            xCenter = Math.floor(x + w / 2)
            yCenter = Math.floor(y - h / 2)
        } else {
            var x = +object.getAttribute("x"), y = +object.getAttribute("y"), w = +object.dataset.width, h = +object.dataset.height
            xCenter = Math.floor(x + w / 2)
            yCenter = Math.floor(y + h / 2)
        }
        xPoint = svgMouseX - (drag.clientX - drag.crdX)
        yPoint = svgMouseY - (drag.clientY - drag.crdY)
        xLenght = xPoint - xCenter
        yLenght = yPoint - yCenter
        angel = -(Math.atan(xLenght / yLenght) * 360 / Math.PI)
        object.setAttribute("transform", "rotate(" + angel + " " + xCenter + " " + yCenter + ")")
        points = document.querySelectorAll('[data-object="' + object.id + '"]')
        points.forEach(function (point) {
            point.setAttribute("transform", "rotate(" + angel + " " + xCenter + " " + yCenter + ")")
        })
    } else {
        drag.setAttribute("cx", svgMouseX - (drag.clientX - drag.crdX))
        drag.setAttribute("cy", svgMouseY - (drag.clientY - drag.crdY))
        if (drag.id == '') {
            points = document.querySelectorAll('[data-object="' + drag.dataset.object + '"]')

            target = block.getElementById(drag.dataset.object)
            optPathTarget = block.getElementById(`${drag.dataset.object}-opt`)

            if (points.length == 5 && (target instanceof SVGPolygonElement)) {
                d = { x1: points[0].getAttribute("cx"), y1: points[0].getAttribute("cy"), x2: points[1].getAttribute("cx"), y2: points[1].getAttribute("cy"), x3: points[2].getAttribute("cx"), y3: points[2].getAttribute("cy"), x4: points[3].getAttribute("cx"), y4: points[3].getAttribute("cy"), x5: points[4].getAttribute("cx"), y5: points[4].getAttribute("cy") }
                switch (drag) {
                    case points[0]:
                        d.x1 = drag.getAttribute("cx")
                        d.y1 = drag.getAttribute("cy")
                        break
                    case points[1]:
                        d.x2 = drag.getAttribute("cx")
                        d.y2 = drag.getAttribute("cy")
                        break
                    case points[2]:
                        d.x3 = drag.getAttribute("cx")
                        d.y3 = drag.getAttribute("cy")
                        break
                    case points[3]:
                        d.x4 = drag.getAttribute("cx")
                        d.y4 = drag.getAttribute("cy")
                        break
                    case points[4]:
                        d.x5 = drag.getAttribute("cx")
                        d.y5 = drag.getAttribute("cy")
                        break
                }
                target.setAttribute("points", `${d.x1},${d.y1} ${d.x2},${d.y2} ${d.x3},${d.y3} ${d.x4},${d.y4} ${d.x5},${d.y5}`)
            }
            if (points.length == 4 && (target instanceof SVGPolygonElement)) {
                d = { x1: points[0].getAttribute("cx"), y1: points[0].getAttribute("cy"), x2: points[1].getAttribute("cx"), y2: points[1].getAttribute("cy"), x3: points[2].getAttribute("cx"), y3: points[2].getAttribute("cy"), x4: points[3].getAttribute("cx"), y4: points[3].getAttribute("cy") }
                switch (drag) {
                    case points[0]:
                        d.x1 = drag.getAttribute("cx")
                        d.y1 = drag.getAttribute("cy")
                        break
                    case points[1]:
                        d.x2 = drag.getAttribute("cx")
                        d.y2 = drag.getAttribute("cy")
                        break
                    case points[2]:
                        d.x3 = drag.getAttribute("cx")
                        d.y3 = drag.getAttribute("cy")
                        break
                    case points[3]:
                        d.x4 = drag.getAttribute("cx")
                        d.y4 = drag.getAttribute("cy")
                        break
                }
                target.setAttribute("points", `${d.x1},${d.y1} ${d.x2},${d.y2} ${d.x3},${d.y3} ${d.x4},${d.y4}`)
            }
            if (points.length == 3 && (target instanceof SVGPolygonElement)) {
                d = { x1: points[0].getAttribute("cx"), y1: points[0].getAttribute("cy"), x2: points[1].getAttribute("cx"), y2: points[1].getAttribute("cy"), x3: points[2].getAttribute("cx"), y3: points[2].getAttribute("cy") }
                switch (drag) {
                    case points[0]:
                        d.x1 = drag.getAttribute("cx")
                        d.y1 = drag.getAttribute("cy")
                        break
                    case points[1]:
                        d.x2 = drag.getAttribute("cx")
                        d.y2 = drag.getAttribute("cy")
                        break
                    case points[2]:
                        d.x3 = drag.getAttribute("cx")
                        d.y3 = drag.getAttribute("cy")
                        break
                }
                target.setAttribute("points", `${d.x1},${d.y1} ${d.x2},${d.y2} ${d.x3},${d.y3}`)
            }
            if (points.length == 4 && (target instanceof SVGPathElement)) {
                d = { x1: points[0].getAttribute("cx"), y1: points[0].getAttribute("cy"), x2: points[1].getAttribute("cx"), y2: points[1].getAttribute("cy"), x3: points[2].getAttribute("cx"), y3: points[2].getAttribute("cy"), x4: points[3].getAttribute("cx"), y4: points[3].getAttribute("cy") }
                switch (drag) {
                    case points[0]:
                        d.x1 = drag.getAttribute("cx")
                        d.y1 = drag.getAttribute("cy")
                        break
                    case points[1]:
                        d.x2 = drag.getAttribute("cx")
                        d.y2 = drag.getAttribute("cy")
                        break
                    case points[2]:
                        d.x3 = drag.getAttribute("cx")
                        d.y3 = drag.getAttribute("cy")
                        break
                    case points[3]:
                        d.x4 = drag.getAttribute("cx")
                        d.y4 = drag.getAttribute("cy")
                        break
                }
                if(target.hasAttribute("data-wave")){
                    target.setAttribute("d", `M ${d.x1} ${d.y1} ${d.x2} ${d.y2} ${d.x3} ${d.y3} ${d.x4} ${d.y4}`)
                } else {
                    target.setAttribute("d", `M ${d.x1} ${d.y1} C ${d.x2} ${d.y2} ${d.x3} ${d.y3} ${d.x4} ${d.y4}`)
                }
                
            }
            if (points.length == 3 && (target instanceof SVGPathElement)) {
                d = { x1: points[0].getAttribute("cx"), y1: points[0].getAttribute("cy"), x2: points[1].getAttribute("cx"), y2: points[1].getAttribute("cy"), x3: points[2].getAttribute("cx"), y3: points[2].getAttribute("cy") }
                switch (drag) {
                    case points[0]:
                        d.x1 = drag.getAttribute("cx")
                        d.y1 = drag.getAttribute("cy")
                        break
                    case points[1]:
                        d.x2 = drag.getAttribute("cx")
                        d.y2 = drag.getAttribute("cy")
                        break
                    case points[2]:
                        d.x3 = drag.getAttribute("cx")
                        d.y3 = drag.getAttribute("cy")
                        break
                }
                if(target.hasAttribute("data-wave")){
                    target.setAttribute("d", `M ${d.x1} ${d.y1} ${d.x2} ${d.y2} ${d.x3} ${d.y3}`)
                } else {
                    target.setAttribute("d", `M ${d.x1} ${d.y1} Q ${d.x2} ${d.y2} ${d.x3} ${d.y3}`)
                }
            }
            if ((points.length == 2) && (target instanceof SVGPathElement)) {
                d = { x1: points[0].getAttribute("cx"), y1: points[0].getAttribute("cy"), x2: points[1].getAttribute("cx"), y2: points[1].getAttribute("cy") }
                switch (drag) {
                    case points[0]:
                        d.x1 = drag.getAttribute("cx")
                        d.y1 = drag.getAttribute("cy")
                        break
                    case points[1]:
                        d.x2 = drag.getAttribute("cx")
                        d.y2 = drag.getAttribute("cy")
                        break
                }
                if(target.hasAttribute("data-double")) {
                    target.setAttribute("d", `M ${d.x1} ${d.y1} L ${d.x2} ${d.y2} M ${d.x1} ${d.y1} L ${d.x2} ${d.y2}`)
                } else {
                    target.setAttribute("d", `M ${d.x1} ${d.y1} L ${d.x2} ${d.y2}`)
                    if (optPathTarget) {
                        optPathTarget.setAttribute("d", `M ${d.x1} ${d.y1} L ${d.x2} ${d.y2}`)
                    }
                }
            }
            if ((points.length == 2) && (target instanceof SVGEllipseElement)) {
                cy = +target.getAttribute("cy")
                cx = +target.getAttribute("cx")
                switch (drag) {
                    case points[0]:
                        rx = drag.getAttribute("cx") - cx
                        if (rx < 15) {
                            rx = 15
                            cx = cx + 15
                            drag.setAttribute("cx", cx)
                        }
                        drag.setAttribute("cy", cy)
                        target.setAttribute("rx", rx)
                        break
                    case points[1]:
                        ry = drag.getAttribute("cy") - cy
                        if (ry < 15) {
                            ry = 15
                            cy = cy + 15
                            drag.setAttribute("cy", cy)
                        }
                        drag.setAttribute("cx", cx)
                        target.setAttribute("ry", ry)
                        break
                }
            }
            if (points.length == 1) {
                cy = +target.getAttribute("cy")
                cx = +target.getAttribute("cx")
                r = drag.getAttribute("cx") - cx
                if (r < 15) {
                    r = 15
                    cx = cx + 15
                    drag.setAttribute("cx", cx)
                }
                drag.setAttribute("cy", cy)
                target.setAttribute("r", r)
            }
        }
    }
}

function muHandler(e) {
    block.removeEventListener("mousemove", mmHandler)
    block.removeEventListener("mouseup", muHandler)
    if (block.getElementById(drag.dataset.object) != null) {
        if (block.getElementById(drag.dataset.object).dataset.wave == 1) {
            block.getElementById(drag.dataset.object).setAttribute("d", drawWave(d.x1, d.y1, d.x2, d.y2))
        }
        if (block.getElementById(drag.dataset.object).dataset.wave == 2) {
            block.getElementById(drag.dataset.object).setAttribute("d", drawWave2(d.x1, d.y1, d.x2, d.y2, d.x3, d.y3))
        }
        if (block.getElementById(drag.dataset.object).dataset.wave == 3) {
            block.getElementById(drag.dataset.object).setAttribute("d", drawWave3(d.x1, d.y1, d.x2, d.y2, d.x3, d.y3, d.x4, d.y4))
        }
        if (block.getElementById(drag.dataset.object).dataset.double == 1) {
            block.getElementById(drag.dataset.object).setAttribute("d", drawDoubleLine(d.x1, d.y1, d.x2, d.y2))
        }
    }
}

function mmObjHandler(e) {
    unSelect()
    block.removeEventListener("mouseup", Select)
    drag.setAttribute("filter", "url(#f3)")
    drag.setAttribute("x", Math.floor(svgMouseX - (drag.clientX - drag.crdX)))
    drag.setAttribute("y", Math.floor(svgMouseY - (drag.clientY - drag.crdY)))
    if (drag instanceof SVGImageElement) {
        $(drag).appendTo('#objects') // переместить эллемент на верхний слой
        drag.setAttribute("transform", "rotate(0 0 0)")
        var x = [], y = []
        x[0] = drag.getAttribute("x")
        y[0] = drag.getAttribute("y")
        x[1] = +drag.getAttribute("x") + +drag.getAttribute("width")
        y[1] = +drag.getAttribute("y") + +drag.getAttribute("height")
        if (xPoints.some(checkPoint, x[0])) {
            xLine.setAttribute("x1", x[0])
            xLine.setAttribute("x2", x[0])
        } else {
            xLine.setAttribute("x1", "-1")
            xLine.setAttribute("x2", "-1")
        }
        if (yPoints.some(checkPoint, y[0])) {
            yLine.setAttribute("y1", y[0])
            yLine.setAttribute("y2", y[0])
        } else {
            yLine.setAttribute("y1", "-1")
            yLine.setAttribute("y2", "-1")
        }
        if (xPoints.some(checkPoint, x[1])) {
            xLine2.setAttribute("x1", x[1])
            xLine2.setAttribute("x2", x[1])
        } else {
            xLine2.setAttribute("x1", "-2400")
            xLine2.setAttribute("x2", "-2400")
        }
        if (yPoints.some(checkPoint, y[1])) {
            yLine2.setAttribute("y1", y[1])
            yLine2.setAttribute("y2", y[1])
        } else {
            yLine2.setAttribute("y1", "-1600")
            yLine2.setAttribute("y2", "-1600")
        }
        points = document.querySelectorAll('[data-object="' + drag.id + '"]')
        points.forEach(function (point) {
            point.setAttribute("transform", "rotate(0 0 0)")
            point.setAttribute("x", Math.floor(svgMouseX - (drag.clientX - drag.crdX)))
            point.setAttribute("y", Math.floor(svgMouseY - (drag.clientY - drag.crdY)))
        })
        var x = +drag.getAttribute("x"), y = +drag.getAttribute("y"), w = +drag.getAttribute("width"), h = +drag.getAttribute("height")
        xCenter = Math.floor(x + w / 2)
        yCenter = Math.floor(y + h / 2)
        drag.setAttribute("transform", drag.transAngel + " " + xCenter + " " + yCenter + ")")
        points.forEach(function (point) {
            point.setAttribute("transform", drag.transAngel + " " + xCenter + " " + yCenter + ")")
        })
    }
}

function muObjHandler(e) {
    drag.removeAttribute("filter", "url(#f3)")
    block.removeEventListener("mousemove", mmObjHandler)
    block.removeEventListener("mouseup", muObjHandler)
    xLine.setAttribute("x1", "-1")
    xLine.setAttribute("x2", "-1")
    yLine.setAttribute("y1", "-1")
    yLine.setAttribute("y2", "-1")
    xLine2.setAttribute("x1", "-2400")
    xLine2.setAttribute("x2", "-2400")
    yLine2.setAttribute("y1", "-1600")
    yLine2.setAttribute("y2", "-1600")
}

function mmRHandler(e) {
    unSelect()
    block.removeEventListener("mouseup", Select)
    resizeableObject = document.getElementById(drag.object)
    if (resizeableObject instanceof SVGImageElement) {
        point = selects.querySelector('[data-object="' + drag.object + '"]')
        if (point != null) { point.remove() }
        ratioObject = resizeableObject.getAttribute("height") / resizeableObject.getAttribute("width")
        resizeableObject.w = svgMouseX - (drag.clientX - drag.crdX) - resizeableObject.getAttribute("x")
        resizeableObject.h = (svgMouseX - (drag.clientX - drag.crdX) - resizeableObject.getAttribute("x")) * ratioObject
        if (resizeableObject.w < 30) {
            resizeableObject.w = 30
            resizeableObject.h = resizeableObject.w * ratioObject
        }
        drag.setAttribute("y", +resizeableObject.getAttribute("y") + resizeableObject.h)
        drag.setAttribute("x", +resizeableObject.getAttribute("x") + resizeableObject.w)
        resizeableObject.setAttribute("width", resizeableObject.w); resizeableObject.setAttribute("height", resizeableObject.h)
        point = SVG.createElement("rect", {
            "x": resizeableObject.getAttribute("x"),
            "y": resizeableObject.getAttribute("y"),
            "width": resizeableObject.getAttribute("width"),
            "height": resizeableObject.getAttribute("height"),
            "transform": resizeableObject.getAttribute("transform"),
            "stroke-dasharray": "10",
            "stroke": "black",
            "fill": "transparent",
            "data-object": resizeableObject.getAttribute("id")
        });
        selects.appendChild(point)
    } else {
        resizeableObject.w = svgMouseX - (drag.clientX - drag.crdX) - resizeableObject.getAttribute("x")
        resizeableObject.h = svgMouseY - (drag.clientY - drag.crdY) - resizeableObject.getAttribute("y")
        if (resizeableObject.w < 30) {
            resizeableObject.w = 30
        }
        if (resizeableObject.h < 30) {
            resizeableObject.h = 30
        }
        drag.setAttribute("y", +resizeableObject.getAttribute("y") + resizeableObject.h)
        drag.setAttribute("x", +resizeableObject.getAttribute("x") + resizeableObject.w)
        resizeableObject.setAttribute("width", resizeableObject.w); resizeableObject.setAttribute("height", resizeableObject.h)
    }
}

function muRHandler(e) {
    block.removeEventListener("mousemove", mmRHandler)
    block.removeEventListener("mouseup", muRHandler)
}

function mmTextHandler(e) {
    unSelect()
    block.removeEventListener("mouseup", Select)
    var x = +drag.getAttribute("x"), y = +drag.getAttribute("y"), w = +drag.getAttribute("width"), h = +drag.getAttribute("height")
    xCenter = Math.floor(x + w / 2)
    yCenter = Math.floor(y - h / 2)
    drag.setAttribute("transform", drag.transAngel + " " + xCenter + " " + yCenter + ")")
    drag.setAttribute("x", Math.floor(svgMouseX - (drag.clientX - drag.crdX)))
    drag.setAttribute("y", Math.floor(svgMouseY - (drag.clientY - drag.crdY)))
    drag.setAttribute("filter", "url(#f3)")
    if(drag.getAttribute("border-id")){
        let border_id = drag.getAttribute("border-id");
        block.getElementById(border_id).setAttribute('x', drag.getAttribute("x")-drag.getBBox().width/8);
        block.getElementById(border_id).setAttribute('y', drag.getAttribute("y")-drag.getBBox().height/1.5*1.25);
        //console.log(drag.getBBox());
        block.getElementById(border_id).setAttribute('width', drag.getBBox().width*1.25);
        block.getElementById(border_id).setAttribute('height', drag.getBBox().height*1.25);
    }
}

function muTextHandler(e) {
    block.removeEventListener("mousemove", mmTextHandler)
    block.removeEventListener("mouseup", muTextHandler)
    drag.removeAttribute("filter")
}

function cmHandler(e) {
    e.preventDefault()
}

function unSelect() {
    if (drag.id != 'block') {
        if ((drag.dataset.select == 1) && (drag instanceof SVGImageElement)) {
            drag.dataset.select = 0
            points = document.querySelectorAll('[data-object="' + drag.id + '"]')
            points.forEach(function (point) {
                point.remove()
            })
            points = objects.querySelectorAll('[data-select="1"]')
            if (points.length == 1) {
                groupResize.style.display = "flex"
                numSizeGroup.innerHTML = points[0].dataset.scale
            } else {
                groupResize.style.display = "none"
            }
        } else if ((drag.dataset.select == 1) && [SVGPolygonElement, SVGPathElement, SVGTextElement, SVGRectElement, SVGCircleElement, SVGEllipseElement].some(item => drag instanceof item)) {
            drag.dataset.select = 0
            points = document.querySelectorAll('[data-object="' + drag.id + '"]')
            points.forEach(function (point) {
                point.remove()
            })
        }
    }
}

function Select() {

    pathId = drag.getAttribute('id')
    if (pathId.includes('opt')) {
        drag.dataset.select = 0
        drag = block.getElementById( pathId.replace('-opt', '') )
    }

    if (drag.id != 'block') {
        if ((drag.dataset.select == 1) && (drag instanceof SVGImageElement)) {
            drag.dataset.select = 0
            points = document.querySelectorAll('[data-object="' + drag.id + '"]')
            points.forEach(function (point) {
                point.remove()
            })
            points = objects.querySelectorAll('[data-select="1"]')
            if (points.length == 1) {
                groupResize.style.display = "flex"
                numSizeGroup.innerHTML = points[0].dataset.scale
            } else {
                groupResize.style.display = "none"
            }
        } else if ((drag.dataset.select == 1) && [SVGPolygonElement, SVGPathElement, SVGTextElement, SVGRectElement, SVGCircleElement, SVGEllipseElement].some(item => drag instanceof item)) {
            drag.dataset.select = 0
            points = document.querySelectorAll('[data-object="' + drag.id + '"]')
            points.forEach(function (point) {
                point.remove()
            })
        } else {
            if (drag.id != 'plane') {
                document.querySelectorAll('[data-select]').forEach(item => item.removeAttribute('data-select'))
                selects.innerHTML = ''
                dots.innerHTML = ''
                groupResize.style.display = 'none'
                drag.dataset.select = 1
            }
            if (drag instanceof SVGTextElement) {
                rotatePoint = SVG.createElement("circle", {
                    "cx": +drag.getAttribute("x") + drag.getAttribute("width") / 2,
                    "cy": drag.getAttribute("y") - drag.getAttribute("height") / 2,
                    "r": 3,
                    "stroke": "red",
                    "fill": "white",
                    "transform": drag.getAttribute("transform"),
                    "data-object": drag.getAttribute("id"),
                    "data-type": "rotate"
                })
                dots.appendChild(rotatePoint)
            }
            if ((drag instanceof SVGImageElement) && (drag.id != 'plane') && (!drag.classList.contains('self'))) {
                point = SVG.createElement("rect", {
                    "x": drag.getAttribute("x"),
                    "y": drag.getAttribute("y"),
                    "width": drag.getAttribute("width"),
                    "height": drag.getAttribute("height"),
                    "transform": drag.getAttribute("transform"),
                    "stroke-dasharray": "10",
                    "stroke": "black",
                    "fill": "transparent",
                    "data-object": drag.getAttribute("id")
                })
                rotatePoint = SVG.createElement("circle", {
                    "cx": +drag.getAttribute("x") + drag.getAttribute("width") / 2,
                    "cy": drag.getAttribute("y"),
                    "r": 3,
                    "stroke": "red",
                    "fill": "white",
                    "transform": drag.getAttribute("transform"),
                    "data-object": drag.getAttribute("id"),
                    "data-type": "rotate"
                })
                selects.appendChild(point)
                dots.appendChild(rotatePoint)
                points = objects.querySelectorAll('[data-select="1"]')
                if (points.length == 1) {
                    groupResize.style.display = "flex"
                    numSizeGroup.innerHTML = points[0].dataset.scale
                } else {
                    groupResize.style.display = "none"
                }
            }
            if ((drag instanceof SVGImageElement) && (drag.id != 'plane') && (drag.classList.contains('self'))) {
                var pointX = Number(drag.getAttribute("x")) + Number(drag.getAttribute("width"))
                var pointY = Number(drag.getAttribute("y")) + Number(drag.getAttribute("height"))
                point = SVG.createElement("rect", {
                    "x": pointX,
                    "y": pointY,
                    "width": 5,
                    "height": 5,
                    "stroke": "red",
                    "fill": "red",
                    "data-object": drag.getAttribute("id")
                })
                dots.appendChild(point)
                point = SVG.createElement("rect", {
                    "x": drag.getAttribute("x"),
                    "y": drag.getAttribute("y"),
                    "width": drag.getAttribute("width"),
                    "height": drag.getAttribute("height"),
                    "transform": drag.getAttribute("transform"),
                    "stroke-dasharray": "10",
                    "stroke": "black",
                    "fill": "transparent",
                    "data-object": drag.getAttribute("id")
                })
                selects.appendChild(point)
            }
            if ((drag instanceof SVGRectElement) && (drag.id != '')) {
                var pointX = Number(drag.getAttribute("x")) + Number(drag.getAttribute("width"))
                var pointY = Number(drag.getAttribute("y")) + Number(drag.getAttribute("height"))
                point = SVG.createElement("rect", {
                    "x": pointX,
                    "y": pointY,
                    "width": 5,
                    "height": 5,
                    "stroke": "red",
                    "fill": "red",
                    "data-object": drag.getAttribute("id")
                })
                dots.appendChild(point)
            }
            if ((drag instanceof SVGCircleElement) && (drag.id != '')) {
                var pointX = Number(drag.getAttribute("cx")) + Number(drag.getAttribute("r"))
                var pointY = Number(drag.getAttribute("cy"))
                point = SVG.createElement("circle", {
                    "cx": pointX,
                    "cy": pointY,
                    "r": 2.5,
                    "stroke": "red",
                    "fill": "red",
                    "data-object": drag.getAttribute("id")
                })
                dots.appendChild(point)
            }
            if ((drag instanceof SVGEllipseElement) && (drag.id != '')) {
                var p1 = [], p2 = []
                p1.X = Number(drag.getAttribute("cx")) + Number(drag.getAttribute("rx"))
                p1.Y = Number(drag.getAttribute("cy"))
                p2.X = Number(drag.getAttribute("cx"))
                p2.Y = Number(drag.getAttribute("cy")) + Number(drag.getAttribute("ry"))
                dots.appendChild(SVG.createElement("circle", { "cx": p1.X, "cy": p1.Y, "r": 2.5, "stroke": "red", "fill": "red", "data-object": drag.getAttribute("id"), "data-point": "p1" }))
                dots.appendChild(SVG.createElement("circle", { "cx": p2.X, "cy": p2.Y, "r": 2.5, "stroke": "red", "fill": "red", "data-object": drag.getAttribute("id"), "data-point": "p2" }))
            }

            if (drag instanceof SVGPathElement) {
                var points = drag.getAttribute("d")
                var isWave = drag.getAttribute("data-wave")
                var points_array = points.split(" ")
                var p1 = [], p2 = [], p3 = [], p4 = []
                if (points_array.length == 10) {
                    p1.X = points_array[1]
                    p1.Y = points_array[2]
                    p2.X = points_array[4]
                    p2.Y = points_array[5]
                    p3.X = points_array[6]
                    p3.Y = points_array[7]
                    p4.X = points_array[8]
                    p4.Y = points_array[9]
                    dots.appendChild(SVG.createElement("circle", { "cx": p1.X, "cy": p1.Y, "r": 3, "stroke": "red", "fill": "red", "data-object": drag.getAttribute("id"), "data-point": "p1" }))
                    dots.appendChild(SVG.createElement("circle", { "cx": p2.X, "cy": p2.Y, "r": 3, "stroke": "red", "fill": "red", "data-object": drag.getAttribute("id"), "data-point": "p2" }))
                    dots.appendChild(SVG.createElement("circle", { "cx": p3.X, "cy": p3.Y, "r": 3, "stroke": "red", "fill": "red", "data-object": drag.getAttribute("id"), "data-point": "p3" }))
                    dots.appendChild(SVG.createElement("circle", { "cx": p4.X, "cy": p4.Y, "r": 3, "stroke": "red", "fill": "red", "data-object": drag.getAttribute("id"), "data-point": "p4" }))
                };
                if (points_array.length == 8) {
                    p1.X = points_array[1]
                    p1.Y = points_array[2]
                    p2.X = points_array[4]
                    p2.Y = points_array[5]
                    p3.X = points_array[6]
                    p3.Y = points_array[7]
                    dots.appendChild(SVG.createElement("circle", { "cx": p1.X, "cy": p1.Y, "r": 3, "stroke": "red", "fill": "red", "data-object": drag.getAttribute("id"), "data-point": "p1" }))
                    dots.appendChild(SVG.createElement("circle", { "cx": p2.X, "cy": p2.Y, "r": 3, "stroke": "red", "fill": "red", "data-object": drag.getAttribute("id"), "data-point": "p2" }))
                    dots.appendChild(SVG.createElement("circle", { "cx": p3.X, "cy": p3.Y, "r": 3, "stroke": "red", "fill": "red", "data-object": drag.getAttribute("id"), "data-point": "p3" }))
                };
                if (points_array.length == 6) {
                    p1.X = points_array[1];
                    p1.Y = points_array[2];
                    p2.X = points_array[4];
                    p2.Y = points_array[5];
                    dots.appendChild(SVG.createElement("circle", { "cx": p1.X, "cy": p1.Y, "r": 3, "stroke": "red", "fill": "red", "data-object": drag.getAttribute("id"), "data-point": "p1" }))
                    dots.appendChild(SVG.createElement("circle", { "cx": p2.X, "cy": p2.Y, "r": 3, "stroke": "red", "fill": "red", "data-object": drag.getAttribute("id"), "data-point": "p2" }))
                };
                if (points_array.length > 10 && isWave==3) {
                    p1.X = points_array[1]
                    p1.Y = points_array[2]
                    p2.X = points_array[(points_array.length/3).toFixed()]
                    p2.Y = points_array[(points_array.length/3).toFixed()-1]
                    p3.X = points_array[(points_array.length/2).toFixed()]
                    p3.Y = points_array[(points_array.length/2).toFixed()-1]
                    p4.X = points_array[points_array.length - 2]
                    p4.Y = points_array[points_array.length - 1]
                    dots.appendChild(SVG.createElement("circle", { "cx": p1.X, "cy": p1.Y, "r": 3, "stroke": "red", "fill": "red", "data-object": drag.getAttribute("id"), "data-point": "p1" }))
                    dots.appendChild(SVG.createElement("circle", { "cx": p2.X, "cy": p2.Y, "r": 3, "stroke": "red", "fill": "red", "data-object": drag.getAttribute("id"), "data-point": "p2" }))
                    dots.appendChild(SVG.createElement("circle", { "cx": p3.X, "cy": p3.Y, "r": 3, "stroke": "red", "fill": "red", "data-object": drag.getAttribute("id"), "data-point": "p3" }))
                    dots.appendChild(SVG.createElement("circle", { "cx": p4.X, "cy": p4.Y, "r": 3, "stroke": "red", "fill": "red", "data-object": drag.getAttribute("id"), "data-point": "p4" }))
                }else if (points_array.length > 10 && isWave==2) {
                    p1.X = points_array[1]
                    p1.Y = points_array[2]
                    p2.X = points_array[(points_array.length/2).toFixed()]
                    p2.Y = points_array[(points_array.length/2).toFixed()-1]
                    p3.X = points_array[points_array.length - 2]
                    p3.Y = points_array[points_array.length - 1]
                    dots.appendChild(SVG.createElement("circle", { "cx": p1.X, "cy": p1.Y, "r": 3, "stroke": "red", "fill": "red", "data-object": drag.getAttribute("id"), "data-point": "p1" }))
                    dots.appendChild(SVG.createElement("circle", { "cx": p2.X, "cy": p2.Y, "r": 3, "stroke": "red", "fill": "red", "data-object": drag.getAttribute("id"), "data-point": "p2" }))
                    dots.appendChild(SVG.createElement("circle", { "cx": p3.X, "cy": p3.Y, "r": 3, "stroke": "red", "fill": "red", "data-object": drag.getAttribute("id"), "data-point": "p3" }))
                }else if (points_array.length > 10) {
                    p1.X = points_array[1]
                    p1.Y = points_array[2]
                    p2.X = points_array[points_array.length - 2]
                    p2.Y = points_array[points_array.length - 1]
                    dots.appendChild(SVG.createElement("circle", { "cx": p1.X, "cy": p1.Y, "r": 3, "stroke": "red", "fill": "red", "data-object": drag.getAttribute("id"), "data-point": "p1" }))
                    dots.appendChild(SVG.createElement("circle", { "cx": p2.X, "cy": p2.Y, "r": 3, "stroke": "red", "fill": "red", "data-object": drag.getAttribute("id"), "data-point": "p2" }))
                }
                
            }
            if (drag instanceof SVGPolygonElement) {
                var points = drag.getAttribute("points"),
                    points_array = points.split(" "),
                    p1 = points_array[0].split(","),
                    p2 = points_array[1].split(","),
                    p3 = points_array[2].split(",")
                if (points_array.length == 3) {
                    dots.appendChild(SVG.createElement("circle", { "cx": p1[0], "cy": p1[1], "r": 3, "stroke": "red", "fill": "red", "data-object": drag.getAttribute("id"), "data-point": "p1" }))
                    dots.appendChild(SVG.createElement("circle", { "cx": p2[0], "cy": p2[1], "r": 3, "stroke": "red", "fill": "red", "data-object": drag.getAttribute("id"), "data-point": "p2" }))
                    dots.appendChild(SVG.createElement("circle", { "cx": p3[0], "cy": p3[1], "r": 3, "stroke": "red", "fill": "red", "data-object": drag.getAttribute("id"), "data-point": "p3" }))
                } 
                if (points_array.length == 4) {
                    var p4 = points_array[3].split(",")
                    dots.appendChild(SVG.createElement("circle", { "cx": p1[0], "cy": p1[1], "r": 3, "stroke": "red", "fill": "red", "data-object": drag.getAttribute("id"), "data-point": "p1" }))
                    dots.appendChild(SVG.createElement("circle", { "cx": p2[0], "cy": p2[1], "r": 3, "stroke": "red", "fill": "red", "data-object": drag.getAttribute("id"), "data-point": "p2" }))
                    dots.appendChild(SVG.createElement("circle", { "cx": p3[0], "cy": p3[1], "r": 3, "stroke": "red", "fill": "red", "data-object": drag.getAttribute("id"), "data-point": "p3" }))
                    dots.appendChild(SVG.createElement("circle", { "cx": p4[0], "cy": p4[1], "r": 3, "stroke": "red", "fill": "red", "data-object": drag.getAttribute("id"), "data-point": "p4" }))
                } 
                if (points_array.length == 5) {
                    var p4 = points_array[3].split(",")
                    var p5 = points_array[4].split(",")
                    dots.appendChild(SVG.createElement("circle", { "cx": p1[0], "cy": p1[1], "r": 3, "stroke": "red", "fill": "red", "data-object": drag.getAttribute("id"), "data-point": "p1" }))
                    dots.appendChild(SVG.createElement("circle", { "cx": p2[0], "cy": p2[1], "r": 3, "stroke": "red", "fill": "red", "data-object": drag.getAttribute("id"), "data-point": "p2" }))
                    dots.appendChild(SVG.createElement("circle", { "cx": p3[0], "cy": p3[1], "r": 3, "stroke": "red", "fill": "red", "data-object": drag.getAttribute("id"), "data-point": "p3" }))
                    dots.appendChild(SVG.createElement("circle", { "cx": p4[0], "cy": p4[1], "r": 3, "stroke": "red", "fill": "red", "data-object": drag.getAttribute("id"), "data-point": "p4" }))
                    dots.appendChild(SVG.createElement("circle", { "cx": p5[0], "cy": p5[1], "r": 3, "stroke": "red", "fill": "red", "data-object": drag.getAttribute("id"), "data-point": "p5" }))
                }
            }
        }
    }
}