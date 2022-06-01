## Classes

<dl>
<dt><a href="#KetcherBuilder">KetcherBuilder</a></dt>
<dd></dd>
<dt><a href="#Struct">Struct</a></dt>
<dd></dd>
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
<a name="new_KetcherBuilder_new"></a>

### new \_structServiceProvider()
<p>Builder class.</p>

<a name="Struct"></a>

## Struct
**Kind**: global class  
<a name="new_Struct_new"></a>

### new Struct()
<p>Class, describing structure on canvas.</p>

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

