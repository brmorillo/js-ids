# @brmorillo/ids - API Reference

## Quick Start

```typescript
import { IdService } from '@brmorillo/ids';

const idService = IdService.getInstance();

// Generate different types of IDs
const uuid = idService.getUuidV4();
const nanoId = idService.getNanoId();
const customNanoId = idService.getNanoId({ size: 10 });
```

## Available Methods

### ✅ getUuidV4()

Generates a random UUID v4.

```typescript
const id = idService.getUuidV4();
// '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'
```

**Use cases:**

- Database primary keys
- User IDs
- Session tokens
- Any globally unique identifier

**Characteristics:**

- 128-bit
- Globally unique
- Standard format (RFC 4122)
- 36 characters with dashes

---

### ✅ getNanoId(options?)

Generates a NanoId - URL-friendly unique string ID.

**Parameters:**

```typescript
interface NanoIdOptions {
  size?: number;      // Length of the ID (default: 21)
  alphabet?: string;  // Custom characters to use
}
```

**Examples:**

```typescript
// Default (21 characters)
const id = idService.getNanoId();
// 'V1StGXR8_Z5jdHi6B-myT'

// Custom size
const shortId = idService.getNanoId({ size: 10 });
// 'IRFa-VaY2b'

// Custom alphabet (hex only)
const hexId = idService.getNanoId({
  alphabet: '0123456789ABCDEF',
  size: 16
});
// '3A5F9B2C1D7E8F4A'

// Numbers only
const numericId = idService.getNanoId({
  alphabet: '0123456789',
  size: 12
});
// '847290561384'
```

**Use cases:**

- Short URLs
- Slugs
- Order numbers
- API keys
- Tracking IDs
- File names

**Characteristics:**

- URL-friendly (no special chars by default)
- Customizable length
- Customizable alphabet
- Compact and readable
- High entropy

---

### 🔄 getUuidV7()

*Coming soon* - Generates a time-ordered UUID v7.

```typescript
const id = idService.getUuidV7();
// Will generate: '018c3e5a-8b3e-7000-8000-000000000000'
```

**Use cases:**

- Database keys with time ordering
- Event IDs
- Log entries
- Anything requiring chronological sorting

**Characteristics:**

- Time-ordered
- Better database performance than UUID v4
- Maintains uniqueness

---

### ✅ getSnowflake(options?)

Generates a Snowflake ID using Twitter/Discord-style distributed ID algorithm (custom implementation).

**Parameters:**

```typescript
interface SnowflakeOptions {
  workerId?: number;   // Worker ID (0-31), default: 1
  processId?: number;  // Process ID (0-31), default: 1
  epoch?: number;      // Custom epoch in milliseconds, default: 946684800000 (2000-01-01)
}
```

**Examples:**

```typescript
// Default Snowflake
const id = idService.getSnowflake({ workerId: 1, processId: 1 });
console.log(id); // '3430507852857348096'

// With custom workerId and processId
const customId = idService.getSnowflake({
  workerId: 5,
  processId: 10
});
console.log(customId); // '5723891476890624001'

// With custom epoch
const timestampId = idService.getSnowflake({
  workerId: 1,
  processId: 1,
  epoch: 1577836800000  // 2020-01-01 in milliseconds
});
console.log(timestampId); // '5723891476890624002'
```

**ID Structure (64 bits):**

- 41 bits: Timestamp (milliseconds since epoch)
- 5 bits: Worker ID (0-31)
- 5 bits: Process ID (0-31)
- 12 bits: Sequence number (0-4095)

**Use cases:**

- Distributed systems
- Microservices architecture
- Multi-datacenter deployments
- High-throughput systems
- Twitter-like applications

**Characteristics:**

- 64-bit integer
- Time-ordered
- Distributed generation (no coordination needed)
- K-sortable (ordered by time)
- No collision in distributed environment

---

### 🔄 getCuid()

*Coming soon* - Generates a CUID (Collision-resistant Unique IDentifier).

```typescript
const id = idService.getCuid();
// Will generate: 'clh5z8kqt0000qzrmn5b8t2j4'
```

**Use cases:**

- Horizontal scaling
- Distributed databases
- Client-side ID generation
- Offline-first applications

**Characteristics:**

- Collision-resistant
- Horizontally scalable
- Optimized for distributed systems
- Shorter than UUID

---

## Comparison Table

