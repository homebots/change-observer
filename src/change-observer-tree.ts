import { ChangeDetector, CheckOptions } from './change-observer';
import { Observer } from './observer';

let uid = 0;
const setTimeoutNative = setTimeout;

export class ChangeDetectorTree extends Observer implements ChangeDetector {
  readonly id = `@${++uid}`;

  root: ChangeDetector = this;
  parent: ChangeDetector;
  children: Array<ChangeDetector> = [];

  protected timer: any = 0;
  protected promise: Promise<void> | null;

  detach() {
    if (this.parent && this.parent.children) {
      this.parent.children = this.parent.children.filter((child) => child !== this);
    }
  }

  adopt<T extends ChangeDetector>(cd: T) {
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
      this.timer = setTimeoutNative(() => {
        this.check();
        this.timer = 0;
        this.promise = null;
        resolve(null);
      }, 1);
    }));
  }

  fork() {
    const cd = new ChangeDetectorTree();
    this.adopt(cd);

    return cd;
  }
}
