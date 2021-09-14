const LIST = ['Bn', 'Bz', 'Et', 'PO3'] // Temp data, should be removed

export class FunctionalGroupsProvider {
  private static instance: FunctionalGroupsProvider
  functionalGroupsList: string[]
  constructor() {
    this.functionalGroupsList = []
  }

  public static getInstance(): FunctionalGroupsProvider {
    if (!FunctionalGroupsProvider.instance) {
      FunctionalGroupsProvider.instance = new FunctionalGroupsProvider()
    }
    return FunctionalGroupsProvider.instance
  }
  async fetchFunctionalGroupsList() {
    //simulation of fetching data
    if (this.fetchFunctionalGroupsList.length === 0) {
      Promise.resolve(LIST).then(response => {
        this.functionalGroupsList = response
      })
    }
  }

  public getFunctionalGroupsList() {
    return this.functionalGroupsList
  }
}
