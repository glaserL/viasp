from typing import Optional, Sequence, List

from clingo import Logger, Function
from clingo import Control as InnerControl
from logging import log, Level
from dataclasses import dataclass
#from server.gasp import app
from server.database import AddedProgram


@dataclass
class Model:
    atoms: List[Function]


def try_to_start_server_if_not_available():
    log(f"Consider starting the server before to make everything faster.", Level.WARN)


def is_non_cython_function_call(attr: classmethod):
    return hasattr(attr, "__call__") and not attr.__name__.startswith("_") and not attr.__name__.startswith("<")


class PaintConnector:

    def paint(self):
        raise NotImplementedError

    def mark_for_painting(self, model: Model):
        raise NotImplementedError

    def unmark_for_painting(self, model: Model):
        raise NotImplementedError

    def clear(self):
        raise NotImplementedError


class Control(InnerControl):

    def _register_function_call(self, name, args, kwargs):
        print(f"Registered {name}({args}, {kwargs})")

    def __init__(self, *args, **kwargs):
        self.gasp = PaintConnector()
        self._register_function_call("__init__", args, kwargs)
        super().__init__(*args, **kwargs)

    def __getattribute__(self, name):
        attr = InnerControl.__getattribute__(self, name)
        if is_non_cython_function_call(attr):
            def wrapper_func(*args, **kwargs):
                self._register_function_call(attr.__name__, args, kwargs)
                result = attr(*args, **kwargs)
                return result

            return wrapper_func
        else:
            return attr


"""
Requirements:
When I do something with the control object, but I haven't called paint yet, the control object should behave normally.
When I call paint, the visualization should represent the control object in a way. This may take time.
When I change something about the control object, the visualization should reflect that

ctl = Control()
# Do stuff
ctl.paint()
ctl.assign_external("constant", 5)
ctl.paint()
Idea to counter name space pollution:

ctl.gasp.mark(model)

"""

if __name__ == "__main__":
    ctl = Control(["0"])

    ctl.add("base", [], "a. {b}. c :- not b.")

    ctl.ground([("base", [])])
    with ctl.solve(yield_="True") as handle:
        for m in handle:

            print(m)
