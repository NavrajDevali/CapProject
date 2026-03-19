import Ajv from 'ajv';

export const ajv = new Ajv({ allErrors: true });

// ── Product schema ──────────────────────────
export const productSchema = {
  type: 'object',
  required: ['id', 'title', 'price', 'rating', 'stock', 'category'],
  properties: {
    id:       { type: 'number' },
    title:    { type: 'string', minLength: 1 },
    price:    { type: 'number', minimum: 0 },
    rating:   { type: 'number', minimum: 0, maximum: 5 },
    stock:    { type: 'number', minimum: 0 },
    category: { type: 'string' },
  },
  additionalProperties: true,
};

// ── User schema ─────────────────────────────
export const userSchema = {
  type: 'object',
  required: ['id', 'firstName', 'lastName', 'email', 'username'],
  properties: {
    id:        { type: 'number' },
    firstName: { type: 'string', minLength: 1 },
    lastName:  { type: 'string', minLength: 1 },
    email:     { type: 'string' },
    username:  { type: 'string' },
    age:       { type: 'number' },
    phone:     { type: 'string' },
  },
  additionalProperties: true,
};

// ── Error schema ────────────────────────────
export const errorSchema = {
  type: 'object',
  required: ['message'],
  properties: {
    message: { type: 'string', minLength: 1 },
  },
  additionalProperties: true,
};

// Compiled validators
export const validateProduct = ajv.compile(productSchema);
export const validateUser    = ajv.compile(userSchema);
export const validateError   = ajv.compile(errorSchema);

// Helper — prints exactly which field failed if schema check fails
export function assertSchema(
  validate: ReturnType<typeof ajv.compile>,
  data: unknown,
  label: string
) {
  const valid = validate(data);
  if (!valid) {
    const errors = JSON.stringify(validate.errors, null, 2);
    throw new Error(`Schema failed for [${label}]:\n${errors}`);
  }
}
