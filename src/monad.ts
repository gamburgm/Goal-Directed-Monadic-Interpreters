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

let x = [4, 5];

let y = (_: any) => {
  return [
    4,
    (_: any) => {
      return [
        5,
        (_: any) => {
          return [];
        }
      ];
    }
  ];
}

export type DelayedVal<T> = [T, Delay<T>] | [];
export type Delay<T> = (_: any) => DelayedVal<T>;

export type EmptyDelay = (_: any) => [];

export const emptyDelay: EmptyDelay = (_: any) => [];

interface DelayMonad<T> extends Monad<T> {
  empty: () => EmptyDelay;
  unit: (x: T) => Delay<T>;
  map: <B>(f: (a: T) => B) => (m: Delay<T>) => Delay<B>;
  join: (m: Delay<Delay<T>>) => Delay<T>;
  ifEmpty: (xs: Delay<T>) => (ys: Delay<T>) => (zs: Delay<T>) => Delay<T>;
  append: (xs: Delay<T>) => (ys: Delay<T>) => Delay<T>;
}

export function resolve<T>(v: Delay<T>): Array<T> {
  let res: DelayedVal<T> = v(1);
  if (res.length === 0) {
    return [];
  } else {
    return [res[0]].concat(resolve(res[1]));
  }
}

export const delayMonad: DelayMonad<number> = {
  empty: () => emptyDelay,
  unit: (x: number) => (_: any) => [x, emptyDelay],
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
    let started = false;
    let outerRecur = m;
    let outerRes, innerRecur, innerRes, elem;

    let iterateOuter = () => {
      outerRes = outerRecur(1);
      if (outerRes.length === 0) return false;
      [innerRecur, outerRecur] = outerRes;
      innerRes = innerRecur(1);
      return true;
    }

    let resolve = (_: any) => {
      if (!started) {
        do {
          if (!iterateOuter()) return outerRes;
        } while (innerRes.length === 0);
        started = true;
      } else {
        innerRes = innerRecur(1);
        if (innerRes.length === 0) {
          do {
            if (!iterateOuter()) return outerRes;
          } while (innerRes.length === 0);
        }
      }

      [elem, innerRecur] = innerRes;
      return [elem, resolve];
    };

    return resolve;
  },

  ifEmpty: (xs: Delay<number>) => (ys: Delay<number>) => (zs: Delay<number>): Delay<number> => {
    let resolve = (_: any) => {
      let res: DelayedVal<number> = xs(1);
      if (res.length === 0) {
        return ys(1);
      } else {
        return zs(1);
      }
    };
    return resolve;
  },

  append: (xs: Delay<number>) => (ys: Delay<number>): Delay<number> => {
    let recur = xs;

    let resolve = (_: any) => {
      let val;
      let res = recur(1);
      if (res.length === 0) {
        return ys(1);
      }

      [val, recur] = res;
      return [val, resolve];
    };

    return resolve as Delay<number>;
  }
}

export type Kont<T> = (x: T) => T;

interface KontMonad<T> extends Monad<T> {
}

interface DelayMonad<T> extends Monad<T> {
  empty: () => EmptyDelay;
  unit: (x: T) => Delay<T>;
  map: <B>(f: (a: T) => B) => (m: Delay<T>) => Delay<B>;
  join: (m: Delay<Delay<T>>) => Delay<T>;
  ifEmpty: (xs: Delay<T>) => (ys: Delay<T>) => (zs: Delay<T>) => Delay<T>;
  append: (xs: Delay<T>) => (ys: Delay<T>) => Delay<T>;
}
