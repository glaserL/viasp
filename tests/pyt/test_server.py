from dataclasses import asdict

from flask import Flask
from flask.testing import FlaskClient

from src.gasp.server.api import backend_api
from src.gasp.shared.model import ClingoMethodCall


def create_api_test_client() -> FlaskClient:
    app = Flask(__name__)
    app.register_blueprint(backend_api)

    return app.test_client()


web = create_api_test_client()


def create_empty_call() -> ClingoMethodCall:
    return ClingoMethodCall("", {})


def test_sth():
    rv = web.get("/")
    assert rv.status == "200 OK"
    assert rv.data.decode("utf-8") == "ok"


def test_registering_valid_call_should_return_ok():
    valid = create_empty_call()
    rv = web.post("/control/call", json=asdict(valid))
    assert rv.status == "200 OK"
    assert rv.data.decode("utf-8") == "ok"


def test_registering_invalid_call_should_return_404():
    some_dict = {"data ": [], "weird": "weird"}
    rv = web.post("/control/call", json=some_dict)
    assert rv.status == "400 BAD REQUEST"
