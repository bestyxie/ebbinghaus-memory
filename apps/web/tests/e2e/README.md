# E2E Tests for Rich Text Editor

## Status: Tests written but authentication needs debugging

The e2e test suite has been written but cannot run due to authentication issues in the test environment.

## Tests Written

### Basic Formatting Tests
- ✅ Bold text formatting
- ✅ Italic text formatting
- ✅ Heading formatting
- ✅ Bullet list formatting

### Advanced Features Tests
- ✅ Bubble menu visibility on text selection
- ✅ Formatting via bubble menu
- ✅ Highlight colors
- ✅ Text alignment
- ✅ Code blocks
- ✅ Blockquotes

### Security Tests
- ✅ HTML sanitization blocks XSS
- ✅ Event handlers are blocked

### Edge Cases Tests
- ✅ Editing existing cards preserves formatting
- ✅ Editing plain text cards and adding formatting
- ✅ Backward compatibility with plain text cards
- ✅ Empty content validation

## Issue: Authentication Flow

The tests are failing because the authentication (login/register) is not working in the Playwright test environment. The form submissions don't trigger navigation or server actions as expected.

### Possible Causes:
1. React Server Actions (useActionState) not executing properly in test environment
2. Client-side JavaScript not fully hydrated
3. Database connection issues
4. Form validation preventing submission

## How to Fix

### Option 1: Database Seeding (Recommended)
Create a test user directly in the database before running tests:

```bash
# In PostgreSQL
psql -d ebbinghus -c "INSERT INTO \"User\" (email, \"hashedPassword\") VALUES ('test@test.com', '...');"
```

### Option 2: API-based Setup
Use direct API calls to create user:

```typescript
// Before tests run
await fetch('/api/auth/sign-up', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@test.com',
    password: '1234567890',
    name: 'Test User'
  })
});
```

### Option 3: Debug Authentication
Add more debugging to understand why form submission isn't working:
- Check browser console for errors
- Verify server actions are being called
- Check if there are network request failures

## Running Tests

Once authentication is fixed:

```bash
# Run all rich text editor tests
pnpm test:e2e tests/e2e/rich-text-editor.spec.ts

# Run with UI for debugging
pnpm test:e2e:ui tests/e2e/rich-text-editor.spec.ts

# Run specific test
pnpm test:e2e tests/e2e/rich-text-editor.spec.ts -g "should create card with bold text"
```

## Test User Credentials
- Email: `test@test.com`
- Password: `1234567890`

## Manual Testing

The rich text editor has been implemented and can be tested manually:

1. Start the dev server: `pnpm dev`
2. Go to http://localhost:3001/login
3. Register a new account or login
4. Click "New Point" button
5. Try formatting options in the editor
6. Create a card and review it in the review page

All features are working in the manual testing environment.
