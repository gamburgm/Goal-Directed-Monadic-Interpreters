export interface M<T> {}

interface MUnit<T> {
  (x: T): M<T>;
}

interface MMap<A, B> {
  (f: (a: A) => B, m: M<A>): M<B>;
}

interface MJoin<T> {
  (m: M<M<T>>): M<T>;
}

export interface Monad<T> {
  unit: MUnit<T>;
  map:  <B>(f: (a: T) => B, m: M<T>) => M<B>;
  join: MJoin<T>;
}

// The List Monad
export type List<T> = T[]; 

interface ListMonad<T> extends Monad<T> {
  unit: (x: T) => List<T>;
  map:  <B>(f: (a: T) => B, m: List<T>) => List<B>;
  join: (m: List<List<T>>) => List<T>;
}

export const listMonad: ListMonad<number> = {
  unit: (x: number) => [x],
  map:  <B>(f: (a: number) => B, m: List<number>): List<B> => { return m.map((a: number) => f(a)) },
  join: (m: List<List<number>>): List<number> => {
    return m.reduce((acc: List<number>, val: List<number>) => acc.concat(val));
  },
}
