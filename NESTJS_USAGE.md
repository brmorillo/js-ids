# Example: Using @brmorillo/ids in NestJS

This document shows how to integrate `@brmorillo/ids` in a NestJS application.

## Installation

```bash
npm install @brmorillo/ids
# or
pnpm add @brmorillo/ids
# or
bun add @brmorillo/ids
```

## Configuration in app.module.ts

### Option 1: Single Global Instance

```typescript
import { Module } from '@nestjs/common';
import { IdService } from '@brmorillo/ids';

@Module({
  providers: [
    {
      provide: 'ID_SERVICE',
      useFactory: () => {
        // Configure with UUIDv4 (default)
        return IdService.getInstance({
          type: 'uuidv4',
        });
      },
    },
  ],
  exports: ['ID_SERVICE'],
})
export class AppModule {}
```

### Option 2: Multiple ID Services (Recommended)

Configure different ID generators for different use cases:

```typescript
import { Module, Global } from '@nestjs/common';
import { IdService } from '@brmorillo/ids';

@Global()
@Module({
  providers: [
    // Default ID Service (UUIDv4)
    {
      provide: 'ID_SERVICE',
      useFactory: () => IdService.getInstance(),
    },
    // UUID v4 Service
    {
      provide: 'UUID_V4_SERVICE',
      useFactory: () => IdService.getInstance({ type: 'uuidv4' }),
    },
    // UUID v7 Service (time-ordered) - Coming Soon
    {
      provide: 'UUID_V7_SERVICE',
      useFactory: () => IdService.getInstance({ type: 'uuidv7' }),
    },
    // NanoId Service (URL-friendly, customizable) with default config
    {
      provide: 'NANO_ID_SERVICE',
      useFactory: () => IdService.getInstance({
        nanoid: { size: 21 } // Default configuration
      }),
    },
    // Snowflake Service (distributed, time-ordered) with workerId and processId
    {
      provide: 'SNOWFLAKE_SERVICE',
      useFactory: () => IdService.getInstance({
        snowflake: {
          workerId: parseInt(process.env.WORKER_ID || '1'),
          processId: parseInt(process.env.PROCESS_ID || '1'),
          epoch: 1733011200000 // 2025-12-01 (optional, defaults to 2025-12-01)
        }
      }),
    },
    // CUID Service (collision-resistant) - Coming Soon
    {
      provide: 'CUID_SERVICE',
      useFactory: () => IdService.getInstance(),
    },
  ],
  exports: [
    'ID_SERVICE',
    'UUID_V4_SERVICE',
    'UUID_V7_SERVICE',
    'NANO_ID_SERVICE',
    'SNOWFLAKE_SERVICE',
    'CUID_SERVICE',
  ],
})
export class AppModule {}
```

## Using in a Service

### Example 1: Using Specific ID Methods (Recommended)

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { IdService } from '@brmorillo/ids';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @Inject('ID_SERVICE')
    private readonly idService: IdService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Generate UUID v4 for user ID
    const id = this.idService.getUuidV4();

    const user = this.userRepository.create({
      id,
      ...createUserDto,
    });

    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: string): Promise<User> {
    return this.userRepository.findOne({ where: { id } });
  }
}
```

### Example 2: Using Multiple ID Services

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { IdService } from '@brmorillo/ids';

@Injectable()
export class OrderService {
  constructor(
    @Inject('UUID_V4_SERVICE')
    private readonly uuidService: IdService,
    @Inject('NANO_ID_SERVICE')
    private readonly nanoIdService: IdService,
    @Inject('SNOWFLAKE_SERVICE')
    private readonly snowflakeService: IdService,
  ) {}

  async createOrder(data: CreateOrderDto) {
    // Use UUID v4 for order ID
    const orderId = this.uuidService.getUuidV4();
    
    // Use NanoId for tracking number (short, URL-friendly)
    const trackingNumber = this.nanoIdService.getNanoId({ size: 12 });
    
    // Use Snowflake for distributed event ID (time-ordered)
    // No need to pass workerId/processId - uses configuration from module
    const eventId = this.snowflakeService.getSnowflake();

    return {
      id: orderId,
      trackingNumber,
      eventId,
      ...data,
    };
  }
}
```

