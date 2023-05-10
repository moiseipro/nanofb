function GetHierarchyNum(elem, classList, classElem, id = 0) {
    id = $(elem).attr('data-id');
    let parentId = $(elem).attr('data-parent');
    let isParent = true;
    let foundElem = $(`.${classList}`).find(`.${classElem}[data-id="${parentId}"]`);
    if (foundElem && foundElem.length > 0) {
        isParent = false;
        id = GetHierarchyNum(foundElem, classList, classElem)[0];
    }
    return [id, isParent];
}

window.shortNameStorage = {'root': 0, 'folder': 0};
function SetNewShortName(elem) {
    const shortNameChars = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
    let isRoot = $(elem).hasClass('root-elem');
    let currentShortName = "";
    if (isRoot) {
        window.shortNameStorage['root'] += 1;
        window.shortNameStorage['folder'] = 0;
        currentShortName = shortNameChars[(window.shortNameStorage['root'] - 1) % shortNameChars.length].toUpperCase();
    } else {
        window.shortNameStorage['folder'] += 1;
        currentShortName = `${shortNameChars[(window.shortNameStorage['root'] - 1) % shortNameChars.length].toUpperCase()}${window.shortNameStorage['folder']}`;
    }
    $(elem).find('div').first().attr('data-short', currentShortName);
    let cName = $(elem).find('div').first().attr('data-name');
    $(elem).find('div').first().attr('title', `${currentShortName}. ${cName}`);
    if ($('#toggleFoldersNames').length > 0) {
        ToggleFoldersNames();
    } else {
        $(elem).find('div').first().find('.folder-title').text(`${currentShortName}. ${cName}`);
    }
}



$(function() {
    let folderList = {'order': [], 'data': {}};
    $('.folders_list').find('.list-group-item').each((ind, elem) => {
        let nums = GetHierarchyNum($(elem).find('.folder-elem'), "folders_list", "folder-elem");
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
    $('.folders_list > .list-group').empty();
    for (let ind in folderList['order']) {
        let key = folderList['order'][ind];
        for (let keyElem in folderList['data'][key]) {
            let tElem = folderList['data'][key][keyElem];
            let cId = $(tElem).find('.folder-elem').attr('data-id');
            if (cId != key) {
                // $(tElem).find('.folder-point').html(`
                //     <span class="icon-custom icon--folder ml-4" style="--i-w: 1em; --i-h: 1em;"></span>
                // `);
                $(tElem).find('.folder-point').html(``);
                $(tElem).find('.folder-sub-add').empty();
                $(tElem).find('.folder-elem').attr('data-root', '0');
            } else {
                $(tElem).find('.folder-elem').attr('data-root', '1');
                $(tElem).find('.folder-elem').find('.pull-right.border-left').addClass('d-none');
                $(tElem).addClass('root-elem');
            }
            $('.folders_list > .list-group').append(tElem);
        }
    }
    window.shortNameStorage = {'root': 0, 'folder': 0};
    $('.folders_list').find('.list-group-item').each((ind, elem) => {
        SetNewShortName(elem);
    });

    let folderNFBList = {'order': [], 'data': {}};
    $('.folders_nfb_list').find('.list-group-item').each((ind, elem) => {
        let nums = GetHierarchyNum($(elem).find('.folder-nfb-elem'), "folders_nfb_list", "folder-nfb-elem");
        let cNum = nums[0];
        let isParent = nums[1];
        if (folderNFBList['data'][cNum]) {
            if (isParent) {
                folderNFBList['data'][cNum].unshift(elem);
            } else {
                folderNFBList['data'][cNum].push(elem);
            }
        } else {
            folderNFBList['data'][cNum] = [elem];
        }
        if (!folderNFBList['order'].includes(cNum) && isParent) {
            folderNFBList['order'].push(cNum);
        }
    });
    $('.folders_nfb_list > .list-group').empty();
    for (let ind in folderNFBList['order']) {
        let key = folderNFBList['order'][ind];
        for (let keyElem in folderNFBList['data'][key]) {
            let tElem = folderNFBList['data'][key][keyElem];
            let cId = $(tElem).find('.folder-nfb-elem').attr('data-id');
            if (cId != key) {
                // $(tElem).find('.folder-point').html(`
                //     <span class="icon-custom icon--folder ml-4" style="--i-w: 1em; --i-h: 1em;"></span>
                // `);
                $(tElem).find('.folder-point').html(``);
                $(tElem).find('.folder-sub-add').empty();
                $(tElem).find('.folder-nfb-elem').attr('data-root', '0');
            } else {
                $(tElem).find('.folder-nfb-elem').attr('data-root', '1');
                $(tElem).find('.folder-nfb-elem').find('.pull-right.border-left').addClass('d-none');
                $(tElem).addClass('root-elem');
            }
            $('.folders_nfb_list > .list-group').append(tElem);
        }
    }
    window.shortNameStorage = {'root': 0, 'folder': 0};
    $('.folders_nfb_list').find('.list-group-item').each((ind, elem) => {
        SetNewShortName(elem);
    });

    let folderClubList = {'order': [], 'data': {}};
    $('.folders_club_list').find('.list-group-item').each((ind, elem) => {
        let nums = GetHierarchyNum($(elem).find('.folder-club-elem'), "folders_club_list", "folder-club-elem");
        let cNum = nums[0];
        let isParent = nums[1];
        if (folderClubList['data'][cNum]) {
            if (isParent) {
                folderClubList['data'][cNum].unshift(elem);
            } else {
                folderClubList['data'][cNum].push(elem);
            }
        } else {
            folderClubList['data'][cNum] = [elem];
        }
        if (!folderClubList['order'].includes(cNum) && isParent) {
            folderClubList['order'].push(cNum);
        }
    });
    $('.folders_club_list > .list-group').empty();
    for (let ind in folderClubList['order']) {
        let key = folderClubList['order'][ind];
        for (let keyElem in folderClubList['data'][key]) {
            let tElem = folderClubList['data'][key][keyElem];
            let cId = $(tElem).find('.folder-club-elem').attr('data-id');
            if (cId != key) {
                // $(tElem).find('.folder-point').html(`
                //     <span class="icon-custom icon--folder ml-4" style="--i-w: 1em; --i-h: 1em;"></span>
                // `);
                $(tElem).find('.folder-point').html(``);
                $(tElem).find('.folder-sub-add').empty();
                $(tElem).find('.folder-club-elem').attr('data-root', '0');
            } else {
                $(tElem).find('.folder-club-elem').attr('data-root', '1');
                $(tElem).find('.folder-club-elem').find('.pull-right.border-left').addClass('d-none');
                $(tElem).addClass('root-elem');
            }
            $('.folders_club_list > .list-group').append(tElem);
        }
    }
    window.shortNameStorage = {'root': 0, 'folder': 0};
    $('.folders_club_list').find('.list-group-item').each((ind, elem) => {
        SetNewShortName(elem);
    });

    let allFolders = $('.folders_div').find('.list-group-item');
    for (let i = 0; i < allFolders.length; i++) {
        let elem = allFolders[i];
        let isRoot = $(elem).hasClass('root-elem');
        try {
            if (isRoot) {
                $(allFolders[i-1]).addClass('last-elem')
            }
        } catch(e) {}
    }

});
