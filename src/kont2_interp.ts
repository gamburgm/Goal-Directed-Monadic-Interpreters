import { Program, Int, To, Add, LT, If } from './types';
import { kontMonad as mops } from './kont_monad';
import { NStream, N2Kont, kont2MonadSeq as mseqs } from './kont2_monad';

export function interpret(prog: Program) {
  if (prog.kind === 'Int') {
    return mops.unit(prog.val);
  } else if (prog.kind === 'To') {
    
  } else if (prog.kind === 'Add') {
  } else if (prog.kind === 'LT') {
  } else if (prog.kind === 'If') {
  }
}

const to = (i: number) => (j: number) => {
  return (k: N2Kont) => {
    return (f: NStream) => {
      if (i > j) {
        return f();
      } else {
        k(i)(() => to(i + 1)(j)(k)(f));
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
