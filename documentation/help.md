# Ketcher Overview

**Ketcher** is a tool used for drawing molecular structures and chemical reactions. It contains two modes:

- **Molecules mode** that allows drawing of and operations with small/organic molecules and reactions;
- **Macromolecules mode** that allows drawing of and operations with biomolecules (nucleic acids and peptides).

# Ketcher Molecules Mode

**Ketcher molecules mode** consists of the following elements:

<img src=images/Ketcher-Micro-Whole-Canvas.png width = "1000"/>

**Note**: Depending on the screen size, some tools on the _Tool palette_ can be displayed in expanded or collapsed forms.

Using the _Tool palette_, you can:
- Draw and edit a molecule or a reaction by clicking on and dragging atoms, bonds, and other elements provided with the buttons on the _Atoms toolbar_ and _Tool palette_;
- Delete any element of the drawing (atom or bond) by clicking on it with the _Erase tool_;
- Delete the entire molecule or its fragment using the _Lasso_, _Rectangle_, or _Fragment selection tool_ and the _Erase tool_;
- Draw special structures (see the following sections);
- Select the entire molecule or its fragment in one of the following ways (<img src=images/2_lasso_icon.png width = "35"/> click on the bottom right corner to see the list of available options ![image]<img src=images/3_lasso_menu.png width = "100"/>):
  - To select **one atom or bond**, click _Lasso_ (1) or _Rectangle Selection tool_ (2), and then click the atom or bond;
  - To select the **entire structure**:
      - Select the _Fragment Selection tool_ (3) and then click the object;
      - Select the _Lasso_ or _Rectangle Selection tool_, and then drag the mouse to select the object;
      -`Ctrl-click`with the _Lasso_ or _Rectangle Selection tool_.
  - To select **multiple atoms, bonds, structures, or other objects**, do one of the following:
      - `Shift-click` with the _Lasso_ or _Rectangle Selection tool_ selects some (connected or not) atoms/bonds;
      - With the _Lasso_ or _Rectangle Selection tool_ click and drag the mouse around the atoms, bonds, or structures that you want to select.

      **Note**: `Ctrl+Shift-click` each structure with the _Lasso_ or _Rectangle Selection tool_ selects several structures.

You can use the buttons of the _Main_ toolbar:

<img src=images/Micro-3.0.-Toolbar.png width = "1000"/>

- **Clear Canvas** (1) button to start clear the drawing area;
- **Open…** (2) and **Save As…** (3) buttons to import a molecule from a molecular file or save it to a supported molecular file format;
- **Copy** with additional abilties to **Copy As** (4), **Paste** (5), **Cut** (6) buttons to perform the corresponding actions;
- **Undo** (7) / **Redo** (8) to manage the last actions taken on the canvas;
- **Aromatize** (9) (`Alt+a`) / **Dearomatize** (10) (`Ctrl+Alt+a`) buttons to mark aromatic structures (to convert a structure to the aromatic or Kekule representation);
- **Layout** button (11) to change the position of the structure to work with it with the most convenience;
- **Clean Up** button (12) to improve the appearance of the structure by assigning them uniform bond lengths and angles;
- **Calculate CIP** button (13) to determine R/S, r/s, and E/Z stereoconfigurations;
- **Check Structure** button (14) (`Alt+s`) to check the bellow shown properties of the structure. Check will be conducted immediately when the operation is selected. You can check only the Settings you are interested in and check structure again with new settings by clicking on Check button. Apply button will save the Settings checked and they will be applied for the file saving;

<img src=images/Structure-Check-3.0..png width = "400"/>

- **Calculated Values** button (15) to display some properties of the structure;

<img src=images/6_calc_values.png width = "250"/>

- **Add/Remove explicit hydrogens** button (16) to choose the representation of of explicit hydrogens (drawn with explicit bonds or associated with the atom label of the atom they are connected to);
- **3D Viewer** button (17) to view the structure's in three-dimensional representation;
- **Molecules/Macromolecules switcher** (18) to change between Ketcher's modes. Current mode always has a tick mark next to it. Clicking on the mode without a tick mark leads to it;

<img src=images/Micro-Macro-Switcher.png width = "150"/>

- **Settings** button (19) to make some settings for molecular files;

<img src=images/Settings-3.0..png width = "300"/>

- **Help** button (20) to view Help;
- **About** button (21) to display version and copyright information of the program;
- **Fullscreen mode** button (22) allows to initiate displaying Ketcher window in the fullscreen mode;
- **Zoom panel** (21) displays the current zoom percentage. Click to expand the Zoom panel and use the following actions: **Zoom percentage** (1) to set the view manually, **Zoom out** (2) / **Zoom in** (3) to scale the view gradually, **Zoom 100%** (4) to enable the default zoom setting.

<img src=images/Zoom-3.0..png width = "150"/>

## 3D Viewer
The structure appears in a modal window after clicking on the **3D Viewer** button <img src=images/9_3D_viewer.png width = "35"/>) on the top panel:

<img src=images/8_miew1.png width = "600"/>

You can perform the following actions:
- Rotate the structure holding the left mouse button;
- Zoom In/Out the structure;

Ketcher Settings allow changing the appearance of the structure and background coloring on the 3D Viewer tab.

"Lines" drawing method, "Bright" atom name coloring method and "Light" background coloring are default.

## Drawing Atoms

