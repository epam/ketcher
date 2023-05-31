import { Bond } from 'domain/entities'

export type BondAtoms = Pick<Bond, 'begin' | 'end'>
