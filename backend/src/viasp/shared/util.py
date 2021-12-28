from itertools import tee
from typing import Any, TypeVar, Iterable, Tuple

import networkx as nx


def get_start_node_from_graph(graph: nx.DiGraph) -> Any:
    beginning = next(filter(lambda tuple: tuple[1] == 0, graph.in_degree()))
    return beginning[0]


def get_end_node_from_path(graph: nx.DiGraph) -> Any:
    end = next(filter(lambda tuple: tuple[1] == 0, graph.out_degree()))
    return end[0]


def get_leafs_from_graph(graph: nx.DiGraph) -> Iterable[Any]:
    return filter(lambda deg: deg[1] == 0, graph.out_degree())


def get_sorted_path_from_path_graph(graph: nx.DiGraph) -> Any:
    start = get_start_node_from_graph(graph)
    end = get_end_node_from_path(graph)
    return nx.shortest_path(graph, start, end)


T = TypeVar("T")


def pairwise(iterable: Iterable[T]) -> Iterable[Tuple[T, T]]:
    "s -> (s0,s1), (s1,s2), (s2, s3), ..."
    a, b = tee(iterable)
    next(b, None)
    return zip(a, b)
