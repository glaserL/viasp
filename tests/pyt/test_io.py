import json

import networkx as nx
from networkx import node_link_data, node_link_graph

from src.viasp.shared.io import DataclassJSONEncoder, DataclassJSONDecoder
from src.viasp.shared.model import Model, CostableModel
from tests.pyt.helper import example_graph

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


def test_networkx_graph_with_dataclasses_is_isomorphic_after_dumping_and_loading_again():
    graph = example_graph()
    serializable_graph = node_link_data(graph)
    path = "../resources/traveling_salesperson.json"
    serialized_graph = json.dumps(serializable_graph, cls=DataclassJSONEncoder, ensure_ascii=False, indent=2)
    loaded = json.loads(serialized_graph, cls=DataclassJSONDecoder)
    loaded_graph = node_link_graph(loaded)
    assert nx.is_isomorphic(loaded_graph,
                            graph), "Serializing and unserializing a networkx graph should not change it"
