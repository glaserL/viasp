from src.gasp import wrapper


def test_instanciations():
    _ = wrapper.Control()
    _ = wrapper.Control(["0"])
