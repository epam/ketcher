| As                          | I want                                              | so that                                                      |
| :-------------------------- | :-------------------------------------------------- | :----------------------------------------------------------- |
| Ketcher polymer editor user | to create bonds between monomers of different types | I can represent real life polymer structures that can consist of different types of monomers |

#### 1. Context

Sometimes the complex polymer molecules consist of chains having different types. 

Glossary: [Peptide Glossary](https://github.com/epam/ketcher/wiki/Polymer-Glossary) 

#### 3. Assumptions

| **ID** | **Assumption**                                               |
| ------ | ------------------------------------------------------------ |
| 1      | CHEM monomers usually used to be connected with Peptide or RNA chains |
|        |                                                              |
|        |                                                              |

####  4. Additional information (optional)



#### 8. Acceptance Criteria



| **#** | **User Group**              | **GIVEN**                                                    | **WHEN**                                                     | **THEN**                                                     |
| ----- | --------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 1     | Ketcher polymer editor User | Polymer editing mode of the Ketcher enabled <br> AND <br>There are at least 2 chains of different types on the canvas with with at least one monomer with one empty connection point in each of them | dragging from a monomer with a free connection point in the first chain <br> AND <br>dropping on a monomer with a free connection point in the second chain | Ketcher visualize the line representing the bond on the canvas when dragging <br>AND <br>when dropping Ketcher visualize the line from one monomer to the other on the canvas with the ends attached to monomers <br>AND <br>Ketcher creates a bond <br>AND <br> Ketcher selects connection points of the monomers in participating in the bond and marks them as Occupied <br>AND<br> Ketcher considers result as separate chains and aligns result in accordance with the rules |
| 1.1   |                             | conditions of AC 1 <br> AND <br> one of the chain in question is Peptide or RNA and other is CHEM | dragging from a monomer with a free connection point in the first chain <br/> AND <br/>dropping on a monomer with a free connection point in the second chain | Ketcher creates bond using single empty connection point from the first monomer <br> AND<br>*Ketcher does not specify the connection point used from CHEM monomer* |
| 1.2   |                             | Conditions of AC 1 <br>AND <br> one of the chain is Peptide the other is RNA | dragging from a monomer with a free connection point in the first chain <br/> AND <br/>dropping on a monomer with a free connection point in the second chain | Ketcher creates bond using single empty connection points from each of the monomers |
| 2     |                             | Polymer editing mode of the Ketcher enabled <br/> AND <br/>There are at least 2 chains of different types on the canvas with with at least one monomer with more than one empty connection point on one of the chain and at least one monomer with at least one empty connection point in the other chain | dragging from a monomer with a free connection point in the first chain <br> AND <br>dropping on a monomer with a free connection point in the second chain | Ketcher visualize the line representing the bond on the canvas when dragging <br>AND <br>when dropping Ketcher visualize the line from one monomer to the other on the canvas with the ends attached to monomers <br> AND <br> Ketcher displays the message for the user with the ability to select the connection points for bond creation<br/>AND<br/>Ketcher displays: monomers names and structure and provides the ability to select from the free connection points of each of the monomer<br/>AND<br/>when the user confirms the selection THEN<br/>Ketcher considers result as a separate chains<br/>AND<br/>creates the bond using the connection points selected by the user AND <br>Ketcher aligns the monomers in accordance with the Business Rules table  <br>AND <br> Ketcher selects connection points of the monomers in participating in the bond and marks them as Occupied |
| 2.1   |                             | Conditions of AC 2 <br/>AND <br/> one of the chain is CHEM the other is RNA or Peptide | dragging from a monomer with a free connection point in the first chain <br/> AND <br/>dropping on a monomer with a free connection point in the second chain | Ketcher creates bond using single empty connection point from the first monomer <br/> AND<br/>*Ketcher does not specify the connection point used from CHEM monomer* |
| 2.2   |                             | Conditions of AC 2 <br/>AND <br/> one of the chain is Peptide the other is RNA | dragging from a monomer with a free connection point in the first chain <br/> AND <br/>dropping on a monomer with a free connection point in the second chain | Ketcher creates bond using single empty connection points from each of the monomers |
