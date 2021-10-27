import networkx as nx
import pytest
from clingo import Control
import matplotlib.pyplot as plt

from src.viasp.asp.justify import save_model, build_graph, make_reason_path_from_facts_to_stable_model, get_facts, \
    pairwise
from src.viasp.asp.reify import transform
from src.viasp.shared.model import Node, Transformation


def get_stable_models_for_program(program):
    ctl = Control(["0"])
    ctl.add("base", [], program)
    ctl.ground([("base", [])])

    saved_models = []
    with ctl.solve(yield_=True) as handle:
        for model in handle:
            saved_models.append(save_model(model))
    return saved_models


def test_justification_creates_a_graph_with_a_single_path():
    program = "c(1). c(2). b(X) :- c(X). a(X) :- b(X)."
    transformed = transform(program)
    saved_models = get_stable_models_for_program(program)
    g = build_graph(saved_models, transformed, program)
    assert len(g.nodes()) == 3
    assert len(g.edges()) == 2


def test_pairwise_works():
    lst = [0, 1, 2, 3]
    assert list(pairwise(lst)) == [(0, 1), (1, 2), (2, 3)]


def test_graph_merges_facts_together():
    program = "c(1). c(2). a."
    transformed = transform(program)
    saved_models = get_stable_models_for_program(program)
    g = build_graph(saved_models, transformed, program)
    assert len(g.nodes()) == 1
    assert len(g.edges()) == 0


def test_facts_get_merged_in_one_node():
    program = "c(1). c(2). a. z(1) :- a. x(X) :- c(X)."
    transformed = transform(program)
    saved_models = get_stable_models_for_program(program)
    g = build_graph(saved_models, transformed, program)
    assert len(g.nodes) == 3
    assert len(g.edges) == 2


@pytest.mark.skip(reason="Not implemented yet.")
def test_that_rules_that_never_fire_somehow_are_registered():
    pass


def test_path_creation():
    program = "fact(1). result(X) :- fact(X). next(X) :- fact(X)."
    transformed = transform(program)
    single_saved_model = get_stable_models_for_program(program).pop()
    path = make_reason_path_from_facts_to_stable_model(single_saved_model, transformed,
                                                       {1: "first_rule", 2: "second_rule"}, Node([]))
    nodes, edges = list(path.nodes), list(t for _, _, t in path.edges.data(True))
    assert len(edges) == 2
    assert len(nodes) == 3
    assert all([isinstance(node, Node) for node in nodes])
    assert all([isinstance(edge["transformation"], Transformation) for edge in edges])
