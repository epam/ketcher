| As                              | I want                                           | so that                                                      |
| :------------------------------ | :----------------------------------------------- | :----------------------------------------------------------- |
| Ketcher **polymer** editor user | to open *.mol file containing peptide structure  | I can see the structure in Ketcher and be able to modify it using Ketcher |
| Ketcher **polymer** editor user | to open *.helm file containing peptide structure | I can see the structure in Ketcher and be able to modify it using Ketcher |

#### 1. Context

Explore the *.mol information here: 

Peptide structures are supported only by the v3000 format of the *.mol file. **The v2000 format is not presents structured view of polymers and couldn't be recognized by peptide editor. The problem for future development is to recognize polymer structure in v2000 format from the chemical libraries**. *Need to understand what do we do with the v2000 format files of peptide from chemical libraries (?)*

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

![image-20220125124157502](C:\Users\Iuliia_Nisanbaeva\AppData\Roaming\Typora\typora-user-images\image-20220125124157502.png)



#### 8. Acceptance Criteria

| **#** | **User Group**                  | **GIVEN**                                      | **WHEN**                                                     | **THEN**                                                     |
| ----- | ------------------------------- | ---------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
|       | Ketcher **polymer** editor User | **Polymer** editor mode of the Ketcher enabled | viewing on the tool panel                                    | I see the Open icon with tooltip "Open... (Ctrl + O) " when hovering on it |
|       |                                 |                                                | clicking on the Open icon <br>OR <br>using the shortcut Ctrl + O | Ketcher provides the ability to select file from the workstation <br> **OR drag file**<br> OR paste the text from the clipboard  <br>AND <br> Ketcher Polymer Editor allows to select  *.mol, *.helm files b**y** default with the ability to select all files<br> AND <br> Ketcher Polymer Editor checks that structure opened is a polymer one |
|       |                                 |                                                | selecting the *.HELM or *txt file with HELM format content or HELM format text was copied from the clipboard <br>AND the opening was confirmed | Ketcher creates the structure for the canvas in accordance with HELM mapping rules <br> AND <br> positions it on the canvas in accordance with the open mode selected and in accordance with the alignment rules <br>AND <br>Ketcher enumerates chains and monomers in it in accordance with [Peptide business rules ]() |
|       |                                 |                                                | selecting the *.mol or *txt file with *mol format content or *mol format text was copied from the clipboard  <br/>AND the opening was confirmed | Ketcher checks the text content of the file to check if it has a Polymer content <br> AND <br> *if there is no Polymer content THEN Ketcher suggests to open the file in the regular Ketcher  <br>AND <br> If the content is Polymer THEN* Ketcher creates the structure for the canvas in accordance with *.MOL mapping rules <br/> AND <br/> positions it on the canvas in accordance with the open mode selected and in accordance with the alignment rules <br/>AND <br/>Ketcher enumerates chains and monomers in it in accordance with [Peptide business rules ]() |
|       |                                 |                                                | **selecting unsupported format. Supported formats are: *.mol (v3000), *.HELM, *.txt <br>AND the opening was confirmed ** | **error message is shown "Given file could not be loaded. Please select a file in supported format: *.mol, *.HELM, *.txt"** |
|       |                                 |                                                | **selecting the v2000 format of  *.mol file**<br/>**AND the opening was confirmed ** | **message is shown "Polymer editor is not supported v2000 format. You can open it in standard Ketcher redactor " <br>AND pop-up with 2 options is appearing: <br>1) switch to standard Ketcher redactor<br>2) stay in Polymer editor mod and skip file with v2000 format** |
|       |                                 |                                                | **empty file or file without HELM/mol notation selected  <br>AND the opening was confirmed** | **error message is shown "Given string could not be loaded as  molecule. Please validate contents of the file"** |
|       |                                 |                                                | **option 'paste the text from the clipboard ' is selected<br/>AND <br/> information pasted not in helm/mol  format** <br/>**AND the opening was confirmed** | **error message is shown**  **"Given string could not be loaded as  molecule. Please make sure the string in the  HELM/mol notation"** |
|       |                                 |                                                | **selecting the supported format, which includes names of monomers not from Ketcher's library<br/>AND the opening was confirmed** | **Ketcher creates the structure for the canvas  for known monomers <br>AND messege shown "Part of monomers was not recognized and was not added"** |

