# Security Policy

## Reporting Security Vulnerabilities

We take security seriously. If you discover a security vulnerability, please report it responsibly.

### Do NOT

❌ Do **not** open a public GitHub issue for security vulnerabilities
❌ Do **not** post about the vulnerability on social media
❌ Do **not** discuss the vulnerability in public forums

### Do

✅ **Email us immediately** at: security@zencode.ai
✅ Include as much detail as possible about the vulnerability
✅ Allow us time to patch before public disclosure
✅ Follow responsible disclosure practices

## Vulnerability Report Template

Please include the following information:

```
Subject: Security Vulnerability Report - [Brief Description]

1. Type of vulnerability:
   - SQL Injection
   - XSS (Cross-Site Scripting)
   - CSRF (Cross-Site Request Forgery)
   - Authentication/Authorization
   - Data Exposure
   - Denial of Service
   - Other: [describe]

2. Affected versions:
   - [list version numbers]

3. Description:
   - [detailed explanation of the vulnerability]

4. Steps to reproduce:
   1. [step 1]
   2. [step 2]
   3. [step 3]

5. Impact:
   - [describe potential impact]
   - Severity: Critical / High / Medium / Low

6. Proof of concept (if applicable):
   - [code snippet or test case]

7. Suggested fix (if available):
   - [your suggestion]

8. Your contact information:
   - Name: [your name]
   - Email: [your email]
   - PGP Key: [if available]
```

## Response Timeline

We commit to the following response times:

| Severity | Initial Response | Patch Release |
|----------|-----------------|----------------|
| Critical | 24 hours | 7 days |
| High | 48 hours | 14 days |
| Medium | 72 hours | 30 days |
| Low | 1 week | 90 days |

## Disclosure Process

1. **Report received** - We acknowledge receipt and assign a ticket
2. **Investigation** - We investigate and confirm the vulnerability
3. **Development** - We develop and test a patch
4. **Pre-disclosure** - We notify you before public release
5. **Publication** - We publish the fix and security advisory
6. **Credit** - We acknowledge your contribution (unless you prefer anonymity)

## Security Best Practices

### For Users

- Keep software updated to latest version
- Use strong, unique passwords
- Enable two-factor authentication when available
- Regularly review security settings
- Report suspicious activity immediately

### For Developers

- Follow OWASP Top 10 guidelines
- Use parameterized queries (prevent SQL injection)
- Sanitize user input (prevent XSS)
- Implement CSRF tokens
- Use HTTPS/TLS for all communications
- Never hardcode secrets or credentials
- Implement proper authentication/authorization
- Use environment variables for sensitive data
- Keep dependencies updated
- Run security audits regularly

```bash
# Audit dependencies
npm audit

# Fix vulnerabilities
npm audit fix

# Security scanning
npm install -g snyk
snyk test
```

## Security Headers

We implement the following security headers:

```
Content-Security-Policy: default-src 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

## Data Protection

- Passwords are hashed using bcrypt
- Sensitive data is encrypted at rest
- Data is encrypted in transit (TLS 1.2+)
- Regular security audits and penetration testing
- GDPR compliant data handling
- Regular backup and disaster recovery testing

## Third-Party Security

- Regular dependency updates
- Automated vulnerability scanning
- Only use trusted, maintained packages
- Review security advisories for dependencies

## Responsible Disclosure Timeline

We follow the 90-day responsible disclosure timeline:

- Day 0: Vulnerability reported
- Day 45: First update on progress
- Day 90: Public disclosure (with or without patch)

## PGP Key

For encrypted communication, you can use our PGP key:

```
-----BEGIN PGP PUBLIC KEY BLOCK-----
[Key details would go here]
-----END PGP PUBLIC KEY BLOCK-----
```

## Security Tools

We use the following tools to maintain security:

- **Dependabot** - Automated dependency updates
- **GitHub Security** - Code scanning and secret detection
- **Snyk** - Vulnerability scanning
- **OWASP ZAP** - Penetration testing
- **Sentry** - Error tracking and monitoring

## Compliance

We comply with:

- OWASP Top 10
- CWE Top 25
- GDPR
- CCPA
- ISO 27001 (in progress)

## Security Contacts

- **Security Email**: security@zencode.ai
- **General Email**: support@zencode.ai
- **PGP Fingerprint**: [fingerprint here]

## Acknowledgments

We deeply appreciate the security research community and thank all who have responsibly reported vulnerabilities.

## Changes to This Policy

We may update this security policy periodically. Major changes will be announced via:
- GitHub releases
- Email notification
- Security advisory

Last updated: January 2024
