import json
from typing import Collection

import requests
from .shared.config import BACKEND_URL
from .shared.io import DataclassJSONEncoder
from .shared.model import ClingoMethodCall, StableModel
from .shared.simple_logging import log, Level, warn, error


def backend_is_running(url=BACKEND_URL):
    try:
        r = requests.head(url)
        return r.status_code == 200
    except requests.exceptions.ConnectionError:
        return False


class Client:
    pass


def dict_factory_that_supports_uuid(kv_pairs):
    return {k: v for k, v in kv_pairs}


class ClingoClient(Client):

    def __init__(self, **kwargs):
        self.backend_url = BACKEND_URL
        if "headless" in kwargs:
            self.headless = kwargs["headless"]
        else:
            self.headless = False
        if not backend_is_running():
            log(f"Backend at is unavailable ({BACKEND_URL})", Level.WARN)

    def is_available(self):
        return backend_is_running(self.backend_url)

    def save_function_call(self, call: ClingoMethodCall):
        if backend_is_running() and not self.headless:
            serialized = json.dumps(call, cls=DataclassJSONEncoder)
            r = requests.post(f"{self.backend_url}/control/call",
                              data=serialized,
                              headers={'Content-Type': 'application/json'})
            print(r.status_code, r.reason)

    def set_target_stable_model(self, stable_models: Collection[StableModel]):
        if backend_is_running() and not self.headless:
            serialized = json.dumps(stable_models, cls=DataclassJSONEncoder)
            r = requests.post(f"{self.backend_url}/control/models", data=serialized,
                              headers={'Content-Type': 'application/json'})
            if r.ok:
                log(f"Set models.")
            else:
                error(f"Setting models failed [{r.status_code}] ({r.reason})")

    def paint(self):
        self._reconstruct()
        if backend_is_running() and not self.headless:
            r = requests.post(f"{self.backend_url}/control/paint")
            if r.ok:
                log(f"Painting in progress.")
            else:
                error(f"Painting failed [{r.status_code}] ({r.reason})")

    def _reconstruct(self):
        if backend_is_running() and not self.headless:
            r = requests.get(f"{self.backend_url}/control/solve")
            if r.ok:
                log(f"Solving in progress.")
            else:
                error(f"Painting failed [{r.status_code}] ({r.reason})")
