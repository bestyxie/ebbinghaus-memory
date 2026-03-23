This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev

# Lint
pnpm lint

# Generate Prisma client (after schema changes)
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Open Prisma Studio (database GUI)
npx prisma studio
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 测试账号

test@test.com
1234567890

## 命令行进入数据库

psql "postgres://postgres:postgres@localhost:51214/template1?sslmode=disable"

## agent-browser

This project includes [agent-browser](https://github.com/vercel-labs/agent-browser) - a headless browser automation CLI for AI agents.

### Installation

```bash
# Install Chrome for Testing (required for agent-browser)
agent-browser install
```

### Docker / DevContainer

When using Docker Compose or DevContainer, agent-browser and Chrome are pre-installed.

```bash
# Start all services (includes PostgreSQL)
docker-compose up

# Rebuild and start
docker-compose up --build

# Stop services
docker-compose down
```

### Quick Start

```bash
# Navigate to a URL
agent-browser open https://example.com

# Take an accessibility snapshot (returns element refs like @e1, @e2)
agent-browser snapshot -i

# Click an element by ref
agent-browser click @e1

# Take a screenshot
agent-browser screenshot result.png

# Close browser
agent-browser close
```

### Documentation

See [docs/agent-browser.md](docs/agent-browser.md) for complete usage guide.
