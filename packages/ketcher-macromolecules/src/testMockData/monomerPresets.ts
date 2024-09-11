import {
  AttachmentPointName,
  KetConnectionType,
  KetMonomerClass,
  KetMonomerGroupTemplateClass,
  KetTemplateType,
  MonomerItemType,
  Struct,
} from 'ketcher-core';

// you can add other props in monomers, if you need them
export const monomers: MonomerItemType[] = [
  {
    props: {
      MonomerName: '12ddR',
      Name: "1',2'-Di-Deoxy-Ribose",
      MonomerNaturalAnalogCode: '',
      MonomerType: '',
      BranchMonomer: '',
      MonomerCaps: {},
      MonomerCode: '',
    },
    label: '',
    struct: new Struct(),
  },
  {
    props: {
      MonomerName: '3A6',
      Name: "6-amino-hexanol (3' end)",
      MonomerNaturalAnalogCode: '',
      MonomerType: '',
      BranchMonomer: '',
      MonomerCaps: {},
      MonomerCode: '',
    },
    label: '',
    struct: new Struct(),
  },
  {
    props: {
      MonomerName: '3FAM',
      Name: '3-FAM',
      MonomerNaturalAnalogCode: '',
      MonomerType: '',
      BranchMonomer: '',
      MonomerCaps: {},
      MonomerCode: '',
    },
    label: '',
    struct: new Struct(),
  },
  {
    props: {
      MonomerName: '4sR',
      Name: '4-Thio-Ribose',
      MonomerNaturalAnalogCode: '',
      MonomerType: '',
      BranchMonomer: '',
      MonomerCaps: {},
      MonomerCode: '',
    },
    label: '',
    struct: new Struct(),
  },
];

export const preset = {
  base: {
    struct: {
      atoms: {
        nextId: 9,
      },
      bonds: {
        nextId: 9,
      },
      sgroups: {
        nextId: 0,
      },
      halfBonds: {
        nextId: 0,
      },
      loops: {
        nextId: 0,
      },
      isReaction: false,
      rxnArrows: {
        nextId: 0,
      },
      rxnPluses: {
        nextId: 0,
      },
      frags: {
        nextId: 1,
      },
      rgroups: {
        nextId: 0,
      },
      rgroupAttachmentPoints: {
        nextId: 0,
      },
      name: 'Uracil',
      abbreviation: '',
      sGroupForest: {
        parent: {},
        children: {},
        atomSets: {},
      },
      simpleObjects: {
        nextId: 0,
      },
      texts: {
        nextId: 0,
      },
      functionalGroups: {
        nextId: 0,
      },
      highlights: {
        nextId: 0,
      },
    },
    props: {
      Name: 'Uracil',
      MonomerType: 'RNA',
      MonomerName: 'U',
      MonomerCode: 'U',
      MonomerNaturalAnalogCode: 'U',
      BranchMonomer: 'true',
      MonomerCaps: {
        R1: 'H',
      },
    },
    favorite: false,
    label: 'U',
  },
  sugar: {
    struct: {
      atoms: {
        nextId: 12,
      },
      bonds: {
        nextId: 12,
      },
      sgroups: {
        nextId: 0,
      },
      halfBonds: {
        nextId: 0,
      },
      loops: {
        nextId: 0,
      },
      isReaction: false,
      rxnArrows: {
        nextId: 0,
      },
      rxnPluses: {
        nextId: 0,
      },
      frags: {
        nextId: 1,
      },
      rgroups: {
        nextId: 0,
      },
      rgroupAttachmentPoints: {
        nextId: 0,
      },
      name: 'Ribose',
      abbreviation: '',
      sGroupForest: {
        parent: {},
        children: {},
        atomSets: {},
      },
      simpleObjects: {
        nextId: 0,
      },
      texts: {
        nextId: 0,
      },
      functionalGroups: {
        nextId: 0,
      },
      highlights: {
        nextId: 0,
      },
    },
    props: {
      Name: 'Ribose',
      MonomerType: 'RNA',
      MonomerName: 'R',
      MonomerCode: 'R',
      MonomerNaturalAnalogCode: 'R',
      BranchMonomer: 'false',
      MonomerCaps: {
        R1: 'H',
        R2: 'H',
        R3: 'O',
      },
    },
    favorite: false,
    label: 'R',
  },
  phosphate: {
    struct: {
      atoms: {
        nextId: 5,
      },
      bonds: {
        nextId: 4,
      },
      sgroups: {
        nextId: 0,
      },
      halfBonds: {
        nextId: 0,
      },
      loops: {
        nextId: 0,
      },
      isReaction: false,
      rxnArrows: {
        nextId: 0,
      },
      rxnPluses: {
        nextId: 0,
      },
      frags: {
        nextId: 1,
      },
      rgroups: {
        nextId: 0,
      },
      rgroupAttachmentPoints: {
        nextId: 0,
      },
      name: 'Phosphate',
      abbreviation: '',
      sGroupForest: {
        parent: {},
        children: {},
        atomSets: {},
      },
      simpleObjects: {
        nextId: 0,
      },
      texts: {
        nextId: 0,
      },
      functionalGroups: {
        nextId: 0,
      },
      highlights: {
        nextId: 0,
      },
    },
    props: {
      Name: 'Phosphate',
      MonomerType: 'RNA',
      MonomerName: 'P',
      MonomerCode: 'P',
      MonomerNaturalAnalogCode: 'P',
      BranchMonomer: 'false',
      MonomerCaps: {
        R1: 'O',
        R2: 'O',
      },
    },
    favorite: false,
    label: 'P',
  },
  name: 'U',
  default: true,
};

