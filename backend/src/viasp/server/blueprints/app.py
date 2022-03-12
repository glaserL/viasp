from flask import Blueprint
from flask_cors import cross_origin

bp = Blueprint("app", __name__, template_folder='../templates', static_folder='../static/', static_url_path='/static')


@bp.route("/healthcheck", methods=["GET"])
@cross_origin(origin='localhost', headers=['Content-Type', 'Authorization'])
def check_available():
    return "ok"
