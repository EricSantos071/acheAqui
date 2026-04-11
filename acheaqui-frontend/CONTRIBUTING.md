# Contributing

Thank you for your interest in contributing to Landing Pages. This document explains how to get involved.

## Getting started

1. Fork the repository
2. Clone your fork and install dependencies:

```bash
git clone <your-fork-url>
cd landing-pages
npm install
cp .env.example .env.local
```

3. Create a branch for your changes:

```bash
git checkout -b my-feature
```

4. Start the development server:

```bash
npm run dev
```

## Development workflow

### Before submitting

Run all checks to make sure your changes are correct:

```bash
npm run typecheck    # TypeScript type checking
npm run lint         # ESLint
npm run build        # Full production build
```

All three must pass before a pull request will be reviewed.

### Commit messages

Write commit messages in present tense. Keep them focused on a single logical change.

```
Add pricing template with tier cards and feature comparison
Fix countdown timer hydration mismatch in waitlist template
Update HubSpot integration to support custom field mappings
```

## What to contribute

### New templates

If you want to add a new page template:

1. Add the type definition in `src/types/page-config.ts`
2. Create the template component in `src/components/templates/`
3. Export it from `src/components/templates/index.ts`
4. Add routing in `src/app/[...slug]/page.tsx`
5. Create an example in `data/pages/examples/`
6. Register the example in `data/pages/index.ts`
7. Add the template to the gallery in `src/app/page.tsx`

### New blocks

Reusable content sections go in `src/components/blocks/`. Each block should:

- Accept a props interface that mirrors the relevant config type
- Use standard shadcn/ui classes (not custom CSS tokens)
- Support dark mode through CSS variables
- Be self-contained with no external state dependencies

### Bug fixes

If you find a bug, open an issue first if possible. Include:

- What you expected to happen
- What actually happened
- Steps to reproduce
- Browser and Node.js version

## Code style

- TypeScript strict mode is required
- Use shadcn/ui components and classes
- Follow the existing patterns in the codebase
- Keep files under 300 lines where practical
- Use `@/` import aliases for project paths

## Pull requests

- Keep PRs focused on a single change
- Include a clear description of what changed and why
- Reference any related issues
- Make sure all checks pass before requesting review

## License

By contributing, you agree that your contributions will be licensed under the same MIT license that covers this project. See [LICENSE](LICENSE) for details.
