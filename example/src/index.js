import { Manager } from '../../src/main'
import { FakeLoader } from './FakeLoader'

const manager = new Manager([
  {
    test: /png/,
    loader: new FakeLoader()
  }
])

console.log(manager)