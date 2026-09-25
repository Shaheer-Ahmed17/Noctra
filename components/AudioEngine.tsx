"use client";

import { usePlayerStore } from "@/lib/player-store";
import { useEffect, useRef } from "react";

export default function AudioEngine() {
  const audioRef = useRef<HTMLAudioElement | null>(
    null
  );

  const currentTrack = usePlayerStore(
    (state) => state.currentTrack
  );

  const isPlaying = usePlayerStore(
    (state) => state.isPlaying
  );

  const volume = usePlayerStore(
    (state) => state.volume
  );

  const repeat = usePlayerStore(
    (state) => state.repeat
  );

  const setCurrentTime = usePlayerStore(
    (state) => state.setCurrentTime
  );

  const setDuration = usePlayerStore(
    (state) => state.setDuration
  );

  const nextTrack = usePlayerStore(
    (state) => state.nextTrack
  );

  /*
   * Create audio element once.
   */
  useEffect(() => {
    const audio = new Audio();

    audio.preload = "metadata";

    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setCurrentTime(
        audio.currentTime
      );
    };

    const handleLoadedMetadata = () => {
      if (
        Number.isFinite(audio.duration)
      ) {
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      /*
       * Repeat One.
       */
      if (
        usePlayerStore.getState().repeat ===
        "one"
      ) {
        audio.currentTime = 0;

        audio.play().catch(console.error);

        setCurrentTime(0);

        return;
      }

      /*
       * Normal next-track behavior.
       */
      nextTrack();
    };

    audio.addEventListener(
      "timeupdate",
      handleTimeUpdate
    );

    audio.addEventListener(
      "loadedmetadata",
      handleLoadedMetadata
    );

    audio.addEventListener(
      "ended",
      handleEnded
    );

    return () => {
      audio.pause();

      audio.src = "";

      audio.removeEventListener(
        "timeupdate",
        handleTimeUpdate
      );

      audio.removeEventListener(
        "loadedmetadata",
        handleLoadedMetadata
      );

      audio.removeEventListener(
        "ended",
        handleEnded
      );

      audioRef.current = null;
    };
  }, [
    setCurrentTime,
    setDuration,
    nextTrack,
  ]);

  /*
   * Load a new track.
   */
  useEffect(() => {
    const audio = audioRef.current;

    if (!audio || !currentTrack) {
      return;
    }

    audio.pause();

    audio.src = currentTrack.src;

    audio.currentTime = 0;

    audio.load();

    if (isPlaying) {
      audio.play().catch(console.error);
    }
  }, [currentTrack]);

  /*
   * Play / pause.
   */
  useEffect(() => {
    const audio = audioRef.current;

    if (!audio || !currentTrack) {
      return;
    }

    if (isPlaying) {
      audio.play().catch(console.error);
    } else {
      audio.pause();
    }
  }, [
    isPlaying,
    currentTrack,
  ]);

  /*
   * Volume.
   */
  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) return;

    audio.volume = volume;
  }, [volume]);

  /*
   * Manual replay.
   */
  useEffect(() => {
    const handleReplay = () => {
      const audio = audioRef.current;

      if (!audio) return;

      audio.currentTime = 0;

      audio.play().catch(console.error);

      setCurrentTime(0);
    };

    window.addEventListener(
      "noctra-replay",
      handleReplay
    );

    return () => {
      window.removeEventListener(
        "noctra-replay",
        handleReplay
      );
    };
  }, [setCurrentTime]);

  /*
   * Seeking.
   */
  useEffect(() => {
    const handleSeek = (
      event: Event
    ) => {
      const audio = audioRef.current;

      if (!audio) return;

      const customEvent =
        event as CustomEvent<number>;

      const time = customEvent.detail;

      if (
        typeof time !== "number" ||
        !Number.isFinite(time)
      ) {
        return;
      }

      audio.currentTime = Math.max(
        0,
        Math.min(
          time,
          Number.isFinite(audio.duration)
            ? audio.duration
            : time
        )
      );
    };

    window.addEventListener(
      "noctra-seek",
      handleSeek
    );

    return () => {
      window.removeEventListener(
        "noctra-seek",
        handleSeek
      );
    };
  }, []);

  return null;
}