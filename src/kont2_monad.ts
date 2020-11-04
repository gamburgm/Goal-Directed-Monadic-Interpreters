import { List, Kont, Monad } from './kont_monad';

export type Stream<T>       = () => (List<T> | Stream<T>);
export type NStream         = Stream<number>;
export type HughesStream<T> = (ys: Stream<T>) => (List<T> | Stream<T>);
export type HSKont<A>       = Kont<A, HughesStream<A>>;
export type K2Monad<A>      = (k: HSKont<A>) => ReturnType<HSKont<A>>;
export type N2Kont          = HSKont<number>;
export type NK2Monad        = K2Monad<number>;

interface Kont2MonadSeq<B> {
  empty: (k: N2Kont) => HughesStream<B>;
  ifEmpty: (xs: NK2Monad) => (ys: NK2Monad) => (zs: NK2Monad) => NK2Monad;
  append: (xs: NK2Monad) => (ys: NK2Monad) => NK2Monad;
}

export const kont2MonadSeq: Kont2MonadSeq<number> = {
  empty: (k: N2Kont) => (f: Stream<number>) => f(),
  ifEmpty: (xs: NK2Monad) => (ys: NK2Monad) => (zs: NK2Monad) => {
    return (k: N2Kont) => {
      return (f: Stream<number>) => {
        return xs((_: number) => (_: Stream<number>) => zs(k)(f))(() => zs(k)(f));
      }
    }
  },
  append: (xs: NK2Monad) => (ys: NK2Monad) => {
    return (k: N2Kont) => {
      return (f: Stream<number>) => {
        return xs(k)(() => ys(k)(f));
      }
    }
  }
}
