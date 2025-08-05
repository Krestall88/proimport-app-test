import { Dispatch, SetStateAction } from 'react';

export function useDebounce<T>(value: T, delay: number): T;
