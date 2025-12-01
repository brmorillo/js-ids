import { nanoid, customAlphabet } from 'nanoid';
import { IIdGenerator } from '../interfaces/id-generator.interface';
import type { NanoIdOptions } from '../interfaces/id-generator.interface';

/**
 * NanoId generator implementation
 * Generates URL-friendly unique string IDs
 */
export class NanoIdGenerator implements IIdGenerator {
   private generator: () => string;

   constructor(options?: NanoIdOptions) {
      if (options?.alphabet) {
         // Custom alphabet generator
         const size = options.size || 21;
         this.generator = customAlphabet(options.alphabet, size);
      } else if (options?.size) {
         // Custom size with default alphabet
         this.generator = () => nanoid(options.size);
      } else {
         // Default nanoid
         this.generator = nanoid;
      }
   }

   /**
    * Generates a new NanoId
    * @returns A URL-friendly unique string
    * @example
    * const generator = new NanoIdGenerator();
    * const id = generator.getId(); // 'V1StGXR8_Z5jdHi6B-myT'
    */
   public getId(): string {
      return this.generator();
   }
}
