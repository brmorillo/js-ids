import { describe, it, expect } from 'bun:test';
import { SnowflakeGenerator } from './snowflake-generator';

describe('SnowflakeGenerator', () => {
   it('should generate a valid Snowflake ID', () => {
      const generator = new SnowflakeGenerator({ workerId: 1, processId: 1 });
      const id = generator.getId();

      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
      // Snowflake IDs are numeric strings
      expect(/^\d+$/.test(id)).toBe(true);
   });

   it('should generate unique IDs', () => {
      const generator = new SnowflakeGenerator({ workerId: 1, processId: 1 });
      const id1 = generator.getId();
      const id2 = generator.getId();

      expect(id1).not.toBe(id2);
   });

   it('should generate IDs with custom workerId and processId', () => {
      const generator = new SnowflakeGenerator({ workerId: 5, processId: 10 });
      const id = generator.getId();
      const deconstructed = generator.deconstruct(id);

      expect(deconstructed.workerId).toBe(5);
      expect(deconstructed.processId).toBe(10);
   });

   it('should generate IDs with custom epoch', () => {
      const customEpoch = new Date('2020-01-01T00:00:00.000Z').getTime();
      const generator = new SnowflakeGenerator({
         workerId: 1,
         processId: 1,
         epoch: customEpoch,
      });
      const id = generator.getId();

      expect(typeof id).toBe('string');
      expect(/^\d+$/.test(id)).toBe(true);
   });

   it('should generate multiple unique IDs in sequence', () => {
      const generator = new SnowflakeGenerator({ workerId: 1, processId: 1 });
      const ids = new Set<string>();

      for (let i = 0; i < 100; i++) {
         ids.add(generator.getId());
      }

      // All IDs should be unique
      expect(ids.size).toBe(100);
   });

   it('should be able to deconstruct an ID', () => {
      const generator = new SnowflakeGenerator({ workerId: 3, processId: 7 });
      const id = generator.getId();
      const deconstructed = generator.deconstruct(id);

      expect(deconstructed).toBeDefined();
      expect(typeof deconstructed.timestamp).toBe('number');
      expect(typeof deconstructed.workerId).toBe('number');
      expect(typeof deconstructed.processId).toBe('number');
      expect(typeof deconstructed.sequence).toBe('number');
      expect(deconstructed.date).toBeInstanceOf(Date);

      // Verify the values
      expect(deconstructed.workerId).toBe(3);
      expect(deconstructed.processId).toBe(7);
   });

   it('should generate time-ordered IDs', () => {
      const generator = new SnowflakeGenerator({ workerId: 1, processId: 1 });
      const id1 = BigInt(generator.getId());

      // Wait a bit to ensure different timestamp
      const start = Date.now();
      while (Date.now() - start < 2) {
         // Small delay
      }

      const id2 = BigInt(generator.getId());

      // Second ID should be greater than first (time-ordered)
      expect(id2 > id1).toBe(true);
   });

   it('should handle rapid ID generation', () => {
      const generator = new SnowflakeGenerator({ workerId: 1, processId: 1 });
      const ids: string[] = [];

      // Generate many IDs quickly
      for (let i = 0; i < 1000; i++) {
         ids.push(generator.getId());
      }

      // Check all are unique
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(1000);

      // Check all are valid numeric strings
      ids.forEach((id) => {
         expect(/^\d+$/.test(id)).toBe(true);
      });
   });

   it('should throw error for invalid workerId', () => {
      expect(
         () => new SnowflakeGenerator({ workerId: 32, processId: 1 })
      ).toThrow('Worker ID must be between 0 and 31');

      expect(
         () => new SnowflakeGenerator({ workerId: -1, processId: 1 })
      ).toThrow('Worker ID must be between 0 and 31');
   });

   it('should throw error for invalid processId', () => {
      expect(
         () => new SnowflakeGenerator({ workerId: 1, processId: 32 })
      ).toThrow('Process ID must be between 0 and 31');

      expect(
         () => new SnowflakeGenerator({ workerId: 1, processId: -1 })
      ).toThrow('Process ID must be between 0 and 31');
   });

   it('should handle sequence overflow within same millisecond', () => {
      const generator = new SnowflakeGenerator({ workerId: 1, processId: 1 });
      const ids = new Set<string>();

      // Generate more than 4096 IDs (max sequence per millisecond)
      for (let i = 0; i < 5000; i++) {
         ids.add(generator.getId());
      }

      // All IDs should still be unique
      expect(ids.size).toBe(5000);
   });
});
