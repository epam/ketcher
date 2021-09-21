const LIST = [
  'Ac',
  'Bn',
  'Bu',
  'Bz',
  'C2H5',
  'CCl3',
  'CF3',
  'CO2Et',
  'CO2H',
  'CO2Me',
  'CO2Pr',
  'Cp',
  'CPh3',
  'Et',
  'iBu',
  'Indole',
  'iPr',
  'Me',
  'Ms',
  'NCO',
  'NCS',
  'NHPh',
  'OCN',
  'OEt',
  'OMe',
  'Ph',
  'PhCOOH',
  'PO2',
  'PO3',
  'PO4',
  'Pr',
  'sBu',
  'SCN',
  'SO2',
  'SO2Cl',
  'SO3',
  'SO4',
  'tBu',
  'Tf',
  'Ts'
] // Temp data, should be removed after adding SDF for functional groups

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
