"""Mostly graph utility functions."""
import networkx as nx


def merge_cycles(g: nx.Graph) -> nx.Graph:
    mapping = {}
    for cycle in nx.algorithms.components.strongly_connected_components(g):
        merge_node = merge_nodes(cycle)
        mapping.update({old_node: merge_node for old_node in cycle})
    return nx.relabel_nodes(g, mapping)


def merge_nodes(nodes: frozenset) -> frozenset:
    old = set()
    for x in nodes:
        old.update(x)
    return frozenset(old)


def remove_loops(g: nx.Graph) -> nx.Graph:
    remove_edges = []
    for edge in g.edges:
        u, v = edge
        if u == v:
            remove_edges.append(edge)

    for edge in remove_edges:
        g.remove_edge(*edge)
    return g
