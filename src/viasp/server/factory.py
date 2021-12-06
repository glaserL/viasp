import logging
import os

from flask import Flask
from werkzeug.middleware.profiler import ProfilerMiddleware
from werkzeug.utils import find_modules, import_string

from flask_cors import CORS
from viasp.shared.io import DataclassJSONEncoder, DataclassJSONDecoder

logging.getLogger('flask_cors').level = logging.DEBUG


def register_blueprints(app):
    """collects all blueprints and adds them to the app object"""
    for name in find_modules('viasp.server.blueprints'):
        mod = import_string(name)
        print(f"Found module {name} with import string {mod}.")
        if hasattr(mod, 'bp'):
            print(f"Adding blueprint {mod.bp}.?")
            app.register_blueprint(mod.bp)

    return None


def create_app(config=None):
    if not config:
        config = {}
    app = Flask('api', static_folder=None)  # flask object
    app.json_encoder = DataclassJSONEncoder
    app.json_decoder = DataclassJSONDecoder
    app.config['CORS_HEADERS'] = 'Content-Type'

    # app.config.from_object(__name__) #load configs from here, could be another config file
    # app.config.update(dict(
    #     DATABASE=os.path.join(app.root_path, 'laprint.db'),
    #     SECRET_KEY='verysecretkeydontleaveunset',
    #     USERNAME='admin',
    #     PASSWORT='admin',
    #     DEBUG=True
    # ))
    # app.config.update(config or {})
    # app.config.from_envvar('LAPRINT_SETTINGS', silent=True)
    # FIXME: This is very bad.
    cors_resources = {r"/settings*": {"origins": "http://localhost:3000/"},
                      r"/query*": {"origins": "http://localhost:3000/"},
                      r"/trace*": {"origins": "http://localhost:3000/"},
                      r"/filter*": {"origins": "http://localhost:3000/"},
                      r"/facts*": {"origins": "http://localhost:3000/"},
                      r"/edges*": {"origins": "http://localhost:3000/"},
                      r"/model*": {"origins": "http://localhost:3000/"},
                      r"/node*": {"origins": "http://localhost:3000/"},
                      r"/children*": {"origins": "http://localhost:3000/"},
                      r"/rules": {"origins": "http://localhost:3000/"}}

    register_blueprints(app)
    print(f"Configuring cors as : {cors_resources}")

    CORS(app, resources=cors_resources)

    # app.url_map.strict_slashes = False
    print(f"False")
    app.json_encoder = DataclassJSONEncoder
    app.json_decoder = DataclassJSONDecoder
    #
    # app.config['PROFILE'] = True
    # app.wsgi_app = ProfilerMiddleware(app.wsgi_app, restrictions=[30])
    return app
