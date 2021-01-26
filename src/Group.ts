import Emitter from './utils/Emitter'
import { File, FileOptions, LoadingStatus, FileArray } from './File'
import { Manager } from './Manager';

export function getIncrementalId() {
  let counter = 1;
  return (() => counter++)();
}

type GroupArray = Array<GroupOptions|FileArray>

export interface GroupOptions {
  baseUrl?: string
  groups?: GroupArray,
  name?: string
  files?: FileArray
}

export class Group extends Emitter {
  id: number
  name: string
  baseUrl: string = ''
  files: File[] = []
  groups: Group[] = []
  context?: Manager
  parent?: Group = null

  constructor(args: GroupOptions | FileArray = {}) {
    super();
    if (args instanceof Array) return Group.fromFileArray(args)
    if (typeof args.name !== "string") throw new Error('Loader.File: Argument "name" cannot be falsy');
    this.id = getIncrementalId();
    this.name = args.name;
    this.baseUrl = args.baseUrl ? args.baseUrl.toString() : '';
    (args.files || []).forEach(p => this.addFile(p));
    (args.groups || []).forEach(p => this.addGroup(p));
  }

  addFiles(files: Array<FileOptions>): void {
    files.forEach((a) => {
      this.addFile(a);
    })
  }

  addFile(def: FileOptions | string): File {
    const file = new File(def);
    file.parent = this
    this.files.push(file);
    return file;
  }

  addGroup(def: GroupOptions | FileArray): Group {
    const group = new Group(def);
    group.parent = this
    this.groups.push(group);
    return group;
  }
  
  setContext(context: Manager): void {
    this.context = context;
    this.groups.forEach((g) => {
      g.setContext(context);
    })
  }

  load(): Promise<File|File[]> {
    return this.context.load(this);
  }

  /**
   * Return all the files contain in a folder by status
   */
  getFilesByStatus(status: LoadingStatus): File[] {
    return this.files
      .filter(file => file.status === status)
      .concat(this.groups.reduce((acc, value: Group) => acc.concat(value.idleFiles), []))
  }

  get idleFiles(): File[] {
    return this.getFilesByStatus(LoadingStatus.IDLE);
  }

  get pendingFiles(): File[] {
    return this.getFilesByStatus(LoadingStatus.PENDING);
  }

  get loadedFiles(): File[] {
    return this.getFilesByStatus(LoadingStatus.LOADED);
  }

  get isLoaded(): boolean {
    return !this.files.find(file => file.status === LoadingStatus.PENDING || file.status === LoadingStatus.IDLE);
  }

  private static fromFileArray(files: FileArray): Group {
    const g = new Group({
      name: ``,
      files
    })
    g.name = `group-${(g.id).toString()}`;
    return g;
  }
}