var startDate, endDate, startSeason, endSeason;

(function($) {

    $.fn.rescalendar = function( options ) {

        function alert_error( error_message ){

            return [
                '<div class="error_wrapper">',

                      '<div class="thumbnail_image vertical-center">',
                      
                        '<p>',
                            '<span class="error">',
                                error_message,
                            '</span>',
                        '</p>',
                      '</div>',

                    '</div>'
            ].join('');
        
        }

        function set_template( targetObj, settings ){

            var template = '',
                id = targetObj.attr('id') || '';

            if( id == '' || settings.dataKeyValues.length == 0 ){

                targetObj.html( alert_error( settings.lang.init_error + ': No id or dataKeyValues' ) );
                return false;
            
            }

            if( settings.refDate.length != 10 ){

                targetObj.html( alert_error( settings.lang.no_ref_date ) );
                return false;
                
            }


            template = settings.template_html( targetObj, settings );

            targetObj.html( template );

            return true;

        };

        function dateInRange( date, startDate, endDate ){

            if( date == startDate || date == endDate ){
                return true;
            }

            var date1        = moment( startDate, settings.format ),
                date2        = moment( endDate, settings.format ),
                date_compare = moment( date, settings.format);

            return date_compare.isBetween( date1, date2, null, '[]' );

        }

        function dataInSet( data, name, date ){

            var obj_data = {};

            for( var i=0; i < data.length; i++){

                obj_data = data[i];

                if( 
                    name == obj_data.name &&
                    dateInRange( date, obj_data.startDate, obj_data.endDate )
                ){ 
                    
                    return obj_data;

                }

            } 

            return false;

        }

        function setData( targetObj, dataKeyValues, data, microcycles ){

            var html          = '',
                html2         = '',
                dataKeyValues = dataKeyValues ? dataKeyValues : settings.dataKeyValues,
                data          = data ? data : settings.data,
                microcycles   = microcycles ? microcycles : settings.microcycles,
                arr_dates     = [],
                name          = '',
                content       = '',
                hasEventClass = '',
                customClass   = '',
                customValue   = '',
                classInSet    = false,
                obj_data      = {};

            targetObj.find('td.day_cell').each( function(index, value){

                arr_dates.push( $(this).attr('data-cellDate') );

            });

            var j = 0
            for( var i=0; i<microcycles.length; i++){
                title = '';
                date    = '';
                obj_data    = microcycles[i];
                var start_date = moment(obj_data.startDate, settings.format);
                var end_date = moment(obj_data.endDate, settings.format);
                day_count = end_date.diff(start_date, 'days')+1
                empty_count = 0;
                filled_count = 0;
                if(dateInRange( obj_data.endDate, arr_dates[0], arr_dates[arr_dates.length-1] ) ||
                   dateInRange( obj_data.startDate, arr_dates[0], arr_dates[arr_dates.length-1] )){
                    while (j < arr_dates.length) {
                        date     = arr_dates[j];
                        //console.log(dateInRange( date, obj_data.startDate, obj_data.endDate ))
                        if(dateInRange( date, obj_data.startDate, obj_data.endDate )){
                            filled_count++;
                        } else {
                            if(filled_count==0) {
                                empty_count++;
                            } else {
                                break
                            }
                        }
                        j++
                    }
                }

                if(empty_count!=0) html2 += '<td colspan="'+empty_count+'" class="microcycle_cell empty_cell">' + '---' + '</td>'

                if( obj_data.title ){ title = ' title="' + obj_data.name + '" '; }
                if( obj_data.customClass ){ customClass = obj_data.customClass }


                if(filled_count!=0)html2 += '<td colspan="'+filled_count+'" data-start="'+obj_data.startDate+'" data-end="'+obj_data.endDate+'" data-toggle="tooltip" '+title+' data-html="true" class="microcycle_cell ' + customClass + '">' + day_count + '</td>';


                if(i==microcycles.length-1){
                    empty_days_count = arr_dates.length-j
                    if(empty_days_count!=0) html2 += '<td colspan="'+empty_days_count+'" class="microcycle_cell empty_cell">' + '---' + '</td>'
                }
            }

            for( var i=0; i<dataKeyValues.length; i++){

                content = '';
                date    = '';
                name    = dataKeyValues[i];

                html += '<tr class="dataRow">';
                //html += '<td class="firstColumn">' + name + '</td>';
                
                for( var j=0; j < arr_dates.length; j++ ){

                    title    = '';
                    text     = '&nbsp;';
                    href     = '';
                    date     = arr_dates[j];
                    obj_data = dataInSet( data, name, date );
                    
                    if( typeof obj_data === 'object' ){
                        
                        if( obj_data.title ){ title = ' title="' + obj_data.title + '" '; }
                        if( obj_data.text ){ text = obj_data.text; }
                        //if( obj_data.startDate ==)
                        if( obj_data.href ){ href = obj_data.href; }

                        content = '<a href="' + href + '">'+text+'</a>';
                        hasEventClass = 'hasEvent';
                        customClass = obj_data.customClass;
                        customValue = obj_data.customValue;

                    }else{

                        content       = ' ';
                        hasEventClass = '';
                        customClass   = '';
                        customValue   = '';
                    
                    }
                    
                    html += '<td data-toggle="tooltip" '+title+' data-html="true" data-date="' + date + '" data-name="' + name + '" class="data_cell ' + hasEventClass + ' ' + customClass + '" data-value="'+ customValue +'">' + content + '</td>';
                }

                html += '</tr>';

            }

            targetObj.find('.rescalendar_data_rows').html( html )
            targetObj.find('.rescalendar_microcycles_cells').html( html2 )
        }

        function setDayCells( targetObj, targetPanel, refDate ){

            var format   = settings.format,
                f_inicio = moment( refDate, format ).subtract(settings.jumpSize, 'days'),
                f_fin    = moment( f_inicio, format ).add(settings.calSize, 'days'),
                today    = moment( ).startOf('day'),
                html_day            = /*'<td class="firstColumn"></td>'*/'',
                html_month          = /*'<td class="firstColumn"></td>'*/'',
                f_aux           = '',
                f_aux_format    = '',
                dia             = '',
                dia_semana      = '',
                num_dia_semana  = 0,
                mes             = '',
                clase_today     = '',
                clase_middleDay = '',
                clase_disabled  = '',
                middleDay       = targetPanel.find('input.refDate').val();
            
            startDate = f_inicio.format('DD.MM.YYYY');
            endDate = f_fin.format('DD.MM.YYYY');
            //console.log(startDate+":"+endDate);

            var moth_num = f_inicio.format('MM');
            var day_next = 0, day_prev = 0;
            var month_next, month_prev;
            for( var i = 0; i< (settings.calSize + 1) ; i++){

                clase_disabled = '';

                f_aux        = moment( f_inicio ).add(i, 'days');
                f_aux_format = f_aux.format( format );

                var cur_month = f_aux.format('MM');

                dia        = f_aux.format('DD');
                mes        = f_aux.locale( settings.locale ).format('MMMM').replace('.','');
                dia_semana = f_aux.locale( settings.locale ).format('dd');
                num_dia_semana = f_aux.day();

                f_aux_format == today.format( format ) ? clase_today     = 'today'         : clase_today = '';
                f_aux_format == middleDay              ? clase_middleDay = 'middleDay' : clase_middleDay = '';

                if( 
                    settings.disabledDays.indexOf(f_aux_format) > -1 ||
                    settings.disabledWeekDays.indexOf( num_dia_semana ) > -1
                ){
                    
                    clase_disabled = 'disabledDay';
                }
                if(moth_num == cur_month){
                    day_next++;
                    month_next = mes;
                } else{
                    day_prev++;
                    month_prev = mes;
                }

                html_day += [
                    '<td class="day_cell ' + clase_today + ' ' + clase_middleDay + ' ' + clase_disabled + '" data-cellDate="' + f_aux_format + '">',
                        '<span class="text-center dia">' + dia + '</span>',
                        '<span class="text-center text-bold dia_semana">' + dia_semana + '</span>',
                        //'<span class="mes">' + mes + '</span>',
                    '</td>'
                ].join('');

            }
            if(day_next!=0){
                html_month += [
                    '<td colspan="'+day_next+'" class="month_cell">',
                        '<span class="mes">' + month_next + '</span>',
                    '</td>',
                ].join('');
            }
            if(day_prev!=0){
                html_month += [
                    '<td colspan="'+day_prev+'" class="month_cell">',
                        '<span class="mes">' + month_prev + '</span>',
                    '</td>',
                ].join('');
            }

            targetObj.find('.rescalendar_month_cells').html( html_month );
            targetObj.find('.rescalendar_day_cells').html( html_day );

            addTdClickEvent( targetObj, targetPanel );

            setData( targetObj )

            $(targetObj).trigger('rescalendar.update');
        }

        //Перейти на день по клику
        function addTdClickEvent(targetObj, targetPanel){

            var day_cell = targetObj.find('td.day_cell');

            /*day_cell.on('click', function(e){
            
                var cellDate = e.currentTarget.attributes['data-cellDate'].value;

                targetPanel.find('input.refDate').val( cellDate );

                setDayCells( targetObj, targetPanel, moment(cellDate, settings.format) );

            });*/

        }

        function change_day( targetObj, targetPanel, action, num_days ){

            var refDate = targetPanel.find('input.refDate').val(),
                f_ref = '';

            var date_arr = refDate.split("/");
            var d = new Date(date_arr[2], date_arr[1], date_arr[0]);
            var check_season = new Date(date_arr[2], date_arr[1], date_arr[0]);

            if( action == 'subtract'){
                check_season.setMonth(check_season.getMonth() - 1);
                check_season.setDate(check_season.getDate()-1);
                if(check_season.getTime()<startSeason) return;
                f_ref = moment( refDate, settings.format ).subtract(num_days, 'days');    
            }else{
                check_season.setMonth(check_season.getMonth() - 1);
                check_season.setDate(check_season.getDate()+1);
                if(check_season.getTime()>endSeason) return;
                f_ref = moment( refDate, settings.format ).add(num_days, 'days');
            }
            
            targetPanel.find('input.refDate').val( f_ref.format( settings.format ) );

            setDayCells( targetObj, targetPanel, f_ref );

        }
        function change_month( targetObj, targetPanel, action){
            
            var refDate = targetPanel.find('input.refDate').val(),
                f_ref = '';

            var date_arr = refDate.split("/");
            var d = new Date(date_arr[2], date_arr[1], date_arr[0]);
            var check_season = new Date(date_arr[2], date_arr[1], date_arr[0]);
            
            if( action == 'subtract'){
                d.setMonth(d.getMonth() - 2);
                check_season.setMonth(check_season.getMonth() - 2);
                check_season.setDate(1);
                if(check_season.getTime()<startSeason) return;
            } else {
                //check_season.setMonth(check_season.getMonth() + 1);
                check_season = new Date(check_season.getFullYear(), check_season.getMonth() + 1, 0);
                if(check_season.getTime()>endSeason) return;
            }
            
            //console.log(check_season.getTime()+'||||||||||'+startSeason);
            var days = new Date(d.getFullYear(), d.getMonth()+1, 0).getDate()-1;
            var middleDay = (("0" + Math.floor(days/2)).slice(-2));
            var strDate = middleDay + "/" + ("0" + (d.getMonth()+1)).slice(-2) + "/" + d.getFullYear();
            
            settings.calSize = days;
            settings.jumpSize = middleDay-1;
            //console.log(settings.calSize+":"+ strDate)

            f_ref = moment( strDate, settings.format );

            targetPanel.find('input.refDate').val( f_ref.format( settings.format ) );

            setDayCells( targetObj, targetPanel, f_ref );

        }
        function today_month( targetObj, targetPanel){
            
            var refDate = moment().format('DD/MM/YYYY'),
                f_ref = '';

            var date_arr = refDate.split("/");
            var d = new Date(date_arr[2], date_arr[1]-1, date_arr[0]);
            var check_season = new Date(date_arr[2], date_arr[1], date_arr[0]);

            //console.log(refDate+'___'+d);
            if(check_season.getTime()<startSeason) d = new Date(startSeason);
            else if(check_season.getTime()>endSeason) d = new Date(endSeason);

            var days = new Date(d.getFullYear(), d.getMonth()+1, 0).getDate()-1;
            var middleDay = (("0" + Math.floor(days/2)).slice(-2));
            var strDate = middleDay + "/" + ("0" + (d.getMonth()+1)).slice(-2) + "/" + d.getFullYear();
            
            settings.calSize = days;
            settings.jumpSize = middleDay-1;
            //console.log(settings.calSize+":"+ strDate)

            f_ref = moment( strDate, settings.format );

            targetPanel.find('input.refDate').val( f_ref.format( settings.format ) );

            setDayCells( targetObj, targetPanel, f_ref );

        }

        // INITIALIZATION
        var settings = $.extend({
            id           : 'rescalendar',
            format       : 'YYYY-MM-DD',
            refDate      : moment().format( 'YYYY-MM-DD' ),
            jumpSize     : 14,
            calSize      : 30,
            locale       : 'ru',
            disabledDays : [],
            disabledWeekDays: [],
            dataKeyField: 'name',
            dataKeyValues: [],
            data: {},
            microcycles: {},

            lang: {
                'init_error' : 'Error when initializing',
                'no_data_error': 'No data found',
                'no_ref_date'  : 'No refDate found',
                'today'   : 'Today'
            },

            template_html: function( targetObj, settings ){
                
                var id      = targetObj.attr('id'),
                    refDate = settings.refDate ;

                return [

                    '<div class="rescalendar ' , id , '_wrapper">',

                        /*'<div class="rescalendar_controls row">',
                            '<div class="col-12 text-center">',
                                '<button class="select_filter_training btn btn-primary btn-sm mx-1 move_to_last_month"> << </button>',
                                '<button class="select_filter_training btn btn-primary btn-sm mx-1 move_to_yesterday"> < </button>',

                                '<input class="refDate select_filter_training" type="text" value="' + refDate + '" />',
                                
                                '<button class="select_filter_training btn btn-primary btn-sm mx-1 move_to_tomorrow"> > </button>',
                                '<button class="select_filter_training btn btn-primary btn-sm mx-1 move_to_next_month"> >> </button>',
                                '<button class="select_filter_training btn btn-primary btn-sm mx-1 move_to_today"> ' + settings.lang.today + ' </button>',
                            '</div>',

                        '</div>',*/

                        '<table class="rescalendar_table">',
                            '<thead>',
                                '<tr class="rescalendar_month_cells"></tr>',
                                '<tr class="rescalendar_microcycles_cells"></tr>',
                                '<tr class="rescalendar_day_cells"></tr>',
                            '</thead>',
                            '<tbody class="rescalendar_data_rows">',
                                
                            '</tbody>',
                        '</table>',
                        
                    '</div>',

                ].join('');

            }

        }, options);


        return this.each( function() {
            
            //var targetObj = $(this);
            var targetObj = $(this);
            var targetPanel = $('.rescalendar_controls');

            set_template( targetObj, settings);

            setDayCells( targetObj, targetPanel, settings.refDate );

            // Events
            var move_to_last_month = targetPanel.find('.move_to_last_month'),
                move_to_yesterday  = targetPanel.find('.move_to_yesterday'),
                move_to_tomorrow   = targetPanel.find('.move_to_tomorrow'),
                move_to_next_month = targetPanel.find('.move_to_next_month'),
                move_to_today      = targetPanel.find('.move_to_today'),
                refDate            = targetPanel.find('.refDate');

            move_to_last_month.on('click', function(e){
                
                change_month( targetObj, targetPanel, 'subtract');

            });

            move_to_yesterday.on('click', function(e){
                
                change_day( targetObj, targetPanel, 'subtract', 1);

            });

            move_to_tomorrow.on('click', function(e){
                
                change_day( targetObj, targetPanel, 'add', 1);

            });

            move_to_next_month.on('click', function(e){
                
                change_month( targetObj, targetPanel, 'add');

            });

            refDate.on('blur', function(e){
                
                var refDate = targetPanel.find('input.refDate').val();
                setDayCells( targetObj, targetPanel, refDate );

            });

            move_to_today.on('click', function(e){
                
                var today = moment().startOf('day').format( settings.format );
                targetPanel.find('input.refDate').val( today );

                today_month( targetObj, targetPanel );

            });


            return this;

        });

    } // end rescalendar plugin


}(jQuery));