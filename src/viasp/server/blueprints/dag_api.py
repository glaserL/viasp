import json
from typing import Union

import networkx as nx
from flask import Blueprint, request, render_template, Response, make_response, jsonify

from ...shared.io import DataclassJSONDecoder, DataclassJSONEncoder

bp = Blueprint("dag_api", __name__, template_folder='server/templates')


class GraphDataBaseKEKL:

    def __init__(self):
        self.path = "/Users/bianchignocchi/Developer/cogsys/0_ma/gasp/src/viasp/server/graph.json"

    def save(self, graph: Union[nx.Graph, dict]):
        if isinstance(graph, nx.Graph):
            serializable_graph = nx.node_link_data(graph)
        else:
            serializable_graph = graph
        with open(self.path, "w", encoding="utf-8") as f:
            json.dump(serializable_graph, f, cls=DataclassJSONEncoder, ensure_ascii=False, indent=2)

    def load(self, as_json=True) -> Union[nx.Graph, dict]:
        try:
            with open(self.path, encoding="utf-8") as f:
                result = json.load(f, cls=DataclassJSONDecoder)
            if as_json:
                return result
            loaded_graph = nx.node_link_graph(result)
            return loaded_graph
        except FileNotFoundError:
            return nx.DiGraph()


def get_database():
    return GraphDataBaseKEKL()


def handle_request_for_children(data):
    graph = get_database().load(as_json=False)
    rule_id = data["rule_id"]
    children = list()
    for u, v, d in graph.edges(data=True):
        edge = d['transformation']
        print(f"{u}-[{d}]->{v}")
        if str(edge["id"]) == rule_id:
            children.append(v)
    print(f"Returning {children} as children of {data}")
    return children


@bp.route("/children/", methods=["GET"])
def get_children():
    if request.method == "GET":
        to_be_returned = handle_request_for_children(request.args)
        return jsonify(to_be_returned)
    raise NotImplementedError


@bp.route("/rule/<uuid>", methods=["GET"])
def get_rule(uuid):
    return NotImplementedError


@bp.route("/rules", methods=["GET"])
def get_all_rules():
    graph = get_database().load(as_json=False)
    returning = []
    for u, v in graph.edges:
        print(f"Looking at {u.uuid}-[{graph[u][v]['transformation']}->{v.uuid}")
        transformation = graph[u][v]["transformation"]
        if transformation not in returning:
            returning.append(transformation)
    print(f"kekekjdgkjdhfkljsfek {returning}")
    r = jsonify(returning)
    return r


@bp.route("/graph", methods=["POST", "GET"])
def graph():
    if request.method == "POST":
        data = request.json
        print(f"Saving {data}")
        get_database().save(data)
        return "ok"
    elif request.method == "GET":
        return get_database().load()
