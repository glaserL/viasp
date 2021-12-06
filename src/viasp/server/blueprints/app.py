import json
import sys
from pathlib import Path
from typing import Any

import networkx as nx
from flask import render_template, Blueprint, request, abort, jsonify
from flask_cors import cross_origin

from ...shared.io import DataclassJSONEncoder, DataclassJSONDecoder
from ...shared.model import Filter
from ...shared.simple_logging import info, log

bp = Blueprint("app", __name__, template_folder='../templates', static_folder='../static/', static_url_path='/static')

DEFAULTS = {"show_all": True}


class Settings:
    def __init__(self, file=".state.json"):
        self.path = file
        if not Path(file).is_file():
            log(f"Settings file {file} doesnt exist, creating and setting defaults..")
            self._save(file, DEFAULTS)

    def _save(self, path, data):
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, cls=DataclassJSONEncoder)

    def _load(self):
        with open(self.path, "r", encoding="utf-8") as f:
            return json.load(f, cls=DataclassJSONDecoder)

    def get(self, key, default=None):
        if default is None:
            return self._load()[key]
        else:
            return self._load().get(key, default)

    def has(self, key):
        return key in self._load()

    def set(self, key, value):
        tmp = self._load()
        tmp[key] = value
        self._save(self.path, tmp)

    def clear(self, key):
        tmp = self._load()
        tmp.pop(key, None)
        self._save(self.path, tmp)


storage = Settings()


@bp.route("/", methods=["GET"])
@cross_origin()
def hello_world():
    return "ok"


def change_setting(key: str, value: Any):
    info(f"Changing setting: {key} ({type(key)})={value} ({type(value)})")
    storage.set(key, value)


@bp.route("/settings/", methods=["GET", "POST"])
@cross_origin()
def settings():
    if request.method == "POST":
        for key, value in request.args.items():
            change_setting(key, value)
    return "ok"


@bp.route("/filter", methods=["DELETE"])
@cross_origin()
def delete_filter():
    fltr = request.json

    if not isinstance(fltr, Filter):
        abort(400)
    tmp = storage.get("filter")
    if fltr not in tmp:
        abort(400)
    tmp.remove(fltr)
    storage.set("filter", tmp)
    return "ok"


@bp.route("/filter", methods=["POST"])
@cross_origin()
def add_filter():
    fltr = request.json
    if not isinstance(fltr, Filter):
        abort(400)

    tmp = storage.get("filter", [])
    tmp.append(fltr)
    storage.set("filter", tmp)
    return "ok"


@bp.route("/filter", methods=["GET"])
@cross_origin()
def get_filters():
    result = jsonify(storage.get("filter"))
    return result


@bp.route("/filter/clear", methods=["DELETE"])
@cross_origin()
def clear_filters():
    storage.set("filter", [])
    return "", 200
