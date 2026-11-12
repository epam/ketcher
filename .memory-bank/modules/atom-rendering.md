# Atom rendering

## CIP placement

Atom CIP labels are positioned after atom labels and bonds have been drawn. Placement checks occupied label and bond geometry and chooses the closest available candidate across bond sectors.

For straight paths, wedges, and hashed bonds, `ReBond.getCIPCollisionBoxes` splits rendered path geometry into narrow horizontal strips, including stroke clearance. This preserves the filled interior of wedges without reserving the empty corners of a diagonal bond's bounding box. Complex paths retain the conservative bounding-box fallback.
