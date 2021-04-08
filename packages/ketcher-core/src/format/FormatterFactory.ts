import {
  GraphManager,
  MolSerializer,
  MolSerializerOptions,
  SmilesManager
} from 'chemistry/serializers'
import { StructService, StructServiceOptions } from 'infrastructure/services'
import {
  StructFormatter,
  SupportedFormat,
  FormatterFactoryOptions
} from './structFormatter.types'
import { GraphFormatter } from './GraphFormatter'
import { MolfileV2000Formatter } from './MolfileV2000Formatter'
import { RxnFormatter } from './RxnFormatter'
import { ServerFormatter } from './ServerFormatter'
import { SmilesFormatter } from './SmilesFormatter'

export class FormatterFactory {
  constructor(
    private readonly structService: StructService,
    private readonly graphManager: GraphManager,
    private readonly smilesManager: SmilesManager
  ) {}

  private separateOptions(
    options?: FormatterFactoryOptions
  ): [Partial<MolSerializerOptions>, StructServiceOptions | {}] {
    if (!options) {
      return [{}, {}]
    }

    const {
      reactionRelayout,
      badHeaderRecover,
      ...structServiceOptions
    } = options

    let molfileParseOptions: Partial<MolSerializerOptions> = {}

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
    options?: FormatterFactoryOptions
  ): StructFormatter {
    const [molSerializerOptions, structServiceOptions] = this.separateOptions(
      options
    )

    let formatter: StructFormatter
    switch (format) {
      case 'graph':
        formatter = new GraphFormatter(this.graphManager)
        break

      case 'mol':
        formatter = new MolfileV2000Formatter(
          new MolSerializer(molSerializerOptions)
        )
        break

      case 'rxn':
        formatter = new RxnFormatter(new MolSerializer(molSerializerOptions))
        break

      case 'smiles':
        formatter = new SmilesFormatter(
          this.smilesManager,

          // only for ServerFormatter, because 'getStructureFromStringAsync' is delegated to it

          this.structService,
          new MolSerializer(molSerializerOptions),
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
          this.structService,
          new MolSerializer(molSerializerOptions),
          format,
          structServiceOptions
        )
    }

    return formatter
  }
}
