import json
from typing import Tuple, Any, Dict

from flask import request, Blueprint

from .replayer import apply_multiple
from ..shared.model import ClingoMethodCall

backend_api = Blueprint("api", __name__, template_folder='server/templates')


@backend_api.route("/")
def hello_world():
    return "ok"


ctl = None
calls = []


def handle_call_received(call: ClingoMethodCall) -> None:
    if ctl is None:
        calls.append(call)
    else:
        # ToDo: Implement this. Probably a bit more complicated, as the transformation needs to be taken care of.
        raise NotImplementedError


@backend_api.route("/control/call", methods=["POST"])
def add_call():
    if request.method == "POST":
        try:
            parsed_call = ClingoMethodCall(**json.loads(request.data))
        except BaseException:
            return "Invalid call object", 400
        handle_call_received(parsed_call)
    return "ok"


def get_by_name_or_index_from_args_or_kwargs(name: str, index: int, *args: Tuple[Any], **kwargs: Dict[Any, Any]):
    if name in kwargs:
        return kwargs[name]
    elif index < len(args):
        return args[index]
    else:
        raise TypeError(f"No argument {name} found in kwargs or at index {index}.")


@backend_api.route("/control/solve", methods=["GET"])
def reconstruct():
    if calls:
        apply_multiple(calls, ctl)
    return "ok"
