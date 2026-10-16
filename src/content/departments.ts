import type { Case, Department, DepartmentId } from '../types';

/*
 * 부서 데이터. 화면 코드는 부서 분기를 두지 않고 이 배열만 읽는다.
 * 새 부서 규칙:
 *  - cases는 10건, scenes는 8개.
 *  - trap: true는 한 건뿐. initialRule/initialHandoff로는 그 건만 expects와 어긋난다.
 *  - fixedHandoff로는 10건 모두 expects와 맞는다. (departments.test.ts가 검사)
 */

const cs: Department = {
  id: 'cs',
  name: '고객응대',
  todayWork: '들어온 고객 문의에 답을 정하는 일',
  summary: '온라인 주문 고객의 문의가 금요일 오전에 몰립니다. 배송 문의마다 처음부터 답을 씁니다.',
  scenes: [
    { id: 'cs-s1', time: '09:00', text: '밤사이 쌓인 문의 23건. 상담원 두 명이 위에서부터 하나씩 엽니다.' },
    { id: 'cs-s2', time: '09:10', text: '"제 주문 어디쯤 왔나요?" 같은 질문에 매번 배송 조회 화면을 열고 답을 새로 씁니다.' },
    { id: 'cs-s3', time: '09:25', text: '깨진 계란 사진이 붙은 교환 요청. 팀장 확인이 필요해 메모만 남기고 다음 건으로 넘어갑니다.' },
    { id: 'cs-s4', time: '09:40', text: '어제 답한 고객이 같은 질문을 다시 보냈습니다. 누가 답했는지 찾느라 5분이 걸립니다.' },
    { id: 'cs-s5', time: '10:00', text: '배송 4일째인 고객에게 "곧 도착합니다"라고 보냈는데, 실제로는 택배사 분실이었습니다.' },
    { id: 'cs-s6', time: '10:15', text: '말투가 거친 문의는 신입 상담원이 열었다가 닫고, 선배가 올 때까지 둡니다.' },
    { id: 'cs-s7', time: '10:30', text: '점심 전까지 답을 못 받은 고객 6명이 같은 문의를 한 번 더 보냈습니다.' },
    { id: 'cs-s8', time: '10:45', text: '환불 가능 여부는 정해진 사람만 판단할 수 있어, 그 사람 앞에 문의가 줄을 섭니다.' },
  ],
  chips: {
    work: ['밤사이 들어온 문의를 연다', '배송 위치를 찾아 답한다', '교환과 환불은 팀장에게 넘긴다'],
    asis: {
      in: ['문의가 게시판과 메신저로 들어온다'],
      split: ['상담원이 문의를 읽고 종류를 가른다'],
      judge: ['배송이면 조회 화면을 열어 답을 정한다'],
      act: ['답을 처음부터 써서 보낸다'],
      handoff: ['교환, 환불, 화난 고객은 팀장에게 넘긴다'],
    },
    problem: {
      repeat: ['배송 위치 문의마다 같은 답을 처음부터 다시 쓴다'],
      wait: ['답을 기다리던 고객이 같은 문의를 다시 보낸다'],
      mistake: ['배송 기간을 확인하지 않고 곧 도착한다고 잘못 안내한다'],
      humanOnly: ['환불 판단이 한 사람에게 몰려 문의가 줄을 선다'],
    },
    bx: ['배송 문의 고객이 10분 안에 정확한 위치를 받는다'],
    ax: ['평온한 3일 이내 배송 문의의 답을 자동으로 정한다'],
    tobe: {
      in: ['문의가 한 곳에 모인다'],
      split: ['문장에서 요청 종류와 말투를 나눈다'],
      judge: ['3일 이내의 평온한 배송 문의는 자동 답으로 보낸다'],
      act: ['배송 위치 안내 초안을 보내고 기록한다'],
      handoff: ['화난 말투, 교환과 환불, 4일 이상은 사람이 본다'],
    },
    improve: ['반복되는 배송 위치 답은 조건에 맞을 때만 자동으로 보낸다'],
  },
  fields: [
    { id: 'kind', label: '요청', values: ['배송', '불량교환', '기타'] },
    { id: 'daysBucket', label: '기간', values: ['3일이하', '4일이상'] },
    { id: 'tone', label: '말투', values: ['평온', '화남'] },
  ],
  columns: [
    { id: 'sentence', label: '문의', inTable: true },
    { id: 'days', label: '며칠', inTable: true },
    { id: 'daysBucket', label: '기간', inTable: true },
    { id: 'kind', label: '요청', inTable: true },
    { id: 'tone', label: '말투', inTable: true },
    { id: 'orderNo', label: '주문번호', inTable: false },
    { id: 'customerName', label: '고객 이름', inTable: false },
    { id: 'phone', label: '고객 전화번호', inTable: false },
  ],
  cases: [
    c('cs1', '주문한 쌀이 어디쯤 왔나요?', { days: '2', daysBucket: '3일이하', kind: '배송', tone: '평온' }, 'auto', {
      draft: '주문하신 쌀은 오늘 오후 도착 예정입니다. 배송 조회 링크를 보내 드립니다.',
    }),
    c('cs2', '받은 계란 세 개가 깨져 있어요. 교환해 주세요.', { days: '1', daysBucket: '3일이하', kind: '불량교환', tone: '평온' }, 'human'),
    c('cs3', '일주일 전에 시킨 세제가 아직 안 왔어요.', { days: '7', daysBucket: '4일이상', kind: '배송', tone: '평온' }, 'human'),
    c('cs4', '어제 주문했는데 언제 오나요?', { days: '1', daysBucket: '3일이하', kind: '배송', tone: '평온' }, 'auto', {
      draft: '어제 주문하신 상품은 내일 오전 도착 예정입니다.',
    }),
    c('cs5', '포인트는 언제 쌓이나요?', { days: '-', daysBucket: '3일이하', kind: '기타', tone: '평온' }, 'human'),
    c('cs6', '우유가 상해서 왔어요. 정말 실망입니다.', { days: '1', daysBucket: '3일이하', kind: '불량교환', tone: '화남' }, 'human'),
    c('cs7', '세 시간째 답이 없네. 당장 환불해요.', { days: '1', daysBucket: '3일이하', kind: '배송', tone: '화남' }, 'human', {
      trap: true,
      draft: '주문하신 상품은 내일 도착 예정입니다. 배송 조회 링크를 보내 드립니다.',
    }),
    c('cs8', '사흘 전 주문 건 배송 위치 알려 주세요.', { days: '3', daysBucket: '3일이하', kind: '배송', tone: '평온' }, 'auto', {
      draft: '사흘 전 주문하신 상품은 동네 배송 기사님이 오늘 출발했습니다.',
    }),
    c('cs9', '엿새째 안 오는데 장난하세요?', { days: '6', daysBucket: '4일이상', kind: '배송', tone: '화남' }, 'human'),
    c('cs10', '매장 직원이 불친절했어요.', { days: '-', daysBucket: '3일이하', kind: '기타', tone: '화남' }, 'human'),
  ],
  autoResult: '배송 위치를 안내합니다',
  fallback: { route: 'human', text: '사람이 답을 정합니다' },
  initialRule: {
    clauses: [
      { field: 'kind', value: '배송' },
      { field: 'daysBucket', value: '3일이하' },
    ],
  },
  initialHandoff: { clause: { field: 'kind', value: '불량교환' }, to: 'human' },
  trapHint: '화난 고객에게 자동 배송 안내가 나갔습니다. 요청보다 먼저 봐야 할 열이 있습니다. 말투를 Hand\u2011off 조건에 넣어 보세요.',
  fixedHandoff: { clause: { field: 'tone', value: '화남' }, to: 'human' },
  materials: '문의 문장, 주문 후 며칠, 요청 종류, 말투',
};

