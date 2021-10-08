import os

from flask import Flask
from werkzeug.utils import find_modules, import_string


def register_blueprints(app):
    """collects all blueprints and adds them to the app object"""
    print(f"KWKWK")
    for name in find_modules('gasp.server.blueprints'):
        print(f"KWKWASDAKDS")
        mod = import_string(name)
        print(f"Found module {name} with import string {mod}.")
        if hasattr(mod, 'bp'):
            print(f"Adding blueprint {mod.bp}.?")
            app.register_blueprint(mod.bp)
    return None


def create_app(config=None):
    app = Flask('api')  # flask object
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

    register_blueprints(app)

    return app
