import multiprocessing
import time

import pytest
from flask import Flask
from flask.testing import FlaskClient

from src.viasp.server.database import CallCenter
from src.viasp.asp.replayer import apply_multiple
from src.viasp.server.blueprints.api import bp as api_bp
from src.viasp.server.blueprints.app import bp as app_bp
from src.viasp.server.blueprints.dag_api import bp as dag_bp
from tests.pyt.test_replayer import run_sample


def test_calls_are_filtered_after_application():
    db = CallCenter()
    db.extend(run_sample())
    assert len(db.get_all()) == 4, "There should be four unused calls before reconstruction."
    assert len(db.get_pending()) == 4, "There should be four unused calls before reconstruction."
    _ = apply_multiple(db.get_all())
    assert len(db.get_all()) == 4, "Get all should still return all of them after application."
    assert len(db.get_pending()) == 0, "The call objects should be marked as used after application."


def create_app_with_registered_blueprints(*bps) -> Flask:
    app = Flask(__name__)
    for bp in bps:
        app.register_blueprint(bp)

    return app


@pytest.fixture
def client() -> FlaskClient:
    app = create_app_with_registered_blueprints(app_bp, api_bp, dag_bp)

    with app.test_client() as client:
        yield client


def test_client_works(client):
    """Test if the test client is ok"""
    assert client.get("/").status_code == 200
