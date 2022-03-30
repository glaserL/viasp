from inspect import Signature
from typing import Sequence, Any, Dict, Collection

from flask.testing import FlaskClient

from viasp import wrapper
from viasp.shared.model import ClingoMethodCall, StableModel
from viasp.shared.interfaces import ViaspClient


def test_instanciations():
    _ = wrapper.Control()
    _ = wrapper.Control(["0"])


class DebugClient(ViaspClient):
    def show(self):
        pass

    def set_target_stable_model(self, stable_models: Collection[StableModel]):
        self.client.post("control/models", json=stable_models)

    def register_function_call(self, name: str, sig: Signature, args: Sequence[Any], kwargs: Dict[str, Any]):
        serializable_call = ClingoMethodCall.merge(name, sig, args, kwargs)
        self.client.post("control/add_call", json=serializable_call)

    def is_available(self):
        return True

    def __init__(self, internal_client: FlaskClient):
        self.client = internal_client
