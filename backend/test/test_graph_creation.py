from typing import List

import networkx as nx
import pytest
from clingo import Function
from clingo.ast import AST

from viasp.asp.justify import build_graph, make_reason_path_from_facts_to_stable_model, \
    get_h_symbols_from_model
from viasp.shared.util import pairwise
from viasp.asp.reify import transform, ProgramAnalyzer, reify_list
from viasp.shared.model import Node, Transformation
from viasp.shared.util import get_start_node_from_graph, get_end_node_from_path

from helper import get_stable_models_for_program


def test_justification_creates_a_graph_with_a_single_path():
    orig_program = "c(1). c(2). b(X) :- c(X). a(X) :- b(X)."
    analyzer = ProgramAnalyzer()
    sorted_program = analyzer.sort_program(orig_program)
    saved_models = get_stable_models_for_program(orig_program)
    reified = reify_list(sorted_program)

    g = build_graph(saved_models, reified, analyzer)
    assert len(g.nodes()) == 3
    assert len(g.edges()) == 2


def test_justification_creates_a_graph_with_three_paths_on_choice_rules():
    orig_program = "a(1). a(2). { b(X) } :- a(X)."
    analyzer = ProgramAnalyzer()
    sorted_program = analyzer.sort_program(orig_program)
    saved_models = get_stable_models_for_program(orig_program)
    reified = reify_list(sorted_program)

    g = build_graph(saved_models, reified, analyzer)
    assert len(g.nodes()) == 5
    assert len(g.edges()) == 4


@pytest.mark.skip(reason="Not implemented yet.")
def test_justification_creates_a_graph_with_three_paths_on_multiple_choice_rules_merging_isomorphic_partial_paths():
    orig_program = "a(1). {b(X)} :- a(X). d(X) :- b(X). {c(X)} :- b(X)."
    analyzer = ProgramAnalyzer()
    sorted_program = analyzer.sort_program(orig_program)
    saved_models = get_stable_models_for_program(orig_program)
    reified = reify_list(sorted_program)

    g = build_graph(saved_models, reified, analyzer)
    assert len(g.nodes()) == 6
    # assert len(g.edges()) == 5


def test_pairwise_works():
    lst = [0, 1, 2, 3]
    assert list(pairwise(lst)) == [(0, 1), (1, 2), (2, 3)]


def test_graph_merges_facts_together():
    orig_program = "c(1). c(2). a."
    analyzer = ProgramAnalyzer()
    sorted_program = analyzer.sort_program(orig_program)
    saved_models = get_stable_models_for_program(orig_program)
    reified = reify_list(sorted_program)

    g = build_graph(saved_models, reified, analyzer)
    assert len(g.nodes()) == 1
    assert len(g.edges()) == 0


def test_facts_get_merged_in_one_node():
    orig_program = "c(1). c(2). a. z(1) :- a. x(X) :- c(X)."
    analyzer = ProgramAnalyzer()
    sorted_program = analyzer.sort_program(orig_program)
    saved_models = get_stable_models_for_program(orig_program)
    reified = reify_list(sorted_program)

    g = build_graph(saved_models, reified, analyzer)
    assert len(g.nodes) == 3
    assert len(g.edges) == 2


def test_rules_are_transferred_to_transformations():
    orig_program = "a(1). {b(X)} :- a(X). d(X) :- b(X). {c(X)} :- b(X)."
    analyzer = ProgramAnalyzer()
    sorted_program = analyzer.sort_program(orig_program)
    saved_models = get_stable_models_for_program(orig_program)
    reified = reify_list(sorted_program)

    g = build_graph(saved_models, reified, analyzer)
    for _, _, t in g.edges(data=True):
        tr = t["transformation"]
        assert isinstance(tr, Transformation)
        assert tr.rules != None
        assert len(tr.rules) > 0
        assert type(next(iter(tr.rules))) == AST


@pytest.mark.skip(reason="Not implemented yet.")
def test_that_rules_that_never_fire_somehow_are_registered():
    pass


def test_negative_recursion_gets_treated_correctly():
    orig_program = "a. b :- not c, a. c :- not b, a."
    analyzer = ProgramAnalyzer()
    sorted_program = analyzer.sort_program(orig_program)
    saved_models = get_stable_models_for_program(orig_program)
    reified = reify_list(sorted_program)

    g = build_graph(saved_models, reified, analyzer)
    assert len(g.nodes) == 3
    assert len(g.edges) == 2


def test_path_creation():
    program = "fact(1). result(X) :- fact(X). next(X) :- fact(X)."
    transformed = transform(program)
    single_saved_model = get_stable_models_for_program(program).pop()
    facts, constants = [], []
    h_symbols = get_h_symbols_from_model(single_saved_model, transformed, facts, constants)
    path = make_reason_path_from_facts_to_stable_model(single_saved_model,
                                                       {1: "first_rule", 2: "second_rule"}, Node(frozenset(), 0),
                                                       h_symbols)
    nodes, edges = list(path.nodes), list(t for _, _, t in path.edges.data(True))
    assert len(edges) == 2
    assert len(nodes) == 3
    assert all([isinstance(node, Node) for node in nodes])


def test_atoms_are_propagated_correctly_through_diffs():
    program = "a. b :- a. c :- b. d :- c."
    transformed = transform(program)
    single_saved_model = get_stable_models_for_program(program).pop()
    facts, constants = [], []
    h_symbols = get_h_symbols_from_model(single_saved_model, transformed, facts, constants)
    path = make_reason_path_from_facts_to_stable_model(single_saved_model,
                                                       {1: "b :- a", 2: "c :- b", 3: " d :- c"},
                                                       Node(frozenset([Function("a")]), 0, frozenset([Function("a")])),
                                                       h_symbols)
    beginning: Node = get_start_node_from_graph(path)
    end: Node = get_end_node_from_path(path)
    path_list: List[Node] = nx.shortest_path(path, beginning, end)
    for src, tgt in pairwise(path_list):
        assert src.diff.issubset(tgt.atoms)
        assert len(src.atoms) == len(tgt.atoms) - len(tgt.diff)
