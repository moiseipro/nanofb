import re
from datetime import datetime, date, timedelta


LANG_CODE_DEFAULT = "en"
FOLDER_TEAM = "team_folders"
FOLDER_NFB = "nfb_folders"
FOLDER_CLUB = "club_folders"
FOLDER_TRAINER = "__is_trainer"


def get_by_language_code(value, code):
    """
    Return a value by current language's code.

    :param value: Dictionary with structure("code_1": "value_1",...) for different languages. Usually "value" is STRING.
    :type value: dict[str]
    :param code: String key of any language. For example: "engilsh" -> "en", "russian" -> "ru".
    :type code: [str]
    :raise None. In case of an exception, the result: "". 
        If it was not possible to find the desired value by the key, then an attempt will be made to take the default (LANG_CODE_DEFAULT).
    :return: Value, depending on the current language.
    :rtype: [str]

    """
    res = ""
    if not isinstance(value, dict):
        value = {}
    try:
        res = value[code]
    except:
        pass
    if res == "":
        try:
            res = value[LANG_CODE_DEFAULT]
        except:
            pass
    if res is None:
        res = ""
    return res


def set_by_language_code(elem, code, value, value2 = None):
    """
    Return edited object as dict where key: language code, value: string text.

    :param elem: Field of current model. Usually it defined as title, name or description.
    :type elem: [Model.field]
    :param code: String key of any language. For example: "engilsh" -> "en", "russian" -> "ru".
    :type code: [str]
    :param value: New value for returned dictionary.
    :type value: [str]
    :param value2: Additional value for replace "value".
    :type value2: [str] or None
    :return: Object which is field of the Model.
    :rtype: [object]

    """
    if value2:
        value = value2 if value2 != "" else value
    if type(elem) is dict:
        elem[code] = value
    else:
        elem = {code: value}
    return elem


def months_between(start_date, end_date):
    """
    Return every first day of the month from start date to end date as DATE. Using yield.

    :param start_date: Start date of required range.
    :type start_date: [date]
    :param end_date: End date of required range.
    :type end_date: [date]
    :raise AttributeError. In case "start_date" or "end_date" not DATE, result: exception.
    :return: Every first day of the month from start date to end date.
    :rtype: yield[date]

    """
    year = start_date.year
    month = start_date.month
    while (year, month) <= (end_date.year, end_date.month):
        yield date(year, month, 1)
        if month == 12:
            month = 1
            year += 1
        else:
            month += 1


def set_value_as_int(request, name, def_value = None):
    """
    Return new value for the Model's Field. Value is obtained by get from request parameter's value and try to transform it to int.
    In case of success new value will be returned else returned default value.

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param name: Name of getting request parameter.
    :type name: [str]
    :param def_value: Default value for new value.
    :type def_value: [int] or None
    :return: New value.
    :rtype: [int] or None

    """
    res = def_value
    try:
        res = int(request.POST.get(name, def_value))
    except:
        pass
    return res


def set_value_as_int2(value, def_value = None):
    """
    Return new value for the Model's Field. Value is obtained by get from request parameter's value and try to transform it to int.
    In case of success new value will be returned else returned default value.

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param name: Name of getting request parameter.
    :type name: [str]
    :param def_value: Default value for new value.
    :type def_value: [int] or None
    :return: New value.
    :rtype: [int] or None

    """
    res = def_value
    try:
        res = int(value)
    except:
        pass
    return res


def set_value_as_list(request, name, name2 = None, def_value = None):
    """
    Return new value as list which was received by request using argument "name" or additional: "name2".
    In case of success new value will be returned else returned default value.

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param name: Name of getting request parameter.
    :type name: [str]
    :param name2: Additional name of getting request parameter.
    :type name2: [str]
    :param def_value: Default value for new value.
    :type def_value: [int] or None
    :return: New value for setting to field.
    :rtype: list[any] or None

    """
    res = def_value
    value_from_req = request.POST.getlist(name, def_value)
    value2_from_req = request.POST.getlist(name2, def_value)
    if name2 and type(value2_from_req) is list and len(value2_from_req) > 0:
        value_from_req = value2_from_req
    if type(value_from_req) is list and len(value_from_req) > 0:
        res = value_from_req
    return res


def set_refs_translations(data, lang_code):
    """
    Return data with new key "title". "Title" - translated value with key "translation_names" at current system's language.

    :param data: Dictionary with references' elements.
    :type data: dict[object]
    :param lang_code: String key of any language. For example: "engilsh" -> "en", "russian" -> "ru".
    :type lang_code: [str]
    :return: Dictionary with references' elements with new value for key "title".
    :rtype: dict[object]

    """
    for key in data:
        elems = data[key]
        for elem in elems:
            if 'translation_names' in elem:
                title = get_by_language_code(elem['translation_names'], lang_code)
                elem['title'] = title if title != "" else elem['name']
    return data


