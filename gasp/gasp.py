import json

import requests
from clingo import Control as InnerControl
from dataclasses import asdict, is_dataclass

from server import factory
from shared.model import Model
from shared.simple_logging import log, Level, warn

from server.database import ClingoMethodCall


def backend_is_running():
    try:
        r = requests.head("http://127.0.0.1:5000/")
        return r.status_code == 200
    except requests.exceptions.ConnectionError:
        return False


def is_non_cython_function_call(attr: classmethod):
    return hasattr(attr, "__call__") and not attr.__name__.startswith("_") and not attr.__name__.startswith("<")


class PaintConnector:

    def paint(self):
        if not backend_is_running():
            raise Exception("Server is not available")

    def unmark(self, model: Model):
        raise NotImplementedError

    def mark(self, model: Model):
        raise NotImplementedError

    def clear(self):
        raise NotImplementedError


class DatabaseConnector:
    def __init__(self):
        if backend_is_running():
            self.base_url = "http://127.0.0.1:5000/"
        else:
            log("Backend is unavailable", Level.WARN)

    def save_function_call(self, call: ClingoMethodCall):
        if backend_is_running():
            r = requests.post(f"{self.base_url}control/call", json=asdict(call))
            print(r.status_code, r.reason)
        else:
            # TODO: only log once or sometimes, look at TTLCache
            warn(f"Backend dead.")


class Control(InnerControl):

    def _register_function_call(self, name, args, kwargs):
        serializable_call = ClingoMethodCall(name, args, kwargs)
        self.database.save_function_call(serializable_call)
        print(f"Registered {serializable_call}")

    def __init__(self, *args, **kwargs):
        self.gasp = PaintConnector()
        self.database = DatabaseConnector()
        if not backend_is_running():
            warn("You are using the vizgo control object and no server is running right now")
            # TODO: output good warning
        self._register_function_call("__init__", args, kwargs)
        super().__init__(*args, **kwargs)

    def __getattribute__(self, name):
        attr = InnerControl.__getattribute__(self, name)
        if is_non_cython_function_call(attr):
            def wrapper_func(*args, **kwargs):
                self._register_function_call(attr.__name__, args, kwargs)
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


if __name__ == "__main__":
    ctl = Control(["0"])

    ctl.add("base", [], "a. {b}. c :- not b.")

    ctl.ground([("base", [])])
    with ctl.solve(yield_="True") as handle:
        for m in handle:
            print(m)
    ctl.gasp.paint()
