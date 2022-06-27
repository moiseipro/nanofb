var d = new Date()
var days = new Date(d.getFullYear(), d.getMonth()+1, 0).getDate()-1
var middleDay = (("0" + Math.floor(days/2)).slice(-2))
var strDate = middleDay + "/" + ("0" + (d.getMonth()+1)).slice(-2) + "/" + d.getFullYear()

var newEvent = [
    {
        id: 1,
        name:'m2',
        startDate:'01/06/2022',
        endDate:'03/06/2022',
        customClass: 'matchClass'+2,
        customValue: 1,
        title: 'TEST',
        href: '#event_2_'+2,
        text: 'MA'
    }
];

$(document).ready(function () {
    $('.move_to_today').text(strDate)
    $('.refDate').val(strDate);

    generateNewCalendar(strDate)
})

function generateNewCalendar(newStartDate){
    $('#event_calendar').rescalendar({
        id: 'training_calendar',
        format: 'DD/MM/YYYY',
        jumpSize: middleDay-1,
        calSize: days,
        locale: 'ru',
        refDate: newStartDate,
        lang: {
            'today': gettext('Today'),
            'init_error': gettext('Failed to initialize'),
            'no_data_error' : gettext('No data was found to show')
        },
        data: newEvent,
        dataKeyField: 'name',
        dataKeyValues: ['m1', 'm2', 'tr1', 'tr2']
    });

    $('.move_to_today').click()
}