const stock: Department = {
  id: 'stock',
  name: '재고발주',
  todayWork: '발주할 상품을 정하는 일',
  summary: '발주가 요일에 묶여 있습니다. 금요일 오전, 주말 장사를 위해 무엇을 시킬지 정합니다.',
  scenes: [
    { id: 'st-s1', time: '08:30', text: '발주 담당이 창고를 돌며 남은 수량을 종이에 적습니다. 상품 120가지, 매주 같은 순서입니다.' },
    { id: 'st-s2', time: '09:00', text: '어제 판매량은 계산대 프로그램에 있지만, 종이 목록과 맞추는 데 30분이 걸립니다.' },
    { id: 'st-s3', time: '09:20', text: '"금요일은 우유 3상자"라는 오래된 메모대로 시킵니다. 이번 주는 이미 남아 있습니다.' },
    { id: 'st-s4', time: '09:40', text: '밖에 비가 오기 시작했습니다. 우산이 10개 남아 있어 담당은 충분하다고 봅니다.' },
    { id: 'st-s5', time: '10:00', text: '거래처 마감은 11시. 점장이 확인해야 발주서를 보낼 수 있어 점장을 기다립니다.' },
    { id: 'st-s6', time: '10:20', text: '지난주 라면을 두 번 시켜 창고가 넘쳤습니다. 누가 먼저 시켰는지 기록이 없습니다.' },
    { id: 'st-s7', time: '10:40', text: '신상품은 얼마나 팔릴지 몰라 담당이 감으로 정합니다.' },
    { id: 'st-s8', time: '10:55', text: '발주서를 보내고 나서야 바나나 수량을 빠뜨린 것을 알았습니다.' },
  ],
  chips: {
    work: ['창고에서 남은 수량을 센다', '어제 판매와 맞춰 본다', '거래처에 발주서를 보낸다'],
    asis: {
      in: ['아침에 남은 수량을 종이에 적는다'],
      split: ['요일 메모를 보고 시킬 상품을 고른다'],
      judge: ['담당이 감으로 수량을 정한다'],
      act: ['점장 확인 후 거래처에 발주서를 보낸다'],
      handoff: ['애매한 상품은 점장에게 묻는다'],
    },
    problem: {
      repeat: ['매주 같은 순서로 120가지 수량을 손으로 다시 센다'],
      wait: ['점장 확인을 기다리다 거래처 마감을 놓친다'],
      mistake: ['남은 수량만 보고 비 오는 날 우산을 안 시킨다'],
      humanOnly: ['신상품 수량을 담당 한 사람의 감으로만 정한다'],
    },
    bx: ['주말에 손님이 찾는 상품이 매대에서 비지 않는다'],
    ax: ['이틀치보다 적게 남은 상품을 오늘 발주로 자동 분류한다'],
    tobe: {
      in: ['어제 판매와 남은 수량이 한 표로 모인다'],
      split: ['이틀치보다 적은지 계산해 나눈다'],
      judge: ['이틀치보다 적으면 오늘 발주로 정한다'],
      act: ['발주서 초안을 만든다'],
      handoff: ['날씨를 타는 상품과 신상품은 예전 판매나 사람이 본다'],
    },
    improve: ['요일 메모 대신 남은 수량과 예전 판매를 보고 정한다'],
  },
  fields: [
    {
      id: 'item',
      label: '상품',
      values: ['우유', '계란', '라면', '두부', '생수', '식빵', '우산', '바나나', '요구르트', '휴지', '신상품'],
    },
    { id: 'tight', label: '이틀치보다 적음', values: ['예', '아니오'] },
    { id: 'weather', label: '날씨', values: ['맑음', '비'] },
  ],
  columns: [
    { id: 'item', label: '상품', inTable: true },
    { id: 'yesterday', label: '어제 판매', inTable: true },
    { id: 'left', label: '남은 수량', inTable: true },
    { id: 'tight', label: '이틀치보다 적음', inTable: true },
    { id: 'day', label: '요일', inTable: true },
    { id: 'weather', label: '날씨', inTable: true },
    { id: 'shelf', label: '진열 위치', inTable: false },
    { id: 'margin', label: '마진율', inTable: false },
    { id: 'supplierPhone', label: '거래처 담당자 휴대폰', inTable: false },
  ],
  cases: [
    st('s1', '우유 냉장 칸 앞줄이 비어 갑니다.', '우유', 30, 40, 'auto', '우유 2상자를 오늘 발주서에 넣었습니다.'),
    st('s2', '계란은 창고에 두 판 더 있습니다.', '계란', 20, 50, 'auto'),
    st('s3', '라면 묶음이 매대 뒤쪽에 조금 남았습니다.', '라면', 15, 25, 'auto', '라면 1박스를 오늘 발주서에 넣었습니다.'),
    st('s4', '두부는 오늘 아침 들어온 것이 있습니다.', '두부', 12, 30, 'auto'),
    st('s5', '생수 묶음이 입구 쪽에서 빨리 빠집니다.', '생수', 25, 45, 'auto', '생수 3묶음을 오늘 발주서에 넣었습니다.'),
    st('s6', '식빵은 오후에 한 번 더 들어옵니다.', '식빵', 10, 18, 'auto', '식빵 1상자를 오늘 발주서에 넣었습니다.'),
    {
      ...st('s7', '우산이 계산대 옆에 10개 남아 있습니다.', '우산', 2, 10, 'data', '우산은 남은 수량으로 충분합니다. 오늘은 시키지 않습니다.'),
      trap: true,
      past: '지난 비 오는 금요일, 우산 40개가 나갔습니다.',
    },
    st('s8', '바나나는 아직 덜 익은 것이 많습니다.', '바나나', 14, 40, 'auto'),
    st('s9', '요구르트 묶음이 냉장 칸 끝에 있습니다.', '요구르트', 18, 30, 'auto', '요구르트 2묶음을 오늘 발주서에 넣었습니다.'),
    st('s10', '휴지는 창고 위 칸에 쌓여 있습니다.', '휴지', 6, 20, 'auto'),
  ],
  autoResult: '오늘 발주합니다',
  fallback: { route: 'auto', text: '오늘은 안 시킵니다' },
  initialRule: { clauses: [{ field: 'tight', value: '예' }] },
  initialHandoff: { clause: { field: 'item', value: '신상품' }, to: 'human' },
  trapHint: '비 오는 날 우산을 "안 시킨다"로 정했습니다. 남은 수량만으로는 모자랍니다. 우산은 Hand\u2011off 조건으로 예전 같은 날씨의 판매를 보게 해 보세요.',
  fixedHandoff: { clause: { field: 'item', value: '우산' }, to: 'data' },
  materials: '상품, 어제 판매, 남은 수량, 날씨, 예전 같은 날씨의 판매',
};

