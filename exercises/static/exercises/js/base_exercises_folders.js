function ToggleFolderOrder(dir) {
    let activeElem = $('.folders_list').find(`.list-group-item.active`);
    if (activeElem.length > 0) {
        let cID = $(activeElem).find('.folder-elem').attr('data-id');
        let cParentID = $(activeElem).find('.folder-elem').attr('data-parent');
        let isRoot = $(activeElem).find('.folder-elem').attr('data-root');
        if (isRoot == '1') {
            let elems = $('.folders_list').find(`.folder-elem[data-root="1"]`).parent();
            let tFirst = null; let tLast = null; let newInd = 0;
            let children = $('.folders_list').find(`.folder-elem[data-root="0"]`).parent();
            $('.folders_list').find(`.folder-elem[data-root="0"]`).parent().remove();
            for (let i = 0; i < elems.length; i++) {
                if ($(elems[i]).find('.folder-elem').attr('data-id') == cID) {
                    if (dir == "up") {
                        tLast = $(elems[i]);
                        if (i - 1 < 0) {
                            newInd = elems.length - 1;
                            tFirst = $(elems[newInd]);
                            $(tLast).detach().insertAfter($(tFirst));
                        } else {
                            newInd = i - 1;
                            tFirst = $(elems[newInd]);
                            $(tLast).detach().insertBefore($(tFirst));
                        }
                    } else if (dir == "down") {
                        tFirst = $(elems[i]);
                        if (i + 1 > elems.length - 1) {
                            newInd = 0;
                            tLast = $(elems[newInd]);
                            $(tFirst).detach().insertBefore($(tLast));
                        } else {
                            newInd = i + 1;
                            tLast = $(elems[newInd]);
                            $(tFirst).detach().insertAfter($(tLast));
                        }
                    }
                    break;
                }             
            }
            for (let i = children.length - 1; i >= 0; i--) {
                let elem = children[i];
                let parentId = $(elem).find('.folder-elem').attr('data-parent');
                $('.folders_list').find(`.folder-elem[data-id="${parentId}"]`).parent().after(elem);
            }
        } else {
            let elems = $('.folders_list').find(`.folder-elem[data-parent="${cParentID}"]`).parent();
            let tFirst = null; let tLast = null; let newInd = 0;
            for (let i = 0; i < elems.length; i++) {
                if ($(elems[i]).find('.folder-elem').attr('data-id') == cID) {
                    if (dir == "up") {
                        tLast = $(elems[i]);
                        if (i - 1 < 0) {
                            newInd = elems.length - 1;
                            tFirst = $(elems[newInd]);
                            $(tLast).detach().insertAfter($(tFirst));
                        } else {
                            newInd = i - 1;
                            tFirst = $(elems[newInd]);
                            $(tLast).detach().insertBefore($(tFirst));
                        }
                    } else if (dir == "down") {
                        tFirst = $(elems[i]);
                        if (i + 1 > elems.length - 1) {
                            newInd = 0;
                            tLast = $(elems[newInd]);
                            $(tFirst).detach().insertBefore($(tLast));
                        } else {
                            newInd = i + 1;
                            tLast = $(elems[newInd]);
                            $(tFirst).detach().insertAfter($(tLast));
                        }
                    }
                    break;
                }             
            }
        }
    }
}

function RenderNFBFolders(data = []) {
    let dataStr = "";
    for (let key in data) {
        let elem = data[key];
        dataStr += `
            <li class="list-group-item p-0">
                <div class="nfb-folder-elem d-flex justify-content-between" 
                    data-id="${elem.id}" data-parent="${elem.parent}" 
                    data-short="${elem.short_name}" data-name="${elem.name}" data-root="0">
                    <div class="pull-left">
                        <span class="folder-point mr-2"><i class="fa fa-folder-open-o" aria-hidden="true"></i></span>
                        <span class="folder-title">${elem.short_name}. ${elem.name}</span>
                    </div>
                </div>
            </li>
        `;
    }
    $('#folderNanoFbModal').find('.nfb_folders_list > .list-group').html(dataStr);
    let folderList = {'order': [], 'data': {}};
    setTimeout(() => {
        $('#folderNanoFbModal').find('.list-group-item').each((ind, elem) => {
            let cNum = GetHierarchyNum($(elem).find('.nfb-folder-elem'), "nfb_folders_list", "nfb-folder-elem");
            if (folderList['data'][cNum]) {
                folderList['data'][cNum].push(elem);
            } else {
                folderList['data'][cNum] = [elem];
            }
            if (!folderList['order'].includes(cNum)) {
                folderList['order'].push(cNum);
            }
        });
        $('#folderNanoFbModal').find('.nfb_folders_list > .list-group').empty();
        for (let ind in folderList['order']) {
            let key = folderList['order'][ind];
            for (let keyElem in folderList['data'][key]) {
                let tElem = folderList['data'][key][keyElem];
                let cId = $(tElem).find('.nfb-folder-elem').attr('data-id');
                if (cId != key) {
                    $(tElem).find('.folder-point').html('<i class="fa fa-folder-o ml-4" aria-hidden="true"></i>');
                    $(tElem).find('.folder-elem').attr('data-root', '0');
                } else {
                    $(tElem).find('.folder-elem').attr('data-root', '1');
                }
                $('#folderNanoFbModal').find('.nfb_folders_list > .list-group').append(tElem);
            }
        }
    }, 250);
}


