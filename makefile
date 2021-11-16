.PHONY: test
test:
	PYTHONPATH=. pytest tests/pyt
	(cd frontend; npm test)