const store: Department = {
  id: 'store',
  name: '매장운영',
  todayWork: '주말 오후 계산대를 어떻게 돌릴지 정하는 일',
  summary: '주말 오후마다 계산대 줄이 길어집니다. 계산대를 더 열지, 누구를 부를지 정합니다.',
  scenes: [
    { id: 'op-s1', time: '토 13:00', text: '점장이 계산대 앞 줄을 눈으로 세고, 매장 끝까지 걸어가 직원을 찾습니다.' },
    { id: 'op-s2', time: '토 14:00', text: '대기 손님이 11명. 진열하던 직원을 무전으로 부르는 데 몇 분이 걸립니다.' },
    { id: 'op-s3', time: '토 15:00', text: '줄은 길지만 부를 직원이 없습니다. 점장이 직접 계산대에 섭니다.' },
    { id: 'op-s4', time: '토 16:00', text: '매주 토요일 같은 시간에 같은 판단을 다시 합니다. 기록은 없습니다.' },
    { id: 'op-s5', time: '토 17:00', text: '부를 수 있는 직원 한 명은 아이를 데리러 가야 한다고 미리 말해 두었습니다.' },
    { id: 'op-s6', time: '토 17:10', text: '그 사정을 모르는 부점장이 그 직원을 계산대로 불렀습니다.' },
    { id: 'op-s7', time: '일 14:00', text: '손님이 줄을 보고 장바구니를 내려놓고 나갑니다.' },
    { id: 'op-s8', time: '일 16:00', text: '계산대를 열지 말지는 점장만 정할 수 있어, 점장이 쉬는 날엔 아무도 정하지 않습니다.' },
  ],
  chips: {
    work: ['계산대 앞 줄을 센다', '부를 수 있는 직원을 찾는다', '계산대를 더 열지 정한다'],
    asis: {
      in: ['점장이 줄을 눈으로 본다'],
      split: ['줄이 긴지 짧은지 감으로 나눈다'],
      judge: ['점장이 계산대를 더 열지 정한다'],
      act: ['무전으로 직원을 부른다'],
      handoff: ['점장이 없으면 아무도 정하지 않는다'],
    },
    problem: {
      repeat: ['매주 같은 시간에 같은 판단을 기록 없이 다시 한다'],
      wait: ['직원을 찾는 동안 손님이 줄을 서서 기다린다'],
      mistake: ['직원 사정을 모르고 그 직원을 계산대로 부른다'],
      humanOnly: ['계산대 판단은 점장만 할 수 있다'],
    },
    bx: ['주말 오후 손님이 계산대 앞에서 10분 넘게 기다리지 않는다'],
    ax: ['대기 10명 이상이고 부를 사람이 있으면 계산대 추가를 자동 안내한다'],
    tobe: {
      in: ['대기 인원과 부를 수 있는 사람이 한 화면에 모인다'],
      split: ['10명 이상이고 사람이 있는지 나눈다'],
      judge: ['조건에 맞으면 계산대 추가로 정한다'],
      act: ['부를 직원에게 안내를 보낸다'],
      handoff: ['직원 사정이 있으면 점장이 직접 정한다'],
    },
    improve: ['혼잡 조건이 맞으면 바로 안내하고, 직원 사정은 사람이 뺀다'],
  },
  fields: [
    { id: 'slot', label: '시간대', values: ['주말 오후', '평일 오전'] },
    { id: 'rush', label: '10명 이상이고 사람이 있음', values: ['예', '아니오'] },
    { id: 'personal', label: '직원 사정', values: ['있음', '없음'] },
  ],
  columns: [
    { id: 'time', label: '시간', inTable: true },
    { id: 'wait', label: '대기', inTable: true },
    { id: 'open', label: '계산대', inTable: true },
    { id: 'callable', label: '부를 수 있는 사람', inTable: true },
    { id: 'personal', label: '직원 사정', inTable: true },
    { id: 'rush', label: '10명 이상이고 사람이 있음', inTable: true },
    { id: 'sales', label: '시간대 매출', inTable: false },
    { id: 'staffName', label: '직원 이름', inTable: false },
    { id: 'reasonDetail', label: '사정 내용(가족·건강)', inTable: false },
  ],
  cases: [
    op('o1', '토요일 13시, 줄이 짧습니다.', '토 13시', 4, 2, 2, false, 'auto'),
    op('o2', '토요일 14시, 줄이 계산대 뒤 진열대까지 왔습니다.', '토 14시', 11, 2, 1, false, 'auto', '14시 계산대 3번을 엽니다. 진열 담당 1명은 3번으로 와 주세요.'),
    op('o3', '토요일 15시, 줄은 길지만 쉬는 직원이 없습니다.', '토 15시', 12, 3, 0, false, 'auto'),
    op('o4', '토요일 16시, 줄이 조금 늘었습니다.', '토 16시', 8, 3, 2, false, 'auto'),
    {
      ...op('o5', '토요일 17시, 줄이 입구까지 섰습니다.', '토 17시', 13, 3, 1, true, 'human', '17시 계산대 4번을 엽니다. 대기 직원 1명은 4번으로 와 주세요.'),
      trap: true,
    },
    op('o6', '토요일 18시, 퇴근길 손님이 몰립니다.', '토 18시', 15, 3, 2, false, 'auto', '18시 계산대 4번을 엽니다. 창고 담당 1명은 4번으로 와 주세요.'),
    op('o7', '일요일 13시, 줄이 거의 없습니다.', '일 13시', 6, 2, 1, false, 'auto'),
    op('o8', '일요일 14시, 줄이 열 명을 넘었습니다.', '일 14시', 10, 2, 1, false, 'auto', '14시 계산대 3번을 엽니다. 진열 담당 1명은 3번으로 와 주세요.'),
    op('o9', '일요일 15시, 줄이 조금 있습니다.', '일 15시', 9, 3, 2, false, 'auto'),
    op('o10', '일요일 16시, 줄이 길지만 모두 계산대에 서 있습니다.', '일 16시', 14, 3, 0, false, 'auto'),
  ],
  autoResult: '계산대를 하나 더 엽니다',
  fallback: { route: 'auto', text: '계산대를 그대로 둡니다' },
  initialRule: { clauses: [{ field: 'rush', value: '예' }] },
  initialHandoff: { clause: { field: 'slot', value: '평일 오전' }, to: 'human' },
  trapHint: '사정이 있는 직원을 계산대로 부르는 안내가 나갔습니다. 혼잡보다 먼저 사람이 봐야 하는 열이 있습니다. 직원 사정을 Hand\u2011off 조건에 넣어 보세요.',
  fixedHandoff: { clause: { field: 'personal', value: '있음' }, to: 'human' },
  materials: '시간, 대기 인원, 열린 계산대, 부를 수 있는 사람, 직원 사정 유무',
};

