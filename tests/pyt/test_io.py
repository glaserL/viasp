import json

import clingo
import networkx as nx
import pytest
from clingo import Control
from networkx import node_link_data, node_link_graph

from src.viasp.shared.io import DataclassJSONEncoder, DataclassJSONDecoder, model_to_dict, clingo_model_to_stable_model
from tests.pyt.test_graph_creation import get_stable_models_for_program
from src.viasp.asp.justify import build_graph
from src.viasp.asp.reify import ProgramAnalyzer, reify_list
from src.viasp.shared.model import StableModel, ClingoMethodCall


def test_networkx_graph_with_dataclasses_is_isomorphic_after_dumping_and_loading_again():
    orig_program = "c(1). c(2). b(X) :- c(X). a(X) :- b(X)."
    analyzer = ProgramAnalyzer()
    sorted_program = analyzer.sort_program(orig_program)
    saved_models = get_stable_models_for_program(orig_program)
    reified = reify_list(sorted_program)

    graph = build_graph(saved_models, reified, analyzer)
    assert len(graph.nodes()) > 0, "The graph to check serialization should contain nodes."
    assert len(graph.edges()) > 0, "The graph to check serialization should contain edges."
    serializable_graph = node_link_data(graph)
    serialized_graph = json.dumps(serializable_graph, cls=DataclassJSONEncoder, ensure_ascii=False, indent=2)
    loaded = json.loads(serialized_graph, cls=DataclassJSONDecoder)
    loaded_graph = node_link_graph(loaded)
    assert len(loaded_graph.nodes()) > 0, "The graph to check serialization should contain nodes."
    assert len(loaded_graph.edges()) > 0, "The graph to check serialization should contain edges."
    assert nx.is_isomorphic(loaded_graph,
                            graph), "Serializing and unserializing a networkx graph should not change it"


def test_serialization_model():
    ctl = Control(["0"])
    ctl.add("base", [], "{a(1..2)}. b(X) :- a(X).")

    ctl.ground([("base", [])])
    saved = []
    with ctl.solve(yield_=True) as h:
        for model in h:
            saved.append(clingo_model_to_stable_model(model))
    serialized = json.dumps(saved, cls=DataclassJSONEncoder)
    deserialized = json.loads(serialized, cls=DataclassJSONDecoder)
    for model in deserialized:
        assert isinstance(model, StableModel)


def test_serialization_calls(clingo_call_run_sample):
    serialized = json.dumps(clingo_call_run_sample, cls=DataclassJSONEncoder)
    deserialized = json.loads(serialized, cls=DataclassJSONDecoder)
    for model in deserialized:
        assert isinstance(model, ClingoMethodCall)
