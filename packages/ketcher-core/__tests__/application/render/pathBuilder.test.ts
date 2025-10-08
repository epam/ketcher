/**
 * Test file demonstrating the benefit of using 'this' type
 * for fluent interfaces in PathBuilder
 */

import { PathBuilder } from '../../../src/application/render/pathBuilder';
import { Vec2 } from '../../../src/domain/entities';

describe('PathBuilder', () => {
  describe('fluent interface with this type', () => {
    it('should allow method chaining on base class', () => {
      const builder = new PathBuilder();
      const result = builder
        .addMovement({ x: 0, y: 0 })
        .addLine({ x: 10, y: 10 })
        .addClosedLine({ x: 10, y: 0 })
        .build();

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should allow chaining arrow methods', () => {
      const start = new Vec2(0, 0);
      const builder = new PathBuilder();

      const result = builder.addOpenArrowPathParts(start, 20).build();

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should support extensibility with subclasses', () => {
      // This test demonstrates that if someone extends PathBuilder,
      // they can now properly chain methods from both parent and child classes
      class ExtendedPathBuilder extends PathBuilder {
        addCustomShape(): this {
          this.addMovement({ x: 0, y: 0 });
          this.addLine({ x: 5, y: 5 });
          return this;
        }
      }

      const builder = new ExtendedPathBuilder();

      // This works because methods return 'this' type, not 'PathBuilder'
      const result = builder
        .addMovement({ x: 10, y: 10 })
        .addCustomShape() // Can call child method
        .addLine({ x: 20, y: 20 }) // Can call parent method
        .build();

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });
});
