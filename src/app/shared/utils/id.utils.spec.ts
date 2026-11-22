import { createId } from './id.utils';

describe('createId', () => {
  it('returns distinct non-empty ids', () => {
    const ids = new Set(Array.from({ length: 50 }, () => createId()));
    expect(ids.size).toBe(50);
    ids.forEach(id => expect(id.length).toBeGreaterThan(8));
  });
});
