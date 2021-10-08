from flask import render_template, Blueprint

bp = Blueprint("app", __name__, template_folder='../templates/', static_folder='../static/', static_url_path='/static')


@bp.route("/", methods=["GET"])
def hello_world():
    print("KEKEKE")
    return render_template("base.html")