const phosphate = {
  props: {
    MonomerName: 'P',
    Name: 'Phosphate',
    MonomerNaturalAnalogCode: 'P',
    MonomerType: '',
    MonomerClass: KetMonomerClass.Phosphate,
    BranchMonomer: '',
    MonomerCaps: {},
    MonomerCode: '',
  },
  label: 'P',
  struct: new Struct(),
};
const ribose = {
  props: {
    MonomerName: 'R',
    Name: 'Ribose',
    MonomerNaturalAnalogCode: 'R',
    MonomerType: '',
    MonomerClass: KetMonomerClass.Sugar,
    BranchMonomer: '',
    MonomerCaps: {},
    MonomerCode: '',
  },
  label: 'R',
  struct: new Struct(),
};
const thymine = {
  props: {
    MonomerName: 'T',
    Name: 'Thymine',
    MonomerNaturalAnalogCode: 'T',
    MonomerType: '',
    MonomerClass: KetMonomerClass.Base,
    BranchMonomer: '',
    MonomerCaps: {},
    MonomerCode: '',
  },
  label: 'T',
  struct: new Struct(),
};
const cytosine = {
  props: {
    MonomerName: 'C',
    Name: 'Cytosine',
    MonomerNaturalAnalogCode: 'C',
    MonomerType: '',
    MonomerClass: KetMonomerClass.Base,
    BranchMonomer: '',
    MonomerCaps: {},
    MonomerCode: '',
  },
  label: '',
  struct: new Struct(),
};
const uracil = {
  props: {
    MonomerName: 'U',
    Name: 'Uracil',
    MonomerNaturalAnalogCode: 'U',
    MonomerType: '',
    MonomerClass: KetMonomerClass.Base,
    BranchMonomer: '',
    MonomerCaps: {},
    MonomerCode: '',
  },
  label: '',
  struct: new Struct(),
};
const adenine = {
  props: {
    MonomerName: 'A',
    Name: 'Adenine',
    MonomerNaturalAnalogCode: 'A',
    MonomerType: '',
    MonomerClass: KetMonomerClass.Base,
    BranchMonomer: '',
    MonomerCaps: {},
    MonomerCode: '',
  },
  label: '',
  struct: new Struct(),
};
const guanine = {
  props: {
    MonomerName: 'G',
    Name: 'Guanine',
    MonomerNaturalAnalogCode: 'G',
    MonomerType: '',
    MonomerClass: KetMonomerClass.Base,
    BranchMonomer: '',
    MonomerCaps: {},
    MonomerCode: '',
  },
  label: 'G',
  struct: new Struct(),
};

