from celery import shared_task
from django.core.cache import cache
import requests
import os
import re
import hashlib
import io
from requests_toolbelt.multipart.encoder import MultipartEncoder

VIDEO_SERVER_API = "hawG6EvFymKKXFbv1easxP4D7fec990ygdu7csAwxftcdHH0jtM2LZ8qpUpg0TXVEwEKhfpi3DvFXuZDv6iwD8vxGpbnRouM0vJP"
MAX_UPLOAD_TIME = 7200
MAX_GB = 100
CHUNK_SIZE = 100 * 1024 * 1024


def sanitize_filename(name):
    name = re.sub(r'[^\w.\-]', '_', name)
    name = re.sub(r'_+', '_', name)
    name = name.strip('_')
    if not name:
        name = 'uploaded_video'
    return name


@shared_task(timeout=7800, soft_time_limit=MAX_UPLOAD_TIME)
def upload_video_to_nanofootball(upload_mode, instance_id, app_label, model_name, file_path, file_name, content_type, video_data_dict, cache_key, second_screensaver=None, cover_file_path=None, cover_content_type=None):
    cache.set(cache_key, {'progress': 0, 'status': 'starting'}, timeout=600)
    upload_url = f'https://nanofootball.pro/api/add_videos/{VIDEO_SERVER_API}'
    safe_file_name = sanitize_filename(file_name)
    try:
        if not os.path.exists(file_path):
            cache.set(cache_key, {'progress': 0, 'status': 'failed', 'error': 'File not found'}, timeout=600)
            return
        file_size = os.path.getsize(file_path)
        file_hash = hashlib.md5(f"{file_name}_{file_size}".encode()).hexdigest() # простой ID сессии
        init_data = {
            'file_name': safe_file_name,
            'file_size': file_size,
            'file_hash': file_hash,
            'content_type': content_type,
            'folder-type': ''
        }
        try:
            init_resp = requests.post(
                upload_url,
                data={'init': '1', **init_data},
                timeout=30,
                verify=False
            )
            if init_resp.status_code != 200:
                cache.set(cache_key, {'progress': 0, 'status': 'failed', 'error': 'Init failed'}, timeout=600)
                return
            init_json = init_resp.json()
            if not init_json.get('success'):
                cache.set(cache_key, {'progress': 0, 'status': 'failed', 'error': init_json.get('error')}, timeout=600)
                return
            uploaded_chunks = init_json.get('uploaded_chunks', 0)
        except Exception as e:
            cache.set(cache_key, {'progress': 0, 'status': 'failed', 'error': f'Init error: {str(e)}'}, timeout=600)
            return
        total_chunks = (file_size + CHUNK_SIZE - 1) // CHUNK_SIZE
        start_chunk = uploaded_chunks
        cache.set(cache_key, {'progress': 0, 'status': 'uploading', 'uploaded': 0}, timeout=600)
        with open(file_path, 'rb') as f:
            f.seek(start_chunk * CHUNK_SIZE)
            uploaded_bytes = start_chunk * CHUNK_SIZE
            for chunk_index in range(start_chunk, total_chunks):
                chunk = f.read(CHUNK_SIZE)
                if not chunk:
                    break
                multipart_files = [
                    ('file_chunk', (safe_file_name, io.BytesIO(chunk), content_type)),
                    ('file_hash', (None, file_hash, 'text/plain')),
                    ('chunk_index', (None, str(chunk_index), 'text/plain')),
                    ('total_chunks', (None, str(total_chunks), 'text/plain')),
                    ('file_name', (None, safe_file_name, 'text/plain')),
                ]
                try:
                    resp = requests.post(
                        upload_url,
                        files=multipart_files,
                        timeout=300,
                        verify=False
                    )
                    if resp.status_code != 200 or not resp.json().get('success'):
                        cache.set(cache_key, {
                            'progress': min(99, int(uploaded_bytes / file_size * 100)),
                            'status': 'failed',
                            'error': resp.json().get('error', 'Chunk upload failed')
                        }, timeout=600)
                        return
                except Exception as e:
                    cache.set(cache_key, {
                        'progress': min(99, int(uploaded_bytes / file_size * 100)),
                        'status': 'failed',
                        'error': f'Chunk upload failed: {str(e)}'
                    }, timeout=600)
                    return
                uploaded_bytes += len(chunk)
                progress = int(uploaded_bytes / file_size * 100)
                cache.set(
                    cache_key,
                    {'progress': progress, 'status': 'uploading', 'uploaded': uploaded_bytes},
                    timeout=600
                )
        try:
            finalize_resp = requests.post(
                upload_url,
                data={'finalize': '1', 'file_hash': file_hash, 'file_name': safe_file_name},
                timeout=60,
                verify=False
            )
            if finalize_resp.status_code != 200 or not finalize_resp.json().get('success'):
                cache.set(cache_key, {
                    'progress': 99,
                    'status': 'failed',
                    'error': 'Finalize failed'
                }, timeout=600)
                return
            video_id = finalize_resp.json()['data'][0]['id']
        except Exception as e:
            cache.set(cache_key, {
                'progress': 99,
                'status': 'failed',
                'error': f'Finalize error: {str(e)}'
            }, timeout=600)
            return
        video_data_dict['links']['nftv'] = video_id
        try:
            length_url = f'https://nanofootball.pro/video/length/{video_id}'
            length_resp = requests.get(length_url, timeout=10, verify=False)
            if length_resp.status_code == 200:
                video_data_dict['duration'] = length_resp.json().get('time', video_data_dict['duration'])
        except Exception:
            pass
        try:
            size_url = f'https://nanofootball.pro/api/video_info/{VIDEO_SERVER_API}'
            size_resp = requests.get(size_url, json={'id': video_id}, timeout=10, verify=False)
            print(size_resp, size_resp.json())
            if size_resp.status_code == 200:
                video_data_dict['size'] = size_resp.json().get('size')
        except Exception as e:
            print(f"ERR: {e}")
            pass
        cover_url = f'https://nanofootball.pro/api/change_cover/{VIDEO_SERVER_API}'
        try:
            if cover_file_path and os.path.exists(cover_file_path):
                safe_cover_name = sanitize_filename(os.path.basename(cover_file_path))
                with open(cover_file_path, 'rb') as cover_obj:
                    c_encoder = MultipartEncoder({
                        'id': video_id,
                        'type': 'file',
                        'user-cover': (safe_cover_name, cover_obj, cover_content_type)
                    })
                    requests.post(
                        cover_url,
                        data=c_encoder,
                        headers={'Content-Type': c_encoder.content_type},
                        timeout=300,
                        verify=False
                    )
            elif second_screensaver is not None:
                time_val = second_screensaver.strip() or "1"
                c_encoder = MultipartEncoder({
                    'id': video_id,
                    'type': 'frame',
                    'time': time_val
                })
                requests.post(
                    cover_url,
                    data=c_encoder,
                    headers={'Content-Type': c_encoder.content_type},
                    timeout=300,
                    verify=False
                )
        except Exception:
            pass
        cache.set(cache_key, {
            'progress': 100,
            'status': 'complete',
            'video_data': video_data_dict,
            'upload_mode': upload_mode,
            'instance_id': instance_id,
            'app_label': app_label,
            'model_name': model_name,
        }, timeout=600)
        for f_path in [file_path, cover_file_path]:
            if f_path and os.path.exists(f_path):
                try:
                    os.remove(f_path)
                except Exception as e:
                    print(f"Failed to delete {f_path}: {e}")
    except Exception as e:
        for f_path in [file_path, cover_file_path]:
            if f_path and os.path.exists(f_path):
                try:
                    os.remove(f_path)
                except Exception as e:
                    print(f"Failed to delete {f_path}: {e}")
        cache.set(cache_key, {
            'progress': 0,
            'status': 'failed',
            'error': str(e)
        }, timeout=600)
