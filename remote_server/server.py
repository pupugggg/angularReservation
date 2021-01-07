from flask import Flask, request, render_template, url_for, redirect, flash, session, json, jsonify
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from flask_socketio import SocketIO
from flask_cors import CORS
from collections import defaultdict
from email.message import EmailMessage
import smtplib, ssl
import json
import pprint
import http.client

def sendMail(reciever, dat):
    msg = EmailMessage()
    content = "\nLocation: " + dat['location'] + '\nTitle: ' + dat['title'] + '\nDescription: ' + dat['description'] + '\nStart Time: ' + dat['start'] + '\nEnd Time: ' + dat['end'] + '\nInvolvers: ' + ', '.join(dat['involvers'])
    content = "You have made a reservation change:\n" + content

    msg.set_content(content)
    msg["Subject"] = "Reservation announcement"
    msg["From"] = "vrrs.se@gmail.com"
    msg["To"] = ",".join(reciever)

    context=ssl.create_default_context()

    with smtplib.SMTP("smtp.gmail.com", port=587) as smtp:
        smtp.starttls(context=context)
        smtp.login(msg["From"], "vrrs.se123")
        smtp.send_message(msg)


app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins='*')
CORS(app)
app.secret_key = app.config.get('flask', 'secret_key')
pp = pprint.PrettyPrinter(indent=4)

ID = 0
with open('user.json', 'r', encoding='utf-8') as jFile:
    DATA = json.load(jFile)

for i in DATA:
    if i['id'] > ID:
        ID = i['id']
print(ID)

@app.route('/email',  methods=['GET', 'POST', 'PUT', 'DELETE'])
def eventMail():
    print(request.json)
    sendMail(request.json['emails'], request.json['event'])
    return app.response_class(
            response=json.dumps(DATA),
            status=200,
            mimetype='application/json'
        )


@app.route('/events/<id>',  methods=['GET', 'POST', 'PUT', 'DELETE'])
def eventID(id):
    global ID, DATA
    DATA = [i for i in DATA if i['id'] != int(id)]

    print('id:' + id)

    with open('user.json', 'w') as jFile:
            json.dump(DATA, jFile, indent=4)

    return app.response_class(
            response=json.dumps(DATA),
            status=200,
            mimetype='application/json'
        )

@app.route('/events',  methods=['GET', 'POST', 'PUT', 'DELETE'])
def events():
    global ID, DATA
    if request.method == 'GET':
        response = app.response_class(
            response=json.dumps(DATA),
            status=200,
            mimetype='application/json'
        )
        return response
    elif request.method == 'POST':
        dic = request.json

        ID += 1
        dic['id'] = ID
        DATA.append(dic)

        with open('user.json', 'w') as jFile:
            json.dump(DATA, jFile, indent=4)

        return app.response_class(
            response=json.dumps(dic),
            status=200,
            mimetype='application/json'
        )
    elif request.method == 'PUT':
        DATA = [i for i in DATA if i['id'] != request.json['id']]
        DATA.append(request.json)

        with open('user.json', 'w') as jFile:
            json.dump(DATA, jFile, indent=4)

        return app.response_class(
            response=json.dumps(request.json),
            status=200,
            mimetype='application/json'
        )


if __name__ == "__main__":
    app.run(host='192.168.0.118', port=25565)
