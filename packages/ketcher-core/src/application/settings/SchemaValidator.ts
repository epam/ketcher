/**
 * Schema-based validator using jsonschema
 * Validates settings against JSON Schema
 */

import {
  type Schema,
  type ValidationError as JsonSchemaValidationError,
  Validator,
} from 'jsonschema';
import type {
  ISettingsValidator,
  ValidationResult,
  ValidationError as SettingsValidationError,
} from './types';
import { SCHEMA } from './schema';

export class SchemaValidator implements ISettingsValidator {
  private readonly validator: Validator;
  private readonly fullSchema: Schema;
  private readonly partialSchema: Schema;

  constructor() {
    this.validator = new Validator();
    this.fullSchema = SCHEMA as Schema;
    this.partialSchema = {
      ...SCHEMA,
      required: [], // Partial validation doesn't require all fields
    } as Schema;
  }

  /**
   * Validate complete settings object
   */
  validate(settings: unknown): ValidationResult {
    const result = this.validator.validate(settings, this.fullSchema, {
      base: 'https://ketcher.local/',
    });

    if (result.valid) {
      return { valid: true };
    }

    const errors = this.convertJsonSchemaErrors(result.errors);
    return {
      valid: false,
      errors,
    };
  }

  /**
   * Validate partial settings (for updates)
   */
  validatePartial(partial: unknown): ValidationResult {
    const result = this.validator.validate(partial, this.partialSchema, {
      base: 'https://ketcher.local/',
    });

    if (result.valid) {
      return { valid: true };
    }

    const errors = this.convertJsonSchemaErrors(result.errors);
    return {
      valid: false,
      errors,
    };
  }

  /**
   * Convert jsonschema errors to our ValidationError format
   */
  private convertJsonSchemaErrors(
    jsonSchemaErrors: JsonSchemaValidationError[],
  ): SettingsValidationError[] {
    return jsonSchemaErrors.map((error) => ({
      path: this.getErrorPath(error),
      message: error.message || 'Validation error',
      value: error.instance,
    }));
  }

  private getErrorPath(error: JsonSchemaValidationError): string {
    if (error.path.length === 0) {
      return '';
    }

    return `/${error.path.map(this.escapeJsonPointerToken).join('/')}`;
  }

  private escapeJsonPointerToken(token: string | number): string {
    return String(token).replace(/~/g, '~0').replace(/\//g, '~1');
  }
}
