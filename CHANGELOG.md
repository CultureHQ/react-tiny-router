# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/) and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.0.0] - 2019-04-04
### Added
- Switched to using `@culturehq/scripts` for development.

### Changed
- We now require React `16.8` so we have access to hooks.

### Removed
- The `withRouter` component has been removed in favor of the `useRouter` hook.

## [1.0.2] - 2018-12-20
### Changed
- Simplify babel config by dropping class properties proposal.

## [1.0.1] - 2018-12-20
### Changed
- Support paths with more complex patterns by replacing with string literals instead of identifiers in the compiled AST.

## [1.0.0] - 2018-09-17
### Added
- First release! 🎉

[Unreleased]: https://github.com/CultureHQ/react-tiny-router/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/CultureHQ/react-tiny-router/compare/v1.0.2...v2.0.0
[1.0.2]: https://github.com/CultureHQ/react-tiny-router/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/CultureHQ/react-tiny-router/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/CultureHQ/react-tiny-router/compare/aee58e...v1.0.0
