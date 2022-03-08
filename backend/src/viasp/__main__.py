from viasp.shared.config import BACKEND_HOST, BACKEND_PORT


def start():
    from viasp.server.factory import create_app
    app = create_app()
    use_reloader = False
    debug = False
    print(f"Starting viASP backend at {BACKEND_HOST}:{BACKEND_PORT}")
    app.run(host=BACKEND_HOST, port=BACKEND_PORT, use_reloader=use_reloader, debug=debug)
