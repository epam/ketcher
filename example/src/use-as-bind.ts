import { useEffect, useState } from "react";
import { AsBind } from "as-bind";


export interface UseAsBindOptions {
    imports: { [key: string]: any };
}

const DEFAULT_OPTIONS = {
    imports: {},
};

export const fetchWasm = async (
    path: string,
    abortSignal: AbortSignal
): Promise<Response> => {
    const response = await globalThis.fetch(path, { signal: abortSignal });
    if (!response.ok) {
        throw new Error(`Failed to fetch resource ${path}.`);
    }
    console.log("ok")
    return response;
};

export const useAsBind = (
    source:
        | string
        | WebAssembly.Module
        | BufferSource
        | Response
        | PromiseLike<WebAssembly.Module>,
    options: UseAsBindOptions = DEFAULT_OPTIONS
): any => {
    const [state, setState] = useState({
        loaded: false,
        error: null,
        instance: null,
    });
    useEffect(() => {
        const abortController = new AbortController();
        const bindWasm = async () => {
            try {
                const resolvedSource = await (typeof source === "string"
                    ? fetchWasm(source, abortController.signal)
                    : source);
                const instance = await AsBind.instantiate(
                    resolvedSource,
                    options.imports
                );
                if (!abortController.signal.aborted) {
                    setState({ loaded: true, instance, error: null });
                }
            } catch (e: any) {
                if (!abortController.signal.aborted) {
                    setState({ ...state, error: e });
                }
            }
        };
        bindWasm();
        return function cleanup() {
            abortController.abort();
        };
    }, [source, options]);
    return state;
};

export const createAsBindHook = (
    source:
        | string
        | WebAssembly.Module
        | BufferSource
        | Response
        | PromiseLike<WebAssembly.Module>,
    options: UseAsBindOptions = DEFAULT_OPTIONS
) => () => useAsBind(source, options);