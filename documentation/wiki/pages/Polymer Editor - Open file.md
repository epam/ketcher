| As                              | I want                                           | so that                                                      |
| :------------------------------ | :----------------------------------------------- | :----------------------------------------------------------- |
| Ketcher **polymer** editor user | to open *.mol file containing peptide structure  | I can see the structure in Ketcher and be able to modify it using Ketcher |
| Ketcher **polymer** editor user | to open *.helm file containing peptide structure | I can see the structure in Ketcher and be able to modify it using Ketcher |

#### 1. Context

Supported formats are: *.mol (v3000), *.HELM, *.txt , .*doc, .docx, .rtf
Explore the *.mol information here: 

Peptide structures are supported only by the v3000 format of the *.mol file. **The v2000 format is not presents structured view of polymers and couldn't be recognized by peptide editor. The problem for future development is to recognize polymer structure in v2000 format from the chemical libraries**. 

There are 2 possible ways to capture the peptides in the v3000 mol file, explore them here **http://help.accelrysonline.com/insight/2018/content/pdf_files/bioviachemicalrepresentation.pdf**:



Glossary: [Peptide Glossary](https://kb.epam.com/display/EPMLSOP/Peptide+Glossary) - check it for information on HELM format

#### 3. Assumptions

| **ID** | **Assumption**                                               |
| ------ | ------------------------------------------------------------ |
| 1      | HELM notation will most like be opened as text pasted from the clipboard. Opening from files of .helm, .txt format would be more ra**r**e scenario. |
| 2      | *.MOL notation of v3000 will be opened mostly from files with *.mol, *.txt format. Opening from clipboard will be more rare scenario, but we should support it just like we do in general Ketcher. |
| 3      |                                                              |

####  4. Additional information (optional)

The window will have the same appearance as in the standard Ketcher,  except the image opening icon
![image](https://user-images.githubusercontent.com/97943759/152119729-4cdda5bb-7749-44dc-bf94-2e181ad63625.png)


#### 8. Acceptance Criteria

| №    | **User Group**                  | **GIVEN**                                      | **WHEN**                                                     | **THEN**                                                     |
| ---- | ------------------------------- | ---------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 1    | Ketcher **polymer** editor User | **Polymer** editor mode of the Ketcher enabled | viewing on the tool panel                                    | I see the Open icon with tooltip "Open... (Ctrl + O) " when hovering on it |
| 2    |                                 |                                                | clicking on the Open icon <br>OR <br>using the shortcut Ctrl + O | Ketcher provides the ability to select file from the workstation <br> **OR drag file**<br> OR paste the text from the clipboard  <br>AND <br> Ketcher Polymer Editor allows to select  *.mol, *.helm files by default with the ability to select all files<br> |
| 3    |                                 |                                                | clicking on the Open icon <br/>OR <br/>using the shortcut Ctrl + O<br/>AND<br/>way of adding file is selected | Ketcher provides the ability to add structure to Canvas<br/>OR<br/>Open structure as a new project |
| 3.1  |                                 |                                                | conditions from the no3  are fulfilled<br/>AND<br/>'Add to Canvas' option was selected | Ketcher Polymer Editor checks that structure opened is a polymer one<br>AND <br/>Canvas in the same state as it was before adding new structure <br/>AND<br/>Ketcher creates the new structure which is moved on canvas by the user's cursor. The first cursor click determines the location of the structure on the canvas |
| 3.2  |                                 |                                                | conditions from the no3  are fulfilled<br/>AND<br/>'Open as New project' option was selected | Ketcher Polymer Editor checks that structure opened is a polymer one<br/>AND <br/>New canvas is opening and Ketcher creates the structure in the upper left corner. |
| 4    |                                 |                                                | selecting the *.HELM or *txt file with HELM format content or HELM format text was copied from the clipboard <br>AND the opening was confirmed | Ketcher creates the structure for the canvas in accordance with HELM mapping rules <br> AND <br>positions it on the canvas in accordance with the open mode selected and in accordance with the alignment rules <br>AND <br>Ketcher enumerates chains and monomers in it in accordance with [Peptide business rules ]() |
| 5    |                                 |                                                | selecting the *.mol or *txt file with *mol format content or *mol format text was copied from the clipboard  <br/>AND the opening was confirmed<br>AND Ketcher recognize that the format of  *.mol file is v2000 | Pop-up window with 2 options is showing:<br>Open the file in the regular Ketcher  <br>OR<br>Stay in Polimer editor mode |
| 5.1  |                                 |                                                | conditions from the no5  are fulfilled<br/>AND<br/>" Open the file in the regular Ketcher '' option is selected<br/> | Ketcher switched to standard mode<br>Ketcher creates the structure for the canvas in accordance with existing *.MOL mapping rules <br/> AND <br/> positions it on the canvas in accordance with the open mode selected and in accordance with the alignment rules <br/> |
| 5.2  |                                 |                                                | conditions from the no5 are fulfilled<br/>AND<br/>"Stay in Polimer editor moder '' option is selected<br/> | Pop-up window is closed <br>AND Ketcher stay in Polymer editor mod<br>AND Canvas in the same state as it was before Conditions from the no5 are started |
| 6    |                                 |                                                | selecting the *.mol or *txt file with *mol format content or *mol format text was copied from the clipboard  <br/>AND the opening was confirmed<br>AND Ketcher recognize that the format of  *.mol file is v3000 | Ketcher creates the structure for the canvas in accordance with *.MOL mapping rules <br/> AND <br/> positions it on the canvas in accordance with the open mode selected and in accordance with the alignment rules <br/>AND <br/>Ketcher enumerates chains and monomers in it in accordance with [Peptide business rules ]() |
| 7    |                                 |                                                | **selecting the supported format, which includes names of monomers not from Ketcher's library<br/>AND the opening was confirmed** | **Ketcher creates the structure for the canvas  for known monomers <br/>AND messege shown "Part of monomers was not recognized and was not added"** |
| 8    |                                 |                                                | **selecting unsupported format. <br>AND the opening was confirmed ** | **Error message is shown "Given file could not be loaded. Please select a file in supported format: *.mol, *.HELM, *.txt"** |
| 9    |                                 |                                                | **empty file or file without HELM/mol notation selected  <br>AND the opening was confirmed** | 'OPEN STRUCTURE' window is shown (the same window as shown after "paste the text from the clipboard" option is selected) <br>AND<br>Ketcher provides the ability to paste the text from the clipboard |
| 10   |                                 |                                                | **option 'paste the text from the clipboard ' is selected<br/>AND <br/> information pasted not in helm/mol  format** <br/>**AND the opening was confirmed** | Error message is shown  "Convert error! Given string could not be loaded as (query or plain) molecule or reaction, see the error messages: 'scanner: BufferScanner::read() error', 'scanner: BufferScanner::read() error', 'molecule auto loader: SMILES loader: unexpected end of input', 'molecule auto loader: SMILES loader: unexpected end of input'" |
