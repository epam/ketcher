## Classes

<dl>
<dt><a href="#KetcherBuilder">KetcherBuilder</a></dt>
<dd></dd>
<dt><a href="#SGroupForest">SGroupForest</a></dt>
<dd></dd>
<dt><a href="#Struct">Struct</a></dt>
<dd><p>Class, describing structure on canvas.</p></dd>
</dl>

## Functions

<dl>
<dt><a href="#fromAromaticTemplateOnBond">fromAromaticTemplateOnBond(restruct, events, bid, template, simpleFusing)</a> ⇒ <code>Promise</code></dt>
<dd></dd>
<dt><a href="#fromDearomatize">fromDearomatize(restruct, dastruct, bondMap)</a> ⇒ <code>Action</code></dt>
<dd></dd>
<dt><a href="#getFragmentWithBondMap">getFragmentWithBondMap(struct, frid)</a> ⇒ <code>Object</code></dt>
<dd></dd>
<dt><a href="#fromAtomsAttrs">fromAtomsAttrs(restruct, ids, attrs, reset)</a></dt>
<dd></dd>
<dt><a href="#fromAtomMerge">fromAtomMerge(restruct, srcId, dstId)</a> ⇒ <code>Action</code></dt>
<dd></dd>
<dt><a href="#closestToMerge">closestToMerge(struct, closestMap)</a> ⇒ <code>Object</code></dt>
<dd></dd>
<dt><a href="#processAtom">processAtom(restruct, aid, frid, newfrid)</a> ⇒ <code>Action</code></dt>
<dd></dd>
<dt><a href="#fromFragmentSplit">fromFragmentSplit(restruct, frid, rgForRemove)</a> ⇒ <code>Action</code></dt>
<dd></dd>
<dt><a href="#isSelectionSvgObjectExists">isSelectionSvgObjectExists(item)</a> ⇒ <code>boolean</code></dt>
<dd><p>SelectionPlate could be an item then value would be in it
or it could be a set of items then removed value need to be check on at least one of items in set</p></dd>
<dt><a href="#shiftRayBox">shiftRayBox(p, d, bb)</a></dt>
<dd><p>Finds intersection of a ray and a box and
Returns the shift magnitude to avoid it</p></dd>
<dt><del><a href="#circleToEllipse">circleToEllipse(ketItem)</a></del></dt>
<dd></dd>
</dl>

<a name="KetcherBuilder"></a>

## KetcherBuilder
**Kind**: global class  

