import json

import networkx as nx
import pytest
from networkx import node_link_data, node_link_graph

from src.viasp.shared.io import DataclassJSONEncoder, DataclassJSONDecoder
from src.viasp.shared.model import Model, CostableModel
from tests.pyt.helper import example_graph
from tests.pyt.test_graph_creation import get_stable_models_for_program
from src.viasp.asp.justify import build_graph
from src.viasp.asp.reify import ProgramAnalyzer, reify_list

examples = [Model(set(), {"a", "b"}),
            CostableModel({"a"}, {"b"}, 42)]


def test_all_models_can_be_serialized_and_deserialized_to_and_from_json():
    serialized = []
    for model in examples:
        typ3 = type(model)
        result = json.dumps(model, cls=DataclassJSONEncoder, ensure_ascii=False)
        assert len(result), f"{typ3} should be serializable"
        serialized.append((result, typ3))
    for model, typ3 in serialized:
        result = json.loads(model, cls=DataclassJSONDecoder)
        assert result is not None, f"{typ3} should be serializable"
        assert isinstance(result, Model), f"Deserializing should create object of type {typ3}, but was {type(result)}"


@pytest.mark.skip(reason="Adjust used data types")
def test_networkx_graph_with_dataclasses_is_isomorphic_after_dumping_and_loading_again():
    graph = example_graph()
    serializable_graph = node_link_data(graph)
    serialized_graph = json.dumps(serializable_graph, cls=DataclassJSONEncoder, ensure_ascii=False, indent=2)
    loaded = json.loads(serialized_graph, cls=DataclassJSONDecoder)
    loaded_graph = node_link_graph(loaded)
    assert nx.is_isomorphic(loaded_graph,
                            graph), "Serializing and unserializing a networkx graph should not change it"


def test_other_graph_is_isomorphic_after_dumping_and_loading_again():
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
