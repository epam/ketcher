var result = {}
var tables = ``

function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function capitalizeShortcut(str) {
  const ks = ['shift', 'alt', 'ctrl', 'mod', 'escape', 'backspace', 'space']
  if (ks.some((k) => str.toLowerCase().startsWith(k))) {
    return capitalizeFirstLetter(str)
  }
}

Object.entries(keys).forEach(([sectionName, section]) => {
  result[sectionName] = {}
  Object.entries(section).forEach(([k, v]) => {
    if (v.shortcut) {
      result[sectionName][k] = {
        shortcut: v.shortcut,
        title: v.title || k
      }
    }
  })
})

const space = (str) => ` ${str} `

Object.entries(result).forEach(([sectionName, section]) => {
  tables += `*${capitalizeFirstLetter(sectionName)}*\n`
  tables += `| Shortcut | Action | Description |\n`
  tables += `| --- | --- | --- |\n`
  Object.entries(section)?.forEach(([k, v]) => {
    tables += '|'
    tables += Array.isArray(v.shortcut)
      ? space(v.shortcut.join(', '))
      : space(v.shortcut)
    tables += '|'
    tables += space(v.title)
    tables += '| - |\n'
  })
  tables += '\n\n'
})

var keys = {
  general: {
    clear: {
      shortcut: 'Mod+Delete',
      title: 'Clear Canvas',
      action: {}
    },
    open: {
      shortcut: 'Mod+o',
      title: 'Open…',
      action: {
        dialog: 'open'
      }
    },
    save: {
      shortcut: 'Mod+s',
      title: 'Save As…',
      action: {
        dialog: 'save'
      }
    },
    undo: {
      shortcut: 'Mod+z',
      title: 'Undo'
    },
    redo: {
      shortcut: ['Mod+Shift+z', 'Mod+y'],
      title: 'Redo'
    },
    cut: {
      shortcut: 'Mod+x',
      title: 'Cut'
    },
    copies: {},
    copy: {
      shortcut: 'Mod+c',
      title: 'Copy'
    },
    'copy-image': {
      shortcut: 'Mod+Shift+f',
      title: 'Copy Image'
    },
    'copy-mol': {
      shortcut: 'Mod+m',
      title: 'Copy as MOL'
    },
    'copy-ket': {
      shortcut: 'Mod+Shift+k',
      title: 'Copy as KET'
    },
    paste: {
      shortcut: 'Mod+v',
      title: 'Paste'
    },
    settings: {
      title: 'Settings',
      action: {
        dialog: 'settings'
      }
    },
    about: {
      title: 'About',
      action: {
        dialog: 'about'
      }
    },
    'reaction-automap': {
      title: 'Reaction Auto-Mapping Tool',
      action: {
        dialog: 'automap'
      }
    },
    'period-table': {
      title: 'Periodic Table',
      action: {
        dialog: 'period-table'
      }
    },
    'extended-table': {
      title: 'Extended Table',
      action: {
        dialog: 'extended-table'
      }
    },
    'select-all': {
      title: 'Select All',
      shortcut: 'Mod+a',
      action: {}
    },
    'deselect-all': {
      title: 'Deselect All',
      shortcut: 'Mod+Shift+a'
    },
    'select-descriptors': {
      title: 'Select descriptors',
      shortcut: 'Mod+d',
      action: {}
    },
    'any-atom': {
      title: 'Any atom',
      action: {
        tool: 'atom',
        opts: {
          label: 'A',
          pseudo: 'A',
          type: 'gen'
        }
      }
    }
  },
  server: {
    layout: {
      shortcut: 'Mod+l',
      title: 'Layout',
      action: {}
    },
    clean: {
      shortcut: 'Mod+Shift+l',
      title: 'Clean Up',
      action: {}
    },
    arom: {
      title: 'Aromatize',
      action: {}
    },
    dearom: {
      title: 'Dearomatize',
      action: {}
    },
    cip: {
      shortcut: 'Mod+p',
      title: 'Calculate CIP',
      action: {}
    },
    check: {
      title: 'Check Structure',
      action: {
        dialog: 'check'
      }
    },
    analyse: {
      title: 'Calculated Values',
      action: {
        dialog: 'analyse'
      }
    },
    recognize: {
      title: 'Recognize Molecule',
      action: {
        dialog: 'recognize'
      }
    },
    miew: {
      title: '3D Viewer',
      action: {
        dialog: 'miew'
      }
    }
  },
  debug: {
    'force-update': {
      shortcut: 'Ctrl+Shift+r'
    },
    'qs-serialize': {
      shortcut: 'Alt+Shift+r'
    }
  },
  tools: {
    hand: {
      title: 'Hand tool',
      shortcut: 'Mod+h',
      action: {
        tool: 'hand'
      }
    },
    'select-lasso': {
      title: 'Lasso Selection',
      shortcut: 'Escape',
      action: {
        tool: 'select',
        opts: 'lasso'
      }
    },
    'select-rectangle': {
      title: 'Rectangle Selection',
      shortcut: 'Escape',
      action: {
        tool: 'select',
        opts: 'rectangle'
      }
    },
    'select-fragment': {
      title: 'Fragment Selection',
      shortcut: 'Escape',
      action: {
        tool: 'select',
        opts: 'fragment'
      }
    },
    erase: {
      title: 'Erase',
      shortcut: ['Delete', 'Backspace'],
      action: {
        tool: 'eraser',
        opts: 1
      }
    },
    chain: {
      title: 'Chain',
      action: {
        tool: 'chain'
      }
    },
    'enhanced-stereo': {
      shortcut: 'Alt+e',
      title: 'Stereochemistry',
      action: {
        tool: 'enhancedStereo'
      }
    },
    'charge-plus': {
      shortcut: '5',
      title: 'Charge Plus',
      action: {
        tool: 'charge',
        opts: 1
      }
    },
    'charge-minus': {
      shortcut: '5',
      title: 'Charge Minus',
      action: {
        tool: 'charge',
        opts: -1
      }
    },
    transforms: {},
    'transform-rotate': {
      shortcut: 'Alt+r',
      title: 'Rotate Tool',
      action: {
        tool: 'rotate'
      }
    },
    'transform-flip-h': {
      shortcut: 'Alt+h',
      title: 'Horizontal Flip',
      action: {
        tool: 'rotate',
        opts: 'horizontal'
      }
    },
    'transform-flip-v': {
      shortcut: 'Alt+v',
      title: 'Vertical Flip',
      action: {
        tool: 'rotate',
        opts: 'vertical'
      }
    },
    sgroup: {
      shortcut: 'Mod+g',
      title: 'S-Group',
      action: {
        tool: 'sgroup'
      }
    },
    'sgroup-data': {
      shortcut: 'Mod+g',
      title: 'Data S-Group',
      action: {
        tool: 'sgroup',
        opts: 'DAT'
      }
    },
    arrows: {},
    'reaction-arrow-open-angle': {
      title: 'Arrow Open Angle Tool',
      action: {
        tool: 'reactionarrow',
        opts: 'open-angle'
      }
    },
    'reaction-arrow-filled-triangle': {
      title: 'Arrow Filled Triangle',
      action: {
        tool: 'reactionarrow',
        opts: 'filled-triangle'
      }
    },
    'reaction-arrow-filled-bow': {
      title: 'Arrow Filled Bow Tool',
      action: {
        tool: 'reactionarrow',
        opts: 'filled-bow'
      }
    },
    'reaction-arrow-dashed-open-angle': {
      title: 'Arrow Dashed Open Angle Tool',
      action: {
        tool: 'reactionarrow',
        opts: 'dashed-open-angle'
      }
    },
    'reaction-arrow-failed': {
      title: 'Failed Arrow Tool',
      action: {
        tool: 'reactionarrow',
        opts: 'failed'
      }
    },
    'reaction-arrow-both-ends-filled-triangle': {
      title: 'Arrow Both Ends Filled Triangle Tool',
      action: {
        tool: 'reactionarrow',
        opts: 'both-ends-filled-triangle'
      }
    },
    'reaction-arrow-equilibrium-filled-half-bow': {
      title: 'Arrow Equilibrium Filled Half Bow Tool',
      action: {
        tool: 'reactionarrow',
        opts: 'equilibrium-filled-half-bow'
      }
    },
    'reaction-arrow-equilibrium-filled-triangle': {
      title: 'Arrow Equilibrium Filled Triangle Tool',
      action: {
        tool: 'reactionarrow',
        opts: 'equilibrium-filled-triangle'
      }
    },
    'reaction-arrow-equilibrium-open-angle': {
      title: 'Arrow Equilibrium Open Angle Tool',
      action: {
        tool: 'reactionarrow',
        opts: 'equilibrium-open-angle'
      }
    },
    'reaction-arrow-unbalanced-equilibrium-filled-half-bow': {
      title: 'Arrow Unbalanced Equilibrium Filled Half Bow Tool',
      action: {
        tool: 'reactionarrow',
        opts: 'unbalanced-equilibrium-filled-half-bow'
      }
    },
    'reaction-arrow-unbalanced-equilibrium-open-half-angle': {
      title: 'Arrow Unbalanced Equilibrium Open Half Angle Tool',
      action: {
        tool: 'reactionarrow',
        opts: 'unbalanced-equilibrium-open-half-angle'
      }
    },
    'reaction-arrow-unbalanced-equilibrium-large-filled-half-bow': {
      title: 'Arrow Unbalanced Equilibrium Large Filled Half Bow Tool',
      action: {
        tool: 'reactionarrow',
        opts: 'unbalanced-equilibrium-large-filled-half-bow'
      }
    },
    'reaction-arrow-unbalanced-equilibrium-filled-half-triangle': {
      title: 'Arrow Unbalanced Equilibrium Filled Half Triangle Tool',
      action: {
        tool: 'reactionarrow',
        opts: 'unbalanced-equilibrium-filled-half-triangle'
      }
    },
    'reaction-arrow-elliptical-arc-arrow-filled-bow': {
      title: 'Arrow Elliptical Arc Filled Bow Tool',
      action: {
        tool: 'reactionarrow',
        opts: 'elliptical-arc-arrow-filled-bow'
      }
    },
    'reaction-arrow-elliptical-arc-arrow-filled-triangle': {
      title: 'Arrow Elliptical Arc Filled Triangle Tool',
      action: {
        tool: 'reactionarrow',
        opts: 'elliptical-arc-arrow-filled-triangle'
      }
    },
    'reaction-arrow-elliptical-arc-arrow-open-angle': {
      title: 'Arrow Elliptical Arc Open Angle Tool',
      action: {
        tool: 'reactionarrow',
        opts: 'elliptical-arc-arrow-open-angle'
      }
    },
    'reaction-arrow-elliptical-arc-arrow-open-half-angle': {
      title: 'Arrow Elliptical Arc Open Half Angle Tool',
      action: {
        tool: 'reactionarrow',
        opts: 'elliptical-arc-arrow-open-half-angle'
      }
    },
    'reaction-plus': {
      title: 'Reaction Plus Tool',
      action: {
        tool: 'reactionplus'
      }
    },
    'reaction-mapping-tools': {},
    'reaction-map': {
      title: 'Reaction Mapping Tool',
      action: {
        tool: 'reactionmap'
      }
    },
    'reaction-unmap': {
      title: 'Reaction Unmapping Tool',
      action: {
        tool: 'reactionunmap'
      }
    },
    rgroup: {},
    'rgroup-label': {
      shortcut: 'Mod+r',
      title: 'R-Group Label Tool',
      action: {
        tool: 'rgroupatom'
      }
    },
    'rgroup-fragment': {
      shortcut: ['Mod+Shift+r', 'Mod+r'],
      title: 'R-Group Fragment Tool',
      action: {
        tool: 'rgroupfragment'
      }
    },
    'rgroup-attpoints': {
      shortcut: 'Mod+r',
      title: 'Attachment Point Tool',
      action: {
        tool: 'apoint'
      }
    },
    shapes: {},
    'shape-ellipse': {
      title: 'Shape Ellipse',
      action: {
        tool: 'simpleobject',
        opts: 'ellipse'
      }
    },
    'shape-rectangle': {
      title: 'Shape Rectangle',
      action: {
        tool: 'simpleobject',
        opts: 'rectangle'
      }
    },
    'shape-line': {
      title: 'Shape Line',
      action: {
        tool: 'simpleobject',
        opts: 'line'
      }
    },
    text: {
      title: 'Add text',
      action: {
        tool: 'text'
      }
    },
    bonds: {},
    'bond-single': {
      title: 'Single Bond',
      shortcut: '1',
      action: {
        tool: 'bond',
        opts: {
          type: 1,
          stereo: 0
        }
      }
    },
    'bond-up': {
      title: 'Single Up Bond',
      shortcut: '1',
      action: {
        tool: 'bond',
        opts: {
          type: 1,
          stereo: 1
        }
      }
    },
    'bond-down': {
      title: 'Single Down Bond',
      shortcut: '1',
      action: {
        tool: 'bond',
        opts: {
          type: 1,
          stereo: 6
        }
      }
    },
    'bond-updown': {
      title: 'Single Up/Down Bond',
      shortcut: '1',
      action: {
        tool: 'bond',
        opts: {
          type: 1,
          stereo: 4
        }
      }
    },
    'bond-double': {
      title: 'Double Bond',
      shortcut: '2',
      action: {
        tool: 'bond',
        opts: {
          type: 2,
          stereo: 0
        }
      }
    },
    'bond-crossed': {
      title: 'Double Cis/Trans Bond',
      shortcut: '2',
      action: {
        tool: 'bond',
        opts: {
          type: 2,
          stereo: 3
        }
      }
    },
    'bond-triple': {
      title: 'Triple Bond',
      shortcut: '3',
      action: {
        tool: 'bond',
        opts: {
          type: 3,
          stereo: 0
        }
      }
    },
    'bond-aromatic': {
      title: 'Aromatic Bond',
      shortcut: '4',
      action: {
        tool: 'bond',
        opts: {
          type: 4,
          stereo: 0
        }
      }
    },
    'bond-any': {
      title: 'Any Bond',
      shortcut: '0',
      action: {
        tool: 'bond',
        opts: {
          type: 8,
          stereo: 0
        }
      }
    },
    'bond-hydrogen': {
      title: 'Hydrogen Bond',
      action: {
        tool: 'bond',
        opts: {
          type: 10,
          stereo: 0
        }
      }
    },
    'bond-singledouble': {
      title: 'Single/Double Bond',
      action: {
        tool: 'bond',
        opts: {
          type: 5,
          stereo: 0
        }
      }
    },
    'bond-singlearomatic': {
      title: 'Single/Aromatic Bond',
      action: {
        tool: 'bond',
        opts: {
          type: 6,
          stereo: 0
        }
      }
    },
    'bond-doublearomatic': {
      title: 'Double/Aromatic Bond',
      action: {
        tool: 'bond',
        opts: {
          type: 7,
          stereo: 0
        }
      }
    },
    'bond-dative': {
      title: 'Dative Bond',
      action: {
        tool: 'bond',
        opts: {
          type: 9,
          stereo: 0
        }
      }
    }
  },
  atoms: {
    'atom-h': {
      title: 'Atom H',
      shortcut: 'h',
      action: {
        tool: 'atom',
        opts: {
          label: 'H'
        }
      }
    },
    'atom-c': {
      title: 'Atom C',
      shortcut: 'c',
      action: {
        tool: 'atom',
        opts: {
          label: 'C'
        }
      }
    },
    'atom-n': {
      title: 'Atom N',
      shortcut: 'n',
      action: {
        tool: 'atom',
        opts: {
          label: 'N'
        }
      }
    },
    'atom-o': {
      title: 'Atom O',
      shortcut: 'o',
      action: {
        tool: 'atom',
        opts: {
          label: 'O'
        }
      }
    },
    'atom-s': {
      title: 'Atom S',
      shortcut: 's',
      action: {
        tool: 'atom',
        opts: {
          label: 'S'
        }
      }
    },
    'atom-p': {
      title: 'Atom P',
      shortcut: 'p',
      action: {
        tool: 'atom',
        opts: {
          label: 'P'
        }
      }
    },
    'atom-f': {
      title: 'Atom F',
      shortcut: 'f',
      action: {
        tool: 'atom',
        opts: {
          label: 'F'
        }
      }
    },
    'atom-cl': {
      title: 'Atom Cl',
      shortcut: 'Shift+c',
      action: {
        tool: 'atom',
        opts: {
          label: 'Cl'
        }
      }
    },
    'atom-br': {
      title: 'Atom Br',
      shortcut: 'b',
      action: {
        tool: 'atom',
        opts: {
          label: 'Br'
        }
      }
    },
    'atom-i': {
      title: 'Atom I',
      shortcut: 'i',
      action: {
        tool: 'atom',
        opts: {
          label: 'I'
        }
      }
    },
    'atom-a': {
      title: 'Atom A',
      shortcut: 'a',
      action: {
        tool: 'atom',
        opts: {
          label: 'A'
        }
      }
    },
    'atom-q': {
      title: 'Atom Q',
      shortcut: 'q',
      action: {
        tool: 'atom',
        opts: {
          label: 'Q'
        }
      }
    },
    'atom-r': {
      title: 'Atom R',
      shortcut: 'r',
      action: {
        tool: 'atom',
        opts: {
          label: 'R'
        }
      }
    },
    'atom-k': {
      title: 'Atom K',
      shortcut: 'k',
      action: {
        tool: 'atom',
        opts: {
          label: 'K'
        }
      }
    },
    'atom-m': {
      title: 'Atom M',
      shortcut: 'm',
      action: {
        tool: 'atom',
        opts: {
          label: 'M'
        }
      }
    },
    'atom-si': {
      title: 'Atom Si',
      shortcut: 'Shift+s',
      action: {
        tool: 'atom',
        opts: {
          label: 'Si'
        }
      }
    },
    'atom-na': {
      title: 'Atom Na',
      shortcut: 'Shift+n',
      action: {
        tool: 'atom',
        opts: {
          label: 'Na'
        }
      }
    },
    'atom-x': {
      title: 'Atom X',
      shortcut: 'x',
      action: {
        tool: 'atom',
        opts: {
          label: 'X'
        }
      }
    },
    'atom-d': {
      title: 'Atom D',
      shortcut: 'd',
      action: {
        tool: 'atom',
        opts: {
          label: 'D'
        }
      }
    },
    'atom-b': {
      title: 'Atom B',
      shortcut: 'Shift+b',
      action: {
        tool: 'atom',
        opts: {
          label: 'B'
        }
      }
    }
  },
  zoom: {
    zoom: {},
    'zoom-out': {
      shortcut: ['-', '_', 'Shift+-'],
      title: 'Zoom Out'
    },
    'zoom-in': {
      shortcut: ['+', '=', 'Shift+='],
      title: 'Zoom In'
    },
    'zoom-list': {}
  },
  templates: {
    'template-lib': {
      shortcut: 'Shift+t',
      title: 'Custom Templates',
      action: {
        dialog: 'templates'
      }
    },
    'template-0': {
      title: 'Benzene',
      shortcut: 't',
      action: {
        tool: 'template',
        opts: {
          struct: {
            atoms: {
              nextId: 6
            },
            bonds: {
              nextId: 6
            },
            sgroups: {
              nextId: 0
            },
            halfBonds: {
              nextId: 0
            },
            loops: {
              nextId: 0
            },
            isReaction: false,
            rxnArrows: {
              nextId: 0
            },
            rxnPluses: {
              nextId: 0
            },
            frags: {
              nextId: 0
            },
            rgroups: {
              nextId: 0
            },
            name: 'Benzene',
            sGroupForest: {
              parent: {},
              children: {},
              atomSets: {}
            },
            simpleObjects: {
              nextId: 0
            },
            texts: {
              nextId: 0
            },
            functionalGroups: {
              nextId: 0
            },
            highlights: {
              nextId: 0
            }
          }
        }
      }
    },
    'template-1': {
      title: 'Cyclopentadiene',
      shortcut: 't',
      action: {
        tool: 'template',
        opts: {
          struct: {
            atoms: {
              nextId: 5
            },
            bonds: {
              nextId: 5
            },
            sgroups: {
              nextId: 0
            },
            halfBonds: {
              nextId: 0
            },
            loops: {
              nextId: 0
            },
            isReaction: false,
            rxnArrows: {
              nextId: 0
            },
            rxnPluses: {
              nextId: 0
            },
            frags: {
              nextId: 0
            },
            rgroups: {
              nextId: 0
            },
            name: 'Cyclopentadiene',
            sGroupForest: {
              parent: {},
              children: {},
              atomSets: {}
            },
            simpleObjects: {
              nextId: 0
            },
            texts: {
              nextId: 0
            },
            functionalGroups: {
              nextId: 0
            },
            highlights: {
              nextId: 0
            }
          }
        }
      }
    },
    'template-2': {
      title: 'Cyclohexane',
      shortcut: 't',
      action: {
        tool: 'template',
        opts: {
          struct: {
            atoms: {
              nextId: 6
            },
            bonds: {
              nextId: 6
            },
            sgroups: {
              nextId: 0
            },
            halfBonds: {
              nextId: 0
            },
            loops: {
              nextId: 0
            },
            isReaction: false,
            rxnArrows: {
              nextId: 0
            },
            rxnPluses: {
              nextId: 0
            },
            frags: {
              nextId: 0
            },
            rgroups: {
              nextId: 0
            },
            name: 'Cyclohexane',
            sGroupForest: {
              parent: {},
              children: {},
              atomSets: {}
            },
            simpleObjects: {
              nextId: 0
            },
            texts: {
              nextId: 0
            },
            functionalGroups: {
              nextId: 0
            },
            highlights: {
              nextId: 0
            }
          }
        }
      }
    },
    'template-3': {
      title: 'Cyclopentane',
      shortcut: 't',
      action: {
        tool: 'template',
        opts: {
          struct: {
            atoms: {
              nextId: 5
            },
            bonds: {
              nextId: 5
            },
            sgroups: {
              nextId: 0
            },
            halfBonds: {
              nextId: 0
            },
            loops: {
              nextId: 0
            },
            isReaction: false,
            rxnArrows: {
              nextId: 0
            },
            rxnPluses: {
              nextId: 0
            },
            frags: {
              nextId: 0
            },
            rgroups: {
              nextId: 0
            },
            name: 'Cyclopentane',
            sGroupForest: {
              parent: {},
              children: {},
              atomSets: {}
            },
            simpleObjects: {
              nextId: 0
            },
            texts: {
              nextId: 0
            },
            functionalGroups: {
              nextId: 0
            },
            highlights: {
              nextId: 0
            }
          }
        }
      }
    },
    'template-4': {
      title: 'Cyclopropane',
      shortcut: 't',
      action: {
        tool: 'template',
        opts: {
          struct: {
            atoms: {
              nextId: 3
            },
            bonds: {
              nextId: 3
            },
            sgroups: {
              nextId: 0
            },
            halfBonds: {
              nextId: 0
            },
            loops: {
              nextId: 0
            },
            isReaction: false,
            rxnArrows: {
              nextId: 0
            },
            rxnPluses: {
              nextId: 0
            },
            frags: {
              nextId: 0
            },
            rgroups: {
              nextId: 0
            },
            name: 'Cyclopropane',
            sGroupForest: {
              parent: {},
              children: {},
              atomSets: {}
            },
            simpleObjects: {
              nextId: 0
            },
            texts: {
              nextId: 0
            },
            functionalGroups: {
              nextId: 0
            },
            highlights: {
              nextId: 0
            }
          }
        }
      }
    },
    'template-5': {
      title: 'Cyclobutane',
      shortcut: 't',
      action: {
        tool: 'template',
        opts: {
          struct: {
            atoms: {
              nextId: 4
            },
            bonds: {
              nextId: 4
            },
            sgroups: {
              nextId: 0
            },
            halfBonds: {
              nextId: 0
            },
            loops: {
              nextId: 0
            },
            isReaction: false,
            rxnArrows: {
              nextId: 0
            },
            rxnPluses: {
              nextId: 0
            },
            frags: {
              nextId: 0
            },
            rgroups: {
              nextId: 0
            },
            name: 'Cyclobutane',
            sGroupForest: {
              parent: {},
              children: {},
              atomSets: {}
            },
            simpleObjects: {
              nextId: 0
            },
            texts: {
              nextId: 0
            },
            functionalGroups: {
              nextId: 0
            },
            highlights: {
              nextId: 0
            }
          }
        }
      }
    },
    'template-6': {
      title: 'Cycloheptane',
      shortcut: 't',
      action: {
        tool: 'template',
        opts: {
          struct: {
            atoms: {
              nextId: 7
            },
            bonds: {
              nextId: 7
            },
            sgroups: {
              nextId: 0
            },
            halfBonds: {
              nextId: 0
            },
            loops: {
              nextId: 0
            },
            isReaction: false,
            rxnArrows: {
              nextId: 0
            },
            rxnPluses: {
              nextId: 0
            },
            frags: {
              nextId: 0
            },
            rgroups: {
              nextId: 0
            },
            name: 'Cycloheptane',
            sGroupForest: {
              parent: {},
              children: {},
              atomSets: {}
            },
            simpleObjects: {
              nextId: 0
            },
            texts: {
              nextId: 0
            },
            functionalGroups: {
              nextId: 0
            },
            highlights: {
              nextId: 0
            }
          }
        }
      }
    },
    'template-7': {
      title: 'Cyclooctane',
      shortcut: 't',
      action: {
        tool: 'template',
        opts: {
          struct: {
            atoms: {
              nextId: 8
            },
            bonds: {
              nextId: 8
            },
            sgroups: {
              nextId: 0
            },
            halfBonds: {
              nextId: 0
            },
            loops: {
              nextId: 0
            },
            isReaction: false,
            rxnArrows: {
              nextId: 0
            },
            rxnPluses: {
              nextId: 0
            },
            frags: {
              nextId: 0
            },
            rgroups: {
              nextId: 0
            },
            name: 'Cyclooctane',
            sGroupForest: {
              parent: {},
              children: {},
              atomSets: {}
            },
            simpleObjects: {
              nextId: 0
            },
            texts: {
              nextId: 0
            },
            functionalGroups: {
              nextId: 0
            },
            highlights: {
              nextId: 0
            }
          }
        }
      }
    }
  },
  functionalGroups: {
    'functional-groups': {
      shortcut: 'Shift+f',
      title: 'Functional Groups',
      action: {
        dialog: 'templates',
        prop: {
          tab: 1
        }
      }
    }
  },
  fullscreen: {
    fullscreen: {
      title: 'Fullscreen mode'
    }
  },
  help: {
    help: {
      shortcut: ['?', '&', 'Shift+/']
    }
  }
}

console.log(result)
console.log('result')
console.log(copy(tables))
