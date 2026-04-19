# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: setup.spec.ts >> setup: ensure test user exists
- Location: tests/e2e/setup.spec.ts:8:1

# Error details

```
Error: Failed to login/register. Final URL: http://localhost:3001/login
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - button "v3.0.2 Output Detail Standard React Components Hide Until Restart Marker Color Clear on copy/send Block page interactions Manage MCP & Webhooks Manage MCP & Webhooks MCP Connection MCP connection allows agents to receive and act on annotations. Learn more Webhooks Auto-Send The webhook URL will receive live annotation changes and annotation data." [ref=e3] [cursor=pointer]:
    - img [ref=e5]
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
  - generic [ref=e8]:
    - complementary [ref=e9]:
      - generic [ref=e11]:
        - img [ref=e13]
        - generic [ref=e21]: MindFlow
      - generic [ref=e23]:
        - img [ref=e24]
        - generic [ref=e27]: Search
      - navigation [ref=e28]:
        - generic [ref=e29]:
          - link "Dashboard" [ref=e30] [cursor=pointer]:
            - /url: /dashboard
            - img [ref=e31]
            - generic [ref=e36]: Dashboard
          - link "Settings" [ref=e37] [cursor=pointer]:
            - /url: /settings
            - img [ref=e38]
            - generic [ref=e41]: Settings
        - generic [ref=e42]:
          - generic [ref=e43]: Tags (1)
          - generic [ref=e44]:
            - button "Output Exercise 测试卡组 18" [ref=e45]:
              - generic [ref=e47]: Output Exercise 测试卡组
              - generic [ref=e48]: "18"
            - button "New Tag" [ref=e49]:
              - img [ref=e50]
              - generic [ref=e51]: New Tag
      - generic [ref=e57]: test
    - main [ref=e58]:
      - generic [ref=e60]:
        - generic [ref=e61]:
          - generic [ref=e62]:
            - heading "Study Dashboard" [level=1] [ref=e63]
            - paragraph [ref=e64]: Master your knowledge with space-repetition powered by the Ebbinghaus forgetting curve.
          - generic [ref=e65]:
            - button "New Point" [ref=e68]:
              - img [ref=e69]
              - text: New Point
              - img [ref=e70]
            - button "AI Memory" [ref=e72]:
              - img [ref=e73]
              - text: AI Memory
            - button "Start Reviewing" [ref=e78]:
              - img [ref=e79]
              - text: Start Reviewing
              - img [ref=e81]
        - generic [ref=e84]:
          - generic [ref=e85]:
            - generic [ref=e86]:
              - paragraph [ref=e87]: Total Knowledge
              - generic [ref=e88]:
                - text: +12%
                - img [ref=e89]
            - paragraph [ref=e92]: "49"
            - paragraph [ref=e93]: Points tracked this year
          - generic [ref=e94]:
            - generic [ref=e95]:
              - paragraph [ref=e96]: Due for Review
              - generic [ref=e97]: Today
            - paragraph [ref=e98]: "46"
            - paragraph [ref=e99]: Requires your attention
          - generic [ref=e100]:
            - generic [ref=e101]:
              - paragraph [ref=e102]: Retention Rate
              - generic [ref=e103]:
                - text: Stable
                - img [ref=e104]
            - paragraph [ref=e107]: 83%
            - paragraph [ref=e110]: Based on review history
        - generic [ref=e111]:
          - generic [ref=e112]:
            - img [ref=e113]
            - generic [ref=e115]: Filters
          - generic [ref=e117]:
            - img
            - textbox "Search cards..." [ref=e118]
          - button "Next Review" [ref=e120]:
            - generic [ref=e121]: Next Review
            - img [ref=e122]
          - button "All Tags" [ref=e125]:
            - generic [ref=e126]: All Tags
            - img [ref=e127]
        - generic [ref=e129]:
          - table "List of all knowledge points with their status and familiarity" [ref=e131]:
            - caption [ref=e132]: List of all knowledge points with their status and familiarity
            - rowgroup [ref=e133]:
              - row "Knowledge Point Tags Status Familiarity Actions" [ref=e134]:
                - columnheader "Knowledge Point" [ref=e135]
                - columnheader "Tags" [ref=e136]
                - columnheader "Status" [ref=e137]
                - columnheader "Familiarity" [ref=e138]
                - columnheader "Actions" [ref=e139]
            - rowgroup [ref=e140]:
              - row "nuance Last reviewed 15 days ago Output Exercise 测试卡组 Overdue 75% Start reviewing nuance Edit nuance Delete nuance" [ref=e141]:
                - cell "nuance Last reviewed 15 days ago" [ref=e142]:
                  - generic [ref=e143]:
                    - generic [ref=e145]: nuance
                    - generic [ref=e146]: Last reviewed 15 days ago
                - cell "Output Exercise 测试卡组" [ref=e147]:
                  - generic [ref=e148]: Output Exercise 测试卡组
                - cell "Overdue" [ref=e149]:
                  - generic [ref=e150]: Overdue
                - cell "75%" [ref=e152]:
                  - generic [ref=e156]: 75%
                - cell "Start reviewing nuance Edit nuance Delete nuance" [ref=e157]:
                  - generic [ref=e158]:
                    - link "Start reviewing nuance" [ref=e159] [cursor=pointer]:
                      - /url: /review?type=flashcard&id=cmniq7zdo000selxljzwkqqos&single=true
                      - img [ref=e160]
                    - button "Edit nuance" [ref=e163]:
                      - img [ref=e164]
                    - button "Delete nuance" [ref=e169]:
                      - img [ref=e170]
              - row "perseverance Last reviewed 15 days ago Output Exercise 测试卡组 Overdue 75% Start reviewing perseverance Edit perseverance Delete perseverance" [ref=e173]:
                - cell "perseverance Last reviewed 15 days ago" [ref=e174]:
                  - generic [ref=e175]:
                    - generic [ref=e177]: perseverance
                    - generic [ref=e178]: Last reviewed 15 days ago
                - cell "Output Exercise 测试卡组" [ref=e179]:
                  - generic [ref=e180]: Output Exercise 测试卡组
                - cell "Overdue" [ref=e181]:
                  - generic [ref=e182]: Overdue
                - cell "75%" [ref=e184]:
                  - generic [ref=e188]: 75%
                - cell "Start reviewing perseverance Edit perseverance Delete perseverance" [ref=e189]:
                  - generic [ref=e190]:
                    - link "Start reviewing perseverance" [ref=e191] [cursor=pointer]:
                      - /url: /review?type=flashcard&id=cmniq7zdv000uelxl9x3rwe7e&single=true
                      - img [ref=e192]
                    - button "Edit perseverance" [ref=e195]:
                      - img [ref=e196]
                    - button "Delete perseverance" [ref=e201]:
                      - img [ref=e202]
              - row "synthesis Last reviewed 15 days ago Output Exercise 测试卡组 Overdue 75% Start reviewing synthesis Edit synthesis Delete synthesis" [ref=e205]:
                - cell "synthesis Last reviewed 15 days ago" [ref=e206]:
                  - generic [ref=e207]:
                    - generic [ref=e209]: synthesis
                    - generic [ref=e210]: Last reviewed 15 days ago
                - cell "Output Exercise 测试卡组" [ref=e211]:
                  - generic [ref=e212]: Output Exercise 测试卡组
                - cell "Overdue" [ref=e213]:
                  - generic [ref=e214]: Overdue
                - cell "75%" [ref=e216]:
                  - generic [ref=e220]: 75%
                - cell "Start reviewing synthesis Edit synthesis Delete synthesis" [ref=e221]:
                  - generic [ref=e222]:
                    - link "Start reviewing synthesis" [ref=e223] [cursor=pointer]:
                      - /url: /review?type=flashcard&id=cmniq7ze5000welxlhyrjk675&single=true
                      - img [ref=e224]
                    - button "Edit synthesis" [ref=e227]:
                      - img [ref=e228]
                    - button "Delete synthesis" [ref=e233]:
                      - img [ref=e234]
              - row "deteriorate Last reviewed 15 days ago Output Exercise 测试卡组 Overdue 75% Start reviewing deteriorate Edit deteriorate Delete deteriorate" [ref=e237]:
                - cell "deteriorate Last reviewed 15 days ago" [ref=e238]:
                  - generic [ref=e239]:
                    - generic [ref=e241]: deteriorate
                    - generic [ref=e242]: Last reviewed 15 days ago
                - cell "Output Exercise 测试卡组" [ref=e243]:
                  - generic [ref=e244]: Output Exercise 测试卡组
                - cell "Overdue" [ref=e245]:
                  - generic [ref=e246]: Overdue
                - cell "75%" [ref=e248]:
                  - generic [ref=e252]: 75%
                - cell "Start reviewing deteriorate Edit deteriorate Delete deteriorate" [ref=e253]:
                  - generic [ref=e254]:
                    - link "Start reviewing deteriorate" [ref=e255] [cursor=pointer]:
                      - /url: /review?type=flashcard&id=cmniq7zeh000yelxl9tl4lp9b&single=true
                      - img [ref=e256]
                    - button "Edit deteriorate" [ref=e259]:
                      - img [ref=e260]
                    - button "Delete deteriorate" [ref=e265]:
                      - img [ref=e266]
              - row "elevate Not reviewed yet No deck New 50% Start reviewing elevate Edit elevate Delete elevate" [ref=e269]:
                - cell "elevate Not reviewed yet" [ref=e270]:
                  - generic [ref=e271]:
                    - generic [ref=e273]: elevate
                    - generic [ref=e274]: Not reviewed yet
                - cell "No deck" [ref=e275]
                - cell "New" [ref=e276]
                - cell "50%" [ref=e277]:
                  - generic [ref=e281]: 50%
                - cell "Start reviewing elevate Edit elevate Delete elevate" [ref=e282]:
                  - generic [ref=e283]:
                    - link "Start reviewing elevate" [ref=e284] [cursor=pointer]:
                      - /url: /review?type=flashcard&id=cmno95afk000vimxlsdq9bcal&single=true
                      - img [ref=e285]
                    - button "Edit elevate" [ref=e288]:
                      - img [ref=e289]
                    - button "Delete elevate" [ref=e294]:
                      - img [ref=e295]
              - row "privileges Not reviewed yet No deck New 50% Start reviewing privileges Edit privileges Delete privileges" [ref=e298]:
                - cell "privileges Not reviewed yet" [ref=e299]:
                  - generic [ref=e300]:
                    - generic [ref=e302]: privileges
                    - generic [ref=e303]: Not reviewed yet
                - cell "No deck" [ref=e304]
                - cell "New" [ref=e305]
                - cell "50%" [ref=e306]:
                  - generic [ref=e310]: 50%
                - cell "Start reviewing privileges Edit privileges Delete privileges" [ref=e311]:
                  - generic [ref=e312]:
                    - link "Start reviewing privileges" [ref=e313] [cursor=pointer]:
                      - /url: /review?type=flashcard&id=cmno96z3h000wimxlq0hehxle&single=true
                      - img [ref=e314]
                    - button "Edit privileges" [ref=e317]:
                      - img [ref=e318]
                    - button "Delete privileges" [ref=e323]:
                      - img [ref=e324]
              - row "receipt Last reviewed 15 days ago No deck Overdue 54% Start reviewing receipt Edit receipt Delete receipt" [ref=e327]:
                - cell "receipt Last reviewed 15 days ago" [ref=e328]:
                  - generic [ref=e329]:
                    - generic [ref=e331]: receipt
                    - generic [ref=e332]: Last reviewed 15 days ago
                - cell "No deck" [ref=e333]
                - cell "Overdue" [ref=e334]:
                  - generic [ref=e335]: Overdue
                - cell "54%" [ref=e337]:
                  - generic [ref=e341]: 54%
                - cell "Start reviewing receipt Edit receipt Delete receipt" [ref=e342]:
                  - generic [ref=e343]:
                    - link "Start reviewing receipt" [ref=e344] [cursor=pointer]:
                      - /url: /review?type=flashcard&id=cmncqfoa7000fuexlploe35xk&single=true
                      - img [ref=e345]
                    - button "Edit receipt" [ref=e348]:
                      - img [ref=e349]
                    - button "Delete receipt" [ref=e354]:
                      - img [ref=e355]
              - row "primitive Last reviewed 15 days ago No deck Overdue 32% Start reviewing primitive Edit primitive Delete primitive" [ref=e358]:
                - cell "primitive Last reviewed 15 days ago" [ref=e359]:
                  - generic [ref=e360]:
                    - generic [ref=e362]: primitive
                    - generic [ref=e363]: Last reviewed 15 days ago
                - cell "No deck" [ref=e364]
                - cell "Overdue" [ref=e365]:
                  - generic [ref=e366]: Overdue
                - cell "32%" [ref=e368]:
                  - generic [ref=e372]: 32%
                - cell "Start reviewing primitive Edit primitive Delete primitive" [ref=e373]:
                  - generic [ref=e374]:
                    - link "Start reviewing primitive" [ref=e375] [cursor=pointer]:
                      - /url: /review?type=flashcard&id=cmna1hzg50004uexl60jlrdjs&single=true
                      - img [ref=e376]
                    - button "Edit primitive" [ref=e379]:
                      - img [ref=e380]
                    - button "Delete primitive" [ref=e385]:
                      - img [ref=e386]
              - row "retreat Last reviewed 15 days ago No deck Overdue 47% Start reviewing retreat Edit retreat Delete retreat" [ref=e389]:
                - cell "retreat Last reviewed 15 days ago" [ref=e390]:
                  - generic [ref=e391]:
                    - generic [ref=e393]: retreat
                    - generic [ref=e394]: Last reviewed 15 days ago
                - cell "No deck" [ref=e395]
                - cell "Overdue" [ref=e396]:
                  - generic [ref=e397]: Overdue
                - cell "47%" [ref=e399]:
                  - generic [ref=e403]: 47%
                - cell "Start reviewing retreat Edit retreat Delete retreat" [ref=e404]:
                  - generic [ref=e405]:
                    - link "Start reviewing retreat" [ref=e406] [cursor=pointer]:
                      - /url: /review?type=flashcard&id=cmncwbi5b000muexl4bfap1t4&single=true
                      - img [ref=e407]
                    - button "Edit retreat" [ref=e410]:
                      - img [ref=e411]
                    - button "Delete retreat" [ref=e416]:
                      - img [ref=e417]
              - row "德拉框上的 Last reviewed 15 days ago No deck Overdue 48% Start reviewing 德拉框上的 Edit 德拉框上的 Delete 德拉框上的" [ref=e420]:
                - cell "德拉框上的 Last reviewed 15 days ago" [ref=e421]:
                  - generic [ref=e422]:
                    - generic [ref=e423]:
                      - img [ref=e424]
                      - generic [ref=e427]: 德拉框上的
                    - generic [ref=e428]: Last reviewed 15 days ago
                - cell "No deck" [ref=e429]
                - cell "Overdue" [ref=e430]:
                  - generic [ref=e431]: Overdue
                - cell "48%" [ref=e433]:
                  - generic [ref=e437]: 48%
                - cell "Start reviewing 德拉框上的 Edit 德拉框上的 Delete 德拉框上的" [ref=e438]:
                  - generic [ref=e439]:
                    - link "Start reviewing 德拉框上的" [ref=e440] [cursor=pointer]:
                      - /url: /review?type=article&id=cmncwmf9f000tuexl1n6hyk9g&single=true
                      - img [ref=e441]
                    - button "Edit 德拉框上的" [ref=e444]:
                      - img [ref=e445]
                    - button "Delete 德拉框上的" [ref=e450]:
                      - img [ref=e451]
          - generic [ref=e454]:
            - paragraph [ref=e455]: Showing 1 to 10 of 49 entries
            - generic [ref=e456]:
              - button "Previous" [disabled] [ref=e457]
              - button "Next" [ref=e458]
        - paragraph [ref=e460]: © 2023 MindFlow. Master everything, forget nothing.
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.beforeEach(async ({ page }) => {
  4  |   // Go to login page
  5  |   await page.goto('/login', { waitUntil: 'networkidle' });
  6  | });
  7  | 
  8  | test('setup: ensure test user exists', async ({ page }) => {
  9  |   // First try to login with existing credentials
  10 |   await page.fill('input[name="email"]', 'test@test.com');
  11 |   await page.fill('input[name="password"]', '1234567890');
  12 | 
  13 |   // Try to submit form using Enter key
  14 |   await page.press('input[name="password"]', 'Enter');
  15 | 
  16 |   // Wait for navigation or response
  17 |   await page.waitForTimeout(5000);
  18 | 
  19 |   console.log('After login attempt, URL:', page.url());
  20 | 
  21 |   // Check if we're on dashboard (login successful)
  22 |   if (page.url().includes('/dashboard')) {
  23 |     console.log('Test user already exists, logged in successfully');
  24 |     return;
  25 |   }
  26 | 
  27 |   // If still on login page, try to register
  28 |   console.log('Login failed, trying to register user...');
  29 | 
  30 |   // Click register button
  31 |   await page.click('text=立即注册');
  32 | 
  33 |   // Wait for name field to appear
  34 |   await page.waitForSelector('input[name="name"]', { timeout: 5000 });
  35 | 
  36 |   // Fill registration form
  37 |   await page.fill('input[name="email"]', 'test@test.com');
  38 |   await page.fill('input[name="password"]', '1234567890');
  39 |   await page.fill('input[name="name"]', 'Test User');
  40 | 
  41 |   // Submit using Enter key
  42 |   await page.press('input[name="name"]', 'Enter');
  43 | 
  44 |   // Wait for response
  45 |   await page.waitForTimeout(5000);
  46 |   console.log('After registration, URL:', page.url());
  47 | 
  48 |   // Check if we're on dashboard now
  49 |   if (page.url().includes('/dashboard')) {
  50 |     console.log('User registered successfully');
  51 |     return;
  52 |   }
  53 | 
  54 |   // If still not on dashboard, something is wrong
> 55 |   throw new Error(`Failed to login/register. Final URL: ${page.url()}`);
     |         ^ Error: Failed to login/register. Final URL: http://localhost:3001/login
  56 | });
  57 | 
```