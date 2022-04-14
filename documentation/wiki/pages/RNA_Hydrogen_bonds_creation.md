# [Create RNA Structure] As Ketcher User I want to create hydrogen bonds linking RNA monomers on the canvas

| As                            | I want                                     | so that                                                      |
| ----------------------------- | ------------------------------------------ | ------------------------------------------------------------ |
| A Ketcher peptide editor user | to add hydrogen bonds between RNA monomers | I can reflect hydrogen bonds existing in real life between RNA polymer chains |



#### 1. Context

Glossary: [Peptide Glossary](https://github.com/epam/ketcher/wiki/Polymer-Glossary) 

HB is a specific chemical type of bond which can be created between polar functional groups between monomers. Hydrogen bonds do not use of monomer's R attachment points. Hydrogen bonds can be created between RNA nucleobase type monomers. Only between complimentary ones

#### 3. Assumptions

| ID   | Assumption                                                   |
| ---- | ------------------------------------------------------------ |
| 1    | Ketcher Polymer Editor users are interested only in creating hydrogen bonds between complimentary natural type RNA nucleobase type monomers |
| 2    | Single monomer can have only 1 hydrogen bond created         |
| 3    | The same bond creation tool is used for hydrogen bond creation |
| 4    | Complimentary rule is applicable only for natural type RNA nucleobase type monomers |
| 5    | We do not allow users to create hydrogen bonds with unnatural RNA monomers, however users can create a hydrogen bond between natural analogs and |

   

#### 8. Acceptance criteria



| #    | User Group                  | GIVEN                                                        | WHEN                                                         | THEN                                                         |
| ---- | --------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 1    | Ketcher Polymer editor User | There are at least 2 complimentary RNA nucleobase type monomers on the canvas without Hydrogen bonds connected to them<br /> AND<br />They all their R attachment points are occupied | dragging from the one RNA nucleobase type monomer to another complimentary one | Ketcher visualize the line representing chemical bond from the first monomer to the cursor while dragging<br />AND<br />when dropping Ketcher visualize the Hydrogen bond type line between involved monomers<br />AND<br />Ketches aligns the monomers on the canvas in accordance with Business rules<br />AND<br />Ketcher creates a Hydrogen bond<br /><br />Count of polymers is not changed<br />Polymer ID's in not changed |
| 2    |                             | There are at least 2 non-complimentary RNA nucleobase type monomers on the canvas without Hydrogen bonds connected to them<br />AND<br />They all their R attachment points are occupied | dragging from the one RNA nucleobase type monomer to another non-complimentary one | Ketcher visualize the line representing chemical bond from the first monomer to the cursor while dragging<br />AND<br />when dropping Ketcher stop the line visualization<br />AND<br />Ketches shows notification message that  hydrogen bond can be crated only between complimentary natural type monomers<br /> |
| 3    |                             | There are at least 2 RNA nucleobase type monomers on the canvas <br />AND<br />They all their R attachment points are occupied<br />AND<br />at least one of them have a hydrogen bond connected | dragging from the one RNA nucleobase type monomer to another  one | Ketcher visualize the line representing chemical bond from the first monomer to the cursor while dragging<br />AND<br />when dropping Ketcher stop the line visualization<br />AND<br />Ketches shows notification message that  only one hydrogen bond can be connected to the monomer<br /> |



