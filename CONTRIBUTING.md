# Contributing to ZenCode AI IDE

First off, thank you for considering contributing to ZenCode AI! It's people like you that make ZenCode AI such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](.github/CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* **Use a clear and descriptive title**
* **Provide a step-by-step description** of the exact steps which reproduce the problem
* **Provide specific examples** to demonstrate the steps
* **Describe the behavior you observed** after following the steps
* **Explain which behavior you expected** to see instead and why
* **Include screenshots and animated GIFs** if possible
* **Include your environment details** (OS, Node version, browser, etc.)

### 💡 Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* **Use a clear and descriptive title**
* **Provide a step-by-step description** of the suggested enhancement
* **Provide specific examples** to demonstrate the steps
* **Describe the current behavior** and **explain the expected behavior**
* **Explain why this enhancement would be useful** to most users

### 🔧 Pull Requests

* Fill in the required template
* Follow the JavaScript/TypeScript styleguides
* Include appropriate test cases
* Update documentation as needed
* End all files with a newline
* Avoid platform-dependent code

## Development Setup

### Prerequisites

* Node.js 16 or higher
* npm or pnpm
* Git
* A code editor (VS Code recommended)

### Setup Steps

1. **Fork the repository**
```bash
# Click "Fork" on GitHub
```

2. **Clone your fork**
```bash
git clone https://github.com/YOUR-USERNAME/vscode.git
cd vscode
```

3. **Add upstream remote**
```bash
git remote add upstream https://github.com/kranthikiran885366/vscode.git
```

4. **Install dependencies**
```bash
npm install
# or
pnpm install
```

5. **Create a feature branch**
```bash
git checkout -b feature/your-feature-name
```

6. **Start development server**
```bash
npm run dev
```

7. **Make your changes**

8. **Test your changes**
```bash
npm run test
npm run lint
```

9. **Commit your changes**
```bash
git commit -m "feat: add new feature"
```

10. **Push to your fork**
```bash
git push origin feature/your-feature-name
```

11. **Create a Pull Request** on GitHub

## Styleguides

### Git Commit Messages

* Use the present tense ("add feature" not "added feature")
* Use the imperative mood ("move cursor to..." not "moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line
* Start commits with conventional commit types:
  - `feat:` - A new feature
  - `fix:` - A bug fix
  - `docs:` - Documentation only changes
  - `style:` - Changes that don't affect code meaning (formatting, etc.)
  - `refactor:` - Code changes that neither fix bugs nor add features
  - `perf:` - Code changes that improve performance
  - `test:` - Adding missing tests or correcting existing tests
  - `chore:` - Changes to build process, dependencies, etc.

### TypeScript/JavaScript Styleguide

* Use TypeScript for new code
* Use meaningful variable and function names
* Use comments for complex logic
* Follow the existing code style
* Use arrow functions when appropriate
* Prefer `const` over `let`, avoid `var`
* Use template literals for strings with variables
* Keep functions small and focused

#### Example
```typescript
// Good
const calculateTotal = (items: number[]): number => {
  return items.reduce((sum, item) => sum + item, 0)
}

// Bad
var total = 0
function calc(i) {
  for (var x = 0; x < i.length; x++) {
    total = total + i[x]
  }
  return total
}
```

### React/Component Styleguide

* Use functional components with hooks
* Props should be typed with TypeScript interfaces
* Use meaningful component names
* Keep components focused and single-responsibility
* Use composition over inheritance

#### Example
```typescript
interface ButtonProps {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary'
}

export function Button({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
    >
      {children}
    </button>
  )
}
```

### CSS/Tailwind Styleguide

* Use Tailwind CSS classes for styling
* Follow mobile-first approach
* Use semantic class names
* Avoid inline styles
* Use CSS variables for custom colors

#### Example
```jsx
<div className="flex items-center gap-4 p-4 bg-gray-900 text-white rounded-lg">
  <div className="flex-1">
    <h2 className="text-lg font-semibold">Title</h2>
    <p className="text-sm text-gray-400">Description</p>
  </div>
  <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition">
    Action
  </button>
</div>
```

## Testing

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

* Write tests for new features and bug fixes
* Aim for 80%+ code coverage
* Use descriptive test names
* Test both happy path and error cases

#### Example
```typescript
describe('calculateTotal', () => {
  it('should sum all numbers in an array', () => {
    const result = calculateTotal([1, 2, 3, 4, 5])
    expect(result).toBe(15)
  })

  it('should return 0 for empty array', () => {
    const result = calculateTotal([])
    expect(result).toBe(0)
  })

  it('should handle negative numbers', () => {
    const result = calculateTotal([1, -2, 3])
    expect(result).toBe(2)
  })
})
```

## Pull Request Process

1. Update the CHANGELOG.md with notes on your changes
2. Update the README.md if you're adding/changing features
3. Ensure all tests pass: `npm run test`
4. Ensure code is formatted: `npm run format`
5. Ensure no lint errors: `npm run lint`
6. Your PR will be reviewed by maintainers
7. Make requested changes and re-push
8. Once approved, your PR will be merged

## Additional Notes

### Issue and Pull Request Labels

* `bug` - Something isn't working
* `enhancement` - New feature or request
* `documentation` - Improvements or additions to documentation
* `good first issue` - Good for newcomers
* `help wanted` - Extra attention is needed
* `question` - Further information is requested
* `wontfix` - This will not be worked on

### Recognition

Contributors will be recognized in:
- CHANGELOG.md
- GitHub Contributors page
- Project website (if applicable)

## Questions?

* Check [GitHub Discussions](https://github.com/kranthikiran885366/vscode/discussions)
* Ask in the comments of an issue or PR
* Email: support@zencode.ai

---

**Happy coding! 🚀**
