function LoadFolders() {
    let dataToSend = {'get_folders_all': 1};
    let dataRes = [];
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: dataToSend,
        type: 'GET', // GET или POST
        dataType: 'json',
        url: "methodology_api",
        success: function (res) {
            if (res.success) {
                dataRes = res.data;
            }
        },
        error: function (res) {
            console.log(res);
        },
        complete: function (res) {
            $('.page-loader-wrapper').fadeOut();
            RenderFolders(dataRes);
            if (dataRes.length > 0) {
                LoadArticles();
            }
        }
    });
}

function RenderFolders(folders) {
    let htmlStr = "";
    let htmlStrForSelect = `<option value="">- Выберите папку -</option>`;
    for (let i = 0; i < folders.length; i++) {
        let folder = folders[i];
        htmlStr += `
            <li class="list-group-item p-1 mb-1" data-type="folder">
                <div class="folder-elem d-flex justify-content-between" data-id="${folder.id}" data-parent="" data-title="${folder.title}" data-num="${i+1}">
                    <div class="col-12 d-flex px-0">
                        <span class="w-100">
                            <span class="folder-point mr-2">
                                <span class="icon-custom icon--folder ml-4" style="--i-w: 1em; --i-h: 1em;"></span>
                            </span>
                            <span class="folder-title"> 
                                <span class="elem-num">${(i+1)}. </span>
                                ${folder.title}
                            </span>
                        </span>
                        <a href="#" class="edit-option mr-1" data-id="edit">
                            <span class="badge badge-pill bg-default-light">
                                <i class="fa fa-pencil" aria-hidden="true"></i>
                            </span>
                        </a>
                        <a href="#" class="edit-option mr-1" data-id="delete">
                            <span class="badge badge-pill bg-default-light">
                                <i class="fa fa-trash text-danger" aria-hidden="true"></i>
                            </span>
                        </a>
                        <a href="#" class="edit-option mr-1" data-id="order_down">
                            <span class="badge badge-pill bg-default-light">
                                <i class="fa fa-arrow-down" aria-hidden="true"></i>
                            </span>
                        </a>
                        <a href="#" class="edit-option mr-1" data-id="order_up">
                            <span class="badge badge-pill bg-default-light">
                                <i class="fa fa-arrow-up" aria-hidden="true"></i>
                            </span>
                        </a>
                    </div>
                </div>
            </li>
        `;
        htmlStrForSelect += `
            <option value="${folder.id}">${(i+1)}. ${folder.title}</option>
        `;
    }
    $('.folders-group').html(htmlStr);
    $('.article-editor-col').find('[name="a_folder"]').html(htmlStrForSelect);
    ToggleEditOptions();
}

function LoadArticles() {
    let dataToSend = {'get_articles_all': 1};
    let dataRes = [];
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: dataToSend,
        type: 'GET', // GET или POST
        dataType: 'json',
        url: "methodology_api",
        success: function (res) {
            if (res.success) {
                dataRes = res.data;
            }
        },
        error: function (res) {
            console.log(res);
        },
        complete: function (res) {
            $('.page-loader-wrapper').fadeOut();
            RenderArticles(dataRes);
        }
    });
}

function RenderArticles(articles) {
    $('.folders-group').find('.article-elem').parent().remove();
    for (let i = 0; i < articles.length; i++) {
        let article = articles[i];
        let cFolder = $('.folders-group').find(`.folder-elem[data-id="${article.folder}"]`).parent();
        let lastLiElem = $('.folders-group').find(`.article-elem[data-folder="${article.folder}"]`).last().parent();
        if (lastLiElem.length == 0) {
            lastLiElem = $('.folders-group').find(`.folder-elem[data-id="${article.folder}"]`).parent();
        }
        let folderNum = $('.folders-group').find(`.folder-elem[data-id="${article.folder}"]`).attr('data-num');
        let articleNum = $('.folders-group').find(`.article-elem[data-folder="${article.folder}"]`).length;
        let htmlStr = `
            <li class="list-group-item p-1 ${$(cFolder).hasClass('active') ? '' : 'd-none'}" data-type="article">
                <div class="article-elem d-flex justify-content-between" data-id="${article.id}" data-folder="${article.folder}" data-parent="" data-title="${article.title}" data-favor="${article.favorite ? 1 : 0}" data-num="${folderNum}.${(articleNum+1)}">
                    <div class="col-12 d-flex px-0">
                        <span class="w-100">
                            <span class="article-point mr-2">
                                <span class="icon-custom icon--folder1 ml-4" style="--i-w: 1em; --i-h: 1em;"></span>
                            </span>
                            <span class="article-title"> 
                                <span class="elem-num">${folderNum}.${(articleNum+1)}. </span>
                                ${article.title}
                            </span>
                        </span>
                        <a href="#" class="param-option mr-1 d-none" data-id="favorite">
                            <span class="badge badge-pill bg-default-light">
                                <span class="icon-custom i-favor ${article.favorite ? 'icon--favorite-selected' : 'icon--favorite'}" style="--i-w: 1.1em; --i-h: 1.1em;"></span>
                            </span>
                        </a>
                        <a href="#" class="status-option mr-1" data-id="completed">
                            <span class="badge badge-pill bg-default-light btn-completed ${article.completed ? 'completed' : ''}">
                                <i class="fa fa-square" aria-hidden="true"></i>
                            </span>
                        </a>
                        <a href="#" class="edit-option mr-1" data-id="edit">
                            <span class="badge badge-pill bg-default-light">
                                <i class="fa fa-pencil" aria-hidden="true"></i>
                            </span>
                        </a>
                        <a href="#" class="edit-option mr-1" data-id="delete">
                            <span class="badge badge-pill bg-default-light">
                                <i class="fa fa-trash text-danger" aria-hidden="true"></i>
                            </span>
                        </a>
                        <a href="#" class="edit-option mr-1" data-id="order_down">
                            <span class="badge badge-pill bg-default-light">
                                <i class="fa fa-arrow-down" aria-hidden="true"></i>
                            </span>
                        </a>
                        <a href="#" class="edit-option mr-1" data-id="order_up">
                            <span class="badge badge-pill bg-default-light">
                                <i class="fa fa-arrow-up" aria-hidden="true"></i>
                            </span>
                        </a>
                    </div>
                </div>
            </li>
        `;
        if (lastLiElem.length > 0) {
            $(lastLiElem).after(htmlStr);
        }
    }
    ToggleEditOptions();
    UpdateSelectedFolders(true);
    $('.folders-group').find(`.article-elem[data-id="${window.articleForEdit}"]`).parent().trigger('click');
}

