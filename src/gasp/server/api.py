import json
from time import sleep

from clingo import Control
from flask import Flask, request, render_template, Blueprint, jsonify
from collections import defaultdict

from ..shared.model import ClingoMethodCall
from ..shared.simple_logging import info

backend_api = Blueprint("api", __name__, template_folder='server/templates')


@backend_api.route("/")
def hello_world():
    return "ok"


ctl = None
calls = []


def handle_call_recieved(call: ClingoMethodCall) -> None:
    if ctl is None:
        calls.append(call)
    else:
        # ToDo: Implement this. Probably a bit more complicated, as the transformation needs to be taken care of.
        raise NotImplementedError


@backend_api.route("/control/call", methods=["POST"])
def call():
    if request.method == "POST":
        try:
            parsed_call = ClingoMethodCall(**json.loads(request.data))
        except Exception:
            return "Invalid call object", 400
        handle_call_recieved(parsed_call)
    return "ok"


@backend_api.route("/control/solve", methods=["GET"])
def reconstruct():
    sleep(1)
    ctl = Control(["0"])

    for call in calls:
        if call.name != "__init__" and call.name != "solve":
            func = getattr(ctl, call.name)
            func(*call.args, **call.kwargs)
    models = []
    with ctl.solve(yield_=True) as handle:
        for model in handle:
            models.append(model)
    print(f"Found {models}")
    return str(models)
