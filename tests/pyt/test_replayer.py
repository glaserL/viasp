from inspect import signature

from clingo import Control
from src.gasp.server.replayer import apply_multiple
from src.gasp.shared.model import ClingoMethodCall


def run_sample():
    signature_object = Control()
    return [
        ClingoMethodCall.merge("__init__", signature(signature_object.__init__), [["0"]], {}),
        ClingoMethodCall.merge("add", signature(signature_object.add), ["base", []],
                               {"program": "a. {b}. c :- not b."}),
        ClingoMethodCall.merge("ground", signature(signature_object.ground), [[("base", [])]], {}),
        ClingoMethodCall.merge("solve", signature(signature_object.solve), [], {"yield_": True})
    ]


def test_run():
    wrapped = run_sample()
    replayed = apply_multiple(wrapped)
    num_models = 0
    with replayed.solve(yield_=True) as handle:
        for m in handle:
            _ = m.symbols(atoms=True)
            num_models += 1
    assert num_models == 2

