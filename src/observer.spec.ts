import { Observer } from './observer';

describe('change observer', () => {
  describe('before/after checking for changes', () => {
    it('should call hooks before/after checking watchers', () => {
      const observer = new Observer();
      const before = jasmine.createSpy();
      const after = jasmine.createSpy();

      observer.beforeCheck(before);
      observer.afterCheck(after);
      observer.markAsDirty();
      observer.check();

      expect(before).toHaveBeenCalled();
      expect(after).toHaveBeenCalled();
    });

    it('should not run hooks until an observer is marked as dirty', () => {
      const observer = new Observer();
      const before = jasmine.createSpy();

      observer.beforeCheck(before);
      observer.check();

      expect(before).not.toHaveBeenCalled();

      observer.markAsDirty();
      observer.check();
      expect(before).toHaveBeenCalled();
    });
  });

  describe('watchers', () => {
    it('should allow an expression to be observed and notify of its changes', () => {
      let value = true;
      let lastValue;
      let firstTime = true;

      const expression = jasmine.createSpy().and.callFake(() => value);
      const callback = jasmine.createSpy();
      const observer = new Observer();

      observer.watch({ expression, callback });
      observer.markAsDirty();
      observer.check();

      expect(expression).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(value, lastValue, firstTime);

      value = false;
      lastValue = true;
      firstTime = false;
      observer.markAsDirty();
      observer.check();

      expect(expression).toHaveBeenCalledTimes(2);
      expect(callback).toHaveBeenCalledTimes(2);
      expect(callback).toHaveBeenCalledWith(value, lastValue, firstTime);
    });

    it('should not check for changes until the observer is marked as dirty', () => {
      const observer = new Observer();
      const expression = jasmine.createSpy();

      observer.watch({ expression });
      observer.check();
      observer.check();

      expect(expression).toHaveBeenCalledTimes(0);

      observer.markAsDirty();
      observer.check();

      expect(expression).toHaveBeenCalledTimes(1);
    });

    it('should deeply compare two objects', () => {
      let value = { one: '1' };
      const observer = new Observer();
      const equals = jasmine.createSpy();
      const same = jasmine.createSpy();

      observer.watch({ expression: () => value, callback: equals, useEquals: true });
      observer.watch({ expression: () => value, callback: same, useEquals: false });

      observer.markAsDirty();
      observer.check();

      value.one = 'one';

      observer.markAsDirty();
      observer.check();

      expect(same).toHaveBeenCalledTimes(1);
      expect(equals).toHaveBeenCalledTimes(2);
    });
  });
});
