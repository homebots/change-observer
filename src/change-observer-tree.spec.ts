import { ChangeDetectorTree } from './change-observer-tree';
import { jest } from '@jest/globals';

fdescribe('reactive change detector', () => {
  it('should create a new detector and adopt it', () => {
    const cd = new ChangeDetectorTree();
    const child = cd.fork();

    expect(child.parent).toBe(cd);
    expect(child.root).toBe(cd);
    expect(cd.root).toBe(cd);
  });

  it('should have a method to detach from a parent detector', async () => {
    const root = new ChangeDetectorTree();
    const child = root.fork();
    const rootSpy = jest.fn();
    const childSpy = jest.fn();
    let values = { root: 0, child: 0 };

    root.watch({ expression: () => values.root, callback: rootSpy });
    child.watch({ expression: () => values.child, callback: childSpy });

    expect(child.parent).toBe(root);
    expect(child.root).toBe(root);

    root.check();
    expect(rootSpy).toHaveBeenCalledTimes(1);
    expect(childSpy).toHaveBeenCalledTimes(1);

    child.detach();
    root.markAsDirty();
    root.check();
    expect(rootSpy).toHaveBeenCalledTimes(2);
    expect(childSpy).toHaveBeenCalledTimes(1);
  });
});
