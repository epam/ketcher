export function cancelSelecting(self, lassoHelper) {
  if (self.dragCtx && self.dragCtx.stopTapping) self.dragCtx.stopTapping()

  if (self.dragCtx && self.dragCtx.action) {
    const action = self.dragCtx.action
    self.editor.update(action)
  }
  if (lassoHelper.running()) self.editor.selection(lassoHelper.end())

  delete self.dragCtx

  self.editor.hover(null)
}
