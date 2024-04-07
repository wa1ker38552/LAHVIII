from flask import render_template
from database import Database
from flask import send_file
from flask import redirect
from flask import request
from flask import Flask
from threading import Thread
from ai import comprehend
import requests
import random
import base64
import io

import logging
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

app = Flask(__name__)
db = Database('database.json')
qr = Database('query.json')

def get_data(id):
  headers = {
    "X-RapidAPI-Key": "3b95d6e9b5msheb126bffe76d817p18c0c4jsn8ae384460bae",
    "X-RapidAPI-Host": "instagram-scraper-api2.p.rapidapi.com"
  }
  data = requests.get('https://instagram-scraper-api2.p.rapidapi.com/v1/post_info', headers=headers, params={"code_or_id_or_url": id}).json()['data']
  return {
    'author': {
      'name': data['owner']['full_name'],
      'profile': data['owner']['profile_pic_url'],
      'id': data['owner']['username']
    },
    'content': data['thumbnail_url'],
    'id': id
  }

def get_media(id):
  headers = {
    "X-RapidAPI-Key": "3b95d6e9b5msheb126bffe76d817p18c0c4jsn8ae384460bae",
    "X-RapidAPI-Host": "instagram-bulk-scraper-latest.p.rapidapi.com"
  }
  response = requests.get(f"https://instagram-bulk-scraper-latest.p.rapidapi.com/media_download_by_shortcode/{id}", headers=headers)
  return response.json()

@app.route('/proxy')
def api_proxy():
  r = requests.get(base64.b64decode(request.args.get('url'))).content
  return send_file(io.BytesIO(r), mimetype='image/png')

@app.route('/')
def app_index():
  return render_template('index.html')

@app.route('/p')
def app_p():
  id = request.args.get('url').split('/')[4]
  return render_template('post.html', id=id)

@app.route('/api/fetch')
def api_fetch():
  data = db.get('post_data')
  cursor = request.args.get('cursor')
  if cursor:
    try:
      cursor = int(cursor)
      return {'data': [random.choice(data) for i in range(len(cursor))]}
    except ValueError:
      return {'data': []}
  return {'data': [random.choice(data) for i in range(10)]}

@app.route('/api/post')
def api_post():
  id = request.args.get('id')
  post = get_data(id)
  media = get_media(id)['data']
  post['media'] = {
    'media': media['main_media_hd'],
    'caption': media['caption']
  }
  return post

@app.route('/api/comments')
def api_comments():
  id = request.args.get('id')
  cursor = request.args.get('cursor')
  headers = {
    "X-RapidAPI-Key": "3b95d6e9b5msheb126bffe76d817p18c0c4jsn8ae384460bae",
    "X-RapidAPI-Host": "instagram-scraper-api2.p.rapidapi.com"
  }
  if cursor:
    r = requests.get('https://instagram-scraper-api2.p.rapidapi.com/v1/comments', headers=headers, params={"code_or_id_or_url": id, 'pagination_token': cursor})
  else:
    r = requests.get('https://instagram-scraper-api2.p.rapidapi.com/v1/comments', headers=headers, params={"code_or_id_or_url": id})
  data =  r.json()
  comments = data['data']['items']
  for item in comments:
    item['flagged'] = comprehend(item['text']) if 'text' in item else False
  return {
    'data': comments,
    'cursor': data['pagination_token'] if 'pagination_token' in data else None
  }

# app.run(host='0.0.0.0', port=8080)