export const DEPARTMENTS: Department[] = [cs, stock, store];

export const DEPARTMENT_IDS = DEPARTMENTS.map((d) => d.id);

export function isDepartmentId(value: unknown): value is DepartmentId {
  return typeof value === 'string' && (DEPARTMENT_IDS as string[]).includes(value);
}

export function getDepartment(id: DepartmentId | null): Department | null {
  return DEPARTMENTS.find((d) => d.id === id) ?? null;
}

// --- 아래는 10건을 짧게 적기 위한 도우미. 사실값은 보이는 값에서 계산해 표와 판단이 어긋나지 않게 한다.

function c(
  id: string,
  sentence: string,
  cells: { days: string; daysBucket: string; kind: string; tone: string },
  expects: Case['expects'],
  extra: Partial<Case> = {},
): Case {
  return {
    id,
    sentence,
    cells,
    facts: { kind: cells.kind, daysBucket: cells.daysBucket, tone: cells.tone },
    expects,
    ...extra,
  };
}

function st(
  id: string,
  sentence: string,
  item: string,
  yesterday: number,
  left: number,
  expects: Case['expects'],
  draft?: string,
): Case {
  const tight = left <= yesterday * 2 ? '예' : '아니오';
  return {
    id,
    sentence,
    cells: { item, yesterday: String(yesterday), left: String(left), tight, day: '금', weather: '비' },
    facts: { item, tight, weather: '비' },
    expects,
    ...(draft ? { draft } : {}),
  };
}

function op(
  id: string,
  sentence: string,
  time: string,
  wait: number,
  open: number,
  callable: number,
  personal: boolean,
  expects: Case['expects'],
  draft?: string,
): Case {
  const rush = wait >= 10 && callable >= 1 ? '예' : '아니오';
  const personalText = personal ? '있음' : '없음';
  return {
    id,
    sentence,
    cells: {
      time,
      wait: `${wait}명`,
      open: `${open}대`,
      callable: `${callable}명`,
      personal: personalText,
      rush,
    },
    facts: { slot: '주말 오후', rush, personal: personalText },
    expects,
    ...(draft ? { draft } : {}),
  };
}
