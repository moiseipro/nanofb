from __future__ import absolute_import, unicode_literals
import os
from celery import Celery

from shared.models import SharedLink
from shared.v_api import check_link_expiration


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nanofb.settings')
app = Celery('nanofb')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

# crontab(minute=0, hour='*/1'), # Execute every hour
# crontab(minute='*/1'),

@app.task(bind=True)
def validate_all_links():
    links = SharedLink.objects.all()
    for link in links:
        check_link_expiration(link)

