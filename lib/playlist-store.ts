import { create } from "zustand";
import { persist } from "zustand/middleware";

import { Track } from "./player-store";

export type Playlist = {
  id: string;
  name: string;
  tracks: Track[];
  createdAt: number;
};

type PlaylistState = {
  playlists: Playlist[];
  activePlaylistId: string | null;

  createPlaylist: (name: string) => void;
  deletePlaylist: (id: string) => void;

  addTrackToPlaylist: (
    playlistId: string,
    track: Track
  ) => void;

  removeTrackFromPlaylist: (
    playlistId: string,
    trackId: string
  ) => void;

  toggleLike: (track: Track) => void;
  isLiked: (trackId: string) => boolean;

  setActivePlaylist: (
    playlistId: string | null
  ) => void;
};

export const usePlaylistStore =
  create<PlaylistState>()(
    persist(
      (set, get) => ({
        playlists: [
          {
            id: "liked-songs",
            name: "Liked Songs",
            tracks: [],
            createdAt: Date.now(),
          },
        ],

        activePlaylistId: null,

        createPlaylist: (name) => {
          const trimmedName = name.trim();

          if (!trimmedName) return;

          const playlist: Playlist = {
            id: `playlist-${Date.now()}`,
            name: trimmedName,
            tracks: [],
            createdAt: Date.now(),
          };

          set((state) => ({
            playlists: [
              ...state.playlists,
              playlist,
            ],

            activePlaylistId:
              playlist.id,
          }));
        },

        deletePlaylist: (id) => {
          if (id === "liked-songs") {
            return;
          }

          set((state) => ({
            playlists:
              state.playlists.filter(
                (playlist) =>
                  playlist.id !== id
              ),

            activePlaylistId:
              state.activePlaylistId === id
                ? null
                : state.activePlaylistId,
          }));
        },

        addTrackToPlaylist: (
          playlistId,
          track
        ) => {
          set((state) => ({
            playlists:
              state.playlists.map(
                (playlist) => {
                  if (
                    playlist.id !==
                    playlistId
                  ) {
                    return playlist;
                  }

                  const alreadyExists =
                    playlist.tracks.some(
                      (item) =>
                        item.id === track.id
                    );

                  if (alreadyExists) {
                    return playlist;
                  }

                  return {
                    ...playlist,

                    tracks: [
                      ...playlist.tracks,
                      track,
                    ],
                  };
                }
              ),
          }));
        },

        removeTrackFromPlaylist: (
          playlistId,
          trackId
        ) => {
          set((state) => ({
            playlists:
              state.playlists.map(
                (playlist) => {
                  if (
                    playlist.id !==
                    playlistId
                  ) {
                    return playlist;
                  }

                  return {
                    ...playlist,

                    tracks:
                      playlist.tracks.filter(
                        (track) =>
                          track.id !==
                          trackId
                      ),
                  };
                }
              ),
          }));
        },

        toggleLike: (track) => {
          set((state) => ({
            playlists:
              state.playlists.map(
                (playlist) => {
                  if (
                    playlist.id !==
                    "liked-songs"
                  ) {
                    return playlist;
                  }

                  const alreadyLiked =
                    playlist.tracks.some(
                      (item) =>
                        item.id === track.id
                    );

                  return {
                    ...playlist,

                    tracks: alreadyLiked
                      ? playlist.tracks.filter(
                          (item) =>
                            item.id !==
                            track.id
                        )
                      : [
                          ...playlist.tracks,
                          track,
                        ],
                  };
                }
              ),
          }));
        },

        isLiked: (trackId) => {
          const likedPlaylist =
            get().playlists.find(
              (playlist) =>
                playlist.id ===
                "liked-songs"
            );

          return (
            likedPlaylist?.tracks.some(
              (track) =>
                track.id === trackId
            ) ?? false
          );
        },

        setActivePlaylist: (
          playlistId
        ) => {
          set({
            activePlaylistId:
              playlistId,
          });
        },
      }),
      {
        name: "noctra-playlists",
      }
    )
  );