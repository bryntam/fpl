from flask import Flask
from flask import jsonify
from flask import render_template
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/current-gameweek')
def current_gameweek():
    response = requests.get('https://fantasy.premierleague.com/api/bootstrap-static/')
    data = response.json()
    events = data['events'] 
    current_gw = next((gw for gw in events if gw['is_current']), None)
    return jsonify({
        'current_gameweek': current_gw['id'] if current_gw else 'No active gameweek'
    })

@app.route('/player-info')
def player_info():
    response = requests.get('https://fantasy.premierleague.com/api/bootstrap-static/')
    data = response.json()
    players = data['elements']
    player_dict = {player['id']: player['web_name'] for player in players}
    return jsonify(player_dict)

@app.route('/fpl-team/<int:team_id>/gw/<int:gameweek>')
def fpl_team(team_id, gameweek):
    url = f'https://fantasy.premierleague.com/api/entry/{team_id}/event/{gameweek}/picks/'
    response = requests.get(url)
    data = response.json()
    return jsonify(data)

@app.route('/event-live/<int:gameweek>')
def event_live(gameweek):
    url = f'https://fantasy.premierleague.com/api/event/{gameweek}/live/'
    response = requests.get(url)
    data = response.json()
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)
