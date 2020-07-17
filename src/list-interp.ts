import { M, Monad, listMonad } from './monad';
import { Program, Int, To, Add, LT, If } from './types';

export function interpret(prog: Program, monad: Monad<number>): M<number> {
  if (prog.kind === 'Int') {
    return monad.unit(prog.val); 
  } else if (prog.kind === 'To') {
    return bind2((x) => (y) => MTo(monad)(x)(y), interpret(prog.from, monad), interpret(prog.to, monad), monad);
  } else if (prog.kind === 'Add') {
    return bind2((x) => (y) => monad.unit(x + y), interpret(prog.first, monad), interpret(prog.second, monad), monad);
  } else if (prog.kind === 'LT') {
    return bind2((x) => (y) => MLeq(monad)(x)(y), interpret(prog.lte, monad), interpret(prog.gte, monad), monad);
  } else if (prog.kind === 'If') {
    return monad.ifEmpty(interpret(prog.cond, monad))(interpret(prog.yes, monad))(interpret(prog.no, monad));
  }

  return [];
}

// Monad helpers
function bind2(f: (a: number) => (b: number) => M<number>, ma: M<number>, mb: M<number>, monad: Monad<number>): M<number> {
  return monad.join(
    monad.map((x) => {
      return monad.join(monad.map(f(x))(mb));
    })(ma));
}

let MLeq = (monad: Monad<number>) => {
  return (i: number) => {
    return (j: number) => {
      if (i <= j) return monad.unit(j);
      else        return monad.empty();
    };
  };
};

let MTo = (monad: Monad<number>) => {
  return (i: number) => {
    return (j: number) => {
      if (i > j) return monad.empty();
      else return monad.append(monad.unit(i))(MTo(monad)(i + 1)(j));
    };
  };
};

console.log(interpret({
  kind: 'If',
  cond: {
    kind: 'LT',
    lte: {
      kind: 'Int',
      val: 10,
    },
    gte: {
      kind: 'Int',
      val: 0,
    },
  },
  yes: {
    kind: 'Int',
    val: 1,
  },
  no: {
    kind: 'Int',
    val: 2,
  },
}, listMonad));
