from json import JSONEncoder, JSONDecoder
from dataclasses import is_dataclass, asdict

from .model import Model, CostableModel


class DataclassJSONDecoder(JSONDecoder):
    def __init__(self, *args, **kwargs):
        JSONDecoder.__init__(self, object_hook=self.object_hook, *args, **kwargs)

    def object_hook(self, obj):
        if '_type' not in obj:
            return obj
        type = obj['_type']
        del obj['_type']
        if type == 'Model':
            return Model(**obj)
        if type == 'CostableModel':
            return CostableModel(**obj)
        return obj


class DataclassJSONEncoder(JSONEncoder):
    def default(self, o):
        if is_dataclass(o):
            result = asdict(o)
            print(o)
            result["_type"] = repr(o).split("(")[0]
            return result
        elif isinstance(o, set):
            return list(o)
        return super().default(o)
