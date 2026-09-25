import fs from "fs";
import { NextResponse } from "next/server";
import path from "path";

function cleanTitle(filename: string) {
  let title = filename
    .replace(/\.mp3$/i, "")
    .replace(/\s*\[[^\]]+\]\s*$/i, "")
    .replace(/\s*\([^)]*Lyrics[^)]*\)/gi, "")
    .replace(/\s*\([^)]*Official Visualizer[^)]*\)/gi, "")
    .replace(/\s*\[Official Visualizer\]/gi, "")
    .replace(/\s*Official Visualizer/gi, "")
    .trim();

  return title;
}

function parseTrack(filename: string) {
  const cleaned = cleanTitle(filename);

  const parts = cleaned.split(" - ");

  if (parts.length >= 2) {
    const first = parts[0].trim();
    const second = parts.slice(1).join(" - ").trim();

    /*
     * Most of your files follow:
     *
     * Artist - Song
     *
     * But some YouTube titles use:
     *
     * Song - Artist
     *
     * Handle the common "I ADORE YOU" case.
     */
    if (
      first.toLowerCase().includes("i adore you")
    ) {
      return {
        title: "I Adore You",
        artist: second.replace(
          /\s*ft\.\s*Daecolm$/i,
          " ft. Daecolm"
        ),
      };
    }

    return {
      title: second,
      artist: first,
    };
  }

  return {
    title: cleaned,
    artist: "Unknown Artist",
  };
}

export async function GET() {
  try {
    const musicDirectory = path.join(
      process.cwd(),
      "public",
      "music"
    );

    const files = fs
      .readdirSync(musicDirectory)
      .filter((file) =>
        file.toLowerCase().endsWith(".mp3")
      )
      .sort((a, b) =>
        a.localeCompare(b)
      );

    const tracks = files.map((filename, index) => {
      const parsed = parseTrack(filename);

      return {
        id: `local-${index}-${filename}`,
        title: parsed.title,
        artist: parsed.artist,
        album: parsed.title,
        src: `/music/${encodeURIComponent(filename)}`,
        cover: "",
      };
    });

    return NextResponse.json(tracks);
  } catch (error) {
    console.error(
      "Failed to scan music directory:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to load music library",
      },
      {
        status: 500,
      }
    );
  }
}