import { useDispatch } from 'react-redux';
import { AnyAction, Dispatch } from 'redux';

export const useAppDispatch = useDispatch.withTypes<Dispatch<AnyAction>>();
