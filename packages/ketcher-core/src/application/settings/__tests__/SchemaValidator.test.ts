/**
 * Unit tests for SchemaValidator
 */

/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { SchemaValidator } from '../SchemaValidator';
import { getDefaultSettings } from '../schema';
import type { Settings } from '../types';

describe('SchemaValidator', () => {
  let validator: SchemaValidator;

  beforeEach(() => {
    validator = new SchemaValidator();
  });

  describe('validate - full settings', () => {
    it('should validate default settings', () => {
      const settings = getDefaultSettings();
      const result = validator.validate(settings);

      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should validate valid custom settings', () => {
      const settings = {
        ...getDefaultSettings(),
        resetToSelect: false as Settings['resetToSelect'],
        atomColoring: false,
        rotationStep: 30,
      };

      const result = validator.validate(settings);

      expect(result.valid).toBe(true);
    });

    it('should reject invalid rotation step (too high)', () => {
      const settings = { ...getDefaultSettings(), rotationStep: 200 }; // Max is 90

      const result = validator.validate(settings);

      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });

    it('should reject invalid rotation step (too low)', () => {
      const settings = { ...getDefaultSettings(), rotationStep: 0 }; // Min is 1

      const result = validator.validate(settings);

      expect(result.valid).toBe(false);
    });

    it('should reject invalid bond thickness (negative)', () => {
      const settings = { ...getDefaultSettings(), bondThickness: -1 }; // Min is 0.1

      const result = validator.validate(settings);

      expect(result.valid).toBe(false);
    });

    it('should reject invalid enum value', () => {
      const settings = {
        ...getDefaultSettings(),
        showHydrogenLabels:
          'invalid' as unknown as Settings['showHydrogenLabels'],
      };

      const result = validator.validate(settings);

      expect(result.valid).toBe(false);
    });

    it('should reject invalid type', () => {
      const settings = {
        ...getDefaultSettings(),
        resetToSelect: 'invalid' as unknown as Settings['resetToSelect'],
      }; // Should be boolean or 'paste'

      const result = validator.validate(settings);

      expect(result.valid).toBe(false);
    });

    it('should accept object with extra properties (schema is flexible)', () => {
      // Note: Our schema doesn't use additionalProperties: false
      // so extra properties are allowed
      const result = validator.validate({ invalid: 'object' });

      // This is actually valid behavior - schema allows additional properties
      expect(result.valid).toBe(true);
    });

    it('should reject non-object input', () => {
      const result = validator.validate('not an object');

      expect(result.valid).toBe(false);
    });

    it('should reject null input', () => {
      const result = validator.validate(null);

      expect(result.valid).toBe(false);
    });
  });

  describe('validatePartial - partial settings', () => {
    it('should validate partial editor settings', () => {
      const partial = {
        resetToSelect: false,
      };

      const result = validator.validatePartial(partial);

      expect(result.valid).toBe(true);
    });

    it('should validate partial render settings', () => {
      const partial = {
        atomColoring: false,
        bondThickness: 2.0,
      };

      const result = validator.validatePartial(partial);

      expect(result.valid).toBe(true);
    });

    it('should validate nested partial update', () => {
      const partial = {
        atomColoring: false,
      };

      const result = validator.validatePartial(partial);

      expect(result.valid).toBe(true);
    });

    it('should reject invalid partial settings', () => {
      const partial = {
        rotationStep: 200, // Invalid
      };

      const result = validator.validatePartial(partial);

      expect(result.valid).toBe(false);
    });

    it('should reject invalid types in partial', () => {
      const partial = {
        bondThickness: 'invalid', // Should be number
      };

      const result = validator.validatePartial(partial);

      expect(result.valid).toBe(false);
    });

    it('should validate empty partial object', () => {
      const result = validator.validatePartial({});

      expect(result.valid).toBe(true);
    });
  });

  describe('error reporting', () => {
    it('should provide error details', () => {
      const settings = { ...getDefaultSettings(), rotationStep: 200 };

      const result = validator.validate(settings);

      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);

      const error = result.errors![0];
      expect(error).toHaveProperty('path');
      expect(error).toHaveProperty('message');
    });

    it('should report multiple errors', () => {
      const settings = {
        ...getDefaultSettings(),
        rotationStep: 200, // Invalid
        bondThickness: -1, // Invalid
      };

      const result = validator.validate(settings);

      expect(result.valid).toBe(false);
      expect(result.errors!.length).toBeGreaterThan(1);
    });
  });

  describe('boundary values', () => {
    it('should accept rotation step at minimum (1)', () => {
      const settings = { ...getDefaultSettings(), rotationStep: 1 };

      const result = validator.validate(settings);

      expect(result.valid).toBe(true);
    });

    it('should accept rotation step at maximum (90)', () => {
      const settings = { ...getDefaultSettings(), rotationStep: 90 };

      const result = validator.validate(settings);

      expect(result.valid).toBe(true);
    });

    it('should accept bond thickness at minimum (0.1)', () => {
      const settings = { ...getDefaultSettings(), bondThickness: 0.1 };

      const result = validator.validate(settings);

      expect(result.valid).toBe(true);
    });

    it('should accept bond thickness at maximum (96)', () => {
      const settings = { ...getDefaultSettings(), bondThickness: 96 };

      const result = validator.validate(settings);

      expect(result.valid).toBe(true);
    });
  });

  describe('enum validation', () => {
    it('should accept valid miew mode', () => {
      const settings = { ...getDefaultSettings(), miewMode: 'BS' };

      const result = validator.validate(settings);

      expect(result.valid).toBe(true);
    });

    it('should reject invalid miew mode', () => {
      const settings = {
        ...getDefaultSettings(),
        miewMode: 'INVALID',
      };

      const result = validator.validate(settings);

      expect(result.valid).toBe(false);
    });

    it('should accept all valid hydrogen label options', () => {
      const validOptions: Settings['showHydrogenLabels'][] = [
        'off',
        'Hetero',
        'Terminal',
        'Terminal and Hetero',
        'On',
      ];

      validOptions.forEach((option) => {
        const settings = {
          ...getDefaultSettings(),
          showHydrogenLabels: option,
        };

        const result = validator.validate(settings);

        expect(result.valid).toBe(true);
      });
    });
  });
});
