import SpotifyWebApi from "spotify-web-api-node";

// Data attribute for AE library to recognize Spotify login buttons
export const SPOTIFY_BTN_DATA_ATTRIBUTE = {
  "data-ae-register-link": "spotify",
};

export type SpotifyErrorResponse = string | unknown;

export enum SpotifyApiError {
  EXPIRED = "The access token expired.",
}

const ERROR_SEPARATOR = "Details: ";

export const SPOTIFY_PLAYLIST_URL = "https://open.spotify.com/playlist/";

export const getSpotifyErrorMessage = (error: SpotifyErrorResponse) => {
  const errorString = String(error).split(
    ERROR_SEPARATOR,
  )[1] as SpotifyApiError;

  switch (errorString) {
    case SpotifyApiError.EXPIRED:
      return "Your Spotify session has expired. Please log in again.";
    default:
      return "An error occurred with Spotify. Please try again.";
  }
};

export const openPlaylist = (playlistId: string) => {
  const url = `${SPOTIFY_PLAYLIST_URL}${playlistId}`;
  const link = document.createElement("a");
  link.target = "_blank";
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return url;
};

export const spotifyApi = new SpotifyWebApi();
