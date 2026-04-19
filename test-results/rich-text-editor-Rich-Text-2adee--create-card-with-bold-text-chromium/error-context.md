# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: rich-text-editor.spec.ts >> Rich Text Editor - Create Card >> should create card with bold text
- Location: tests/e2e/rich-text-editor.spec.ts:10:3

# Error details

```
TimeoutError: page.waitForURL: Timeout 15000ms exceeded.
=========================== logs ===========================
waiting for navigation to "/dashboard" until "load"
============================================================
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e4]:
    - generic [ref=e5]:
      - heading "登录" [level=2] [ref=e6]
      - paragraph [ref=e7]: 欢迎回来！请登录您的账户
    - generic [ref=e8]:
      - generic [ref=e9]:
        - generic [ref=e10]:
          - generic [ref=e11]: 邮箱
          - textbox "邮箱" [ref=e12]:
            - /placeholder: 请输入邮箱地址
        - generic [ref=e13]:
          - generic [ref=e14]: 密码
          - generic [ref=e15]:
            - textbox "密码" [ref=e16]:
              - /placeholder: 请输入密码
            - button [ref=e17]:
              - img [ref=e18]
      - button "登录" [ref=e22]
      - paragraph [ref=e24]:
        - text: 还没有账户？
        - button "立即注册" [ref=e25]
  - button "v3.0.2 Output Detail Standard React Components Hide Until Restart Marker Color Clear on copy/send Block page interactions Manage MCP & Webhooks Manage MCP & Webhooks MCP Connection MCP connection allows agents to receive and act on annotations. Learn more Webhooks Auto-Send The webhook URL will receive live annotation changes and annotation data." [ref=e27] [cursor=pointer]:
    - img [ref=e29]
    - generic:
      - generic:
        - button:
          - img
      - generic:
        - button:
          - img
      - generic:
        - button [disabled]:
          - img
      - generic:
        - button [disabled]:
          - img
      - generic:
        - button [disabled]:
          - img
      - generic:
        - button [disabled]:
          - img
      - generic:
        - button:
          - img
      - generic:
        - button:
          - img
    - generic:
      - generic:
        - generic:
          - generic:
            - link:
              - /url: https://agentation.com
              - img
            - paragraph: v3.0.2
            - button "Switch to light mode":
              - generic:
                - generic:
                  - img
          - generic:
            - generic:
              - generic:
                - text: Output Detail
                - generic:
                  - img
              - button "Standard":
                - generic: Standard
            - generic:
              - generic:
                - text: React Components
                - generic:
                  - img
              - generic:
                - checkbox [checked]
            - generic:
              - generic:
                - text: Hide Until Restart
                - generic:
                  - img
              - generic:
                - checkbox
          - generic:
            - generic: Marker Color
            - generic:
              - button "Indigo"
              - button "Blue"
              - button "Cyan"
              - button "Green"
              - button "Yellow"
              - button "Orange"
              - button "Red"
          - generic:
            - generic:
              - generic:
                - checkbox "Clear on copy/send"
                - img
              - generic: Clear on copy/send
              - generic:
                - img
            - generic:
              - generic:
                - checkbox "Block page interactions" [checked]
                - img
              - generic: Block page interactions
          - button "Manage MCP & Webhooks":
            - generic: Manage MCP & Webhooks
            - generic:
              - img
        - generic:
          - button "Manage MCP & Webhooks":
            - img
            - generic: Manage MCP & Webhooks
          - generic:
            - generic:
              - generic:
                - text: MCP Connection
                - generic:
                  - img
            - paragraph:
              - text: MCP connection allows agents to receive and act on annotations.
              - link "Learn more":
                - /url: https://agentation.dev/mcp
          - generic:
            - generic:
              - generic:
                - text: Webhooks
                - generic:
                  - img
              - generic:
                - generic: Auto-Send
                - generic:
                  - checkbox "Auto-Send" [checked] [disabled]
            - paragraph: The webhook URL will receive live annotation changes and annotation data.
            - textbox "Webhook URL"
```

# Test source

```ts
  1  | export const TEST_USER = {
  2  |   email: 'test@test.com',
  3  |   password: '1234567890',
  4  | };
  5  | 
  6  | export async function login(page: any) {
  7  |   // Go to dashboard first
  8  |   await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
  9  | 
  10 |   const currentUrl = page.url();
  11 |   if (currentUrl.includes('/login')) {
  12 |     // Fill and submit login form using keyboard
  13 |     await page.fill('input[name="email"]', TEST_USER.email);
  14 |     await page.fill('input[name="password"]', TEST_USER.password);
  15 | 
  16 |     // Submit using Enter key on password field
  17 |     await page.press('input[name="password"]', 'Enter');
  18 | 
  19 |     // Wait for navigation to dashboard
> 20 |     await page.waitForURL('/dashboard', { timeout: 15000 });
     |                ^ TimeoutError: page.waitForURL: Timeout 15000ms exceeded.
  21 |     await page.waitForLoadState('domcontentloaded');
  22 |   }
  23 | 
  24 |   // Wait for page to be stable
  25 |   await page.waitForTimeout(1000);
  26 | }
  27 | 
  28 | export async function logout(page: any) {
  29 |   await page.goto('/dashboard');
  30 |   // Click logout button if exists
  31 |   const logoutBtn = page.locator('text=Logout').first();
  32 |   if (await logoutBtn.isVisible()) {
  33 |     await logoutBtn.click();
  34 |   }
  35 | }
  36 | 
```