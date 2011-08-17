#!/bin/sh

size=32
margin=2
format=png

# atoms
indigo-depict - "*" $format/atom/anyatom.$format -query -w $size -h $size -margins $margin $margin
indigo-depict - "[H]" $format/atom/h.$format -hydro off -w $size -h $size -margins $margin $margin
indigo-depict - "C" $format/atom/c.$format -hydro off -w $size -h $size -margins $margin $margin
indigo-depict - "N" $format/atom/n.$format -hydro off -w $size -h $size -margins $margin $margin
indigo-depict - "O" $format/atom/o.$format -hydro off -w $size -h $size -margins $margin $margin
indigo-depict - "S" $format/atom/s.$format -hydro off -w $size -h $size -margins $margin $margin
indigo-depict - "F" $format/atom/f.$format -hydro off -w $size -h $size -margins $margin $margin
indigo-depict - "P" $format/atom/p.$format -hydro off -w $size -h $size -margins $margin $margin
indigo-depict - "Cl" $format/atom/cl.$format -hydro off -w $size -h $size -margins $margin $margin
indigo-depict - "Br" $format/atom/br.$format -hydro off -w $size -h $size -margins $margin $margin
indigo-depict - "I" $format/atom/i.$format -hydro off -w $size -h $size -margins $margin $margin

# bonds
indigo-depict - "CC" $format/bond/single.$format -hydro off -w $size -h $size -margins $margin $margin -label hetero
indigo-depict mol/up.mol $format/bond/up.$format -hydro off -w $size -h $size -margins $margin $margin -label hetero
indigo-depict mol/down.mol $format/bond/down.$format -hydro off -w $size -h $size -margins $margin $margin -label hetero
indigo-depict mol/up_or_down.mol $format/bond/up_or_down.$format -hydro off -w $size -h $size -margins $margin $margin -label hetero
indigo-depict - "C=C" $format/bond/double.$format -hydro off -w $size -h $size -margins $margin $margin -label hetero
indigo-depict - "C#C" $format/bond/triple.$format -hydro off -w $size -h $size -margins $margin $margin -label hetero
indigo-depict - "c:c" $format/bond/aromatic.$format -hydro off -w $size -h $size -margins $margin $margin -label hetero
indigo-depict - "c~c" $format/bond/anybond.$format -query -w $size -h $size -margins $margin $margin -label hetero
indigo-depict mol/crossed.mol $format/bond/crossed.$format -query -w $size -h $size -margins $margin $margin -label hetero

# patterns
indigo-depict - "C1=CC=CC=C1" $format/pattern/hexa1.$format -hydro off -w $size -h $size -margins $margin $margin
indigo-depict - "C1CCCCC1" $format/pattern/hexa2.$format -hydro off -w $size -h $size -margins $margin $margin
indigo-depict - "c1ccccc1" $format/pattern/hexaa.$format -hydro off -w $size -h $size -margins $margin $margin
indigo-depict - "C1CCCC1" $format/pattern/penta.$format -hydro off -w $size -h $size -margins $margin $margin
indigo-depict - "C1=CC2=C(C=C1)C=CC=C2" $format/pattern/naphthalene.$format -hydro off -w $size -h $size -margins $margin $margin

# layout button
indigo-depict - "[CH3]C(=O)C1=CC=CC=C1" $format/action/layout.$format -hydro on -w $size -h $size -margins $margin $margin
