"""This module is concerned with finding reasons for why a stable model is found."""
from collections import defaultdict
from typing import List, Collection

import networkx as nx
from clingo import Control, Symbol, Model
from itertools import tee

from .reify import line_nr_to_rule_mapping_and_facts
from ..shared.model import Node, Transformation
from ..shared.simple_logging import info, warn


def pairwise(iterable):
    "s -> (s0,s1), (s1,s2), (s2, s3), ..."
    a, b = tee(iterable)
    next(b, None)
    return zip(a, b)


def get_h_symbols_from_model(wrapped_stable_model, transformed_prg) -> List[Symbol]:
    rules_that_are_reasons_why = []
    ctl = Control()
    stringified = "".join(map(str, transformed_prg))
    ctl.add("base", [], "".join(stringified))
    ctl.add("base", [], "".join(wrapped_stable_model))
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


def sort_and_merge_h_symbols(h_symbols: Collection[Symbol]) -> List[Collection[Symbol]]:
    tmp = defaultdict(list)
    for sym in h_symbols:
        rule_nr, symbol = sym.arguments
        tmp[rule_nr].append(symbol)
    h_symbols = [(rule_nr, Node(tmp[rule_nr])) for rule_nr in sorted(tmp.keys())]
    return h_symbols


def make_reason_path_from_facts_to_stable_model(wrapped_stable_model, transformed_prg, rule_mapping,
                                                facts) -> nx.DiGraph:
    h_syms = get_h_symbols_from_model(wrapped_stable_model, transformed_prg)

    h_syms = sort_and_merge_h_symbols(h_syms)
    g = nx.DiGraph()
    if not h_syms:
        warn(f"Adding a model without reasons {wrapped_stable_model}")
        g.add_edge(facts, Node(set()), transformation=Transformation(0, rule_mapping[min(rule_mapping.keys())]))
        return g
    g.add_edge(facts, h_syms[0][1], transformation=Transformation(0, rule_mapping[min(rule_mapping.keys())]))
    for (_, a), (rule_nr, b) in pairwise(h_syms):
        g.add_edge(a, b, transformation=Transformation(rule_nr.number, rule_mapping[rule_nr.number]))
    return g


def join_paths_with_facts(paths: Collection[nx.DiGraph], facts: Collection[Symbol],
                          first_rule: Transformation) -> nx.DiGraph:
    # for path in paths:
    #     beginning = next(filter(lambda tuple: tuple[1] == 0, path.in_degree()))
    #     path.add_edge(facts, beginning[0], transformation=first_rule)
    combined = nx.compose_all(list(paths))
    return combined


def build_graph(wrapped_stable_models, transformed_prg, orig_program) -> nx.DiGraph:
    paths: List[nx.DiGraph] = []
    mapping, facts = line_nr_to_rule_mapping_and_facts(orig_program)
    facts = Node(facts)
    if not len(mapping):
        info(f"Program only contains facts. {facts}")
        single_node_graph = nx.DiGraph()
        single_node_graph.add_node(facts)
        return single_node_graph
    for model in wrapped_stable_models:
        paths.append(make_reason_path_from_facts_to_stable_model(model, transformed_prg, mapping, facts))

    first_rule = Transformation(min(mapping.keys()), mapping[min(mapping.keys())])
    result_graph = join_paths_with_facts(paths, facts, first_rule)
    return result_graph


def save_model(model: Model):
    x = 0
    wrapped = []
    for part in model.symbols(atoms=True):
        wrapped.append(f"model({part}).")
    return wrapped
