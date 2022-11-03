import { IObserver, Observer } from './observer';

export interface CheckOptions {
  async: boolean;
}

export interface ITreeObserver extends IObserver {
  id: string;
  root: ITreeObserver;
  parent?: ITreeObserver;
  children?: ITreeObserver[];

  scheduleCheck(options?: CheckOptions): void;
  detectChanges(options?: CheckOptions): Promise<void> | void;
  detach(): void;
  adopt(cd: ITreeObserver): void;
  fork(): ITreeObserver;
}

export class TreeObserver extends Observer implements ITreeObserver {
  private static readonly tag = Symbol('ChangeDetector');
  static uid = 0;

  static getDetectorOf(target: any): TreeObserver {
    return target[TreeObserver.tag];
  }

  static setDetectorOf(target: any, detector: TreeObserver): void {
    target[TreeObserver.tag] = detector;
  }

  readonly id = `@${++TreeObserver.uid}`;

  root: TreeObserver = this;
  parent: TreeObserver;
  children: Array<TreeObserver> = [];

  protected timer: any = 0;
  protected promise: Promise<void> | null;

  detach() {
    if (this.parent && this.parent.children) {
      this.parent.children = this.parent.children.filter((child) => child !== this);
    }
  }

  adopt<T extends TreeObserver>(cd: T) {
    this.children.push(cd);
    cd.parent = this;
    cd.root = this.root;
  }

  markAsDirty() {
    super.markAsDirty();

    for (const child of this.children) {
      child.markAsDirty();
    }
  }

  detectChanges(options: CheckOptions = { async: true }): Promise<void> | void {
    this.markAsDirty();
    return this.scheduleCheck(options);
  }

  check() {
    super.check();

    for (const child of this.children) {
      child.check();
    }
  }

  scheduleCheck(options?: CheckOptions) {
    if (this.root !== this) {
      return this.root.scheduleCheck(options);
    }

    if (!options?.async) {
      this.check();
      return;
    }

    if (this.timer) {
      return this.promise;
    }

    return (this.promise = new Promise<void>((resolve) => {
      this.timer = setTimeout(() => {
        this.check();
        this.timer = 0;
        this.promise = null;
        resolve(null);
      }, 1);
    }));
  }

  fork() {
    const cd = new TreeObserver();
    this.adopt(cd);

    return cd;
  }
}