function LoadArticleOne(id, toModal=false) {
    let dataToSend = {'get_article_one': 1, 'article': id};
    let dataRes = null;
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: dataToSend,
        type: 'GET', // GET или POST
        dataType: 'json',
        url: "methodology_api",
        success: function (res) {
            if (res.success) {
                dataRes = res.data;
            }
        },
        error: function (res) {
            console.log(res);
        },
        complete: function (res) {
            $('.page-loader-wrapper').fadeOut();
            RenderArticle(dataRes, toModal);
            window.canSwitchArticle = true;
        }
    });
}

function RenderArticle(article, toModal=false) {
    if (toModal) {
        $('.article-editor-col').attr('data-id', "");
        $('.article-editor-col').find('input[name="a_title"]').val('');
        $('.article-editor-col').find('select[name="a_folder"]').val('');
        try {
            $('.article-editor-col').attr('data-id', article.id);
            $('.article-editor-col').find('input[name="a_title"]').val(article.title);
            $('.article-editor-col').find('select[name="a_folder"]').val(article.folder);
            $('.article-editor-col').find('[name="a_completed"]').toggleClass('completed', article.completed);
            document.articleEditor.setData(article.content);
        } catch(e) {}
    } else {
        $('.row-header').find('input.article-name').val('');
        try {
            $('.row-header').find('input.article-name').val(article.title);
            document.articleViewer.setData(article.content);
        } catch(e) {}
    }
}

function SaveFolder() {
    let folderId = -1;
    try {
        folderId = parseInt($('#editFolderModal').attr('data-id'));
    } catch(e) {}
    let title = $('#editFolderModal').find('input[name="f_title"]').val();
    let dataToSend = {'edit_folder': 1, 'folder': folderId, 'title': title};
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: dataToSend,
        type: 'POST', // GET или POST
        dataType: 'json',
        url: "methodology_api",
        success: function (res) {
            if (res.success) {
                swal("Готово", "Папка успешно создана / изменена.", "success");
                $('#editFolderModal').modal('hide');
            } else {
                swal("Ошибка", `При создании / изменении папки произошла ошибка (${res.err}).`, "error");
            }
        },
        error: function (res) {
            swal("Ошибка", "Папку не удалось создать / изменить.", "error");
            console.log(res);
        },
        complete: function (res) {
            $('.page-loader-wrapper').fadeOut();
            LoadFolders();
        }
    });
}

function DeleteFolder() {
    let folderId = -1;
    try {
        folderId = parseInt($('#deleteFolderModal').attr('data-id'));
    } catch(e) {}
    let dataToSend = {'delete_folder': 1, 'folder': folderId};
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: dataToSend,
        type: 'POST', // GET или POST
        dataType: 'json',
        url: "methodology_api",
        success: function (res) {
            if (res.success) {
                swal("Готово", "Папка успешно удалена.", "success");
                $('#deleteFolderModal').modal('hide');
            } else {
                swal("Ошибка", `При удалении папки произошла ошибка (${res.err}).`, "error");
            }
        },
        error: function (res) {
            swal("Ошибка", "Папку не удалось удалить.", "error");
            console.log(res);
        },
        complete: function (res) {
            $('.page-loader-wrapper').fadeOut();
            LoadFolders();
        }
    });
}

