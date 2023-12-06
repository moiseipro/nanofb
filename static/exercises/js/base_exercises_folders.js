function ToggleFolderOrder(dir, folders) {
    let activeElem = $(folders).find(`.list-group-item.active:visible`);
    if (activeElem.length > 0) {
        let elementClass = $(activeElem).find('div').hasClass('folder-elem') ? "folder-elem" : "folder-nfb-elem";
        let cID = $(activeElem).find(`.${elementClass}`).attr('data-id');
        let cParentID = $(activeElem).find(`.${elementClass}`).attr('data-parent');
        let isRoot = $(activeElem).find(`.${elementClass}`).attr('data-root');
        if (isRoot == '1') {
            let elems = $(folders).find(`.${elementClass}[data-root="1"]:visible`).parent();
            let tFirst = null; let tLast = null; let newInd = 0;
            let children = $(folders).find(`.${elementClass}[data-root="0"]:visible`).parent();
            $(folders).find(`.${elementClass}[data-root="0"]:visible`).parent().remove();
            for (let i = 0; i < elems.length; i++) {
                if ($(elems[i]).find(`.${elementClass}`).attr('data-id') == cID) {
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
                let parentId = $(elem).find(`.${elementClass}`).attr('data-parent');
                $(folders).find(`.${elementClass}[data-id="${parentId}"]:visible`).parent().after(elem);
            }
        } else {
            let elems = $(folders).find(`.${elementClass}[data-parent="${cParentID}"]:visible`).parent();
            let tFirst = null; let tLast = null; let newInd = 0;
            for (let i = 0; i < elems.length; i++) {
                if ($(elems[i]).find(`.${elementClass}`).attr('data-id') == cID) {
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
            <li class="list-group-item p-1">
                <div class="nfb-folder-elem d-flex justify-content-between" 
                    data-id="${elem.id}" data-parent="${elem.parent}" 
                    data-short="${elem.short_name}" data-name="${elem.name}" data-root="0">
                    <div class="pull-left">
                        <span class="folder-point mr-2">
                            <span class="icon-custom icon--folder ml-1" style="--i-w: 1em; --i-h: 1em;"></span>
                        </span>
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
            let nums = GetHierarchyNum($(elem).find('.nfb-folder-elem'), "nfb_folders_list", "nfb-folder-elem");
            let cNum = nums[0];
            let isParent = nums[1];
            if (folderList['data'][cNum]) {
                if (isParent) {
                    folderList['data'][cNum].unshift(elem);
                } else {
                    folderList['data'][cNum].push(elem);
                }
            } else {
                folderList['data'][cNum] = [elem];
            }
            if (!folderList['order'].includes(cNum) && isParent) {
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
                    // $(tElem).find('.folder-point').html(`
                    //     <span class="icon-custom icon--folder ml-4" style="--i-w: 1em; --i-h: 1em;"></span>
                    // `);
                    $(tElem).find('.folder-point').html(``);
                    $(tElem).find('.folder-elem').attr('data-root', '0');
                } else {
                    $(tElem).find('.folder-elem').attr('data-root', '1');
                    $(tElem).addClass('root-elem');
                }
                $('#folderNanoFbModal').find('.nfb_folders_list > .list-group').append(tElem);
            }
        }
        window.shortNameStorage = {'root': 0, 'folder': 0};
        $('#folderNanoFbModal').find('.list-group-item').each((ind, elem) => {
            SetNewShortName(elem);
        });
    }, 250);
}


$(function() {

    $('.card-inside').find('.folders_div[data-id="nfb_folders"]').removeClass('d-none');
    $('.card-inside').find('.folders-team').append($('.card-inside').find('.folders_div[data-id="team_folders"]'));
    if ($('.card-inside').find('.folders-nfb-btn-check').length == 0) {
        $('.card-inside').find('.folders_div[data-id="nfb_folders"]').find('span.badge').remove();
    }

    $('.folders_div').on('click', '.list-group-item', (e) => {
        $('.folders_div').find('.list-group-item:visible').removeClass('active');
        $(e.currentTarget).toggleClass('active');
    });

    let cFolderIdToChange = null; let cParentIdToChange = null;
    let cFolderType = "";
    $('.folder-add').on('click', (e) => {
        cFolderIdToChange = null; cParentIdToChange = null;
        cFolderType = $(e.currentTarget).parent().parent().parent().parent().parent().find('.folders_div_wrapper').attr('data-id');
        $('#folderChangeModal').find('input[name="short_name"]').val('');
        $('#folderChangeModal').find('input[name="name"]').val('');
        $('#folderChangeModal').modal('show');
    });
    $('.folders_div').on('click', '.folder-sub-add', (e) => {
        let cId = $(e.currentTarget).parent().parent().attr('data-id');
        cFolderIdToChange = null; cParentIdToChange = cId;
        cFolderType = $(e.currentTarget).parent().parent().parent().parent().parent().attr('data-id');
        $('#folderChangeModal').find('input[name="short_name"]').val('');
        $('#folderChangeModal').find('input[name="name"]').val('');
        $('#folderChangeModal').modal('show');
    });
    $('.folders_div').on('click', '.folder-edit', (e) => {
        let cId = $(e.currentTarget).parent().parent().attr('data-id');
        let short = $(e.currentTarget).parent().parent().attr('data-short');
        let name = $(e.currentTarget).parent().parent().attr('data-name');
        cFolderIdToChange = cId; cParentIdToChange = null;
        cFolderType = $(e.currentTarget).parent().parent().parent().parent().parent().attr('data-id');
        $('#folderChangeModal').find('input[name="short_name"]').val(short);
        $('#folderChangeModal').find('input[name="name"]').val(name);
        $('#folderChangeModal').modal('show');
    });

    let cFolderIdToDelete = null;
    $('.folders_div').on('click', '.folder-delete', (e) => {
        let cId = $(e.currentTarget).parent().parent().attr('data-id');
        cFolderIdToDelete = cId;
        cFolderType = $(e.currentTarget).parent().parent().parent().parent().parent().attr('data-id');
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
        let data = {
            'edit': 1, 'id': cFolderIdToChange, 'parent_id': cParentIdToChange, 
            'name': name, 'short_name': shortName, 'f_type': cFolderType
        };
        console.log(data['f_type'])
        $('.page-loader-wrapper').fadeIn();
        $.ajax({
            headers:{"X-CSRFToken": csrftoken},
            data: data,
            type: 'POST', // GET или POST
            dataType: 'json',
            url: "folders_api",
            success: function (res) {
                if (res.data.type && res.data.type == "add") {
                    window.location.reload();
                } else if (res.data.type && res.data.type == "edit") {
                    let fElem = null;
                    if (res.data.is_nfb) {
                        fElem = $('.folders_div').find(`.folder-nfb-elem[data-id="${res.data.id}"]`);
                    } else {
                        fElem = $('.folders_div ').find(`.folder-elem[data-id="${res.data.id}"]`);
                    }
                    if (fElem && fElem.length > 0) {
                        $(fElem).attr('data-short', res.data.short_name);
                        $(fElem).attr('data-name', res.data.name);
                        $(fElem).find('.folder-title').text(`${res.data.short_name}. ${res.data.name}`);
                    }
                }
                $('#folderChangeModal').modal('hide');
            },
            error: function (res) {
                console.log(res.responseJSON.errors)
            },
            complete: function (res) {
                $('.page-loader-wrapper').fadeOut();
            }
        });
    });

    $('#folderDeleteModal').on('click', 'button[type="submit"]', (e) => {
        $('#folderDeleteModal').find('button.btn-submit').prop('disabled', true);
        let data = {'id': cFolderIdToDelete, 'delete': 1, 'f_type': cFolderType};
        $('.page-loader-wrapper').fadeIn();
        $.ajax({
            headers:{"X-CSRFToken": csrftoken},
            data: data,
            type: 'POST', // GET или POST
            dataType: 'json',
            url: "folders_api",
            success: function (res) {
                if (res.data.type && res.data.type == "delete") {
                    window.location.reload();
                }
                $('#folderDeleteModal').modal('hide');
            },
            error: function (res) {
                console.log(res.responseJSON.errors)
            },
            complete: function (res) {
                $('.page-loader-wrapper').fadeOut();
            }
        });
    });


    $('.folder-up').on('click', (e) => {
        let foldersElem = $(e.currentTarget).parent().parent().parent().find('.folders_div');
        ToggleFolderOrder("up", foldersElem);
    });
    $('.folder-down').on('click', (e) => {
        let foldersElem = $(e.currentTarget).parent().parent().parent().find('.folders_div');
        ToggleFolderOrder("down", foldersElem);
    });

    $('.folders-save').on('click', (e) => {
        let arrForIds = []; let arrForOrder = [];
        $(e.currentTarget).parent().parent().parent().find('.folders_div').find('div:visible').each((ind, elem) => {
            let tId = $(elem).attr('data-id');
            arrForIds.push(tId);
            arrForOrder.push(ind+1);
        });
        cFolderType = $(e.currentTarget).parent().parent().parent().find('.folders_div').attr('data-id');
        let data = {'change_order': 1, 'ids_arr[]': arrForIds, 'order_arr[]': arrForOrder, 'f_type': cFolderType};
        $('.page-loader-wrapper').fadeIn();
        $.ajax({
            headers:{"X-CSRFToken": csrftoken},
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


    // let NFBFolders = [];
    // $('.folders-nanofb').on('click', (e) => {
    //     if (!NFBFolders || NFBFolders.length == 0) {
    //         let data = {'nfb_folders': 1};
    //         $('.page-loader-wrapper').fadeIn();
    //         $.ajax({
    //             headers:{"X-CSRFToken": csrftoken},
    //             data: data,
    //             type: 'GET', // GET или POST
    //             dataType: 'json',
    //             url: "folders_api",
    //             success: function (res) {
    //                 if (res.data.type == "nfb_folders") {
    //                     NFBFolders = res.data.folders;
    //                 }
    //             },
    //             error: function (res) {
    //                 NFBFolders = [];
    //                 console.log(res.responseJSON.errors);
    //             },
    //             complete: function (res) {
    //                 RenderNFBFolders(NFBFolders);
    //                 $('.page-loader-wrapper').fadeOut();
    //             }
    //         });
    //     }
    //     $('#folderNanoFbModal').modal('show');
    // });

    // $('#folderNanoFbModal').on('click', 'button[type="submit"]', (e) => {
    $('.folder-nf-copy').on('click', (e) => {
        swal({
            title: "Вы точно хотите выбрать данную структуру?",
            text: "Внимание! После данной операции текущая структура папок будет полностью очищена, все упражнения в этих папках будут удалены.",
            icon: "warning",
            buttons: ["Отмена", "Подтвердить"],
            dangerMode: true,
        })
        .then((willChange) => {
            if (willChange) {
                $('#folderNanoFbModal').find('button.btn-submit').prop('disabled', true);
                let data = {'nfb_folders_set': 1};
                $('.page-loader-wrapper').fadeIn();
                $.ajax({
                    headers:{"X-CSRFToken": csrftoken},
                    data: data,
                    type: 'GET', // GET или POST
                    dataType: 'json',
                    url: "folders_api",
                    success: function (res) {
                        if (res.data.type && res.data.type == "nfb_folders_set") {
                            window.location.reload();
                        } else {
                            swal(gettext("Error"), gettext("Failed to copy folder structure."), "error");
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

    
});
