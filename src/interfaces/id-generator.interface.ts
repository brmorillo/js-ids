/**
 * Interface for ID generator implementations
 */
export interface IIdGenerator {
   /**
    * Generates a new ID
    * @returns A string representing the generated ID
    */
   getId(): string;
}

/**
 * Available ID generator types
 */
export type IdGeneratorType =
   | 'uuidv4'
   | 'uuidv7'
   | 'snowflake'
   | 'cuid'
   | 'nanoid';

/**
 * Configuration options for Snowflake ID generator
 */
export interface SnowflakeOptions {
   /**
    * Worker ID (0-31) - identifies the worker/machine generating IDs
    * @default 1
    */
   workerId?: number;

   /**
    * Process ID (0-31) - identifies the process on the worker
    * Also known as datacenter ID in some implementations
    * @default 1
    */
   processId?: number;

   /**
    * Custom epoch timestamp in milliseconds
    * Default: January 1, 2000, 00:00:00 UTC (946684800000)
    * @default 946684800000
    */
   epoch?: number;
}

/**
 * Configuration options for NanoId generator
 */
export interface NanoIdOptions {
   /**
    * Custom alphabet for ID generation
    * @default '_-0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    */
   alphabet?: string;

   /**
    * Length of the generated ID
    * @default 21
    */
   size?: number;
}

/**
 * ID generator configuration options
 */
export interface IdGeneratorOptions {
   /**
    * The type of ID generator to use
    * @default 'uuidv4'
    */
   type?: IdGeneratorType;

   /**
    * Snowflake-specific configuration options
    * Only used when type is 'snowflake'
    */
   snowflake?: SnowflakeOptions;

   /**
    * NanoId-specific configuration options
    * Only used when type is 'nanoid'
    */
   nanoid?: NanoIdOptions;
}
