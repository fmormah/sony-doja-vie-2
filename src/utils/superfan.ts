import { spotifyApi, SpotifyErrorResponse } from "./spotify";

export enum FanType {
  REGULAR = "regular",
  SUPERFAN = "superfan",
}

interface Artist {
  id: string;
  name: string;
}

interface Track {
  id: string;
  name: string;
  artists: Artist[];
  popularity?: number;
  duration_ms?: number;
  album?: {
    name: string;
  };
}

interface TopTracksResponse {
  items: Track[];
}

interface UserProfile {
  display_name: string;
  country: string;
  id: string;
  followers?: {
    total: number;
  };
}

interface GetTopTracksOptions {
  time_range: "long_term" | "medium_term" | "short_term";
  limit: number;
}

const GET_TOP_OPTIONS: GetTopTracksOptions = {
  limit: 50,
  time_range: "medium_term",
};

const DOJA_CAT_ARTIST_ID = "5cj0lLjcoR7YOSnhnX0Po5";
const SUPERFAN_THRESHOLD = 2;

export const countDojaTracksInTopSongs = (artistsArray: Artist[][]): number => {
  let count = 0;
  for (const artists of artistsArray) {
    for (const artist of artists) {
      if (artist.id === DOJA_CAT_ARTIST_ID) {
        count++;
      }
    }
  }
  return count;
};

export const getSpotifyTopTracks = async (
  onSuccess: (data: TopTracksResponse) => void,
  onFailure: (error: SpotifyErrorResponse) => void,
): Promise<void> => {
  try {
    const fetchData = await spotifyApi.getMyTopTracks(GET_TOP_OPTIONS);
    const responseBody = fetchData.body as TopTracksResponse;

    if (!responseBody?.items || !Array.isArray(responseBody.items)) {
      onFailure("API response missing items array");
      return;
    }

    onSuccess(responseBody);
  } catch (error: unknown) {
    if (process.env.NODE_ENV === "development") {
      console.error("❌ BLANK TRACKS ISSUE: API request failed", String(error));
    }
    onFailure(error as SpotifyErrorResponse);
  }
};

export const getUserProfile = async (
  onSuccess: (profile: UserProfile) => void,
  onFailure: (error: SpotifyErrorResponse) => void,
): Promise<void> => {
  try {
    const fetchData = await spotifyApi.getMe();

    const userProfile: UserProfile = {
      ...fetchData.body,
      display_name: fetchData.body.display_name ?? "Unknown",
    };

    onSuccess(userProfile);
  } catch (error: unknown) {
    onFailure(error as SpotifyErrorResponse);
    if (process.env.NODE_ENV === "development") {
      console.error("Error fetching user profile:", error);
    }
  }
};

export const checkSuperFan = async (
  onSuccess: (fanType: FanType) => void,
  onFailure: (error: SpotifyErrorResponse) => void,
): Promise<void> => {
  getUserProfile(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (profile) => {},
    (error) => {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to get user profile:", error);
      }
    },
  );

  getSpotifyTopTracks((data) => {
    const trackArtists = data.items.map((track) => track.artists);
    const DOJA_CATTrackCount = countDojaTracksInTopSongs(trackArtists);
    const fanType =
      DOJA_CATTrackCount >= SUPERFAN_THRESHOLD
        ? FanType.SUPERFAN
        : FanType.REGULAR;

    if (process.env.NODE_ENV === "development") {
      console.log("🪩 Fan type determined:", fanType);
      try {
        const matchedTracks = data.items
          .filter((track) =>
            track.artists.some((artist) => artist.id === DOJA_CAT_ARTIST_ID),
          )
          .map((track) => ({
            Track: track.name,
            Artists: track.artists.map((a) => a.name).join(", "),
          }));

        console.groupCollapsed("🧮 Superfan computation (dev)");
        console.table({
          threshold: SUPERFAN_THRESHOLD,
          count: DOJA_CATTrackCount,
          meetsThreshold: DOJA_CATTrackCount >= SUPERFAN_THRESHOLD,
          timeRange: GET_TOP_OPTIONS.time_range,
          limit: GET_TOP_OPTIONS.limit,
        });
        console.groupEnd();

        console.group(
          "🎧 Spotify Top Tracks (" +
            GET_TOP_OPTIONS.time_range +
            ", limit " +
            GET_TOP_OPTIONS.limit +
            ")",
        );
        const topTracksTable = data.items.map((track, idx) => ({
          Rank: idx + 1,
          Track: track.name,
          Artists: track.artists.map((a) => a.name).join(", "),
          Album: track.album?.name,
          Popularity: track.popularity,
          Id: track.id,
        }));
        console.table(topTracksTable);
        console.groupEnd();
        if (matchedTracks.length > 0) {
          console.group("Matched Doja Cat tracks in your top songs");
          console.table(matchedTracks);
          console.groupEnd();
        } else {
          console.log("No Doja Cat tracks found in your top songs sample.");
        }
      } catch {
        // no-op for logging failures
      }
    }

    onSuccess(fanType);
  }, onFailure);
};
