# LMS 

## Teknologi yang Digunakan

- **Django Rest Framework (DRF)**

## Prasyarat

1. **Python 3.x** - Pastikan Anda sudah menginstal Python 3.
2. **Django** - Framework yang digunakan untuk backend.
3. **Django Rest Framework** - Digunakan untuk membangun API RESTful.


## Persiapan Awal

### 1. **Cloning Repository**

```bash 
git clone <URL_REPOSITORY> 
```
### 2. **Siapkan Virtual Environtment**

```bash
python -m venv venv

venv\Scripts\activate
```
### 3. **Install Semua Dependensi**
```bash
pip install -r requirements.txt
```
### 4. **Menyiapkan Database**
Project ini menggunakan database PostgreSQL
```bash
python manage.py migrate
```
### 5. **Running Server**
```bash
python manage.py runserver
```
Server akan berjalan pada http://127.0.0.1:8000/.

