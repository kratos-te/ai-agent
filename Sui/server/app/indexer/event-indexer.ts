import { EventId, SuiClient, SuiEvent, SuiEventFilter } from '@mysten/sui/client';

import { CONFIG } from '../constants';
import { getClient } from '../utils/sui-utils';
import { handleEventObjects } from './event-handler';
import DbCursor from '../db/dbCursor';

type SuiEventsCursor = EventId | null | undefined;

type EventExecutionResult = {
	cursor: SuiEventsCursor;
	hasNextPage: boolean;
};

type EventTracker = {
	// The module that defines the type, with format `package::module`
	type: string;
	filter: SuiEventFilter;
	callback: (events: SuiEvent[], type: string) => any;
};

const EVENTS_TO_TRACK: EventTracker[] = [
	{
		type: `${CONFIG.AI_AGENT_CONTRACT}::ai_agent`,
		filter: {
			MoveEventModule: {
				module: 'ai_agent',
				package: CONFIG.AI_AGENT_CONTRACT,
			},
		},
		callback: handleEventObjects,
	},
];

const executeEventJob = async (
	client: SuiClient,
	tracker: EventTracker,
	cursor: SuiEventsCursor,
): Promise<EventExecutionResult> => {
	try {
		// get the events from the chain.
		// For this implementation, we are going from start to finish.
		// This will also allow filling in a database from scratch!
		const { data, hasNextPage, nextCursor } = await client.queryEvents({
			query: tracker.filter,
			cursor,
			order: 'ascending',
		});

		// handle the data transformations defined for each event
		await tracker.callback(data, tracker.type);

		// We only update the cursor if we fetched extra data (which means there was a change).
		if (nextCursor && data.length > 0) {
			await saveLatestCursor(tracker, nextCursor);

			return {
				cursor: nextCursor,
				hasNextPage,
			};
		}
	} catch (e) {
		console.error(e);
	}
	// By default, we return the same cursor as passed in.
	return {
		cursor,
		hasNextPage: false,
	};
};

const runEventJob = async (client: SuiClient, tracker: EventTracker, cursor: SuiEventsCursor) => {
	const result = await executeEventJob(client, tracker, cursor);

	// Trigger a timeout. Depending on the result, we either wait 0ms or the polling interval.
	setTimeout(
		() => {
			runEventJob(client, tracker, result.cursor);
		},
		result.hasNextPage ? 0 : CONFIG.POLLING_INTERVAL_MS,
	);
};

/**
 * Gets the latest cursor for an event tracker, either from the DB (if it's undefined)
 *  or from the running cursors.
 */
const getLatestCursor = async (tracker: EventTracker) => {
	return DbCursor.getCursor();
};

/**
 * Saves the latest cursor for an event tracker to the db, so we can resume
 * from there.
 * */
const saveLatestCursor = async (tracker: EventTracker, cursor: EventId) => {
	DbCursor.writeCursor(cursor);
};

/// Sets up all the listeners for the events we want to track.
/// They are polling the RPC endpoint every second.
export const setupListeners = async () => {
	for (const event of EVENTS_TO_TRACK) {
		runEventJob(getClient(CONFIG.NETWORK), event, await getLatestCursor(event));
	}
};
