# Snake Layout

> How macromolecules and small molecules are arranged in Snake mode.

Snake mode arranges polymer chains and small molecules in rows based on the configured editor line length. `SnakeLayoutModel` packs the nodes into rows, and `DrawingEntitiesManager.applySnakeLayout()` creates a Command of reversible operations to position them.

Small molecules connected to monomers are placed alongside the corresponding chain, while unconnected molecules are appended after the chain nodes and may continue onto additional rows. Molecules in the same row are vertically centered relative to that row's tallest molecule.