To draw/edit atoms you can:
- Select an atom in the Atoms toolbar and click inside the drawing area;
- If the desired atom is absent from the toolbar, click on the <img src=images/PT-Button-3.0..png width = "25"/> button to invoke the _Periodic Table_ and click on the desired atom (available options: _Single_ – selection of a single atom, _List_ – choose an atom from the list of selected options (To allow one atom from a list of atoms of your choice at that position), _Not List_ - exclude any atom on your list at that position);

<img src=images/10_pt_windown.png width = "600"/>

- Add an atom to the existing molecule by selecting an atom in the _Atoms_ toolbar, clicking on an atom in the molecule, and dragging the cursor; the atom will be added with a single bond; vacant valences will be filled with the corresponding number of hydrogen atoms;
- Change an atom by selecting an atom in the _Atoms_ toolbar and clicking on the atom to be changed; in the case a wrong valence appears the atom will be underlined in red;
- Change an atom by clicking on an existing atom with the _Selection tool_ and starting to enter text after that;

<img src=images/Og-Search.png width = "200"/>

- Change the charge of an atom by selecting the _Charge Plus_ or _Charge Minus tool_ and clicking consecutively on an atom to increase/decrease its charge;

<img src=images/12_charge_icons.png width = "35"/>

- Change an atom or its properties by double-clicking on the atom to invoke the _Atom Properties dialog_ (the dialog also provides atom query features);

<img src=images/13_atom_propn.png width = "250"/>

- Click on the <img src=images/14.png width = "35"/> button to use the _Extended table_ and select a corresponding _Generic group_ or _Special Node_;

<img src=images/14_ext_tablen.png width = "400"/>

## Drawing Bonds

To draw/edit bonds you can:

- Click an arrow on the _Bond tool_ <img src=images/15_bond_icon.png width = "35"/> in the _Tool palette_ to open the drop-down list with the following bond types;

<img src=images/bond1.png width = "72"/>
<img src=images/bond2.png width = "76"/>
<img src=images/bond3.png width = "69"/>
<img src=images/bond4.png width = "60"/>
<img src=images/bond5.png width = "87"/>
<img src=images/bond6.png width = "112"/>
<img src=images/bond7.png width = "122"/>
<img src=images/bond8.png width = "128"/>
<img src=images/bond9.png width = "74"/>
<img src=images/bond91.png width = "92"/>
<img src=images/bond92.png width = "90"/>
<img src=images/bond93.png width = "105"/>
<img src=images/bond94.png width = "122"/>
<img src=images/bond95.png width = "128"/>

- Select a bond type from the drop down list and click inside the drawing area; a bond of the selected type will be drawn;
- Click on an atom in the molecule; a bond of the selected type will be added to the atom at the angle of 120 degrees;
- Add a bond to the existing molecule by clicking on an atom in the molecule and dragging the cursor; in this case you can set the angle manually;
- Change the bond type by clicking on it;
- Use the _Chain Tool_ <img src=images/18_chain_tool_icon.png width = "35"/> to draw consecutive single bonds;
- Change a bond or its properties by double-clicking on the bond to invoke the _Bond Properties_ dialog:

<img src=images/Bond-Properties-3.0..png width = "250"/>

- Clicking on the drawn stereo and dative bonds change their direction;
- Clicking with the _Single Bond tool_ or _Chain tool_ switches the bond type cyclically: Single-Double-Triple-Single.

## Drawing R-Groups

Use the _R-Group_ toolbox <img src=images/20_rtools_icon.png width = "35"/> to draw R-groups in Markush structures:

<img src=images/21_rtools_menu.png width = "100"/>

Selecting the _R-Group_ _Label_ Tool (1) and clicking on an atom in the structure invokes the dialog to select the R-Group label for a current atom position in the structure:

<img src=images/22_rtool.png width = "250"/>

Selecting the R-Group label and clicking **Apply** converts the structure into a Markush structure with the selected R-Group label:

<img src=images/R-Group-3.0..png width = "200"/>

**Note**: You can choose several R-Group labels simultaneously:

<img src=images/rgroup-example2.png width = "125"/>

Particular chemical fragments that may be substituted for a given R-Group form a set of R-Group members. R-Group members can be any structural fragment, including functional groups and single atoms or atom lists.

To create a set of R-Group members:
1. Draw a structure to become an R-Group member;
2. Select the structure using the _R-Group Fragment Tool_ (2) to invoke the _R-Group dialog_; in this dialog select the label of the R-Group to assign the fragment to;
3. Click on **Apply** to convert the structure into an R-Group member.

Schematically, the entire process of the R-Group member creation can be presented as:

<img src=images/R-group-2-3.0..png width = "300"/>

### R-Group attachment point

An R-Group attachment point is the atom in an R-Group member fragment that attaches the fragment to the initial Markush structure.

Selecting the _Attachment Point Tool_ (3) and clicking on an atom in the R-Group fragment converts this atom into an attachment point. If the R-Group contains more than one attachment point, you can specify one of them as primary and the other as secondary. You can select between either the primary or secondary attachment point using the dialog that appears after clicking on the atom:

<img src=images/25_attach_point.png width = "250"/>

Result view of R-Group attachment points (IUPAC style):

<img src=images/25_1_attachment_points_view.png width = "250"/>

If there are two attachment points on an R-Group member, there must be two corresponding attachments (bonds) to the R-Group atom that has the same R-Group label. Clicking on **Apply** in the above dialog creates the attachment points. Result view of R-Group attachment points both primary and secondary (IUPAC style):

<img src=images/25_2_attachment_points_view_of_two_attachments.png width = "150"/>

### R-Group Logic

