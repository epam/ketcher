import { useDispatch, useSelector } from 'react-redux';
import { AnyAction, Dispatch } from 'redux';

export const useAppDispatch = useDispatch.withTypes<Dispatch<AnyAction>>();
export const useAppSelector = useSelector.withTypes<any>();
