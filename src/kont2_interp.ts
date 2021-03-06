import { Program, Int, To, Add, LT, If } from './types';
import { List, kontMonad as mops } from './kont_monad';
import { NStream, N2Kont, kont2MonadSeq as mseqs } from './kont2_monad';

export function interpret(prog: Program) {
  if (prog.kind === 'Int') {
    return mops.unit(prog.val);
  } else if (prog.kind === 'To') {
    return (k: N2Kont) => {
      return interpret(prog.from)((i: number) => interpret(prog.to)((j: number) => to(i)(j)(k)));
    }
  } else if (prog.kind === 'Add') {
    return (k: N2Kont) => {
      return interpret(prog.first)((i: number) => interpret(prog.second)((j: number) => k(i + j)));
    }
  } else if (prog.kind === 'LT') {
    return (k: N2Kont) => {
      return interpret(prog.lte)((i: number) => interpret(prog.gte)((j: number) => leq(i)(j)(k)));
    }
  } else if (prog.kind === 'If') {
    return (k: N2Kont) => (f: NStream) => {
      return interpret(prog.cond)((_: any) => (_: any) => interpret(prog.no)(k)(f))(() => interpret(prog.yes)(k)(f));
    }
  }
}

const to = (i: number) => (j: number) => {
  return (k: N2Kont) => {
    return (f: NStream) => {
      if (i > j) {
        return f();
      } else {
        return k(i)(() => to(i + 1)(j)(k)(f));
      }
    }
  }
}

const leq = (i: number) => (j: number) => {
  return (k: N2Kont) => {
    return (f: NStream) => {
      if (i <= j) {
        return k(j)(f);
      } else {
        return f();
      }
    }
  }
}

console.log((interpret({
  kind: 'If',
  cond: { kind: 'To', from: { kind: 'Int', val: 10 }, to: { kind: 'Int', val: 3 } },
  yes: { kind: 'Int', val: 1 },
  no: { kind: 'Int', val: 2 },
})((x: number) => (ys: () => List<number>) => [x].concat(ys())))(() => []));