**Ketcher** enables one to add logic when using R-Groups. To access the R-Group logic:
1. Create an R-Group member fragment as described above;
2. Move the cursor over the entire fragment for the green frame to appear, then click inside the fragment. The following dialog appears:

<img src=images/28_r_logic.png width = "250"/>

3. Specify **Occurrence** to define how many instances of an R-Group occur. If an R-Group atom appears several times in the initial structure, you will specify **Occurrence** > n, n being the number of occurrences; if it appears once, you see "R1 > 0".
4. Specify H at **unoccupied** R-Group sites (**RestH**): check or clear the checkbox.
5. Specify the logical **Condition**. Use the R-Group condition **If R(i) Then** to specify whether the presence of an R-Group is dependent on the presence of another R-Group.

## Marking S-Groups

To mark S-Groups, use the _S-Group tool_ <img src=images/29_sgroup_icon.png width = "35"/> and the following dialog that appears after selecting a fragment with this tool:

<img src=images/S-Group-Properties-3.0..png width = "250"/>

Available S-Group types:
- _Data_ - an atom, a fragment, a multifragment, a single bond, or a group without the square brackets representation;
- _Multiple group_ - indicates a number of replications of a fragment or a part of a structure in contracted form;
- _SRU Polymer_ - the Structural Repeating Unit (SRU) brackets enclose the structural repeating of a polymer. You have three available patterns: head-to-tail (the default), head-to-head, and either/unknown;
- _Superatom_ - part of the structure or the whole structure that will be abbreviated to a text label or expanded to see the group chemistry surrounded with square brackets;
- _Queary component_ - a pair of square brackets enclosing the selected part(s) of the structure or whole structure(s), can be used to support SMARTS query properties.

### Superatom S-Group

An abbreviated structure (abbreviation) is all or part of a structure (molecule or reaction component) that has been abbreviated to a text label. Structures that you abbreviate keep their chemical significance, but their underlying structure is hidden.

<img src=images/31_2_sgroup_superatom.png width = "250"/>

After applying Superatom S-Group - there is ability to contract the S-Group, and ability to remove the abbreviation, from the right-click menu on the S-Group:

<img src=images/31_2_sgroup_superatom_context_menu.png width = "200"/>

### Data S-Groups

You can attach data to an atom, a fragment, a multifragment, a single bond, or a group. The defined set of _Names_ and _Values_ is introduced for each type of selected elements:

<img src=images/S-Group-Properties-2-3.0..png width = "250"/>

- Select the appropriate S-Group Field Name;
- Select the appropriate Field Value;
- Labels can be specified as Absolute, Relative or Attached.

## Changing Structure Display

<img src=images/32_rotate_tool.png width = "150"/>

Use the _Rotate_ tool (1) to change the structure display:

<img src=images/32_rotate_tool_2.png width = "250"/>

_Rotate tool_ allows rotating objects:
- If some objects are selected, the tool rotates all the selected objects;
- If no objects are selected, or all objects are selected, the tool rotates the whole canvas;
- The default rotation step is 15 degrees (this can be changed in _Settings_);
- Press and hold the Ctrl key for more gradual continuous rotation with 1 degree rotation step.

Select any bond on the structure and click `Alt+H` to rotate the structure so that the selected bond is placed horizontally.
Select any bond on the structure and click `Alt+V` to rotate the structure so that the selected bond is placed vertically.

_Flip tool_ (2, 3) flips the objects horizontally or vertically:
- If some objects are selected, the Horizontal Flip tool (`Alt+H`) flips all the selected objects horizontally;
- If no objects are selected, or all objects are selected, the Horizontal Flip tool (`Alt+H`) flips each structure horizontally;
- If some objects are selected, the Vertical Flip tool (`Alt+V`) flips the selected objects vertically;
- If no objects are selected, or all objects are selected, the Vertical Flip tool (`Alt+V`) flips each structure vertically.

_Erase_ (`Del` or `Backspace`) tool (4) deletes all of the selected elements.

### Highlighting atoms and bonds

Right-clicking on an atom, a bond, or multiple selected atoms and bonds allows highlighting of those elements with one of eight available colours:

<img src=images/Highlighting-3.0..png width = "400"/>

### ACS (American Chemical Society) Style

<img src=images/ACS-Style-3.0..png width = "250"/>

From the _Settings_, the user is able to _Set ACS Settings_ (1). Structures on canvas will change their appearance to comply with the ACS style. The action can be undone by resetting the settings to the default values (2).

Ketcher default style:

<img src=images/Caffeine-Ket-Default-3.0..png width = "150"/>

ACS Style:

<img src=images/Caffeine-ACS-3.0..png width = "150"/>

## Drawing Reactions

To draw/edit reactions you can:
- Draw reagents and products as described above;
- Use options of the _Reaction Arrow Tool_ <img src=images/34_reacarrow_icon.png width = "35"/> to draw an arrow. Select the arrow needed from the list <img src=images/35_reacarrows_menu.png width = "500"/>;
- Draw pluses in the reaction equation using the _Reaction Plus Tool_ <img src=images/38_reactplus_icon.png width = "35"/>;
- Map same atoms in reagents and products with the _Reaction Mapping Tools_ <img src=images/36_reactmap_icon.png width = "35"/> Explore the available reaction mapping tools <img src = images/37_reactmap_menu.png width = "130" />
   - _Reaction Auto-Mapping Tool_ (1);
   - _Reaction Mapping Tool_ (2);
   - _Reaction Unmapping Tool_ (3)

### Drawing pathway reactions

