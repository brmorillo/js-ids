# Contributing to @brmorillo/ids

Thank you for your interest in contributing to @brmorillo/ids! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please be respectful and constructive in all interactions.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/js-ids.git`
3. Install dependencies: `bun install`
4. Create a branch: `git checkout -b feature/your-feature-name`

## Development Workflow

### Setup

```bash
# Install dependencies
bun install

# Run tests
bun test

# Run tests in watch mode
bun run test:watch

# Build the project
bun run build

# Lint code
bun run lint

# Format code
bun run format
```

### Making Changes

1. **Write Tests**: Add tests for any new functionality
2. **Write Code**: Implement your feature or fix
3. **Run Tests**: Ensure all tests pass with `bun test`
4. **Lint**: Run `bun run lint` to check code quality
5. **Format**: Run `bun run format` to format code
6. **Type Check**: Run `bun run type-check` to verify TypeScript

### Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:

```
feat: add UUID v7 generator
fix: correct UUID v4 validation regex
docs: update README with Snowflake examples
```

### Pull Request Process

1. Update the README.md with details of changes if needed
2. Update the CHANGELOG.md following Keep a Changelog format
3. Ensure all tests pass and code is properly formatted
4. The PR will be merged once you have the approval of a maintainer

## Project Structure

```
src/
├── interfaces/         # TypeScript interfaces and types
├── generators/        # ID generator implementations
├── services/          # Service layer (IdService)
└── index.ts          # Public API exports
```

## Adding a New ID Generator

To add a new ID generator:

1. **Create the generator class** in `src/generators/`:

   ```typescript
   import { IIdGenerator } from '../interfaces/id-generator.interface';

   export class MyGenerator implements IIdGenerator {
     public getId(): string {
       // Implementation
     }
   }
   ```

2. **Add tests** in `src/generators/my-generator.spec.ts`

3. **Update the interface** in `src/interfaces/id-generator.interface.ts`:
   - Add type to `IdGeneratorType`
   - Add options interface if needed

4. **Update IdService** in `src/services/id.service.ts`:
   - Add case to `createGenerator()` method

5. **Export** in `src/index.ts`

6. **Update README.md** with usage examples

7. **Update CHANGELOG.md** with the new feature

## Testing

We use Bun's built-in test runner.

### Writing Tests

```typescript
import { describe, it, expect } from 'bun:test';

describe('MyGenerator', () => {
  it('should generate valid IDs', () => {
    const generator = new MyGenerator();
    const id = generator.getId();
    expect(id).toBeDefined();
  });
});
```

### Running Tests

```bash
# Run all tests
bun test

# Run tests in watch mode
bun run test:watch

# Run tests with coverage
bun run test:coverage
```

## Code Style

- Use TypeScript
- Follow existing code style
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions small and focused

## Questions?

Feel free to open an issue for any questions or concerns.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