### Example 3: Different ID Types for Different Use Cases

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { IdService } from '@brmorillo/ids';

@Injectable()
export class ProductService {
  constructor(
    @Inject('ID_SERVICE')
    private readonly idService: IdService,
  ) {}

  async createProduct(data: CreateProductDto) {
    // UUID v4 for primary key
    const productId = this.idService.getUuidV4();
    
    // NanoId for SKU (short, readable)
    const sku = this.idService.getNanoId({ 
      size: 10,
      alphabet: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    });
    
    // NanoId for slug (URL-friendly)
    const slug = `${data.name.toLowerCase().replace(/\s+/g, '-')}-${this.idService.getNanoId({ size: 8 })}`;

    return {
      id: productId,
      sku,
      slug,
      ...data,
    };
  }

  async generateApiKey(userId: string) {
    // Long NanoId for secure API keys
    const apiKey = this.idService.getNanoId({ size: 32 });
    
    return {
      userId,
      apiKey,
      createdAt: new Date(),
    };
  }

  async generateShortUrl(longUrl: string) {
    // Short NanoId for URL shortener
    const shortCode = this.idService.getNanoId({ size: 7 });
    
    return {
      shortCode,
      longUrl,
      shortUrl: `https://short.url/${shortCode}`,
    };
  }
}
```

### Example 4: Using UUIDv7 (Time-ordered) - Coming Soon

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { IdService } from '@brmorillo/ids';

@Injectable()
export class EventService {
  constructor(
    @Inject('UUID_V7_SERVICE')
    private readonly uuidV7Service: IdService,
  ) {}

  async logEvent(eventData: any) {
    // UUID v7 is time-ordered, great for logs and events
    const eventId = this.uuidV7Service.getUuidV7();
    
    return {
      id: eventId,
      ...eventData,
      timestamp: new Date(),
    };
  }
}
```

### Example 5: Using Snowflake IDs (Distributed Systems)

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { IdService } from '@brmorillo/ids';

@Injectable()
export class MessageService {
  constructor(
    @Inject('SNOWFLAKE_SERVICE')
    private readonly snowflakeService: IdService,
  ) {}

  async sendMessage(content: string, channelId: string) {
    // Snowflake IDs are great for distributed, high-throughput systems
    // Uses workerId and processId from module configuration
    const messageId = this.snowflakeService.getSnowflake();
    
    // Can override configuration for specific use case
    const reactionId = this.snowflakeService.getSnowflake({
      workerId: 2,  // Override for reactions
      processId: 1,
      epoch: 1577836800000 // 2020-01-01 in milliseconds (custom epoch example)
    });
    
    return {
      id: messageId,
      content,
      channelId,
      reactions: [],
      createdAt: new Date(),
    };
  }
}
```

### Example 6: Using CUID (Collision-resistant) - Coming Soon

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { IdService } from '@brmorillo/ids';

@Injectable()
export class SessionService {
  constructor(
    @Inject('CUID_SERVICE')
    private readonly cuidService: IdService,
  ) {}

  async createSession(userId: string) {
    // CUID is great for distributed systems and client-side generation
    const sessionId = this.cuidService.getCuid();
    
    return {
      id: sessionId,
      userId,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };
  }
}
```

## Using in a Controller

### Example 1: Basic Controller with Single ID Service

```typescript
import { Controller, Post, Get, Param, Body, Inject } from '@nestjs/common';
import { IdService } from '@brmorillo/ids';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UserController {
  constructor(
    @Inject('ID_SERVICE')
    private readonly idService: IdService,
    private readonly userService: UserService,
  ) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  async findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Get('generate/uuid')
  generateUuid() {
    return {
      uuid: this.idService.getUuidV4(),
      type: 'UUIDv4',
      timestamp: new Date(),
    };
  }

  @Get('generate/nanoid')
  generateNanoId() {
    return {
      id: this.idService.getNanoId(),
      shortId: this.idService.getNanoId({ size: 10 }),
      hexId: this.idService.getNanoId({ 
        alphabet: '0123456789ABCDEF', 
        size: 16 
      }),
      type: 'NanoId',
      timestamp: new Date(),
    };
  }

  @Get('generate/snowflake')
  generateSnowflake() {
    return {
      id: this.idService.getSnowflake(), // Uses module configuration
      customOverride: this.idService.getSnowflake({ 
        workerId: 5,
        processId: 10,
        epoch: 1577836800000 // Override with custom epoch (2020-01-01)
      }),
      type: 'Snowflake',
      timestamp: new Date(),
    };
  }
}
```

