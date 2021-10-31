import json

import pytest
import requests
from networkx import node_link_data

from src.viasp.asp.justify import build_graph
from src.viasp.asp.reify import transform
from tests.pyt.test_graph_creation import get_stable_models_for_program
from src.viasp.shared.io import DataclassJSONEncoder


@pytest.mark.skip(reason="Not for pipeline.")
def test_writing_to_server():
    program = "c(1). c(2). b(X) :- c(X). a(X) :- b(X)."
    transformed = transform(program)
    saved_models = get_stable_models_for_program(program)
    g = build_graph(saved_models, transformed, program)
    assert len(g.nodes) == 3
    assert len(g.edges) == 2

    backend_url = "http://127.0.0.1:5000/"
    serializable_graph = node_link_data(g)
    serialized = json.dumps(serializable_graph, cls=DataclassJSONEncoder, ensure_ascii=False, indent=2)
    r = requests.post(f"{backend_url}graph",
                      data=serialized,
                      headers={'Content-Type': 'application/json'})