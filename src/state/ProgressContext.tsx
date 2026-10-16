import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getDepartment } from '../content/departments';
import type { CourseState, Department } from '../types';
import { fresh, hydrate, STORAGE_KEY } from './fresh';

interface Progress {
  state: CourseState;
  dept: Department | null;
  /**
   * 항상 최신 상태를 받아 새 상태를 돌려주는 갱신만 받는다.
   * columnMode, answers, rule, handoff 같은 중첩 객체를 바깥에서 복사해 넣으면
   * 같은 순간 여러 칸을 누를 때 앞의 선택이 사라진다.
   */
  update: (fn: (s: CourseState) => CourseState) => void;
  reset: () => void;
}

const ProgressContext = createContext<Progress | null>(null);

function load(): CourseState {
  try {
    return hydrate(localStorage.getItem(STORAGE_KEY));
  } catch {
    return fresh();
  }
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CourseState>(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // 사생활 보호 모드 등에서는 저장하지 못해도 화면은 그대로 동작한다.
    }
  }, [state]);

  const update = useCallback((fn: (s: CourseState) => CourseState) => setState(fn), []);
  const reset = useCallback(() => setState(fresh()), []);
  const dept = getDepartment(state.department);

  const value = useMemo(() => ({ state, dept, update, reset }), [state, dept, update, reset]);
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): Progress {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress는 ProgressProvider 안에서만 쓸 수 있습니다.');
  return ctx;
}

/** 부서가 정해진 뒤의 화면에서 쓴다. 라우팅이 부서 없는 진입을 막으므로 null이 오지 않는다. */
export function useDept(): Department {
  const { dept } = useProgress();
  if (!dept) throw new Error('부서가 정해지지 않았습니다.');
  return dept;
}
