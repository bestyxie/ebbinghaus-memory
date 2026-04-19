import { FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('Global setup: Ensuring test user exists...');

  // Wait for server to be ready
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Use better-auth API to register the test user
  try {
    const response = await fetch('http://localhost:3001/api/auth/sign-up/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3001',
      },
      body: JSON.stringify({
        email: 'test@test.com',
        password: '1234567890',
        name: 'Test User',
        callbackURL: '/dashboard',
      }),
    });

    if (response.ok) {
      console.log('Test user created successfully');
      return;
    }

    const text = await response.text();
    if (response.status === 422 || text.includes('USER_ALREADY_EXISTS')) {
      // User already exists, that's fine
      console.log('Test user already exists');
    } else {
      console.log('Failed to create test user:', response.status, text);
    }
  } catch (error) {
    console.log('Error creating test user:', error);
    // Don't fail setup, tests will handle auth
  }
}

export default globalSetup;
