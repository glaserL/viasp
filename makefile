.PHONY: test
test:
	PYTHONPATH=. pytest tests/pyt
	npm test
