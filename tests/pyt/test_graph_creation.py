import networkx as nx
from clingo import Control
import matplotlib.pyplot as plt

from src.viasp.asp.justify import save_model, build_graph
from src.viasp.asp.reify import transform


def get_saved_models_for_program(program):
    ctl = Control(["0"])
    ctl.add("base", [], program)
    ctl.ground([("base", [])])

    saved_models = []
    with ctl.solve(yield_=True) as handle:
        for model in handle:
            saved_models.append(save_model(model))
    return saved_models


def testi_test():
    program = "c(1). c(2). b(X) :- c(X). a(X) :- b(X)."
    transformed = transform(program)
    saved_models = get_saved_models_for_program(program)
    g = build_graph(saved_models, transformed, program)
    assert len(g.nodes()) != 0
    assert len(g.edges()) != 0
