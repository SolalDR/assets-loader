import Emitter from './utils/Emitter'

export class Loader extends Emitter {
  load(_: string): Promise<unknown> {
    console.error('Loader need to implement the load function');
    return new Promise((resolve, reject) => {
      reject()
    })
  }
}