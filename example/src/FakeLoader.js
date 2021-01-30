import { Loader } from '../../src/Loader'

export class FakeLoader extends Loader {
  load(file) {
    return new Promise((resolve, reject) => {
      const duration = new Math.random() * 1000 + 1000
      setTimeout(() => {
        resolve({ file });
      }, duration)
    })
  }
}
