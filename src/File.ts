import Emitter from './utils/Emitter'
import { Group } from './Group'

export enum LoadingStatus {
  IDLE = 1,
  LOADED = 2,
  PENDING = 3,
  ERROR = 4
}

export type FileArray = Array<FileOptions|string>

export interface FileOptions {
  name?: string
  path?: string
}

export function getIncrementalId() {
  let counter = 1;
  return (() => counter++)();
}

export class File extends Emitter {
  name: string
  status: LoadingStatus = LoadingStatus.IDLE
  path: string
  id: number
  computedPath?: string = null
  parent?: Group = null

  constructor(args: FileOptions | string) {
    super();
    if (typeof args === 'string') return File.fromString(args)
    if (!args.path) throw new Error('Loader.File: Argument "path" cannot be falsy')
    if (typeof args.name !== 'string') throw new Error('Loader.File: Argument "name" cannot be falsy')

    this.id = getIncrementalId();    
    this.status = LoadingStatus.IDLE
    this.path = args.path;
    this.name = args.name;
  }
  
  static fromString(def): File {
    const f = new File({
      name: '',
      path: def
    });
    f.name = 'file-' + f.id
    return f;
  }

  computePath(): string {
    let parent = this.parent;
    let baseUrl = ''
    while(parent) {
      baseUrl += parent.baseUrl;
      parent = parent.parent || null;
    }
    this.computedPath = baseUrl + this.path;
    return this.computedPath;
  }
}