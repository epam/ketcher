## Classes

<dl>
<dt><a href="#Ketcher">Ketcher</a></dt>
<dd></dd>
<dt><a href="#KetcherBuilder">KetcherBuilder</a></dt>
<dd></dd>
<dt><a href="#Editor">Editor</a></dt>
<dd><p>Class, describing editor state and options.</p></dd>
<dt><a href="#Struct">Struct</a></dt>
<dd><p>Class, describing structure on canvas.</p></dd>
<dt><a href="#Indigo">Indigo</a></dt>
<dd></dd>
</dl>

<a name="Ketcher"></a>

## Ketcher
**Kind**: global class  

* [Ketcher](#Ketcher)
    * [new _structService()](#new_Ketcher_new)
    * [.indigo](#Ketcher+indigo) ⇒ [<code>Indigo</code>](#Indigo)
    * [.getSmiles([isExtended])](#Ketcher+getSmiles) ⇒ <code>Promise.&lt;string&gt;</code>
    * [.getMolfile([molfileFormat])](#Ketcher+getMolfile) ⇒ <code>Promise.&lt;string&gt;</code>
    * [.getRxn([molfileFormat])](#Ketcher+getRxn) ⇒ <code>Promise.&lt;string&gt;</code>
    * [.getKet()](#Ketcher+getKet) ⇒ <code>Promise.&lt;string&gt;</code>
    * [.getSmarts()](#Ketcher+getSmarts) ⇒ <code>Promise.&lt;string&gt;</code>
    * [.getCml()](#Ketcher+getCml) ⇒ <code>Promise.&lt;string&gt;</code>
    * [.getInchi([withAuxInfo])](#Ketcher+getInchi) ⇒ <code>Promise.&lt;string&gt;</code>
    * [.generateInchIKey()](#Ketcher+generateInchIKey) ⇒ <code>Promise.&lt;string&gt;</code>
    * [.containsReaction()](#Ketcher+containsReaction) ⇒ <code>boolean</code>
    * [.setMolecule(structStr)](#Ketcher+setMolecule) ⇒ <code>void</code>
    * [.generateImage(data, [options])](#Ketcher+generateImage) ⇒ <code>Promise.&lt;Blob&gt;</code>

<a name="new_Ketcher_new"></a>

### new \_structService()
<p>The main class</p>

<a name="Ketcher+indigo"></a>

### ketcher.indigo ⇒ [<code>Indigo</code>](#Indigo)
<p>Returns indigo object</p>

**Kind**: instance property of [<code>Ketcher</code>](#Ketcher)  
**Returns**: [<code>Indigo</code>](#Indigo) - <p>indigo object</p>  
**Access**: public  
<a name="Ketcher+getSmiles"></a>

### ketcher.getSmiles([isExtended]) ⇒ <code>Promise.&lt;string&gt;</code>
<p>Returns stucture in SMILES</p>

**Kind**: instance method of [<code>Ketcher</code>](#Ketcher)  
**Returns**: <code>Promise.&lt;string&gt;</code> - <p>promise resolving into structure in SMILES format</p>  
**Access**: public  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [isExtended] | <code>boolean</code> | <code>false</code> | <p>true, if smilesExt should be used</p> |

<a name="Ketcher+getMolfile"></a>

### ketcher.getMolfile([molfileFormat]) ⇒ <code>Promise.&lt;string&gt;</code>
<p>Returns stucture in MOL</p>

**Kind**: instance method of [<code>Ketcher</code>](#Ketcher)  
**Returns**: <code>Promise.&lt;string&gt;</code> - <p>promise resolving into structure in MOL format</p>  
**Access**: public  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [molfileFormat] | <code>MolfileFormat</code> | <code>&#x27;v2000&#x27;</code> | <p>MOL format</p> |

<a name="Ketcher+getRxn"></a>

### ketcher.getRxn([molfileFormat]) ⇒ <code>Promise.&lt;string&gt;</code>
<p>Returns stucture in RXN</p>

**Kind**: instance method of [<code>Ketcher</code>](#Ketcher)  
**Returns**: <code>Promise.&lt;string&gt;</code> - <p>promise resolving into structure in RXN format</p>  
**Access**: public  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [molfileFormat] | <code>MolfileFormat</code> | <code>&#x27;v2000&#x27;</code> | <p>MOL format</p> |

<a name="Ketcher+getKet"></a>

### ketcher.getKet() ⇒ <code>Promise.&lt;string&gt;</code>
<p>Returns stucture in Ket</p>

**Kind**: instance method of [<code>Ketcher</code>](#Ketcher)  
**Returns**: <code>Promise.&lt;string&gt;</code> - <p>promise resolving into structure in Ket format</p>  
**Access**: public  
<a name="Ketcher+getSmarts"></a>

### ketcher.getSmarts() ⇒ <code>Promise.&lt;string&gt;</code>
<p>Returns stucture in SMARTS</p>

**Kind**: instance method of [<code>Ketcher</code>](#Ketcher)  
**Returns**: <code>Promise.&lt;string&gt;</code> - <p>promise resolving into structure in SMARTS format</p>  
**Access**: public  
<a name="Ketcher+getCml"></a>

### ketcher.getCml() ⇒ <code>Promise.&lt;string&gt;</code>
<p>Returns stucture in CML</p>

**Kind**: instance method of [<code>Ketcher</code>](#Ketcher)  
**Returns**: <code>Promise.&lt;string&gt;</code> - <p>promise resolving into structure in CML format</p>  
**Access**: public  
<a name="Ketcher+getInchi"></a>

### ketcher.getInchi([withAuxInfo]) ⇒ <code>Promise.&lt;string&gt;</code>
<p>Returns stucture in inChI</p>

**Kind**: instance method of [<code>Ketcher</code>](#Ketcher)  
**Returns**: <code>Promise.&lt;string&gt;</code> - <p>promise resolving into structure in inChI format</p>  
**Access**: public  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [withAuxInfo] | <code>boolean</code> | <code>false</code> | <p>true, if inChIAuxInfo should be used</p> |

<a name="Ketcher+generateInchIKey"></a>

### ketcher.generateInchIKey() ⇒ <code>Promise.&lt;string&gt;</code>
<p>Returns InChI key</p>

**Kind**: instance method of [<code>Ketcher</code>](#Ketcher)  
**Returns**: <code>Promise.&lt;string&gt;</code> - <p>promise resolving into InChI key</p>  
**Access**: public  
<a name="Ketcher+containsReaction"></a>

### ketcher.containsReaction() ⇒ <code>boolean</code>
<p>Returns informatiom on whether struct contains rxn arrow</p>

**Kind**: instance method of [<code>Ketcher</code>](#Ketcher)  
**Returns**: <code>boolean</code> - <p>true, if contains</p>  
**Access**: public  
<a name="Ketcher+setMolecule"></a>

### ketcher.setMolecule(structStr) ⇒ <code>void</code>
<p>Sets provided molecule to canvas</p>

**Kind**: instance method of [<code>Ketcher</code>](#Ketcher)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| structStr | [<code>Struct</code>](#Struct) | <p>struct to be set in editor</p> |

<a name="Ketcher+generateImage"></a>

### ketcher.generateImage(data, [options]) ⇒ <code>Promise.&lt;Blob&gt;</code>
<p>Generates ...........</p>

**Kind**: instance method of [<code>Ketcher</code>](#Ketcher)  
**Returns**: <code>Promise.&lt;Blob&gt;</code> - <p>...........</p>  
**Access**: public  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| data | <code>string</code> |  | <p>image data</p> |
| [options] | <code>GenerateImageOptions</code> | <code>{ outputFormat: &#x27;png&#x27; }</code> | <p>options ...........</p> |

<a name="KetcherBuilder"></a>

## KetcherBuilder
**Kind**: global class  

* [KetcherBuilder](#KetcherBuilder)
    * [new _structServiceProvider()](#new_KetcherBuilder_new)
    * [.build(editor, [serviceOptions])](#KetcherBuilder+build) ⇒ [<code>Ketcher</code>](#Ketcher)

<a name="new_KetcherBuilder_new"></a>

### new \_structServiceProvider()
<p>Builder class.</p>

<a name="KetcherBuilder+build"></a>

### ketcherBuilder.build(editor, [serviceOptions]) ⇒ [<code>Ketcher</code>](#Ketcher)
<p>Configure and build Ketcher instance.</p>

**Kind**: instance method of [<code>KetcherBuilder</code>](#KetcherBuilder)  
**Returns**: [<code>Ketcher</code>](#Ketcher) - <p>ketcher instance.</p>  

| Param | Type | Description |
| --- | --- | --- |
| editor | [<code>Editor</code>](#Editor) | <p>editor instance.</p> |
| [serviceOptions] | <code>StructServiceOptions</code> | <p>struct service options.</p> |

<a name="Editor"></a>

## Editor
<p>Class, describing editor state and options.</p>

**Kind**: global class  

* [Editor](#Editor)
    * [.isDitrty()](#Editor+isDitrty) ⇒ <code>boolean</code>
    * [.setOrigin()](#Editor+setOrigin) ⇒ <code>void</code>
    * [.clear()](#Editor+clear) ⇒ <code>void</code>
    * [.struct([value])](#Editor+struct) ⇒ [<code>Struct</code>](#Struct)
    * [.options([value])](#Editor+options) ⇒ <code>object</code>
    * [.zoom([value])](#Editor+zoom) ⇒ <code>object</code>
    * [.selection([ci])](#Editor+selection) ⇒
    * [.undo()](#Editor+undo) ⇒ <code>void</code>
    * [.redo()](#Editor+redo) ⇒ <code>void</code>
    * [.subscribe(eventName, handler)](#Editor+subscribe) ⇒ <code>object</code>
    * [.unsubscribe(eventName, subscriber)](#Editor+unsubscribe) ⇒ <code>void</code>
    * [.structSelected()](#Editor+structSelected) ⇒ [<code>Struct</code>](#Struct)

<a name="Editor+isDitrty"></a>

### editor.isDitrty() ⇒ <code>boolean</code>
<p>..........................</p>

**Kind**: instance method of [<code>Editor</code>](#Editor)  
**Returns**: <code>boolean</code> - <p>true if .......................</p>  
**Access**: public  
<a name="Editor+setOrigin"></a>

### editor.setOrigin() ⇒ <code>void</code>
<p>..........................</p>

**Kind**: instance method of [<code>Editor</code>](#Editor)  
**Access**: public  
<a name="Editor+clear"></a>

### editor.clear() ⇒ <code>void</code>
<p>Clears canvas</p>

**Kind**: instance method of [<code>Editor</code>](#Editor)  
**Access**: public  
<a name="Editor+struct"></a>

### editor.struct([value]) ⇒ [<code>Struct</code>](#Struct)
<p>Returns struct and updates stuct on canvas</p>

**Kind**: instance method of [<code>Editor</code>](#Editor)  
**Returns**: [<code>Struct</code>](#Struct) - <ul>
<li>struct rendered on canvas</li>
</ul>  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| [value] | [<code>Struct</code>](#Struct) | <p>struct to be rendered on canvas</p> |

<a name="Editor+options"></a>

### editor.options([value]) ⇒ <code>object</code>
<p>Returns editor options</p>

**Kind**: instance method of [<code>Editor</code>](#Editor)  
**Returns**: <code>object</code> - <p>editor options .......... type?</p>  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| [value] | <code>any</code> | <p>...............................</p> |

<a name="Editor+zoom"></a>

### editor.zoom([value]) ⇒ <code>object</code>
<p>Sets / gets zoom value</p>

**Kind**: instance method of [<code>Editor</code>](#Editor)  
**Returns**: <code>object</code> - <p>current zoom value</p>  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| [value] | <code>number</code> | <p>zoom value to be set</p> |

<a name="Editor+selection"></a>

### editor.selection([ci]) ⇒
<p>.................................</p>

**Kind**: instance method of [<code>Editor</code>](#Editor)  
**Returns**: <p>.................................</p>  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| [ci] | <code>any</code> | <p>.................................</p> |

<a name="Editor+undo"></a>

### editor.undo() ⇒ <code>void</code>
<p>Cancels the last action in editor, updates history stack and view</p>

**Kind**: instance method of [<code>Editor</code>](#Editor)  
**Access**: public  
<a name="Editor+redo"></a>

### editor.redo() ⇒ <code>void</code>
<p>Reperforms the last canceled action, updates history stack and view</p>

**Kind**: instance method of [<code>Editor</code>](#Editor)  
**Access**: public  
<a name="Editor+subscribe"></a>

### editor.subscribe(eventName, handler) ⇒ <code>object</code>
<p>Creates a subscribtion to provided event</p>

**Kind**: instance method of [<code>Editor</code>](#Editor)  
**Returns**: <code>object</code> - <p>subcriber ....................................</p>  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| eventName | <code>any</code> | <p>event name ................. type -?</p> |
| handler | <code>any</code> | <p>event handler ............... type - ?</p> |

<a name="Editor+unsubscribe"></a>

### editor.unsubscribe(eventName, subscriber) ⇒ <code>void</code>
<p>Removes a subscribtion to provided event</p>

**Kind**: instance method of [<code>Editor</code>](#Editor)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| eventName | <code>any</code> | <p>event name ................. type -?</p> |
| subscriber | <code>any</code> | <p>subscriber object</p> |

<a name="Editor+structSelected"></a>

### editor.structSelected() ⇒ [<code>Struct</code>](#Struct)
<p>Returns selected struct</p>

**Kind**: instance method of [<code>Editor</code>](#Editor)  
**Returns**: [<code>Struct</code>](#Struct) - <p>selected struct</p>  
**Access**: public  
<a name="Struct"></a>

## Struct
<p>Class, describing structure on canvas.</p>

**Kind**: global class  

* [Struct](#Struct)
    * [.hasRxnProps()](#Struct+hasRxnProps) ⇒ <code>bollean</code>
    * [.hasRxnArrow()](#Struct+hasRxnArrow) ⇒ <code>boolean</code>
    * [.hasRxnPluses()](#Struct+hasRxnPluses) ⇒ <code>boolean</code>
    * [.isRxn()](#Struct+isRxn) ⇒ <code>boolean</code>
    * [.isBlank()](#Struct+isBlank) ⇒ <code>boolean</code>
    * [.clone([atomSet], [bondSet], [dropRxnSymbols], [aidMap], [simpleObjectsSet], [textsSet])](#Struct+clone) ⇒ [<code>Struct</code>](#Struct)
    * [.getScaffold()](#Struct+getScaffold) ⇒ [<code>Struct</code>](#Struct)
    * [.getFragmentIds(fid)](#Struct+getFragmentIds) ⇒ <code>Pile.&lt;number&gt;</code>
    * [.getFragment(fid)](#Struct+getFragment) ⇒ [<code>Struct</code>](#Struct)
    * [.mergeInto(cp, [atomSet], [bondSet], [dropRxnSymbols], [keepAllRGroups], [aidMap], [simpleObjectsSet], [textsSet])](#Struct+mergeInto) ⇒ [<code>Struct</code>](#Struct)
    * [.atomAddToSGroup(sgid, aid)](#Struct+atomAddToSGroup) ⇒ <code>void</code>
    * [.findBondId(begin, end)](#Struct+findBondId) ⇒ <code>number</code>
    * [.initNeighbors()](#Struct+initNeighbors) ⇒ <code>void</code>
    * [.bondInitHalfBonds(bid, [bond])](#Struct+bondInitHalfBonds) ⇒ <code>void</code>
    * [.halfBondUpdate(hbid)](#Struct+halfBondUpdate) ⇒ <code>void</code>
    * [.initHalfBonds()](#Struct+initHalfBonds) ⇒ <code>void</code>
    * [.setHbNext(hbid, next)](#Struct+setHbNext) ⇒ <code>void</code>
    * [.atomAddNeighbor(hbid)](#Struct+atomAddNeighbor) ⇒ <code>void</code>
    * [.atomSortNeighbors(aid)](#Struct+atomSortNeighbors) ⇒ <code>void</code>
    * [.sortNeighbors(list)](#Struct+sortNeighbors) ⇒ <code>void</code>
    * [.atomUpdateHalfBonds(aid)](#Struct+atomUpdateHalfBonds) ⇒ <code>void</code>
    * [.updateHalfBonds(list)](#Struct+updateHalfBonds) ⇒ <code>void</code>
    * [.sGroupsRecalcCrossBonds()](#Struct+sGroupsRecalcCrossBonds) ⇒ <code>void</code>
    * [.sGroupDelete(sgid)](#Struct+sGroupDelete) ⇒ <code>void</code>
    * [.atomSetPos(id, pp)](#Struct+atomSetPos) ⇒ <code>void</code>
    * [.rxnPlusSetPos(id, pp)](#Struct+rxnPlusSetPos) ⇒ <code>void</code>
    * [.rxnArrowSetPos(id, pos)](#Struct+rxnArrowSetPos) ⇒ <code>void</code>
    * [.simpleObjectSetPos(id, pos)](#Struct+simpleObjectSetPos) ⇒ <code>void</code>
    * [.textSetPosition(id, pos)](#Struct+textSetPosition) ⇒ <code>void</code>
    * [.getCoordBoundingBox([atomSet])](#Struct+getCoordBoundingBox) ⇒ <code>any</code>
    * [.getCoordBoundingBoxObj()](#Struct+getCoordBoundingBoxObj) ⇒ <code>any</code>
    * [.getBondLengthData()](#Struct+getBondLengthData) ⇒ <code>object</code>
    * [.getAvgBondLength()](#Struct+getAvgBondLength) ⇒ <code>number</code>
    * [.getAvgClosestAtomDistance()](#Struct+getAvgClosestAtomDistance) ⇒ <code>number</code>
    * [.checkBondExists(begin, end)](#Struct+checkBondExists) ⇒ <code>boolean</code>
    * [.findConnectedComponent(firstaid)](#Struct+findConnectedComponent) ⇒ <code>Pile.&lt;number&gt;</code>
    * [.findConnectedComponents([discardExistingFragments])](#Struct+findConnectedComponents) ⇒ <code>Array.&lt;any&gt;</code>
    * [.markFragment(idSet)](#Struct+markFragment) ⇒ <code>void</code>
    * [.markFragments(idSet)](#Struct+markFragments) ⇒ <code>void</code>
    * [.scale(scale)](#Struct+scale) ⇒ <code>void</code>
    * [.rescale(scale)](#Struct+rescale) ⇒ <code>void</code>
    * [.loopHasSelfIntersections(hbs)](#Struct+loopHasSelfIntersections) ⇒ <code>boolean</code>
    * [.partitionLoop(loop)](#Struct+partitionLoop) ⇒ <code>any</code>
    * [.halfBondAngle(hbid1, hbid2)](#Struct+halfBondAngle) ⇒ <code>number</code>
    * [.loopIsConvex(loop)](#Struct+loopIsConvex) ⇒ <code>boolean</code>
    * [.loopIsInner(loop)](#Struct+loopIsInner) ⇒ <code>boolean</code>
    * [.findLoops()](#Struct+findLoops) ⇒ <code>object</code>
    * [.calcImplicitHydrogen(aid)](#Struct+calcImplicitHydrogen) ⇒ <code>void</code>
    * [.setImplicitHydrogen([list])](#Struct+setImplicitHydrogen) ⇒ <code>void</code>
    * [.atomGetNeighbors([aid])](#Struct+atomGetNeighbors) ⇒ <code>Array.&lt;Neighbor&gt;</code> \| <code>undefined</code>
    * [.getComponents()](#Struct+getComponents) ⇒ <code>any</code>
    * [.defineRxnFragmentTypeForAtomset(atomset, arrowpos)](#Struct+defineRxnFragmentTypeForAtomset) ⇒ <code>1</code> \| <code>2</code>
    * [.getBondFragment(bid)](#Struct+getBondFragment) ⇒ <code>any</code>
    * [.bindSGroupsToFunctionalGroups()](#Struct+bindSGroupsToFunctionalGroups) ⇒ <code>void</code>

<a name="Struct+hasRxnProps"></a>

### struct.hasRxnProps() ⇒ <code>bollean</code>
<p>Returns information on whether atoms or bonds contains an rxn properties</p>

**Kind**: instance method of [<code>Struct</code>](#Struct)  
**Returns**: <code>bollean</code> - <p>true if contains</p>  
**Access**: public  
<a name="Struct+hasRxnArrow"></a>

### struct.hasRxnArrow() ⇒ <code>boolean</code>
<p>Returns information on whether struct contains an rxn arrow</p>

**Kind**: instance method of [<code>Struct</code>](#Struct)  
**Returns**: <code>boolean</code> - <p>true if contains</p>  
**Access**: public  
<a name="Struct+hasRxnPluses"></a>

### struct.hasRxnPluses() ⇒ <code>boolean</code>
<p>Returns information on whether struct contains rxn pluses</p>

**Kind**: instance method of [<code>Struct</code>](#Struct)  
**Returns**: <code>boolean</code> - <p>true if contains</p>  
**Access**: public  
<a name="Struct+isRxn"></a>

### struct.isRxn() ⇒ <code>boolean</code>
<p>Returns information on whether struct contains an rxn arrow or rxn pluses</p>

**Kind**: instance method of [<code>Struct</code>](#Struct)  
**Returns**: <code>boolean</code> - <p>true if contains</p>  
**Access**: public  
<a name="Struct+isBlank"></a>

### struct.isBlank() ⇒ <code>boolean</code>
<p>Returns information on whether struct contains any objects as atoms, rnx arrows, rnx pluses, simple objects or text</p>

**Kind**: instance method of [<code>Struct</code>](#Struct)  
**Returns**: <code>boolean</code> - <p>true if contains any of these objects</p>  
**Access**: public  
<a name="Struct+clone"></a>

### struct.clone([atomSet], [bondSet], [dropRxnSymbols], [aidMap], [simpleObjectsSet], [textsSet]) ⇒ [<code>Struct</code>](#Struct)
<p>Returns cloned struct merged with provided parameters</p>

**Kind**: instance method of [<code>Struct</code>](#Struct)  
**Returns**: [<code>Struct</code>](#Struct) - <p>cloned struct</p>  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| [atomSet] | <code>Pile.&lt;number&gt;</code> \| <code>null</code> | <p>set of atoms</p> |
| [bondSet] | <code>Pile.&lt;number&gt;</code> \| <code>null</code> | <p>set of bonds</p> |
| [dropRxnSymbols] | <code>boolean</code> |  |
| [aidMap] | <code>Map.&lt;number, number&gt;</code> \| <code>null</code> | <p>atom IDs</p> |
| [simpleObjectsSet] | <code>Pile.&lt;number&gt;</code> \| <code>null</code> | <p>set of simple objects</p> |
| [textsSet] | <code>Pile.&lt;number&gt;</code> \| <code>null</code> | <p>set of text objects</p> |

<a name="Struct+getScaffold"></a>

### struct.getScaffold() ⇒ [<code>Struct</code>](#Struct)
<p>Returns cloned struct ................................</p>

**Kind**: instance method of [<code>Struct</code>](#Struct)  
**Returns**: [<code>Struct</code>](#Struct) - <p>cloned struct</p>  
**Access**: public  
<a name="Struct+getFragmentIds"></a>

### struct.getFragmentIds(fid) ⇒ <code>Pile.&lt;number&gt;</code>
<p>Returns set of atoms with provided fragment ID</p>

**Kind**: instance method of [<code>Struct</code>](#Struct)  
**Returns**: <code>Pile.&lt;number&gt;</code> - <p>set of atoms</p>  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| fid | <code>number</code> | <p>fragment ID</p> |

<a name="Struct+getFragment"></a>

### struct.getFragment(fid) ⇒ [<code>Struct</code>](#Struct)
<p>Returns fragment struct with provided fragment ID</p>

**Kind**: instance method of [<code>Struct</code>](#Struct)  
**Returns**: [<code>Struct</code>](#Struct) - <p>fragment struct</p>  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| fid | <code>number</code> | <p>fragment ID</p> |

<a name="Struct+mergeInto"></a>

### struct.mergeInto(cp, [atomSet], [bondSet], [dropRxnSymbols], [keepAllRGroups], [aidMap], [simpleObjectsSet], [textsSet]) ⇒ [<code>Struct</code>](#Struct)
<p>Returns struct merged into provided struct according to other parameters</p>

**Kind**: instance method of [<code>Struct</code>](#Struct)  
**Returns**: [<code>Struct</code>](#Struct) - <p>merged struct</p>  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| cp | [<code>Struct</code>](#Struct) | <p>struct</p> |
| [atomSet] | <code>Pile.&lt;number&gt;</code> \| <code>null</code> | <p>set of atoms</p> |
| [bondSet] | <code>Pile.&lt;number&gt;</code> \| <code>null</code> | <p>set of bonds</p> |
| [dropRxnSymbols] | <code>boolean</code> | <p>flag, which sets if rxn arrows and pluses should be cloned</p> |
| [keepAllRGroups] | <code>boolean</code> | <p>.......................</p> |
| [aidMap] | <code>Map.&lt;number, number&gt;</code> \| <code>null</code> | <p>atom IDs</p> |
| [simpleObjectsSet] | <code>Pile.&lt;number&gt;</code> \| <code>null</code> | <p>set of simple objects</p> |
| [textsSet] | <code>Pile.&lt;number&gt;</code> \| <code>null</code> | <p>set of text objects</p> |

<a name="Struct+atomAddToSGroup"></a>

### struct.atomAddToSGroup(sgid, aid) ⇒ <code>void</code>
<p>Adds atom to the S-Group</p>

**Kind**: instance method of [<code>Struct</code>](#Struct)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| sgid | <code>any</code> | <p>S-Group ID</p> |
| aid | <code>any</code> | <p>atom ID</p> |

<a name="Struct+findBondId"></a>

### struct.findBondId(begin, end) ⇒ <code>number</code>
<p>Returns bond ID</p>

**Kind**: instance method of [<code>Struct</code>](#Struct)  
**Returns**: <code>number</code> - <p>bond ID</p>  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| begin | <code>number</code> | <p>bond begin</p> |
| end | <code>number</code> | <p>bond end</p> |

<a name="Struct+initNeighbors"></a>

### struct.initNeighbors() ⇒ <code>void</code>
<p>Sets neighbors for atoms</p>

**Kind**: instance method of [<code>Struct</code>](#Struct)  
**Access**: public  
<a name="Struct+bondInitHalfBonds"></a>

### struct.bondInitHalfBonds(bid, [bond]) ⇒ <code>void</code>
<p>Initializes half bonds for provided bond</p>

**Kind**: instance method of [<code>Struct</code>](#Struct)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| bid | <code>number</code> | <p>bond ID</p> |
| [bond] | <code>Bond</code> | <p>bond</p> |

<a name="Struct+halfBondUpdate"></a>

### struct.halfBondUpdate(hbid) ⇒ <code>void</code>
<p>Updates provided half bond</p>

**Kind**: instance method of [<code>Struct</code>](#Struct)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| hbid | <code>number</code> | <p>half bond ID</p> |

<a name="Struct+initHalfBonds"></a>

### struct.initHalfBonds() ⇒ <code>void</code>
<p>Initializes half bond for all bonds</p>

**Kind**: instance method of [<code>Struct</code>](#Struct)  
**Access**: public  
<a name="Struct+setHbNext"></a>

### struct.setHbNext(hbid, next) ⇒ <code>void</code>
<p>...............................</p>

**Kind**: instance method of [<code>Struct</code>](#Struct)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| hbid | <code>number</code> | <p>half bond ID</p> |
| next | <code>any</code> |  |

<a name="Struct+atomAddNeighbor"></a>

### struct.atomAddNeighbor(hbid) ⇒ <code>void</code>
<p>............................</p>

**Kind**: instance method of [<code>Struct</code>](#Struct)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| hbid | <code>number</code> | <p>half bond ID</p> |

<a name="Struct+atomSortNeighbors"></a>

### struct.atomSortNeighbors(aid) ⇒ <code>void</code>
<p>Sorts atom neighbors ............................</p>

**Kind**: instance method of [<code>Struct</code>](#Struct)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| aid | <code>number</code> | <p>half bond ID</p> |

<a name="Struct+sortNeighbors"></a>

### struct.sortNeighbors(list) ⇒ <code>void</code>
<p>............................</p>

**Kind**: instance method of [<code>Struct</code>](#Struct)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| list | <code>any</code> | <p>............................</p> |

<a name="Struct+atomUpdateHalfBonds"></a>

### struct.atomUpdateHalfBonds(aid) ⇒ <code>void</code>
<p>Updates half bonds for provided atom</p>

**Kind**: instance method of [<code>Struct</code>](#Struct)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| aid | <code>number</code> | <p>atom ID</p> |

<a name="Struct+updateHalfBonds"></a>

### struct.updateHalfBonds(list) ⇒ <code>void</code>
<p>Updates half bonds for provided atom</p>

**Kind**: instance method of [<code>Struct</code>](#Struct)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| list | <code>any</code> | <p>..................</p> |

<a name="Struct+sGroupsRecalcCrossBonds"></a>

### struct.sGroupsRecalcCrossBonds() ⇒ <code>void</code>
<p>.................................</p>

**Kind**: instance method of [<code>Struct</code>](#Struct)  
**Access**: public  
<a name="Struct+sGroupDelete"></a>

### struct.sGroupDelete(sgid) ⇒ <code>void</code>
<p>Deletes specified S-Group</p>

**Kind**: instance method of [<code>Struct</code>](#Struct)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| sgid | <code>number</code> | <p>S-Group ID</p> |

<a name="Struct+atomSetPos"></a>

### struct.atomSetPos(id, pp) ⇒ <code>void</code>
<p>Sets position for specified atom</p>

**Kind**: instance method of [<code>Struct</code>](#Struct)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>number</code> | <p>atom ID</p> |
| pp | <code>Vec2</code> | <p>position</p> |

<a name="Struct+rxnPlusSetPos"></a>

### struct.rxnPlusSetPos(id, pp) ⇒ <code>void</code>
<p>Sets position for specified rxn pluse</p>

**Kind**: instance method of [<code>Struct</code>](#Struct)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>number</code> | <p>rxn pluse ID</p> |
| pp | <code>Vec2</code> | <p>position</p> |

<a name="Struct+rxnArrowSetPos"></a>

### struct.rxnArrowSetPos(id, pos) ⇒ <code>void</code>
<p>Sets position for specified rxn arrow</p>

**Kind**: instance method of [<code>Struct</code>](#Struct)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>number</code> | <p>rxn arrow ID</p> |
| pos | <code>Array.&lt;Vec2&gt;</code> | <p>position</p> |

<a name="Struct+simpleObjectSetPos"></a>

### struct.simpleObjectSetPos(id, pos) ⇒ <code>void</code>
<p>Sets position for specified simple object</p>

**Kind**: instance method of [<code>Struct</code>](#Struct)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>number</code> | <p>simple object ID</p> |
| pos | <code>Array.&lt;Vec2&gt;</code> | <p>position</p> |

<a name="Struct+textSetPosition"></a>

### struct.textSetPosition(id, pos) ⇒ <code>void</code>
<p>Sets position for specified text item</p>

**Kind**: instance method of [<code>Struct</code>](#Struct)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>number</code> | <p>text id</p> |
| pos | <code>Vec2</code> | <p>position</p> |

<a name="Struct+getCoordBoundingBox"></a>

### struct.getCoordBoundingBox([atomSet]) ⇒ <code>any</code>
<p>Returns bounding box (min and max coordinates) for specified atoms set</p>

**Kind**: instance method of [<code>Struct</code>](#Struct)  
**Returns**: <code>any</code> - <p>boundingBox - object with min and max coordinates</p>  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| [atomSet] | <code>Pile.&lt;number&gt;</code> | <p>set of atoms</p> |

<a name="Struct+getCoordBoundingBoxObj"></a>

### struct.getCoordBoundingBoxObj() ⇒ <code>any</code>
<p>Returns bounding box (min and max coordinates)</p>

**Kind**: instance method of [<code>Struct</code>](#Struct)  
**Returns**: <code>any</code> - <p>boundingBox - object with min and max coordinates</p>  
**Access**: public  
<a name="Struct+getBondLengthData"></a>

### struct.getBondLengthData() ⇒ <code>object</code>
<p>Returns total bonds length</p>

**Kind**: instance method of [<code>Struct</code>](#Struct)  
**Returns**: <code>object</code> - <p>object with number or bonds and their total length</p>  
**Access**: public  
<a name="Struct+getAvgBondLength"></a>

### struct.getAvgBondLength() ⇒ <code>number</code>
<p>Returns average bond length</p>

**Kind**: instance method of [<code>Struct</code>](#Struct)  
**Returns**: <code>number</code> - <p>average bond length</p>  
**Access**: public  
<a name="Struct+getAvgClosestAtomDistance"></a>

### struct.getAvgClosestAtomDistance() ⇒ <code>number</code>
<p>Returns ..................................</p>

**Kind**: instance method of [<code>Struct</code>](#Struct)  
**Returns**: <code>number</code> - <p>..................................</p>  
**Access**: public  
<a name="Struct+checkBondExists"></a>

### struct.checkBondExists(begin, end) ⇒ <code>boolean</code>
<p>Returns information on whether specified bond exists</p>

**Kind**: instance method of [<code>Struct</code>](#Struct)  
**Returns**: <code>boolean</code> - <p>true if exists</p>  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| begin | <code>number</code> | <p>begin of bond</p> |
| end | <code>number</code> | <p>begin of bond</p> |

<a name="Struct+findConnectedComponent"></a>

### struct.findConnectedComponent(firstaid) ⇒ <code>Pile.&lt;number&gt;</code>
<p>............................</p>

**Kind**: instance method of [<code>Struct</code>](#Struct)  
**Returns**: <code>Pile.&lt;number&gt;</code> - <p>........................</p>  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| firstaid | <code>number</code> | <p>first atom id</p> |

<a name="Struct+findConnectedComponents"></a>

### struct.findConnectedComponents([discardExistingFragments]) ⇒ <code>Array.&lt;any&gt;</code>
<p>............................</p>

**Kind**: instance method of [<code>Struct</code>](#Struct)  
**Returns**: <code>Array.&lt;any&gt;</code> - <p>........................</p>  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| [discardExistingFragments] | <code>boolean</code> | <p>first atom id</p> |

<a name="Struct+markFragment"></a>

### struct.markFragment(idSet) ⇒ <code>void</code>
<p>............................</p>

**Kind**: instance method of [<code>Struct</code>](#Struct)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| idSet | <code>Pile.&lt;number&gt;</code> | <p>....................</p> |

<a name="Struct+markFragments"></a>

### struct.markFragments(idSet) ⇒ <code>void</code>
<p>............................</p>

**Kind**: instance method of [<code>Struct</code>](#Struct)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| idSet | <code>Pile.&lt;number&gt;</code> | <p>....................</p> |

<a name="Struct+scale"></a>

### struct.scale(scale) ⇒ <code>void</code>
<p>.........................................</p>

**Kind**: instance method of [<code>Struct</code>](#Struct)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| scale | <code>number</code> | <p>scale value</p> |

<a name="Struct+rescale"></a>

### struct.rescale(scale) ⇒ <code>void</code>
<p>.........................................</p>

**Kind**: instance method of [<code>Struct</code>](#Struct)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| scale | <code>number</code> | <p>scale value</p> |

<a name="Struct+loopHasSelfIntersections"></a>

### struct.loopHasSelfIntersections(hbs) ⇒ <code>boolean</code>
<p>Returns ................................</p>

**Kind**: instance method of [<code>Struct</code>](#Struct)  
**Returns**: <code>boolean</code> - <p>................................</p>  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| hbs | <code>Array.&lt;number&gt;</code> | <p>half bonds set - ????</p> |

<a name="Struct+partitionLoop"></a>

### struct.partitionLoop(loop) ⇒ <code>any</code>
<p>.........................</p>

**Kind**: instance method of [<code>Struct</code>](#Struct)  
**Returns**: <code>any</code> - <p>.......................</p>  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| loop | <code>any</code> | <p>......................</p> |

<a name="Struct+halfBondAngle"></a>

### struct.halfBondAngle(hbid1, hbid2) ⇒ <code>number</code>
<p>Returns an angle of half bonds ................................</p>

**Kind**: instance method of [<code>Struct</code>](#Struct)  
**Returns**: <code>number</code> - <p>angle in π radian</p>  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| hbid1 | <code>number</code> | <p>first half bond id</p> |
| hbid2 | <code>number</code> | <p>second half bond id</p> |

<a name="Struct+loopIsConvex"></a>

### struct.loopIsConvex(loop) ⇒ <code>boolean</code>
<p>Returns information on whether ................................</p>

**Kind**: instance method of [<code>Struct</code>](#Struct)  
**Returns**: <code>boolean</code> - <p>................................</p>  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| loop | <code>Array.&lt;any&gt;</code> | <p>................................</p> |

<a name="Struct+loopIsInner"></a>

### struct.loopIsInner(loop) ⇒ <code>boolean</code>
<p>Returns information on whether ................................</p>

**Kind**: instance method of [<code>Struct</code>](#Struct)  
**Returns**: <code>boolean</code> - <p>................................</p>  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| loop | <code>Array.&lt;any&gt;</code> | <p>................................</p> |

<a name="Struct+findLoops"></a>

### struct.findLoops() ⇒ <code>object</code>
<p>Returns information on whether ................................</p>

**Kind**: instance method of [<code>Struct</code>](#Struct)  
**Returns**: <code>object</code> - <p>................................</p>  
**Access**: public  
<a name="Struct+calcImplicitHydrogen"></a>

### struct.calcImplicitHydrogen(aid) ⇒ <code>void</code>
<p>Calculates implicit hydrogen</p>

**Kind**: instance method of [<code>Struct</code>](#Struct)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| aid | <code>number</code> | <p>atom ID</p> |

<a name="Struct+setImplicitHydrogen"></a>

### struct.setImplicitHydrogen([list]) ⇒ <code>void</code>
<p>Sets implicit hydrogen</p>

**Kind**: instance method of [<code>Struct</code>](#Struct)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| [list] | <code>Array.&lt;number&gt;</code> | <p>................</p> |

<a name="Struct+atomGetNeighbors"></a>

### struct.atomGetNeighbors([aid]) ⇒ <code>Array.&lt;Neighbor&gt;</code> \| <code>undefined</code>
<p>Returns array of neighbors for specified atom</p>

**Kind**: instance method of [<code>Struct</code>](#Struct)  
**Returns**: <code>Array.&lt;Neighbor&gt;</code> \| <code>undefined</code> - <p>array of neighbors for specified atom</p>  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| [aid] | <code>number</code> | <p>atom ID</p> |

<a name="Struct+getComponents"></a>

### struct.getComponents() ⇒ <code>any</code>
<p>.......................</p>

**Kind**: instance method of [<code>Struct</code>](#Struct)  
**Returns**: <code>any</code> - <p>.......................</p>  
**Access**: public  
<a name="Struct+defineRxnFragmentTypeForAtomset"></a>

### struct.defineRxnFragmentTypeForAtomset(atomset, arrowpos) ⇒ <code>1</code> \| <code>2</code>
<p>.......................</p>

**Kind**: instance method of [<code>Struct</code>](#Struct)  
**Returns**: <code>1</code> \| <code>2</code> - <p>.......................</p>  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| atomset | <code>Pile.&lt;number&gt;</code> | <p>set of atoms</p> |
| arrowpos | <code>number</code> | <p>....................</p> |

<a name="Struct+getBondFragment"></a>

### struct.getBondFragment(bid) ⇒ <code>any</code>
<p>Returns information on weather bond contains a fragment</p>

**Kind**: instance method of [<code>Struct</code>](#Struct)  
**Returns**: <code>any</code> - <p>..........................</p>  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| bid | <code>number</code> | <p>bond ID</p> |

<a name="Struct+bindSGroupsToFunctionalGroups"></a>

### struct.bindSGroupsToFunctionalGroups() ⇒ <code>void</code>
<p>.......................</p>

**Kind**: instance method of [<code>Struct</code>](#Struct)  
**Access**: public  
<a name="Indigo"></a>

## Indigo
**Kind**: global class  

* [Indigo](#Indigo)
    * [new _structService()](#new_Indigo_new)
    * [.info()](#Indigo+info) ⇒ <code>Promise.&lt;InfoResult&gt;</code>
    * [.convert(struct, [options])](#Indigo+convert) ⇒ <code>Promise.&lt;ConvertResult&gt;</code>
    * [.layout(struct)](#Indigo+layout) ⇒ [<code>Promise.&lt;Struct&gt;</code>](#Struct)
    * [.clean(struct)](#Indigo+clean) ⇒ [<code>Promise.&lt;Struct&gt;</code>](#Struct)
    * [.aromatize(struct)](#Indigo+aromatize) ⇒ [<code>Promise.&lt;Struct&gt;</code>](#Struct)
    * [.dearomatize(struct)](#Indigo+dearomatize) ⇒ [<code>Promise.&lt;Struct&gt;</code>](#Struct)
    * [.calculateCip(struct)](#Indigo+calculateCip) ⇒ [<code>Promise.&lt;Struct&gt;</code>](#Struct)
    * [.automap(struct, [options])](#Indigo+automap) ⇒ [<code>Promise.&lt;Struct&gt;</code>](#Struct)
    * [.check(struct, [options])](#Indigo+check) ⇒ [<code>Promise.&lt;Struct&gt;</code>](#Struct)
    * [.calculate(struct, [options])](#Indigo+calculate) ⇒ <code>Promise.&lt;CalculateResult&gt;</code>
    * [.recognize(image, [options])](#Indigo+recognize) ⇒ <code>Promise.&lt;CalculateResult&gt;</code>
    * [.generateImageAsBase64(struct, [options])](#Indigo+generateImageAsBase64) ⇒ <code>Promise.&lt;string&gt;</code>

<a name="new_Indigo_new"></a>

### new \_structService()
<p>Class, performing 'server' (indigo) functions</p>

<a name="Indigo+info"></a>

### indigo.info() ⇒ <code>Promise.&lt;InfoResult&gt;</code>
<p>Returns information about indigo service</p>

**Kind**: instance method of [<code>Indigo</code>](#Indigo)  
**Returns**: <code>Promise.&lt;InfoResult&gt;</code> - <p>promise, which fulfills into object with indigo information</p>  
**Access**: public  
<a name="Indigo+convert"></a>

### indigo.convert(struct, [options]) ⇒ <code>Promise.&lt;ConvertResult&gt;</code>
<p>Returns converted structure</p>

**Kind**: instance method of [<code>Indigo</code>](#Indigo)  
**Returns**: <code>Promise.&lt;ConvertResult&gt;</code> - <p>promise, resolving into an object with structure and format</p>  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| struct | [<code>Struct</code>](#Struct) | <p>structure</p> |
| [options] | <code>ConvertOptions</code> | <p>object with output format</p> |

<a name="Indigo+layout"></a>

### indigo.layout(struct) ⇒ [<code>Promise.&lt;Struct&gt;</code>](#Struct)
<p>Returns a structure with normalized layout</p>

**Kind**: instance method of [<code>Indigo</code>](#Indigo)  
**Returns**: [<code>Promise.&lt;Struct&gt;</code>](#Struct) - <p>promise, resolving into normalized struct</p>  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| struct | <code>StructOrString</code> | <p>structure</p> |

<a name="Indigo+clean"></a>

### indigo.clean(struct) ⇒ [<code>Promise.&lt;Struct&gt;</code>](#Struct)
<p>Returns a structure with normalized bond lengths and angles</p>

**Kind**: instance method of [<code>Indigo</code>](#Indigo)  
**Returns**: [<code>Promise.&lt;Struct&gt;</code>](#Struct) - <p>promise, resolving into normalized struct</p>  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| struct | <code>StructOrString</code> | <p>initial structure</p> |

<a name="Indigo+aromatize"></a>

### indigo.aromatize(struct) ⇒ [<code>Promise.&lt;Struct&gt;</code>](#Struct)
<p>Returns aromatized structure</p>

**Kind**: instance method of [<code>Indigo</code>](#Indigo)  
**Returns**: [<code>Promise.&lt;Struct&gt;</code>](#Struct) - <p>promise, resolving into atomatized struct</p>  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| struct | <code>StructOrString</code> | <p>initial structure</p> |

<a name="Indigo+dearomatize"></a>

### indigo.dearomatize(struct) ⇒ [<code>Promise.&lt;Struct&gt;</code>](#Struct)
<p>Returns dearomatized structure</p>

**Kind**: instance method of [<code>Indigo</code>](#Indigo)  
**Returns**: [<code>Promise.&lt;Struct&gt;</code>](#Struct) - <p>promise, resolving into dearomatized structure</p>  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| struct | <code>StructOrString</code> | <p>initial structure</p> |

<a name="Indigo+calculateCip"></a>

### indigo.calculateCip(struct) ⇒ [<code>Promise.&lt;Struct&gt;</code>](#Struct)
<p>Returns a structure ..........................</p>

**Kind**: instance method of [<code>Indigo</code>](#Indigo)  
**Returns**: [<code>Promise.&lt;Struct&gt;</code>](#Struct) - <p>promise, resolving into .............................</p>  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| struct | <code>StructOrString</code> | <p>initial structure</p> |

<a name="Indigo+automap"></a>

### indigo.automap(struct, [options]) ⇒ [<code>Promise.&lt;Struct&gt;</code>](#Struct)
<p>Returns a structure ..........................</p>

**Kind**: instance method of [<code>Indigo</code>](#Indigo)  
**Returns**: [<code>Promise.&lt;Struct&gt;</code>](#Struct) - <p>promise, resolving into .............................</p>  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| struct | <code>StructOrString</code> | <p>initial structure</p> |
| [options] | <code>AutomapOptions</code> | <p>object with automap mode</p> |

<a name="Indigo+check"></a>

### indigo.check(struct, [options]) ⇒ [<code>Promise.&lt;Struct&gt;</code>](#Struct)
<p>Returns a structure ..........................</p>

**Kind**: instance method of [<code>Indigo</code>](#Indigo)  
**Returns**: [<code>Promise.&lt;Struct&gt;</code>](#Struct) - <p>promise, resolving into .............................</p>  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| struct | <code>StructOrString</code> | <p>initial structure</p> |
| [options] | <code>CheckOptions</code> | <p>object with check types</p> |

<a name="Indigo+calculate"></a>

### indigo.calculate(struct, [options]) ⇒ <code>Promise.&lt;CalculateResult&gt;</code>
<p>Returns calculated values of molecule</p>

**Kind**: instance method of [<code>Indigo</code>](#Indigo)  
**Returns**: <code>Promise.&lt;CalculateResult&gt;</code> - <p>promise, resolving into object with molecule calculated values</p>  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| struct | <code>StructOrString</code> | <p>structure</p> |
| [options] | <code>CalculateOptions</code> | <p>object with properties</p> |

<a name="Indigo+recognize"></a>

### indigo.recognize(image, [options]) ⇒ <code>Promise.&lt;CalculateResult&gt;</code>
<p>Returns struct ..........................</p>

**Kind**: instance method of [<code>Indigo</code>](#Indigo)  
**Returns**: <code>Promise.&lt;CalculateResult&gt;</code> - <p>promise, resolving into .............................</p>  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| image | <code>Blob</code> | <p>image</p> |
| [options] | <code>RecognizeOptions</code> | <p>object with imago versions</p> |

<a name="Indigo+generateImageAsBase64"></a>

### indigo.generateImageAsBase64(struct, [options]) ⇒ <code>Promise.&lt;string&gt;</code>
<p>Returns base 64 string generated from struct</p>

**Kind**: instance method of [<code>Indigo</code>](#Indigo)  
**Returns**: <code>Promise.&lt;string&gt;</code> - <p>promise, resolving into base64 string</p>  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| struct | <code>StructOrString</code> | <p>struct</p> |
| [options] | <code>GenerateImageOptions</code> | <p>object with imago versions</p> |

