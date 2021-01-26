import { Loader } from '../Loader';

export interface Rule {
  test: RegExp,
  loader: Loader
}