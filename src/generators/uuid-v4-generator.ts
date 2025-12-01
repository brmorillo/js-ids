import { v4 as uuidv4 } from 'uuid';
import { IIdGenerator } from '../interfaces/id-generator.interface';

/**
 * UUID v4 generator implementation
 * Generates random UUIDs using version 4 specification
 */
export class UuidV4Generator implements IIdGenerator {
  /**
   * Generates a new UUID v4
   * @returns A random UUID v4 string
   * @example
   * const generator = new UuidV4Generator();
   * const id = generator.getId(); // '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'
   */
  public getId(): string {
    return uuidv4();
  }
}