### Example 2: Controller with Multiple ID Services

```typescript
import { Controller, Post, Get, Inject } from '@nestjs/common';
import { IdService } from '@brmorillo/ids';

@Controller('id-generator')
export class IdGeneratorController {
  constructor(
    @Inject('UUID_V4_SERVICE')
    private readonly uuidV4Service: IdService,
    @Inject('NANO_ID_SERVICE')
    private readonly nanoIdService: IdService,
    @Inject('SNOWFLAKE_SERVICE')
    private readonly snowflakeService: IdService,
  ) {}

  @Get('uuid/v4')
  generateUuidV4() {
    return {
      id: this.uuidV4Service.getUuidV4(),
      format: 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx',
      length: 36,
      type: 'UUIDv4',
      useCase: 'Database primary keys, user IDs, session tokens',
    };
  }

  @Get('uuid/v7')
  generateUuidV7() {
    try {
      return {
        id: this.uuidV4Service.getUuidV7(),
        format: 'xxxxxxxx-xxxx-7xxx-xxxx-xxxxxxxxxxxx',
        length: 36,
        type: 'UUIDv7',
        useCase: 'Time-ordered database keys, event IDs',
      };
    } catch (error) {
      return {
        error: error.message,
        status: 'Coming soon',
      };
    }
  }

  @Get('nanoid/default')
  generateNanoId() {
    return {
      id: this.nanoIdService.getNanoId(),
      length: 21,
      type: 'NanoId',
      useCase: 'Short URLs, slugs, file names',
    };
  }

  @Get('nanoid/short')
  generateShortNanoId() {
    return {
      id: this.nanoIdService.getNanoId({ size: 8 }),
      length: 8,
      type: 'NanoId (Short)',
      useCase: 'Very short URLs, codes',
    };
  }

  @Get('nanoid/custom')
  generateCustomNanoId() {
    return {
      numeric: this.nanoIdService.getNanoId({ 
        alphabet: '0123456789', 
        size: 12 
      }),
      hex: this.nanoIdService.getNanoId({ 
        alphabet: '0123456789ABCDEF', 
        size: 16 
      }),
      alphanumeric: this.nanoIdService.getNanoId({ 
        alphabet: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 
        size: 10 
      }),
      type: 'NanoId (Custom)',
      useCase: 'Order numbers, tracking codes, custom formats',
    };
  }

  @Get('snowflake/default')
  generateSnowflake() {
    return {
      id: this.snowflakeService.getSnowflake(), // Uses config from module
      type: 'Snowflake',
      epoch: 'From module config',
      useCase: 'Distributed systems, microservices, Discord/Twitter-like apps',
    };
  }

  @Get('snowflake/custom')
  generateCustomSnowflake() {
    return {
      id: this.snowflakeService.getSnowflake({ 
        workerId: 5,   // Override module config
        processId: 10,
        epoch: 1577836800000 // 2020-01-01
      }),
      type: 'Snowflake (Custom)',
      epoch: '2020-01-01',
      workerId: 5,
      processId: 10,
      useCase: 'Override module configuration for specific needs',
    };
  }

  @Get('cuid')
  generateCuid() {
    try {
      return {
        id: this.uuidV4Service.getCuid(),
        type: 'CUID',
        useCase: 'Collision-resistant, distributed, offline-first apps',
      };
    } catch (error) {
      return {
        error: error.message,
        status: 'Coming soon',
      };
    }
  }

  @Post('batch')
  generateBatch() {
    return {
      uuidV4: Array.from({ length: 5 }, () => this.uuidV4Service.getUuidV4()),
      nanoId: Array.from({ length: 5 }, () => this.nanoIdService.getNanoId()),
      snowflake: Array.from({ length: 5 }, () => this.snowflakeService.getSnowflake()), // Uses module config
      timestamp: new Date(),
    };
  }
}
```

