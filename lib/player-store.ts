import { create } from "zustand";

export type Track = {
  id: string;
  title: string;
  artist: string;
  album: string;
  src: string;
  cover: string;
};

export type RepeatMode = "off" | "all" | "one";

type PlayerState = {
  tracks: Track[];

  currentTrack: Track | null;

  queue: Track[];
  queueIndex: number;

  history: Track[];
  historyIndex: number;

  isPlaying: boolean;

  volume: number;
  currentTime: number;
  duration: number;

  shuffle: boolean;
  repeat: RepeatMode;

  setTracks: (tracks: Track[]) => void;

  playTrack: (track: Track) => void;
  playQueueTrack: (index: number) => void;
  togglePlay: () => void;

  nextTrack: () => void;
  previousTrack: () => void;

  removeFromQueue: (trackId: string) => void;
  reorderQueue: (
    fromIndex: number,
    toIndex: number
  ) => void;
  clearQueue: () => void;

  seek: (time: number) => void;

  setVolume: (volume: number) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;

  toggleShuffle: () => void;
  toggleRepeat: () => void;
};

export const usePlayerStore = create<PlayerState>(
  (set, get) => ({
    tracks: [],
    currentTrack: null,

    queue: [],
    queueIndex: -1,

    history: [],
    historyIndex: -1,

    isPlaying: false,

    volume: 1,
    currentTime: 0,
    duration: 0,

    shuffle: false,
    repeat: "off",

    setTracks: (newTracks) => {
      set((state) => ({
        tracks: newTracks,
        queue:
          state.queue.length > 0
            ? state.queue
            : newTracks,
      }));
    },

    playTrack: (track) => {
      const state = get();

      const index = state.tracks.findIndex(
        (item) => item.id === track.id
      );

      set({
        currentTrack: track,

        queue:
          state.tracks.length > 0
            ? state.tracks
            : [track],

        queueIndex:
          index >= 0 ? index : 0,

        history: [track],
        historyIndex: 0,

        currentTime: 0,
        duration: 0,
        isPlaying: true,
      });
    },

    playQueueTrack: (index) => {
      const state = get();

      if (
        index < 0 ||
        index >= state.queue.length
      ) {
        return;
      }

      const track = state.queue[index];

      const newHistory = [
        ...state.history.slice(
          0,
          state.historyIndex + 1
        ),
        track,
      ];

      set({
        currentTrack: track,
        queueIndex: index,

        history: newHistory,
        historyIndex:
          newHistory.length - 1,

        currentTime: 0,
        duration: 0,
        isPlaying: true,
      });
    },

    togglePlay: () => {
      if (!get().currentTrack) return;

      set((state) => ({
        isPlaying: !state.isPlaying,
      }));
    },

    nextTrack: () => {
      const state = get();

      if (!state.queue.length) return;

      if (state.repeat === "one") {
        set({
          currentTime: 0,
          isPlaying: true,
        });

        window.dispatchEvent(
          new CustomEvent("noctra-replay")
        );

        return;
      }

      let nextIndex: number;

      if (state.shuffle) {
        if (state.queue.length === 1) {
          nextIndex = 0;
        } else {
          do {
            nextIndex = Math.floor(
              Math.random() *
                state.queue.length
            );
          } while (
            nextIndex ===
            state.queueIndex
          );
        }
      } else {
        nextIndex =
          state.queueIndex + 1;

        if (
          nextIndex >=
          state.queue.length
        ) {
          if (state.repeat === "all") {
            nextIndex = 0;
          } else {
            set({
              isPlaying: false,
            });

            return;
          }
        }
      }

      const nextTrack =
        state.queue[nextIndex];

      const newHistory = [
        ...state.history.slice(
          0,
          state.historyIndex + 1
        ),
        nextTrack,
      ];

      set({
        currentTrack: nextTrack,
        queueIndex: nextIndex,

        history: newHistory,
        historyIndex:
          newHistory.length - 1,

        currentTime: 0,
        duration: 0,
        isPlaying: true,
      });
    },

    previousTrack: () => {
      const state = get();

      if (state.currentTime > 3) {
        set({
          currentTime: 0,
        });

        window.dispatchEvent(
          new CustomEvent("noctra-seek", {
            detail: 0,
          })
        );

        return;
      }

      if (state.historyIndex <= 0) {
        set({
          currentTime: 0,
        });

        window.dispatchEvent(
          new CustomEvent("noctra-seek", {
            detail: 0,
          })
        );

        return;
      }

      const previousHistoryIndex =
        state.historyIndex - 1;

      const previousTrack =
        state.history[
          previousHistoryIndex
        ];

      const queueIndex =
        state.queue.findIndex(
          (track) =>
            track.id ===
            previousTrack.id
        );

      set({
        currentTrack: previousTrack,
        queueIndex,

        historyIndex:
          previousHistoryIndex,

        currentTime: 0,
        duration: 0,
        isPlaying: true,
      });
    },

    removeFromQueue: (trackId) => {
      const state = get();

      const removeIndex =
        state.queue.findIndex(
          (track) =>
            track.id === trackId
        );

      if (removeIndex === -1) {
        return;
      }

      if (
        state.currentTrack?.id ===
        trackId
      ) {
        return;
      }

      const newQueue =
        state.queue.filter(
          (track) =>
            track.id !== trackId
        );

      let newQueueIndex =
        state.queueIndex;

      if (
        removeIndex <
        state.queueIndex
      ) {
        newQueueIndex -= 1;
      }

      set({
        queue: newQueue,
        queueIndex:
          newQueue.length === 0
            ? -1
            : Math.max(
                0,
                newQueueIndex
              ),
      });
    },

    reorderQueue: (
      fromIndex,
      toIndex
    ) => {
      const state = get();

      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >=
          state.queue.length ||
        toIndex >=
          state.queue.length ||
        fromIndex === toIndex
      ) {
        return;
      }

      const newQueue = [
        ...state.queue,
      ];

      const [
        movedTrack,
      ] = newQueue.splice(
        fromIndex,
        1
      );

      newQueue.splice(
        toIndex,
        0,
        movedTrack
      );

      let newQueueIndex =
        state.queueIndex;

      if (
        state.queueIndex ===
        fromIndex
      ) {
        newQueueIndex = toIndex;
      } else if (
        fromIndex <
          state.queueIndex &&
        toIndex >=
          state.queueIndex
      ) {
        newQueueIndex -= 1;
      } else if (
        fromIndex >
          state.queueIndex &&
        toIndex <=
          state.queueIndex
      ) {
        newQueueIndex += 1;
      }

      set({
        queue: newQueue,
        queueIndex:
          newQueueIndex,
      });
    },

    clearQueue: () => {
      const state = get();

      if (!state.currentTrack) {
        set({
          queue: [],
          queueIndex: -1,
        });

        return;
      }

      set({
        queue: [state.currentTrack],
        queueIndex: 0,
      });
    },

    seek: (time) => {
      set({
        currentTime: time,
      });

      window.dispatchEvent(
        new CustomEvent("noctra-seek", {
          detail: time,
        })
      );
    },

    setVolume: (volume) => {
      set({
        volume: Math.max(
          0,
          Math.min(1, volume)
        ),
      });
    },

    setCurrentTime: (time) => {
      set({
        currentTime: time,
      });
    },

    setDuration: (duration) => {
      set({
        duration,
      });
    },

    toggleShuffle: () => {
      set((state) => ({
        shuffle: !state.shuffle,
      }));
    },

    toggleRepeat: () => {
      set((state) => {
        if (state.repeat === "off") {
          return {
            repeat: "all",
          };
        }

        if (state.repeat === "all") {
          return {
            repeat: "one",
          };
        }

        return {
          repeat: "off",
        };
      });
    },
  })
);