var d = new Date()
var days = new Date(d.getFullYear(), d.getMonth()+1, 0).getDate()-1
var middleDay = (("0" + Math.floor(days/2)).slice(-2))
var strDate = middleDay + "/" + ("0" + (d.getMonth()+1)).slice(-2) + "/" + d.getFullYear()

var microcycles_table

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

var newMicrocycle = [
    {
        id: 1,
        name:'Test',
        startDate:'27/05/2022',
        endDate:'03/06/2022',
        customClass: 'green_cell',
        href: '#event_2_'+2,
    },
    {
        id: 2,
        name:'Test',
        startDate:'06/06/2022',
        endDate:'09/06/2022',
        customClass: 'green_cell',
        href: '#event_2_'+2,
    },
    {
        id: 3,
        name:'Test',
        startDate:'17/06/2022',
        endDate:'18/06/2022',
        customClass: 'green_cell',
        href: '#event_2_'+2,
    },
    {
        id: 4,
        name:'Test',
        startDate:'19/06/2022',
        endDate:'27/06/2022',
        customClass: 'green_cell',
        href: '#event_2_'+2,
    }
];

$(window).on('load', function (){
    $('.move_to_today').text(moment().format('DD/MM/YYYY'))
    $('.refDate').val(strDate);

    generateNewCalendar(strDate)
    generateMicrocyclesTable()

    $('#microcycles').on('click', 'tbody tr', function() {
      console.log('API row values : ', microcycles_table.row(this).data());
    })
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
        microcycles: newMicrocycle,
        dataKeyField: 'name',
        dataKeyValues: ['m1', 'm2', 'tr1', 'tr2']
    });

    $('.move_to_today').click()
}

function generateMicrocyclesTable(){
    microcycles_table = $('#microcycles').DataTable({
        dom: "<'row'<'col-sm-12 col-md 'l><'col-sm-12 col-md-6'f>>" +
             "<'row'<'col-sm-12'tr>>" +
             "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
        serverSide: true,
        processing: true,
        ajax: 'api/microcycles/?format=datatables',
        columns: [
            {'data': 'name'},
            {'data': 'date_with'},
            {'data': 'date_by'},
            {'data': 'id' , render : function ( data, type, row, meta ) {
              return type === 'display'  ?
                '<a class="btn btn-sm btn-warning mx-1" href="#'+ data +'" ><i class="fa fa-pencil"></i></a>'+
                '<a class="btn btn-sm btn-danger mx-1" href="#'+ data +'" ><i class="fa fa-trash"></i></a>':
                data;
            }}
        ],
    })
}