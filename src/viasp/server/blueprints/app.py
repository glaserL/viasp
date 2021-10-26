import json
from typing import Any

import networkx as nx
from flask import render_template, Blueprint, request

from ...shared.simple_logging import info

bp = Blueprint("app", __name__, template_folder='../templates/', static_folder='../static/', static_url_path='/static')

settings_dict = {"show_all": True}


@bp.route("/", methods=["GET"])
def hello_world():
    return render_template("base.html", settings=settings_dict["show_all"])


def change_setting(key: str, value: Any):
    info(f"Changing setting: {key} ({type(key)})={value} ({type(value)})")
    settings_dict[key] = value


@bp.route("/settings/", methods=["GET", "POST"])
def settings():
    if request.method == "POST":
        for key, value in request.args.items():
            change_setting(key, value)
    return "OK"
