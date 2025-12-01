import { describe, it, expect } from 'bun:test';
import { NanoIdGenerator } from './nano-id-generator';

describe('NanoIdGenerator', () => {
   it('should generate a valid NanoId with default settings', () => {
      const generator = new NanoIdGenerator();
      const id = generator.getId();

      // Default NanoId has 21 characters
      expect(id.length).toBe(21);
      expect(typeof id).toBe('string');
   });

   it('should generate unique IDs', () => {
      const generator = new NanoIdGenerator();
      const id1 = generator.getId();
      const id2 = generator.getId();

      expect(id1).not.toBe(id2);
   });

   it('should generate IDs with custom size', () => {
      const customSize = 10;
      const generator = new NanoIdGenerator({ size: customSize });
      const id = generator.getId();

      expect(id.length).toBe(customSize);
   });

   it('should generate IDs with custom alphabet', () => {
      const customAlphabet = '0123456789ABCDEF';
      const generator = new NanoIdGenerator({
         alphabet: customAlphabet,
         size: 16,
      });
      const id = generator.getId();

      // Check if all characters are from the custom alphabet
      const allCharsValid = id
         .split('')
         .every((char) => customAlphabet.includes(char));

      expect(allCharsValid).toBe(true);
      expect(id.length).toBe(16);
   });

   it('should generate multiple unique IDs in sequence', () => {
      const generator = new NanoIdGenerator();
      const ids = new Set<string>();

      for (let i = 0; i < 100; i++) {
         ids.add(generator.getId());
      }

      // All IDs should be unique
      expect(ids.size).toBe(100);
   });

   it('should handle different size options', () => {
      const sizes = [5, 10, 15, 21, 30];

      sizes.forEach((size) => {
         const generator = new NanoIdGenerator({ size });
         const id = generator.getId();
         expect(id.length).toBe(size);
      });
   });
});
