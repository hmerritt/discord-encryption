/**
 * Persist state middleware.
 *
 * Inspired by Zustand's persist middleware:
 * https://github.com/pmndrs/zustand/blob/main/src/middleware/persist.ts
 */
import { Store, StoreOptions } from "@tanstack/store";

import { run, runSync } from "../lib/helpers";
import { createBackgroundScheduler } from "../lib/scheduler";

export interface StateStorage<R = unknown> {
	getItem: (name: string) => string | null | Promise<string | null>;
	setItem: (name: string, value: string) => R;
	removeItem: (name: string) => R;
}

export type StorageValue<S> = {
	state: S;
	version?: number;
};

export interface PersistStorage<S, R = unknown> {
	getItem: (name: string) => StorageValue<S> | null | Promise<StorageValue<S> | null>;
	setItem: (name: string, value: StorageValue<S>) => R;
	removeItem: (name: string) => R;
}

export interface PersistOptions<S, PersistedState = S, PersistReturn = unknown> {
	/** Name of the storage (must be unique) */
	name: string;
	/**
	 * Use a custom persist storage.
	 *
	 * Combining `createJSONStorage` helps creating a persist storage
	 * with JSON.parse and JSON.stringify.
	 *
	 * @default createJSONStorage(() => localStorage)
	 */
	storage?: PersistStorage<PersistedState, PersistReturn> | undefined;
	/**
	 * Filter the persisted value.
	 *
	 * @params state The state's value
	 */
	partialize?: (state: S) => PersistedState;
	/**
	 * A function returning another (optional) function.
	 * The main function will be called before the state rehydration.
	 * The returned function will be called after the state rehydration or when an error occurred.
	 */
	onRehydrateStorage?: (state: S) => ((state?: S, error?: unknown) => void) | void;
	/**
	 * If the stored state's version mismatch the one specified here, the storage will not be used.
	 * This is useful when adding a breaking change to your store.
	 */
	version?: number;
	/**
	 * A function to perform persisted state migration.
	 * This function will be called when persisted state versions mismatch with the one specified here.
	 */
	migrate?: (
		persistedState: unknown,
		version: number
	) => PersistedState | Promise<PersistedState>;
	/**
	 * A function to perform custom hydration merges when combining the stored state with the current one.
	 * By default, this function does a shallow merge.
	 */
	merge?: (persistedState: unknown, currentState: S) => S;
	/**
	 * An optional boolean that will prevent the persist middleware from triggering hydration on initialization,
	 * This allows you to call `rehydrate()` at a specific point in your apps rendering life-cycle.
	 *
	 * This is useful in SSR application.
	 *
	 * @default false
	 */
	skipHydration?: boolean;
}

export type PersistListener<S> = (state: S) => void;

export type JsonStorageOptions = {
	reviver?: (key: string, value: unknown) => unknown;
	replacer?: (key: string, value: unknown) => unknown;
};

export function createJSONStorage<S, R = unknown>(
	getStorage: () => StateStorage<R>,
	options?: JsonStorageOptions
): PersistStorage<S, unknown> | undefined {
	const [storage, error] = runSync(() => getStorage());
	if (error || !storage) return;

	const persistStorage: PersistStorage<S, R> = {
		getItem: (name) => {
			const parse = (str: string | null) => {
				if (str === null) {
					return null;
				}
				return JSON.parse(str, options?.reviver) as StorageValue<S>;
			};
			const str = storage.getItem(name) ?? null;
			if (str instanceof Promise) {
				return str.then(parse);
			}
			return parse(str);
		},
		setItem: (name, newValue) =>
			storage.setItem(name, JSON.stringify(newValue, options?.replacer)),
		removeItem: (name) => storage.removeItem(name)
	};

	return persistStorage;
}

export class StoreWithPersist<TState> extends Store<TState> {
	private hasHydrated: boolean;
	private hydrationListeners: Set<PersistListener<TState>>;
	private finishHydrationListeners: Set<PersistListener<TState>>;
	public persist: {
		name: string;
		options: PersistOptions<TState>;
		clearStorage: () => void;
		rehydrate?: () => Promise<void>;
		hasHydrated?: () => boolean;
		onHydrate?: (callback: () => void) => () => void;
		onFinishHydration?: (callback: () => void) => () => void;
	};

