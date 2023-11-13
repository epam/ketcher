# Class: PolymerBondRenderer

## How Snake Bonds Algorithm Works

### Prerequisites:
1) Only attachment points ['R1', 'R2'] have snake bond mode;
3) Only Peptide and Chem monomers have snake bond mode;
2) Snake bond mode could be enabled only when 2 monomers are not on the same horizontal line which means the distance of their Y-axis model coordinate is no more than 0.5.

### Workig Flow
It will first calculate the position of the second monomer relative to the first monomer, then draw the snake bond differently according to the result. 

1) If the second monomer is to the bottom-right of the first one, it will check if the current attachment point of the first monomer is `R1`, if no, then follow the following rules:  
* The snake bond will start with a horizontal line(with length of half of first monomer's width plus LINE_FROM_MONOMER_LENGTH) from the first monomer's center;
* Then draw a left-bottom circular arc segment and a vertical line(with length of Y-axis pixel coordinate distance between the 2 monomers minus 2 circular arc segment length);
* Then draw a top-right circular arc segment;
* Finally draw a horizontal line(with length of X-axis pixel coordinate distance between the 2 monomers minus 2 circular arc segment length and half of first monomer's width and minus LINE_FROM_MONOMER_LENGTH) to connect the second monomer.  
Else: it will switch the start and end position to calculate and draw the snake bond again. This will reverse the position calculation like previously the second monomer is to the bottom-right of the first one, now after switching, the second monomer should be to the top-left of the first one, so the snake bond will be draw differently. This is to prevent the scanario that the 2 snake bonds would connect both to the left side of one monomer.
2) If the second monomer is to the top-right, or to the bottom-left, or to the top-left, ot just to left of the first one, the logic is pretty much the same: firstly checking if the current attachment point of the first monomer is `R1`, if no, drawing lines and circular arc segments; if yes, switching the start and end position to calculate and drawing the snake bond again.  

3) If none of the above worked, it will just draw a line from the first monomer to the second monomer.

