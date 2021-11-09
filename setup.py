import setuptools

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setuptools.setup(
    name="viasp",
    version="0.1.1",
    author="Luis Glaser",
    author_email="Luis.Glaser@uni-potsdam.de",
    description="A small example package",

    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/glaserL/viasp",
    # packages=setuptools.find_packages(where="src"),
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires='>=3.6',
    install_requires=[
        "networkx>=2.4",
        "flask>=2",
        "dataclasses>=0.8",
        "clingo>=5.5"
    ],
    entry_points={
        "console_scripts": [
            "viasp-start = viasp.__main__:start"
        ],
    },
    # package_dir={
    #     "python": "src.viasp"
    # },
    test_suite="pytest",
    tests_require="pytest"
)
