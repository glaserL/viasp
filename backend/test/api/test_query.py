import pytest
from networkx import node_link_data

from viasp.shared.model import Node, Signature, Transformation


@pytest.fixture(scope="function", autouse=True)
def reset_db(client):
    client.delete("graph/clear")


@pytest.mark.skip(reason="Unused, I think?")
def test_tracing(client_with_a_graph, single_node_graph):
    client_with_a_graph.delete("graph/clear")
    single_node: Node = list(single_node_graph.nodes)[0]
    uuid = single_node.uuid
    symbol = list(single_node.atoms)[0]

    serializable_graph = node_link_data(single_node_graph)
    client_with_a_graph.post("graph", json=serializable_graph)
    res = client_with_a_graph.post(f"trace/?uuid={uuid}")
    assert res.status_code == 200


def test_query_endpoints_methods(client_with_a_graph):
    res = client_with_a_graph.get("query")
    assert res.status_code == 200
    res = client_with_a_graph.post("query")
    assert res.status_code == 405
    res = client_with_a_graph.delete("query")
    assert res.status_code == 405
    res = client_with_a_graph.put("query")
    assert res.status_code == 405


def test_query_for_symbol(client_with_a_graph):
    q = "a(1)"
    res = client_with_a_graph.get(f"query?q={q}")
    assert res.status_code == 200
    assert any(any(str(atom) == q for atom in result.atoms) for result in res.json if isinstance(result, Node))


def test_query_for_signature(client_with_a_graph):
    q = "a/1"
    res = client_with_a_graph.get(f"query?q={q}")
    assert res.status_code == 200
    assert any(result.args == 1 and result.name == "a" for result in res.json if isinstance(result, Signature))


def test_query_for_rule(client_with_a_graph):
    searched_rule = "c(X) :- b(X)."
    q = "c(X)"
    res = client_with_a_graph.get(f"query?q={q}")
    assert res.status_code == 200
    assert any(any(rule == searched_rule for rule in result.rules) for result in res.json if
               isinstance(result, Transformation))
