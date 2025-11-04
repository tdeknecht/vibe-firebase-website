# Security Architecture Prompt for Firebase Applications

## Core Security Principles

When implementing security features in this Firebase application, ensure you follow these well-architected security principles:

### Authentication & Authorization
- **Multi-Factor Authentication**: Implement MFA for all user accounts, especially admin roles
- **OAuth Federation**: Use trusted providers (Google, GitHub, Microsoft) with proper scope limitations
- **Role-Based Access Control**: Design granular user roles with least-privilege principle
- **Session Management**: Implement secure token refresh patterns and session timeouts
- **Custom Claims**: Use Firebase custom claims for role-based authorization, not client-side role checks

### Firestore Security Rules
```javascript
// Template for secure Firestore rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Admin-only collections
    match /admin/{document=**} {
      allow read, write: if request.auth != null &&
        request.auth.token.admin == true;
    }

    // Public read, authenticated write with validation
    match /posts/{postId} {
      allow read: if true;
      allow create, update: if request.auth != null &&
        validatePostData(request.resource.data);
      allow delete: if request.auth != null &&
        (resource.data.authorId == request.auth.uid ||
         request.auth.token.admin == true);
    }
  }
}

function validatePostData(data) {
  return data.keys().hasAll(['title', 'content', 'authorId']) &&
         data.title is string && data.title.size() <= 100 &&
         data.content is string && data.content.size() <= 10000 &&
         data.authorId == request.auth.uid;
}
```

### Data Protection & Privacy
- **Input Validation**: Validate all user inputs on both client and server (Cloud Functions)
- **Data Sanitization**: Sanitize data before storage and display (XSS prevention)
- **PII Handling**: Encrypt sensitive personal data, implement data retention policies
- **GDPR Compliance**: Provide data export and deletion capabilities
- **Audit Logging**: Log all administrative actions and sensitive data access

### API Security
- **Rate Limiting**: Implement rate limiting on Cloud Functions and sensitive endpoints
- **CORS Configuration**: Properly configure CORS for your frontend domains only
- **Input Validation**: Use schema validation (Joi, Zod) for all API inputs
- **Error Handling**: Don't expose sensitive information in error messages
- **API Versioning**: Implement versioning strategy for backward compatibility

### Infrastructure Security
- **Environment Variables**: Store sensitive configuration in Firebase environment variables
- **Service Account Keys**: Rotate service account keys regularly, use IAM roles when possible
- **Network Security**: Use Firebase App Check to verify requests from legitimate clients
- **Content Security Policy**: Implement CSP headers to prevent XSS attacks
- **HTTPS Enforcement**: Ensure all communications use HTTPS/TLS

### Security Monitoring & Incident Response
- **Security Logging**: Log authentication events, failed access attempts, privilege escalations
- **Anomaly Detection**: Monitor for unusual access patterns or data access volumes
- **Incident Response Plan**: Define procedures for security breaches and data incidents
- **Regular Security Audits**: Schedule periodic reviews of security rules and access patterns
- **Vulnerability Management**: Keep dependencies updated, use automated security scanning

## Implementation Checklist

### Before Deployment
- [ ] Security rules tested with Firebase emulator
- [ ] All environment variables properly configured
- [ ] Input validation implemented on all user-facing functions
- [ ] Authentication flows tested with various OAuth providers
- [ ] Rate limiting configured for public endpoints
- [ ] Error handling doesn't expose sensitive information
- [ ] Security headers configured (CSP, HSTS, etc.)
- [ ] App Check configured for production

### Post-Deployment
- [ ] Security monitoring dashboard configured
- [ ] Audit logging enabled and monitored
- [ ] Incident response procedures documented
- [ ] Security testing performed (penetration testing if applicable)
- [ ] Team trained on security procedures
- [ ] Regular security review schedule established

## Security Testing Commands

```bash
# Test Firestore security rules
firebase emulators:start --only firestore
npm run test:security-rules

# Audit dependencies for vulnerabilities
npm audit
npm audit fix

# Run OWASP ZAP security scan (if configured)
npm run security:scan

# Test authentication flows
npm run test:auth
```

## Common Security Anti-Patterns to Avoid

- ❌ Storing sensitive data in client-side code or localStorage
- ❌ Using client-side role checks without server-side validation
- ❌ Exposing admin functionality based only on UI hiding
- ❌ Using overly permissive Firestore security rules
- ❌ Hardcoding API keys or secrets in source code
- ❌ Implementing custom authentication instead of using Firebase Auth
- ❌ Ignoring input validation on server-side functions
- ❌ Using HTTP instead of HTTPS for any communication
- ❌ Failing to implement proper session management
- ❌ Not logging security-relevant events

## Security Resources

- [Firebase Security Rules Documentation](https://firebase.google.com/docs/rules)
- [OWASP Top 10 Security Risks](https://owasp.org/www-project-top-ten/)
- [Firebase App Check Documentation](https://firebase.google.com/docs/app-check)
- [Google Cloud Security Best Practices](https://cloud.google.com/security/best-practices)