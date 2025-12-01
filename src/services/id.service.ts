import {
  IIdGenerator,
  IdGeneratorOptions,
  IdGeneratorType,
  SnowflakeOptions,
  NanoIdOptions,
} from '../interfaces/id-generator.interface';
import { UuidV4Generator } from '../generators/uuid-v4-generator';
import { NanoIdGenerator } from '../generators/nano-id-generator';
import { SnowflakeGenerator } from '../generators/snowflake-generator';

/**
 * ID service that uses dependency injection to provide ID generation functionality
 * Implements the Singleton pattern for global ID generator access
 *
 * @example
 * // Configure in your app.module or main entry point
 * const idService = IdService.getInstance({
 *   type: 'uuidv4'
 * });
 *
 * // Use anywhere in your application
 * const id = idService.getId(); // '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'
 *
 * // Or use specific methods with parameters
 * const snowflakeId = idService.getSnowflake({ workerId: 1, datacenterId: 1 });
 * const nanoId = idService.getNanoId({ size: 10 });
 *
 * @example
 * // Future Snowflake configuration
 * const idService = IdService.getInstance({
 *   type: 'snowflake',
 *   snowflake: {
 *     workerId: 1,
 *     datacenterId: 1
 *   }
 * });
 */
export class IdService {
  private static instance: IdService;
  private generator: IIdGenerator;
  private options: IdGeneratorOptions;

  private constructor(options: IdGeneratorOptions = {}) {
    this.options = options;
    const type = options.type || 'uuidv4';
    this.generator = this.createGenerator(type, options);
  }

  /**
   * Gets the singleton instance of IdService
   * @param options Optional ID generator configuration
   * @returns The IdService instance
   * @example
   * const idService = IdService.getInstance({ type: 'uuidv4' });
   */
  public static getInstance(options?: IdGeneratorOptions): IdService {
    if (!IdService.instance) {
      IdService.instance = new IdService(options);
    }
    return IdService.instance;
  }

  /**
   * Reconfigures the ID generator with new options
   * @param options ID generator configuration
   * @example
   * idService.configure({ type: 'uuidv7' });
   */
  public configure(options: IdGeneratorOptions): void {
    this.options = { ...this.options, ...options };
    const type = options.type || 'uuidv4';
    this.generator = this.createGenerator(type, this.options);
  }

  /**
   * Generates a new ID using the configured generator
   * @returns A string representing the generated ID
   * @example
   * const id = idService.getId(); // '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'
   */
  public getId(): string {
    return this.generator.getId();
  }

  /**
   * Generates a UUID v4
   * @returns A random UUID v4 string
   * @example
   * const id = idService.getUuidV4();
   * // '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'
   */
  public getUuidV4(): string {
    const generator = new UuidV4Generator();
    return generator.getId();
  }

  /**
   * Generates a UUID v7 (time-ordered)
   * @returns A time-ordered UUID v7 string
   * @throws Error - UUIDv7 not yet implemented
   * @example
   * const id = idService.getUuidV7();
   * // '018c3e5a-8b3e-7000-8000-000000000000'
   */
  public getUuidV7(): string {
    throw new Error('UUIDv7 generator not yet implemented');
  }

  /**
   * Generates a Snowflake ID
   * Uses the configuration from getInstance() if no options provided
   * @param options Optional Snowflake configuration options (overrides default config)
   * @returns A Snowflake ID string
   * @example
   * // With configuration at initialization
   * const idService = IdService.getInstance({
   *   snowflake: { workerId: 1, processId: 1 }
   * });
   * const id = idService.getSnowflake(); // Uses workerId: 1, processId: 1
   * 
   * @example
   * // Override configuration for specific call
   * const id = idService.getSnowflake({
   *   workerId: 5,
   *   processId: 10,
   *   epoch: 1288834974657
   * });
   */
  public getSnowflake(options?: SnowflakeOptions): string {
    // Use provided options, or fall back to configured options, or defaults
    const finalOptions = options || this.options.snowflake;
    const generator = new SnowflakeGenerator(finalOptions);
    return generator.getId();
  }

  /**
   * Generates a CUID (Collision-resistant Unique IDentifier)
   * @returns A CUID string
   * @throws Error - CUID not yet implemented
   * @example
   * const id = idService.getCuid();
   * // 'clh5z8kqt0000qzrmn5b8t2j4'
   */
  public getCuid(): string {
    throw new Error('CUID generator not yet implemented');
  }

  /**
   * Generates a NanoId
   * Uses the configuration from getInstance() if no options provided
   * @param options Optional NanoId configuration options (overrides default config)
   * @returns A NanoId string
   * @example
   * // With configuration at initialization
   * const idService = IdService.getInstance({
   *   nanoid: { size: 10, alphabet: '0123456789ABCDEF' }
   * });
   * const id = idService.getNanoId(); // Uses size: 10 and custom alphabet
   *
   * @example
   * // Override configuration for specific call
   * const id = idService.getNanoId({ size: 8 });
   *
   * @example
   * // With custom alphabet
   * const id = idService.getNanoId({
   *   alphabet: '0123456789ABCDEF',
   *   size: 16
   * });
   */
  public getNanoId(options?: NanoIdOptions): string {
    // Merge provided options with configured options
    const finalOptions = options
      ? { ...this.options.nanoid, ...options }
      : this.options.nanoid;
    const generator = new NanoIdGenerator(finalOptions);
    return generator.getId();
  }

  /**
   * Creates an ID generator instance based on the specified type
   * @param type The ID generator type
   * @param options ID generator configuration
   * @returns An IIdGenerator implementation
   * @throws Error if the generator type is not supported
   */
  private createGenerator(
    type: IdGeneratorType,
    options: IdGeneratorOptions
  ): IIdGenerator {
    switch (type) {
      case 'uuidv4':
        return new UuidV4Generator();
      case 'uuidv7':
        throw new Error('UUIDv7 generator not yet implemented');
      case 'snowflake':
        return new SnowflakeGenerator(options.snowflake);
      case 'cuid':
        throw new Error('CUID generator not yet implemented');
      case 'nanoid':
        return new NanoIdGenerator(options.nanoid);
      default:
        return new UuidV4Generator();
    }
  }
}
