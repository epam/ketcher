import { PeriodicTableElement } from '../periodicTableDialog/Constants';

export const enum AtomType {
  Single = 'Single-option',
  List = 'List-option',
  Special = 'Special-option',
}

export enum Valence {
  Empty = '-option',
  Zero = '0-option',
  One = 'I-option',
  Two = 'II-option',
  Three = 'III-option',
  Four = 'IV-option',
  Five = 'V-option',
  Six = 'VI-option',
  Seven = 'VII-option',
  Eight = 'VIII-option',
}

export const enum Radical {
  Empty = '-option',
  Monoradical = 'Monoradical-option',
  Diradical_Singlet = 'Diradical (singlet)-option',
  Diradical_Triplet = 'Diradical (triplet)-option',
}

export const enum RingBondCount {
  Empty = '-option',
  As_Drawn = 'As drawn-option',
  Zero = '0-option',
  Two = '2-option',
  Three = '3-option',
  Four = '4-option',
  Five = '5-option',
  Six = '6-option',
  Seven = '7-option',
  Eight = '8-option',
  Nine = '9-option',
}

export const enum HCount {
  Empty = '-option',
  Zero = '0-option',
  One = '1-option',
  Two = '2-option',
  Three = '3-option',
  Four = '4-option',
  Five = '5-option',
  Six = '6-option',
  Seven = '7-option',
  Eight = '8-option',
  Nine = '9-option',
}

export const enum SubstitutionCount {
  Empty = '-option',
  As_Drawn = 'As drawn-option',
  Zero = '0-option',
  One = '1-option',
  Two = '2-option',
  Three = '3-option',
  Four = '4-option',
  Five = '5-option',
  Six = '6-option',
  Seven = '7-option',
  Eight = '8-option',
  Nine = '9-option',
}

export const enum Aromaticity {
  Empty = '-option',
  Aromatic = 'aromatic-option',
  Aliphatic = 'aliphatic-option',
}

export const enum ImplicitHCount {
  Empty = '-option',
  Zero = '0-option',
  One = '1-option',
  Two = '2-option',
  Three = '3-option',
  Four = '4-option',
  Five = '5-option',
  Six = '6-option',
  Seven = '7-option',
  Eight = '8-option',
  Nine = '9-option',
}

export const enum RingMembership {
  Empty = '-option',
  Zero = '0-option',
  One = '1-option',
  Two = '2-option',
  Three = '3-option',
  Four = '4-option',
  Five = '5-option',
  Six = '6-option',
  Seven = '7-option',
  Eight = '8-option',
  Nine = '9-option',
}

export const enum RingSize {
  Empty = '-option',
  Zero = '0-option',
  One = '1-option',
  Two = '2-option',
  Three = '3-option',
  Four = '4-option',
  Five = '5-option',
  Six = '6-option',
  Seven = '7-option',
  Eight = '8-option',
  Nine = '9-option',
}

export const enum Connectivity {
  Empty = '-option',
  Zero = '0-option',
  One = '1-option',
  Two = '2-option',
  Three = '3-option',
  Four = '4-option',
  Five = '5-option',
  Six = '6-option',
  Seven = '7-option',
  Eight = '8-option',
  Nine = '9-option',
}

export const enum Chirality {
  Empty = '-option',
  Clockwise = 'clockwise-option',
  Anticlockwise = 'anticlockwise-option',
}

export const enum Inversion {
  Empty = '-option',
  Inverts = 'Inverts-option',
  Retains = 'Retains-option',
}

export type GeneralPropertiesSettings = {
  AtomType?: AtomType.Single;
  NotListCheckbox?: string;
  Label?: string;
  List?: {
    AtomsList: PeriodicTableElement[];
    selectAtoms: (atomsList: PeriodicTableElement[]) => Promise<void>;
  };
  Special?: string;
  Alias?: string;
  Charge?: string;
  Isotope?: string;
  Valence?: Valence;
  Radical?: Radical;
};

export type QuerySpecificPropertiesSettings = {
  RingBondCount?: RingBondCount;
  HCount?: HCount;
  SubstitutionCount?: SubstitutionCount;
  UnsaturatedCheckbox?: boolean;
  Aromaticity?: Aromaticity;
  ImplicitHCount?: ImplicitHCount;
  RingMembership?: RingMembership;
  RingSize?: RingSize;
  Connectivity?: Connectivity;
  Chirality?: Chirality;
};

export type ReactionFlagsPropertiesSettings = {
  Inversion?: Inversion;
  ExactChangeCheckbox?: boolean;
};

export type CustomQueryPropertiesSettings = {
  CustomQueryCheckbox?: boolean;
  CustomQueryTextArea?: string;
};

export type AtomPropertiesSettings = {
  GeneralProperties?: GeneralPropertiesSettings;
  QuerySpecificProperties?: QuerySpecificPropertiesSettings;
  ReactionFlags?: ReactionFlagsPropertiesSettings;
  CustomQuery?: CustomQueryPropertiesSettings;
};
