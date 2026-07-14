import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build as esbuild } from "esbuild";
import esbuildPluginPino from "esbuild-plugin-pino";
import { rm, copyFile, mkdir, writeFile } from "node:fs/promises";

globalThis.require = createRequire(import.meta.url);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "dist");
const vercelOutputDir = path.join(__dirname, "../../.vercel", "output");
const funcDir = path.join(vercelOutputDir, "functions", "index.func");

async function build() {
  await rm(distDir, { recursive: true, force: true });
  await rm(vercelOutputDir, { recursive: true, force: true });

  await esbuild({
    entryPoints: [path.join(__dirname, "src/index.ts")],
    platform: "node",
    target: "node20",
    bundle: true,
    format: "esm",
    outdir: distDir,
    outExtension: { ".js": ".mjs" },
    logLevel: "info",
    external: [
      // إضافة الحزم الداخلية workspace كخارجية
      "@workspace/*",
      "*.node",
      "sharp",
      "better-sqlite3",
      "sqlite3",
      "canvas",
      "bcrypt",
      "argon2",
      "fsevents",
      "re2",
      "farmhash",
      "xxhash-addon",
      "bufferutil",
      "utf-8-validate",
      "ssh2",
      "cpu-features",
      "dtrace-provider",
      "isolated-vm",
      "lightningcss",
      "pg-native",
      "oracledb",
      "mongodb-client-encryption",
      "nodemailer",
      "handlebars",
      "knex",
      "typeorm",
      "protobufjs",
      "onnxruntime-node",
      "@tensorflow/*",
      "@prisma/client",
      "@mikro-orm/*",
      "@grpc/*",
      "@swc/*",
      "@aws-sdk/*",
      "@azure/*",
      "@opentelemetry/*",
      "@google-cloud/*",
      "@google/*",
      "googleapis",
      "firebase-admin",
      "@parcel/watcher",
      "@sentry/profiling-node",
      "@tree-sitter/*",
      "aws-sdk",
      "classic-level",
      "dd-trace",
      "ffi-napi",
      "grpc",
      "hiredis",
      "kerberos",
      "leveldown",
      "miniflare",
      "mysql2",
      "newrelic",
      "odbc",
      "piscina",
      "realm",
      "ref-napi",
      "rocksdb",
      "sass-embedded",
      "sequelize",
      "serialport",
      "snappy",
      "tinypool",
      "usb",
      "workerd",
      "wrangler",
      "zeromq",
      "zeromq-prebuilt",
      "playwright",
      "puppeteer",
      "puppeteer-core",
      "electron",
    ],
    sourcemap: "linked",
    plugins: [
      esbuildPluginPino({ transports: ["pino-pretty"] })
    ],
    banner: {
      js: `import { createRequire as __bannerCrReq } from 'node:module';
import __bannerPath from 'node:path';
import __bannerUrl from 'node:url';

globalThis.require = __bannerCrReq(import.meta.url);
globalThis.__filename = __bannerUrl.fileURLToPath(import.meta.url);
globalThis.__dirname = __bannerPath.dirname(globalThis.__filename);
      `,
    },
  });

  await mkdir(funcDir, { recursive: true });

  await copyFile(
    path.join(distDir, "index.mjs"),
    path.join(funcDir, "index.mjs")
  );

  await writeFile(
    path.join(vercelOutputDir, "config.json"),
    JSON.stringify({
      routes: [{ src: "/(.*)", dest: "/index" }]
    }, null, 2)
  );

  await writeFile(
    path.join(funcDir, ".vc-config.json"),
    JSON.stringify({
      runtime: "nodejs20.x",
      handler: "index.mjs",
      launcherType: "Nodejs"
    }, null, 2)
  );

  console.log("✅ تم بناء المشروع وتجهيزه لفيرسل بنجاح!");
}

build().catch((err) => {
  console.error("❌ فشل البناء:", err);
  process.exit(1);
});    ],
    sourcemap: "linked",
    plugins: [
      esbuildPluginPino({ transports: ["pino-pretty"] })
    ],
    banner: {
      js: `import { createRequire as __bannerCrReq } from 'node:module';
import __bannerPath from 'node:path';
import __bannerUrl from 'node:url';

globalThis.require = __bannerCrReq(import.meta.url);
globalThis.__filename = __bannerUrl.fileURLToPath(import.meta.url);
globalThis.__dirname = __bannerPath.dirname(globalThis.__filename);
      `,
    },
  });

  // 3. إنشاء هيكل مجلدات فيرسل
  await mkdir(funcDir, { recursive: true });

  // 4. نسخ ملف index.mjs من dist إلى مجلد الدالة
  await copyFile(
    path.join(distDir, "index.mjs"),
    path.join(funcDir, "index.mjs")
  );

  // 5. إنشاء config.json لتوجيه كل الطلبات إلى الدالة
  await writeFile(
    path.join(vercelOutputDir, "config.json"),
    JSON.stringify({
      routes: [{ src: "/(.*)", dest: "/index" }]
    }, null, 2)
  );

  // 6. إنشاء .vc-config.json لتحديد بيئة التشغيل
  await writeFile(
    path.join(funcDir, ".vc-config.json"),
    JSON.stringify({
      runtime: "nodejs20.x",
      handler: "index.mjs",
      launcherType: "Nodejs"
    }, null, 2)
  );

  console.log("✅ تم بناء المشروع وتجهيزه لفيرسل بنجاح!");
}

build().catch((err) => {
  console.error("❌ فشل البناء:", err);
  process.exit(1);
});      "electron",
    ],
    sourcemap: "linked",
    plugins: [
      esbuildPluginPino({ transports: ["pino-pretty"] })
    ],
    banner: {
      js: `import { createRequire as __bannerCrReq } from 'node:module';
import __bannerPath from 'node:path';
import __bannerUrl from 'node:url';

globalThis.require = __bannerCrReq(import.meta.url);
globalThis.__filename = __bannerUrl.fileURLToPath(import.meta.url);
globalThis.__dirname = __bannerPath.dirname(globalThis.__filename);
      `,
    },
  });

  // 3. إنشاء هيكل مجلدات فيرسل
  await mkdir(funcDir, { recursive: true });

  // 4. نسخ ملف index.mjs من dist إلى مجلد الدالة
  await copyFile(
    path.join(distDir, "index.mjs"),
    path.join(funcDir, "index.mjs")
  );

  // 5. إنشاء config.json لتوجيه كل الطلبات إلى الدالة
  await writeFile(
    path.join(vercelOutputDir, "config.json"),
    JSON.stringify({
      routes: [{ src: "/(.*)", dest: "/index" }]
    }, null, 2)
  );

  // 6. إنشاء .vc-config.json لتحديد بيئة التشغيل
  await writeFile(
    path.join(funcDir, ".vc-config.json"),
    JSON.stringify({
      runtime: "nodejs20.x",
      handler: "index.mjs",
      launcherType: "Nodejs"
    }, null, 2)
  );

  console.log("✅ تم بناء المشروع وتجهيزه لفيرسل بنجاح!");
}

build().catch((err) => {
  console.error("❌ فشل البناء:", err);
  process.exit(1);
});
