import {
  GraphManager,
  MolfileManager,
  MolfileParseOptions,
  SmilesManager
} from '../chem'
import { StructService, StructServiceOptions } from '../infrastructure/services'
import {
  StructProvider,
  StructFormatter,
  SupportedFormat
} from './structFormatter.types'
import { GraphFormatter } from './GraphFormatter'
import { MolfileV2000Formatter } from './MolfileV2000Formatter'
import { RxnFormatter } from './RxnFormatter'
import { ServerFormatter } from './ServerFormatter'
import { SmilesFormatter } from './SmilesFormatter'

export class FormatterFactory {
  constructor(
    private readonly structProvider: StructProvider,
    private readonly structService: StructService,
    private readonly graphManager: GraphManager,
    private readonly molfileManager: MolfileManager,
    private readonly smilesManager: SmilesManager
  ) {}

  private separateOptions(
    options?:
      | MolfileParseOptions
      | StructServiceOptions
      | (MolfileParseOptions & StructServiceOptions)
  ): [MolfileParseOptions, StructServiceOptions | {}] {
    if (!options) {
      return [{}, {}]
    }

    const {
      reactionRelayout,
      badHeaderRecover,
      ...structServiceOptions
    } = options

    let molfileParseOptions: MolfileParseOptions = {}

    if (typeof reactionRelayout === 'boolean') {
      molfileParseOptions.reactionRelayout = reactionRelayout
    }
    if (typeof badHeaderRecover === 'boolean') {
      molfileParseOptions.badHeaderRecover = badHeaderRecover
    }

    return [molfileParseOptions, structServiceOptions]
  }

  create(
    format: SupportedFormat,
    options?:
      | MolfileParseOptions
      | StructServiceOptions
      | (MolfileParseOptions & StructServiceOptions)
  ): StructFormatter {
    const [molfileParseOptions, structServiceOptions] = this.separateOptions(
      options
    )

    let formatter: StructFormatter
    switch (format) {
      case 'graph':
        formatter = new GraphFormatter(this.structProvider, this.graphManager)
        break

      case 'mol':
        formatter = new MolfileV2000Formatter(
          this.structProvider,
          this.molfileManager,
          molfileParseOptions
        )
        break

      case 'rxn':
        formatter = new RxnFormatter(
          this.structProvider,
          this.molfileManager,
          molfileParseOptions
        )
        break

      case 'smiles':
        formatter = new SmilesFormatter(
          this.structProvider,
          this.smilesManager,

          // only for ServerFormatter, because 'getStructureFromStringAsync' is delegated to it

          this.structService,
          this.molfileManager,
          format,
          structServiceOptions
        )
        break

      case 'cml':
      case 'inChIAuxInfo':
      case 'inChI':
      case 'molV3000':
      case 'rxnV3000':
      case 'smilesExt':
      case 'smarts':
      default:
        formatter = new ServerFormatter(
          this.structProvider,
          this.structService,
          this.molfileManager,
          format,
          structServiceOptions
        )
    }

    return formatter
  }
}
