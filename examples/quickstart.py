import viasp_dash
from dash import Dash
from viasp import Control

program = """
{rain; sprinkler} 1.
wet:- rain.
wet:- sprinkler.
"""
ctl = Control(["0"])
ctl.add("base", [], program)
ctl.ground([("base", [])])
with ctl.solve(yield_=True) as handle:
    for model in handle:
        ctl.viasp.mark(model)
ctl.viasp.show()

app = Dash(__name__)

app.layout = viasp_dash.ViaspDash(
    id="myID",
    backendURL="http://localhost:5000"
)

if __name__ == '__main__':
    app.run_server(debug=True)
