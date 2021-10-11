import json
from dataclasses import dataclass
from typing import Set, Sequence, Collection, Union
import igraph

import networkx as nx
from clingo import Control
from networkx.readwrite.json_graph import adjacency_data, node_link_data, node_link_graph

from gasp.shared.io import DataclassJSONEncoder


def fromPrev(new: Union[Model, Collection[str]], prev: Union[Model, Collection[str]], mode: str = "union",
             cost: int = None) -> Union[Model, CostableModel]:
    if isinstance(new, Model):
        new = new.atoms
    if isinstance(prev, Model):
        prev = prev.atoms
    if mode == "diff":
        if cost is not None:
            return CostableModel.from_previous_diff_cost(new, prev, cost)
        else:
            return Model.from_previous_diff(new, prev)
    elif mode == "union":
        if cost is not None:
            return CostableModel.from_previous_union_cost(new, prev, cost)
        else:
            return Model.from_previous_union(new, prev)
    else:
        raise TypeError


class WhyDoIHaveToDoThisOnMyOwn:

    def __init__(self):
        self._hash_to_model = {}
        self._hash_to_rule = {}
        self._graph = igraph.Graph(directed=True)

    def add_edge(self, source, target, rule):
        src, tgt = self._get_internal_vertex_hash(source), self._get_internal_vertex_hash(target)
        r = self._get_internal_edge_hash(rule)
        self._graph.add_edge(src, tgt, rule_id=r)

    def _get_internal_edge_hash(self, edge):
        hashed = hash(edge)
        if hashed not in self._hash_to_model:
            self._hash_to_model[hashed] = edge
        return hashed

    def _get_internal_vertex_hash(self, vertex):
        hashed = hash(vertex)
        if hashed not in self._hash_to_model:
            self._hash_to_model[hashed] = vertex
        return hashed


def example_graph():
    graph = nx.DiGraph()
    start = Model({"start(a)"}, set())
    cities = fromPrev({"city(a)", "city(b)", "city(c)", "city(d)"}, start)
    graph.add_edge(start, cities,
                   rule=Transformation(["city(a)", "city(b)", "city(c)", "city(d)"]))
    roads = fromPrev({"road(a,b,10)", "road(b,c,20)", "road(c,d,25)", "road(d,a,40)", "road(b,d,30)", "road(d,c,25)"},
                     cities)
    graph.add_edge(cities, roads, rule=Transformation(
        ["road(a,b,10)", "road(b,c,20)", "road(c,d,25)", "road(d,a,40)", "road(b,d,30)", "road(d,c,25)"]))
    gen = Transformation(["{ travel(X,Y) } :- road(X,Y,_)."])
    travel_1 = fromPrev({"travel(a,b)", "travel(b,d)", "travel(d,c)", "travel(c,a)"}, roads)
    travel_2 = fromPrev({"travel(d,a)", "travel(b,d)", "travel(c,b)", "travel(a,c)"}, roads)
    travel_3 = fromPrev({"travel(a,b)", "travel(b,c)", "travel(c,d)", "travel(d,a)"}, roads)
    graph.add_edge(roads, travel_1, rule=gen)
    graph.add_edge(roads, travel_2, rule=gen)
    graph.add_edge(roads, travel_3, rule=gen)
    visited_1 = fromPrev({"visited(a)", "visited(b)", "visited(c)", "visited(d)"}, travel_1)
    visited_2 = fromPrev({"visited(a)", "visited(b)", "visited(c)", "visited(d)"}, travel_2)
    visited_3 = fromPrev({"visited(a)", "visited(b)", "visited(c)", "visited(d)"}, travel_3)
    visited = Transformation(["visited(Y) :- travel(X,Y), start(X).", "svisited(Y) :- travel(X,Y), visited(X)."])
    graph.add_edge(travel_1, visited_1, rule=visited)
    graph.add_edge(travel_2, visited_2, rule=visited)
    graph.add_edge(travel_3, visited_3, rule=visited)
    constraint_1 = fromPrev(set(), visited_1)
    constraint_2 = fromPrev(set(), visited_2)
    constraint_3 = fromPrev(set(), visited_3)
    constraint = Transformation(
        [":- city(X), not visited(X).", ":- city(X), 2 { travel(X,Y) }.", ":- city(X), 2 { travel(Y,X) }."])
    graph.add_edge(travel_1, constraint_1, rule=constraint)
    graph.add_edge(travel_2, constraint_2, rule=constraint)
    graph.add_edge(travel_3, constraint_3, rule=constraint)
    cost_1 = fromPrev(set(), constraint_1, cost=140)
    cost_2 = fromPrev(set(), constraint_2, cost=100)
    cost_3 = fromPrev(set(), constraint_3, cost=120)
    minimize = Transformation(["#minimize { D,X,Y : travel(X,Y), road(X,Y,D) }."])
    graph.add_edge(constraint_1, cost_1, rule=minimize)
    graph.add_edge(constraint_2, cost_2, rule=minimize)
    graph.add_edge(constraint_3, cost_3, rule=minimize)
    return graph


def testi_test():
    x = example_graph()
    serializable = node_link_data(x)
    path = "../resources/traveling_salesperson.json"
    with open(path, "w", encoding="utf-8") as f:
        json.dump(serializable, f, cls=DataclassJSONEncoder, ensure_ascii=False, indent=2)
    with open(path, "r", encoding="utf-8") as f:
        loaded = json.load(f)
    print(loaded)
    g = node_link_graph(loaded)
