- select a monomer from library and add it to canvas (react -> editor -> render)
 -- show monomer info in react sidebar (editor -> react)
- connect two monomers on canvas (editor -> render -> editor)
- click on monomer on canvas and open its properties in the sidebar (editor -> react)
- select monomers on canvas and press delete (editor -> render)


Investigate:
- render a lot of interactive elements w/ Pixi
- setup zoom and pan library in Pixi
- add a POC for commands


- Monomer library component
  -- listmonomers from a library file
  -- user clicks on a monomer in library, the Toolbar component would emit an event or call a callback function provided by the parent component (e.g., onShapeSelected(shapeType)).

Toolbar component:

Renders the shape options (buttons, icons) for the user to select from.
Emits a shape selection event (e.g., onShapeSelected(shapeType)) when a shape option is clicked.
Editor class:

Receives the shape selection event from the Toolbar component.
Updates the selected shape type or any other relevant state within the Editor class.
Renderer class:

Contains the canvas element where the shapes will be rendered.
Receives the selected shape type from the Editor class.
Handles user interactions on the canvas (e.g., clicks, drags).
Creates a new shape instance based on the selected shape type and the user interaction coordinates.
Renders the newly created shape on the canvas.



/// RENDERING w/ COMMANDs
- User selects a shape from the toolbar by clicking on its icon.
- The toolbar tool emits a ShapeSelectedEvent with information about the selected shape.
- The Editor class receives the ShapeSelectedEvent and creates a new instance of the appropriate Tool class based on the selected shape.
- The Tool class creates a new AddShapeCommand object that contains information about the new shape to be added to the canvas.
- The AddShapeCommand object is added to the CommandHistory object, which stores a list of all the executed commands.
- The AddShapeCommand object is executed, which adds the new shape to the CanvasRenderer.
- The CanvasRenderer updates the canvas to show the new shape.
- The user can now continue to interact with the canvas and add more shapes if desired.
- If the user wants to undo the last action, they can click the "Undo" button.
- The CommandHistory object retrieves the most recent executed command (in this case, the AddShapeCommand object) and calls its undo() method.
- The AddShapeCommand object's undo() method removes the newly added shape from the CanvasRenderer.
- The CanvasRenderer updates the canvas to remove the shape.
- If the user wants to redo the last action, they can click the "Redo" button.
- The CommandHistory object retrieves the most recently undone command (in this case, the AddShapeCommand object) and calls its execute() method again.
- The AddShapeCommand object's execute() method adds the shape back to the CanvasRenderer.
- The CanvasRenderer updates the canvas to show the shape again.