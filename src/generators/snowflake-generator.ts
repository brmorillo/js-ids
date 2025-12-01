import { IIdGenerator } from '../interfaces/id-generator.interface';
import type { SnowflakeOptions } from '../interfaces/id-generator.interface';

/**
 * Snowflake ID generator implementation
 * Generates distributed, time-ordered 64-bit IDs
 * Based on Twitter's Snowflake algorithm
 * 
 * ID Structure (64 bits):
 * - 41 bits: Timestamp (milliseconds since epoch)
 * - 5 bits: Worker ID (0-31)
 * - 5 bits: Process ID (0-31)
 * - 12 bits: Sequence number (0-4095)
 */
export class SnowflakeGenerator implements IIdGenerator {
   private readonly workerId: number;
   private readonly processId: number;
   private readonly epoch: number;
   private sequence: number = 0;
   private lastTimestamp: number = -1;

   // Bit lengths
   private readonly WORKER_ID_BITS = 5;
   private readonly PROCESS_ID_BITS = 5;
   private readonly SEQUENCE_BITS = 12;

   // Maximum values
   private readonly MAX_WORKER_ID = (1 << this.WORKER_ID_BITS) - 1; // 31
   private readonly MAX_PROCESS_ID = (1 << this.PROCESS_ID_BITS) - 1; // 31
   private readonly MAX_SEQUENCE = (1 << this.SEQUENCE_BITS) - 1; // 4095

   // Bit shifts
   private readonly TIMESTAMP_SHIFT = this.WORKER_ID_BITS + this.PROCESS_ID_BITS + this.SEQUENCE_BITS; // 22
   private readonly WORKER_ID_SHIFT = this.PROCESS_ID_BITS + this.SEQUENCE_BITS; // 17
   private readonly PROCESS_ID_SHIFT = this.SEQUENCE_BITS; // 12

   constructor(options?: SnowflakeOptions) {
      // Default epoch: December 1, 2025, 00:00:00 UTC (1733011200000)
      // Users can override this by passing options.epoch
      this.epoch = options?.epoch || 1733011200000;

      // Validate and set worker ID (0-31)
      this.workerId = options?.workerId ?? 1;
      if (this.workerId < 0 || this.workerId > this.MAX_WORKER_ID) {
         throw new Error(`Worker ID must be between 0 and ${this.MAX_WORKER_ID}`);
      }

      // Validate and set process ID (0-31)
      this.processId = options?.processId ?? 1;
      if (this.processId < 0 || this.processId > this.MAX_PROCESS_ID) {
         throw new Error(`Process ID must be between 0 and ${this.MAX_PROCESS_ID}`);
      }
   }

   /**
    * Generates a new Snowflake ID
    * @returns A 64-bit Snowflake ID as a string
    * @example
    * const generator = new SnowflakeGenerator({ workerId: 1, processId: 1 });
    * const id = generator.getId(); // '1234567890123456789'
    */
   public getId(): string {
      let timestamp = this.getCurrentTimestamp();

      // Check for clock moving backwards
      if (timestamp < this.lastTimestamp) {
         throw new Error(
            `Clock moved backwards. Refusing to generate ID for ${this.lastTimestamp - timestamp} milliseconds`
         );
      }

      // Same millisecond - increment sequence
      if (timestamp === this.lastTimestamp) {
         this.sequence = (this.sequence + 1) & this.MAX_SEQUENCE;

         // Sequence overflow - wait for next millisecond
         if (this.sequence === 0) {
            timestamp = this.waitNextMillis(timestamp);
         }
      } else {
         // New millisecond - reset sequence
         this.sequence = 0;
      }

      this.lastTimestamp = timestamp;

      // Construct the ID using BigInt to avoid precision loss
      const timestampBits = BigInt(timestamp - this.epoch) << BigInt(this.TIMESTAMP_SHIFT);
      const workerIdBits = BigInt(this.workerId) << BigInt(this.WORKER_ID_SHIFT);
      const processIdBits = BigInt(this.processId) << BigInt(this.PROCESS_ID_SHIFT);
      const sequenceBits = BigInt(this.sequence);

      const id = timestampBits | workerIdBits | processIdBits | sequenceBits;

      return id.toString();
   }

   /**
    * Deconstructs a Snowflake ID into its components
    * @param id The Snowflake ID to deconstruct
    * @returns Object containing timestamp, workerId, processId, and sequence
    */
   public deconstruct(id: string): {
      timestamp: number;
      workerId: number;
      processId: number;
      sequence: number;
      date: Date;
   } {
      const snowflakeId = BigInt(id);

      const timestamp = Number(
         (snowflakeId >> BigInt(this.TIMESTAMP_SHIFT)) + BigInt(this.epoch)
      );
      const workerId = Number(
         (snowflakeId >> BigInt(this.WORKER_ID_SHIFT)) & BigInt(this.MAX_WORKER_ID)
      );
      const processId = Number(
         (snowflakeId >> BigInt(this.PROCESS_ID_SHIFT)) & BigInt(this.MAX_PROCESS_ID)
      );
      const sequence = Number(snowflakeId & BigInt(this.MAX_SEQUENCE));

      return {
         timestamp,
         workerId,
         processId,
         sequence,
         date: new Date(timestamp),
      };
   }

   /**
    * Gets the current timestamp in milliseconds
    */
   private getCurrentTimestamp(): number {
      return Date.now();
   }

   /**
    * Waits until the next millisecond
    */
   private waitNextMillis(lastTimestamp: number): number {
      let timestamp = this.getCurrentTimestamp();
      while (timestamp <= lastTimestamp) {
         timestamp = this.getCurrentTimestamp();
      }
      return timestamp;
   }
}
