import { BDStorage } from "../lib/storage";
import { mutate, mutateLogger } from "./mutate";
import { StoreWithPersist, createJSONStorage } from "./persist";
import { channelStore } from "./slices/channel/channelStore";
import { configStore } from "./slices/config/configStore";

/**
 * Main state store for entire app ⚡.
 *
 * Built from individual slices defined in `state/slices`. A slice is a way of namespacing state within the store.
 * In this context, slices are used only to organize big state objects (they do not limit functionality in any way).
 * An action in any slice can change the state of any other slice. This differs from Redux's `combineReducers`,
 * which can NOT be used to change the state of other reducers.
 *
 * @usage
 * Create a new slice by creating a directory with `[name]Store` and `[name]Actions` files. The store file only
 * contains an object (the initial state) for that slice. The actions contain functions that update the state.
 * Ideally, state updates should only be made from within actions. This ensures state updates are predictable.
 *
 * Slices are then combined into the main store below.
 *
 * @example
 * // Access state anywhere:
 * import { store } from "state";
 * const count = store.state.count.current;
 *
 * @example
 * // Access state within a component:
 * import { useStore } from "lib/hooks";
 * const count = useStore((state) => state.count.current);
 */
export const store = new StoreWithPersist(
	{
		config: configStore,
		channel: channelStore
	},
	{},
	{
		name: "state",
		storage: createJSONStorage(() => new BDStorage(configStore.nameTitle))
	}
);

export default store;
export type RootState = typeof store.state;

/**
 * Update store state.
 *
 * @param mutateFn - mutate current state (`draft`) which will become the the new state. Based on `immer`'s draft syntax - no need to return anything, just mutate the draft object.
 *
 * @example
 * import { updateState } from "state";
 * updateState((draft) => {
 * 	draft.count.current += 1;
 * });
 */
export const updateState = (mutateFn: (draft: RootState) => void) => {
	store.setState((state) => {
		return mutate(state, mutateFn, {
			callbacks: [mutateLogger],
			mutateTitle: `(state)`
		});
	});
};

/**
 * Update a slice of the store.
 *
 * @param slice - name of the slice (top-level object key) to update
 * @param mutateFn - mutate current state (`draft`) which will become the the new state. Based on `immer`'s draft syntax - no need to return anything, just mutate the draft object.
 *
 * @example
 * import { updateSlice } from "state";
 * updateSlice("count", (draftSlice) => {
 * 	draftSlice.current += 1;
 * });
 */
export const updateSlice = <T extends keyof RootState>(
	slice: T,
	mutateFn: (draftSlice: RootState[T]) => void
) => {
	store.setState((state) => {
		return {
			...state,
			[slice]: mutate(state[slice], mutateFn, {
				callbacks: [mutateLogger],
				mutateTitle: `(slice) ${slice}`
			})
		};
	});
};
