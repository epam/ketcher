#!/bin/sh

size=32
format=mol

# patterns
indigo-depict - "C1=CC=CC=C1" $format/pattern/hexa1.$format
indigo-depict - "C1CCCCC1" $format/pattern/hexa2.$format
indigo-depict - "c1ccccc1" $format/pattern/hexaa.$format
indigo-depict - "C1CCCC1" $format/pattern/penta.$format
indigo-depict - "C1=CC2=C(C=C1)C=CC=C2" $format/pattern/naphthalene.$format

# layout button
indigo-depict - "[CH3]C(=O)C1=CC=CC=C1" $format/action/layout.$format
