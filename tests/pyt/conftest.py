import pytest
from flask import Flask
from flask.testing import FlaskClient

from src.viasp.server.blueprints.api import bp as api_bp
from src.viasp.server.blueprints.app import bp as app_bp
from src.viasp.server.blueprints.dag_api import bp as dag_bp
from src.viasp.shared.io import DataclassJSONEncoder, DataclassJSONDecoder


def create_app_with_registered_blueprints(*bps) -> Flask:
    app = Flask(__name__)
    for bp in bps:
        app.register_blueprint(bp)

    app.json_encoder = DataclassJSONEncoder
    app.json_decoder = DataclassJSONDecoder

    return app


@pytest.fixture
def client() -> FlaskClient:
    app = create_app_with_registered_blueprints(app_bp, api_bp, dag_bp)

    with app.test_client() as client:
        yield client