$(function() {
    $('.folders_list').on('click', '.list-group-item', (e) => {
        $('.folders_list').find('.list-group-item').removeClass('active');
        $(e.currentTarget).toggleClass('active');
    });

    let cFolderIdToChange = null; let cParentIdToChange = null;
    $('.folder-add').on('click', (e) => {
        cFolderIdToChange = null; cParentIdToChange = null;
        $('#folderChangeModal').find('input[name="short_name"]').val('');
        $('#folderChangeModal').find('input[name="name"]').val('');
        $('#folderChangeModal').modal('show');
    });
    $('.folders_list').on('click', '.folder-sub-add', (e) => {
        let cId = $(e.currentTarget).parent().parent().attr('data-id');
        cFolderIdToChange = null; cParentIdToChange = cId;
        $('#folderChangeModal').find('input[name="short_name"]').val('');
        $('#folderChangeModal').find('input[name="name"]').val('');
        $('#folderChangeModal').modal('show');
    });
    $('.folders_list').on('click', '.folder-edit', (e) => {
        let cId = $(e.currentTarget).parent().parent().attr('data-id');
        let short = $(e.currentTarget).parent().parent().attr('data-short');
        let name = $(e.currentTarget).parent().parent().attr('data-name');
        cFolderIdToChange = cId; cParentIdToChange = null;
        $('#folderChangeModal').find('input[name="short_name"]').val(short);
        $('#folderChangeModal').find('input[name="name"]').val(name);
        $('#folderChangeModal').modal('show');
    });

    let cFolderIdToDelete = null;
    $('.folders_list').on('click', '.folder-delete', (e) => {
        let cId = $(e.currentTarget).parent().parent().attr('data-id');
        cFolderIdToDelete = cId;
        $('#folderDeleteModal').modal('show');
    });

    $('#folderChangeModal').on('show.bs.modal', (e) => {
        $(e.currentTarget).find('button.btn-submit').prop('disabled', false);
    });
    $('#folderDeleteModal').on('show.bs.modal', (e) => {
        $(e.currentTarget).find('button.btn-submit').prop('disabled', false);
    });

    $('#formFolderChange').on('submit', (e) => {
        e.preventDefault();
        $('#folderChangeModal').find('button.btn-submit').prop('disabled', true);
        let shortName = $('#folderChangeModal').find('input[name="short_name"]').val();
        let name = $('#folderChangeModal').find('input[name="name"]').val();
        let data = {'id': cFolderIdToChange, 'parent_id': cParentIdToChange, 'name': name, 'short_name': shortName};
        $.ajax({
            data: data,
            type: 'POST', // GET или POST
            dataType: 'json',
            url: "folders_api",
            success: function (res) {
                if (res.data.type && res.data.type == "add") {
                    let hasParent = $('.folders_list').find(`.folder-elem[data-id="${res.data.parent_id}"]`).length > 0;
                    let elemToAdd = `
                        <li class="list-group-item p-0">
                            <div class="folder-elem d-flex justify-content-between" data-id="${res.data.id}" data-parent="${res.data.parent_id}" data-short="${res.data.short_name}" data-name="${res.data.name}" data-root="${hasParent ? '0' : '1'}">
                                <div class="pull-left">
                                    <span class="folder-point mr-2">${hasParent ? `
                                        <i class="fa fa-folder-o ml-4" aria-hidden="true"></i>
                                    ` : `
                                        <i class="fa fa-folder-open-o" aria-hidden="true"></i>
                                    `}</span>
                                    <span class="folder-title">${res.data.short_name}. ${res.data.name}</span>
                                </div>
                                <div class="pull-right text-uppercase font-weight-bold">
                                    ${hasParent ? '' : `
                                        <span class="badge badge-success folder-sub-add mr-2" title="Добавить подпапку">
                                            <i class="fa fa-plus" aria-hidden="true"></i>
                                        </span>
                                    `}
                                    <span class="badge badge-secondary folder-edit mr-2" title="Изменить элемент">
                                        <i class="fa fa-pencil" aria-hidden="true"></i>
                                    </span>
                                    <span class="badge badge-danger folder-delete mr-2" title="Удалить элемент">
                                        <i class="fa fa-trash-o" aria-hidden="true"></i>
                                    </span>
                                </div>
                            </div>
                        </li>
                    `;
                    if (hasParent) {
                        if ($('.folders_list').find(`.folder-elem[data-parent="${res.data.parent_id}"]`).length > 0) {
                            $('.folders_list').find(`.folder-elem[data-parent="${res.data.parent_id}"]`).last().parent().after(elemToAdd);
                        } else {
                            $('.folders_list').find(`.folder-elem[data-id="${res.data.parent_id}"]`).last().parent().after(elemToAdd);
                        }
                    } else {
                        $('.folders_list > .list-group').append(elemToAdd);
                    }
                } else if (res.data.type && res.data.type == "edit") {
                    let fElem = $('.folders_list').find(`.folder-elem[data-id="${res.data.id}"]`);
                    if (fElem.length > 0) {
                        $(fElem).attr('data-short', res.data.short_name);
                        $(fElem).attr('data-name', res.data.name);
                        $(fElem).find('.folder-title').text(`${res.data.short_name}. ${res.data.name}`);
                    }
                }
                $('#folderChangeModal').modal('hide');
            },
            error: function (res) {
                console.log(res.responseJSON.errors)
            }
        });
    });

    $('#folderDeleteModal').on('click', 'button[type="submit"]', (e) => {
        $('#folderDeleteModal').find('button.btn-submit').prop('disabled', true);
        let data = {'id': cFolderIdToDelete, 'delete': 1};
        $.ajax({
            data: data,
            type: 'POST', // GET или POST
            dataType: 'json',
            url: "folders_api",
            success: function (res) {
                if (res.data.type && res.data.type == "delete") {
                    $('.folders_list').find(`.folder-elem[data-id="${res.data.id}"]`).parent().remove();
                    $('.folders_list').find(`.folder-elem[data-parent="${res.data.id}"]`).find('.folder-point').html('<i class="fa fa-folder-open-o" aria-hidden="true"></i>');
                    $('.folders_list').find(`.folder-elem[data-parent="${res.data.id}"]`).attr('data-root', '1');
                }
                $('#folderDeleteModal').modal('hide');
            },
            error: function (res) {
                console.log(res.responseJSON.errors)
            }
        });
    });


    $('.folder-up').on('click', (e) => {
        ToggleFolderOrder("up");
    });
    $('.folder-down').on('click', (e) => {
        ToggleFolderOrder("down");
    });

    $('.folders-save').on('click', (e) => {
        let arrForIds = []; let arrForOrder = [];
        $('.folders_list').find('.folder-elem').each((ind, elem) => {
            let tId = $(elem).attr('data-id');
            arrForIds.push(tId);
            arrForOrder.push(ind+1);
        });
        let data = {'change_order': 1, 'ids_arr[]': arrForIds, 'order_arr[]': arrForOrder};
        $('.page-loader-wrapper').fadeIn();
        $.ajax({
            data: data,
            type: 'POST', // GET или POST
            dataType: 'json',
            url: "folders_api",
            success: function (res) {
                if (res.data.type && res.data.type == "change_order") {
                    window.location.reload();
                }
            },
            error: function (res) {
                console.log(res)
            },
            complete: function (res) {
                $('.page-loader-wrapper').fadeOut();
            }
        });
    });


    let NFBFolders = [];
    $('.folders-nanofb').on('click', (e) => {
        if (!NFBFolders || NFBFolders.length == 0) {
            let data = {'nfb_folders': 1};
            $('.page-loader-wrapper').fadeIn();
            $.ajax({
                data: data,
                type: 'GET', // GET или POST
                dataType: 'json',
                url: "folders_api",
                success: function (res) {
                    if (res.data.type == "nfb_folders") {
                        NFBFolders = res.data.folders;
                    }
                },
                error: function (res) {
                    NFBFolders = [];
                    console.log(res.responseJSON.errors);
                },
                complete: function (res) {
                    RenderNFBFolders(NFBFolders);
                    $('.page-loader-wrapper').fadeOut();
                }
            });
        }
        $('#folderNanoFbModal').modal('show');
    });

    $('#folderNanoFbModal').on('click', 'button[type="submit"]', (e) => {
        if (confirm("Внимание. Текущая структура папок полностью будет очищена. Вы уверены?")) {
            $('#folderNanoFbModal').find('button.btn-submit').prop('disabled', true);
            let data = {'nfb_folders_set': 1};
            $('.page-loader-wrapper').fadeIn();
            $.ajax({
                data: data,
                type: 'GET', // GET или POST
                dataType: 'json',
                url: "folders_api",
                success: function (res) {
                    if (res.data.type && res.data.type == "nfb_folders_set") {
                        window.location.reload();
                    } else {
                        swal("Ошибка", "Не удалось скопировать структуру папок.", "error");
                    }
                },
                error: function (res) {
                    console.log(res.responseJSON.errors)
                },
                complete: function (res) {
                    $('#folderNanoFbModal').find('button.btn-submit').prop('disabled', false);
                    $('.page-loader-wrapper').fadeOut();
                }
            });
        }
    });

});
