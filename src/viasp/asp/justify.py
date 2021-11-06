"""This module is concerned with finding reasons for why a stable model is found."""
from collections import defaultdict
from typing import List, Collection, Tuple, Dict, Iterable

import networkx as nx
from clingo import Control, Symbol, Model

from clingo.ast import AST

from .reify import line_nr_to_rule_mapping_and_facts
from ..shared.model import Node, Transformation
from ..shared.simple_logging import info, warn
from ..shared.util import pairwise, get_sorted_path_from_path_graph


def get_h_symbols_from_model(wrapped_stable_model: Iterable[Symbol], transformed_prg) -> List[Symbol]:
    rules_that_are_reasons_why = []
    ctl = Control()
    stringified = "".join(map(str, transformed_prg))
    ctl.add("base", [], stringified)
    ctl.add("base", [], "".join(map(str, wrapped_stable_model)))
    ctl.ground([("base", [])])
    for x in ctl.symbolic_atoms.by_signature("h", 2):  # TODO: this might not be h if we had to substitute with _h
        rules_that_are_reasons_why.append(x.symbol)
    return rules_that_are_reasons_why


def get_facts(original_program) -> Collection[Symbol]:
    ctl = Control()
    facts = set()
    stringified = "".join(map(str, original_program))
    ctl.add("__facts", [], stringified)
    ctl.ground([("__facts", [])])
    for atom in ctl.symbolic_atoms:
        if atom.is_fact:
            facts.add(atom.symbol)
    return frozenset(facts)


def collect_and_sort_h_symbols_by_rule_nr(h_symbols: Collection[Symbol]) -> List[Node]:
    tmp = defaultdict(list)
    for sym in h_symbols:
        rule_nr, symbol = sym.arguments
        tmp[rule_nr].append(symbol)
    h_symbols = [Node(frozenset(tmp[rule_nr]), rule_nr.number) for rule_nr in sorted(tmp.keys())]
    return h_symbols


def insert_atoms_into_nodes(path: List[Node]):
    facts = path[0]
    state = set(facts.diff)
    facts.atoms = frozenset(state)
    for u, v in pairwise(path):
        state.update(v.diff)
        state.update(u.diff)
        v.atoms = frozenset(state)


def make_reason_path_from_facts_to_stable_model(wrapped_stable_model, transformed_prg, rule_mapping: Dict[int, AST],
                                                facts: Node) -> nx.DiGraph:
    h_syms = get_h_symbols_from_model(wrapped_stable_model, transformed_prg)

    h_syms = collect_and_sort_h_symbols_by_rule_nr(h_syms)
    h_syms.insert(0, facts)

    insert_atoms_into_nodes(h_syms)
    g = nx.DiGraph()
    if len(h_syms) == 1:
        # If there is a stable model that is exactly the same as the facts.
        warn(f"Adding a model without reasons {wrapped_stable_model}")
        g.add_edge(facts, Node(frozenset(), min(rule_mapping.keys())),
                   transformation=Transformation(min(rule_mapping.keys()), rule_mapping[min(rule_mapping.keys())]))
        return g
    # g.add_edge(facts, h_syms[0],
    #           transformation=Transformation(min(rule_mapping.keys()), rule_mapping[min(rule_mapping.keys())]))
    for a, b in pairwise(h_syms):
        g.add_edge(a, b, transformation=Transformation(b.rule_nr, rule_mapping[b.rule_nr]))

    return g


def join_paths_with_facts(paths: Collection[nx.DiGraph]) -> nx.DiGraph:
    combined = nx.DiGraph()
    for path in paths:
        for node in path.nodes():
            if node not in combined.nodes:
                combined.add_node(node)
        for u, v, r in path.edges(data=True):
            if u in combined.nodes and v in combined.nodes:
                combined.add_edge(u, v, transformation=r["transformation"])
    return combined


def build_graph(wrapped_stable_models: Collection[str], transformed_prg: Collection[str],
                orig_program: str) -> nx.DiGraph:
    paths: List[nx.DiGraph] = []
    mapping, facts = line_nr_to_rule_mapping_and_facts(orig_program)
    facts = Node(frozenset(facts), 0, frozenset(facts))
    if not len(mapping):
        info(f"Program only contains facts. {facts}")
        single_node_graph = nx.DiGraph()
        single_node_graph.add_node(facts)
        return single_node_graph
    for model in wrapped_stable_models:
        new_path = make_reason_path_from_facts_to_stable_model(model, transformed_prg, mapping, facts)
        paths.append(new_path)

    result_graph = join_paths_with_facts(paths)
    return result_graph


def save_model(model: Model) -> Collection[str]:
    x = 0
    wrapped = []
    for part in model.symbols(atoms=True):
        wrapped.append(f"model({part}).")
    return wrapped
