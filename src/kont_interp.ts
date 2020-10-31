import { Program, Int, To, Add, LT, If } from './types';
import { appendHLists, List, NKont, NKMonad, kontMonad as mops, kontMonadSeq as mseqs } from './kont_monad';

export function interpret(prog: Program) {
  if (prog.kind === 'Int') {
    return mops.unit(prog.val);
  } else if (prog.kind === 'To') {
    return (k: NKont) => {
      return interpret(prog.from)((i: number) => interpret(prog.to)((j: number) => to(i)(j)(k)));
    }
  } else if (prog.kind === 'Add') {
    return (k: NKont) => {
      return interpret(prog.first)((i: number) => interpret(prog.second)((j: number) => k(i + j)));
    }
  } else if (prog.kind === 'LT') {
    return (k: NKont) => {
      return interpret(prog.lte)((i: number) => interpret(prog.gte)((j: number) => leq(i)(j)(k)));
    }
  } else if (prog.kind === 'If') {
    return (k: NKont) => {
      return (l: List<number>) => {
        return interpret(prog.cond)((_: NKont) => (_: List<number>) => interpret(prog.yes)(k)(l))(interpret(prog.no)(k)(l));
      }
    }
  }
}

// could probably create a type for this...
// the type is number => number => Kont => HughesList,
// which is equivalent to number => number => monad.
const to = (i: number) => (j: number) => (k: NKont) => {
  if (i > j) {
    return (l: List<number>) => l;
  } else {
    return appendHLists(k(i), to(i + 1)(j)(k));
  }
}

// the signature information for this function
// is the same as `to`
const leq = (i: number) => (j: number) => (k: NKont) => {
  if (i <= j) {
    return k(j);
  } else {
    return (l: List<number>) => l;
  }
}

console.log((interpret({
  kind: 'LT',
  lte: {
    kind: 'To',
    from: {
      kind: 'Int',
      val: 5,
    },
    to: {
      kind: 'Int',
      val: 10,
    },
  },
  gte: {
    kind: 'To',
    from: {
      kind: 'Int',
      val: 5,
    },
    to: {
      kind: 'Int',
      val: 10,
    },
  },
})((x: number) => (ys: List<number>) => [x].concat(ys)))([]));

