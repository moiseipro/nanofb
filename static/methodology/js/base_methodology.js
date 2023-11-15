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

$(function() {
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

    // Toggle left menu
    setTimeout(() => {
        $('#toggle_btn').click();
    }, 500); 
});
