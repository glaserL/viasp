import json

from src.gasp.shared.io import DataclassJSONEncoder, DataclassJSONDecoder
from src.gasp.shared.model import Model, CostableModel

examples = [Model(set(), {"a", "b"}),
            CostableModel({"a"}, {"b"}, 42)]


def test_all_models_can_be_serialized_and_deserialized_to_and_from_json():
    serialized = []
    for model in examples:
        typ3 = type(model)
        result = json.dumps(model, cls=DataclassJSONEncoder, ensure_ascii=False)
        assert len(result), f"{typ3} should be serializable"
        serialized.append((result, typ3))
    for model, typ3 in serialized:
        result = json.loads(model, cls=DataclassJSONDecoder)
        assert result is not None, f"{typ3} should be serializable"
        assert isinstance(result, Model), f"Deserializing should create object of type {typ3}, but was {type(result)}"
