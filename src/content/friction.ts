import type { StickerKind } from '../types';
import { STICKERS } from './steps';

export const MIN_STICKERS = 4;

export function countStickers(stickers: Record<string, StickerKind>): Record<StickerKind, number> {
  const counts: Record<StickerKind, number> = { repeat: 0, wait: 0, mistake: 0, humanOnly: 0 };
  for (const kind of Object.values(stickers)) counts[kind] += 1;
  return counts;
}

/** 가장 많이 붙인 종류. 동점이면 모두 돌려준다. 하나도 없으면 빈 배열. */
export function topKinds(stickers: Record<string, StickerKind>): StickerKind[] {
  const counts = countStickers(stickers);
  const max = Math.max(...Object.values(counts));
  if (max === 0) return [];
  return STICKERS.map((s) => s.id).filter((k) => counts[k] === max);
}
