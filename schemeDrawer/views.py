from django.shortcuts import render, redirect
from django.http import JsonResponse
from users.models import User
from django.views.decorators.clickjacking import xframe_options_sameorigin
from django.contrib.staticfiles.utils import get_files
from django.contrib.staticfiles.storage import StaticFilesStorage
import os
from nanofb.settings import STATIC_URL



def generate_buttons(img_all, dirs, obj_class, group, size_e=0, additional_type=None):
    data = []
    s = StaticFilesStorage()
    for dir_elem in dirs:
        files = list(get_files(s, location=f'schemeDrawer/{dir_elem}'))
        for c_file in files:
            f_path = os.path.join(STATIC_URL, c_file)
            c_style = ""
            data_group = ""
            if size_e != 0:
                c_style = f"width: calc(${size_e}% - 0.5rem) !important;"
            if group != "":
                data_group = f'data-group={group}'
            data.append({
                'path': f_path,
                'obj_class': obj_class,
                'c_style': c_style,
                'data_group': data_group
            })
    if obj_class == '':
        obj_class = '0'
    if additional_type:
        img_all[f"{obj_class}_{group}_{additional_type}"] = data
    else:
        img_all[f"{obj_class}_{group}"] = data
    return img_all


@xframe_options_sameorigin
def drawer(request):
    if not request.user.is_authenticated:
        return redirect("authorization:login")
    cur_user = User.objects.filter(email=request.user).only("club_id")
    cur_team = -1
    try:
        cur_team = int(request.session['team'])
    except:
        pass

    img_all = {}
    img_all = generate_buttons(img_all, ['img/plane/'], 'plane', '')

    img_all = generate_buttons(img_all, ['img/gate/1/', 'img/gate/2/'], 'objGates', 'gateSmall')
    img_all = generate_buttons(img_all, ['img/gate/1/', 'img/gate/2/'], 'objGates', 'gateBig')

    img_all = generate_buttons(img_all, ['img/equipment/ball/'], 'objEquipment', 'ball')
    img_all = generate_buttons(img_all, ['img/equipment/cone/'], 'objEquipment', 'cone')
    img_all = generate_buttons(img_all, ['img/equipment/cone2/'], 'objEquipment', 'cone2')
    img_all = generate_buttons(img_all, ['img/equipment/beam/'], 'objEquipment', 'beam')
    img_all = generate_buttons(img_all, ['img/equipment/beam2/'], 'objEquipment', 'beam2')
    img_all = generate_buttons(img_all, ['img/equipment/ring/'], 'objEquipment', 'ring')
    img_all = generate_buttons(img_all, ['img/equipment/flag/'], 'objEquipment', 'flag')
    img_all = generate_buttons(img_all, ['img/equipment/stick/'], 'objEquipment', 'stick')
    img_all = generate_buttons(img_all, ['img/equipment/barrier/'], 'objEquipment', 'barrier')
    img_all = generate_buttons(img_all, ['img/equipment/ladder/'], 'objEquipment', 'ladder')

    img_all = generate_buttons(img_all, ['img/player/traners/left/'], '', 'player', additional_type="tranersleft")
    img_all = generate_buttons(img_all, ['img/player/traners/front/'], '', 'player', additional_type="tranersfront")
    img_all = generate_buttons(img_all, ['img/player/traners/back/'], '', 'player', additional_type="tranersback")
    img_all = generate_buttons(img_all, ['img/player/traners/right/'], '', 'player', additional_type="tranersright")

    img_all = generate_buttons(img_all, ['img/player/adults/1/left/'], '', 'player', additional_type="rwadultsleft")
    img_all = generate_buttons(img_all, ['img/player/adults/1/front/'], '', 'player', additional_type="rwadultsfront")
    img_all = generate_buttons(img_all, ['img/player/adults/1/back/'], '', 'player', additional_type="rwadultsback")
    img_all = generate_buttons(img_all, ['img/player/adults/1/right/'], '', 'player', additional_type="rwadultsright")

    img_all = generate_buttons(img_all, ['img/player/adults/2/left/'], '', 'player', additional_type="rbadultsleft")
    img_all = generate_buttons(img_all, ['img/player/adults/2/front/'], '', 'player', additional_type="rbadultsfront")
    img_all = generate_buttons(img_all, ['img/player/adults/2/back/'], '', 'player', additional_type="rbadultsback")
    img_all = generate_buttons(img_all, ['img/player/adults/2/right/'], '', 'player', additional_type="rbadultsright")

    img_all = generate_buttons(img_all, ['img/player/adults/3/left/'], '', 'player', additional_type="bwadultsleft")
    img_all = generate_buttons(img_all, ['img/player/adults/3/front/'], '', 'player', additional_type="bwadultsfront")
    img_all = generate_buttons(img_all, ['img/player/adults/3/back/'], '', 'player', additional_type="bwadultsback")
    img_all = generate_buttons(img_all, ['img/player/adults/3/right/'], '', 'player', additional_type="bwadultsright")

    img_all = generate_buttons(img_all, ['img/player/adults/4/left/'], '', 'player', additional_type="ybkadultsleft")
    img_all = generate_buttons(img_all, ['img/player/adults/4/front/'], '', 'player', additional_type="ybkadultsfront")
    img_all = generate_buttons(img_all, ['img/player/adults/4/back/'], '', 'player', additional_type="ybkadultsback")
    img_all = generate_buttons(img_all, ['img/player/adults/4/right/'], '', 'player', additional_type="ybkadultsright")

    img_all = generate_buttons(img_all, ['img/player/adults/5/left/'], '', 'player', additional_type="ywadultsleft")
    img_all = generate_buttons(img_all, ['img/player/adults/5/front/'], '', 'player', additional_type="ywadultsfront")
    img_all = generate_buttons(img_all, ['img/player/adults/5/back/'], '', 'player', additional_type="ywadultsback")
    img_all = generate_buttons(img_all, ['img/player/adults/5/right/'], '', 'player', additional_type="ywadultsright")

    img_all = generate_buttons(img_all, ['img/player/adults/6/left/'], '', 'player', additional_type="wbkadultsleft")
    img_all = generate_buttons(img_all, ['img/player/adults/6/front/'], '', 'player', additional_type="wbkadultsfront")
    img_all = generate_buttons(img_all, ['img/player/adults/6/back/'], '', 'player', additional_type="wbkadultsback")
    img_all = generate_buttons(img_all, ['img/player/adults/6/right/'], '', 'player', additional_type="wbkadultsright")

    img_all = generate_buttons(img_all, ['img/player/adults/7/left/'], '', 'player', additional_type="rbkadultsleft")
    img_all = generate_buttons(img_all, ['img/player/adults/7/front/'], '', 'player', additional_type="rbkadultsfront")
    img_all = generate_buttons(img_all, ['img/player/adults/7/back/'], '', 'player', additional_type="rbkadultsback")
    img_all = generate_buttons(img_all, ['img/player/adults/7/right/'], '', 'player', additional_type="rbkadultsright")

    img_all = generate_buttons(img_all, ['img/player/adultsgoal/1/left/'], '', 'player', additional_type="rwadultsgoalleft")
    img_all = generate_buttons(img_all, ['img/player/adultsgoal/1/front/'], '', 'player', additional_type="rwadultsgoalfront")
    img_all = generate_buttons(img_all, ['img/player/adultsgoal/1/back/'], '', 'player', additional_type="rwadultsgoalback")
    img_all = generate_buttons(img_all, ['img/player/adultsgoal/1/right/'], '', 'player', additional_type="rwadultsgoalright")

    img_all = generate_buttons(img_all, ['img/player/child/1/left/'], '', 'player', additional_type="rwchildleft")
    img_all = generate_buttons(img_all, ['img/player/child/1/front/'], '', 'player', additional_type="rwchildfront")
    img_all = generate_buttons(img_all, ['img/player/child/1/back/'], '', 'player', additional_type="rwchildback")
    img_all = generate_buttons(img_all, ['img/player/child/1/right/'], '', 'player', additional_type="rwchildright")

    img_all = generate_buttons(img_all, ['img/player/child/2/left/'], '', 'player', additional_type="rbchildleft")
    img_all = generate_buttons(img_all, ['img/player/child/2/front/'], '', 'player', additional_type="rbchildfront")
    img_all = generate_buttons(img_all, ['img/player/child/2/back/'], '', 'player', additional_type="rbchildback")
    img_all = generate_buttons(img_all, ['img/player/child/2/right/'], '', 'player', additional_type="rbchildright")

    img_all = generate_buttons(img_all, ['img/player/child/3/left/'], '', 'player', additional_type="bwchildleft")
    img_all = generate_buttons(img_all, ['img/player/child/3/front/'], '', 'player', additional_type="bwchildfront")
    img_all = generate_buttons(img_all, ['img/player/child/3/back/'], '', 'player', additional_type="bwchildback")
    img_all = generate_buttons(img_all, ['img/player/child/3/right/'], '', 'player', additional_type="bwchildright")

    img_all = generate_buttons(img_all, ['img/player/child/4/left/'], '', 'player', additional_type="ybkchildleft")
    img_all = generate_buttons(img_all, ['img/player/child/4/front/'], '', 'player', additional_type="ybkchildfront")
    img_all = generate_buttons(img_all, ['img/player/child/4/back/'], '', 'player', additional_type="ybkchildback")
    img_all = generate_buttons(img_all, ['img/player/child/4/right/'], '', 'player', additional_type="ybkchildright")

    img_all = generate_buttons(img_all, ['img/player/child/5/left/'], '', 'player', additional_type="ywchildleft")
    img_all = generate_buttons(img_all, ['img/player/child/5/front/'], '', 'player', additional_type="ywchildfront")
    img_all = generate_buttons(img_all, ['img/player/child/5/back/'], '', 'player', additional_type="ywchildback")
    img_all = generate_buttons(img_all, ['img/player/child/5/right/'], '', 'player', additional_type="ywchildright")
    
    img_all = generate_buttons(img_all, ['img/player/child/6/left/'], '', 'player', additional_type="wbkchildleft")
    img_all = generate_buttons(img_all, ['img/player/child/6/front/'], '', 'player', additional_type="wbkchildfront")
    img_all = generate_buttons(img_all, ['img/player/child/6/back/'], '', 'player', additional_type="wbkchildback")
    img_all = generate_buttons(img_all, ['img/player/child/6/right/'], '', 'player', additional_type="wbkchildright")

    img_all = generate_buttons(img_all, ['img/player/child/7/left/'], '', 'player', additional_type="rbkchildleft")
    img_all = generate_buttons(img_all, ['img/player/child/7/front/'], '', 'player', additional_type="rbkchildfront")
    img_all = generate_buttons(img_all, ['img/player/child/7/back/'], '', 'player', additional_type="rbkchildback")
    img_all = generate_buttons(img_all, ['img/player/child/7/right/'], '', 'player', additional_type="rbkchildright")

    img_all = generate_buttons(img_all, ['img/player/childgoal/1/left/'], '', 'player', additional_type="rwchildgoalleft")
    img_all = generate_buttons(img_all, ['img/player/childgoal/1/front/'], '', 'player', additional_type="rwchildgoalfront")
    img_all = generate_buttons(img_all, ['img/player/childgoal/1/back/'], '', 'player', additional_type="rwchildgoalback")
    img_all = generate_buttons(img_all, ['img/player/childgoal/1/right/'], '', 'player', additional_type="rwchildgoalright")

    img_all = generate_buttons(img_all, ['img/labels/numbers-new/grey/'], 'objNLabels', 'label', additional_type="grey")
    img_all = generate_buttons(img_all, ['img/labels/letters-new/grey/'], 'objNLabels', 'label2', additional_type="grey")
    img_all = generate_buttons(img_all, ['img/labels/letters-new/hexagon/grey/'], 'objNLabels', 'label3', additional_type="grey")
    img_all = generate_buttons(img_all, ['img/caps/'], 'objCaps', 'caps', additional_type="grey")
    img_all = generate_buttons(img_all, ['img/numbers/grey/'], 'objNumbers', 'number', additional_type="grey")

    img_all = generate_buttons(img_all, ['img/labels/numbers-new/black/'], 'objNLabels', 'label', additional_type="black")
    img_all = generate_buttons(img_all, ['img/labels/letters-new/black/'], 'objNLabels', 'label2', additional_type="black")
    img_all = generate_buttons(img_all, ['img/labels/letters-new/hexagon/black/'], 'objNLabels', 'label3', additional_type="black")
    img_all = generate_buttons(img_all, ['img/numbers/black/'], 'objNumbers', 'number', additional_type="black")

    img_all = generate_buttons(img_all, ['img/labels/numbers-new/black/'], 'objNLabels', 'label', additional_type="black")
    img_all = generate_buttons(img_all, ['img/labels/letters-new/black/'], 'objNLabels', 'label2', additional_type="black")
    img_all = generate_buttons(img_all, ['img/labels/letters-new/hexagon/black/'], 'objNLabels', 'label3', additional_type="black")
    img_all = generate_buttons(img_all, ['img/numbers/black/'], 'objNumbers', 'number', additional_type="black")

    img_all = generate_buttons(img_all, ['img/labels/numbers-new/red/'], 'objNLabels', 'label', additional_type="red")
    img_all = generate_buttons(img_all, ['img/labels/letters-new/red/'], 'objNLabels', 'label2', additional_type="red")
    img_all = generate_buttons(img_all, ['img/labels/letters-new/hexagon/red/'], 'objNLabels', 'label3', additional_type="red")
    img_all = generate_buttons(img_all, ['img/numbers/red/'], 'objNumbers', 'number', additional_type="red")

    img_all = generate_buttons(img_all, ['img/labels/numbers-new/yellow/'], 'objNLabels', 'label', additional_type="yellow")
    img_all = generate_buttons(img_all, ['img/labels/letters-new/yellow/'], 'objNLabels', 'label2', additional_type="yellow")
    img_all = generate_buttons(img_all, ['img/labels/letters-new/hexagon/yellow/'], 'objNLabels', 'label3', additional_type="yellow")
    img_all = generate_buttons(img_all, ['img/numbers/yellow/'], 'objNumbers', 'number', additional_type="yellow")

    img_all = generate_buttons(img_all, ['img/labels/numbers-new/yellow-bright/'], 'objNLabels', 'label', additional_type="yellowbright")
    img_all = generate_buttons(img_all, ['img/labels/letters-new/yellow-bright/'], 'objNLabels', 'label2', additional_type="yellowbright")
    img_all = generate_buttons(img_all, ['img/labels/letters-new/hexagon/yellow-bright/'], 'objNLabels', 'label3', additional_type="yellowbright")
    img_all = generate_buttons(img_all, ['img/numbers/yellow-bright/'], 'objNumbers', 'number', additional_type="yellowbright")

    img_all = generate_buttons(img_all, ['img/logo/long/'], 'objLogos', 'logoLong')
    img_all = generate_buttons(img_all, ['img/logo/short/'], 'objLogos', 'logoShort')

    return render(request, 'schemeDrawer/drawer.html', {
        'img_all': img_all, 
    })
