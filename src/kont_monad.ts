export type Kont<A, R> = (x: A) => R;
export type List<B> = (x: B) => B;

export type InterpKont<B> = Kont<number, List<B>>;

export type KontM<A, R> = (k: Kont<A, R>) => R;

export type InterpKontM<B> = KontM<number, List<B>>;

interface KontMonad<B> {
  unit: (x: number) => InterpKontM<B>;
  map: <C>(f: (a: number) => C) => (m: InterpKontM<B>) => KontM<C, List<number>>;
  join: (m: KontM<InterpKontM<B>, List<B>>) => InterpKontM<B>;
}

export const kontMonad: KontMonad<number> = {
  unit: (x: number) => (k: InterpKont<number>) => k(x),
  map: <C>(f: (a: number) => C) => (m: InterpKontM<number>) => {
    return (k: Kont<C, List<number>>) => {
      return m((x: number) => k(f(x)));
    }
  },
  join: (m: KontM<InterpKontM<number>, List<number>>) => {
    return (k: InterpKont<number>) => {
      return m((x: InterpKontM<number>) => x(k));
    }
  }
}

interface KontMonadSeq<B> {
  empty: () => (k: InterpKont<B>) => List<B>;
  ifEmpty: (xs: InterpKontM<B>) => (ys: InterpKontM<B>) => (zs: InterpKontM<B>) => InterpKontM<B>;
  append: (xs: InterpKontM<B>) => (ys: InterpKontM<B>) => InterpKontM<B>;
}

'(xs: InterpKontM<number>) => (ys: InterpKontM<number>) => (zs: InterpKontM<number>) => (k: InterpKont<number>) => (l: List<number>) => number'
'(xs: KontM<number, List<number>>) => (ys: KontM<number, List<number>>) => (zs: KontM<number, List<number>>) => KontM<number, List<number>>'

'(YES) => (YES) => (YES) => 

Call signature return types '(ys: KontM<number, List<number>>) => (zs: KontM<number, List<number>>) => (k: Kont<number, List<number>>) => (l: List<number>) => number' and '(ys: KontM<number, List<number>>) => (zs: KontM<number, List<number>>) => KontM<number, List<number>>' are incompatible. Call signature return types '(zs: KontM<number, List<number>>) => (k: Kont<number, List<number>>) => (l: List<number>) => number' and '(zs: KontM<number, List<number>>) => KontM<number, List<number>>' are incompatible. Call signature return types '(k: Kont<number, List<number>>) => (l: List<number>) => number' and 'KontM<number, List<number>>' are incompatible. Type '(l: List<n

export const kontMonadSeq: KontMonadSeq<number> = {
  empty: () => (k: InterpKont<number>) => (l: number) => l,
  ifEmpty: (xs: InterpKontM<number>) => (ys: InterpKontM<number>) => (zs: InterpKontM<number>) => {
    return (k: InterpKont<number>) => {
      return (l: List<number>) => {
        return xs((_: number) => (_: List<number>) => ys(k)(l))(zs(k)(l));
      }
    }

  }
}

// export const kontMonad: KontMonad<number, number> = {
//   empty: () => (k: Kont<number, ResFunc<number>>) => (l: number) => l,
//   unit: (x: number) => (k: Kont<number, number>) => k(x),
//   map: <B>(f: (a: number) => B) => (m: KontM<number, number>) => {
//     return (k: Kont<B, number>) => {
//       return m((x: number) => k(f(x)));
//     }
//   },
//   join: (m: KontM<KontM<number, number>, number>) => {
//     return (k: Kont<number, number>) => {
//       return m((x: KontM<number, number>) => x(k));
//     }
//   }
  
//   ifEmpty: (xs: KontM<number, number>) => (ys: KontM<number, number>) => (zs: KontM<number, number>) => {

//   }


//   ifEmpty: (xs: KontM<N, N>) => (ys: KontM<N, N>) => (zs: KontM<N, N>) => {
//     return (k: Kont<N, N>) => (l: N) => {
//       return xs((_: any) => (_: any) => ys(k)(l))(zs(k)(l));
//     }
//   },
//   append: (xs: KontM<N, N>) => (ys: KontM<N, N>) => {
//     return (k: Kont<N, N>) => xs(k) // uhhhhhhh?????
//   },
// }
