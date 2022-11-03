import { TreeObserver } from './tree-observer';

describe('observer tree', () => {
  it('should create a new detector and adopt it', () => {
    const cd = new TreeObserver();
    const child = cd.fork();

    expect(child.parent).toBe(cd);
    expect(child.root).toBe(cd);
    expect(cd.root).toBe(cd);
  });

  it('should have a method to detach from a parent detector', async () => {
    const root = new TreeObserver();
    const child = root.fork();
    const rootSpy = jasmine.createSpy();
    const childSpy = jasmine.createSpy();
    const values = { root: 0, child: 0 };
    const counters = { root: 0, child: 0 };

    root.watch({ expression: () => values.root, callback: rootSpy });
    root.watch({ expression: () => counters.root++ });

    child.watch({ expression: () => values.child, callback: childSpy });
    child.watch({ expression: () => counters.child++ });

    expect(child.parent).toBe(root);
    expect(child.root).toBe(root);

    root.check();
    expect(counters).toEqual({ root: 1, child: 1 });
    // expect(rootSpy).toHaveBeenCalledTimes(1);
    // expect(childSpy).toHaveBeenCalledTimes(1);

    child.detach();
    root.markAsDirty();

    values.root = 1;
    values.child = 1;
    console.log(root);
    // console.log(child);
    root.check();

    // expect(rootSpy).toHaveBeenCalledTimes(2);
    // expect(childSpy).toHaveBeenCalledTimes(1);
  });
});
