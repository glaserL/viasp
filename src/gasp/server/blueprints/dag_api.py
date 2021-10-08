from flask import Blueprint

bp = Blueprint("dag_api", __name__, template_folder='server/templates')


@bp.route("/model/<uuid>", methods=["GET"])
def get_model(uuid):
    raise NotImplementedError


@bp.route("/rule/<uuid>", methods=["GET"])
def get_rule(uuid):
    return NotImplementedError


@bp.route("/graph/", methods=["GET"])
def get_graph():
    return NotImplementedError
