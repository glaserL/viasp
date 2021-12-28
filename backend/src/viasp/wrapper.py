import json
from inspect import signature
from typing import List

import requests
from clingo import Control as InnerControl, Model
from dataclasses import asdict, is_dataclass

from .clingoApiClient import ClingoClient
from .server.database import ClingoMethodCall
from .shared.io import model_to_json, model_to_dict, clingo_model_to_stable_model
from .shared.model import StableModel
from .shared.simple_logging import warn


def backend_is_running():
    try:
        r = requests.head("http://127.0.0.1:5000/")
        return r.status_code == 200
    except requests.exceptions.ConnectionError:
        return False


def is_non_cython_function_call(attr: classmethod):
    return hasattr(attr, "__call__") and not attr.__name__.startswith("_") and not attr.__name__.startswith("<")


class PaintConnector:

    def __init__(self, **kwargs):
        self._marked: List[StableModel] = []
        self._database = ClingoClient(**kwargs)
        self._connection = None

    def paint(self):
        if not backend_is_running():
            raise Exception("Server is not available")
        self._database.set_target_stable_model(self._marked)
        self._database.paint()


    def unmark(self, model: Model):
        serialized = clingo_model_to_stable_model(model)
        self._marked.remove(serialized)

    def mark(self, model: Model):
        serialized = clingo_model_to_stable_model(model)
        self._marked.append(serialized)

    def clear(self):
        self._marked.clear()

    def register_function_call(self, name, sig, args, kwargs):
        serializable_call = ClingoMethodCall.merge(name, sig, args, kwargs)
        self._database.save_function_call(serializable_call)
        print(f"Registered {serializable_call}")


class Control(InnerControl):

    def __init__(self, *args, **kwargs):
        self.viasp = PaintConnector(**kwargs)
        if not backend_is_running():
            warn("You are using the vizgo control object and no server is running right now")
            # app = factory.create_app()
            # from waitress import serve
            # serve(app, host="0.0.0.0", port=8080)
            # TODO: output good warning
        self.viasp.register_function_call("__init__", signature(super().__init__), args, kwargs)
        super().__init__(*args, **kwargs)

    def __getattribute__(self, name):
        attr = InnerControl.__getattribute__(self, name)
        if is_non_cython_function_call(attr):
            def wrapper_func(*args, **kwargs):
                self.viasp.register_function_call(attr.__name__, signature(attr), args, kwargs)
                result = attr(*args, **kwargs)
                return result

            return wrapper_func
        else:
            return attr


class EnhancedJSONEncoder(json.JSONEncoder):
    def default(self, o):
        if is_dataclass(o):
            return asdict(o)
        return super().default(o)
