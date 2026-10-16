/*
 * photos/ 의 원본 사진을 화면에 맞는 크기의 WebP로 줄여 public/images/ 에 넣는다.
 * 큰 사진이 오기 전 바로 보일 흐린 미리보기(가로 24px)도 src/content/photoPlaceholders.ts 에 적는다.
 *
 *   npm run images
 *
 * 원본 이름: wallpaper / mart / office / desk (.jpg .jpeg .png .webp 아무거나)
 */
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, parse } from 'node:path';
import sharp from 'sharp';

const SRC = 'photos';
const OUT = 'public/images';
const PLACEHOLDERS = 'src/content/photoPlaceholders.ts';

/** width: 화면에 필요한 최대 가로. cropBottom: 아래에서 잘라 낼 비율 (바탕화면 인장 제거) */
const SPECS = {
  wallpaper: { width: 1920, quality: 70, cropBottom: 0.06 },
  mart: { width: 1400, quality: 68 },
  office: { width: 1400, quality: 68 },
  desk: { width: 1400, quality: 68 },
};

mkdirSync(OUT, { recursive: true });
const files = existsSync(SRC) ? readdirSync(SRC) : [];
const placeholders = {};

for (const [name, spec] of Object.entries(SPECS)) {
  const file = files.find((f) => parse(f).name === name && /\.(jpe?g|png|webp)$/i.test(f));
  if (!file) {
    console.log(`- ${name}: photos/ 에 원본이 없어 건너뜀`);
    continue;
  }
  const input = join(SRC, file);
  const meta = await sharp(input).metadata();
  let img = sharp(input).rotate();
  if (spec.cropBottom) {
    img = img.extract({ left: 0, top: 0, width: meta.width, height: Math.round(meta.height * (1 - spec.cropBottom)) });
  }
  const buffer = await img.resize({ width: spec.width, withoutEnlargement: true }).webp({ quality: spec.quality }).toBuffer();
  const out = join(OUT, `${name}.webp`);
  writeFileSync(out, buffer);

  let tiny = sharp(input).rotate();
  if (spec.cropBottom) {
    tiny = tiny.extract({ left: 0, top: 0, width: meta.width, height: Math.round(meta.height * (1 - spec.cropBottom)) });
  }
  const tinyBuf = await tiny.resize({ width: 24 }).webp({ quality: 40 }).toBuffer();
  placeholders[name] = `data:image/webp;base64,${tinyBuf.toString('base64')}`;

  const kb = (n) => `${Math.round(n / 1024)}KB`;
  console.log(`✓ ${name}: ${kb(statSync(input).size)} → ${kb(buffer.length)} (${out})`);
}

const body = Object.keys(SPECS)
  .map((name) => `  ${name}: ${JSON.stringify(placeholders[name] ?? '')},`)
  .join('\n');
writeFileSync(
  PLACEHOLDERS,
  `// npm run images 가 만든다. 직접 고치지 않는다.\n// 큰 사진이 오기 전에 바로 보이는 흐린 미리보기 (가로 24px).\nexport const PHOTO_PLACEHOLDERS: Record<'wallpaper' | 'mart' | 'office' | 'desk', string> = {\n${body}\n};\n`,
);
console.log(`✓ 미리보기 → ${PLACEHOLDERS}`);