## Entity Example

```typescript
import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryColumn('varchar', { length: 36 })
  id: string; // Will be populated with UUIDv4

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @CreateDateColumn()
  createdAt: Date;
}
```

## Global Module Pattern (Recommended)

Create a dedicated global module for ID generation with all ID types:

```typescript
// id.module.ts
import { Module, Global } from '@nestjs/common';
import { IdService } from '@brmorillo/ids';

@Global()
@Module({
  providers: [
    // Default ID Service (uses all methods)
    {
      provide: 'ID_SERVICE',
      useFactory: () => IdService.getInstance(),
    },
    // UUID v4 Service - Random, globally unique
    {
      provide: 'UUID_V4_SERVICE',
      useFactory: () => IdService.getInstance(),
    },
    // UUID v7 Service - Time-ordered (Coming Soon)
    {
      provide: 'UUID_V7_SERVICE',
      useFactory: () => IdService.getInstance(),
    },
    // NanoId Service - URL-friendly, customizable
    {
      provide: 'NANO_ID_SERVICE',
      useFactory: () => IdService.getInstance({
        nanoid: { size: 21 } // Default size
      }),
    },
    // Snowflake Service - Distributed, time-ordered
    {
      provide: 'SNOWFLAKE_SERVICE',
      useFactory: () => IdService.getInstance({
        snowflake: {
          workerId: parseInt(process.env.WORKER_ID || '1'),
          processId: parseInt(process.env.PROCESS_ID || '1')
          // epoch is optional, defaults to 2025-12-01
        }
      }),
    },
    // CUID Service - Collision-resistant (Coming Soon)
    {
      provide: 'CUID_SERVICE',
      useFactory: () => IdService.getInstance(),
    },
  ],
  exports: [
    'ID_SERVICE',
    'UUID_V4_SERVICE',
    'UUID_V7_SERVICE',
    'NANO_ID_SERVICE',
    'SNOWFLAKE_SERVICE',
    'CUID_SERVICE',
  ],
})
export class IdModule {}
```

Then import it in your app.module.ts:

```typescript
import { Module } from '@nestjs/common';
import { IdModule } from './infrastructure/id/id.module';
import { UserModule } from './modules/user/user.module';
import { OrderModule } from './modules/order/order.module';
import { ProductModule } from './modules/product/product.module';

@Module({
  imports: [
    IdModule, // Import globally - available in all modules
    UserModule,
    OrderModule,
    ProductModule,
    // ... other modules
  ],
})
export class AppModule {}
```

Now you can inject any ID service in any module without importing IdModule again:

```typescript
// user.service.ts
@Injectable()
export class UserService {
  constructor(
    @Inject('UUID_V4_SERVICE')
    private readonly ids: IdService,
  ) {}
}

// order.service.ts
@Injectable()
export class OrderService {
  constructor(
    @Inject('NANO_ID_SERVICE')
    private readonly ids: IdService,
  ) {}
}

// message.service.ts
@Injectable()
export class MessageService {
  constructor(
    @Inject('SNOWFLAKE_SERVICE')
    private readonly ids: IdService,
  ) {}
}
```

## Configuration Service Pattern

