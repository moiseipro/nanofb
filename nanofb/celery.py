from __future__ import absolute_import
import os
from celery import Celery
from celery.schedules import crontab

from shared.models import SharedLink
from shared.v_api import check_link_expiration

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nanofb.settings')
app = Celery('nanofb')
app.config_from_object('django.conf:settings', namespace='CELERY')
@app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    sender.add_periodic_task(
        # crontab(minute=0, hour='*/1'), # Execute every hour
        crontab(minute='*/1'),
        validate_all_links.s(),
    )
@app.task
def validate_all_links():
    links = SharedLink.objects.all()
    for link in links:
        check_link_expiration(link)