| Method | Status | Length | Format | Sortable | Params |
|--------|--------|--------|--------|----------|--------|
| `getUuidV4()` | ✅ | 36 | `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx` | ❌ | None |
| `getNanoId()` | ✅ | Custom (default 21) | URL-friendly string | ❌ | `{ size?, alphabet? }` |
| `getSnowflake()` | ✅ | 19 | Numeric string | ✅ | `{ workerId?, processId?, epoch? }` |
| `getUuidV7()` | 🔄 | 36 | `xxxxxxxx-xxxx-7xxx-xxxx-xxxxxxxxxxxx` | ✅ | None |
| `getCuid()` | 🔄 | 25 | Alphanumeric string | ✅ | None |

---

## Usage in NestJS

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { IdService } from '@brmorillo/ids';

@Module({
  providers: [
    {
      provide: 'ID_SERVICE',
      useFactory: () => IdService.getInstance(),
    },
  ],
  exports: ['ID_SERVICE'],
})
export class AppModule {}

// person.service.ts
@Injectable()
export class PersonService {
  constructor(
    @Inject('ID_SERVICE') private ids: IdService
  ) {}

  async create(data: CreatePersonDto) {
    // Use any method you need
    const id = this.ids.getUuidV4();
    // OR
    const id = this.ids.getNanoId({ size: 10 });
    // OR
    const id = this.ids.getSnowflake({ workerId: 1, datacenterId: 1 });

    return this.prisma.person.create({
      data: { id, ...data }
    });
  }
}
```

---

## Real-World Examples

### 1. E-commerce Order System

```typescript
// Order ID (short, user-friendly)
const orderId = idService.getNanoId({
  alphabet: '0123456789',
  size: 12
});
console.log(`Order #${orderId}`); // Order #847290561384

// Tracking number (alphanumeric)
const trackingId = idService.getNanoId({ size: 16 });
console.log(`Track: ${trackingId}`); // Track: V1StGXR8_Z5jdHi6
```

### 2. URL Shortener

```typescript
const slug = idService.getNanoId({ size: 8 });
console.log(`https://short.ly/${slug}`); // https://short.ly/a4B8x3Qz
```

### 3. API Key Generation

```typescript
const apiKey = idService.getNanoId({ size: 32 });
console.log(`API-${apiKey}`); // API-V1StGXR8_Z5jdHi6B-myTIRFa-VaY2b
```

### 4. Database Primary Keys

```typescript
// Users table
const userId = idService.getUuidV4();

// Products table  
const productId = idService.getUuidV4();

// Orders table
const orderId = idService.getUuidV4();
```

### 5. Hex-based System IDs

```typescript
const hexId = idService.getNanoId({
  alphabet: '0123456789ABCDEF',
  size: 16
});
console.log(`0x${hexId}`); // 0x3A5F9B2C1D7E8F4A
```

---

## Performance Notes

- **UUID v4**: ~2M ops/sec
- **NanoId**: ~3M ops/sec
- **UUID v7**: ~2M ops/sec (when implemented)
- **Snowflake**: ~10M ops/sec (when implemented)
- **CUID**: ~500K ops/sec (when implemented)

---

## Security Considerations

### UUID v4

✅ Cryptographically random
✅ Safe for security tokens
✅ Unpredictable

### NanoId

✅ Cryptographically random (default)
✅ Customizable entropy
⚠️ Security depends on alphabet choice
⚠️ Shorter IDs = less entropy

### Snowflake

⚠️ Time-based (partially predictable)
⚠️ Not suitable for security tokens
✅ Unique across distributed systems

---

## When to Use What?

| Scenario | Recommended Method |
|----------|-------------------|
| User IDs | `getUuidV4()` |
| Session tokens | `getUuidV4()` |
| Database primary keys | `getUuidV4()` or `getUuidV7()` |
| Short URLs | `getNanoId({ size: 6-8 })` |
| Order numbers | `getNanoId({ alphabet: '0-9', size: 12 })` |
| API keys | `getNanoId({ size: 32 })` |
| File names | `getNanoId({ size: 16 })` |
| Distributed systems | `getSnowflake()` (when available) |
| Offline-first apps | `getCuid()` (when available) |

---

## Migration Guide

If you're using the old API:

```typescript
// Old way (still works)
const idService = IdService.getInstance({ type: 'uuidv4' });
const id = idService.getId();

// New way (recommended)
const idService = IdService.getInstance();
const id = idService.getUuidV4();
```

Both APIs are supported! The new methods give you more flexibility. 🎯