For more advanced configuration using ConfigService:

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IdService } from '@brmorillo/ids';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [
    {
      provide: 'ID_SERVICE',
      useFactory: (configService: ConfigService) => {
        const idType = configService.get('ID_GENERATOR_TYPE', 'uuidv4');
        
        if (idType === 'snowflake') {
          return IdService.getInstance({
            type: 'snowflake',
            snowflake: {
              workerId: configService.get('ID_WORKER_ID', 1),
              processId: configService.get('ID_PROCESS_ID', 1),
            },
          });
        }
        
        return IdService.getInstance({
          type: idType as 'uuidv4' | 'uuidv7' | 'cuid',
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: ['ID_SERVICE'],
})
export class AppModule {}
```

Then in your `.env` file:

```env
ID_GENERATOR_TYPE=uuidv4
# For Snowflake:
# ID_GENERATOR_TYPE=snowflake
# ID_WORKER_ID=1
# ID_PROCESS_ID=1
```

## Testing

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { IdService } from '@brmorillo/ids';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

describe('UserService', () => {
  let service: UserService;
  let idService: IdService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: 'ID_SERVICE',
          useFactory: () => IdService.getInstance({ type: 'uuidv4' }),
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    idService = module.get<IdService>('ID_SERVICE');
  });

  it('should generate valid UUID when creating user', async () => {
    const createUserDto = {
      name: 'Test User',
      email: 'test@example.com',
    };

    const mockUser = {
      id: idService.getId(),
      ...createUserDto,
    };

    mockRepository.create.mockReturnValue(mockUser);
    mockRepository.save.mockResolvedValue(mockUser);

    const result = await service.create(createUserDto);

    expect(result.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });
});
```

## Use Case Recommendations

### When to Use Each ID Type

| ID Type | Best For | Characteristics | Inject Token |
|---------|----------|-----------------|--------------|
| **UUIDv4** | Database primary keys, User IDs, Session tokens | Random, globally unique, standard format | `UUID_V4_SERVICE` |
| **UUIDv7** | Event IDs, Log entries, Time-ordered records | Time-ordered, database-friendly | `UUID_V7_SERVICE` |
| **NanoId** | Short URLs, Slugs, API keys, File names | URL-friendly, customizable, compact | `NANO_ID_SERVICE` |
| **Snowflake** | Distributed systems, Microservices, High-throughput | Time-ordered, distributed, no coordination | `SNOWFLAKE_SERVICE` |
| **CUID** | Client-side generation, Offline-first apps | Collision-resistant, horizontally scalable | `CUID_SERVICE` |

### Practical Examples by Domain

```typescript
// E-commerce
@Injectable()
export class EcommerceService {
  constructor(
    @Inject('UUID_V4_SERVICE') private uuidService: IdService,
    @Inject('NANO_ID_SERVICE') private nanoService: IdService,
    @Inject('SNOWFLAKE_SERVICE') private snowflakeService: IdService,
  ) {}

  createOrder() {
    return {
      orderId: this.uuidService.getUuidV4(),              // User-facing ID
      trackingNumber: this.nanoService.getNanoId({ size: 12 }), // Short tracking
      internalEventId: this.snowflakeService.getSnowflake(),    // Uses module config
    };
  }
}

// Social Media
@Injectable()
export class SocialService {
  constructor(
    @Inject('SNOWFLAKE_SERVICE') private snowflakeService: IdService,
    @Inject('NANO_ID_SERVICE') private nanoService: IdService,
  ) {}

  createPost() {
    return {
      postId: this.snowflakeService.getSnowflake(),      // Uses module config
      shortUrl: this.nanoService.getNanoId({ size: 8 }), // Share link
    };
  }
}

// SaaS Application
@Injectable()
export class SaasService {
  constructor(
    @Inject('UUID_V4_SERVICE') private uuidService: IdService,
    @Inject('NANO_ID_SERVICE') private nanoService: IdService,
  ) {}

  createTenant() {
    return {
      tenantId: this.uuidService.getUuidV4(),           // Tenant identifier
      apiKey: this.nanoService.getNanoId({ size: 32 }), // API authentication
      subdomain: this.nanoService.getNanoId({ size: 8 }), // Custom subdomain
    };
  }
}
```

## Benefits

- ✅ Centralized ID generation configuration
- ✅ Easy to switch between different ID generators
- ✅ Type-safe with TypeScript
- ✅ Singleton pattern ensures consistency
- ✅ Testable with dependency injection
- ✅ Environment-based configuration support
- ✅ Multiple ID types available in single service
- ✅ No need to install multiple ID libraries
- ✅ Consistent API across all ID types
- ✅ Global module pattern for easy access
