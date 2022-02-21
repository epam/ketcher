### Shapes for monomer representation on canvas

For representation monomers on the canvas we use notation according to J.Milton *J. Chem. Inf. Model.* 2017, 57, 6, 1233–1239`  https://pubs.acs.org/doi/10.1021/acs.jcim.6b00442

Individual monomers is presented as simple geometry shapes. 

In the center of the shape symbol code is presented which is individual for each monomer within polymer type.

Monomers presented on the canvas are color filled according to their natural analog color coding.



| №    | Name            | Representation                                               | Description                                                  |
| ---- | --------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 1    | Peptide monomer | ![HELM_MONOMER_peptide](https://github.com/epam/ketcher/blob/master/documentation/wiki/HELM_MONOMER_peptide.png) | Peptide monomers presented as hexagon with edges on top and bottom positions. |
| 2    | RNA monomer     | ![HELM_MONOMER_rna](https://github.com/epam/ketcher/blob/master/documentation/wiki/HELM_MONOMER_rna.png)       | RNA monomer is presented as triplet of shapes connected between each other. |
| 3    | Phosphate       | ![HELM_MONOMER_phosphate](https://github.com/epam/ketcher/blob/master/documentation/wiki/HELM_MONOMER_phosphate.png) | Presented as round shape                                     |
| 4    | Ribose          | !![HELM_MONOMER_ribose](https://github.com/epam/ketcher/blob/master/documentation/wiki/HELM_MONOMER_ribose.png) | Presented as square shape with rounded corners oriented with edge at the bottom. |
| 5    | Nucleobase      | ![HELM_MONOMER_nucleobase](https://github.com/epam/ketcher/blob/master/documentation/wiki/HELM_MONOMER_nucleobase.png) | Presented as square shape with oriented as corner at the bottom. E.g. rhombus |
| 6    | CHEM            | ![HELM_MONOMER_CHEM](https://github.com/epam/ketcher/blob/master/documentation/wiki/HELM_MONOMER_CHEM.png)     | Presented as a rectangle where length of the bottom edge is greater then length of the side edge |

#### Bonds:

Bonds are the chemical links between individual monomers. 

Covalent bonds can be created between monomer connection points R1, R2 ...

Each connection point code have individual color code. 

Disulfide bond has different from covalent bonds color coding. 

| №    | Name           | Representation                                               | Description                                                  |
| ---- | -------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 1    | Covalent Bond  | ![HELM_BOND_covalent](https://github.com/epam/ketcher/blob/master/documentation/wiki/HELM_BOND_covalent.png)  | Presented as a solid line with color coding corresponding to number of R connection point. So that Half of the bond connected to R1 connection point have individual color, and another half of the bond connected to the R2 connection point have another. If bond connects connects connection points with a similar code, R3 with R3, then it is presented in unified color corresponding to this connection point. |
| 2    | Disulfide bond | ![HELM_BOND_disulfide](https://github.com/epam/ketcher/blob/master/documentation/wiki/HELM_BOND_disulfide.png) | Presented as dashed line                                     |

