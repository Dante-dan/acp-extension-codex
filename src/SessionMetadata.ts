import type {ModeKind} from "./app-server/ModeKind";
import type {Model, Thread, ThreadItemEntry} from "./app-server/v2";

export type SessionMetadata = {
    sessionId: string,
    currentModelId: string,
    models: Model[],
    collaborationMode: ModeKind,
    modelProvider?: string | null,
    currentServiceTier?: string | null,
    additionalDirectories: string[],
}

export type SessionMetadataWithThread = SessionMetadata & {
    /** The thread metadata. Its `turns` are empty: the items are in `history`. */
    thread: Thread,
    /** The items of the thread with their turns, oldest first, one page at a time. */
    history: AsyncIterable<ThreadItemEntry[]>,
}
