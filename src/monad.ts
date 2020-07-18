export interface M<T> {}

interface MUnit<T> {
  (x: T): M<T>;
}

interface MMap<A, B> {
  (f: (a: A) => B): (m: M<A>) => M<B>;
}

interface MJoin<T> {
  (m: M<M<T>>): M<T>;
}

interface MEmpty<T> {
  (): M<T>;
}

interface MIfEmpty<T> {
  (xs: M<T>): (ys: M<T>) => (zs: M<T>) => M<T>;
}

interface MAppend<T> {
  (xs: M<T>): (ys: M<T>) => M<T>;
}

export interface Monad<T> {
  unit: MUnit<T>;
  map:  <B>(f: (a: T) => B) => (m: M<T>) => M<B>;
  join: MJoin<T>;
  empty: MEmpty<T>;
  ifEmpty: MIfEmpty<T>;
  append: MAppend<T>;
}


// The List Monad
export type List<T> = T[]; 

interface ListMonad<T> extends Monad<T> {
  empty: () => List<T>;
  unit: (x: T) => List<T>;
  map:  <B>(f: (a: T) => B) => (m: List<T>) => List<B>;
  join: (m: List<List<T>>) => List<T>;
  ifEmpty: (xs: List<T>) => (ys: List<T>) => (zs: List<T>) => List<T>;
  append: (xs: List<T>) => (ys: List<T>) => List<T>;
}

export const listMonad: ListMonad<number> = {
  empty: () => [],
  unit: (x: number) => [x],
  map:  <B>(f: (a: number) => B) => (m: List<number>) => {
    return m.map((a: number) => f(a))
  },
  join: (m: List<List<number>>): List<number> => {
    return m.reduce((acc: List<number>, val: List<number>) => acc.concat(val));
  },
  ifEmpty: (xs: List<number>) => (ys: List<number>) => (zs: List<number>) => {
    return xs.length === 0 ? ys: zs
  },
  append: (xs: List<number>) => (ys: List<number>) => {
    return xs.concat(ys);
  }
}

export type DelayedVal<T> = [T, Delay<T>] | [];
export type Delay<T> = (_: any) => DelayedVal<T>;

export type EmptyDelay = (_: any) => [];

export const emptyDelay: EmptyDelay = (_: any) => [];

interface DelayMonad<T> extends Monad<T> {
  empty: () => EmptyDelay;
  unit: (x: T) => (_: any) => T;
  map: <B>(f: (a: T) => B) => (m: Delay<T>) => Delay<B>;
  join: (m: Delay<Delay<T>>) => Delay<T>;
  ifEmpty: (xs: Delay<T>) => (ys: Delay<T>) => (zs: Delay<T>) => Delay<T>;
  append: (xs: Delay<T>) => (ys: Delay<T>) => Delay<T>;
}

function resolve<T>(v: Delay<T>): Array<T> {
  if (v.length === 0) {
    return [];
  } else {
    return [v[0]].concat(resolve(v[1](1)));
  }
}

export const delayMonad: DelayMonad<number> = {
  empty: () => emptyDelay,
  unit: (x: number) => (_: any) => x,
  // Is there something wrong with this one?
  map: <B>(f: (a: number) => B) => (m: Delay<number>): Delay<B> => {
    let recur: Delay<number> = m;
    let resolve = (_: any) => {
      let val: number;
      let res: DelayedVal<number> = recur(1);
      if (res.length === 0) return res;
      [val, recur] = res;
      return [f(val), resolve];
    }

    return resolve as Delay<B>;
  },
  join: (m: Delay<Delay<number>>): Delay<number> => {
    const res: DelayedVal<Delay<number>> = m(1);
    if (res.length === 0) return emptyDelay;

    let [innerRecur, outerRecur] = res;
    let innerRes: DelayedVal<number> = innerRecur(1);

    while (innerRes.length === 0) {
      let newRes: DelayedVal<Delay<number>> = outerRecur(1);
      if (newRes.length === 0) return emptyDelay;
      [innerRecur, outerRecur] = newRes;
      innerRes = innerRecur(1);
    }

    let innerVal;
    [innerVal, innerRecur] = innerRes;

    return (_: any) => {
      return [
        innerVal,
        (_: any) => {
          
        }
      ];
    }
  }

}

export type Kont<T> = (x: T) => T;

interface KontMonad<T> extends Monad<T> {
}
