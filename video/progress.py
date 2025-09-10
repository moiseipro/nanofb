from django.core.cache import cache


def create_upload_callback(cache_key, total_size):
    uploaded_bytes = [0]
    def callback(monitor):
        uploaded_bytes[0] += monitor.bytes_read
        if total_size > 0:
            progress = int((uploaded_bytes[0] / total_size) * 100)
        else:
            progress = 0
        progress = min(progress, 100)
        cache.set(cache_key, {'progress': progress, 'status': 'uploading'}, timeout=3600)
    return callback
