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
  _files: File[] = []
  groups: Group[] = []
  context?: Manager
  parent?: Group = null
  status?: LoadingStatus.IDLE

  private _isLoaded: boolean = true

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

  get(name) {
    let match = null;
    if (this.name === name) match = this

    this.groups.forEach(g => {
      const t = g.get(name)
      if (t) {
        match = t;
      }
    })
    
    const file = this._files.find(f => f.name === name)
    if (file) {
      match = file;
    }

    return match
  }

  addFiles(files: Array<FileOptions>): void {
    files.forEach((a) => {
      this.addFile(a);
    })
  }

  addFile(def: FileOptions | string): File {
    const file = new File(def);
    file.once('load', () => {
      this.emit('file:load', file)
    })

    file.on('progress', (progress) => {
      const { loaded, total } = this.files.reduce((acc, value) => {
        acc.loaded += value.loaded
        acc.total += value.size
        return acc;
      }, { loaded: 0, total: 0 })
      
      this.emit('progress', new ProgressEvent('group', { loaded, total }))
    })
    
    file.parent = this
    this._files.push(file);
    this._isLoaded = false;
    return file;
  }

  addGroup(def: GroupOptions | FileArray): Group {
    const group = new Group(def);
    group.on('file:load', (result) => this.emit('file:load', result))
    group.parent = this
    this.groups.push(group);
    this._isLoaded = false;
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
    return this._files
      .filter(file => file.status === status)
      .concat(this.groups.reduce((acc, value: Group) => acc.concat(value.getFilesByStatus(status)), []))
  }

  get files(): File[] {
    return this._files
      .concat(this.groups.reduce((acc, value: Group) => acc.concat(value.files), []))
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
    if (this._isLoaded) return this._isLoaded;
    const isFilesLoaded = !this._files.find(file => file.status === LoadingStatus.PENDING || file.status === LoadingStatus.IDLE);
    const isGroupsLoaded = !this.groups.find(group => !group.isLoaded)
    this._isLoaded = isFilesLoaded && isGroupsLoaded
    return this._isLoaded
  }

  handleEventsIfLoaded(bubling = true) {
    if (this.isLoaded) {
      this.emit('load', this);
    }
    if (bubling && this.parent) {
      this.parent.handleEventsIfLoaded(bubling)
    }
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