function SaveArticle() {
    let articleId = -1;
    try {
        articleId = parseInt($('.article-editor-col').attr('data-id'));
    } catch(e) {}
    window.articleForEdit = -1;
    let title = $('.article-editor-col').find('input[name="a_title"]').val();
    let folder = $('.article-editor-col').find('select[name="a_folder"]').val();
    let completed = $('.article-editor-col').find('[name="a_completed"]').hasClass('completed') ? 1 : 0;
    let articleContent = document.articleEditor.getData();
    let dataToSend = {'edit_article': 1, 'article': articleId, 'title': title, 'folder': folder, 'content': articleContent, 'completed': completed};
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: dataToSend,
        type: 'POST', // GET или POST
        dataType: 'json',
        url: "methodology_api",
        success: function (res) {
            if (res.success) {
                window.articleForEdit = articleId;
                swal("Готово", "Статья успешно создана / изменена.", "success");
                $('.row-content').removeClass('show-article-editor');
            } else {
                swal("Ошибка", `При создании / изменении статьи произошла ошибка (${res.err}).`, "error");
            }
        },
        error: function (res) {
            swal("Ошибка", "Статью не удалось создать / изменить.", "error");
            console.log(res);
        },
        complete: function (res) {
            $('.page-loader-wrapper').fadeOut();
            LoadArticles();
        }
    });
}

function DeleteArticle() {
    let articleId = -1;
    try {
        articleId = parseInt($('#deleteArticleModal').attr('data-id'));
    } catch(e) {}
    let dataToSend = {'delete_article': 1, 'article': articleId};
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: dataToSend,
        type: 'POST', // GET или POST
        dataType: 'json',
        url: "methodology_api",
        success: function (res) {
            if (res.success) {
                swal("Готово", "Статья успешно удалена.", "success");
                $('#deleteArticleModal').modal('hide');
            } else {
                swal("Ошибка", `При удалении статьи произошла ошибка (${res.err}).`, "error");
            }
        },
        error: function (res) {
            swal("Ошибка", "Статью не удалось удалить.", "error");
            console.log(res);
        },
        complete: function (res) {
            $('.page-loader-wrapper').fadeOut();
            LoadArticles();
        }
    });
}

function ToggleEditOptions() {
    let isEditOn = $('.row-header').find('button[data-id="toggle_edit_options"]').hasClass('active');
    $('.folders-group').find('.edit-option').toggleClass('d-none', !isEditOn);
    $('.folders-group').find('.status-option').toggleClass('d-none', !isEditOn);
}

function ChangeElemOrder(orderType, elemType, elem) {
    let cList = $('ul.folders-group');
    if (orderType == "down") {
        let nextElem = $(elem).nextAll(`[data-type="${elemType}"]`).first();
        if (elemType == "folder") {
            if (nextElem.length > 0) {
                $(nextElem).after(elem);
            } else {
                $(cList).prepend(elem);
            }
        } else if (elemType == "article") {
            let cFolderId = $(elem).find('.article-elem').attr('data-folder');
            if (nextElem.length > 0 && $(nextElem).find(`.article-elem[data-folder="${cFolderId}"]`).length > 0) {
                $(nextElem).after(elem);
            } else {
                $(cList).find(`.folder-elem[data-id="${cFolderId}"]`).parent().after(elem);
            }
        }
    } else if (orderType == "up") {
        let prevElem = $(elem).prevAll(`[data-type="${elemType}"]`).first();
        if (elemType == "folder") {
            if (prevElem.length > 0) {
                $(prevElem).before(elem);
            } else {
                $(cList).append(elem);
            }
        } else if (elemType == "article") {
            let cFolderId = $(elem).find('.article-elem').attr('data-folder');
            if (prevElem.length > 0 && $(prevElem).find(`.article-elem[data-folder="${cFolderId}"]`).length > 0) {
                $(prevElem).before(elem);
            } else {
                let lastArticleElem = $(cList).find(`.article-elem[data-folder="${cFolderId}"]`).last().parent();
                if (lastArticleElem.length > 0) {
                    $(lastArticleElem).after(elem);
                } else {
                    $(cList).find(`.folder-elem[data-id="${cFolderId}"]`).parent().after(elem);
                }
            }
        }
    }
    let elemsIds = []; let elemsPos = [];
    $(cList).find(`li[data-type="${elemType}"]`).each((ind, elem) => {
        elemsIds.push($(elem).find(`div.${elemType}-elem`).attr('data-id'));
        elemsPos.push(ind+1);
    });
    let apiName = `change_order_${elemType}`;
    let dataToSend = {[apiName]: 1, 'ids': elemsIds, 'pos': elemsPos};
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: dataToSend,
        type: 'POST', // GET или POST
        dataType: 'json',
        url: "methodology_api",
        success: function (res) {
            if (res.success) {
            } else {
                swal("Ошибка", `При изменении порядка элементов произошла ошибка (${res.err}).`, "error");
            }
        },
        error: function (res) {
            swal("Ошибка", "Не удалось изменить порядок элементов.", "error");
            console.log(res);
        },
        complete: function (res) {
            $('.page-loader-wrapper').fadeOut();
            LoadFolders();
        }
    });
}

