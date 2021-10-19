import networkx as nx

from src.viasp.shared.model import fromPrev, Transformation, Model


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
