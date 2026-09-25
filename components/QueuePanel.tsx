"use client";

import {
    GripVertical,
    MoreHorizontal,
    Play,
    Trash2,
    X,
} from "lucide-react";

import { useState } from "react";

import {
    Track,
    usePlayerStore,
} from "@/lib/player-store";

type QueuePanelProps = {
  onClose: () => void;
};

export default function QueuePanel({
  onClose,
}: QueuePanelProps) {
  const [draggedIndex, setDraggedIndex] =
    useState<number | null>(null);

  const currentTrack =
    usePlayerStore(
      (state) => state.currentTrack
    );

  const queue = usePlayerStore(
    (state) => state.queue
  );

  const queueIndex = usePlayerStore(
    (state) => state.queueIndex
  );

  const playQueueTrack =
    usePlayerStore(
      (state) => state.playQueueTrack
    );

  const removeFromQueue =
    usePlayerStore(
      (state) => state.removeFromQueue
    );

  const reorderQueue =
    usePlayerStore(
      (state) => state.reorderQueue
    );

  const clearQueue =
    usePlayerStore(
      (state) => state.clearQueue
    );

  const upcoming = queue.filter(
    (_, index) =>
      index !== queueIndex
  );

  const handleDrop = (
    targetIndex: number
  ) => {
    if (
      draggedIndex === null ||
      draggedIndex === targetIndex
    ) {
      setDraggedIndex(null);
      return;
    }

    reorderQueue(
      draggedIndex,
      targetIndex
    );

    setDraggedIndex(null);
  };

  return (
    <div className="fixed bottom-24 right-5 z-[90] flex h-[min(620px,calc(100vh-120px))] w-[380px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#151517]/98 shadow-2xl shadow-black/50 backdrop-blur-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold">
            Queue
          </h2>

          <p className="mt-1 text-xs text-zinc-600">
            {queue.length}{" "}
            {queue.length === 1
              ? "song"
              : "songs"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={clearQueue}
            className="rounded-md px-2 py-1 text-xs text-zinc-500 transition hover:bg-white/5 hover:text-white"
          >
            Clear
          </button>

          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-zinc-500 transition hover:bg-white/5 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* Now Playing */}
        <section className="border-b border-white/10 p-5">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-600">
            Now playing
          </p>

          {currentTrack ? (
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-zinc-700 via-zinc-800 to-black">
                <Play
                  size={17}
                  fill="currentColor"
                  className="text-white/80"
                />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {currentTrack.title}
                </p>

                <p className="mt-1 truncate text-xs text-zinc-500">
                  {currentTrack.artist}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-zinc-600">
              Nothing playing
            </p>
          )}
        </section>

        {/* Up Next */}
        <section className="p-3">
          <div className="flex items-center justify-between px-2 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-600">
              Up next
            </p>

            <p className="text-[10px] text-zinc-700">
              Drag to reorder
            </p>
          </div>

          {upcoming.length === 0 ? (
            <div className="px-2 py-12 text-center">
              <p className="text-sm text-zinc-600">
                Nothing else in queue
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {queue.map((track, index) => {
                if (
                  index === queueIndex
                ) {
                  return null;
                }

                return (
                  <QueueTrack
                    key={track.id}
                    track={track}
                    index={index}
                    draggedIndex={
                      draggedIndex
                    }
                    onDragStart={() =>
                      setDraggedIndex(
                        index
                      )
                    }
                    onDragEnd={() =>
                      setDraggedIndex(
                        null
                      )
                    }
                    onDrop={() =>
                      handleDrop(index)
                    }
                    onPlay={() =>
                      playQueueTrack(
                        index
                      )
                    }
                    onRemove={() =>
                      removeFromQueue(
                        track.id
                      )
                    }
                  />
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function QueueTrack({
  track,
  index,
  draggedIndex,
  onDragStart,
  onDragEnd,
  onDrop,
  onPlay,
  onRemove,
}: {
  track: Track;
  index: number;
  draggedIndex: number | null;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDrop: () => void;
  onPlay: () => void;
  onRemove: () => void;
}) {
  const [showMenu, setShowMenu] =
    useState(false);

  const isDragging =
    draggedIndex === index;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={(event) =>
        event.preventDefault()
      }
      onDrop={onDrop}
      className={`group flex items-center gap-2 rounded-lg px-2 py-2 transition ${
        isDragging
          ? "bg-white/10 opacity-40"
          : "hover:bg-white/[0.05]"
      }`}
    >
      <div className="cursor-grab text-zinc-700 transition group-hover:text-zinc-500 active:cursor-grabbing">
        <GripVertical size={16} />
      </div>

      <button
        onClick={onPlay}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-zinc-800 to-zinc-950">
          <Play
            size={14}
            fill="currentColor"
            className="text-white/50"
          />
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm text-zinc-200">
            {track.title}
          </p>

          <p className="mt-0.5 truncate text-xs text-zinc-600">
            {track.artist}
          </p>
        </div>
      </button>

      <div className="relative">
        <button
          onClick={() =>
            setShowMenu(
              !showMenu
            )
          }
          className="rounded-md p-2 text-zinc-700 opacity-0 transition hover:text-white group-hover:opacity-100"
        >
          <MoreHorizontal
            size={17}
          />
        </button>

        {showMenu && (
          <div className="absolute right-0 top-full z-50 mt-1 w-36 overflow-hidden rounded-lg border border-white/10 bg-[#202023] p-1 shadow-xl">
            <button
              onClick={() => {
                onRemove();
                setShowMenu(false);
              }}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs text-zinc-400 transition hover:bg-white/5 hover:text-red-400"
            >
              <Trash2 size={14} />
              Remove
            </button>
          </div>
        )}
      </div>
    </div>
  );
}