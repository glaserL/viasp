from multiprocessing import Process
from typing import Optional

server: Optional[Process] = None


def start():
    from viasp.server.factory import create_app
    app = create_app()
    global server
    server = Process(target=app.run)
    server.start()


def kill():
    global server
    server.kill()
