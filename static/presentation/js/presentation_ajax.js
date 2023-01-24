async function ajax_presentation_action(method, data, action = '', id = '', func = '') {

    let url = "/presentation/api/"+action+"/"
    if(id !== '') url += `${id}/`
    if(func !== '') url += `${func}/`

    await window.open(url, '_blank');
}