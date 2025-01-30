const memory = require('../../src/model/data/memory/index.js');

describe('memory', () => {
  test('writeFragment() returns a Promise<void>', async () => {
    const fragment = { ownerId: 'a', id: 'b', data: {} };
    const result = await memory.writeFragment(fragment);
    expect(result).toBe(undefined);
  });

  test('readFragment() returns the same fragment created', async () => {
    const fragment = { ownerId: 'a', id: 'b', data: {} };
    await memory.writeFragment(fragment);
    const result = await memory.readFragment(fragment.ownerId, fragment.id);
    expect(result).toEqual(fragment);
  });

  test('writeFragmentData() returns a Promise', async () => {
    const result = await memory.writeFragmentData('a', 'b', Buffer.from([1, 2, 3]));
    expect(result).toBe(undefined);
  });

  test('readFragmentData() returns the same Buffer created', async () => {
    const buffer = Buffer.from([1, 2, 3]);
    await memory.writeFragmentData('a', 'b', buffer);
    const result = await memory.readFragmentData('a', 'b');
    expect(result).toEqual(buffer);
  });

  test('listFragments() returns an array of fragments', async () => {
    const fragment = { ownerId: 'a', id: 'b', data: {} };
    await memory.writeFragment(fragment);
    const result = await memory.listFragments(fragment.ownerId);
    expect(Array.isArray(result)).toBe(true);
  });

  test('listFragments() returns an array of fragment ids on default', async () => {
    const fragment = { ownerId: 'a', id: 'b', data: {} };
    await memory.writeFragment(fragment);
    const result = await memory.listFragments(fragment.ownerId);
    expect(result).toEqual([fragment.id]);
  });

  test('listFragments() returns an array of fragment objects when expand=true', async () => {
    const fragment = { ownerId: 'a', id: 'b', data: {} };
    await memory.writeFragment(fragment);
    const result = await memory.listFragments(fragment.ownerId, true);
    expect(result).toEqual([fragment])
  });

  test('deleteFragment() removes the fragment from memory', async () => {
    const fragment = { ownerId: 'a', id: 'b', data: {} };
    await memory.writeFragment(fragment);
    await memory.deleteFragment(fragment.ownerId, fragment.id);
    const result = await memory.listFragments(fragment.ownerId);
    expect(result).toEqual([]);
  });
});
