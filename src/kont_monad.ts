export type Kont<A, R>    = (x: A) => R;
export type List<B>       = B[];
export type HughesList<B> = (ys: B[]) => B[];
export type Selector<B>   = (x: B) => HughesList<B>;
export type ChurchList<B> = (sc: Selector<B>) => HughesList<B>;

export type HLKont<A> = Kont<A, HughesList<A>>;

export type NKont = HLKont<number>;

export type Monad<A, R> = (k: Kont<A, R>) => R;

export type KMonad<A> = (k: HLKont<A>) => ReturnType<HLKont<A>>;

export type NKMonad = KMonad<number>;

interface KontMonadOps {
  unit: (x: number) => NKMonad;
  map: <C>(f: (a: number) => C) => (m: NKMonad) => Monad<C, HughesList<number>>;
  join: (m: Monad<NKMonad, HughesList<number>>) => NKMonad;
}

export const kontMonad: KontMonadOps = {
  unit: (x: number) => (k: NKont) => k(x),
  map: <C>(f: (a: number) => C) => (m: NKMonad) => {
    return (k: Kont<C, HughesList<number>>) => {
      return m((x: number) => k(f(x)));
    }
  },
  join: (m: Monad<NKMonad, HughesList<number>>) => {
    return (k: NKont) => {
      return m((x: NKMonad) => x(k));
    }
  }
}

interface KontMonadSeq<B> {
  empty: (k: NKont) => HughesList<B>;
  ifEmpty: (xs: NKMonad) => (ys: NKMonad) => (zs: NKMonad) => NKMonad;
  append: (xs: NKMonad) => (ys: NKMonad) => NKMonad;
}

export const kontMonadSeq: KontMonadSeq<number> = {
  empty: (k: NKont) => (l: List<number>) => l,
  ifEmpty: (xs: NKMonad) => (ys: NKMonad) => (zs: NKMonad) => {
    return (k: NKont) => {
      return (l: List<number>) => {
        return xs((_: number) => (_: List<number>) => zs(k)(l))(ys(k)(l));
      }
    }
  },
  append: (xs: NKMonad) => (ys: NKMonad) => {
    return (k: NKont) => {
      return appendHLists(xs(k), ys(k));
    }
  }
}

export function appendHLists<T>(h1: HughesList<T>, h2: HughesList<T>) {
  return (l: List<T>) => {
    return h1(l).concat(h2(l));
  }
}
