def start():
    from viasp.server.factory import create_app
    app = create_app()
    app.run(host="localhost", port=8080, use_reloader=False, debug=True)
