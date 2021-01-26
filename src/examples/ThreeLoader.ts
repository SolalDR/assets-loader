import { Loader } from '../Loader'

export interface ThreeObjectLoader {
  load: (url: string, onLoad: Function, onProgress: Function, onError: Function) => void
}

export class ThreeLoader extends Loader {
  private _loader: ThreeObjectLoader;
  constructor(loader: ThreeObjectLoader) {
    super();
    this._loader = loader;
  }

  load(file): Promise<unknown> {
    return new Promise((resolve, reject) => {
      this._loader.load(
        file.computedPath,

        // onLoad
        (event) => {
          file.emit('load', event);
          resolve(event);
        },

        // onProgress
        (progress) => {
          file.emit('progress', progress)
        },

        // onError
        (error) => {
          file.emit('error', error);
          reject(error);
        }
      )
    })
  }
}