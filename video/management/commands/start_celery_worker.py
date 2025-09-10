import os
import subprocess
import time
import platform
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Запускает Celery Worker и перезапускает его при падении'
    def handle(self, *args, **options):
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nanofb.settings')
        manage_py = os.path.join(os.getcwd(), 'manage.py')
        if platform.system() == 'Windows':
            pool = 'solo'
            self.stdout.write(self.style.WARNING('Windows: используем --pool=solo'))
        else:
            pool = 'prefork'
            self.stdout.write(self.style.SUCCESS('Unix-система: используем --pool=prefork'))
        cmd = [
            'celery',
            '-A', 'nanofb',
            'worker',
            '-l', 'INFO',
            f'--pool={pool}',
        ]
        if pool == 'prefork':
            cmd.extend(['-c', str(os.cpu_count() or 4)])
        self.stdout.write('Запуск Celery Worker...')
        while True:
            try:
                result = subprocess.run(cmd)
                self.stdout.write(self.style.WARNING('Celery Worker упал с кодом: %d' % result.returncode))
            except KeyboardInterrupt:
                self.stdout.write('Остановка Celery Worker...')
                break
            except Exception as e:
                self.stdout.write(self.style.ERROR('Ошибка при запуске: %s' % str(e)))
            wait_seconds = 10
            self.stdout.write(f'Перезапуск через {wait_seconds} секунды...')
            time.sleep(wait_seconds)
