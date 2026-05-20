# Contributing to ZenCode AI

Thank you for your interest in contributing to ZenCode AI! We're excited to work with you. This document provides guidelines and instructions for contributing.

## 🤝 Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

- Be respectful and constructive in discussions
- Welcome diverse perspectives and experiences
- Help others learn and grow
- Report inappropriate behavior to maintainers

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm
- Git
- Docker (for backend services)
- Basic knowledge of React and TypeScript

### Development Setup

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/zencode-ai.git
   cd zencode-ai
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/kranthikiran885366/zencode-ai.git
   ```

4. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

5. **Create environment file**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your settings
   ```

6. **Start development server**
   ```bash
   npm run dev
   # Server runs on http://localhost:3000
   ```

## 📝 Before You Start

### Check Existing Issues
- Search for existing issues before creating new ones
- Add to relevant discussions instead of creating duplicates
- React to issues if you have similar problems

### Create an Issue
If you found a bug or have a feature request:

1. Go to [Issues](https://github.com/kranthikiran885366/zencode-ai/issues)
2. Click "New Issue"
3. Select issue template (Bug Report or Feature Request)
4. Provide detailed information

## 🔧 Making Changes

### Create a Feature Branch

```bash
# Update main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/amazing-feature
# or for bug fixes
git checkout -b fix/bug-description
```

### Branch Naming Conventions

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Tests
- `chore/description` - Maintenance tasks

### Code Style Guidelines

#### JavaScript/TypeScript
- Use **TypeScript** for type safety
- Follow **ESLint** configuration in project
- Use **Prettier** for formatting

```bash
# Format code
npm run format

# Check linting
npm run lint
```

#### React Components
- Use functional components with hooks
- Keep components small and focused
- Use TypeScript interfaces for props

```typescript
// ✅ Good
interface ButtonProps {
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
}

const MyButton: React.FC<ButtonProps> = ({ 
  onClick, 
  disabled = false, 
  children 
}) => {
  return (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

export default MyButton
```

#### CSS/Styling
- Use **Tailwind CSS** for styling
- Follow BEM naming for custom CSS
- Organize by component

```tsx
// ✅ Good - Use Tailwind
<div className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg">
  <Icon className="w-5 h-5" />
  <span>Button text</span>
</div>
```

### Commit Messages

Follow **Conventional Commits** format:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Formatting
- `refactor:` - Code restructuring
- `perf:` - Performance improvement
- `test:` - Adding/updating tests
- `chore:` - Maintenance

**Examples:**
```bash
# Feature
git commit -m "feat(editor): add code minimap"

# Bug fix
git commit -m "fix(button): resolve hover animation issue"

# Documentation
git commit -m "docs(readme): add installation steps"

# Multiple commits
git commit -m "feat(search): add regex support

- Add regex pattern matching
- Add case sensitivity toggle
- Update search panel UI"
```

## 🧪 Testing

### Writing Tests

```bash
# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Generate coverage report
npm test -- --coverage
```

### Test Structure

```typescript
// ✅ Good test structure
describe('Button Component', () => {
  it('should render with text', () => {
    const { getByText } = render(<Button>Click me</Button>)
    expect(getByText('Click me')).toBeInTheDocument()
  })

  it('should call onClick handler', () => {
    const handleClick = jest.fn()
    const { getByRole } = render(
      <Button onClick={handleClick}>Click</Button>
    )
    fireEvent.click(getByRole('button'))
    expect(handleClick).toHaveBeenCalled()
  })
})
```

## 📤 Submitting Changes

### Push Your Changes

```bash
# Stage changes
git add .

# Commit with message
git commit -m "feat(component): add awesome feature"

# Push to your fork
git push origin feature/amazing-feature
```

### Create Pull Request

1. Go to [Pull Requests](https://github.com/kranthikiran885366/zencode-ai/pulls)
2. Click "New Pull Request"
3. Compare your branch with `upstream/main`
4. Fill out PR template:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Fixes #(issue number)

## Testing
Describe testing performed

## Checklist
- [ ] Code follows style guidelines
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No new warnings generated
```

## 🔍 PR Review Process

### What We Look For
- ✅ Code quality and style
- ✅ Test coverage
- ✅ Documentation
- ✅ No breaking changes
- ✅ Alignment with project goals

### Feedback & Iterations
- We may request changes to PRs
- Please respond to feedback promptly
- Push additional commits to address feedback
- Rebase if needed to keep commit history clean

## 📁 File Structure

### Components
```
components/
├── feature/
│   ├── component-name.tsx
│   ├── component-name.test.tsx
│   └── README.md
└── ui/
    ├── button.tsx
    └── input.tsx
```

### Pages
```
app/
├── (group)/
│   ├── page.tsx
│   └── layout.tsx
└── api/
    └── [endpoint]/
        └── route.ts
```

### Libraries
```
lib/
├── hooks/
│   └── use-something.ts
├── utils/
│   └── helper-function.ts
└── types/
    └── definitions.ts
```

## 🚀 Development Workflow Example

```bash
# 1. Create feature branch
git checkout -b feature/add-dark-mode

# 2. Make changes
# ... edit files ...

# 3. Test locally
npm run dev
npm test

# 4. Format code
npm run format

# 5. Commit changes
git commit -m "feat(theme): add dark mode support"

# 6. Push to fork
git push origin feature/add-dark-mode

# 7. Create PR on GitHub
# ... fill out PR template ...

# 8. Address feedback
# ... make requested changes ...
git commit -m "refactor(theme): improve dark mode implementation"
git push origin feature/add-dark-mode

# 9. Merge and cleanup
# After merge, delete branch
git checkout main
git pull upstream main
git branch -d feature/add-dark-mode
git push origin --delete feature/add-dark-mode
```

## 🐛 Bug Report Template

When reporting bugs, include:

```markdown
## Bug Description
Clear description of what happened

## Expected Behavior
What should have happened

## Actual Behavior
What actually happened

## Steps to Reproduce
1. Step one
2. Step two
3. Step three

## Environment
- Browser: [e.g. Chrome 120]
- OS: [e.g. Windows 11]
- Node version: [e.g. 18.12.0]

## Screenshots
[If applicable]

## Additional Context
[Any other relevant information]
```

## 💡 Feature Request Template

```markdown
## Feature Description
Clear description of proposed feature

## Use Case
Why is this feature needed?

## Proposed Solution
How should it be implemented?

## Alternatives Considered
Other approaches you've considered

## Additional Context
Any other relevant information
```

## 📚 Documentation Guidelines

### Writing Docs
- Use clear, concise language
- Include code examples
- Update table of contents
- Add links to related docs

### Code Comments
```typescript
// ✅ Good - explain WHY, not WHAT
// We cache search results for 5 minutes to reduce API calls
const cache = new Map<string, CacheEntry>()

// ❌ Avoid - obvious comments
// Set cache to new Map
const cache = new Map()
```

## 🔐 Security

### Reporting Security Issues
⚠️ **Do NOT** create public issues for security vulnerabilities!

1. Email: security@zencode.ai
2. Include detailed information
3. Allow reasonable time for patches

## 📞 Getting Help

- **Questions**: Use [GitHub Discussions](https://github.com/kranthikiran885366/zencode-ai/discussions)
- **Chat**: Join our [Discord community](https://discord.gg/zencode)
- **Email**: contact@zencode.ai

## ✨ Recognition

Contributors are recognized in:
- [CONTRIBUTORS.md](./CONTRIBUTORS.md)
- Release notes for significant contributions
- Monthly contributor spotlights

## 📝 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to ZenCode AI! 🎉**

Together, we're building the future of web-based development environments.
