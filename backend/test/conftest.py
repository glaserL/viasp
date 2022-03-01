import json
from inspect import signature
from typing import Dict, List
from uuid import uuid4

import networkx as nx
import pytest
from clingo import Control, Function, Number
from flask import Flask
from flask.testing import FlaskClient
from networkx import node_link_data

from helper import get_stable_models_for_program
from viasp.asp.justify import build_graph
from viasp.asp.reify import ProgramAnalyzer, reify_list
from viasp.server.blueprints.api import bp as api_bp
from viasp.server.blueprints.app import bp as app_bp
from viasp.server.blueprints.dag_api import bp as dag_bp
from viasp.shared.io import DataclassJSONEncoder, DataclassJSONDecoder, model_to_json, clingo_model_to_stable_model
from viasp.shared.model import ClingoMethodCall, Node, StableModel


def create_app_with_registered_blueprints(*bps) -> Flask:
    app = Flask(__name__)
    for bp in bps:
        app.register_blueprint(bp)

    app.json_encoder = DataclassJSONEncoder
    app.json_decoder = DataclassJSONDecoder

    return app


@pytest.fixture
def single_node_graph(a_1):
    g = nx.DiGraph()
    uuid = uuid4()
    g.add_node(Node(frozenset(), 1, frozenset([a_1]), uuid=uuid))
    return g


@pytest.fixture
def a_1() -> Function:
    return Function("A", [Number(1)])


@pytest.fixture
def serializable_graph() -> Dict:
    program = "a(1..2). {b(X)} :- a(X). c(X) :- b(X)."
    analyzer = ProgramAnalyzer()
    analyzer.add_program(program)
    sorted_program = analyzer.get_sorted_program()
    saved_models = get_stable_models_for_program(program)
    reified = reify_list(sorted_program)

    g = build_graph(saved_models, reified, analyzer)

    serializable_graph = node_link_data(g)
    return serializable_graph


@pytest.fixture
def client_with_a_graph(serializable_graph) -> FlaskClient:
    app = create_app_with_registered_blueprints(app_bp, api_bp, dag_bp)

    with app.test_client() as client:
        client.post("graph", json=serializable_graph)
        yield client


@pytest.fixture
def client() -> FlaskClient:
    app = create_app_with_registered_blueprints(app_bp, api_bp, dag_bp)

    with app.test_client() as client:
        yield client


@pytest.fixture
def clingo_call_run_sample():
    signature_object = Control()
    return [
        ClingoMethodCall.merge("__init__", signature(signature_object.__init__), [["0"]], {}),
        ClingoMethodCall.merge("add", signature(signature_object.add), ["base", []],
                               {"program": "a. {b}. c :- not b."}),
        ClingoMethodCall.merge("ground", signature(signature_object.ground), [[("base", [])]], {}),
        ClingoMethodCall.merge("solve", signature(signature_object.solve), [], {"yield_": True})
    ]


@pytest.fixture
def clingo_stable_models() -> List[StableModel]:
    ctl = Control(["0"])
    ctl.add("base", [], "{b;c}.")
    ctl.ground([("base", [])])
    models = []
    with ctl.solve(yield_=True) as h:
        for m in h:
            models.append(clingo_model_to_stable_model(m))
    return models
