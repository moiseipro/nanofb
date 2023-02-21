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
            <li class="list-group-item p-1" data-type="folder">
                <div class="folder-elem d-flex justify-content-between" data-id="${folder.id}" data-parent="" data-title="${folder.title}" data-num="${i+1}">
                    <div class="pull-left">
                        <span class="folder-point mr-2">
                            <span class="icon-custom icon--folder ml-4" style="--i-w: 1em; --i-h: 1em;"></span>
                        </span>
                        <span class="folder-title"> 
                            <span class="elem-num">${(i+1)}. </span>
                            ${folder.title}
                        </span>
                    </div>
                    <div class="pull-right">
                        <a href="#" class="edit-option" data-id="edit">
                            <span class="badge badge-pill bg-default-light">
                                <i class="fa fa-pencil" aria-hidden="true"></i>
                            </span>
                        </a>
                        <a href="#" class="edit-option" data-id="delete">
                            <span class="badge badge-pill bg-default-light">
                                <i class="fa fa-trash text-danger" aria-hidden="true"></i>
                            </span>
                        </a>
                        <a href="#" class="edit-option" data-id="order_down">
                            <span class="badge badge-pill bg-default-light">
                                <i class="fa fa-arrow-down" aria-hidden="true"></i>
                            </span>
                        </a>
                        <a href="#" class="edit-option" data-id="order_up">
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
                <div class="article-elem d-flex justify-content-between" data-id="${article.id}" data-folder="${article.folder}" data-parent="" data-title="${article.title}">
                    <div class="pull-left">
                        <span class="article-point mr-2">
                            <span class="icon-custom icon--folder1 ml-4" style="--i-w: 1em; --i-h: 1em;"></span>
                        </span>
                        <span class="article-title ml-5"> 
                            <span class="elem-num">${folderNum}.${(articleNum+1)}. </span>
                            ${article.title}
                        </span>
                    </div>
                    <div class="pull-right">
                        <a href="#" class="edit-option" data-id="edit">
                            <span class="badge badge-pill bg-default-light">
                                <i class="fa fa-pencil" aria-hidden="true"></i>
                            </span>
                        </a>
                        <a href="#" class="edit-option" data-id="delete">
                            <span class="badge badge-pill bg-default-light">
                                <i class="fa fa-trash text-danger" aria-hidden="true"></i>
                            </span>
                        </a>
                        <a href="#" class="edit-option" data-id="order_down">
                            <span class="badge badge-pill bg-default-light">
                                <i class="fa fa-arrow-down" aria-hidden="true"></i>
                            </span>
                        </a>
                        <a href="#" class="edit-option" data-id="order_up">
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
    let title = $('.article-editor-col').find('input[name="a_title"]').val();
    let folder = $('.article-editor-col').find('select[name="a_folder"]').val();
    let articleContent = document.articleEditor.getData();
    let dataToSend = {'edit_article': 1, 'article': articleId, 'title': title, 'folder': folder, 'content': articleContent};
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: dataToSend,
        type: 'POST', // GET или POST
        dataType: 'json',
        url: "methodology_api",
        success: function (res) {
            if (res.success) {
                swal("Готово", "статья успешно создана / изменена.", "success");
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
    let isEditOn = $('.btn-group-header').find('button[data-id="toggle_edit_options"]').hasClass('active');
    $('.folders-group').find('.edit-option').toggleClass('d-none', !isEditOn);
}

function ChangeElemOrder(orderType, elemType, elem) {
    let cList = $('ul.folders-group');
    if (orderType == "down") {
        let nextElem = $(elem).next(`[data-type="${elemType}"]`);
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
        let prevElem = $(elem).prev(`[data-type="${elemType}"]`);
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
            swal("Ошибка", "не удалось изменить порядок элементов.", "error");
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



$(function() {

    let cLang = $('#select-language').val();
    try {
        document.articleEditor = CKEDITOR.replace('articleEditor', {
            language: cLang,
            toolbar: [
                {name: 'clipboard', groups: ['clipboard', 'undo' ], items: [ 'Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo']},
                {name: 'editing', groups: ['find', 'selection', 'spellchecker' ], items: [ 'Find', 'Replace', '-', 'SelectAll', '-', 'Scayt' ]},
                {name: 'basicstyles', groups: ['basicstyles', 'cleanup' ], items: [ 'Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'RemoveFormat']},
                {name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align', 'bidi' ], items: [ 'NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock']},
                {name: 'links', items: ['Link', 'Unlink', 'Anchor']},
                {name: 'insert', items: ['Image', 'Flash', 'Table', 'HorizontalRule', 'Smiley', 'SpecialChar']},
                {name: 'styles', items: ['Styles', 'Format', 'Font', 'FontSize']},
                {name: 'colors', items: ['TextColor', 'BGColor']},
            ],
            height: '56vh',
            removePlugins: ['elementspath', 'resize'],
            extraPlugins: ['openlink'],
            filebrowserBrowseUrl: '/methodology/ckeditorbrowse/',
            filebrowserImageBrowseUrl: '/methodology/ckeditorbrowse/',
            filebrowserUploadUrl: '/methodology/ckeditorupload/',
            filebrowserImageUploadUrl: '/methodology/ckeditorupload/',
        });
    } catch(e) {}
    try {
        document.articleViewer = CKEDITOR.replace('articleViewer', {
            language: cLang,
            toolbar: [
                {name: 'clipboard', groups: ['clipboard', 'undo' ], items: [ 'Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo']},
                {name: 'editing', groups: ['find', 'selection', 'spellchecker' ], items: [ 'Find', 'Replace', '-', 'SelectAll', '-', 'Scayt' ]},
                {name: 'basicstyles', groups: ['basicstyles', 'cleanup' ], items: [ 'Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'RemoveFormat']},
                {name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align', 'bidi' ], items: [ 'NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock']},
                {name: 'links', items: ['Link', 'Unlink', 'Anchor']},
                {name: 'insert', items: ['Image', 'Flash', 'Table', 'HorizontalRule', 'Smiley', 'SpecialChar']},
                {name: 'styles', items: ['Styles', 'Format', 'Font', 'FontSize']},
                {name: 'colors', items: ['TextColor', 'BGColor']},
            ],
            height: '80vh',
            removePlugins: ['elementspath', 'resize'],
            extraPlugins: ['openlink'],
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
    } catch(e) {}

    
    $('.btn-group-header').on('click', 'button', (e) => {
        let cId = $(e.currentTarget).attr('data-id');
        let cState = $(e.currentTarget).attr('data-state');
        switch(cId) {
            case "toggle_article_block":
                $(e.currentTarget).toggleClass('active');
                $('.row-content').find('div:first').toggleClass('d-none', $(e.currentTarget).hasClass('active'));
                break;
            case "toggle_article_block_2":
                $(e.currentTarget).toggleClass('active');
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
                break;
            case "prev_article":
                ChangeSelectedArticle("up");
                break;
            case "next_article":
                ChangeSelectedArticle("down");
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
        if ($(e.target).is('a') || $(e.target).is('i') || $(e.target).hasClass('badge')) {
            return;
        }
        let folderId = $(e.currentTarget).find('.folder-elem').attr('data-id');
        let articleId = $(e.currentTarget).find('.article-elem').attr('data-id');
        let cType = $(e.currentTarget).attr('data-type');
        let isActive = $(e.currentTarget).hasClass('active');
        if (cType == "folder") {
            $('.folders-group').find('li[data-type="article"]').find(`.article-elem[data-folder="${folderId}"]`).parent().toggleClass('d-none', isActive);
            $(e.currentTarget).toggleClass('active', !isActive);
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
    $('#deleteArticleModal').on('click', '.btn-delete', (e) => {
        DeleteArticle();
    });


    // Toggle left menu
    setTimeout(() => {
        $('#toggle_btn').click();
    }, 500); 
});
