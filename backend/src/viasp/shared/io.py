import json
from enum import IntEnum
from json import JSONEncoder, JSONDecoder
from dataclasses import is_dataclass
from typing import Any, Union, Collection, Iterable
from pathlib import PosixPath
from uuid import UUID

import clingo
import networkx as nx
from _clingo.lib import clingo_model_type_brave_consequences, clingo_model_type_cautious_consequences, \
    clingo_model_type_stable_model
from clingo import Model as clingo_Model, ModelType, Symbol
from clingo.ast import AST

from .interfaces import ViaspClient
from .model import Node, Transformation, Signature, StableModel, ClingoMethodCall, TransformationError, FailedReason


def model_to_json(model: Union[clingo_Model, Collection[clingo_Model]], *args, **kwargs) -> str:
    return json.dumps(model, *args, cls=DataclassJSONEncoder, **kwargs)


def object_hook(obj):
    if '_type' not in obj:
        return obj
    t = obj['_type']
    del obj['_type']
    if t == "Function":
        return clingo.Function(**obj)
    elif t == "Number":
        return clingo.Number(**obj)
    elif t == "Node":
        obj['atoms'] = frozenset(obj['atoms'])
        obj['diff'] = frozenset(obj['diff'])
        return Node(**obj)
    elif t == "Transformation":
        return Transformation(**obj)
    elif t == "Signature":
        return Signature(**obj)
    elif t == "Graph":
        return nx.node_link_graph(obj["_graph"])
    elif t == "StableModel":
        return StableModel(**obj)
    elif t == "ClingoMethodCall":
        return ClingoMethodCall(**obj)
    return obj


class DataclassJSONDecoder(JSONDecoder):
    def __init__(self, *args, **kwargs):
        JSONDecoder.__init__(self, object_hook=object_hook, *args, **kwargs)


def dataclass_to_dict(o):
    if isinstance(o, Node):
        return {"_type": "Node", "atoms": o.atoms, "diff": o.diff, "uuid": o.uuid,
                "rule_nr": o.rule_nr}
    elif isinstance(o, TransformationError):
        return {"_type": "TransformationError", "ast": o.ast, "reason": o.reason}
    elif isinstance(o, Signature):
        return {"_type": "Signature", "name": o.name, "args": o.args}
    elif isinstance(o, Transformation):
        return {"_type": "Transformation", "id": o.id, "rules": o.rules}
    elif isinstance(o, StableModel):
        return {"_type": "StableModel", "cost": o.cost, "optimality_proven": o.optimality_proven, "type": o.type,
                "atoms": o.atoms, "terms": o.terms, "shown": o.shown, "csp": o.csp, "theory": o.theory}
    elif isinstance(o, ClingoMethodCall):
        return {"_type": "ClingoMethodCall", "name": o.name, "kwargs": o.kwargs, "uuid": o.uuid}

    else:
        raise Exception(f"I/O for {type(o)} not implemented!")


class DataclassJSONEncoder(JSONEncoder):
    def default(self, o):
        encoded = encode_object(o)
        if encoded is not None:
            return encoded
        return super().default(o)


def encode_object(o):
    if isinstance(o, clingo_Model):
        x = model_to_dict(o)
        return x
    elif isinstance(o, ViaspClient):
        return {"_type": "ViaspClient"}
    elif isinstance(o, PosixPath):
        return str(o)
    elif isinstance(o, ModelType):
        return {"__enum__": str(o)}
    elif isinstance(o, Symbol):
        x = symbol_to_dict(o)
        return x
    elif isinstance(o, FailedReason):
        return {"_type": "FailedReason", "value": o.value}
    elif is_dataclass(o):
        result = dataclass_to_dict(o)
        return result
    elif isinstance(o, nx.Graph):
        return {"_type": "Graph", "_graph": nx.node_link_data(o)}
    elif isinstance(o, UUID):
        return o.hex
    elif isinstance(o, frozenset):
        return list(o)
    elif isinstance(o, set):
        return list(o)
    elif isinstance(o, AST):
        return str(o)
    elif isinstance(o, Iterable):
        return list(o)


def model_to_dict(model: clingo_Model) -> dict:
    model_dict = {"cost": model.cost, "optimality_proven": model.optimality_proven, "type": model.type,
                  "atoms": model.symbols(atoms=True), "terms": model.symbols(terms=True),
                  "shown": model.symbols(shown=True), "csp": model.symbols(csp=True),
                  "theory": model.symbols(theory=True), "_type": "StableModel"}
    return model_dict


def clingo_model_to_stable_model(model: clingo_Model) -> StableModel:
    return StableModel(model.cost, model.optimality_proven, model.type, encode_object(model.symbols(atoms=True)),
                       encode_object(model.symbols(terms=True)), encode_object(model.symbols(shown=True)),
                       encode_object(model.symbols(csp=True)),
                       encode_object(model.symbols(theory=True)))


def symbol_to_dict(symbol: clingo.Symbol) -> dict:
    symbol_dict = {}
    if symbol.type == clingo.SymbolType.Function:
        symbol_dict["_type"] = "Function"
        symbol_dict["name"] = symbol.name
        symbol_dict["positive"] = symbol.positive
        symbol_dict["arguments"] = symbol.arguments
    elif symbol.type == clingo.SymbolType.Number:
        symbol_dict["number"] = symbol.number
        symbol_dict["_type"] = "Number"
    return symbol_dict


class viasp_ModelType(IntEnum):
    """
    Enumeration of the different types of models.
    """
    BraveConsequences = clingo_model_type_brave_consequences
    """
    The model stores the set of brave consequences.
    """
    CautiousConsequences = clingo_model_type_cautious_consequences
    """
    The model stores the set of cautious consequences.
    """
    StableModel = clingo_model_type_stable_model
    """
    The model captures a stable model.
    """

    @classmethod
    def from_clingo_ModelType(cls, clingo_ModelType: ModelType):
        if clingo_ModelType.name == cls.BraveConsequences.name:
            return cls.BraveConsequences
        elif clingo_ModelType.name == cls.StableModel.name:
            return cls.StableModel
        else:
            return cls.CautiousConsequences


class ClingoModelEncoder(JSONEncoder):
    def default(self, o: Any) -> Any:
        if isinstance(o, clingo_Model):
            x = model_to_dict(o)
            return x
        elif isinstance(o, ModelType):
            if o in [ModelType.CautiousConsequences, ModelType.BraveConsequences, ModelType.StableModel]:
                return {"__enum__": str(o)}
            return super().default(o)
        elif isinstance(o, Symbol):
            x = symbol_to_dict(o)
            return x
        return super().default(o)


def deserialize(data: str, *args, **kwargs):
    return json.loads(data, *args, cls=DataclassJSONDecoder, **kwargs)
