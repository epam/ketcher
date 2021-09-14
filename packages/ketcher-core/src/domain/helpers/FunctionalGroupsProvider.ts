const LIST = ['Bn', 'Bz', 'Et', 'PO3'] // Temp data, should be removed

export class FunctionalGroupsProvider {
  functionalGroupsList: string[] = LIST

  // TO DO update fetch and find place to trigger
  // private async fetchFunctionalGroupsList() {

  // }

  public getFunctionalGroupsList() {
    return this.functionalGroupsList
  }
}
