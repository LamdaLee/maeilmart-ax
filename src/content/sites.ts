import { PHOTO_PLACEHOLDERS } from './photoPlaceholders';
import type { DepartmentId, StepId } from '../types';

/*
 * 단계마다 학습자가 "다른 웹페이지"를 여는 것처럼 보이게 하는 사이트 정보.
 * 브라우저 탭 제목, 주소창 URL, 페이지 머리의 사이트 이름이 여기서 나온다.
 */

export type SiteKind = 'home' | 'portal' | 'feed' | 'docs' | 'sheet' | 'inbox' | 'auto';

export interface Site {
  kind: SiteKind;
  /** 페이지 머리에 보이는 사이트 이름 */
  name: string;
  /** 주소창 경로. {d}는 부서 id로 바뀐다. */
  url: string;
}

export const SITE_STYLE: Record<SiteKind, { color: string; mark: string }> = {
  home: { color: '#0b8a4b', mark: '매' },
  portal: { color: '#1463ff', mark: '포' },
  feed: { color: '#e8590c', mark: '장' },
  docs: { color: '#1463ff', mark: '문' },
  sheet: { color: '#0b8a4b', mark: '표' },
  inbox: { color: '#7048e8', mark: '함' },
  auto: { color: '#d6336c', mark: '자' },
};

export const SITES: Record<StepId, Site> = {
  question: { kind: 'home', name: '매일마트', url: 'www.maeilmart.co.kr' },
  department: { kind: 'portal', name: '사내 포털', url: 'portal.maeilmart.co.kr/departments' },
  work: { kind: 'feed', name: '오늘 장면', url: 'portal.maeilmart.co.kr/{d}/today' },
  asis: { kind: 'docs', name: '업무 문서', url: 'docs.maeilmart.co.kr/{d}/flow/as-is' },
  problem: { kind: 'feed', name: '오늘 장면', url: 'portal.maeilmart.co.kr/{d}/today?sticker=on' },
  pain: { kind: 'docs', name: '업무 문서', url: 'docs.maeilmart.co.kr/{d}/flow/pain-point' },
  data: { kind: 'sheet', name: '스프레드시트', url: 'sheet.maeilmart.co.kr/{d}/friday.xlsx' },
  goal: { kind: 'docs', name: '업무 문서', url: 'docs.maeilmart.co.kr/{d}/goal' },
  improve: { kind: 'docs', name: '업무 문서', url: 'docs.maeilmart.co.kr/{d}/flow/to-be' },
  actors: { kind: 'docs', name: '업무 문서', url: 'docs.maeilmart.co.kr/{d}/flow/who' },
  task: { kind: 'docs', name: '업무 문서', url: 'docs.maeilmart.co.kr/{d}/task-card' },
  columns: { kind: 'sheet', name: '스프레드시트', url: 'sheet.maeilmart.co.kr/{d}/columns' },
  cases: { kind: 'inbox', name: '자료함', url: 'inbox.maeilmart.co.kr/{d}/friday' },
  logic: { kind: 'auto', name: '자동화 설정', url: 'auto.maeilmart.co.kr/{d}/rules' },
  run: { kind: 'auto', name: '자동화 설정', url: 'auto.maeilmart.co.kr/{d}/runs/latest' },
  answer: { kind: 'docs', name: '업무 문서', url: 'docs.maeilmart.co.kr/{d}/my-answer' },
};

export function siteUrl(step: StepId, dept: DepartmentId | null): string {
  return SITES[step].url.replace('{d}', dept ?? 'select');
}

export type PhotoName = keyof typeof PHOTO_PLACEHOLDERS;

/** npm run images 가 photos/ 의 원본을 줄여 만든 파일. 없으면 CSS의 대체 배경이 보인다. */
export const PHOTOS: Record<PhotoName, string> = {
  wallpaper: `${import.meta.env.BASE_URL}images/wallpaper.webp`,
  mart: `${import.meta.env.BASE_URL}images/mart.webp`,
  office: `${import.meta.env.BASE_URL}images/office.webp`,
  desk: `${import.meta.env.BASE_URL}images/desk.webp`,
};

/** 큰 사진 위에, 먼저 도착하는 흐린 미리보기를 겹친 배경. 큰 사진이 오면 미리보기를 덮는다. */
export function photoBackground(name: PhotoName): string {
  const tiny = PHOTO_PLACEHOLDERS[name];
  return tiny ? `url(${PHOTOS[name]}), url(${tiny})` : `url(${PHOTOS[name]})`;
}
