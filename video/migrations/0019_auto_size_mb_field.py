from django.db import migrations
import re


def populate_size_mb(apps, schema_editor):
    Video = apps.get_model("video", "Video")
    for video in Video.objects.all():
        if video.size:
            match = re.search(r'[\d.]+', video.size)
            if match:
                try:
                    video.size_mb = float(match.group())
                    video.save(update_fields=['size_mb'])
                except (ValueError, TypeError):
                    pass


def reverse_func(apps, schema_editor):
    # Обратная операция: не делаем ничего, или обнуляем
    Video = apps.get_model("video", "Video")
    Video.objects.update(size_mb=None)


class Migration(migrations.Migration):
    dependencies = [
        ('video', '0018_video_size_mb'),
    ]

    operations = [
        migrations.RunPython(populate_size_mb, reverse_func),
    ]
