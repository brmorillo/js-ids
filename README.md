# @brmorillo/ids

A flexible and extensible ID generator library for TypeScript/JavaScript applications, supporting multiple ID formats (UUID v4, Snowflake, NanoId) with a simple, unified API.

[![npm version](https://img.shields.io/npm/v/@brmorillo/ids.svg)](https://www.npmjs.com/package/@brmorillo/ids)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)

## 🚀 Quick Start

```bash
# Install
bun add @brmorillo/ids
```

```typescript
import { IdService } from '@brmorillo/ids';

const idService = IdService.getInstance();

// Generate different types of IDs
const uuid = idService.getUuidV4();           // UUID v4
const snowflake = idService.getSnowflake();   // Snowflake ID
const nanoId = idService.getNanoId();         // NanoId
```

## Features

- 🎯 **Multiple ID Formats**: UUID v4, Snowflake, and NanoId support
- 🚀 **High Performance**: Optimized generators for production use
- 🔧 **Flexible Configuration**: Customize ID generation per your needs
- 🏭 **Singleton Pattern**: Global ID service instance management
- 🔄 **Runtime Reconfiguration**: Change ID generator on the fly
- 🌐 **Universal**: Works with Node.js, Bun, and browsers
- ✅ **100% TypeScript**: Full type safety with comprehensive types
- 🔌 **Framework Ready**: Easy integration with NestJS, Express, Fastify, etc.
- ⚡ **Zero Config**: Works out of the box with sensible defaults

## Installation

```bash
# Using bun (recommended)
bun add @brmorillo/ids

# Using npm
npm install @brmorillo/ids

# Using yarn
yarn add @brmorillo/ids

# Using pnpm
pnpm add @brmorillo/ids
```

## Quick Start

```typescript
import { IdService } from '@brmorillo/ids';

// Get ID service instance with default configuration
const idService = IdService.getInstance();

// Generate IDs
const uuid = idService.generate();        // Default: UUID v4
const snowflake = idService.getSnowflake(); // Snowflake ID
const nanoId = idService.getNanoId();       // NanoId
```

## ID Types

### UUID v4 (Default)

- **Format**: `123e4567-e89b-12d3-a456-426614174000`
- **Use Cases**: General purpose, database primary keys, distributed systems
- **Collision Probability**: Extremely low (~1 in 10^36)
- **Sortable**: No

### Snowflake

- **Format**: `1234567890123456789` (64-bit integer as string)
- **Use Cases**: Time-ordered IDs, distributed systems, Twitter-like IDs
- **Collision Probability**: Very low with proper configuration
- **Sortable**: Yes (time-based)
- **Features**:
  - Contains timestamp
  - Worker and process ID support
  - Deconstruction to get timestamp

### NanoId

- **Format**: `V1StGXR8_Z5jdHi6B-myT` (customizable length and alphabet)
- **Use Cases**: URLs, short IDs, user-friendly identifiers
- **Collision Probability**: Configurable based on size
- **Sortable**: No
- **Features**:
  - Customizable length
  - Custom alphabet support
  - Compact and URL-safe

## Configuration

### Basic Configuration

```typescript
import { IdService } from '@brmorillo/ids';

const idService = IdService.getInstance({
  type: 'uuid-v4',  // 'uuid-v4' | 'snowflake' | 'nanoid'
});
```

### UUID v4 Configuration

```typescript
const idService = IdService.getInstance({
  type: 'uuid-v4',
});

const id = idService.getUuidV4();
// Output: '123e4567-e89b-12d3-a456-426614174000'
```

### Snowflake Configuration

```typescript
const idService = IdService.getInstance({
  type: 'snowflake',
  options: {
    workerId: 1,        // 0-31 (5 bits)
    processId: 1,       // 0-31 (5 bits)
    epoch: 1609459200000, // Custom epoch (default: 2021-01-01)
  },
});

const id = idService.getSnowflake();
// Output: '1234567890123456789'

// Deconstruct Snowflake ID to get timestamp
const generator = idService['generator'] as SnowflakeGenerator;
const parts = generator.deconstruct(id);
console.log(parts.timestamp); // Original timestamp
```

### NanoId Configuration

```typescript
const idService = IdService.getInstance({
  type: 'nanoid',
  options: {
    size: 21,  // Length of the ID (default: 21)
    alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  },
});

const id = idService.getNanoId();
// Output: 'V1StGXR8_Z5jdHi6B-myT'

// Custom size
const shortId = idService.getNanoId(10);
// Output: 'V1StGXR8_Z'
```

### Runtime Reconfiguration

```typescript
const idService = IdService.getInstance({ type: 'uuid-v4' });

// Later, switch to Snowflake
idService.configure({
  type: 'snowflake',
  options: { workerId: 2, processId: 1 },
});
```

## Usage Examples

### Basic Usage

```typescript
import { IdService } from '@brmorillo/ids';

const idService = IdService.getInstance();

// Generate different types of IDs
const uuid = idService.getUuidV4();
const snowflake = idService.getSnowflake();
const nanoId = idService.getNanoId();

console.log('UUID:', uuid);
console.log('Snowflake:', snowflake);
console.log('NanoId:', nanoId);
```

### Database Entities

```typescript
import { IdService } from '@brmorillo/ids';

class User {
  id: string;
  name: string;
  createdAt: Date;

  constructor(name: string) {
    const idService = IdService.getInstance();
    this.id = idService.getUuidV4();
    this.name = name;
    this.createdAt = new Date();
  }
}

const user = new User('Bruno');
console.log(user.id); // '123e4567-e89b-12d3-a456-426614174000'
```

### Distributed Systems with Snowflake

```typescript
import { IdService } from '@brmorillo/ids';

// Configure each service instance with unique worker/process IDs
const idService = IdService.getInstance({
  type: 'snowflake',
  options: {
    workerId: parseInt(process.env.WORKER_ID || '0'),
    processId: parseInt(process.env.PROCESS_ID || '0'),
  },
});

function createOrder() {
  const orderId = idService.getSnowflake();
  return {
    id: orderId,
    items: [],
    createdAt: new Date(),
  };
}
```

### URL-Friendly IDs with NanoId

```typescript
import { IdService } from '@brmorillo/ids';

const idService = IdService.getInstance({
  type: 'nanoid',
  options: { size: 12 }, // Shorter for URLs
});

function generateShortUrl(longUrl: string) {
  const shortId = idService.getNanoId();
  return {
    shortId,
    shortUrl: `https://short.url/${shortId}`,
    longUrl,
  };
}

