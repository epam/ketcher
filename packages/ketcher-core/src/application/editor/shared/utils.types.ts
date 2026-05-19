import { Bond } from 'domain/entities/bond';

export type BondAtoms = Pick<Bond, 'begin' | 'end'>;

export type FlipDirection = 'horizontal' | 'vertical';
