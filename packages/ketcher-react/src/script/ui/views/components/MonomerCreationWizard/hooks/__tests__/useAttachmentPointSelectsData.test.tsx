/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import { renderHook } from '@testing-library/react';
import { useAttachmentPointSelectsData } from '../useAttachmentPointSelectsData';
import { Editor } from '../../../../../../editor/Editor';
import { Atom, AttachmentPointName } from 'ketcher-core';

// Mock Editor
jest.mock('../../../../../../editor/Editor');

describe('useAttachmentPointSelectsData', () => {
  it('should render leaving atom options with subscripted hydrogen counts', () => {
    // Create mock atoms with different implicit hydrogen counts
    const mockAtomO = new Atom({ label: 'O', implicitH: 1 }); // OH
    const mockAtomN = new Atom({ label: 'N', implicitH: 2 }); // NH2
    const mockAtomC = new Atom({ label: 'C', implicitH: 3 }); // CH3

    const mockAttachmentAtom = new Atom({ label: 'C', implicitH: 1 });

    const mockEditor = {
      monomerCreationState: {
        assignedAttachmentPoints: new Map([['R1', [1, 2]]]),
      },
      struct: jest.fn(() => ({
        atoms: {
          get: jest.fn((id: number) => {
            if (id === 1) return mockAttachmentAtom;
            if (id === 2) return mockAtomO;
            return null;
          }),
          keyOf: jest.fn((atom: Atom) => {
            if (atom === mockAtomO) return 2;
            if (atom === mockAtomN) return 3;
            if (atom === mockAtomC) return 4;
            return null;
          }),
        },
      })),
      findPotentialLeavingAtoms: jest.fn(() => [
        mockAtomO,
        mockAtomN,
        mockAtomC,
      ]),
    } as unknown as Editor;

    const { result } = renderHook(() =>
      useAttachmentPointSelectsData(mockEditor, 'R1' as AttachmentPointName),
    );

    expect(result.current).not.toBeNull();

    const leavingAtomOptions = result.current?.leavingAtomOptions;
    expect(leavingAtomOptions).toBeDefined();
    expect(leavingAtomOptions?.length).toBeGreaterThan(0);

    // Verify that options have children property (which contains JSX with subscripts)
    leavingAtomOptions?.forEach((option) => {
      expect(option.children).toBeDefined();
      // The children should be JSX, not a plain string
      expect(typeof option.children).not.toBe('string');
    });

    // The attachment atom itself has implicitH > 0, so there should be an italic H option
    const hasItalicHOption = leavingAtomOptions?.some(
      (opt) => opt.value === '-1',
    );
    expect(hasItalicHOption).toBe(true);
  });

  it('should not add italic H option if attachment atom has no implicit hydrogens', () => {
    const mockAtomO = new Atom({ label: 'O', implicitH: 1 });
    const mockAttachmentAtom = new Atom({ label: 'C', implicitH: 0 }); // No implicit H

    const mockEditor = {
      monomerCreationState: {
        assignedAttachmentPoints: new Map([['R1', [1, 2]]]),
      },
      struct: jest.fn(() => ({
        atoms: {
          get: jest.fn((id: number) => {
            if (id === 1) return mockAttachmentAtom;
            if (id === 2) return mockAtomO;
            return null;
          }),
          keyOf: jest.fn((atom: Atom) => {
            if (atom === mockAtomO) return 2;
            return null;
          }),
        },
      })),
      findPotentialLeavingAtoms: jest.fn(() => [mockAtomO]),
    } as unknown as Editor;

    const { result } = renderHook(() =>
      useAttachmentPointSelectsData(mockEditor, 'R1' as AttachmentPointName),
    );

    const leavingAtomOptions = result.current?.leavingAtomOptions;
    const hasItalicHOption = leavingAtomOptions?.some(
      (opt) => opt.value === '-1',
    );
    expect(hasItalicHOption).toBe(false);
  });
});