To draw pathway reactions you can:
- Draw reagents and products as described above;
- Use <img src=images/70_add_multitailed-arrow.png width = "35"/> _Multi-Tailed Arrow Tool_ option from _Reaction Arrow Tool_;
- Click anywhere on the canvas to add new multi-tailed arrow;
- Adjust the length of the head or tail by grabbing its end and moving the cursor left and right;
- Reposition the head or tail vertically by grabbing its end and moving the cursor up and down.

## Drawing graphical objects

To draw graphical objects click the arrow on the _Shape Ellipse_ tool <img src=images/39_objects_icon-1.png width = "35"/> in the Tools palette to open the drop-down list with the following tools <img src=images/40_objects_menu.png width = "130"/>:
- _Shape Ellipse_ (1);
- _Shape Rectangle_ (2);
- _Shape Line_ (3).

### Adding images on the canvas

Select _Add Image_ tool <img src=images/60_add_image.png width = "35"/> in the Tools palette and click anywhere on the canvas.    
System dialog to choose image file will be opened and upon selection of supported format image will be added to the canvas.    
Center of the image will be at the place of the click.   
Supported image types are `.png` and `.svg`

### Adding text objects on the canvas

To add text to the canvas click the _Add text_ tool <img src=images/41_text_icon.png width = "35"/> in the Tools palette and click the canvas to open the Text editor window:

<img src=images/421_texttool.png width = "250"/>

- To enter text, type in the Text editor field;
- To edit text, double click the text object on the canvas;
- Change the text style to bold and italic, make it subscript and superscript while typing or by selecting text and applying styles;
- Add special symbols by clicking on omega:

<img src=images/Special-Symbols-3.0..png width = "200"/>

## Templates toolbar

You can add templates (rings or other predefined structures) to the structure using the _Templates_ toolbar together with the _Custom Templates_ button located at the bottom:

<img src=images/43_templates_toolbar.png width = "250"/>

To add a ring to the molecule, select a ring from the toolbar and click inside the drawing area, or click on an atom or a bond in the molecule.

Rules of using templates:
- Selecting a template and clicking on an atom in the existing structure adds the template to the structure connected through the selected atom resulting in a fused structure:

<img src=images/Using-Templates-3.0..png width = "150"/>

- Selecting a template and dragging the cursor from an atom in the existing structure adds the template to this atom connected through a single bond:

<img src=images/Using-Templates-2-3.0..png width = "200"/>

- Dragging the cursor from an atom in the existing structure results in the single bond attachment if the cursor is dragged to more than the bond length; otherwise the fused structure is drawn.
- Selecting a template and clicking on a bond in the existing structure created a bond-to-bond fused structure:

<img src=images/Using-Templates-3-3.0..png width = "150"/>

  - The bond in the initial structure is replaced with the bond in the template;
  - This procedure doesn't change the length of the bond in the initial structure;
  - Dragging the cursor relative to the initial bond applies the template at the corresponding side of the bond;
  - The added template will be fused by the default attachment atom or bond preset in the program;
  - User is able to define the attachment atom and bond by clickingthe Edit button for template structure in the Template Library.

The _Custom Templates_ button <img src = images/43_custom_templates_icon.png width = "35" /> allows to view the list of templates available; both built-in and createdby user:

<img src=images/Structure-Library-3.0..png  width = "520" />

To create a user template:
- Draw a structure;
- Click the _Save as..._ button;
- Click the _Save to Templates_ button. _Template edit_ form will be displayed:

<img src=images/Save-To-Templates-3.0..png  width = "440" />

- Enter a name and define the attachment atom and bond by clicking on the structure preview. Click on _Save_ button to save the template;
- Saved template will be available in _User Templates_ subsection at the bottom of the _Template Library_ tab.

### Functional Groups

Ketcher allows you to select and use Functional Groups to properly represent your structure on the canvas. Set of functional groups available is predefined and can't be changed right now.

Explore the list of the Functional Groups available in the Templates library. Open it using the icon in the bottom toolbar <img src = images/43_custom_templates_icon.png width = "35" />, Functional Groups tab.

To add a functional group to the canvas and join it to the structure do the following:

1. Select the proper functional group in the _Functional Groups_ menu (you can filter them by name) and click on it to add it to the canvas:

   <img src=images/FG_search_cf3.png width = "300">

2. Click on the atom that the functional group should replace on the structure:

   <img src=images/Functional-Groups-3.0..png width = "150"/>

3. You can just click on the canvas while having the functionaly group selected. To connect it with another structure on the canvas do the following:
   - Select _Single Bond_ tool in the left Ketcher toolbar;
   - Drag bond **from** the connection atom and drop it **to** the Functional Group on the canvas.

<img src = images/FG_chain.gif width = "400"/>

#### Contracted s-group tooltip

Hover mouse cursor over the contracted S-group, and you will see the preview of the S-group.

<img src = images/FG_contracted_group_tooltip.png width = "200"/>

#### Expanding/Contracting S-group 

Functional Group on the canvas can be **Expanded** to view it's internal structure. Expanded group can be **Contracted** back to the compact presentation.

You can also **Remove the Abbreviation** on the group - it will allow you to work with the functional group atoms and bonds as with regular atoms and bonds on the canvas. To Expand, Contract and Remove Abbreviation:

1. Click on the functional group with right mouse button: 

<img src=images/FG_context_menu.png width = "350">

2. Select the command from the context menu

<img src=images/FG_contract.gif width = "400"/>

#### Inability to change S-group

