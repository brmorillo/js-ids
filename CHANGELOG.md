# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.2](https://github.com/brmorillo/js-ids/compare/v1.0.1...v1.0.2) (2025-12-01)

### Bug Fixes

* maintain snowflake sequence state across multiple getId() calls ([4d3a4c6](https://github.com/brmorillo/js-ids/commit/4d3a4c6c63d96d24cf7dc2c0b17868319bc0e7fa))

## [1.0.1](https://github.com/brmorillo/js-ids/compare/v1.0.0...v1.0.1) (2025-12-01)

### Documentation

* add comprehensive README with usage examples and API reference ([9d0b457](https://github.com/brmorillo/js-ids/commit/9d0b457ad761cb722794c64e439003be493ee608))
* fix trailing newline in README ([b3c2e31](https://github.com/brmorillo/js-ids/commit/b3c2e312ae45a820a0b28deb9d6101911ef262b0))

## [1.0.0] - 2025-11-30

### Added

- Initial release
- UUIDv4 generator implementation
- Singleton pattern for IdService
- TypeScript support with full type definitions
- ESM and CommonJS module support
- Comprehensive test coverage
- Documentation and examples

### Features

- `IdService.getInstance()` - Get singleton instance
- `IdService.getId()` - Generate IDs
- `IdService.configure()` - Reconfigure generator
- Support for UUIDv4 format

### Roadmap

- UUIDv7 support (planned)
- Snowflake ID support (planned)
- CUID support (planned)
