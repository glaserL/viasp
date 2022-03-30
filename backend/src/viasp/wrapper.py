import json
import sys
from inspect import signature
from typing import List

from clingo import Control as InnerControl, Model
from dataclasses import asdict, is_dataclass

from .clingoApiClient import ClingoClient
from .shared.defaults import STDIN_TMP_STORAGE_PATH
from .shared.io import clingo_model_to_stable_model
from .shared.model import StableModel


def is_non_cython_function_call(attr: classmethod):
    return hasattr(attr, "__call__") and not attr.__name__.startswith("_") and not attr.__name__.startswith("<")


class ShowConnector:

    def __init__(self, **kwargs):
        self._marked: List[StableModel] = []
        if "_viasp_client" in kwargs:
            self._database = kwargs["_viasp_client"]
        else:
            self._database = ClingoClient(**kwargs)
        self._connection = None

    def show(self):
        self._database.set_target_stable_model(self._marked)
        self._database.show()

    def unmark(self, model: Model):
        serialized = clingo_model_to_stable_model(model)
        self._marked.remove(serialized)

    def mark(self, model: Model):
        serialized = clingo_model_to_stable_model(model)
        self._marked.append(serialized)

    def clear(self):
        self._marked.clear()

    def register_function_call(self, name, sig, args, kwargs):
        self._database.register_function_call(name, sig, args, kwargs)


class Control(InnerControl):

    def __init__(self, *args, **kwargs):
        self.viasp = ShowConnector(**kwargs)
        if "_viasp_client" in kwargs:
            del kwargs["_viasp_client"]
        if "viasp_backend_url" in kwargs:
            del kwargs["viasp_backend_url"]
        self.viasp.register_function_call("__init__", signature(super().__init__), args, kwargs)
        super().__init__(*args, **kwargs)

    def load(self, path: str) -> None:
        if path == "-":
            path = STDIN_TMP_STORAGE_PATH
            tmp = sys.stdin.readlines()
            with open(path, "w", encoding="utf-8") as f:
                f.writelines(tmp)
        self.viasp.register_function_call("load", signature(self.load), [], kwargs={"path": path})
        super().load(path=path)

    def __getattribute__(self, name):
        attr = InnerControl.__getattribute__(self, name)
        if is_non_cython_function_call(attr) and name != "load":
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
