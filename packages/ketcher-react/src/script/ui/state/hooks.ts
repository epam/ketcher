import { useDispatch } from 'react-redux';
import type { AnyAction, Dispatch } from 'redux';

export const useAppDispatch = useDispatch.withTypes<Dispatch<AnyAction>>();
