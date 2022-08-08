$(document).ready(function () {
    localStorage.setItem('currentBox', `${$('#block').html()}`);
    localStorage.setItem('isAnimating', false);
    try {
        const animaData = JSON.parse(localStorage.getItem('tmpData'));
        if (animaData.anims.length > 0) {
            for(let i=0; i < animaData.anims.length; i++) {
                let slide = `<div class="slide" data-val="${i}"><div class="slideName">Слайд_${i}</div><button class="refresh"></button></div>`;
                $('#animationFrames').append(slide);
            }
            $('#removeSlides').removeAttr('disabled');
            if (animaData.anims.length > 1) {$('#playSlides').removeAttr('disabled');}
        }
        localStorage.setItem('animation', JSON.stringify({current: -1, speed: animaData.speed, anims: animaData.anims}));

        const availableSpeeds = [
            {id: "1x", value: 1000},
            {id: "2x", value: 500},
            {id: "4x", value: 250},
            {id: "0.5x", value: 2000}
        ];
        let found = availableSpeeds.find(x => x.value === animaData.speed);
        $('#changeSpeed').html(found.id);
    } catch(e) {
        localStorage.setItem('animation', JSON.stringify({current: -1, speed: 1000, anims: []}));
    }
})

function checkCurrentSlide(num) {
    let animObj = JSON.parse(localStorage.getItem('animation'));
    let isAnimating = (localStorage.getItem('isAnimating') === 'true');
    try {
        num = parseInt(num);
        if (!isAnimating && num != animObj.current && animObj.current != -1) {
            animObj.anims[animObj.current] = `${$('#block').html()}`;
        }
        animObj.current = num;
        localStorage.setItem('animation', JSON.stringify(animObj));
        $('#block').html(animObj.anims[num]);

        if (num+1 >= animObj.anims.length) {
            $('#removeSlides').removeAttr('disabled');
        } else {
            $('#removeSlides').attr('disabled','disabled');
        }
    } catch(e) {}
}

$('#animationFrames').on('click','.slide',function(){
    $('#animationFrames').find('.currentSlide').removeClass('currentSlide');
    $(this).addClass('currentSlide');
    checkCurrentSlide($(this).data('val'));
})

function addSlide() {
    $('#animationFrames').find('.currentSlide').removeClass('currentSlide');

    let animObj = JSON.parse(localStorage.getItem('animation'));
    let currentNum = animObj.anims.length;

    const slide = '<div class="slide currentSlide" data-val="'+currentNum+'"><div class="slideName">Слайд_'+currentNum+'</div><button class="refresh"></button></div>';
    $('#animationFrames').append(slide);
    $('#removeSlides').removeAttr('disabled');
    if (currentNum > 0) {
        $('#playSlides').removeAttr('disabled');
        checkCurrentSlide(currentNum);
    }
    animObj.anims.push($('#block').html());
    animObj.current = currentNum;
    localStorage.setItem('animation', JSON.stringify(animObj));
}

$('#animationFrames').on('click','.refresh',function(){
    let num = $(this).parent().data('val');
    let animObj = JSON.parse(localStorage.getItem('animation'));
    try {
        num = parseInt(num);
        animObj.anims[num] = animObj.anims[0];
        if (num == animObj.current) {$('#block').html(animObj.anims[0]);}
        localStorage.setItem('animation', JSON.stringify(animObj));
    } catch(e) {}
})

function animateSlides() {
    let animObj = JSON.parse(localStorage.getItem('animation'));
    let speed;
    try {
        speed = parseInt(animObj.speed);
    } catch(e) {speed = 1000;}
    let timeStr = (speed / 1000).toString().replace(".", "-");
    $('#block').addClass(`animate-${timeStr}s`);

    const timer = ms => new Promise(res => setTimeout(res, ms));
    async function animate() {
        const iArray = [5, 7, 9, 11, 13];

        localStorage.setItem('isAnimating', true);
        $('#block').html(animObj.anims[0]);
        for (let i = 0; i < animObj.anims.length; i++) {
            $('#animationFrames').find('.currentSlide').removeClass('currentSlide');
            $('#animationFrames').find(`[data-val=${i}]`).addClass('currentSlide');

            let eHtml = $.parseHTML(animObj.anims[i]);
            let comparerObj = {};
            iArray.forEach(iElem => {
                let curIdGroup = $(eHtml[iElem]).attr('id');
                let elementsIdsArr = [];
                if (eHtml[iElem].childNodes.length > 0) {
                    eHtml[iElem].childNodes.forEach(function(element) {
                        elementsIdsArr.push($(element).attr('id'));
                        let currentObj = $(`#${$(element).attr('id')}`);
                        if (currentObj.length == 0) {
                            const tagName = $(element).prop("tagName").toLowerCase();
                            $(`#${curIdGroup}`).append( $('#svg_template').find(`${tagName == "img" ? 'image' : tagName}`).clone().attr('id', $(element).attr('id')) );
                            currentObj = $(`#${curIdGroup}`).find(`#${$(element).attr('id')}`);
                        }
                        $(element).each(function() {
                            $.each(this.attributes, function() {
                                if(this.specified) {
                                    currentObj.attr(this.name, this.value);
                                }
                            });
                        });
                    });
                }
                comparerObj[curIdGroup] = elementsIdsArr;
            });
            Object.keys(comparerObj).forEach(key => {
                $(`#${key}`).children().each(function () {
                    let jQElem = $(this);
                    if (comparerObj[key].indexOf(jQElem.attr('id')) === -1) {
                        jQElem.remove();
                    }
                });
            });
            await timer(speed);
        }
        $('#block').removeClass(`animate-${timeStr}s`);
        localStorage.setItem('isAnimating', false);
    }
    animate();
}

function removeSlides() {
    let animObj = JSON.parse(localStorage.getItem('animation'));
    let animsLen = animObj.anims.length;
    
    if (animsLen > 0) {
        if (animObj.current + 1 < animsLen) {
            // $('#block').html(animObj.anims[animObj.current + 1]);
            // $('#animationFrames').find(`div[data-val=${animObj.current+1}]`).addClass("currentSlide");
            // animObj.anims.splice(animObj.current, 1);
            // animObj.current ++;
        } else {

            $('#animationFrames').find(`div[data-val=${animObj.current}]`).remove();

            if (animsLen > 1) {
                $('#block').html(animObj.anims[animObj.current - 1]);
                $('#animationFrames').find(`div[data-val=${animObj.current-1}]`).addClass("currentSlide");
                animObj.anims.splice(animObj.current, 1);
                animObj.current --;
            } else {
                let currentBox = localStorage.getItem('currentBox');
                $('#block').html(currentBox);
                animObj = {current: -1, speed: 1000, anims: []};
                $('#removeSlides').attr('disabled','disabled');
                $('#playSlides').attr('disabled','disabled');
                $('#changeSpeed').html("1x");
            }
        }

        localStorage.setItem('animation', JSON.stringify(animObj));
    }
}

function updateSpeed(e) {
    const availableSpeeds = [
        {id: "1x", value: 1000},
        {id: "2x", value: 500},
        {id: "4x", value: 250},
        {id: "0.5x", value: 2000}
    ];

    let indexNext = availableSpeeds.findIndex(x => x.id === $(e).html()) + 1;
    if (indexNext >= availableSpeeds.length) {indexNext = 0;}

    let animObj = JSON.parse(localStorage.getItem('animation'));
    animObj.speed = availableSpeeds[indexNext].value;
    $(e).html(availableSpeeds[indexNext].id);

    localStorage.setItem('animation', JSON.stringify(animObj));
}