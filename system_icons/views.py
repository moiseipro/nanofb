from django.shortcuts import render
from system_icons.models import UIElement



def get_ui_elements():
    elements = {}
    data = UIElement.objects.all()
    if data.exists() and data[0].id != None:
        for elem in data:
            if elem.icon:
                elements[elem.text_id] = elem.icon.icon_color_preview
    return elements