Please, note that a lot of Ketcher's tools will not be able to be used on individual atoms and bonds of the functional group. Functional Groups can only be selected as a whole - they can only be deleted, moved, or rotated as an entire entity.

Ketcher will let you know if the tool is not applicable for the functional group and will suggest to Remove the Abbreviation immediately:

<img src=images/FG_remove_abb.png width = "300"/>

**Notes**:
- _Aromatize_ & _Dearomatize_ operations will not be applied to the rings that are part of the functional group;
- Functional groups will be considered as **super atoms** when opening and saving .mol files.

## Stereochemistry

If a stereogenic center is on canvas, clicking on _Calculate CIP_ button <img src=images/CIP-Button-3.0..png width = "25"/> on the main toolbar will assign stereo-labels to the stereocenters. Supported labels/stereochemistry types are S/R, s/r, and E/Z.

When the structure with the correct tetrahedral stereochemistry is created on the canvas you can open the _Enhanced Stereochemistry_ window by clicking the _Stereochemistry_ button <img src=images/481_ster_icon.png width = "35"/> and assign stereo marks:

 <img src=images/48_enhstereo.png width = "250"/>

In the _Stereochemistry tab_ in _Settings_ you can:
- Enable/disable display of the Stereo flags;
- Set the text of the Absolute/AND/OR/Mixed flags;
- Change the style of the Label display at stereogenic centers;
- Select the color of Absolute/AND/OR stereogenic centers;
- Choose one of the four color display modes;
- Enable/disable option when Chiral flag is ignored.

<img src=images/49_sett_stereon.png width = "300"/>

When option _Ignore the chiral flag_ is _true_ it will affect opening of MDL V2000 and MDL V3000 files, as well as the display of labels at stereogenic centers and stereo flags:

- Stereo flags are not displayed:

<img src=images/49.1_sett_stereon.png width = "250"/>

- Labels at stereogenic centers are displayed only for non-absolute groups:

<img src=images/49.2_sett_stereon.png width = "250"/>

# Ketcher Macromolecules Mode

**Ketcher Macromolecules Mode** consists of the following elements:

<img src=images/Macro-Canvas-3.0..png width = "1000"/>

You can use the buttons on the main toolbar:

<img src=images/Macro-Toolbar-3.0..png width = "1000"/>

- **Clear Canvas** (1) button to clear the drawing area;
- **Open…** (2) and **Save As…** (3) buttons to import a drawing from a molecular file or save it to a supported molecular file format;
- **Undo** (4) / **Redo** (5) to manage the last actions taken on the canvas;
- **Macromolecules modes switcher** (6) to change the macromolecules view to **sequence layout mode** (1), **snake layout mode** (2), or **flex layout mode** (3);

<img src=images/Macromolecules-Mode-Switcher-3.0..png width = "50"/>

- **Sequence mode typing type switcher** (7) (available only in sequence layout mode) to change the way Ketcher interprets keyboard input (A can be a DNA nucleotide, and RNA nucleotide, or an amino acid);
- **Molecules/Macromolecules switcher** (8) to change between Ketcher's modes. Current mode always has a tick mark next to it. Clicking on the mode without a tick mark leads to it;
- **Fullscreen mode** (9) button allows to initiate displaying Ketcher window in the fullscreen mode;
- **Zoom panel** (10) displays the current zoom percentage.

The left toolbar consists of the following elements:

<img src=images/Macro-Left-Toolbar-3.0..png width = "50"/>

- **Hand tool** (1) used to adjust the view and move around the canvas;
- **Rectangle selection tool** (2) used to select elements on the canvas;
- **Eraser** (3) used to delete elements on the canvas (disabled in sequence layout mode);
- **Bond tool** (4) used to establish bonds (both single covalent (1) and hydrogen (2)) between elements on canvas in snake and flex layout modes:

<img src=images/Macro-Bonds-3.0..png width = "100"/>

## Macromolecules library

Macromolecules library has 4 tabs:
- **Favorites tab** - by default the tab contains no elements, but the user can add them by clicking on the star in the monomer/preset library card;
- **Peptides tab** - contains amino acid monomers organized alphabetically using the one letter symbol of the natural analogues (including the _X section_ for common N and C end modifications and amino acids with no natural analogue); the bottom of the section contains ambiguous amino acids;
- **RNA tab** - contains RNA builder, a section containing presets, and monomers organized into sugars, bases, phosphates, and nucleotides sections;
- **CHEM tab** - contains non-RNA and non-amino acid monomers, mostly linkers and tags.

<img src=images/Library-Tabs-3.0..png width = "800"/>

**Searching the library** is possible using monomer names, monomer symbols, or monomer IDT aliases:

<img src=images/Library-Search-3.0..png width = "600"/>

Hovering over a library card will show the preview for that library element. 
In case of a non-ambiguous monomer the preview will contain the name, the chemical structure, the exact position and composition of attachment points, and the IDT alias(es) (if the monomer has IDT alias(es)):

<img src=images/Monomer-Preview-3.0..png width = "600"/>

In case of a preset, the symbol of the preset and the names and symbols of monomers making up that preset will be shown, as well as IDT alias(es) (if the preset has IDT alias(es)):

<img src=images/Preset-Preview-3.0..png width = "200"/>

In case of an ambiguous monomer, names of monomers making up that ambiguous monomer will be shown, as well as a type of ambiguous monomer (alternatives or mixed):

<img src=images/Ambiguous-Preview-3.0..png width = "125"/>

### RNA Builder

