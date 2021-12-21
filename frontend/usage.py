import viasp_dash
import dash
from dash.dependencies import Input, Output
import dash_html_components as html

app = dash.Dash(__name__)

app.layout = html.Div([
    viasp_dash.ViaspDash(
        id="myID"
    ),
    html.Div(id='output')
])


@app.callback(Output('output', 'children'), Input('myID', 'node'))
def display_output(rule):
    return f"I come from python, you clicked on {rule}"


if __name__ == '__main__':
    app.run_server(debug=True)
