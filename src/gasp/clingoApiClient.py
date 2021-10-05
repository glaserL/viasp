from dataclasses import asdict

import requests

from .shared.model import ClingoMethodCall
from .shared.simple_logging import log, Level, warn


def backend_is_running():
    try:
        r = requests.head("http://127.0.0.1:5000/")
        return r.status_code == 200
    except requests.exceptions.ConnectionError:
        return False


class Client:
    pass


class ClingoClient(Client):

    def __init__(self, **kwargs):
        self.backend_url = "http://127.0.0.1:5000/"
        if "headless" in kwargs:
            self.headless = kwargs["headless"]
        else:
            self.headless = False
        if not backend_is_running():
            log("Backend is unavailable", Level.WARN)

    def save_function_call(self, call: ClingoMethodCall):
        if backend_is_running() and not self.headless:
            r = requests.post(f"{self.backend_url}control/call", json=asdict(call))
            print(r.status_code, r.reason)
        else:
            # TODO: only log once or sometimes, look at TTLCache
            warn(f"Backend dead.")
