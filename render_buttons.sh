#!/bin/sh

size=32
marginh=2
marginv=5
format=png

# atoms
indigo-depict - "*" $format/anyatom.$format -w $size -h $size -margins $marginh $marginv -query
indigo-depict - "[H]" $format/h.$format -hydro off -w $size -h $size -margins $marginh $marginv
indigo-depict - "C" $format/c.$format -hydro off -w $size -h $size -margins $marginh $marginv
indigo-depict - "N" $format/n.$format -hydro off -w $size -h $size -margins $marginh $marginv
indigo-depict - "O" $format/o.$format -hydro off -w $size -h $size -margins $marginh $marginv
indigo-depict - "S" $format/s.$format -hydro off -w $size -h $size -margins $marginh $marginv
indigo-depict - "F" $format/f.$format -hydro off -w $size -h $size -margins $marginh $marginv
indigo-depict - "P" $format/p.$format -hydro off -w $size -h $size -margins $marginh $marginv
indigo-depict - "Cl" $format/cl.$format -hydro off -w $size -h $size -margins $marginh $marginv
indigo-depict - "Br" $format/br.$format -hydro off -w $size -h $size -margins $marginh $marginv
indigo-depict - "I" $format/i.$format -hydro off -w $size -h $size -margins $marginh $marginv

# bonds
indigo-depict - "CC" $format/single.$format -hydro off -w $size -h $size -margins $marginh $marginv -label hetero
indigo-depict mol/up.mol $format/up.$format -hydro off -w $size -h $size -margins $marginh $marginv -label hetero
indigo-depict mol/down.mol $format/down.$format -hydro off -w $size -h $size -margins $marginh $marginv -label hetero
indigo-depict - "C=C" $format/double.$format -hydro off -w $size -h $size -margins $marginh $marginv -label hetero
indigo-depict - "C#C" $format/triple.$format -hydro off -w $size -h $size -margins $marginh $marginv -label hetero
indigo-depict - "c:c" $format/aromatic.$format -hydro off -w $size -h $size -margins $marginh $marginv -label hetero
indigo-depict - "c~c" $format/anybond.$format -w $size -h $size -margins $marginh $marginv -label hetero -query
indigo-depict mol/updown.mol $format/updown.$format -hydro off -w $size -h $size -margins $marginh $marginv -label hetero
indigo-depict mol/cistrans.mol $format/cistrans.$format -hydro off -w $size -h $size -margins $marginh $marginv -label hetero
indigo-depict mol/singledouble.mol $format/singledouble.$format -w $size -h $size -margins $marginh $marginv -label hetero -query
indigo-depict mol/singlearomatic.mol $format/singlearomatic.$format -w $size -h $size -margins $marginh $marginv -label hetero -query
indigo-depict mol/doublearomatic.mol $format/doublearomatic.$format -w $size -h $size -margins $marginh $marginv -label hetero -query

# patterns
indigo-depict - "C1=CC=CC=C1" $format/hexa1.$format -hydro off -w $size -h $size -margins 2 2
indigo-depict - "C1CCCCC1" $format/hexa2.$format -hydro off -w $size -h $size -margins 2 2
indigo-depict - "c1ccccc1" $format/hexaa.$format -hydro off -w $size -h $size -margins 2 2
indigo-depict - "C1CCCC1" $format/penta.$format -hydro off -w $size -h $size -margins 2 2
indigo-depict - "C1=CC2=C(C=C1)C=CC=C2" $format/naphthalene.$format -hydro off -w $size -h $size -margins 2 2

# layout button
indigo-depict - "[CH3]C(=O)C1=CC=CC=C1" $format/layout.$format -w $size -h $size -margins 2 2
