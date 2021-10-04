import json
from typing import List

import requests
from clingo import Function
from clingo import Control as InnerControl
from dataclasses import dataclass, asdict, is_dataclass

from shared.simple_logging import log
from server.database import ClingoMethodCall


@dataclass
class Model:
    atoms: List[Function]


def try_to_start_server_if_not_available():
    log(f"Consider starting the server before to make everything faster.", Level.WARN)


def is_non_cython_function_call(attr: classmethod):
    return hasattr(attr, "__call__") and not attr.__name__.startswith("_") and not attr.__name__.startswith("<")


class PaintConnector:

    def paint(self):
        r = requests.get("http://127.0.0.1:5000/control/solve")
        if r.ok:
            print(r.json())

    def unmark(self, model: Model):
        raise NotImplementedError

    def mark(self, model: Model):
        raise NotImplementedError

    def clear(self):
        raise NotImplementedError


class DatabaseConnector:
    def __init__(self):
        self.base_url = "http://127.0.0.1:5000/"

    def save_function_call(self, call: ClingoMethodCall):
        r = requests.post(f"{self.base_url}control/call", json=asdict(call))
        print(r.status_code, r.reason)


class Control(InnerControl):

    def _register_function_call(self, name, args, kwargs):
        serializable_call = ClingoMethodCall(name, args, kwargs)
        self.database.save_function_call(serializable_call)
        print(f"Registered {serializable_call}")

    def __init__(self, *args, **kwargs):
        self.gasp = PaintConnector()
        self.database = DatabaseConnector()
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
