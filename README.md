# 매일마트 AX 실습

강사 없이 하루 안에 가상 회사 부서 하나의 일을 따라가며
“문제가 먼저인가 데이터가 먼저인가”, “문제는 어떻게 찾는가”에 내 문장으로 답하는 자기주도 웹 실습.

- 계정·서버·외부 API 없음. 진행은 브라우저 `localStorage`의 `maeilmart-ax-v1` 키에만 저장.
- 화면은 **컴퓨터 바탕화면 위 브라우저 창**. 단계마다 다른 사내 웹페이지(포털, 문서, 스프레드시트, 자료함, 자동화 설정)로 넘어가듯 주소창과 탭이 바뀐다.

```bash
npm install
npm test        # 엔진·부서 데이터·저장값 복구·통과 판정 테스트
npm run dev     # http://localhost:5173
npm run build   # 타입 검사 후 dist/ 정적 파일
```

사진은 `public/images/`에 넣는다 (그 폴더의 README 참고).

## 구조

```
src/
  types.ts                 CourseState, Department, Case, Clause … 모든 타입
  content/
    steps.ts               16단계 id·제목·통과 뒤 보여 줄 이름, 다섯 칸, 수행방식 설명
    sites.ts               단계별 "웹페이지" (사이트 이름, 주소창 URL, 사진 경로)
    departments.ts         부서 3개: 장면 8, 칩 문장, 열, 10건, 초기 규칙, 함정 힌트
    friction.ts            스티커 개수와 최다 종류
    task.ts                앞 단계 문장으로 과제 카드 조립
    reference.ts           마지막에만 열리는 참고 답
  engine/
    runWorkflow.ts         조건 일치 → 우선순위(넘김 → 자동 → 기본) → 추적 문장
  state/
    fresh.ts               fresh / hydrate(깨진 저장값 복구) / withDepartment
    gates.ts               canLeave · canEnter · firstIncomplete · runKey  ← 통과 판정은 여기 한곳
    ProgressContext.tsx    상태 보관·저장. 갱신은 항상 update(s => …) 함수형으로
  components/
    Desktop.tsx            바탕화면, 작업표시줄, 브라우저 창, 로딩 막대, 이름 알림
    StepShell.tsx          각 페이지 공통 틀 (사이트 머리, 진행 막대, 이전/다음)
    ChipInput, SlotGrid, LogicForm, CaseSheet, useStepNav
  steps/*.tsx              16개 화면. registry.tsx가 id와 연결
```

### 데이터 흐름

```
localStorage ──hydrate──▶ CourseState ──update(fn)──▶ CourseState ──▶ localStorage
                               │
                 canLeave(step, state)  ← 다음 버튼, 주소 직접 진입, 브라우저 앞으로 버튼이 모두 이 함수만 본다
                               │
       runKey(state) == lastRun.key && lastRun.trapOk  →  실행 통과
```

### 새 부서 더하기

`types.ts`의 `DepartmentId`에 id를 더하고 `departments.ts`의 `DEPARTMENTS`에 같은 모양의 데이터를 넣는다.
화면 코드는 고치지 않는다. `departments.test.ts`와 `runWorkflow.test.ts`가 다음을 자동으로 검사한다.

- 장면 8개, 10건, 함정(`trap: true`)은 한 건
- 초기 규칙에서는 함정 한 건만 기대와 어긋남
- `fixedHandoff`로는 10건 모두 기대와 맞음
- 조건에 쓰는 값이 모두 `fields` 목록 안에 있음

## 안전

- 입력은 모두 `<textarea>`이고 React가 글자로만 그린다. `contentEditable`, `dangerouslySetInnerHTML`은 쓰지 않는다.
- 저장되는 것은 학습자가 쓴 문장과 선택뿐이다. 이름·연락처를 묻지 않는다.
  12단계에 "고객 전화번호", "직원 이름" 같은 열을 일부러 후보로 두어, 개인정보 열을 빼는 판단을 연습하게 한다.
- `hydrate`는 형태·길이·부서 id·절 개수를 검사하고, 부서에 없는 장면·열·건 id는 걸러 낸다. 읽을 수 없으면 새 과정으로 시작한다.
