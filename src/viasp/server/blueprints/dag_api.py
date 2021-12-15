import json
from collections import defaultdict
from functools import lru_cache as f_cache
from typing import Union, Collection

import networkx as nx
from flask import Blueprint, request, jsonify, abort, session
from networkx import DiGraph

from ...shared.io import DataclassJSONDecoder, DataclassJSONEncoder, deserialize
from ...shared.model import Transformation, Filter, Node, Signature
from ...shared.util import get_start_node_from_graph, get_leafs_from_graph, pairwise
from .app import storage

bp = Blueprint("dag_api", __name__, template_folder='../templates', static_folder='../static/',
               static_url_path='/static')

GRAPH = None


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

    def load(self, as_json=True) -> Union[nx.DiGraph, dict]:
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


def get_graph():
    global GRAPH
    if GRAPH is None:
        print(f"CACHE MISS")
        GRAPH = GraphDataBaseKEKL().load(False)
    else:
        print("CACHE HIT")
    return GRAPH


def prune_graph(graph, fltr: Filter):
    uuids = [f.on.uuid for f in fltr]
    start = get_start_node_from_graph(graph)
    filtered = nx.DiGraph()
    for node in graph.nodes:
        if graph.out_degree(node) == 0:
            path = nx.shortest_path(graph, start, node)
            if any(node.uuid in uuids for node in path):
                for src, tgt in pairwise(path):
                    filtered.add_edge(src, tgt, transformation=graph[src][tgt]["transformation"])
    return filtered


def handle_request_for_children(data) -> Collection[Node]:
    graph = get_graph()
    rule_id = data["rule_id"]
    children = list()
    if storage.has("filter"):
        node_filters = [fltr for fltr in storage.get("filter") if isinstance(fltr.on, Node)]
        if len(node_filters):
            graph = prune_graph(graph, node_filters)

    for u, v, d in graph.edges(data=True):
        edge: Transformation = d['transformation']
        # print(f"{u}-[{d}]->{v}")
        if str(edge.id) == rule_id:
            children.append(v)

    return children


@bp.route("/children/", methods=["GET"])
def get_children():
    if request.method == "GET":
        to_be_returned = handle_request_for_children(request.args)
        return jsonify(to_be_returned)
    raise NotImplementedError


def get_src_tgt_mapping_from_graph(ids=None):
    ids = set(ids) if ids is not None else None
    graph = get_database().load(as_json=False)
    nodes = set(graph.nodes)
    to_be_deleted = set(existing for existing in nodes if ids is not None and existing.uuid not in ids)
    for node in to_be_deleted:
        for source, _, _ in graph.in_edges(node, data=True):
            for _, target, _ in graph.out_edges(node, data=True):
                graph.add_edge(source, target)
        graph.remove_node(node)
    return [{"src": src.uuid, "tgt": tgt.uuid} for src, tgt in graph.edges()]


@bp.route("/edges", methods=["GET", "POST"])
def get_edges():
    if request.method == "POST":
        to_be_returned = get_src_tgt_mapping_from_graph(request.json)
    elif request.method == "GET":
        to_be_returned = get_src_tgt_mapping_from_graph()

    jsonified = jsonify(to_be_returned)
    return jsonified


@bp.route("/rule/<uuid>", methods=["GET"])
def get_rule(uuid):
    graph = get_graph()
    for _, _, edge in graph.edges(data=True):
        transformation: Transformation = edge["transformation"]
        if transformation.id == uuid:
            return jsonify(transformation)
    abort(404)


@bp.route("/node/<uuid>", methods=["GET"])
def get_node(uuid):
    graph = get_graph()
    for node in graph.nodes():
        if node.uuid == uuid:
            return jsonify(node)
    abort(404)


@bp.route("/facts", methods=["GET"])
def get_facts():
    graph = get_graph()
    facts = get_start_node_from_graph(graph)
    r = jsonify(facts)
    return r


@bp.route("/rules", methods=["GET"])
def get_all_rules():
    graph = get_graph()
    returning = []
    for u, v in graph.edges:
        # print(f"Looking at {u.uuid}-[{graph[u][v]['transformation']}->{v.uuid}")
        transformation = graph[u][v]["transformation"]
        if transformation not in returning:
            returning.append(transformation)
    # print(f"kekekjdgkjdhfkljsfek {returning}")
    r = jsonify(returning)
    return r


@bp.route("/graph", methods=["POST", "GET"])
def entire_graph():
    if request.method == "POST":
        data = request.json
        set_graph(data)
        return "ok"
    elif request.method == "GET":
        return get_graph()


def set_graph(data: DiGraph):
    database = get_database()
    database.save(data)
    global GRAPH
    GRAPH = None


def get_atoms_in_path_by_signature(uuid: str):
    graph = get_graph()

    matching_nodes = [x for x, y in graph.nodes(data=True) if x.uuid == uuid]
    assert len(matching_nodes) == 1
    signature_to_atom_mapping = defaultdict(set)
    node = matching_nodes[0]
    for symbol in node.atoms:
        signature = (symbol.name, len(symbol.arguments))
        signature_to_atom_mapping[signature].add(symbol)
    return [(f"{s[0]}/{s[1]}", signature_to_atom_mapping[s])
            for s in signature_to_atom_mapping.keys()]


@bp.route("/model/")
def model():
    if "uuid" in request.args.keys():
        key = request.args["uuid"]
    path = get_atoms_in_path_by_signature(key)
    # print(f"Returning {path}")
    return jsonify(path)


def get_all_signatures(graph: nx.Graph):
    signatures = set()
    for n in graph.nodes():
        for a in n.diff:
            signatures.add(Signature(a.name, len(a.arguments)))
    return signatures


@bp.route("/query", methods=["GET"])
def search():
    if "q" in request.args.keys():
        query = request.args["q"]
        graph = get_graph()
        result = []
        signatures = get_all_signatures(graph)
        result.extend(signatures)
        for node in graph.nodes():
            if any(query in str(atm) for atm in node.atoms) and node not in result:
                result.append(node)
        for _, _, edge in graph.edges(data=True):
            transformation = edge["transformation"]
            if any(query in r for r in transformation.rules) and transformation not in result:
                result.append(transformation)
        return jsonify(result[:10])
    return jsonify([])


@bp.route("/trace", methods=["GET", "POST"])
def trace():
    graph = get_graph()
    beginning = get_start_node_from_graph(graph)
    symbol = deserialize(request.data)
    uuid = request.args["uuid"]
    matching_nodes = [x for x, y in graph.nodes(data=True) if x.uuid == uuid]
    assert len(matching_nodes) == 1
    end = matching_nodes[0]
    path: [Node] = nx.shortest_path(graph, beginning, end)
    trace = []
    for step in path:
        if symbol in step.diff:
            trace.append(step.uuid)
            break
        trace.append(step.uuid)
    return jsonify(trace), 200
