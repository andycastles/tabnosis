# Contributing

## Commit messages

This project uses [Conventional Commits](https://www.conventionalcommits.org/). Commit messages drive automatic versioning and changelog generation via the release workflow.

### Format

```
<type>[optional scope][optional !]: <description>
```

### Types and their effect on versioning

| Type | Example | Version bump |
|---|---|---|
| `fix` | `fix: correct iframe resize bug` | patch (`1.0.0` → `1.0.1`) |
| `feat` | `feat: add dark mode` | minor (`1.0.0` → `1.1.0`) |
| Any type with `!` | `feat!: redesign config format` | major (`1.0.0` → `2.0.0`) |
| `BREAKING CHANGE` footer | see below | major |
| `chore`, `docs`, `test`, `refactor`, `style`, `build`, `ci`, `perf` | `docs: update readme` | patch |

> **Note:** The `!` after the type (before the `:`) signals a breaking change — not the type itself. For example, `docs!:` is a breaking change, but `docs:` is a patch.

A breaking change can also be indicated in the commit footer:

```
feat: migrate storage format

BREAKING CHANGE: old sync storage keys are no longer read
```

### Commits that don't trigger a release

If a commit message doesn't follow the conventional format, the release workflow will skip it silently. No version bump, no tag, no release.

## Release process

Releases are fully automated. On every push to `main`:

1. The release workflow reads commits since the last tag.
2. It determines the version bump from the commit types.
3. It updates `manifest.json`, builds a zip, creates a git tag, and publishes a GitHub Release.

There is no need to manually edit the version in `manifest.json` or create git tags.