function ChangeSelectedArticle(dir) {
    let currentArticle = $('.folders-group').find('li.active[data-type="article"]');
    if (currentArticle.length > 0) {
        $(currentArticle).removeClass('active');
        if (dir == "down") {
            let nextElem = $(currentArticle).nextAll('[data-type="article"]').first();
            if (nextElem.length == 0) {
                nextElem = $('.folders-group').find('li[data-type="article"]').first();
            }
            if ($(nextElem).hasClass('d-none')) {
                let folderId = $(nextElem).find('.article-elem').attr('data-folder');
                $('.folders-group').find(`.folder-elem[data-id="${folderId}"]`).trigger('click');
            }
            $(nextElem).trigger('click');
        } else if (dir == "up") {
            let prevElem = $(currentArticle).prevAll('[data-type="article"]').first();
            if (prevElem.length == 0) {
                prevElem = $('.folders-group').find('li[data-type="article"]').last();
            }
            if ($(prevElem).hasClass('d-none')) {
                let folderId = $(prevElem).find('.article-elem').attr('data-folder');
                $('.folders-group').find(`.folder-elem[data-id="${folderId}"]`).trigger('click');
            }
            $(prevElem).trigger('click');
        }
    }
}

function UpdateSelectedFolders(update=false) {
    if (update) {
        for (let i = 0; i < document.selectedFolders.length; i++) {
            let cId = document.selectedFolders[i];
            $('.folders-group').find(`.folder-elem[data-id="${cId}"]`).parent().addClass('active');
            $('.folders-group').find('li[data-type="article"]').find(`.article-elem[data-folder="${cId}"]`).parent().removeClass('d-none');
        }
    } else {
        document.selectedFolders = [];
        $('.folders-group').find('li.active[data-type="folder"]').each((ind, elem) => {
            let cId = $(elem).find('.folder-elem').attr('data-id');
            document.selectedFolders.push(cId);
        });
    }
}

function RenderSplitCols() {
    $('.row-content').find('div.gutter').remove();
    let sizesArr = window.dataForSplit;
    window.split = Split(['#splitCol_0', '#splitCol_1'], {
        sizes: sizesArr,
        gutterSize: 12,
        onDrag: () => {
            let sum = 0;
            let sizes = window.split.getSizes();
            sizes.forEach(val => {sum += val;});
            if (sum < 100) {
                sizes[1] = 100 - sizes[0];
            }
            window.split.setSizes(sizes);
        },
        onDragEnd: (arr) => {
            window.dataForSplit = arr;
            localStorage.setItem('split_cols__methodology', JSON.stringify(window.dataForSplit));
        }
    });
}

function ChangeUserParam(elem, key, value) {
    let articleId = $(elem).find('.article-elem').attr('data-id');
    let dataToSend = {'change_user_param': 1, 'article': articleId, 'key': key, 'value': value};
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: dataToSend,
        type: 'POST', // GET или POST
        dataType: 'json',
        url: "methodology_api",
        success: function (res) {
            if (res.success) {
                switch (key) {
                    case "favorite":
                        $(elem).find('.article-elem').attr('data-favor', value);
                        $(elem).find('span.i-favor').toggleClass('icon--favorite', value != 1);
                        $(elem).find('span.i-favor').toggleClass('icon--favorite-selected', value == 1);
                        break;
                    default:
                        break;
                }
            } else {
                swal("Ошибка", `При изменении параметра произошла ошибка (${res.err}).`, "error");
            }
        },
        error: function (res) {
            swal("Ошибка", "Не удалось изменить параметр.", "error");
            console.log(res);
        },
        complete: function (res) {}
    });
}

function RenderVideo(value, windowElem) {
    try {
        windowElem.pause();
    } catch(e) {}
    if (!value || value == -1) {
        $('#videoSelectorModal').find('input.video-link').val('');
        return;
    }
    get_video_ids(value)
    .then(data => {
        if (data) {
            if ('nftv' in data['links'] && data['links']['nftv'] != '') {
                $('#videoSelectorModal').find('input.video-link').val(`https://nanofootball.pro/video/player/${data['links']['nftv']}`);
                windowElem.src({type: 'video/mp4', src: `https://nanofootball.pro/video/player/${data['links']['nftv']}`});
                windowElem.poster(`https://nanofootball.pro/video/poster/${data['links']['nftv']}`);
            } else if ('youtube' in data['links'] && data['links']['youtube'] != '') {
                $('#videoSelectorModal').find('input.video-link').val(`https://www.youtube.com/watch?v=${data['links']['youtube']}`);
                windowElem.src({techOrder: ["youtube"], type: 'video/youtube', src: `https://www.youtube.com/watch?v=${data['links']['youtube']}`});
                windowElem.poster('');
            }
        }
    })
    .catch(err => {});
}

