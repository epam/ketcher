import { useDispatch, useSelector } from 'react-redux';
import type { AnyAction, Dispatch } from 'redux';
import type { StoreState } from './store.types';

export const useAppDispatch = useDispatch.withTypes<Dispatch<AnyAction>>();
export const useAppSelector = useSelector.withTypes<StoreState>();
