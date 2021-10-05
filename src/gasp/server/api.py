import json
from time import sleep

from clingo import Control
from flask import Flask, request, render_template, Blueprint
from collections import defaultdict

from gasp.shared.model import ClingoMethodCall
from gasp.shared.simple_logging import info

backend_api = Blueprint("api", __name__, template_folder='server/templates')


class Data:

    def __init__(self, path):
        with open("server/test.json", encoding="utf-8") as f:
            self.raw_data = json.load(f)

    def get_rows(self):
        tmp = defaultdict(list)
        current_rule = ""
        for model in self.raw_data["sets"]:
            model["true"] = " ".join(model["true"]) if len(model["true"]) else "\u2205"
            current_rule = self.get_rule_str_with_target(model["row"])
            tmp[model["row"]].append(model)
        return [{"rule": current_rule, "sets": tmp[i]} for i in range(len(tmp))]

    def get_rule_str_with_target(self, target):
        for rule in self.raw_data["rules"]:
            if rule["tgt"] == target:
                return rule["str"]
        return "INIT"


def get_example():
    with open("test.json", encoding="utf-8") as f:
        return json.load(f)


@backend_api.route("/")
def hello_world():
    return "ok"


def get_program():
    pass


def add_program(data):
    pass


@backend_api.route("/program", methods=["GET", "POST"])
def program():
    if request.method == "POST":
        add_program(request.data)
    if request.method == "GET":
        return get_program()


@backend_api.route("/edges", methods=["GET"])
def get_edges():
    data = Data("test.json")
    return data.raw_data["links"]


def add_models(data):
    pass


def get_models():
    pass


@backend_api.route("/model/<model_id>", methods=["GET", "POST"])
def models(model_id):
    if request.method == "POST":
        add_models(request.data)
    if request.method == "GET":
        return get_example()["sets"][int(model_id)]


calls = []


@backend_api.route("/control/call", methods=["POST"])
def call():
    if request.method == "POST":
        info(f"Adding one to already existing {len(calls)}")
        calls.append(ClingoMethodCall(**json.loads(request.data)))
    return "ok cool"


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
