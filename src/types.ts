export type Program = Int
             | To
             | Add
             | LT
             | If;

export interface Int {
  kind: 'Int',
  val: number,
}

export interface To {
  kind: 'To',
  from: Program,
  to: Program,
}

export interface Add {
  kind: 'Add',
  first: Program,
  second: Program,
}

export interface LT {
  kind: 'LT',
  lte: Program,
  gte: Program,
}

export interface If {
  kind: 'If',
  cond: Program,
  yes: Program,
  no: Program,
}

