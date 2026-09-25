"use client";

import {
  Album,
  ArrowLeft,
  Heart,
  ListMusic,
  Menu,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  Search,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  X
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import AudioEngine from "@/components/AudioEngine";
import MusicPage from "@/components/MusicPage";
import QueuePanel from "@/components/QueuePanel";
import { Track, usePlayerStore } from "@/lib/player-store";
import {
  Playlist,
  usePlaylistStore,
} from "@/lib/playlist-store";

type MusicPageState = {
  type: "artist" | "album";
  name: string;
};

export default function Home() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [musicPage, setMusicPage] =
    useState<MusicPageState | null>(null);

  const [showQueue, setShowQueue] = useState(false);
  const [showCreatePlaylist, setShowCreatePlaylist] =
    useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [activePlaylist, setActivePlaylist] =
    useState<string | null>(null);

  const currentTrack = usePlayerStore(
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

  const nextTrack = usePlayerStore(
    (state) => state.nextTrack
  );

  const previousTrack = usePlayerStore(
    (state) => state.previousTrack
  );

  const volume = usePlayerStore(
    (state) => state.volume
  );

  const setVolume = usePlayerStore(
    (state) => state.setVolume
  );

  const currentTime = usePlayerStore(
    (state) => state.currentTime
  );

  const duration = usePlayerStore(
    (state) => state.duration
  );

  const seek = usePlayerStore(
    (state) => state.seek
  );

  const shuffle = usePlayerStore(
    (state) => state.shuffle
  );

  const toggleShuffle = usePlayerStore(
    (state) => state.toggleShuffle
  );

  const repeat = usePlayerStore(
    (state) => state.repeat
  );

  const toggleRepeat = usePlayerStore(
    (state) => state.toggleRepeat
  );

  const playlists = usePlaylistStore(
    (state) => state.playlists
  );

  const createPlaylist = usePlaylistStore(
    (state) => state.createPlaylist
  );

  const deletePlaylist = usePlaylistStore(
    (state) => state.deletePlaylist
  );

  const toggleLike = usePlaylistStore(
    (state) => state.toggleLike
  );

  const isLiked = usePlaylistStore(
    (state) => state.isLiked
  );

  const addTrackToPlaylist =
    usePlaylistStore(
      (state) => state.addTrackToPlaylist
    );

  const removeTrackFromPlaylist =
    usePlaylistStore(
      (state) => state.removeTrackFromPlaylist
    );

  useEffect(() => {
    const loadMusic = async () => {
      try {
        const response = await fetch(
          "/api/music"
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load music"
          );
        }

        const data: Track[] =
          await response.json();

        setTracks(data);

        usePlayerStore
          .getState()
          .setTracks(data);
      } catch (error) {
        console.error(
          "Failed to load music:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadMusic();
  }, []);

  const normalizedSearch =
    searchQuery.trim().toLowerCase();

  /*
   * GLOBAL SEARCH
   *
   * This searches the entire music library.
   * It does NOT care whether the user is currently
   * inside an artist page, album page, playlist, etc.
   */
  const searchResults = useMemo(() => {
    if (!normalizedSearch) {
      return [];
    }

    return tracks.filter((track) =>
      [
        track.title,
        track.artist,
        track.album,
      ].some((value) =>
        value
          .toLowerCase()
          .includes(normalizedSearch)
      )
    );
  }, [tracks, normalizedSearch]);

  /*
   * ARTIST / ALBUM PAGE
   *
   * This ONLY filters based on the currently opened
   * artist or album.
   *
   * Search is intentionally NOT included here.
   */
  const musicPageTracks = useMemo(() => {
    if (!musicPage) {
      return [];
    }

    return tracks.filter((track) => {
      if (musicPage.type === "artist") {
        return (
          track.artist ===
          musicPage.name
        );
      }

      return (
        track.album ===
        musicPage.name
      );
    });
  }, [tracks, musicPage]);

  const selectedPlaylist = activePlaylist
    ? playlists.find(
        (playlist) =>
          playlist.id === activePlaylist
      ) ?? null
    : null;

  const openArtist = (artist: string) => {
    setSearchQuery("");
    setActivePlaylist(null);

    setMusicPage({
      type: "artist",
      name: artist,
    });

    setSidebarOpen(false);
  };

  const openAlbum = (album: string) => {
    setSearchQuery("");
    setActivePlaylist(null);

    setMusicPage({
      type: "album",
      name: album,
    });

    setSidebarOpen(false);
  };

  const openPlaylist = (
    playlistId: string
  ) => {
    setSearchQuery("");
    setMusicPage(null);

    setActivePlaylist(playlistId);
    setSidebarOpen(false);
  };

  const goHome = () => {
    setMusicPage(null);
    setSearchQuery("");
    setActivePlaylist(null);
    setSidebarOpen(false);
  };

  const formatTime = (seconds: number) => {
    if (
      !Number.isFinite(seconds) ||
      seconds < 0
    ) {
      return "0:00";
    }

    const minutes = Math.floor(
      seconds / 60
    );

    const remainingSeconds =
      Math.floor(seconds % 60);

    return `${minutes}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <AudioEngine />

      <div className="flex min-h-screen">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <button
            aria-label="Close sidebar"
            onClick={() =>
              setSidebarOpen(false)
            }
            className="fixed inset-0 z-40 bg-black/70 lg:hidden"
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/[0.06] bg-[#0c0c0c] transition-transform duration-200 lg:static lg:translate-x-0 ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }`}
        >
          <div className="flex h-20 items-center justify-between px-6">
            <button
              onClick={goHome}
              className="text-xl font-semibold tracking-[0.18em]"
            >
              NOCTRA
            </button>

            <button
              onClick={() =>
                setSidebarOpen(false)
              }
              className="rounded-md p-2 text-zinc-500 hover:text-white lg:hidden"
            >
              <X size={18} />
            </button>
          </div>

          <nav className="px-3">
            <SidebarItem
              icon={<Search size={18} />}
              label="Search"
              active={Boolean(
                normalizedSearch
              )}
              onClick={() => {
                setActivePlaylist(null);
                setSidebarOpen(false);
              }}
            />

            <SidebarItem
              icon={<ListMusic size={18} />}
              label="Your Library"
              active={
                !musicPage &&
                !activePlaylist &&
                !normalizedSearch
              }
              onClick={() => {
                setMusicPage(null);
                setSearchQuery("");
                setActivePlaylist(null);
                setSidebarOpen(false);
              }}
            />
          </nav>

          <div className="mt-8 px-6">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-600">
                Your Playlists
              </p>

              <button
                onClick={() =>
                  setShowCreatePlaylist(true)
                }
                className="rounded-md p-1 text-zinc-600 transition hover:bg-white/5 hover:text-white"
                title="Create playlist"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div className="mt-3 flex-1 overflow-y-auto px-3">
            {playlists.map(
              (playlist) => (
                <button
                  key={playlist.id}
                  onClick={() =>
                    openPlaylist(
                      playlist.id
                    )
                  }
                  className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition ${
                    activePlaylist ===
                    playlist.id
                      ? "bg-white/[0.08] text-white"
                      : "text-zinc-500 hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  {playlist.id ===
                  "liked-songs" ? (
                    <Heart
                      size={16}
                      fill="currentColor"
                    />
                  ) : (
                    <ListMusic size={16} />
                  )}

                  <span className="truncate">
                    {playlist.name}
                  </span>
                </button>
              )
            )}
          </div>

          <div className="border-t border-white/[0.06] p-5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-700">
              NOCTRA
            </p>

            <p className="mt-1 text-xs text-zinc-700">
              Your music. Your space.
            </p>
          </div>
        </aside>

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Header */}
          <header className="sticky top-0 z-30 flex h-20 items-center gap-3 border-b border-white/[0.06] bg-[#090909]/95 px-4 backdrop-blur-xl sm:px-6">
            <button
              onClick={() =>
                setSidebarOpen(true)
              }
              className="rounded-md p-2 text-zinc-500 hover:bg-white/5 hover:text-white lg:hidden"
            >
              <Menu size={20} />
            </button>

            <button
              onClick={() => {
                if (normalizedSearch) {
                  /*
                   * If searching while inside an artist/
                   * album page, Back should clear search
                   * and reveal that page again.
                   */
                  setSearchQuery("");
                  return;
                }

                if (musicPage) {
                  setMusicPage(null);
                  return;
                }

                setActivePlaylist(null);
              }}
              className="hidden rounded-md p-2 text-zinc-500 transition hover:bg-white/5 hover:text-white sm:block"
            >
              <ArrowLeft size={18} />
            </button>

            <div className="relative max-w-xl flex-1">
              <Search
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
              />

              <input
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(
                    event.target.value
                  )
                }
                placeholder="Search songs, artists, albums..."
                className="h-11 w-full rounded-full border border-white/[0.07] bg-white/[0.035] pl-11 pr-11 text-sm text-white outline-none placeholder:text-zinc-600 transition focus:border-white/15 focus:bg-white/[0.05]"
              />

              {searchQuery && (
                <button
                  onClick={() =>
                    setSearchQuery("")
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-zinc-600 transition hover:text-white"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <button
              onClick={() =>
                setShowQueue(true)
              }
              className={`hidden rounded-full border px-4 py-2 text-xs font-medium transition sm:flex ${
                showQueue
                  ? "border-white/20 bg-white/10 text-white"
                  : "border-white/[0.07] text-zinc-500 hover:bg-white/5 hover:text-white"
              }`}
            >
              Queue
            </button>
          </header>

          {/* Content */}
          <div className="flex-1 overflow-y-auto pb-32">
            <div className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
              {loading ? (
                <LoadingState />
              ) : (
                <>
                  {/*
                   * IMPORTANT:
                   *
                   * SEARCH ALWAYS COMES FIRST.
                   *
                   * This means:
                   *
                   * Don Toliver page
                   *        ↓
                   * type "French Montana"
                   *        ↓
                   * GLOBAL SEARCH RESULTS
                   *
                   * The current artist page does not
                   * restrict the search.
                   */}
                  {normalizedSearch ? (
                    <SearchResults
                      results={searchResults}
                      currentTrack={currentTrack}
                      isPlaying={isPlaying}
                      isLiked={isLiked}
                      playTrack={playTrack}
                      togglePlay={togglePlay}
                      toggleLike={toggleLike}
                      addTrackToPlaylist={
                        addTrackToPlaylist
                      }
                      playlists={playlists}
                      onOpenArtist={
                        openArtist
                      }
                      onOpenAlbum={
                        openAlbum
                      }
                    />
                  ) : musicPage ? (
                    <MusicPage
                      type={
                        musicPage.type
                      }
                      name={
                        musicPage.name
                      }
                      tracks={
                        musicPageTracks
                      }
                      onBack={() =>
                        setMusicPage(
                          null
                        )
                      }
                    />
                  ) : selectedPlaylist ? (
                    <PlaylistPage
                      playlist={
                        selectedPlaylist
                      }
                      currentTrack={
                        currentTrack
                      }
                      isPlaying={
                        isPlaying
                      }
                      isLiked={isLiked}
                      playTrack={
                        playTrack
                      }
                      togglePlay={
                        togglePlay
                      }
                      toggleLike={
                        toggleLike
                      }
                      removeTrack={
                        removeTrackFromPlaylist
                      }
                    />
                  ) : (
                    <HomePage
                      tracks={tracks}
                      currentTrack={
                        currentTrack
                      }
                      isPlaying={
                        isPlaying
                      }
                      isLiked={
                        isLiked
                      }
                      playTrack={
                        playTrack
                      }
                      togglePlay={
                        togglePlay
                      }
                      toggleLike={
                        toggleLike
                      }
                      onOpenArtist={
                        openArtist
                      }
                      onOpenAlbum={
                        openAlbum
                      }
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Player */}
      <PlayerBar
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        togglePlay={togglePlay}
        nextTrack={nextTrack}
        previousTrack={
          previousTrack
        }
        volume={volume}
        setVolume={setVolume}
        currentTime={currentTime}
        duration={duration}
        seek={seek}
        shuffle={shuffle}
        toggleShuffle={
          toggleShuffle
        }
        repeat={repeat}
        toggleRepeat={
          toggleRepeat
        }
        onOpenQueue={() =>
          setShowQueue(true)
        }
      />

      {showQueue && (
        <QueuePanel
          onClose={() =>
            setShowQueue(false)
          }
        />
      )}

      {showCreatePlaylist && (
        <CreatePlaylistModal
          onClose={() =>
            setShowCreatePlaylist(
              false
            )
          }
          onCreate={(name) => {
            createPlaylist(name);
            setShowCreatePlaylist(
              false
            );
          }}
        />
      )}
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Sidebar                                                                     */
/* -------------------------------------------------------------------------- */

function SidebarItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-md px-3 py-3 text-sm transition ${
        active
          ? "bg-white/[0.08] text-white"
          : "text-zinc-500 hover:bg-white/[0.04] hover:text-white"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Home                                                                        */
/* -------------------------------------------------------------------------- */

function HomePage({
  tracks,
  currentTrack,
  isPlaying,
  isLiked,
  playTrack,
  togglePlay,
  toggleLike,
  onOpenArtist,
  onOpenAlbum,
}: {
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  isLiked: (id: string) => boolean;
  playTrack: (track: Track) => void;
  togglePlay: () => void;
  toggleLike: (track: Track) => void;
  onOpenArtist: (artist: string) => void;
  onOpenAlbum: (album: string) => void;
}) {
  const artists = Array.from(
    new Set(
      tracks.map(
        (track) => track.artist
      )
    )
  );

  const albums = Array.from(
    new Set(
      tracks.map(
        (track) => track.album
      )
    )
  );

  return (
    <section>
      <div className="mb-12">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-600">
          Your library
        </p>

        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          Good evening.
        </h1>

        <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-600">
          Everything you listen to, gathered
          in one place.
        </p>
      </div>

      {tracks.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <section>
            <SectionHeading
              title="Your Music"
              subtitle={`${tracks.length} songs`}
            />

            <div className="mt-5 overflow-hidden rounded-xl border border-white/[0.06]">
              {tracks.map(
                (track, index) => (
                  <TrackRow
                    key={track.id}
                    track={track}
                    index={index}
                    currentTrack={
                      currentTrack
                    }
                    isPlaying={
                      isPlaying
                    }
                    liked={isLiked(
                      track.id
                    )}
                    onPlay={() =>
                      playTrack(track)
                    }
                    onTogglePlay={
                      togglePlay
                    }
                    onToggleLike={() =>
                      toggleLike(
                        track
                      )
                    }
                    onOpenArtist={() =>
                      onOpenArtist(
                        track.artist
                      )
                    }
                    onOpenAlbum={() =>
                      onOpenAlbum(
                        track.album
                      )
                    }
                  />
                )
              )}
            </div>
          </section>

          <section className="mt-14">
            <SectionHeading
              title="Artists"
              subtitle="Browse by artist"
            />

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {artists.map(
                (artist) => (
                  <button
                    key={artist}
                    onClick={() =>
                      onOpenArtist(
                        artist
                      )
                    }
                    className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 text-left transition hover:border-white/10 hover:bg-white/[0.05]"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-zinc-700 to-zinc-950 text-lg font-semibold text-white/70">
                      {artist
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <p className="mt-4 truncate text-sm font-medium text-zinc-200 group-hover:text-white">
                      {artist}
                    </p>

                    <p className="mt-1 text-xs text-zinc-600">
                      Artist
                    </p>
                  </button>
                )
              )}
            </div>
          </section>

          <section className="mt-14">
            <SectionHeading
              title="Albums"
              subtitle="Browse by album"
            />

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {albums.map(
                (album) => (
                  <button
                    key={album}
                    onClick={() =>
                      onOpenAlbum(
                        album
                      )
                    }
                    className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 text-left transition hover:border-white/10 hover:bg-white/[0.05]"
                  >
                    <div className="flex aspect-square items-center justify-center rounded-lg bg-gradient-to-br from-zinc-700 via-zinc-900 to-black shadow-xl">
                      <Album
                        size={30}
                        className="text-white/30"
                      />
                    </div>

                    <p className="mt-4 truncate text-sm font-medium text-zinc-200 group-hover:text-white">
                      {album}
                    </p>

                    <p className="mt-1 text-xs text-zinc-600">
                      Album
                    </p>
                  </button>
                )
              )}
            </div>
          </section>
        </>
      )}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Search                                                                      */
/* -------------------------------------------------------------------------- */

function SearchResults({
  results,
  currentTrack,
  isPlaying,
  isLiked,
  playTrack,
  togglePlay,
  toggleLike,
  addTrackToPlaylist,
  playlists,
  onOpenArtist,
  onOpenAlbum,
}: {
  results: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  isLiked: (id: string) => boolean;
  playTrack: (track: Track) => void;
  togglePlay: () => void;
  toggleLike: (track: Track) => void;
  addTrackToPlaylist: (
    playlistId: string,
    track: Track
  ) => void;
  playlists: Playlist[];
  onOpenArtist: (artist: string) => void;
  onOpenAlbum: (album: string) => void;
}) {
  const artists = Array.from(
    new Set(
      results.map(
        (track) => track.artist
      )
    )
  );

  const albums = Array.from(
    new Set(
      results.map(
        (track) => track.album
      )
    )
  );

  return (
    <section>
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-600">
        Search
      </p>

      <h1 className="mt-3 text-4xl font-semibold tracking-tight">
        Search results
      </h1>

      <p className="mt-3 text-sm text-zinc-600">
        {results.length}{" "}
        {results.length === 1
          ? "result"
          : "results"}
      </p>

      {results.length === 0 ? (
        <div className="mt-16 rounded-xl border border-white/[0.06] px-6 py-20 text-center">
          <Search
            size={28}
            className="mx-auto text-zinc-700"
          />

          <p className="mt-5 text-sm text-zinc-500">
            Nothing found.
          </p>

          <p className="mt-2 text-xs text-zinc-700">
            Try another song, artist, or album.
          </p>
        </div>
      ) : (
        <>
          {artists.length > 0 && (
            <section className="mt-10">
              <SectionHeading
                title="Artists"
                subtitle={`${artists.length}`}
              />

              <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                {artists.map(
                  (artist) => (
                    <button
                      key={artist}
                      onClick={() =>
                        onOpenArtist(
                          artist
                        )
                      }
                      className="w-40 shrink-0 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-left transition hover:bg-white/[0.05]"
                    >
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-zinc-700 to-black text-xl font-semibold text-white/70">
                        {artist
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <p className="mt-3 truncate text-sm font-medium">
                        {artist}
                      </p>

                      <p className="mt-1 text-xs text-zinc-600">
                        Artist
                      </p>
                    </button>
                  )
                )}
              </div>
            </section>
          )}

          {albums.length > 0 && (
            <section className="mt-10">
              <SectionHeading
                title="Albums"
                subtitle={`${albums.length}`}
              />

              <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                {albums.map(
                  (album) => (
                    <button
                      key={album}
                      onClick={() =>
                        onOpenAlbum(
                          album
                        )
                      }
                      className="w-44 shrink-0 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-left transition hover:bg-white/[0.05]"
                    >
                      <div className="flex aspect-square items-center justify-center rounded-lg bg-gradient-to-br from-zinc-700 via-zinc-900 to-black">
                        <Album
                          size={28}
                          className="text-white/30"
                        />
                      </div>

                      <p className="mt-3 truncate text-sm font-medium">
                        {album}
                      </p>

                      <p className="mt-1 text-xs text-zinc-600">
                        Album
                      </p>
                    </button>
                  )
                )}
              </div>
            </section>
          )}

          <section className="mt-10">
            <SectionHeading
              title="Songs"
              subtitle={`${results.length}`}
            />

            <div className="mt-4 overflow-hidden rounded-xl border border-white/[0.06]">
              {results.map(
                (track, index) => (
                  <SearchTrackRow
                    key={track.id}
                    track={track}
                    index={index}
                    currentTrack={
                      currentTrack
                    }
                    isPlaying={
                      isPlaying
                    }
                    liked={isLiked(
                      track.id
                    )}
                    playlists={
                      playlists
                    }
                    onPlay={() =>
                      playTrack(track)
                    }
                    onTogglePlay={
                      togglePlay
                    }
                    onToggleLike={() =>
                      toggleLike(
                        track
                      )
                    }
                    onOpenArtist={() =>
                      onOpenArtist(
                        track.artist
                      )
                    }
                    onOpenAlbum={() =>
                      onOpenAlbum(
                        track.album
                      )
                    }
                    onAddToPlaylist={(
                      playlistId
                    ) =>
                      addTrackToPlaylist(
                        playlistId,
                        track
                      )
                    }
                  />
                )
              )}
            </div>
          </section>
        </>
      )}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Playlist                                                                    */
/* -------------------------------------------------------------------------- */

function PlaylistPage({
  playlist,
  currentTrack,
  isPlaying,
  isLiked,
  playTrack,
  togglePlay,
  toggleLike,
  removeTrack,
}: {
  playlist: Playlist;
  currentTrack: Track | null;
  isPlaying: boolean;
  isLiked: (id: string) => boolean;
  playTrack: (track: Track) => void;
  togglePlay: () => void;
  toggleLike: (track: Track) => void;
  removeTrack: (
    playlistId: string,
    trackId: string
  ) => void;
}) {
  const handlePlay = () => {
    if (!playlist.tracks.length) {
      return;
    }

    playTrack(
      playlist.tracks[0]
    );
  };

  return (
    <section>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
        <div className="flex h-44 w-44 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-700 via-zinc-900 to-black shadow-2xl">
          <Heart
            size={42}
            fill="currentColor"
            className="text-white/50"
          />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-600">
            Playlist
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-6xl">
            {playlist.name}
          </h1>

          <p className="mt-4 text-sm text-zinc-600">
            {playlist.tracks.length}{" "}
            {playlist.tracks.length === 1
              ? "song"
              : "songs"}
          </p>
        </div>
      </div>

      <div className="mt-9">
        <button
          onClick={handlePlay}
          disabled={
            playlist.tracks.length ===
            0
          }
          className="flex h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-40"
        >
          <Play
            size={17}
            fill="currentColor"
          />
          Play
        </button>
      </div>

      <div className="mt-10">
        {playlist.tracks.length ===
        0 ? (
          <div className="rounded-xl border border-white/[0.06] px-6 py-20 text-center">
            <ListMusic
              size={28}
              className="mx-auto text-zinc-700"
            />

            <p className="mt-5 text-sm text-zinc-500">
              This playlist is empty.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-white/[0.06]">
            {playlist.tracks.map(
              (track, index) => {
                const active =
                  currentTrack?.id ===
                  track.id;

                const liked =
                  isLiked(track.id);

                return (
                  <div
                    key={track.id}
                    className="group flex items-center gap-4 border-b border-white/[0.04] px-3 py-3 last:border-0 hover:bg-white/[0.04]"
                  >
                    <button
                      onClick={() => {
                        if (active) {
                          togglePlay();
                        } else {
                          playTrack(
                            track
                          );
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

                    <div className="min-w-0 flex-1">
                      <button
                        onClick={() =>
                          playTrack(
                            track
                          )
                        }
                        className="block max-w-full truncate text-left text-sm font-medium text-zinc-200 hover:text-white"
                      >
                        {track.title}
                      </button>

                      <button
                        onClick={() =>
                          playTrack(
                            track
                          )
                        }
                        className="mt-1 block max-w-full truncate text-left text-xs text-zinc-600 hover:text-zinc-300"
                      >
                        {track.artist}
                      </button>
                    </div>

                    <button
                      onClick={() =>
                        toggleLike(
                          track
                        )
                      }
                      className={`rounded-md p-2 transition ${
                        liked
                          ? "text-white"
                          : "text-zinc-700 opacity-0 group-hover:opacity-100"
                      }`}
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

                    {playlist.id !==
                      "liked-songs" && (
                      <button
                        onClick={() =>
                          removeTrack(
                            playlist.id,
                            track.id
                          )
                        }
                        className="rounded-md p-2 text-zinc-700 opacity-0 transition hover:text-white group-hover:opacity-100"
                        title="Remove"
                      >
                        <X
                          size={16}
                        />
                      </button>
                    )}
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

/* -------------------------------------------------------------------------- */
/* Track rows                                                                  */
/* -------------------------------------------------------------------------- */

function TrackRow({
  track,
  index,
  currentTrack,
  isPlaying,
  liked,
  onPlay,
  onTogglePlay,
  onToggleLike,
  onOpenArtist,
  onOpenAlbum,
}: {
  track: Track;
  index: number;
  currentTrack: Track | null;
  isPlaying: boolean;
  liked: boolean;
  onPlay: () => void;
  onTogglePlay: () => void;
  onToggleLike: () => void;
  onOpenArtist: () => void;
  onOpenAlbum: () => void;
}) {
  const active =
    currentTrack?.id === track.id;

  return (
    <div className="group flex items-center gap-3 border-b border-white/[0.04] px-3 py-3 last:border-0 sm:gap-4 sm:px-4">
      <button
        onClick={() => {
          if (active) {
            onTogglePlay();
          } else {
            onPlay();
          }
        }}
        className="w-7 shrink-0 text-center text-xs text-zinc-600"
      >
        {active && isPlaying ? (
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

      <div className="min-w-0 flex-1">
        <button
          onClick={onPlay}
          className={`block max-w-full truncate text-left text-sm font-medium ${
            active
              ? "text-white"
              : "text-zinc-200"
          }`}
        >
          {track.title}
        </button>

        <button
          onClick={onOpenArtist}
          className="mt-1 block max-w-full truncate text-left text-xs text-zinc-600 hover:text-zinc-300"
        >
          {track.artist}
        </button>
      </div>

      <button
        onClick={onOpenAlbum}
        className="hidden w-44 truncate text-left text-xs text-zinc-600 hover:text-zinc-300 md:block"
      >
        {track.album}
      </button>

      <button
        onClick={onToggleLike}
        className={`rounded-md p-2 transition ${
          liked
            ? "text-white"
            : "text-zinc-700 opacity-0 group-hover:opacity-100"
        } hover:text-white`}
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

function SearchTrackRow({
  track,
  index,
  currentTrack,
  isPlaying,
  liked,
  playlists,
  onPlay,
  onTogglePlay,
  onToggleLike,
  onOpenArtist,
  onOpenAlbum,
  onAddToPlaylist,
}: {
  track: Track;
  index: number;
  currentTrack: Track | null;
  isPlaying: boolean;
  liked: boolean;
  playlists: Playlist[];
  onPlay: () => void;
  onTogglePlay: () => void;
  onToggleLike: () => void;
  onOpenArtist: () => void;
  onOpenAlbum: () => void;
  onAddToPlaylist: (
    playlistId: string
  ) => void;
}) {
  const [menuOpen, setMenuOpen] =
    useState(false);

  const active =
    currentTrack?.id === track.id;

  return (
    <div className="group relative flex items-center gap-3 border-b border-white/[0.04] px-3 py-3 last:border-0 sm:gap-4 sm:px-4">
      <button
        onClick={() => {
          if (active) {
            onTogglePlay();
          } else {
            onPlay();
          }
        }}
        className="w-7 shrink-0 text-center text-xs text-zinc-600"
      >
        {active && isPlaying ? (
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

      <div className="min-w-0 flex-1">
        <button
          onClick={onPlay}
          className={`block max-w-full truncate text-left text-sm font-medium ${
            active
              ? "text-white"
              : "text-zinc-200"
          }`}
        >
          {track.title}
        </button>

        <button
          onClick={onOpenArtist}
          className="mt-1 block max-w-full truncate text-left text-xs text-zinc-600 hover:text-zinc-300"
        >
          {track.artist}
        </button>
      </div>

      <button
        onClick={onOpenAlbum}
        className="hidden w-44 truncate text-left text-xs text-zinc-600 hover:text-zinc-300 md:block"
      >
        {track.album}
      </button>

      <button
        onClick={onToggleLike}
        className={`rounded-md p-2 transition ${
          liked
            ? "text-white"
            : "text-zinc-700 opacity-0 group-hover:opacity-100"
        } hover:text-white`}
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

      <div className="relative">
        <button
          onClick={() =>
            setMenuOpen(
              (value) => !value
            )
          }
          className="rounded-md p-2 text-zinc-700 opacity-0 transition hover:text-white group-hover:opacity-100"
        >
          <MoreHorizontal
            size={17}
          />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-10 z-20 w-48 overflow-hidden rounded-lg border border-white/10 bg-[#161616] py-1 shadow-2xl">
            {playlists
              .filter(
                (playlist) =>
                  !playlist.tracks.some(
                    (item) =>
                      item.id ===
                      track.id
                  )
              )
              .map((playlist) => (
                <button
                  key={playlist.id}
                  onClick={() => {
                    onAddToPlaylist(
                      playlist.id
                    );
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-xs text-zinc-400 hover:bg-white/5 hover:text-white"
                >
                  <Plus
                    size={14}
                  />
                  Add to{" "}
                  {playlist.name}
                </button>
              ))}

            {playlists.length === 0 && (
              <p className="px-4 py-3 text-xs text-zinc-600">
                No playlists
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Player                                                                      */
/* -------------------------------------------------------------------------- */

function PlayerBar({
  currentTrack,
  isPlaying,
  togglePlay,
  nextTrack,
  previousTrack,
  volume,
  setVolume,
  currentTime,
  duration,
  seek,
  shuffle,
  toggleShuffle,
  repeat,
  toggleRepeat,
  onOpenQueue,
}: {
  currentTrack: Track | null;
  isPlaying: boolean;
  togglePlay: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  volume: number;
  setVolume: (value: number) => void;
  currentTime: number;
  duration: number;
  seek: (value: number) => void;
  shuffle: boolean;
  toggleShuffle: () => void;
  repeat: "off" | "all" | "one";
  toggleRepeat: () => void;
  onOpenQueue: () => void;
}) {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.07] bg-[#0b0b0b]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-[1800px] items-center gap-4 px-4 sm:h-24 sm:px-6">
        <div className="hidden min-w-0 flex-1 sm:block">
          {currentTrack ? (
            <>
              <p className="truncate text-sm font-medium text-white">
                {currentTrack.title}
              </p>

              <p className="mt-1 truncate text-xs text-zinc-600">
                {currentTrack.artist}
              </p>
            </>
          ) : (
            <p className="text-sm text-zinc-700">
              Nothing playing
            </p>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleShuffle}
              className={`hidden rounded-md p-1 transition sm:block ${
                shuffle
                  ? "text-white"
                  : "text-zinc-700 hover:text-white"
              }`}
              title="Shuffle"
            >
              <Shuffle
                size={16}
              />
            </button>

            <button
              onClick={previousTrack}
              disabled={!currentTrack}
              className="text-zinc-500 transition hover:text-white disabled:opacity-30"
            >
              <SkipBack
                size={18}
                fill="currentColor"
              />
            </button>

            <button
              onClick={togglePlay}
              disabled={!currentTrack}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black transition hover:bg-zinc-200 disabled:opacity-30"
            >
              {isPlaying ? (
                <Pause
                  size={17}
                  fill="currentColor"
                />
              ) : (
                <Play
                  size={17}
                  fill="currentColor"
                />
              )}
            </button>

            <button
              onClick={nextTrack}
              disabled={!currentTrack}
              className="text-zinc-500 transition hover:text-white disabled:opacity-30"
            >
              <SkipForward
                size={18}
                fill="currentColor"
              />
            </button>

            <button
              onClick={toggleRepeat}
              disabled={!currentTrack}
              className={`relative hidden rounded-md p-1 text-xs transition sm:block ${
                repeat !== "off"
                  ? "text-white"
                  : "text-zinc-700 hover:text-white"
              }`}
              title="Repeat"
            >
              <span className="text-[10px] font-bold">
                {repeat === "one"
                  ? "1"
                  : "↻"}
              </span>
            </button>
          </div>

          <div className="flex w-full max-w-xl items-center gap-2">
            <span className="hidden w-9 text-right text-[10px] tabular-nums text-zinc-700 sm:block">
              {formatPlayerTime(
                currentTime
              )}
            </span>

            <input
              type="range"
              min="0"
              max={
                Number.isFinite(
                  duration
                ) && duration > 0
                  ? duration
                  : 1
              }
              step="0.1"
              value={Math.min(
                currentTime,
                duration || 1
              )}
              onChange={(event) =>
                seek(
                  Number(
                    event.target.value
                  )
                )
              }
              disabled={
                !currentTrack
              }
              className="h-1 w-full cursor-pointer accent-white disabled:cursor-default"
            />

            <span className="hidden w-9 text-[10px] tabular-nums text-zinc-700 sm:block">
              {formatPlayerTime(
                duration
              )}
            </span>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-end gap-3">
          <button
            onClick={() =>
              setVolume(
                volume > 0 ? 0 : 1
              )
            }
            className="hidden text-zinc-600 transition hover:text-white sm:block"
          >
            {volume === 0 ? (
              <VolumeX size={17} />
            ) : (
              <Volume2 size={17} />
            )}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(event) =>
              setVolume(
                Number(
                  event.target.value
                )
              )
            }
            className="hidden w-24 accent-white sm:block"
          />

          <button
            onClick={onOpenQueue}
            className="rounded-md p-2 text-zinc-600 transition hover:text-white"
            title="Queue"
          >
            <ListMusic size={18} />
          </button>
        </div>
      </div>
    </footer>
  );
}

/* -------------------------------------------------------------------------- */
/* Create playlist modal                                                       */
/* -------------------------------------------------------------------------- */

function CreatePlaylistModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (name: string) => void;
}) {
  const [name, setName] =
    useState("");

  const inputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submit = () => {
    const trimmed =
      name.trim();

    if (!trimmed) {
      return;
    }

    onCreate(trimmed);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#151515] p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Create playlist
          </h2>

          <button
            onClick={onClose}
            className="rounded-md p-2 text-zinc-600 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <input
          ref={inputRef}
          value={name}
          onChange={(event) =>
            setName(
              event.target.value
            )
          }
          onKeyDown={(event) => {
            if (
              event.key ===
              "Enter"
            ) {
              submit();
            }

            if (
              event.key ===
              "Escape"
            ) {
              onClose();
            }
          }}
          placeholder="Playlist name"
          className="mt-6 h-12 w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 text-sm outline-none placeholder:text-zinc-700 focus:border-white/20"
        />

        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-full px-5 py-2.5 text-sm text-zinc-500 hover:text-white"
          >
            Cancel
          </button>

          <button
            onClick={submit}
            disabled={!name.trim()}
            className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black hover:bg-zinc-200 disabled:opacity-30"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Small components                                                            */
/* -------------------------------------------------------------------------- */

function SectionHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-end justify-between">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          {title}
        </h2>

        {subtitle && (
          <p className="mt-1 text-xs text-zinc-600">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-56 animate-pulse rounded bg-white/[0.04]" />
      <div className="h-4 w-80 animate-pulse rounded bg-white/[0.03]" />

      <div className="mt-12 space-y-2">
        {Array.from({
          length: 6,
        }).map((_, index) => (
          <div
            key={index}
            className="h-14 animate-pulse rounded-lg bg-white/[0.03]"
          />
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-white/[0.06] px-6 py-24 text-center">
      <ListMusic
        size={30}
        className="mx-auto text-zinc-700"
      />

      <p className="mt-5 text-sm text-zinc-500">
        Your music library is empty.
      </p>

      <p className="mt-2 text-xs text-zinc-700">
        Add MP3 files to public/music.
      </p>
    </div>
  );
}

function formatPlayerTime(
  seconds: number
) {
  if (
    !Number.isFinite(seconds) ||
    seconds < 0
  ) {
    return "0:00";
  }

  const minutes = Math.floor(
    seconds / 60
  );

  const remaining = Math.floor(
    seconds % 60
  );

  return `${minutes}:${remaining
    .toString()
    .padStart(2, "0")}`;
}
