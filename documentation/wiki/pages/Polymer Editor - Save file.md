| As                              | I want                                                       | so that                                                      |
| :------------------------------ | :----------------------------------------------------------- | :----------------------------------------------------------- |
| Ketcher **polymer** editor user | to save *.mol file containing polymer structure              | I can open the file in any chemical structure editor which support  *.mol format and be able to modify this structure |
| Ketcher **polymer** editor user | to save *.helm file containing polymer structure             | I can open the file in any chemical structure editor which support  *.helm format and be able to modify this structure |
| Ketcher **polymer** editor user | to copy text of polymer structure representation in helm or mol notation to the work station clipboard | I can use it further by software that recognizes corresponding format |



#### 1. Context

Glossary: [Peptide Glossary](https://kb.epam.com/display/EPMLSOP/Peptide+Glossary) 



#### 3. Assumptions

| **ID** | **Assumption**                                               |
| ------ | ------------------------------------------------------------ |
| 1      | *.MOL notation will be saved in v3000 format.                |
| 2      | Editing the structure under the Save scenario  is not allowed |
| 3      |                                                              |

####  4. Additional information (optional)



#### 8. Acceptance Criteria

| **#** | **User Group**                  | **GIVEN**                                      | **WHEN**                                                     | **THEN**                                                     |
| ----- | ------------------------------- | ---------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 1     | Ketcher **polymer** editor User | **Polymer** editor mode of the Ketcher enabled | viewing on the tool panel                                    | I see the Save icon with tooltip "Save... (Ctrl + S) " when hovering on it |
| 2     |                                 |                                                | clicking on the Save icon <br>OR <br>using the shortcut Ctrl + S | Ketcher provide:<br/> the ability to enter the name of the saved file, field by default as "ketcher" <br>AND<br> the ability to select file format for saving with MDM Molfile V3000 selected by default and additional HELM format available<br>AND <br>polymer structure in HELM or MOL notation, based on what was selected as file format for saving<br/>AND<br>structure in HELM/MOL notation is in highlighted state with ability to cancel highlighting and select it again <<br>AND<br>the ability to confirm file saving<br>AND<br>the ability to cancel saving.<br>AND<br>validation check of structure applicability according to business rules based on what was selected as file format for saving<br>AND<br>error message is shown if structure is not correct according to validation check |
| 3     |                                 |                                                | conditions from the no2 are fulfilled<br/>AND<br/>file format for saving was changed | Ketcher validates structure applicability according to business rules based on what was selected as file format for saving<br>AND<br>error message is shown if structure is not correct |
| 4     |                                 |                                                | conditions from the no2 are fulfilled<br/>AND<br/>shortcut Ctrl + C applied<br>OR <br>Right clicking on the message - option Save is confirmed | the selected text is copied to the work station clipboard<br> |
| 5     |                                 |                                                | conditions from the no2 are fulfilled<br/>AND<br>file format set as MDL Molifile V300<br>AND<br> Save to file was confirmed | Ketcher saves structure in the file with name  from form<br/>AND<br/>extension .mol (v3000 format) |
| 6     |                                 |                                                | conditions from the no2 are fulfilled<br/>AND<br/>file format set as HELM<br/>AND<br>Save to file was confirmed | Ketcher saves structure in the file with name from form<br/>AND<br/>extension .helm |
| 7     |                                 |                                                | conditions from the no2 are fulfilled<br/>AND<br/>File name row is empty | Save To File button is inactive                              |