const rnaPresetsTemplates = [
  {
    type: KetTemplateType.MONOMER_GROUP_TEMPLATE,
    id: 'A',
    name: 'A',
    class: KetMonomerGroupTemplateClass.RNA,
    templates: [
      {
        $ref: 'monomerTemplate-R___Ribose',
      },
      {
        $ref: 'monomerTemplate-A___Adenine',
      },
      {
        $ref: 'monomerTemplate-P___Phosphate',
      },
    ],
    connections: [
      {
        connectionType: KetConnectionType.SINGLE,
        endpoint1: {
          monomerTemplateId: 'monomerTemplate-A___Adenine',
          attachmentPointId: AttachmentPointName.R1,
        },
        endpoint2: {
          monomerTemplateId: 'monomerTemplate-R___Ribose',
          attachmentPointId: AttachmentPointName.R3,
        },
      },
      {
        connectionType: KetConnectionType.SINGLE,
        endpoint1: {
          monomerTemplateId: 'monomerTemplate-R___Ribose',
          attachmentPointId: AttachmentPointName.R2,
        },
        endpoint2: {
          monomerTemplateId: 'monomerTemplate-P___Phosphate',
          attachmentPointId: AttachmentPointName.R1,
        },
      },
    ],
  },
  {
    type: KetTemplateType.MONOMER_GROUP_TEMPLATE,
    id: 'C',
    name: 'C',
    class: KetMonomerGroupTemplateClass.RNA,
    templates: [
      {
        $ref: 'monomerTemplate-R___Ribose',
      },
      {
        $ref: 'monomerTemplate-C___Cytosine',
      },
      {
        $ref: 'monomerTemplate-P___Phosphate',
      },
    ],
    connections: [
      {
        connectionType: KetConnectionType.SINGLE,
        endpoint1: {
          monomerTemplateId: 'monomerTemplate-C___Cytosine',
          attachmentPointId: AttachmentPointName.R1,
        },
        endpoint2: {
          monomerTemplateId: 'monomerTemplate-R___Ribose',
          attachmentPointId: AttachmentPointName.R3,
        },
      },
      {
        connectionType: KetConnectionType.SINGLE,
        endpoint1: {
          monomerTemplateId: 'monomerTemplate-R___Ribose',
          attachmentPointId: AttachmentPointName.R2,
        },
        endpoint2: {
          monomerTemplateId: 'monomerTemplate-P___Phosphate',
          attachmentPointId: AttachmentPointName.R1,
        },
      },
    ],
  },
  {
    type: KetTemplateType.MONOMER_GROUP_TEMPLATE,
    id: 'G',
    name: 'G',
    class: KetMonomerGroupTemplateClass.RNA,
    templates: [
      {
        $ref: 'monomerTemplate-R___Ribose',
      },
      {
        $ref: 'monomerTemplate-G___Guanine',
      },
      {
        $ref: 'monomerTemplate-P___Phosphate',
      },
    ],
    connections: [
      {
        connectionType: KetConnectionType.SINGLE,
        endpoint1: {
          monomerTemplateId: 'monomerTemplate-G___Guanine',
          attachmentPointId: AttachmentPointName.R1,
        },
        endpoint2: {
          monomerTemplateId: 'monomerTemplate-R___Ribose',
          attachmentPointId: AttachmentPointName.R3,
        },
      },
      {
        connectionType: KetConnectionType.SINGLE,
        endpoint1: {
          monomerTemplateId: 'monomerTemplate-R___Ribose',
          attachmentPointId: AttachmentPointName.R2,
        },
        endpoint2: {
          monomerTemplateId: 'monomerTemplate-P___Phosphate',
          attachmentPointId: AttachmentPointName.R1,
        },
      },
    ],
  },
  {
    type: KetTemplateType.MONOMER_GROUP_TEMPLATE,
    id: 'T',
    name: 'T',
    class: KetMonomerGroupTemplateClass.RNA,
    templates: [
      {
        $ref: 'monomerTemplate-R___Ribose',
      },
      {
        $ref: 'monomerTemplate-T___Thymine',
      },
      {
        $ref: 'monomerTemplate-P___Phosphate',
      },
    ],
    connections: [
      {
        connectionType: KetConnectionType.SINGLE,
        endpoint1: {
          monomerTemplateId: 'monomerTemplate-T___Thymine',
          attachmentPointId: AttachmentPointName.R1,
        },
        endpoint2: {
          monomerTemplateId: 'monomerTemplate-R___Ribose',
          attachmentPointId: AttachmentPointName.R3,
        },
      },
      {
        connectionType: KetConnectionType.SINGLE,
        endpoint1: {
          monomerTemplateId: 'monomerTemplate-R___Ribose',
          attachmentPointId: AttachmentPointName.R2,
        },
        endpoint2: {
          monomerTemplateId: 'monomerTemplate-P___Phosphate',
          attachmentPointId: AttachmentPointName.R1,
        },
      },
    ],
  },
  {
    type: KetTemplateType.MONOMER_GROUP_TEMPLATE,
    id: 'U',
    name: 'U',
    class: KetMonomerGroupTemplateClass.RNA,
    templates: [
      {
        $ref: 'monomerTemplate-R___Ribose',
      },
      {
        $ref: 'monomerTemplate-U___Uracil',
      },
      {
        $ref: 'monomerTemplate-P___Phosphate',
      },
    ],
    connections: [
      {
        connectionType: KetConnectionType.SINGLE,
        endpoint1: {
          monomerTemplateId: 'monomerTemplate-U___Uracil',
          attachmentPointId: AttachmentPointName.R1,
        },
        endpoint2: {
          monomerTemplateId: 'monomerTemplate-R___Ribose',
          attachmentPointId: AttachmentPointName.R3,
        },
      },
      {
        connectionType: KetConnectionType.SINGLE,
        endpoint1: {
          monomerTemplateId: 'monomerTemplate-R___Ribose',
          attachmentPointId: AttachmentPointName.R2,
        },
        endpoint2: {
          monomerTemplateId: 'monomerTemplate-P___Phosphate',
          attachmentPointId: AttachmentPointName.R1,
        },
      },
    ],
  },
];

export {
  phosphate,
  ribose,
  cytosine,
  guanine,
  thymine,
  uracil,
  adenine,
  rnaPresetsTemplates,
};
