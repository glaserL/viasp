from src.gasp import gasp


def test_instanciations():
    _ = gasp.Control()
    _ = gasp.Control(["0"])
