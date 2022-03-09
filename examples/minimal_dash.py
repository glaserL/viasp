import viasp_dash
from dash import Dash

app = Dash(__name__)

app.layout = viasp_dash.ViaspDash(
    id="myID"
)

if __name__ == '__main__':
    app.run_server(debug=True)
