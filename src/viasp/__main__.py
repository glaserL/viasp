def main():
    from viasp.server.factory import create_app
    app = create_app()
    app.run()
