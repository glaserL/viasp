from typing import Any

import networkx as nx


def get_start_node_from_graph(graph: nx.Graph) -> Any:
    beginning = next(filter(lambda tuple: tuple[1] == 0, graph.in_degree()))
    return beginning[0]
