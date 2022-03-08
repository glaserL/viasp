from typing import Tuple, Any, Dict, Iterable

from flask import request, Blueprint, jsonify, abort, Response

from .dag_api import set_graph
from ..database import CallCenter, ProgramDatabase
from ...asp.justify import build_graph
from ...asp.reify import ProgramAnalyzer, reify_list
from ...shared.model import ClingoMethodCall, StableModel
from ...asp.replayer import apply_multiple

bp = Blueprint("api", __name__, template_folder='../templates/')

calls = CallCenter()
ctl = None


def handle_call_received(call: ClingoMethodCall) -> None:
    global ctl
    calls.append(call)
    if ctl is not None:
        ctl = apply_multiple(calls.get_pending(), ctl)


def handle_calls_received(calls: Iterable[ClingoMethodCall]) -> None:
    for call in calls:
        handle_call_received(call)


@bp.route("/control/call", methods=["POST"])
def add_call():
    if request.method == "POST":
        call = request.json
        if isinstance(call, ClingoMethodCall):
            handle_call_received(call)
        elif isinstance(call, list):
            handle_calls_received(call)
        else:
            abort(Response("Invalid call object", 400))
    return "ok"


def get_by_name_or_index_from_args_or_kwargs(name: str, index: int, *args: Tuple[Any], **kwargs: Dict[Any, Any]):
    if name in kwargs:
        return kwargs[name]
    elif index < len(args):
        return args[index]
    else:
        raise TypeError(f"No argument {name} found in kwargs or at index {index}.")


@bp.route("/control/solve", methods=["GET"])
def reconstruct():
    if calls:
        global ctl
        ctl = apply_multiple(calls.get_pending(), ctl)
    return "ok"


class DataContainer:
    def __init__(self):
        self.hihi = []


dc = DataContainer()


def handle_models_received(parsed_models):
    dc.hihi = parsed_models


@bp.route("/control/models", methods=["GET", "POST"])
def set_stable_models():
    if request.method == "POST":
        try:
            parsed_models = request.json
        except BaseException:
            return "Invalid model object", 400
        handle_models_received(parsed_models)
    elif request.method == "GET":
        return jsonify(dc.hihi)
    return "ok"


@bp.route("/control/models/clear", methods=["POST"])
def models_clear():
    if request.method == "POST":
        dc.hihi.clear()
        global ctl
        ctl = None


def someshithandling(marked_models: Iterable[StableModel]):
    result = []
    for model in marked_models:
        wrapped = []
        for part in model.atoms:
            wrapped.append(f"model({part}).")
        result.append(wrapped)
    return result


@bp.route("/control/paint", methods=["POST"])
def paint_model():
    marked_models = dc.hihi
    marked_models = someshithandling(marked_models)

    db = ProgramDatabase()
    analyzer = ProgramAnalyzer()
    analyzer.add_program(db.get_program())
    reified = reify_list(analyzer.get_sorted_program())
    g = build_graph(marked_models, reified, analyzer)

    set_graph(g)
    return "ok", 200
