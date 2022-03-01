import json
import time

from viasp.shared.io import DataclassJSONEncoder, DataclassJSONDecoder
from viasp.shared.model import ClingoMethodCall


def test_call_endpoint(client, clingo_call_run_sample):
    bad_value = {"foo": "bar"}
    res = client.post("/control/call", data=bad_value)
    assert res.status_code == 400
    res = client.post("/control/call", json=clingo_call_run_sample)
    assert res.status_code == 200
    res = client.delete("/control/call")
    assert res.status_code == 405
    res = client.put("/control/call")
    assert res.status_code == 405


def test_solve_endpoint(client, clingo_call_run_sample):
    res = client.post("/control/call", json=clingo_call_run_sample)
    assert res.status_code == 200
    res = client.get("/control/solve")
    assert res.status_code == 200
    res = client.post("/control/solve")
    assert res.status_code == 405
    res = client.delete("/control/solve")
    assert res.status_code == 405
    res = client.put("/control/solve")
    assert res.status_code == 405


def test_model_endpoint(client, clingo_stable_models):
    res = client.post("/control/models", json=clingo_stable_models)
    assert res.status_code == 200
    res = client.get("/control/models")
    assert len(res.json) > 0
    assert len(clingo_stable_models) == len(res.json)
    client.post("/control/models/clear")
    res = client.get("/control/models")
    assert len(res.json) == 0


def test_paint_endpoint(client, clingo_stable_models):
    client.delete("/graph")
    res = client.get("/graph")
    assert len(list(res.json.nodes)) == 0
    client.post("/control/models", json=clingo_stable_models)
    res = client.post("/control/paint")
    assert res.status_code == 200
    res = client.get("/graph")
    assert len(list(res.json.nodes)) > 0
