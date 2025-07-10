export enum TypeOption {
  Data = 'Data-option',
  MultipleGroup = 'Multiple group-option',
  SRUPolymer = 'SRU polymer-option',
  Superatom = 'Superatom-option',
  QueryComponent = 'Query component-option',
  NucleotideComponent = 'Nucleotide Component-option',
}

export enum ContextOption {
  Atom = 'Atom-option',
  Bond = 'Bond-option',
  Fragment = 'Fragment-option',
  Group = 'Group-option',
  Multifragment = 'Multifragment-option',
}

export enum PropertyLabelType {
  Absolute = 'radiobuttons-input-Absolute',
  Relative = 'radiobuttons-input-Relative',
  Attached = 'radiobuttons-input-Attached',
}

export enum RepeatPatternOption {
  HeadToTail = 'Head-to-tail-option',
  HeadToHead = 'Head-to-head-option',
  EitherUnknown = 'Either unknown-option',
}

export enum ComponentOption {
  Sugar = 'Sugar-option',
  Base = 'Base-option',
  Phosphate = 'Phosphate-option',
}

export type SGroupPropertiesSettings =
  | {
      Type: TypeOption.Data;
      Context: ContextOption;
      FieldName: string;
      FieldValue: string;
      PropertyLabelType: PropertyLabelType;
    }
  | {
      Type: TypeOption.MultipleGroup;
      RepeatCount: string;
    }
  | {
      Type: TypeOption.SRUPolymer;
      PolymerLabel: string;
      RepeatPattern: RepeatPatternOption;
    }
  | {
      Type: TypeOption.Superatom;
      Name: string;
    }
  | {
      Type: TypeOption.QueryComponent;
    }
  | {
      Type: TypeOption.NucleotideComponent;
      Component: ComponentOption;
    };
