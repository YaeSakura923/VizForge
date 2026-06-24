import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * 元素入场动画 — fade + slide up
 */
export function useEntranceAnimation(deps: unknown[] = []) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      gsap.fromTo(
        ref.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' },
      );
    }
  }, deps);

  return ref;
}

/**
 * 面板切换动画
 */
export function animatePanelSwitch(
  container: HTMLElement | null,
  direction: 'left' | 'right' = 'right',
) {
  if (!container) return;
  const fromX = direction === 'right' ? 16 : -16;
  gsap.fromTo(
    container,
    { opacity: 0, x: fromX },
    { opacity: 1, x: 0, duration: 0.25, ease: 'power2.out' },
  );
}

/**
 * 按钮点击波纹反馈
 */
export function animateButtonPress(el: HTMLElement) {
  gsap.fromTo(
    el,
    { scale: 0.92 },
    { scale: 1, duration: 0.2, ease: 'back.out(2)' },
  );
}

/**
 * 数字变化计数动画
 */
export function animateCount(
  from: number,
  to: number,
  onUpdate: (val: number) => void,
  duration = 0.6,
) {
  const obj = { val: from };
  gsap.to(obj, {
    val: to,
    duration,
    ease: 'power2.out',
    onUpdate: () => onUpdate(Math.round(obj.val)),
  });
}

/**
 * LOD / FPS 数值脉冲高亮
 */
export function animateValuePulse(el: HTMLElement | null) {
  if (!el) return;
  gsap.fromTo(
    el,
    { color: '#4fc3f7', scale: 1.1 },
    { color: '#e0e0e0', scale: 1, duration: 0.5, ease: 'power1.out' },
  );
}

/**
 * 进度条填充动画
 */
export function animateProgressBar(
  el: HTMLElement | null,
  targetWidth: number,
) {
  if (!el) return;
  gsap.to(el, {
    width: `${targetWidth}%`,
    duration: 0.8,
    ease: 'power3.out',
  });
}

/**
 * 加载骨架屏脉冲
 */
export function animateSkeletonPulse(el: HTMLElement | null) {
  if (!el) return;
  gsap.to(el, {
    opacity: 0.4,
    duration: 0.8,
    repeat: -1,
    yoyo: true,
    ease: 'power1.inOut',
  });
}
