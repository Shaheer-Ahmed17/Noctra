"use client";

import {
    ArrowLeft,
    Heart,
    Pause,
    Play,
    Shuffle,
} from "lucide-react";

import { usePlayerStore } from "@/lib/player-store";
import { usePlaylistStore } from "@/lib/playlist-store";

type Track = {
  id: string;
  title: string;
  artist: string;
  album: string;
  src: string;
  cover: string;
};

type MusicPageProps = {
  type: "artist" | "album";
  name: string;
  tracks: Track[];
  onBack: () => void;
};

export default function MusicPage({
  type,
  name,
  tracks,
  onBack,
}: MusicPageProps) {
  const currentTrack =
    usePlayerStore(
      (state) => state.currentTrack
    );

  const isPlaying = usePlayerStore(
    (state) => state.isPlaying
  );

  const playTrack = usePlayerStore(
    (state) => state.playTrack
  );

  const togglePlay = usePlayerStore(
    (state) => state.togglePlay
  );

  const toggleLike =
    usePlaylistStore(
      (state) => state.toggleLike
    );

  const isLiked =
    usePlaylistStore(
      (state) => state.isLiked
    );

  const handlePlayAll = () => {
    if (!tracks.length) return;

    playTrack(tracks[0]);
  };

  const handleShuffle = () => {
    if (!tracks.length) return;

    const randomIndex =
      Math.floor(
        Math.random() *
          tracks.length
      );

    playTrack(
      tracks[randomIndex]
    );
  };

  return (
    <section>
      {/* Back */}
      <button
        onClick={onBack}
        className="mb-8 flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white"
      >
        <ArrowLeft size={17} />
        Back
      </button>

      {/* Header */}
      <section className="flex flex-col gap-6 sm:flex-row sm:items-end">
        <div className="flex h-48 w-48 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-zinc-700 via-zinc-900 to-black shadow-2xl">
          <div className="text-center px-5">
            <p className="text-xs uppercase tracking-[0.25em] text-white/30">
              {type}
            </p>

            <p className="mt-2 text-2xl font-bold tracking-tight text-white/70">
              {name
                .slice(0, 1)
                .toUpperCase()}
            </p>
          </div>
        </div>

        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-600">
            {type}
          </p>

          <h1 className="mt-3 truncate text-4xl font-bold tracking-tight sm:text-6xl">
            {name}
          </h1>

          <p className="mt-4 text-sm text-zinc-500">
            {tracks.length}{" "}
            {tracks.length === 1
              ? "song"
              : "songs"}
          </p>
        </div>
      </section>

      {/* Actions */}
      <div className="mt-10 flex items-center gap-3">
        <button
          onClick={handlePlayAll}
          disabled={!tracks.length}
          className="flex h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-40"
        >
          <Play
            size={17}
            fill="currentColor"
          />
          Play
        </button>

        <button
          onClick={handleShuffle}
          disabled={!tracks.length}
          className="flex h-12 items-center gap-2 rounded-full border border-white/10 px-5 text-sm font-medium text-zinc-300 transition hover:bg-white/5 hover:text-white disabled:opacity-40"
        >
          <Shuffle size={17} />
          Shuffle
        </button>
      </div>

      {/* Tracks */}
      <div className="mt-10">
        <div className="flex items-center gap-4 border-b border-white/10 px-3 pb-4 text-xs uppercase tracking-widest text-zinc-600">
          <span className="w-8">
            #
          </span>

          <span className="flex-1">
            Title
          </span>

          <span className="hidden w-40 sm:block">
            Album
          </span>

          <span className="w-10" />
        </div>

        {tracks.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm text-zinc-500">
              No songs found.
            </p>
          </div>
        ) : (
          <div className="mt-2">
            {tracks.map(
              (track, index) => {
                const active =
                  currentTrack?.id ===
                  track.id;

                const liked =
                  isLiked(track.id);

                return (
                  <div
                    key={track.id}
                    className="group flex items-center gap-4 rounded-lg px-3 py-3 transition hover:bg-white/[0.05]"
                  >
                    <button
                      onClick={() => {
                        if (active) {
                          togglePlay();
                        } else {
                          playTrack(track);
                        }
                      }}
                      className="w-8 shrink-0 text-center text-sm text-zinc-600"
                    >
                      {active &&
                      isPlaying ? (
                        <Pause
                          size={15}
                          className="mx-auto"
                        />
                      ) : (
                        <>
                          <span className="group-hover:hidden">
                            {index + 1}
                          </span>

                          <Play
                            size={15}
                            fill="currentColor"
                            className="mx-auto hidden group-hover:block"
                          />
                        </>
                      )}
                    </button>

                    <button
                      onClick={() =>
                        playTrack(track)
                      }
                      className="min-w-0 flex-1 text-left"
                    >
                      <p
                        className={`truncate text-sm font-medium ${
                          active
                            ? "text-white"
                            : "text-zinc-200"
                        }`}
                      >
                        {track.title}
                      </p>

                      <p className="mt-1 truncate text-xs text-zinc-600">
                        {track.artist}
                      </p>
                    </button>

                    <button
                      onClick={() =>
                        playTrack(track)
                      }
                      className="hidden w-40 truncate text-left text-xs text-zinc-500 transition hover:text-white sm:block"
                    >
                      {track.album}
                    </button>

                    <button
                      onClick={() =>
                        toggleLike(track)
                      }
                      className={`rounded-md p-2 transition ${
                        liked
                          ? "text-white"
                          : "text-zinc-700 opacity-0 group-hover:opacity-100"
                      } hover:text-white`}
                      title={
                        liked
                          ? "Unlike"
                          : "Like"
                      }
                    >
                      <Heart
                        size={17}
                        fill={
                          liked
                            ? "currentColor"
                            : "none"
                        }
                      />
                    </button>
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>
    </section>
  );
}