* [KetcherBuilder](#KetcherBuilder)
    * [new _structServiceProvider()](#new_KetcherBuilder_new)
    * [.build(editor, [serviceOptions])](#KetcherBuilder+build) ⇒ <code>Ketcher</code>

<a name="new_KetcherBuilder_new"></a>

### new \_structServiceProvider()
<p>Builder class.</p>

<a name="KetcherBuilder+build"></a>

### ketcherBuilder.build(editor, [serviceOptions]) ⇒ <code>Ketcher</code>
<p>Configure and build Ketcher instance.</p>

**Kind**: instance method of [<code>KetcherBuilder</code>](#KetcherBuilder)  
**Returns**: <code>Ketcher</code> - <p>ketcher instance.</p>  

| Param | Type | Description |
| --- | --- | --- |
| editor | <code>Editor</code> | <p>editor instance.</p> |
| [serviceOptions] | <code>StructServiceOptions</code> | <p>struct service options.</p> |

<a name="SGroupForest"></a>

## SGroupForest
**Kind**: global class  

* [SGroupForest](#SGroupForest)
    * [new SGroupForest()](#new_SGroupForest_new)
    * [.getSGroupsBFS()](#SGroupForest+getSGroupsBFS)

<a name="new_SGroupForest_new"></a>

### new SGroupForest()
<p>node id -&gt; list of child ids</p>

<a name="SGroupForest+getSGroupsBFS"></a>

### sGroupForest.getSGroupsBFS()
<p>returns an array or s-group ids in the order of breadth-first search</p>

**Kind**: instance method of [<code>SGroupForest</code>](#SGroupForest)  
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

<a name="Struct+hasRxnProps"></a>

### struct.hasRxnProps() ⇒ <code>bollean</code>
<p>Returns</p>

**Kind**: instance method of [<code>Struct</code>](#Struct)  
**Access**: protected  
<a name="Struct+hasRxnArrow"></a>

### struct.hasRxnArrow() ⇒ <code>boolean</code>
<p>Returns information on whether struct contains an rxn arrow.</p>

**Kind**: instance method of [<code>Struct</code>](#Struct)  
**Returns**: <code>boolean</code> - <p>true if contains.</p>  
**Access**: public  
<a name="Struct+hasRxnPluses"></a>

### struct.hasRxnPluses() ⇒ <code>boolean</code>
<p>Returns information on whether struct contains rxn pluses.</p>

**Kind**: instance method of [<code>Struct</code>](#Struct)  
**Returns**: <code>boolean</code> - <p>true if contains.</p>  
<a name="Struct+isRxn"></a>

### struct.isRxn() ⇒ <code>boolean</code>
<p>Returns information on whether struct contains an rxn arrow or rxn pluses.</p>

**Kind**: instance method of [<code>Struct</code>](#Struct)  
**Returns**: <code>boolean</code> - <p>true if contains.</p>  
<a name="Struct+isBlank"></a>

### struct.isBlank() ⇒ <code>boolean</code>
<p>Returns information on whether struct contains any objects as atoms, rnx arrows, rnx pluses, simple objects or text.</p>

**Kind**: instance method of [<code>Struct</code>](#Struct)  
**Returns**: <code>boolean</code> - <p>true if contains any of these objects.</p>  
<a name="fromAromaticTemplateOnBond"></a>

## fromAromaticTemplateOnBond(restruct, events, bid, template, simpleFusing) ⇒ <code>Promise</code>
**Kind**: global function  

| Param | Type |
| --- | --- |
| restruct | <code>ReStruct</code> | 
| events | <code>Array.&lt;PipelineSubscription&gt;</code> | 
| bid | <code>number</code> | 
| template | <code>Object</code> | 
| simpleFusing | <code>function</code> | 

<a name="fromDearomatize"></a>

## fromDearomatize(restruct, dastruct, bondMap) ⇒ <code>Action</code>
**Kind**: global function  

| Param | Type |
| --- | --- |
| restruct | <code>ReStruct</code> | 
| dastruct | <code>ReStruct</code> | 
| bondMap | <code>Map.&lt;number, number&gt;</code> | 

<a name="getFragmentWithBondMap"></a>

## getFragmentWithBondMap(struct, frid) ⇒ <code>Object</code>
**Kind**: global function  

| Param | Type |
| --- | --- |
| struct | [<code>Struct</code>](#Struct) | 
| frid | <code>number</code> | 

<a name="fromAtomsAttrs"></a>

## fromAtomsAttrs(restruct, ids, attrs, reset)
**Kind**: global function  

| Param | Type |
| --- | --- |
| restruct | <code>ReStruct</code> | 
| ids | <code>Array.&lt;number&gt;</code> \| <code>number</code> | 
| attrs | <code>object</code> | 
| reset | <code>boolean</code> | 

<a name="fromAtomMerge"></a>

## fromAtomMerge(restruct, srcId, dstId) ⇒ <code>Action</code>
**Kind**: global function  

| Param | Type |
| --- | --- |
| restruct | <code>ReStruct</code> | 
| srcId | <code>number</code> | 
| dstId | <code>number</code> | 

<a name="closestToMerge"></a>

## closestToMerge(struct, closestMap) ⇒ <code>Object</code>
**Kind**: global function  

| Param | Type |
| --- | --- |
| struct |  | 
| closestMap | <code>Object</code> | 

<a name="processAtom"></a>

## processAtom(restruct, aid, frid, newfrid) ⇒ <code>Action</code>
**Kind**: global function  

| Param | Type |
| --- | --- |
| restruct | <code>ReStruct</code> | 
| aid | <code>number</code> | 
| frid | <code>number</code> | 
| newfrid | <code>number</code> | 

<a name="fromFragmentSplit"></a>

## fromFragmentSplit(restruct, frid, rgForRemove) ⇒ <code>Action</code>
**Kind**: global function  

| Param | Type |
| --- | --- |
| restruct | <code>ReStruct</code> | 
| frid | <code>number</code> | 
| rgForRemove |  | 

<a name="isSelectionSvgObjectExists"></a>

## isSelectionSvgObjectExists(item) ⇒ <code>boolean</code>
<p>SelectionPlate could be an item then value would be in it
or it could be a set of items then removed value need to be check on at least one of items in set</p>

**Kind**: global function  

| Param |
| --- |
| item | 

<a name="shiftRayBox"></a>

## shiftRayBox(p, d, bb)
<p>Finds intersection of a ray and a box and
Returns the shift magnitude to avoid it</p>

**Kind**: global function  

| Param | Type |
| --- | --- |
| p | <code>Vec2</code> | 
| d | <code>Vec2</code> | 
| bb | <code>Box2Abs</code> | 

<a name="circleToEllipse"></a>

## ~~circleToEllipse(ketItem)~~
***Deprecated***

**Kind**: global function  

| Param |
| --- |
| ketItem | 

