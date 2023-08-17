import { Struct } from 'domain/entities';

export type MonomerColorScheme = {
  regular: string;
  hover: string;
};

export type MonomerItemType = {
  label: string;
  colorScheme?: MonomerColorScheme;
  favorite?: boolean;
  struct: Struct;
  props: {
    MonomerNaturalAnalogCode: string;
    MonomerName: string;
    Name: string;
    // TODO determine whenever these props are optional or not
    BranchMonomer?: string;
    MonomerCaps?: string;
    MonomerCode?: string;
    MonomerType?: string;
  };
};

export type AttachmentPointName = 'R1' | 'R2';