function formatState(state) {
    if (!state.id) {
        return state.text;
    }
    var $state = $(
        '<span>' + state.text + '</span>' + '<span class="float-right">(' + state.element.getAttribute('data-count') + ')</span>'
    );
    return $state;
}
function formatFolders(state) {
    if (!state.id) {
        return state.text;
    }
    var $state = $(
        '<span>' + state.text + '</span>' + '<span class="float-right">(' + state.element.getAttribute('value') + ')</span>'
    );
    return $state;
};



$(function() {

    let cLang = $('#select-language').val();
    try {
        document.articleEditor = CKEDITOR.replace('articleEditor', {
            language: cLang,
            removePlugins: ['elementspath', 'resize'],
            extraPlugins: ['openlink', 'chart'],
            toolbar: [
                {name: 'clipboard', groups: ['clipboard', 'undo' ], items: [ 'Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo']},
                {name: 'editing', groups: ['find', 'selection', 'spellchecker' ], items: [ 'Find', 'Replace', '-', 'SelectAll', '-', 'Scayt', 'Iframe']},
                {name: 'basicstyles', groups: ['basicstyles', 'cleanup' ], items: [ 'Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'RemoveFormat']},
                {name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align', 'bidi' ], items: [ 'NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock']},
                {name: 'links', items: ['Link', 'Unlink', 'Anchor']},
                {name: 'insert', items: ['Image', 'Flash', 'Table', 'HorizontalRule', 'Smiley', 'SpecialChar']},
                {name: 'styles', items: ['Styles', 'Format', 'Font', 'FontSize']},
                {name: 'colors', items: ['TextColor', 'BGColor']},
                {name: 'new', items: ['Chart']},
            ],
            height: '61vh',
            filebrowserBrowseUrl: '/methodology/ckeditorbrowse/',
            filebrowserImageBrowseUrl: '/methodology/ckeditorbrowse/',
            filebrowserUploadUrl: '/methodology/ckeditorupload/',
            filebrowserImageUploadUrl: '/methodology/ckeditorupload/',
        });
        document.articleEditor.on('change', (evt) => {
            $('iframe.cke_wysiwyg_frame').ready((e) => {
                $(document).find('iframe.cke_wysiwyg_frame').contents().find('body').find('div.chartjs-legend').find('.pie-legend-text').css('width', 'auto');
                $(document).find('iframe.cke_wysiwyg_frame').contents().find('body').find('div.chartjs-legend').find('.polararea-legend-text').css('width', 'auto');
                $(document).find('iframe.cke_wysiwyg_frame').contents().find('body').find('div.chartjs-legend').find('.doughnut-legend-text').css('width', 'auto');
            });
        });
    } catch(e) {}
    try {
        document.articleViewer = CKEDITOR.replace('articleViewer', {
            language: cLang,
            removePlugins: ['elementspath', 'resize'],
            extraPlugins: ['openlink', 'chart'],
            toolbar: [
                {name: 'clipboard', groups: ['clipboard', 'undo' ], items: [ 'Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo']},
                {name: 'editing', groups: ['find', 'selection', 'spellchecker' ], items: [ 'Find', 'Replace', '-', 'SelectAll', '-', 'Scayt', 'Iframe']},
                {name: 'basicstyles', groups: ['basicstyles', 'cleanup' ], items: [ 'Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'RemoveFormat']},
                {name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align', 'bidi' ], items: [ 'NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock']},
                {name: 'links', items: ['Link', 'Unlink', 'Anchor']},
                {name: 'insert', items: ['Image', 'Flash', 'Table', 'HorizontalRule', 'Smiley', 'SpecialChar']},
                {name: 'styles', items: ['Styles', 'Format', 'Font', 'FontSize']},
                {name: 'colors', items: ['TextColor', 'BGColor']},
                {name: 'new', items: ['Chart']},
            ],
            height: '83vh',
            readOnly: true,
            on: {
                instanceReady: (evt) => {
                    $(`#cke_${evt.editor.name}`).find('.cke_top').addClass('d-none')
                },
                contentDom: (evt) => {
                    let editable = evt.editor.editable();
                    editable.attachListener(editable, 'click', (evt2) => {
                        let link = new CKEDITOR.dom.elementPath(evt2.data.getTarget(), this).contains('a');
                        if (link && evt2.data.$.button != 2 && link.isReadOnly()) {
                            window.open(link.getAttribute('href'));
                        }
                    }, null, null, 15);
                }
            }
        });
        document.articleViewer.on('change', (evt) => {
            $('iframe.cke_wysiwyg_frame').ready((e) => {
                $(document).find('iframe.cke_wysiwyg_frame').contents().find('body').find('div.chartjs-legend').find('.pie-legend-text').css('width', 'auto');
                $(document).find('iframe.cke_wysiwyg_frame').contents().find('body').find('div.chartjs-legend').find('.polararea-legend-text').css('width', 'auto');
                $(document).find('iframe.cke_wysiwyg_frame').contents().find('body').find('div.chartjs-legend').find('.doughnut-legend-text').css('width', 'auto');

                window.videoPlayerMethodology = [];
                $(document).find('iframe.cke_wysiwyg_frame:first').contents().find('body').find('a').each((ind, elem) => {
                    let href = $(elem).attr('href');
                    if ($(elem).hasClass('_doc_')) {
                        $(elem).parent().after(`
                            <p style="height: 86vh;">
                                <object class="content-view" width="100%" height="100%" type="application/pdf" data="${href}">
                                </object>
                            </p>
                        `);
                        // $(elem).parent().remove();
                    } else if ($(elem).hasClass('_video_')) {
                        let nfbVideoId = null;
                        if (href.includes("213.108.4.28/video/player/")) {
                            nfbVideoId = href;
                            nfbVideoId = nfbVideoId.split("/player/")[1];
                        }
                        
                        $(document).find('iframe.cke_wysiwyg_frame:first').contents().find('head').append(`
                            <link type="text/css" rel="stylesheet" href="/static/video-js-7.20.0/video-js.min.css">
                        `);
                        $(elem).after(`
                            ${nfbVideoId != null ? `
                                <video id="video-player-methodology-${ind}" class="video-js resize-block video-modal" poster="https://nanofootball.pro/video/poster/${nfbVideoId}">
                                    <source src="${href}" type="video/mp4" />
                                </video>
                            ` : `
                                <video id="video-player-methodology-${ind}" class="video-js resize-block video-modal" poster="">
                                    <source src="${href}" type="video/youtube" />
                                </video>
                            `}
                        `);
                        window.videoPlayerMethodology.push(videojs(
                            $(document).find('iframe.cke_wysiwyg_frame:first').contents().find('body').find(`#video-player-methodology-${ind}`)[0], {
                            preload: 'auto',
                            autoplay: false,
                            controls: true,
                            aspectRatio: '16:9',
                            youtube: { "iv_load_policy": 1, 'modestbranding': 1, 'rel': 0, 'showinfo': 0, 'controls': 0 },
                        }));
                      
                        $(elem).remove();
                    }
                });
                for (let i = 0; i < window.videoPlayerMethodology.length; i++) {
                    window.videoPlayerMethodology[i].load();
                    window.videoPlayerMethodology[i].ready((e) => {
                        $(document).find('iframe.cke_wysiwyg_frame:first').contents().find('body').find(`#video-player-methodology-${i}`)
                            .css('height', '88vh');
                    });
                }
            });
        });
    } catch(e) {}
    document.selectedFolders = [];
    
    $('.row-header').on('click', 'button', (e) => {
        let cId = $(e.currentTarget).attr('data-id');
        let cState = $(e.currentTarget).attr('data-state');
        switch(cId) {
            case "toggle_article_block":
                if (cState == '1') {
                    $(e.currentTarget).attr('data-state', '2');
                    $(e.currentTarget).removeClass('active');
                    $('.row-content').find('.folders-wrapper').addClass('d-none');
                    $('.row-content').find('.viewer-wrapper').addClass('w-100');
                    $('.row-content').find('.folders-wrapper').removeClass('w-sm-custom');
                    $('.row-content').find('div.gutter').addClass('d-none');
                } else if (cState == '2') {
                    $(e.currentTarget).attr('data-state', '0');
                    $(e.currentTarget).addClass('active');
                    $('.row-content').find('.folders-wrapper').removeClass('d-none');
                    $('.row-content').find('.viewer-wrapper').removeClass('w-100');
                    $('.row-content').find('.folders-wrapper').removeClass('w-sm-custom');
                    $('.folders-group').find('.folder-elem').each((ind, elem) => {
                        $(elem).find('.folder-title').html(`
                            <span class="elem-num">${$(elem).attr('data-num')}</span>
                            ${$(elem).attr('data-title')}
                        `);
                    });
                    $('.folders-group').find('.article-elem').each((ind, elem) => {
                        $(elem).find('.article-title').html(`
                            <span class="elem-num">${$(elem).attr('data-num')}</span>
                            ${$(elem).attr('data-title')}
                        `);
                    });
                    $('.row-content').find('div.gutter').removeClass('d-none');
                } else {
                    $(e.currentTarget).attr('data-state', '1');
                    $(e.currentTarget).addClass('active');
                    $('.row-content').find('.folders-wrapper').removeClass('d-none');
                    $('.row-content').find('.viewer-wrapper').addClass('w-100');
                    $('.row-content').find('.folders-wrapper').addClass('w-sm-custom');
                    $('.folders-group').find('.folder-elem').each((ind, elem) => {
                        $(elem).find('.folder-title').html(`
                            <span class="elem-num">${$(elem).attr('data-num')}</span>
                        `);
                    });
                    $('.folders-group').find('.article-elem').each((ind, elem) => {
                        $(elem).find('.article-title').html(`
                            <span class="elem-num">${$(elem).attr('data-num')}</span>
                        `);
                    });
                    $('.row-content').find('div.gutter').removeClass('d-none');
                }
                break;
            case "toggle_folders":
                if (cState == '1') {
                    $(e.currentTarget).attr('data-state', '0');
                    $(e.currentTarget).find('i').attr('class', "fa fa-arrow-circle-down");
                    $('.folders-group').find('li[data-type="folder"]').removeClass('active');
                    $('.folders-group').find('li[data-type="article"]').addClass('d-none');
                } else {
                    $(e.currentTarget).attr('data-state', '1');
                    $(e.currentTarget).find('i').attr('class', "fa fa-arrow-circle-up");
                    $('.folders-group').find('li[data-type="folder"]').addClass('active');
                    $('.folders-group').find('li[data-type="article"]').removeClass('d-none');
                }
                UpdateSelectedFolders();
                break;
            case "toggle_favorite":
                if (cState == '1') {
                    $(e.currentTarget).attr('data-state', '2');
                    $(e.currentTarget).addClass('active');
                    $('.row-content').find('.article-elem[data-favor!="1"]').parent().addClass('hide-elem');
                } else if (cState == '2') {
                    $(e.currentTarget).attr('data-state', '0');
                    $(e.currentTarget).removeClass('active');
                    $('.row-content').find('.article-elem[data-favor!="1"]').parent().removeClass('hide-elem');
                    $('.row-content').find('.article-elem').find('.param-option[data-id="favorite"]').addClass('d-none');
                } else {
                    $(e.currentTarget).attr('data-state', '1');
                    $(e.currentTarget).addClass('active');
                    $('.row-content').find('.article-elem').find('.param-option[data-id="favorite"]').removeClass('d-none');
                }
                break;
            case "add_folder":
                $('#editFolderModal').attr('data-id', "");
                $('#editFolderModal').find('input[name="f_title"]').val('');
                $('#editFolderModal').modal('show');
                break;
            case "add_article":
                $('.article-editor-col').attr('data-id', "");
                $('.article-editor-col').find('input[name="a_title"]').val('');
                $('.article-editor-col').find('select[name="a_folder"]').val('');
                $('.article-editor-col').find('[name="a_completed"]').removeClass('completed');
                document.articleEditor.setData('');
                $('.row-content').addClass('show-article-editor');
                break;
            case "toggle_edit_options":
                $(e.currentTarget).toggleClass('active');
                ToggleEditOptions();
                break;
            default:
                break;
        }
    });

    LoadFolders();

    $('#editFolderModal').on('click', '.btn-save', (e) => {
        let cTitle = $('#editFolderModal').find('input[name="f_title"]').val();
        if (cTitle == "") {
            swal("Внимание", "Укажите название папки.", "info");
            return;
        }
        SaveFolder();
    });
    $('#deleteFolderModal').on('click', '.btn-delete', (e) => {
        DeleteFolder();
    });

    $('.folders-group').on('click', 'li', (e) => {
        if ($(e.target).is('a') || $(e.target).is('i') || $(e.target).hasClass('badge') || $(e.target).hasClass('icon-custom')) {
            return;
        }
        let folderId = $(e.currentTarget).find('.folder-elem').attr('data-id');
        let articleId = $(e.currentTarget).find('.article-elem').attr('data-id');
        let cType = $(e.currentTarget).attr('data-type');
        let isActive = $(e.currentTarget).hasClass('active');
        if (cType == "folder") {
            $('.folders-group').find('li[data-type="article"]').find(`.article-elem[data-folder="${folderId}"]`).parent().toggleClass('d-none', isActive);
            $(e.currentTarget).toggleClass('active', !isActive);
            UpdateSelectedFolders();
        } else if (cType == "article") {
            $('.folders-group').find('li[data-type="article"]').removeClass('active');
            if (!isActive) {
                LoadArticleOne(articleId);
            }
            $(e.currentTarget).toggleClass('active', !isActive);
        }
    });
    $('.folders-group').on('click', '.edit-option', (e) => {
        let liElem = $(e.currentTarget).parent().parent().parent();
        let cId = $(e.currentTarget).attr('data-id');
        let cType = $(liElem).attr('data-type');
        switch(cId) {
            case "edit":
                if (cType == "folder") {
                    $('#editFolderModal').attr('data-id', $(liElem).find('.folder-elem').attr('data-id'));
                    $('#editFolderModal').find('input[name="f_title"]').val($(liElem).find('.folder-elem').attr('data-title'));
                    $('#editFolderModal').modal('show');
                } else if (cType == "article") {
                    LoadArticleOne($(liElem).find('.article-elem').attr('data-id'), true);
                    $('.row-content').addClass('show-article-editor');
                }
                break;
            case "delete":
                if (cType == "folder") {
                    $('#deleteFolderModal').attr('data-id', $(liElem).find('.folder-elem').attr('data-id'));
                    $('#deleteFolderModal').modal('show');
                } else if (cType == "article") {
                    $('#deleteArticleModal').attr('data-id', $(liElem).find('.article-elem').attr('data-id'));
                    $('#deleteArticleModal').modal('show');
                }
                break;
            case "order_down":
                ChangeElemOrder("down", cType, liElem);
                break;
            case "order_up":
                ChangeElemOrder("up", cType, liElem);
                break;
            default:
                break;
        }
    });
    $('.folders-group').on('click', '.param-option', (e) => {
        let liElem = $(e.currentTarget).parent().parent().parent();
        let cId = $(e.currentTarget).attr('data-id');
        let cType = $(liElem).attr('data-type');
        switch(cId) {
            case "favorite":
                if (cType == "article") {
                    let isSet = $(liElem).find('span.icon-custom').hasClass('icon--favorite-selected') ? 0 : 1;
                    ChangeUserParam(liElem, cId, isSet);
                }
                break;
            default:
                break;
        }
    });

    $('.article-editor-col').on('click', '.btn-save', (e) => {
        let cTitle = $('.article-editor-col').find('input[name="a_title"]').val();
        let cFolder = $('.article-editor-col').find('select[name="a_folder"]').val();
        if (cTitle == "") {
            swal("Внимание", "Укажите название статьи.", "info");
            return;
        }
        if (cFolder == "") {
            swal("Внимание", "Выберите папку для статьи.", "info");
            return;
        }
        SaveArticle();
    });
    $('.article-editor-col').on('click', '[data-dismiss="modal"]', (e) => {
        $('.row-content').removeClass('show-article-editor');
    });
    $('.article-editor-col').on('click', '.btn-completed', (e) => {
        $(e.currentTarget).toggleClass('completed');
    });
    $('.article-editor-col').on('click', '.btn-video', (e) => {
        $('#videoSelectorModal').modal('show');
    });
    $('#deleteArticleModal').on('click', '.btn-delete', (e) => {
        DeleteArticle();
    });

    window.canSwitchArticle = true;
    $(document).keydown((e) => {
        if (e.which == 38 && window.canSwitchArticle) { // up
            window.canSwitchArticle = false;
            ChangeSelectedArticle("up");
        }
        if (e.which == 40 && window.canSwitchArticle) { // down
            window.canSwitchArticle = false;
            ChangeSelectedArticle("down");
        }
    });

    // Split columns
    window.dataForSplit = JSON.parse(localStorage.getItem('split_cols__methodology'));
    if (!window.dataForSplit) {
        window.dataForSplit = [30, 70];
        localStorage.setItem('split_cols__methodology', JSON.stringify(window.dataForSplit));
    }
    RenderSplitCols();

    // Video controlling
    window.currentVideoId = -1;
    try {
        window.videoPlayerInModal = videojs('video-player-modal', {
            preload: 'auto',
            autoplay: false,
            controls: true,
            aspectRatio: '16:9',
            youtube: { "iv_load_policy": 1, 'modestbranding': 1, 'rel': 0, 'showinfo': 0, 'controls': 0 },
        });
    } catch (e) {}
    try {
        generate_ajax_video_table('60vh');

        video_table
            .on( 'select', (e, dt, type, indexes) => {
                let rowData = video_table.rows( indexes ).data().toArray();
                if (type=='row') {
                    let currentData = rowData[0];
                    window.currentVideoId = currentData.id;
                    RenderVideo(currentData.id, window.videoPlayerInModal);
                }
            })
            .on( 'deselect', (e, dt, type, indexes) => {});
        $('#video').on('click', 'tr', (e) => {
            let isSelected = $(e.currentTarget).hasClass('selected');
            if (!isSelected) {
                RenderVideo(-1, window.videoPlayerInModal);
            }
        });
    } catch(e) {}
    $('#videoSelectorModal').on('click', '.btn-copy', (e) => {
        let link = $('#videoSelectorModal').find('input.video-link').val();
        navigator.clipboard.writeText(link);
        swal("Скопировано", "Ссылка видео скопирована в буфер обмена.", "success");
    });
    // For videos' filter
    $('.video-source').select2({
        templateResult: formatState,
    });
    $('.exercise-folder').select2({
        templateResult: formatFolders,
    });
    $('.video-source').on('change', function (){
        let data_source = $( this ).val();
        video_table.columns([2]).search(data_source).draw();
    });
    $('.exercise-folder').on('change', function (){
        let data_folder = $( this ).val();
        video_table.columns([3]).search(data_folder).draw();
    });
    $('.video-tags-filter').on('change', function (){
        let data_tag = $( this ).val();
        video_table.columns([7]).search(data_tag).draw();
    });
    $('.video-search').on('keyup', function (){
        let data_search = $( this ).val();
        video_table.search(data_search).draw();
    });
    $('#video-filters-clear').on('click', function (){
        $('.video-source').val(null).trigger('change');
        $('.exercise-folder').val(null).trigger('change');
        $('.video-tags-filter').val(null).trigger('change');
        $('.video-search').val('').trigger('change');
        video_table.search('').draw();
        // $('.video-list-container').find('input[type="search"]').val('').change();
        // video_table.columns([1]).search('').draw();
    });
    // END For videos' filter
    // end of video controlling


    // Toggle left menu
    setTimeout(() => {
        $('#toggle_btn').click();
    }, 500); 
});
