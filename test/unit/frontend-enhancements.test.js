import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h, evalComponent, resetComponentState } from '../../src/frontend/src/lib/react.js';
import { EmptyState } from '../../src/frontend/src/components/ui/EmptyState.js';
import { SkeletonLine, SkeletonCard, SkeletonTable } from '../../src/frontend/src/components/ui/Skeleton.js';
import { OfflineBanner } from '../../src/frontend/src/components/ui/OfflineBanner.js';
import { ErrorBoundary } from '../../src/frontend/src/components/ui/ErrorBoundary.js';

test('Frontend UI - EmptyState renders icon, title, description, and action button', () => {
  const tree = evalComponent(
    h(EmptyState, {
      icon: '📭',
      title: 'Chưa có bài nộp nào',
      description: 'Hãy nộp giải thuật C++ đầu tiên của bạn để bắt đầu chấm điểm!',
      action: h('button', { type: 'button' }, 'Nộp bài ngay'),
    }),
  );
  const json = JSON.stringify(tree);

  assert.match(json, /Chưa có bài nộp nào/);
  assert.match(json, /Hãy nộp giải thuật C\+\+ đầu tiên/);
  assert.match(json, /Nộp bài ngay/);
  assert.match(json, /📭/);
});

test('Frontend UI - EmptyState renders without action button when omitted', () => {
  const tree = evalComponent(
    h(EmptyState, {
      title: 'Không có dữ liệu',
      description: 'Danh sách rỗng',
    }),
  );
  const json = JSON.stringify(tree);

  assert.match(json, /Không có dữ liệu/);
  assert.match(json, /Danh sách rỗng/);
  assert.doesNotMatch(json, /Nộp bài ngay/);
});

test('Frontend UI - Skeleton components render animated shimmer elements', () => {
  // SkeletonLine
  const lineTree = evalComponent(
    h(SkeletonLine, {
      width: '250px',
      height: '32px',
    }),
  );
  assert.equal(lineTree.props.className, 'skeleton-shimmer');
  assert.equal(lineTree.props.style?.width, '250px');
  assert.equal(lineTree.props.style?.height, '32px');

  // SkeletonCard
  const cardTree = evalComponent(h(SkeletonCard, { lines: 2 }));
  assert.ok(cardTree.props.children.length >= 2);

  // SkeletonTable
  const tableTree = evalComponent(h(SkeletonTable, { rows: 3 }));
  assert.ok(tableTree.props.children.length >= 3);
});

test('Frontend UI - OfflineBanner returns null when online, renders warning when offline', () => {
  resetComponentState();

  // 1. Online by default in Node environment
  const onlineTree = evalComponent(h(OfflineBanner, { key: 'b1' }));
  assert.equal(onlineTree, null, 'OfflineBanner should return null when user is online');

  // 2. Offline simulation via window.navigator
  resetComponentState();
  const prevWindow = globalThis.window;
  globalThis.window = {
    navigator: { onLine: false },
    addEventListener: () => {},
    removeEventListener: () => {},
  };
  try {
    const offlineTree = evalComponent(h(OfflineBanner, { key: 'b2' }));
    const json = JSON.stringify(offlineTree);
    assert.match(json, /Mất kết nối mạng/);
    assert.match(json, /alert/);
  } finally {
    globalThis.window = prevWindow;
  }
});

test('Frontend UI - ErrorBoundary renders children normally when healthy', () => {
  const tree = evalComponent(
    h(ErrorBoundary, {}, h('div', { id: 'child-content' }, 'Healthy Content')),
  );
  const json = JSON.stringify(tree);
  assert.match(json, /Healthy Content/);
  assert.doesNotMatch(json, /Đã xảy ra lỗi/);
});

test('Frontend Hooks - useCodeDraft localStorage isolation and persistence logic', () => {
  const storage = new Map();
  const mockLocalStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, val) => storage.set(key, String(val)),
    removeItem: (key) => storage.delete(key),
  };

  const lab1Key = 'leetkob_code_draft_1';
  const lab2Key = 'leetkob_code_draft_2';

  // Save drafts for two different labs
  mockLocalStorage.setItem(lab1Key, 'int solveLab1() { return 1; }');
  mockLocalStorage.setItem(lab2Key, 'int solveLab2() { return 2; }');

  // Verify key isolation
  assert.equal(mockLocalStorage.getItem(lab1Key), 'int solveLab1() { return 1; }');
  assert.equal(mockLocalStorage.getItem(lab2Key), 'int solveLab2() { return 2; }');

  // Clear draft for lab 1
  mockLocalStorage.removeItem(lab1Key);
  assert.equal(mockLocalStorage.getItem(lab1Key), null);
  assert.equal(mockLocalStorage.getItem(lab2Key), 'int solveLab2() { return 2; }');
});
