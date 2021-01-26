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
    this.addGroup({ name: 'default', baseUrl });
  }

  loadGroup(GroupOptions) {
    const group = this.addGroup(GroupOptions);
    this.load(group);
    return group;
  }

  loadFile(def: string | FileOptions) {
    const file = this.addFile(def);
    return this.load(file);
  }

  addFile(def: FileOptions | string): File {
    const file = this.groups.get('default').addFile(def);
    return file;
  }

  addGroup(args: GroupOptions | FileArray): Group {
    const group = new Group(args);
    this.groups.set(group.name, group)
    group.setContext(this);
    if (group) return group;
  }

  load(args: LoadArgument = [...this.groups.values()]): Promise<File[]|File> {
    let files = [];
    if (args instanceof Group) files = args.idleFiles
    if (args instanceof File) files = [args]
    if (args instanceof Array && args[0] instanceof File) files = args
    if (args instanceof Array && args[0] instanceof Group)
      files = (args as Group[]).reduce((acc: Array<File>, value: Group) => acc.concat(value.idleFiles), [])

    const promiseFiles = files.map(file => new Promise<File>((resolve, reject) => {
      const loader = this.rules.find((rule: Rule) => {
        if (file.path.match(rule.test)) {
          return true
        }
      }).loader

      file.status = LoadingStatus.PENDING;
      file.computePath();

      if (this.files.get(file.computedPath)) {
        resolve(file);
        return;
      }

      loader.load(file).then(object => {
        this.files.set(file.computedPath, file);
        file.subject = object;
        file.status = LoadingStatus.LOADED
        file.handleEventsIfLoaded()
        resolve(file.subject);
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