const result = generateShortUrl('https://example.com/very/long/url');
console.log(result.shortUrl); // 'https://short.url/V1StGXR8_Z5j'
```

### Express.js Integration

```typescript
import express from 'express';
import { IdService } from '@brmorillo/ids';

const app = express();
const idService = IdService.getInstance();

app.post('/users', (req, res) => {
  const user = {
    id: idService.getUuidV4(),
    name: req.body.name,
    createdAt: new Date(),
  };
  
  // Save user to database
  res.status(201).json(user);
});
```

### NestJS Integration

```typescript
import { Injectable } from '@nestjs/common';
import { IdService } from '@brmorillo/ids';

@Injectable()
export class IdGeneratorService {
  private idService = IdService.getInstance({
    type: 'snowflake',
    options: {
      workerId: parseInt(process.env.WORKER_ID || '0'),
    },
  });

  generateId(): string {
    return this.idService.generate();
  }

  generateUuid(): string {
    return this.idService.getUuidV4();
  }

  generateSnowflake(): string {
    return this.idService.getSnowflake();
  }

  generateNanoId(size?: number): string {
    return this.idService.getNanoId(size);
  }
}
```

### Fastify Integration

```typescript
import Fastify from 'fastify';
import { IdService } from '@brmorillo/ids';

const fastify = Fastify();
const idService = IdService.getInstance();