	constructor(
		initialState: TState,
		storeOptions: StoreOptions<TState>,
		persistOptions: PersistOptions<TState>
	) {
		super(initialState, storeOptions);

		this.hasHydrated = false;
		this.hydrationListeners = new Set<PersistListener<TState>>();
		this.finishHydrationListeners = new Set<PersistListener<TState>>();

		// Persist options
		const options = {
			storage: createJSONStorage<TState, void>(() => localStorage),
			partialize: (state: TState) => state,
			version: 0,
			merge: (persistedState: unknown, currentState: TState) => ({
				...currentState,
				...(persistedState as object)
			}),
			...persistOptions
		};

		if (!options.storage) {
			logn.error(
				"persist",
				`Unable to update item '${options.name}', the given storage is currently unavailable.`
			);
		}

		this.persist = {
			name: options.name,
			options: options,
			clearStorage: () => {
				options.storage?.removeItem(this.persist.name);
			},
			rehydrate: () => {
				return this.hydrate();
			},
			hasHydrated: () => {
				return this.hasHydrated;
			},
			onHydrate: (cb) => {
				this.hydrationListeners.add(cb);
				return () => this.hydrationListeners.delete(cb);
			},
			onFinishHydration: (cb) => {
				this.finishHydrationListeners.add(cb);
				return () => this.finishHydrationListeners.delete(cb);
			}
		};

		// Hydrate on load
		if (!options.skipHydration) {
			this.hydrate();
		}

		// Update storage when state changes
		this.subscribe(() => {
			this.persistState();
		});
	}

	private persistState = createBackgroundScheduler(() => {
		this.persist.options.storage?.setItem(this.persist.name, {
			state: this.state,
			version: this.persist.options.version
		});
	}, 500);

	private async hydrate() {
		const { name, storage, migrate, merge, onRehydrateStorage, version } =
			this.persist.options;
		if (!storage) return;

		this.hasHydrated = false;
		this.hydrationListeners.forEach((cb) => cb(this.state));
		const postRehydrationCallback = onRehydrateStorage?.(this.state) || undefined;

		// Get item from storage
		const [deserializedStorageValue, getError] = await run(async () =>
			storage.getItem(name)
		);
		if (getError) {
			postRehydrationCallback?.(undefined, getError);
			return;
		}

		// Determine state and migration needs
		let migratedState: TState | undefined = undefined;
		let stateFromStorage: TState = this.state;
		let isMigrated = false;

		if (deserializedStorageValue) {
			// Check for version mismatch
			if (
				typeof deserializedStorageValue.version === "number" &&
				deserializedStorageValue.version !== version
			) {
				if (migrate) {
					// Execute migration (handles both sync and async returns via Promise.resolve)
					const [migrationResult, migrationError] = await run(async () =>
						migrate(
							deserializedStorageValue.state,
							deserializedStorageValue.version ?? 0
						)
					);

					if (migrationError) {
						postRehydrationCallback?.(undefined, migrationError);
						return;
					}

					migratedState = migrationResult;
					isMigrated = true;
				} else {
					logn.error(
						"persist",
						`State loaded from storage couldn't be migrated since no migrate function was provided`
					);
				}
			} else {
				migratedState = deserializedStorageValue.state;
			}
		}

		// Merge and Set State
		// Only proceed if we have a valid state to merge (migrated or original)
		if (migratedState !== undefined || isMigrated) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			stateFromStorage = merge!(migratedState, this.state);

			// Update state
			this.setState(stateFromStorage);

			if (isMigrated) {
				// We do not need the result of setItem, but we should catch errors if it fails
				const [, setError] = await run(async () =>
					storage.setItem(name, {
						state: stateFromStorage,
						version: version
					})
				);

				if (setError && postRehydrationCallback) {
					postRehydrationCallback?.(undefined, setError);
					return;
				}
			}
		}

		this.hasHydrated = true;
		postRehydrationCallback?.(this.state, undefined);
		this.finishHydrationListeners.forEach((cb) => cb(this.state));
	}
}
