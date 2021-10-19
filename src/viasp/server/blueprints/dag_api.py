import json

import networkx as nx
from flask import Blueprint

from viasp.shared.io import DataclassJSONDecoder, DataclassJSONEncoder

bp = Blueprint("dag_api", __name__, template_folder='server/templates')


def dumb_fuck() -> nx.Graph:
    result = None
    with open("/Users/bianchignocchi/Developer/cogsys/0_ma/viasp/tests/resources/traveling_salesperson.json",
              encoding="utf-8") as f:
        result = json.load(f, cls=DataclassJSONDecoder)
    loaded_graph = nx.node_link_graph(result)
    return loaded_graph


DUMB = dumb_fuck()


@bp.route("/model/<uuid>", methods=["GET"])
def get_model(uuid):
    raise NotImplementedError


@bp.route("/rule/<uuid>", methods=["GET"])
def get_rule(uuid):
    return NotImplementedError


@bp.route("/rules", methods=["GET"])
def get_all_rules():
    to_return = list(DUMB.nodes)
    to_return = json.dumps(to_return, cls=DataclassJSONEncoder)
    return to_return


@bp.route("/graph/", methods=["GET"])
def get_graph():
    return NotImplementedError