fastify.post('/orders', async (request, reply) => {
  const order = {
    id: idService.getSnowflake(),
    items: request.body.items,
    createdAt: new Date(),
  };
  
  return order;
});
```

## API Reference

### IdService

#### `getInstance(options?: IdServiceOptions): IdService`

Gets the singleton instance of IdService.

```typescript
const idService = IdService.getInstance({
  type: 'uuid-v4',
  options: {},
});
```

#### `configure(options: IdServiceOptions): void`

Reconfigures the ID service with new options.

```typescript
idService.configure({ type: 'snowflake', options: { workerId: 1 } });
```

#### `generate(): string`

Generates an ID using the configured generator.

#### `getUuidV4(): string`

Generates a UUID v4 ID.

#### `getSnowflake(options?): string`

Generates a Snowflake ID with optional custom options.

```typescript
const id = idService.getSnowflake({ workerId: 2, processId: 1 });
```

#### `getNanoId(size?: number, alphabet?: string): string`

Generates a NanoId with optional custom size and alphabet.

```typescript
const id = idService.getNanoId(10);
const customId = idService.getNanoId(12, '0123456789ABCDEF');
```

### IdServiceOptions

```typescript
interface IdServiceOptions {
  type?: 'uuid-v4' | 'snowflake' | 'nanoid';  // Default: 'uuid-v4'
  options?: {
    // Snowflake options
    workerId?: number;      // 0-31
    processId?: number;     // 0-31
    epoch?: number;         // Custom epoch timestamp
    
    // NanoId options
    size?: number;          // Length of ID (default: 21)
    alphabet?: string;      // Custom alphabet
  };
}
```

## Comparison Table

| Feature | UUID v4 | Snowflake | NanoId |
|---------|---------|-----------|--------|
| **Length** | 36 chars | 19 digits | Customizable (default: 21) |
| **Sortable** | ❌ | ✅ | ❌ |
| **Time-based** | ❌ | ✅ | ❌ |
| **URL-safe** | ⚠️ (with encoding) | ✅ | ✅ |
| **Collision Risk** | Extremely Low | Very Low | Configurable |
| **Performance** | Fast | Very Fast | Very Fast |
| **Distributed** | ✅ | ✅ (with config) | ✅ |
| **Decodable** | ❌ | ✅ | ❌ |

## Best Practices

### Choosing the Right ID Type

- **UUID v4**: Use for general-purpose IDs, database primary keys, and when you don't need sortability
- **Snowflake**: Use when you need time-ordered IDs, distributed systems, or want to extract timestamp
- **NanoId**: Use for short URLs, user-facing IDs, or when you need compact identifiers

### Snowflake in Distributed Systems

```typescript
// Ensure each instance has unique worker/process IDs
const idService = IdService.getInstance({
  type: 'snowflake',
  options: {
    workerId: parseInt(process.env.WORKER_ID || '0'),  // 0-31
    processId: parseInt(process.env.PROCESS_ID || '0'), // 0-31
  },
});
```

### NanoId Size Considerations

```typescript
// For URLs: shorter is better (8-12 characters)
const shortId = idService.getNanoId(10);

// For database IDs: use default (21 characters)
const dbId = idService.getNanoId();

// For high-volume systems: larger is safer (24-32 characters)
const secureId = idService.getNanoId(32);
```

## Performance

All generators are optimized for high performance:

- **UUID v4**: ~2M ops/sec
- **Snowflake**: ~1.5M ops/sec
- **NanoId**: ~2M ops/sec

## Compatibility

- ✅ Node.js >= 18
- ✅ Bun >= 1.0
- ✅ TypeScript >= 5.0
- ✅ ES Modules and CommonJS

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © Bruno Morillo

## Related Packages

- [@brmorillo/logger](https://github.com/brmorillo/js-logger) - Flexible logging library
- [@brmorillo/utils](https://github.com/brmorillo/utils) - Utility library collection

## Support

For issues, questions, or contributions, please visit the [GitHub repository](https://github.com/brmorillo/js-ids).
