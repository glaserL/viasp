import json
from pathlib import Path
from typing import Any

import networkx as nx
from flask import render_template, Blueprint, request

from ...shared.simple_logging import info, log

bp = Blueprint("app", __name__, template_folder='../templates/', static_folder='../static/', static_url_path='/static')

DEFAULTS = {"show_all": True}


class Settings:
    def __init__(self, file=".state.json"):
        self.path = file
        if not Path(file).is_file():
            log(f"Settings file {file} doesnt exist, creating and setting defaults..")
            with open(file, "w", encoding="utf-8") as f:
                json.dump(DEFAULTS, f)

    def get(self):
        with open(self.path, "r", encoding="utf-8") as f:
            return json.load(f)


storage = Settings()


@bp.route("/", methods=["GET"])
def hello_world():
    return render_template("base.html", settings=storage.get()["show_all"])


def change_setting(key: str, value: Any):
    info(f"Changing setting: {key} ({type(key)})={value} ({type(value)})")
    storage.get()[key] = value


@bp.route("/settings/", methods=["GET", "POST"])
def settings():
    if request.method == "POST":
        for key, value in request.args.items():
            change_setting(key, value)
    return "OK"


@bp.route("/filter", methods=["POST"])
def filter():
    if "uuid" in request.args.keys():
        storage.get()["filter"] = request.args["uuid"]
    else:
        raise Exception
    return "ok"
