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
  size?: number
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
  size: number = 0
  loaded: number = 0

  constructor(args: FileOptions | string) {
    super();
    if (typeof args === 'string') return File.fromString(args)
    if (!args.path) throw new Error('Loader.File: Argument "path" cannot be falsy')
    if (typeof args.name !== 'string') throw new Error('Loader.File: Argument "name" cannot be falsy')

    this.id = getIncrementalId();    
    this.status = LoadingStatus.IDLE
    this.path = args.path;
    this.name = args.name;
    this.size = args.size ? args.size : 0;

    this.on('progress', (event: ProgressEvent) => {
      this.loaded = event.loaded
      if (this.size === 0) {
        this.size = event.total
      }
    })
  }
  
  static fromString(def): File {
    const f = new File({
      name: '',
      path: def
    });
    f.name = 'file-' + f.id
    return f;
  }

  get isLoaded(): boolean {
    return this.status === LoadingStatus.LOADED
  }
  
  load(): Promise<File|File[]> {
    return this.parent.context.load(this);
  }

  handleEventsIfLoaded(bubling = true) {
    if (this.isLoaded) {
      this.emit('load', this)
    }
    if (bubling && this.parent) {
      this.parent.handleEventsIfLoaded(bubling)
    }
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