RNA builder can be found in the RNA section of the library. It can be used to create presets - a collection of 2 or 3 monomers together making up a nucleotide, nucleoside, or a sugar-phosphate pair. Once created and saved (in browser cache), presets can be added to the canvas as already assembled collections of monomers.

#### Creating presets

To create a preset either click on the downwards pointing arrow to open RNA Builder or on _New Preset_ in the Presets section of the library:

<img src=images/Create-Preset-3.0..png width = "200"/>

Clicking on _Sugar_, _Base_, or _Phosphate_ will open appropriate sections of the library where monomers can be picked. Library search is also available while RNA builder is active. 

<img src=images/Create-Preset-2-3.0..png width = "200"/>

Name of the preset can be changed form the default form that is made up from symbols of the components in the format sugar(base)phosphate.

Clicking on _Add to Presets_ will save the preset and add it to the Presets section on the library:

<img src=images/Create-Preset-3-3.0..png width = "200"/>

#### Modifying nucleotides in sequence mode

Right clicking on selected presets in sequence mode gives the option to _Modify in RNA Builder..._

<img src=images/Modify-in-RNA-Builder-3.0..png width = "200"/>
<img src=images/Modify-in-RNA-Builder-2-3.0..png width = "200"/>

Clicking on _Sugar_, _Base_, or _Phosphate_ will again open appropriate sections of the library so that selected nucleotides can be conveniently modified.

After choosing needed replacement(s), click on _Update_ and (in case of modifying multiple nucleotides) on _Yes_ in the warning message window.

<img src=images/Modify-in-RNA-Builder-3-3.0..png width = "200"/>
<img src=images/Modify-in-RNA-Builder-4-3.0..png width = "250"/>

### RNA Builder

