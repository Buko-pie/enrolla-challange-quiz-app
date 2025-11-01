import  { configureStore } from "@reduxjs/toolkit";
import {
	useDispatch as useAppDispatch,
	useSelector as useAppSelector,
} from "react-redux";
import { persistStore } from "redux-persist";
import quizReducer from "./slices/quiz";

const store = configureStore({
	reducer: {
		quiz: quizReducer,
	},
	middleware: (getDefaultMiddleware) => getDefaultMiddleware({
		serializableCheck: false,
		immutableCheck: false,
	}),
});

const persistor = persistStore(store);
const { dispatch, getState } = store;
const useDispatch = () => useAppDispatch<typeof dispatch>();
const useSelector = useAppSelector;

export { store, persistor, dispatch, useDispatch, getState, useSelector };
export default store;

export interface RootState {
	quiz: ReturnType<typeof quizReducer>;
}
