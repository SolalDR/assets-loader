import Emitter from './utils/Emitter'
import { Loader } from './Loader'
import { Rule } from './interfaces/Rule'
import { Group, GroupOptions } from './Group'
import { FileOptions, File, LoadingStatus, FileArray } from './File'

type LoadArgument = Group | File | File[] | Group[]

export class Manager extends Emitter {
  loaders: Array<Loader>
  rules: Array<Rule>
  groups: Map<string, Group> = new Map()
  files: Map<string, File> = new Map()

  constructor(rules, {
    baseUrl = ''
  } = {}) {
    super();
    this.rules = rules;
    this.initDefaultGroup(baseUrl)
  }

  get defaultGroup() {
    return this.groups.get('default')
  }

  initDefaultGroup(baseUrl: string) {
    const group = new Group({ name: 'default', baseUrl });
    group.on('load', () => {
      this.emit('load', group)
    })
    group.on('progress', (data) => {
      this.emit('progress', data)
    })
    this.groups.set('default', group);
  }

  get(name) {
    return this.defaultGroup.get(name)
  }

  async loadGroup(GroupOptions): Promise<Group> {
    const group = this.addGroup(GroupOptions);
    await this.load(group);
    return group;
  }

  async loadFile(def: string | FileOptions): Promise<unknown> {
    const file = this.addFile(def);
    return (await this.load(file)) as File
  }

  addFile(def: FileOptions | string): File {
    const file = this.groups.get('default').addFile(def);
    return file;
  }

  addFiles(files: FileArray): void {
    files.forEach(file => {
      this.addFile(file);
    })
  }

  addGroup(args: GroupOptions | FileArray): Group {
    return this.defaultGroup.addGroup(args)
  }

  load(args: LoadArgument = [...this.groups.values()]): Promise<File[]|File> {
    let files = [];
    if (args instanceof Group) files = args.idleFiles
    if (args instanceof File) files = [args]
    if (args instanceof Array && args[0] instanceof File) files = args
    if (args instanceof Array && args[0] instanceof Group)
      files = (args as Group[]).reduce((acc: Array<File>, group: Group) => {
        return acc.concat(group.idleFiles)
      }, [])

    const promiseFiles = files.map(file => new Promise<File>((resolve, reject) => {
      const rule = this.rules.find((rule: Rule) => {
        if (file.path.match(rule.test)) {
          return true
        }
      })
      
      if (!rule) {
        console.error(`Loader: No loader for file "${file.path}"`) 
        return
      }

      const loader = rule.loader

      file.status = LoadingStatus.PENDING;
      file.computePath();

      if (this.files.has(file.computedPath)) {
        const cachedFile = this.files.get(file.computedPath)
        resolve(cachedFile)
        return
      }

      loader.load(file).then(object => {
        this.files.set(file.computedPath, file);
        file.subject = object;
        file.status = LoadingStatus.LOADED
        file.handleEventsIfLoaded()
        resolve(file);
      }).catch((error) => {
        console.error(error);
      })
    }))

    if (promiseFiles.length === 1) {
      return promiseFiles[0];
    }

    return Promise.all(promiseFiles);
  }
}