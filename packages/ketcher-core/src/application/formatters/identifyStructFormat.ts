import { SupportedFormat } from './structFormatter.types'

export function identifyStructFormat(
  stringifiedStruct: string
): SupportedFormat {
  // Mimic Indigo/molecule_auto_loader.cpp as much as possible
  const sanitizedString = stringifiedStruct.trim()

  try {
    if (JSON.parse(sanitizedString)) {
      return 'graph'
    }
  } catch (er) {} // eslint-disable-line

  if (sanitizedString.indexOf('$RXN') !== -1) {
    return 'rxn'
  }

  const match = sanitizedString.match(/^(M {2}END|\$END MOL)$/m)

  if (match) {
    const end = (match.index || 0) + match[0].length
    if (
      end === sanitizedString.length ||
      sanitizedString.slice(end, end + 20).search(/^\$(MOL|END CTAB)$/m) !== -1
    ) {
      return 'mol'
    }
  }
  if (
    sanitizedString[0] === '<' &&
    sanitizedString.indexOf('<molecule') !== -1
  ) {
    return 'cml'
  }

  if (sanitizedString.slice(0, 5) === 'InChI') {
    return 'inChI'
  }

  if (sanitizedString.indexOf('\n') === -1) {
    // TODO: smiles regexp
    return 'smiles'
  }

  // Molfile by default as Indigo does
  return 'mol'
}
