import { useDispatch, useSelector } from 'react-redux';
import { AnyAction, Dispatch } from 'redux';

export const useAppDispatch = useDispatch.withTypes<Dispatch<AnyAction>>();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useAppSelector = useSelector.withTypes<any>();
