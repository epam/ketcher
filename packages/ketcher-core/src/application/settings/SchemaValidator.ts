/**
 * Schema-based validator using Ajv
 * Validates settings against JSON Schema
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import Ajv from 'ajv';
import type {
  ISettingsValidator,
  ValidationResult,
  ValidationError,
} from './types';
import { SCHEMA } from './schema';

export class SchemaValidator implements ISettingsValidator {
  private ajv: Ajv;
  private validateFullFn: any;
  private validatePartialFn: any;

  constructor() {
    this.ajv = new Ajv({
      allErrors: true,
      coerceTypes: false,
      useDefaults: false,
    });

    // Compile schemas
    this.validateFullFn = this.ajv.compile(SCHEMA);
    this.validatePartialFn = this.ajv.compile({
      ...SCHEMA,
      required: [], // Partial validation doesn't require all fields
    });
  }

  /**
   * Validate complete settings object
   */
  validate(settings: unknown): ValidationResult {
    const valid = this.validateFullFn(settings);

    if (valid) {
      return { valid: true };
    }

    const errors = this.convertAjvErrors(this.validateFullFn.errors || []);
    return {
      valid: false,
      errors,
    };
  }

  /**
   * Validate partial settings (for updates)
   */
  validatePartial(partial: unknown): ValidationResult {
    const valid = this.validatePartialFn(partial);

    if (valid) {
      return { valid: true };
    }

    const errors = this.convertAjvErrors(this.validatePartialFn.errors || []);
    return {
      valid: false,
      errors,
    };
  }

  /**
   * Convert Ajv errors to our ValidationError format
   */
  private convertAjvErrors(ajvErrors: any[]): ValidationError[] {
    return ajvErrors.map((error) => ({
      path: error.instancePath || error.dataPath || '',
      message: error.message || 'Validation error',
      value: error.data,
    }));
  }
}
