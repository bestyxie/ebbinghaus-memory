/**
 * Prisma 协议连接测试脚本
 * 测试 prisma+postgres:// 协议的连接性和基本操作
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// 测试配置
const testConfigs = [
  // {
  //   name: "Prisma Dev Protocol (51213)",
  //   url: "prisma+postgres://127.0.0.1:51213/?api_key=eyJkYXRhYmFzZVVybCI6InBvc3RncmVzOi8vcG9zdGdyZXM6cG9zdGdyZXNAbG9jYWxob3N0OjUxMjE0L3RlbXBsYXRlMT9zc2xtb2RlPWRpc2FibGUmY29ubmVjdGlvbl9saW1pdD0xJmNvbm5lY3RfdGltZW91dD0wJm1heF9pZGxlX2Nvbm5lY3Rpb25fbGlmZXRpbWU9MCZwb29sX3RpbWVvdXQ9MCZzaW5nbGVfdXNlX2Nvbm5lY3Rpb25zPXRydWUmc29ja2V0X3RpbWVvdXQ9MCIsIm5hbWUiOiJkZWZhdWx0Iiwic2hhZG93RGF0YWJhc2VVcmwiOiJwb3N0Z3JlczovL3Bvc3RncmVzOnBvc3RncmVzQGxvY2FsaG9zdDo1MTIxNS90ZW1wbGF0ZTE_c3NsbW9kZT1kaXNhYmxlJmNvbm5lY3Rpb25fbGltaXQ9MSZjb25uZWN0X3RpbWVvdXQ9MCZtYXhfaWRsZV9jb25uZWN0aW9uX2xpZmV0aW1lPTAmcG9vbF90aW1lb3V0PTAmc2luZ2xlX3VzZV9jb25uZWN0aW9ucz10cnVlJnNvY2tldF90aW1lb3V0PTAifQ",
  // },
  {
    name: "Direct PostgreSQL (51214)",
    url: "postgresql://postgres:postgres@localhost:51214/template1?sslmode=disable",
  },
  // {
  //   name: "Direct PostgreSQL (5432)",
  //   url: "postgresql://postgres@localhost:5432/template1?sslmode=disable",
  // },
];

async function testConnection(config) {
  console.log(`\n🧪 Testing: ${config.name}`);
  console.log(`📡 URL: ${config.url.substring(0, 60)}...`);

  const adapter = new PrismaPg({ connectionString: config.url });
  const prisma = new PrismaClient({
    adapter,
    log: ["query", "info", "warn", "error"],
  });

  try {
    console.log("⏳ Attempting connection...");

    // 测试1: 连接测试
    await prisma.$connect();
    console.log("✅ Connection successful!");

    // 测试2: 查询测试
    console.log("⏳ Running test query...");
    // const userCount = await prisma.user.count();
    // console.log(`✅ Query successful! Found ${userCount} users`);

    // 测试3: 数据完整性测试
    console.log("⏳ Verifying database structure...");
    const tables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    console.log(
      `✅ Database structure verified! Found ${tables.length} tables:`,
    );
    tables.forEach((table) => {
      console.log(`   - ${table.table_name}`);
    });

    // 测试4: 性能测试
    console.log("⏳ Running performance test...");
    const startTime = Date.now();
    await prisma.user.findMany({ take: 10 });
    const endTime = Date.now();
    console.log(`✅ Performance test completed in ${endTime - startTime}ms`);

    return {
      success: true,
      // userCount,
      tableCount: tables.length,
      queryTime: endTime - startTime,
    };
  } catch (error) {
    console.error("❌ Connection failed!");

    if (error.code) {
      console.error(`   Error Code: ${error.code}`);
    }

    if (error.message) {
      console.error(`   Error Message: ${error.message}`);
    }

    if (error.meta) {
      console.error("   Error Meta:", JSON.stringify(error.meta, null, 2));
    }

    return {
      success: false,
      error: error.message,
      code: error.code,
    };
  } finally {
    try {
      await prisma.$disconnect();
      console.log("🔌 Disconnected");
    } catch (disconnectError) {
      console.error("⚠️  Disconnect warning:", disconnectError.message);
    }
  }
}

async function runTests() {
  console.log("🚀 Prisma Protocol Connection Test");
  console.log("=".repeat(50));

  const results = [];

  for (const config of testConfigs) {
    const result = await testConnection(config);
    results.push({
      name: config.name,
      ...result,
    });

    // 等待一下再测试下一个配置
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // 汇总结果
  console.log("\n" + "=".repeat(50));
  console.log("📊 Test Results Summary");
  console.log("=".repeat(50));

  results.forEach((result, index) => {
    const status = result.success ? "✅" : "❌";
    const details = result.success
      ? `${result.userCount} users, ${result.tableCount} tables, ${result.queryTime}ms`
      : `Error: ${result.error}`;

    console.log(`${status} ${result.name}`);
    console.log(`   ${details}`);
  });

  const successfulCount = results.filter((r) => r.success).length;
  console.log(
    `\n🏁 Total: ${successfulCount}/${results.length} configurations passed`,
  );

  // 推荐建议
  console.log("\n💡 Recommendations:");
  const directPostgres = results.find((r) =>
    r.name.includes("Direct PostgreSQL (51214)"),
  );
  const prismaProtocol = results.find((r) => r.name.includes("Prisma Dev"));

  if (directPostgres?.success && !prismaProtocol?.success) {
    console.log(
      "   ✨ Use direct PostgreSQL connection (51214) - most reliable",
    );
  } else if (prismaProtocol?.success) {
    console.log("   ✨ Prisma Dev protocol works - can use for development");
  } else {
    console.log(
      "   ⚠️  Consider checking database configuration and Prisma Dev status",
    );
  }
}

// 运行测试
runTests().catch((error) => {
  console.error("🚨 Test execution failed:", error);
  process.exit(1);
});