New monomers can be added and already existing ones replaced using an API function (see [README.md](https://github.com/epam/ketcher/blob/6247-update-the-help-document/README.md))

## Sequence mode

Sequence layout mode is a text-editor-like view mode for macromolecules. All nucleotides and amino acids are represented with single letter codes based on their natural analogue with accompanying information about modifications.

In case of nucleic acids, a gray background indicates a modified base, a black frame a modified sugar, and a dot a modified phosphate:

<img src=images/Sequence-Mode-3.0..png width = "190"/>

For peptides, the modified amino acids are underlined:

<img src=images/Sequence-Mode-2-3.0..png width = "75"/>

All other elements on the canvas (not nucleotides, nucleosides, phosphates at the terminal positions, or amino acids) are represented with an @ symbol:

<img src=images/Sequence-Mode-3-3.0..png width = "280"/>

Based on the typing type switcher appropriate entities are added to the canvas when the user types on the keyboard, or pastes text. 

<img src=images/Typing-Switcher-3.0..png width = "150"/>

Backbone connections (R1-R2) are established automatically within one sequence. For example, R1 of an amino acid is the hydrogen of the amino group, and R2 is the hydroxyl of a carboxyl group, thus making an R1-R2 connection a peptide bond.

In addition to typing and pasting text formats who always result in natural monomers, other formats can also be pasted and monomers can be added by clicking on their library cards - this allows the user to add modified monomers to the canvas.

Already existing monomers can also be replaced by selecting them and clicking on a library card, or modified in RNA builder by choosing _Modify in RNA Builder..._ from the right-click drop-down menu (see above).

## Snake and flex modes

As opposed to sequence mode where multiple monomers can be represented with one symbol, every single monomer is represented with a shape in snake and flex modes.

In sequence mode:

<img src=images/Snake-and-Flex-3.0..png width = "75"/>

In snake/flex mode:

<img src=images/Snake-and-Flex-2-3.0..png width = "300"/>

Different shapes of monomers indicate different monomer types:

<img src=images/Snake-and-Flex-3-3.0..png width = "500"/>

- **Hexagons** (1) represent amino acids; different natural analogues are coloured differently - acidic ones with shades of red, basic ones with shades of blue, polar neutral ones with shades of purple, and non-polar ones with shades of yellow and green;
- **White boxes with a black outline** (2) represent CHEMs;
- **Blue rounded squares** (3) represent sugars;
- **Rhombuses** (4) represent bases; purines are shades of gray and pyrimidines are yellow (C), light orange (T), or dark purple (U);
- **Coral circles** (5) represent phosphates;
- **Pentagons** (6) represent unsplit nucleotides; logic for the colouring is the same as for bases;
- **Dark rounded squares** (7) represent unresolved IDT nucleotides (see section _Working with files_).

Modifications are also noted for amino acids, sugars, bases and phosphates using a banner over the monomer symbol:

<img src=images/Snake-and-Flex-4-3.0..png width = "500"/>

### Establishing bonds

In snake and flex modes monomers are added to the canvas by clicking on their library cards and then clicking on the canvas. Hovering over the monomers with a bond tool shows attachment points of that monomer:

<img src=images/Monomer-Hover-3.0..png width = "150"/>

#### Covalent bonds

Covalent bonds can be **created** by connecting monomers with the _Bond tool_ either at their center (not choosing attachment points) or at their attachment points.

- Connect attachment point to attachment point:

<img src=images/AP-to-AP-3.0..gif width = "400"/>

- Connect center to attachment point:

<img src=images/Center-to-AP-3.0..gif width = "400"/>

- Connect center to center:

<img src=images/Center-to-Center-3.0..gif width = "400"/>

If a default bond cannot be established a _Select Connection Points_ dialog will open. Default bonds are:
- R1-R2 between amino acids;
- R1-R2 between sugars and phosphates;
- R3-R1 between sugars and bases;
- R1-R2 between unsplit nucleotides and sugars;
- R1-R2 between unsplit nucleotides and phosphates;
- A bond at any attachment points if there is only one available attachment point for both monomers.

_Select Connection Point_ dialog contains structures of both monomers and allows the user to select the exact attachment points and by clicking on _Connect_ to establish a bond:

<img src=images/Select-Connection-Points-3.0..gif width = "400"/>
<img src=images/Select-Connectio-Points-2-3.0..png width = "350"/>

Covalent bonds can be **eddited** by choosing _Edit Connection Points..._ from the right-click menu. _Edit Connection Points..._ allows the user to change the attachment points and reestablish the bond.

<img src=images/Edit-CP-3.0..png width = "250"/>
<img src=images/Edit-CP-2-3.0..png width = "350"/>

#### Hydrogen bonds

Hydrogen bonds can only be **created** between monomer centers at they do not require attachment points. 

<img src=images/H-Bond-3.0..gif width = "150"/>

Bond preview and _Edit Connection Points..._ dialog are not available for hydrogen bonds.

#### Creating antisense chains

When a chain is selected an option to _Create Antisense Strand_ exists in the right-click drop-down menu. An RNA antisense strand is added with the bases connected via hydrogen bonds:

<img src=images/AS-chains-3.0..png width = "650"/>
<img src=images/AS-chains-2-3.0..png width = "575"/>

### Snake and flex modes differences

There are two differences between snake and flex modes:
1. **Different bond appearance** - all bonds in flex mode (left) are straight lines connecting monomer centers whereas in snake mode (right) some bonds are "snake-like" bonds with joints that do not overlap with other monomers:

<img src=images/Snake-Flex-Diff-3.0..png width = "500"/>

2. **Automatic layout upon entrance of the mode** - every time snake mode is entered, monomers on canvas get layouted; when flex mode is entered, no layout is applied.

## Macromolecules and molecules mode integration

Drawn macromolecules structures are visible (but not editable) when molecules mode is entered and drawn molecules are visible (but not editable) when macromolecules are entered.

Macromolecules (snake) mode:

<img src=images/Macro-Micro-3.0..png width = "300"/>

Molecules mode:

<img src=images/Macro-Micro-2-3.0..png width = "300"/>

Currently the appearance of monomers in molecule mode is different than in macromolecules mode - the monomers are not represented with shapes (like in snake and flex) or with one letter codes (like in sequence), but with full abbreviations.

### Establishing bonds between molecules and monomers

To draw a structure contatining both monomers and monomers:
1. Draw the needed structure in **molecules mode**;

<img src=images/Micro-Macro-Structure-3.0..png width = "400"/>

2. Draw the meeded structure in **macromolecules mode** (order of steps 1 and 2 is arbitrary);

<img src=images/Micro-Macro-Structure-2-3.0..png width = "400"/>

3. **In macromolecules mode** position the structures and establish a bond using the _Bond tool_ by dragging **from an attachment point of the monomer to the atom of the molecular structure**;

<img src=images/Micro-Macro-Structure-3-3.0..png width = "200"/>

Whole structure in macromolecules (snake) mode:

<img src=images/Micro-Macro-Structure-4-3.0..png width = "600"/>

Whole structure in molecules mode:

<img src=images/Micro-Macro-Structure-5-3.0..png width = "600"/>

### Expanding monomers in molecules mode

After switching to molecules mode, right-clicking on a monomer gives the option to _Expand monomer_.

<img src=images/Expand-Monomer-3.0..png width = "250"/>
<img src=images/Expand-Monomer-2-3.0..png width = "250"/>

Multiple monomers can be expanded at the same time. 

Expanded monomers behave like S-groups. 

# Working with Files

In **molecules mode**, following file formats are supported:
- Ket Format;
- MDL Molfile V2000;
- MDL Molfile V300O;
- SDF V2000;
- SDF V3000;
- RDF V2000;
- RDF V3000;
- Daylight SMILES;
- Extended SMILES;
- CML;
- InChI;
- InChI AuxInfo;
- InChIKey;
- SVG Document;
- PNG Image;
- CDXML;
- Base64 CDX;
- CDX.

In **macromolecules mode**, the supported file formats are:
- Ket Format;
- MDL Molfile V3000;
- Sequence (1-letter code);
- Sequence (3-letter code);
- FASTA;
- IDT*;
- SVG Document;
- HELM;

* _IDT is a vendor of oligonucleotides where modifications are indicated in their own format._

Structures can be opened using the _Open..._ button on the main toolbars of both modes:

<img src=images/45_1_openmenu.png width = "300"/>

- _Paste From Clipboard_ allows pasting of the file contents (for both modes) and selecting of the format (only for macromolecules mode - in molecules mode the recondition of the format is possible unambiguously);

<img src=images/Open-Structure-Macro-2-3.0..png width = "350"/>

- _Open from File_ allows browsing for a file. After the file is selected editable file contents are visible before the structure is added to the canvas;

<img src=images/Open-Structure-Micro-3.0..png width = "350"/>
  
- _Open as New (Project)_ will clear the canvas and position the new structure on it.
- _Add to Canvas_ will save the structure in the clipboard that can be added to the canvas via a click (for molecules mode) or add the structure to the canvas without the need to click on it (for macromolecules mode).

The _Save as..._ dialog enables choosing of the file name and format, previewing the file contents and copying it to the clipboard:

<img src=images/Save-Structure-Macro-3.0..png width = "350"/>

In Molecules mode an additional tab - _Warnings_ - may appear. It contains warning about the structure's inaccuracies:

<img src=images/Save-Structure-Micro-2-3.0..png width = "350"/>

# Hotkeys

You can use keyboard hotkeys (including Numeric keypad) for some features/commands of the Editor. To display the hotkeys just place the cursor over a toolbar button. If a hotkey is available for the button, it will appear in brackets after the description of the button.

_NOTE: `Mod` key is `Command` on OSX and `Ctrl` on PC systems_

**General**
| Shortcut             | Action             |
| -------------------- | ------------------ |
| `Mod+Delete`         | Clear Canvas       |
| `Mod+o`              | Open…              |
| `Mod+s`              | Save As…           |
| `Mod+z`              | Undo               |
| `Mod+Shift+z, Mod+y` | Redo               |
| `Mod+x`              | Cut                |
| `Mod+c`              | Copy               |
| `Mod+Shift+f`        | Copy Image         |
| `Mod+m`              | Copy as MOL        |
| `Mod+Shift+k`        | Copy as KET        |
| `Mod+v`              | Paste              |
| `Mod+a`              | Select All         |
| `Mod+Shift+a`        | Deselect All       |
| `Mod+d`              | Select descriptors |

**Server**
| Shortcut      | Action           |
| ------------- | ---------------- |
| `Alt+a`       | Aromatize        |
| `Ctrl+Alt+a`  | Dearomatize      |
| `Mod+l`       | Layout           |
| `Mod+Shift+l` | Clean Up         |
| `Mod+p`       | Calculate CIP    |
| `Alt+s`       | Check structure  |
| `Alt+c`       | Calculate values |

**Debug**
| Shortcut      | Action       |
| ------------- | ------------ |
| `Mod+Shift+r` | force-update |
| `Alt+Shift+r` | qs-serialize |

**Tools**
| Shortcut             | Action                                                                             |
| -------------------- | ---------------------------------------------------------------------------------- |
| `Mod+h`              | Hand tool                                                                          |
| `Escape`             | Rotate between: Lasso Selection, Rectangle Selection, Fragment Selection           |
| `Delete, Backspace`  | Erase                                                                              |
| `Alt+e`              | Stereochemistry                                                                    |
| `+`                  | Charge Plus                                                                        |
| `-`                  | Charge Minus                                                                       |
| `Alt+r`              | Rotate Tool                                                                        |
| `Alt+h`              | Horizontal Flip                                                                    |
| `Alt+v`              | Vertical Flip                                                                      |
| `Mod+g`              | Rotate between: S-Group, Data S-Group                                              |
| `Mod+r`              | Rotate between: R-Group Label Tool, Attachment Point Tool                          |
| `Mod+Shift+r, Mod+r` | R-Group Fragment Tool                                                              |
| `1`                  | Rotate between: Single Bond, Single Up Bond, Single Down Bond, Single Up/Down Bond |
| `2`                  | Rotate between: Double Bond, Double Cis/Trans Bond                                 |
| `3`                  | Triple Bond                                                                        |
| `4`                  | Aromatic Bond                                                                      |
| `0`                  | Any Bond                                                                           |
| `Alt+t`              | Add text                                                                           |

**Atoms**
| Shortcut  | Action                                 |
| --------- | -------------------------------------- |
| `h`       | Atom H                                 |
| `c`       | Atom C                                 |
| `n`       | Atom N                                 |
| `o`       | Atom O                                 |
| `s`       | Atom S                                 |
| `p`       | Atom P                                 |
| `f`       | Atom F                                 |
| `b`       | Atom Br                                |
| `i`       | Atom I                                 |
| `k`       | Atom K                                 |
| `Shift+c` | Atom Cl                                |
| `Shift+s` | Atom Si                                |
| `Shift+n` | Atom Na                                |
| `Shift+b` | Atom B                                 |
| `r`       | Pseudoatom                             |
| `d`       | Deuterium                              |
| `a`       | Any atom                               |
| `q`       | Any heteroatom                         |
| `m`       | Any metal                              |
| `x`       | Any halogen                            |
| `/`       | Display the Atom Properties dialog box |

**Bonds**
| Shortcut | Action               |
| -------- | -------------------- |
| `/`      | Open bond properties |

**Zoom**
| Shortcut       | Action    |
| -------------- | --------- |
| `Mod+_, Mod+-` | Zoom Out  |
| `Mod+=, Mod++` | Zoom In   |
| `Mod+Shift+0`  | Zoom 100% |

**Templates**
| Shortcut  | Action                                                                                                                    |
| --------- | ------------------------------------------------------------------------------------------------------------------------- |
| `Shift+t` | Structure Library                                                                                                         |
| `t`       | Rotate between: Benzene, Cyclopentadiene, Cyclohexane, Cyclopentane, Cyclopropane, Cyclobutane, Cycloheptane, Cyclooctane |

**Functional Groups**
| Shortcut  | Action            |
| --------- | ----------------- |
| `Shift+f` | Functional Groups |

**Macromolecules Specific Hotkeys**
| Shortcut | Action |
| --- | --- |
| `Ctrl+Alt+R` | Change the sequence mode typing type to RNA |
| `Ctrl+Alt+D` | Change the sequence mode typing type to DNA |
| `Ctrl+Alt+P` | Change the sequence mode typing type to Peptide |

**Help**
| Shortcut        | Action |
| --------------- | ------ |
| `?, &, Shift+/` | Help   |

**Note** : Please, use`Ctrl+V`to paste the selected object in Google Chrome and Mozilla Firefox browsers.