def set_as_object(request, data, name, lang):
    """
    Return changed data of JSONField, checking values from request by parametres: "type", "value", "id".
    JSONField is a dictionary whose keys are language's codes and values are list of objects:
    {'type': [str], 'value': [str], 'id': [str]}

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param data: JSONField with next template: {'en': [{'type': [str], 'value': [str], 'id': [str]}, ...], 'ru': [], ...}.
    :type data: Model.Field[object]
    :param name: Name of request parameter.
    :type name: [str]
    :param lang: String key of any language. For example: "engilsh" -> "en", "russian" -> "ru".
    :type lang: [str]
    :return: JSONField with edited values.
    :rtype: Model.Field[object]

    """
    value = []
    flag = True
    iterator = 0
    while flag:
        data_type = request.POST.get(f"data[{name}[]][{iterator}][type]")
        data_value = request.POST.get(f"data[{name}[]][{iterator}][value]")
        data_id = request.POST.get(f"data[{name}[]][{iterator}][id]")
        iterator += 1
        if iterator > 10 or data_type == None:
            flag = False
            break
        else:
            to_append = {'type': data_type, 'value': data_value}
            if data_id:
                to_append['id'] = data_id
            value.append(to_append)
    if type(data) is dict:
        data[lang] = value
    else:
        data = {lang: value}
    return data


def set_value_as_datetime(value):
    """
    Return Date or None. Transforming value to date using format "ddmmyyyy" or "yyyymmdd".

    :param value: Date string.
    :type value: [str]
    :return: Date or None.
    :rtype: [date] or None

    """
    format_ddmmyyyy = "%d/%m/%Y %H:%M:%S"
    format_yyyymmdd = "%Y-%m-%d %H:%M:%S"
    date1 = None
    date2 = None
    try:
        date1 = datetime.strptime(value, format_ddmmyyyy)
    except:
        pass
    try:
        date2 = datetime.strptime(value, format_yyyymmdd)
    except:
        pass
    if date1:
        value = date1
    elif date2:
        value = date2
    else:
        value = None
    return value


def set_value_as_duration(value, only_mins=True):
    """
    Return Timedelta. Transforming value to timeDelta.

    :param value: Date string.
    :type value: [str]
    :param only_mins: If only minutes then time will be created using only minutes. Example: True -> "20", False -> "10:20:10"
    :type only_mins: [bool]
    :return: Timedelta.
    :rtype: [timedelta]

    """
    if not only_mins:
        m = re.match(r'(?P<h>\d+):(?P<m>\d+):'r'(?P<s>\d[\.\d+]*)', value)
        if not m:
            return timedelta()
        time_dict = {key: float(val) for key, val in m.groupdict().items()}
    else:
        mins_val = 0
        try:
            mins_val = int(value)
        except:
            pass
        time_dict = {'h': 0, 'm': mins_val, 's': 0}
    return timedelta(hours=time_dict['h'], minutes=time_dict['m'], seconds=time_dict['s'])


def get_date_str_from_datetime(datetime_obj, code):
    """
    Return Date string or None. For different languages different date's formats.

    :param datetime_obj: Datetime object.
    :type datetime_obj: [datetime]
    :param code: String key of any language. For example: "engilsh" -> "en", "russian" -> "ru".
    :type code: [str]
    :return: Date string or None.
    :rtype: [str] or None

    """
    formats = {
        'en': "%Y-%m-%d",
        'ru': "%d/%m/%Y"
    }
    date_str = ""
    try:
        date_str = datetime_obj.strftime(formats[code])
    except:
        return None
    return date_str


def get_date_timestamp_from_datetime(datetime_obj):
    """
    Return Date's timestamp or None.

    :param datetime_obj: Datetime object.
    :type datetime_obj: [datetime]
    :return: Date's timestamp or None.
    :rtype: [int] or None

    """
    try:
        return datetime_obj.timestamp()
    except:
        return None


def get_day_from_datetime(datetime_obj, code):
    """
    Return Day of date string or None.

    :param datetime_obj: Datetime object.
    :type datetime_obj: [datetime]
    :param code: String key of any language. For example: "engilsh" -> "en", "russian" -> "ru".
    :type code: [str]
    :return: Day string or None.
    :rtype: [str] or None

    """
    days = {
        'ru': ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"],
        'en': ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    }
    day = None
    try:
        day = days[code][datetime_obj.weekday()]
    except:
        pass
    return day


def get_time_from_datetime(datetime_obj):
    """
    Return time string of datetime as "Hour:Minutes".

    :param datetime_obj: Datetime object.
    :type datetime_obj: [datetime]
    :return: Time string or None.
    :rtype: [str] or None

    """
    time_str = None
    try:
        time_str = datetime_obj.strftime("%H:%M")
    except:
        pass
    return time_str


def get_duration_normal_format(timedelta_obj, only_mins=True):
    """
    Return duration of datetime as string.

    :param timedelta_obj: Datetime object.
    :type timedelta_obj: [datetime]
    :param only_mins: If only minutes then duration will be created using only minutes. Example: True -> "20", False -> "10:20:10"
    :type only_mins: [bool]
    :return: Duration string of datetime object or None.
    :rtype: [str] or None

    """
    duration_str = None
    if not only_mins:
        try:
            t_arr = str(timedelta_obj).split(':')
            duration_str = "{:02}:{:02}:{:02}".format(int(t_arr[0]), int(t_arr[1]), int(t_arr[2]))
        except:
            pass
    else:
        try:
            mins_v = round(timedelta_obj.total_seconds() / 60)
            duration_str = f"{mins_v}"
        except:
            pass
    return duration_str
