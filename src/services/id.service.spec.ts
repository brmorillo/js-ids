import { describe, it, expect, beforeEach } from 'bun:test';
import { IdService } from './id.service';

describe('IdService', () => {
   // Reset singleton before each test
   beforeEach(() => {
      // @ts-expect-error - Resetting private static property for testing
      IdService.instance = undefined;
   });

   describe('Singleton Pattern', () => {
      it('should return the same instance when called multiple times', () => {
         const instance1 = IdService.getInstance();
         const instance2 = IdService.getInstance();

         expect(instance1).toBe(instance2);
      });

      it('should maintain configuration across instances', () => {
         const instance1 = IdService.getInstance({ type: 'uuidv4' });
         const instance2 = IdService.getInstance();

         const id1 = instance1.getId();
         const id2 = instance2.getId();

         // Both should generate UUIDs
         const uuidV4Regex =
            /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

         expect(id1).toMatch(uuidV4Regex);
         expect(id2).toMatch(uuidV4Regex);
      });
   });

   describe('UUID v4 Generation', () => {
      it('should generate valid UUID v4 by default', () => {
         const service = IdService.getInstance();
         const id = service.getId();

         const uuidV4Regex =
            /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

         expect(id).toMatch(uuidV4Regex);
      });

      it('should generate valid UUID v4 when explicitly configured', () => {
         const service = IdService.getInstance({ type: 'uuidv4' });
         const id = service.getId();

         const uuidV4Regex =
            /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

         expect(id).toMatch(uuidV4Regex);
      });

      it('should generate unique IDs', () => {
         const service = IdService.getInstance({ type: 'uuidv4' });
         const id1 = service.getId();
         const id2 = service.getId();

         expect(id1).not.toBe(id2);
      });
   });

   describe('Configuration', () => {
      it('should allow reconfiguration', () => {
         const service = IdService.getInstance({ type: 'uuidv4' });

         // Initial ID should be UUID v4
         const id1 = service.getId();
         const uuidV4Regex =
            /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
         expect(id1).toMatch(uuidV4Regex);

         // Reconfigure to UUID v4 again (for now, other types throw errors)
         service.configure({ type: 'uuidv4' });
         const id2 = service.getId();
         expect(id2).toMatch(uuidV4Regex);
      });
   });

   describe('Unsupported Generators', () => {
      it('should throw error for UUID v7 (not yet implemented)', () => {
         const service = IdService.getInstance();

         expect(() => {
            service.configure({ type: 'uuidv7' });
         }).toThrow('UUIDv7 generator not yet implemented');
      });

      it('should throw error for CUID (not yet implemented)', () => {
         const service = IdService.getInstance();

         expect(() => {
            service.configure({ type: 'cuid' });
         }).toThrow('CUID generator not yet implemented');
      });
   });

   describe('Specific ID Methods', () => {
      it('should generate UUID v4 using getUuidV4()', () => {
         const service = IdService.getInstance();
         const id = service.getUuidV4();

         const uuidV4Regex =
            /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

         expect(id).toMatch(uuidV4Regex);
      });

      it('should generate unique UUID v4s using getUuidV4()', () => {
         const service = IdService.getInstance();
         const id1 = service.getUuidV4();
         const id2 = service.getUuidV4();

         expect(id1).not.toBe(id2);
      });

      it('should throw error for getUuidV7() (not yet implemented)', () => {
         const service = IdService.getInstance();

         expect(() => {
            service.getUuidV7();
         }).toThrow('UUIDv7 generator not yet implemented');
      });

      it('should generate Snowflake ID using getSnowflake()', () => {
         const service = IdService.getInstance();

         const id = service.getSnowflake({ workerId: 1, processId: 1 });

         expect(typeof id).toBe('string');
         expect(/^\d+$/.test(id)).toBe(true); // Should be numeric string
         expect(id.length).toBeGreaterThan(0);
      });

      it('should generate Snowflake with custom workerId and processId', () => {
         const service = IdService.getInstance();

         const id = service.getSnowflake({
            workerId: 5,
            processId: 10,
            epoch: new Date('2020-01-01T00:00:00.000Z').getTime(),
         });

         expect(typeof id).toBe('string');
         expect(/^\d+$/.test(id)).toBe(true);
      });

      it('should generate unique Snowflake IDs', () => {
         const service = IdService.getInstance();

         const id1 = service.getSnowflake({
            workerId: 1,
            processId: 1,
            epoch: new Date('2020-01-01T00:00:00.000Z').getTime(),
         });

         // Small delay to ensure different timestamp or sequence
         const start = Date.now();
         while (Date.now() - start < 2) {
            // Wait
         }

         const id2 = service.getSnowflake({
            workerId: 1,
            processId: 1,
            epoch: new Date('2020-01-01T00:00:00.000Z').getTime(),
         });

         expect(id1).not.toBe(id2);
      });

      it('should throw error for getCuid() (not yet implemented)', () => {
         const service = IdService.getInstance();

         expect(() => {
            service.getCuid();
         }).toThrow('CUID generator not yet implemented');
      });

      it('should generate NanoId using getNanoId()', () => {
         const service = IdService.getInstance();
         const id = service.getNanoId();

         expect(typeof id).toBe('string');
         expect(id.length).toBe(21); // Default NanoId length
      });

      it('should generate NanoId with custom size', () => {
         const service = IdService.getInstance();
         const id = service.getNanoId({ size: 10 });

         expect(id.length).toBe(10);
      });

      it('should generate NanoId with custom alphabet', () => {
         const service = IdService.getInstance();
         const customAlphabet = '0123456789ABCDEF';
         const id = service.getNanoId({ alphabet: customAlphabet, size: 16 });

         expect(id.length).toBe(16);
         // Check if all characters are from the custom alphabet
         const allCharsValid = id
            .split('')
            .every((char) => customAlphabet.includes(char));
         expect(allCharsValid).toBe(true);
      });

      it('should generate unique NanoIds', () => {
         const service = IdService.getInstance();
         const id1 = service.getNanoId();
         const id2 = service.getNanoId();

         expect(id1).not.toBe(id2);
      });
   });

   describe('Snowflake Sequence State', () => {
      it('should maintain sequence state across multiple calls without options', () => {
         const service = IdService.getInstance({
            snowflake: { workerId: 1, processId: 1 },
         });

         // Generate multiple IDs in rapid succession
         const ids = Array.from({ length: 100 }, () =>
            service.getSnowflake()
         );

         // All IDs should be unique
         const uniqueIds = new Set(ids);
         expect(uniqueIds.size).toBe(100);

         // Verify no duplicates by checking each ID
         ids.forEach((id, index) => {
            const duplicates = ids.filter((otherId) => otherId === id);
            expect(duplicates.length).toBe(1); // Should only find itself
         });
      });

      it('should handle rapid generation in same millisecond without options', () => {
         const service = IdService.getInstance({
            snowflake: { workerId: 2, processId: 3 },
         });

         // Generate many IDs as fast as possible
         const ids = Array.from({ length: 1000 }, () =>
            service.getSnowflake()
         );

         // All IDs should be unique (no duplicates)
         const uniqueIds = new Set(ids);
         expect(uniqueIds.size).toBe(1000);
      });

      it('should create new generator instance when options are provided', () => {
         const service = IdService.getInstance();

         // Generate with options (creates new generator each time)
         const id1 = service.getSnowflake({
            workerId: 1,
            processId: 1,
         });

         // Add delay to ensure different timestamp
         const start = Date.now();
         while (Date.now() - start < 2) {
            // Wait 2ms
         }

         const id2 = service.getSnowflake({
            workerId: 1,
            processId: 1,
         });

         // IDs should be different due to time difference
         expect(id1).not.toBe(id2);
      });
   });
});
