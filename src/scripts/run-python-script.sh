#!/bin/bash

set -e

if command -v python3 &>/dev/null; then
    PYTHON=python3
else
    PYTHON=python
fi

echo $PYTHON

$PYTHON $1
