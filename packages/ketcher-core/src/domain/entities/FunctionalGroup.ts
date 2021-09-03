export class FunctionalGroup {
  name: string
  relatedSGroupId: number
  isExpanded?: boolean

  constructor(name: string, relatedSGroupId: number, isExpanded: boolean) {
    this.name = name
    this.relatedSGroupId = relatedSGroupId
    this.isExpanded = isExpanded
  }

  static isFunctionalGroup(
    sGroupName: string,
    functionalGroupsList: string[]
  ): boolean {
    return functionalGroupsList.includes(sGroupName)
  }
}
