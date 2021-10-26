"""This module is concerned with finding reasons for why a stable model is found."""
from collections import defaultdict
from typing import List, Collection

import networkx as nx
from clingo import Control, Symbol, Model
from itertools import tee

from .reify import line_nr_to_rule_mapping


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
    h_symbols = [(rule_nr, frozenset(tmp[rule_nr])) for rule_nr in sorted(tmp.keys())]
    return h_symbols


def make_reason_path(wrapped_stable_model, transformed_prg, rule_mapping) -> nx.DiGraph:
    h_syms = get_h_symbols_from_model(wrapped_stable_model, transformed_prg)

    h_syms = sort_and_merge_h_symbols(h_syms)
    g = nx.DiGraph()
    for (_, a), (rule_nr, b) in pairwise(h_syms):
        g.add_edge(a, b, edge_label=rule_mapping[rule_nr.number])
    return g


def join_paths_with_facts(paths: Collection[nx.DiGraph], facts: Collection[Symbol]) -> nx.DiGraph:
    for path in paths:
        beginning = next(filter(lambda tuple: tuple[1] == 0, path.in_degree()))
        path.add_edge(facts, beginning[0])
    combined = nx.compose_all(list(paths))
    return combined


def build_graph(wrapped_stable_models, transformed_prg, orig_program) -> nx.DiGraph:
    paths: List[nx.DiGraph] = []
    mapping = line_nr_to_rule_mapping(orig_program)
    for model in wrapped_stable_models:
        paths.append(make_reason_path(model, transformed_prg, mapping))
    facts = get_facts(orig_program)
    result_graph = join_paths_with_facts(paths, facts)
    return result_graph


def save_model(model: Model):
    x = 0
    wrapped = []
    for part in model.symbols(atoms=True):
        wrapped.append(f"model({part}).")
    return wrapped
