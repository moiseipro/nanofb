function GetHierarchyNum(elem, classList, classElem, id = 0) {
    id = $(elem).attr('data-id');
    let parentId = $(elem).attr('data-parent');
    let foundElem = $(`.${classList}`).find(`.${classElem}[data-id="${parentId}"]`);
    if (foundElem && foundElem.length > 0) {
        id = GetHierarchyNum(foundElem, classList, classElem);
    }
    return id;
}

$(function() {
    let folderList = {'order': [], 'data': {}};
    $('.folders_list').find('.list-group-item').each((ind, elem) => {
        let cNum = GetHierarchyNum($(elem).find('.folder-elem'), "folders_list", "folder-elem");
        if (folderList['data'][cNum]) {
            folderList['data'][cNum].push(elem);
        } else {
            folderList['data'][cNum] = [elem];
        }
        if (!folderList['order'].includes(cNum)) {
            folderList['order'].push(cNum);
        }
    });
    $('.folders_list > .list-group').empty();
    for (let ind in folderList['order']) {
        let key = folderList['order'][ind];
        for (let keyElem in folderList['data'][key]) {
            let tElem = folderList['data'][key][keyElem];
            let cId = $(tElem).find('.folder-elem').attr('data-id');
            if (cId != key) {
                $(tElem).find('.folder-point').html('<i class="fa fa-folder-o ml-4" aria-hidden="true"></i>');
                $(tElem).find('.folder-sub-add').empty();
                $(tElem).find('.folder-elem').attr('data-root', '0');
            } else {
                $(tElem).find('.folder-elem').attr('data-root', '1');
            }
            $('.folders_list > .list-group').append(tElem);
        }
    }
});
