

function generateNewCalendar(newStartDate){
    $('#training_calendar').rescalendar({
        id: 'training_calendar',
        format: 'DD/MM/YYYY',
        jumpSize: middleDay-1,
        calSize: days,
        locale: 'ru',
        refDate: newStartDate,
        lang: {
            'today': 'Сегодня',
            'init_error': 'Error al inicializar',
            'no_data_error' : 'No se encontraron datos para mostrar'
        },
        data: newEvent,

        dataKeyField: 'name',
        dataKeyValues: ['m1', 'm2', 'tr1', 't1e1', 't1e2', 't1e3', 't1e4', 't1e5', 't1e6', 't1e7', 't1e8', 'tr2', 't2e1', 't2e2', 't2e3', 't2e4', 't2e5', 't2e6', 't2e7', 't2e8']
    });
    //correctRows();
    $('.move_to_today').click();
}