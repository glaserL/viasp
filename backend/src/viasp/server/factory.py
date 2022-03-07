import os

from flask import Flask
from werkzeug.middleware.profiler import ProfilerMiddleware
from werkzeug.utils import find_modules, import_string

from flask_cors import CORS
from viasp.shared.io import DataclassJSONEncoder, DataclassJSONDecoder


def register_blueprints(app):
    """collects all blueprints and adds them to the app object"""
    for name in find_modules('viasp.server.blueprints'):
        mod = import_string(name)
        print(f"Found module {name} with import string {mod}.")
        if hasattr(mod, 'bp'):
            print(f"Adding blueprint {mod.bp}.?")
            app.register_blueprint(mod.bp)
    return None


def create_app():
    app = Flask('api', static_folder=None)  # flask object
    app.json_encoder = DataclassJSONEncoder
    app.json_decoder = DataclassJSONDecoder
    app.config['CORS_HEADERS'] = 'Content-Type'

    register_blueprints(app)
    CORS(app)

    app.json_encoder = DataclassJSONEncoder
    app.json_decoder = DataclassJSONDecoder

    return app
