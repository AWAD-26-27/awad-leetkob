import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cx } from '../../src/frontend/src/utils/classNames.js';
import { formatTime } from '../../src/frontend/src/utils/formatTime.js';
import { setAuthToken, getAuthToken, ApiError } from '../../src/frontend/src/lib/apiClient.js';
import {
  createElement,
  h,
  useState,
  useEffect,
  createContext,
  useContext,
} from '../../src/frontend/src/lib/react.js';
import { DEMO_USERS } from '../../src/frontend/src/config/constants.js';

test('cx utility correctly joins classes and handles conditional truthy/falsy values', () => {
  assert.equal(cx('btn', 'btn-primary'), 'btn btn-primary');
  assert.equal(cx('btn', false, null, undefined, 'active'), 'btn active');
  assert.equal(cx('btn', { 'btn-sm': true, 'btn-disabled': false }), 'btn btn-sm');
  assert.equal(cx(['a', 'b'], 'c'), 'a b c');
});

test('formatTime utility handles ISO UTC timestamps and invalid dates gracefully', () => {
  assert.equal(formatTime(null), '—');
  assert.equal(formatTime(''), '—');
  const formatted = formatTime('2026-11-24T00:00:00.000Z');
  assert.ok(typeof formatted === 'string' && formatted.length > 0);
  assert.equal(formatTime('invalid-date'), 'invalid-date');
});

test('apiClient manages authorization token and handles ApiError instances', () => {
  setAuthToken('tok-test');
  assert.equal(getAuthToken(), 'tok-test');

  const err = new ApiError(404, 'not-found', 'Lab does not exist', { detail: 'test' });
  assert.equal(err.status, 404);
  assert.equal(err.title, 'not-found');
  assert.equal(err.detail, 'Lab does not exist');
});

test('React runtime exports valid createElement, hooks, and context APIs', () => {
  assert.equal(typeof createElement, 'function');
  assert.equal(typeof h, 'function');
  assert.equal(typeof useState, 'function');
  assert.equal(typeof useEffect, 'function');
  assert.equal(typeof createContext, 'function');
  assert.equal(typeof useContext, 'function');

  const vnode = createElement('button', { className: 'btn', id: 'my-btn' }, 'Click me');
  assert.equal(vnode.type, 'button');
  assert.equal(vnode.props.className, 'btn');
  assert.equal(vnode.props.id, 'my-btn');
  assert.equal(vnode.props.children, 'Click me');
});

test('DEMO_USERS configuration contains all 5 required PA3 identities', () => {
  assert.equal(DEMO_USERS.length, 5);
  assert.ok(DEMO_USERS.find((u) => u.username === 'admin'));
  assert.ok(DEMO_USERS.find((u) => u.username === 'ta_a'));
  assert.ok(DEMO_USERS.find((u) => u.username === 'ta_b'));
  assert.ok(DEMO_USERS.find((u) => u.username === 'student_1'));
  assert.ok(DEMO_USERS.find((u) => u.username === 'student_2'));
});
