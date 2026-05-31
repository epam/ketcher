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

import { PathBuilder } from 'application/render/pathBuilder';
import { Vec2 } from 'domain/entities';

describe('PathBuilder', () => {
  describe('method chaining', () => {
    it('should support method chaining', () => {
      const builder = new PathBuilder();
      const result = builder
        .addMovement({ x: 0, y: 0 })
        .addLine({ x: 10, y: 10 })
        .addClosedLine({ x: 0, y: 10 })
        .build();

      expect(result).toMatch(/M0\.0+,0\.0+/);
      expect(result).toMatch(/L10\.0+,10\.0+/);
      expect(result).toMatch(/L0\.0+,10\.0+Z/);
    });

    it('should support method chaining with arrow methods', () => {
      const builder = new PathBuilder();
      const result = builder.addOpenArrowPathParts(new Vec2(0, 0), 20).build();

      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should support inheritance with proper type inference', () => {
      // This test demonstrates that the 'this' type allows proper type inference
      // when extending PathBuilder. If we had used 'PathBuilder' as return type,
      // calling extended methods after base class methods would fail.
      class ExtendedPathBuilder extends PathBuilder {
        addCustomShape(): this {
          return this.addMovement({ x: 0, y: 0 })
            .addLine({ x: 5, y: 5 })
            .addLine({ x: 10, y: 0 })
            .addClosedLine({ x: 5, y: -5 });
        }
      }

      const extended = new ExtendedPathBuilder();
      // This would not compile if PathBuilder methods returned 'PathBuilder' instead of 'this'
      const result = extended.addMovement({ x: 100, y: 100 }).addCustomShape();

      expect(result).toBeInstanceOf(ExtendedPathBuilder);
      expect(result.build()).toMatch(/M100\.0+,100\.0+/);
    });
  });

  describe('basic path building', () => {
    it('should build a simple path with movement', () => {
      const builder = new PathBuilder();
      const path = builder.addMovement({ x: 10, y: 20 }).build();

      expect(path).toMatch(/M10\.0+,20\.0+/);
    });

    it('should build a path with line', () => {
      const builder = new PathBuilder();
      const path = builder.addLine({ x: 30, y: 40 }, { x: 10, y: 20 }).build();

      expect(path).toMatch(/M10\.0+,20\.0+/);
      expect(path).toMatch(/L30\.0+,40\.0+/);
    });

    it('should build a closed line', () => {
      const builder = new PathBuilder();
      const path = builder
        .addClosedLine({ x: 30, y: 40 }, { x: 10, y: 20 })
        .build();

      expect(path).toMatch(/M10\.0+,20\.0+/);
      expect(path).toMatch(/L30\.0+,40\.0+Z/);
    });
  });
});
