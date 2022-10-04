from django.shortcuts import render
from requests import request
from system_icons.models import UIElement



def get_ui_elements(request):
    elements = {}
    data = UIElement.objects.all()
    if data.exists() and data[0].id != None:
        for elem in data:
            if elem.icon:
                hint_text = elem.hint[request.LANGUAGE_CODE] if elem.hint and request.LANGUAGE_CODE in elem.hint else ""
                elements[elem.text_id] = elem.icon.icon_color_preview(hint_text)
    return elements
