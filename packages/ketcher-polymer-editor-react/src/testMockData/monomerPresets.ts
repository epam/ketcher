import { MonomerItemType, Struct } from 'ketcher-core';

// you can add other props in monomers, if you need them
export const monomers: MonomerItemType[] = [
  {
    props: {
      MonomerName: '12ddR',
      Name: "1',2'-Di-Deoxy-Ribose",
      MonomerNaturalAnalogCode: '',
      MonomerType: '',
      BranchMonomer: '',
      MonomerCaps: '',
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
      MonomerCaps: '',
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
      MonomerCaps: '',
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
      MonomerCaps: '',
      MonomerCode: '',
    },
    label: '',
    struct: new Struct(),
  },
];

const phosphate = {
  props: {
    MonomerName: 'P',
    Name: 'Phosphate',
    MonomerNaturalAnalogCode: '',
    MonomerType: '',
    BranchMonomer: '',
    MonomerCaps: '',
    MonomerCode: '',
  },
  label: '',
  struct: new Struct(),
};
const ribose = {
  props: {
    MonomerName: 'R',
    Name: 'Ribose',
    MonomerNaturalAnalogCode: '',
    MonomerType: '',
    BranchMonomer: '',
    MonomerCaps: '',
    MonomerCode: '',
  },
  label: '',
  struct: new Struct(),
};
const thymine = {
  props: {
    MonomerName: 'T',
    Name: 'Thymine',
    MonomerNaturalAnalogCode: '',
    MonomerType: '',
    BranchMonomer: '',
    MonomerCaps: '',
    MonomerCode: '',
  },
  label: '',
  struct: new Struct(),
};
const cytosine = {
  props: {
    MonomerName: 'C',
    Name: 'Cytosine',
    MonomerNaturalAnalogCode: '',
    MonomerType: '',
    BranchMonomer: '',
    MonomerCaps: '',
    MonomerCode: '',
  },
  label: '',
  struct: new Struct(),
};
const uracil = {
  props: {
    MonomerName: 'U',
    Name: 'Uracil',
    MonomerNaturalAnalogCode: '',
    MonomerType: '',
    BranchMonomer: '',
    MonomerCaps: '',
    MonomerCode: '',
  },
  label: '',
  struct: new Struct(),
};
const adenine = {
  props: {
    MonomerName: 'A',
    Name: 'Adenine',
    MonomerNaturalAnalogCode: '',
    MonomerType: '',
    BranchMonomer: '',
    MonomerCaps: '',
    MonomerCode: '',
  },
  label: '',
  struct: new Struct(),
};
const guanine = {
  props: {
    MonomerName: 'G',
    Name: 'Guanine',
    MonomerNaturalAnalogCode: '',
    MonomerType: '',
    BranchMonomer: '',
    MonomerCaps: '',
    MonomerCode: '',
  },
  label: '',
  struct: new Struct(),
};

export { phosphate, ribose, cytosine, guanine, thymine, uracil, adenine };
