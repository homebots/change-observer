import { isEqual, clone } from 'lodash-es';

type AnyFunction = (...args: any[]) => any;

export type WatcherCallback<T> = (newValue: T, oldValue: T | undefined, firstTime: boolean) => void;
export type Expression<T> = () => T;

export interface Watcher<T = any> {
  expression: Expression<T>;
  callback?: WatcherCallback<T>;
  lastValue?: T | undefined;
  useEquals?: boolean;
  firstTime?: boolean;
}

export interface IObserver {
  beforeCheck(fn: AnyFunction): void;
  afterCheck(fn: AnyFunction): void;
  check(): void;
  markAsDirty(): void;
  watch(watcher: Watcher): void;
}

export interface Comparator {
  (value: any, lastValue: any, useEquals: boolean): boolean;
}

const defaultComparator: Comparator = (newValue, lastValue, useEquals) =>
  (!useEquals && newValue !== lastValue) || (useEquals && !isEqual(newValue, lastValue));

export class Observer implements IObserver {
  protected dirty = false;
  protected watchers: Watcher[] = [];
  protected _afterCheck: AnyFunction[] = [];
  protected _beforeCheck: AnyFunction[] = [];

  constructor(protected comparator: Comparator = defaultComparator) {}

  beforeCheck(fn: AnyFunction) {
    this._beforeCheck.push(fn);
  }

  afterCheck(fn: AnyFunction) {
    this._afterCheck.push(fn);
  }

  markAsDirty() {
    this.dirty = true;
  }

  watch<T>(watcher: Watcher<T>) {
    this.watchers.push({ ...watcher, firstTime: true });
  }

  check() {
    if (!this.dirty) {
      return;
    }

    this._beforeCheck.forEach((fn) => fn());

    for (const watcher of this.watchers) {
      this.checkWatcher(watcher);
    }

    this._afterCheck.forEach((fn) => fn());

    this.dirty = false;
  }

  protected checkWatcher(watcher: Watcher) {
    const newValue = watcher.expression();
    const { firstTime, lastValue, useEquals } = watcher;
    const hasChanges = this.comparator(newValue, lastValue, useEquals);

    if (!hasChanges) {
      return;
    }

    watcher.firstTime = false;
    watcher.lastValue = useEquals ? clone(newValue) : newValue;

    if (watcher.callback) {
      watcher.callback(newValue, lastValue, firstTime);
    }
  }
}
