import { DrawingEntity } from 'domain/entities/DrawingEntity';
import { Vec2 } from 'domain/entities/vec2';
import { Atom } from 'domain/entities/CoreAtom';
import { MonomerToAtomBondRenderer } from 'application/render/renderers/MonomerToAtomBondRenderer';
import { BaseRenderer } from 'application/render';
import { BondRenderer } from 'application/render/renderers/BondRenderer';

export class Bond extends DrawingEntity {
  public endPosition: Vec2 = new Vec2();
  public renderer: BondRenderer | undefined = undefined;
  public cycles = [];
  constructor(
    public firstAtom: Atom,
    public secondAtom: Atom,
    public type = 1,
    public stereo = 0,
  ) {
    super(firstAtom.position);
    this.endPosition = secondAtom.position;
  }

  public setRenderer(renderer: BondRenderer): void {
    super.setBaseRenderer(renderer as BaseRenderer);
    this.renderer = renderer;
  }

  public get startPosition() {
    return this.position;
  }

  public moveBondStartAbsolute(x, y) {
    this.moveAbsolute(new Vec2(x, y));
  }

  public moveBondEndAbsolute(x, y) {
    this.endPosition = new Vec2(x, y);
  }

  public moveToLinkedAtoms() {
    const firstAtomCenter = this.firstAtom.position;
    const secondAtomCenter = this.secondAtom.position;
    this.moveBondStartAbsolute(firstAtomCenter.x, firstAtomCenter.y);
    if (secondAtomCenter) {
      this.moveBondEndAbsolute(secondAtomCenter.x, secondAtomCenter.y);
    }
  }

  get loops() {
    // const loops: Atom[][] = [];
    // let atomsStack = [this.secondAtom];
    // let potentialLoops: Atom[][] = [[this.secondAtom]];
    // let newAtomsStack: Atom[] = [];
    //
    // while (atomsStack.length) {
    //   const atomsStackLength = atomsStack.length;
    //
    //   for (
    //     let atomIndexInStack = 0;
    //     atomIndexInStack < atomsStackLength;
    //     atomIndexInStack++
    //   ) {
    //     const atom = atomsStack.pop();
    //
    //     if (!atom) {
    //       continue;
    //     }
    //
    //     // end of path
    //     if (atom.bonds.length === 1) {
    //       continue;
    //     }
    //
    //     //
    //     if (atom === this.firstAtom) {
    //       loops.push(potentialLoops[atomIndexInStack]);
    //       atomsStack = [];
    //       potentialLoops = [];
    //
    //       continue;
    //     }
    //
    //     atom.bonds.forEach((bond, bondIndex) => {
    //       if (bond === this) {
    //         return;
    //       }
    //
    //       if (bondIndex === 0) {
    //         potentialLoops[atomIndexInStack].push(atom);
    //       } else {
    //         potentialLoops.push([atom]);
    //       }
    //
    //       newAtomsStack.push(
    //         bond.firstAtom === atom ? bond.secondAtom : bond.firstAtom,
    //       );
    //     });
    //   }
    //
    //   if (atomsStack.length === 0) {
    //     atomsStack = newAtomsStack;
    //     newAtomsStack = [];
    //   }
    // }
    //
    // return loops;
  }
}
