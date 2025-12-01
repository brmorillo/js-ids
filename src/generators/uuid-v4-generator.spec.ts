import { describe, it, expect } from 'bun:test';
import { UuidV4Generator } from './uuid-v4-generator';

describe('UuidV4Generator', () => {
  it('should generate a valid UUID v4', () => {
    const generator = new UuidV4Generator();
    const id = generator.getId();

    // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    const uuidV4Regex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    expect(id).toMatch(uuidV4Regex);
  });

  it('should generate unique IDs', () => {
    const generator = new UuidV4Generator();
    const id1 = generator.getId();
    const id2 = generator.getId();

    expect(id1).not.toBe(id2);
  });

  it('should generate IDs with correct length', () => {
    const generator = new UuidV4Generator();
    const id = generator.getId();

    // UUID format with dashes: 36 characters
    expect(id.length).toBe(36);
  });

  it('should generate multiple unique IDs in sequence', () => {
    const generator = new UuidV4Generator();
    const ids = new Set<string>();

    for (let i = 0; i < 100; i++) {
      ids.add(generator.getId());
    }

    // All IDs should be unique
    expect(ids.size).toBe(100);
  });
});
