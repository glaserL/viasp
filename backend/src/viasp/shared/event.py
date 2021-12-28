from enum import Enum

REGISTRY = {}


class Event(Enum):
    CALL_EXECUTED = 1


def on(event: Event):
    def event_decorator(func):
        REGISTRY.setdefault(event, []).append(func)
        return func

    return event_decorator


def subscribe(event, listener):
    REGISTRY.setdefault(event, []).append(listener)


def publish(event, *args, **kwargs):
    for listener in REGISTRY.get(event, []):
        listener(*args, **kwargs)
