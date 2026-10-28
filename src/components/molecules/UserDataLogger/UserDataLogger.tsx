"use client";

import React from "react";

import { useAE } from "@/contexts/AEProvider";
import { useAppleMusic } from "@/contexts/AppleMusicProvider";
import { useAppStore } from "@/store/AppStore";
import { AEService } from "@/types/ae";
import { spotifyApi } from "@/utils/spotify";
import { checkSuperFan, FanType } from "@/utils/superfan";

interface SpotifyUserData {
  profile?: Record<string, unknown>;
  topTracks?: Record<string, unknown>;
  playlists?: Record<string, unknown>;
  currentlyPlaying?: Record<string, unknown>;
  recentlyPlayed?: Record<string, unknown>;
  savedTracks?: Record<string, unknown>;
  followedArtists?: Record<string, unknown>;
  savedAlbums?: Record<string, unknown>;
}

const UserDataLogger: React.FC = () => {
  const { user, libraryLoaded, getServiceToken } = useAE();
  const { isReady: isAppleReady } = useAppleMusic();
  const appState = useAppStore();
  const [spotifyData, setSpotifyData] = React.useState<SpotifyUserData>({});
  const [isSuperfan, setIsSuperfan] = React.useState<boolean | null>(null);
  const [dataLogged, setDataLogged] = React.useState(false);

  const fetchSpotifyData = React.useCallback(async () => {
    const token = getServiceToken(AEService.SPOTIFY);
    if (!token) return;

    spotifyApi.setAccessToken(token);
    const data: SpotifyUserData = {};

    try {
      const profile = await spotifyApi.getMe();
      data.profile = profile.body as unknown as Record<string, unknown>;

      const topTracks = await spotifyApi.getMyTopTracks({
        limit: 10,
        time_range: "medium_term",
      });
      data.topTracks = topTracks.body as unknown as Record<string, unknown>;

      const playlists = await spotifyApi.getUserPlaylists({ limit: 10 });
      data.playlists = playlists.body as unknown as Record<string, unknown>;

      try {
        const currentlyPlaying = await spotifyApi.getMyCurrentPlayingTrack();
        data.currentlyPlaying = currentlyPlaying.body as unknown as Record<
          string,
          unknown
        >;
      } catch {}

      const recentlyPlayed = await spotifyApi.getMyRecentlyPlayedTracks({
        limit: 10,
      });
      data.recentlyPlayed = recentlyPlayed.body as unknown as Record<
        string,
        unknown
      >;

      const savedTracks = await spotifyApi.getMySavedTracks({ limit: 10 });
      data.savedTracks = savedTracks.body as unknown as Record<string, unknown>;

      const followedArtists = await spotifyApi.getFollowedArtists({
        limit: 10,
      });
      data.followedArtists = followedArtists.body as unknown as Record<
        string,
        unknown
      >;

      const savedAlbums = await spotifyApi.getMySavedAlbums({ limit: 10 });
      data.savedAlbums = savedAlbums.body as unknown as Record<string, unknown>;

      setSpotifyData(data);

      checkSuperFan(
        (fanType: FanType) => {
          setIsSuperfan(fanType === FanType.SUPERFAN);
        },
        (error) => {
          console.error("Failed to check superfan status:", error);
          setIsSuperfan(false);
        },
      );
    } catch (error) {
      console.error("Error fetching Spotify data:", error);
    }
  }, [getServiceToken]);

  React.useEffect(() => {
    if (!user || dataLogged) return;

    if (!libraryLoaded) return;

    const logUserData = async () => {
      console.group("🎵 ========== AUTHENTICATED USER DATA ========== 🎵");

      const spotifyToken = getServiceToken(AEService.SPOTIFY);
      if (spotifyToken) {
        await fetchSpotifyData();
      }

      if (spotifyToken && isSuperfan !== null) {
        console.group("🌟 SUPERFAN STATUS 🌟");
        console.log(
          `%c${isSuperfan ? "✅ USER IS A DOJA CAT SUPERFAN!" : "❌ User is NOT a superfan"}`,
          `color: ${isSuperfan ? "#1DB954" : "#FF6B6B"}; font-size: 16px; font-weight: bold;`,
        );
        console.log("Superfan criteria: 2+ Doja Cat tracks in top 50 songs");
        console.groupEnd();
      }

      console.group("📱 Appreciation Engine (AE) Data");
      console.log("Full User Object:", user);

      if (user?.data) {
        console.group("User Profile");
        console.table({
          "First Name": user.data.FirstName,
          Email: user.data.Email,
          Username: user.data.Username,
          Country: user.data.Country,
          "Country Code": user.data.CountryCode,
          City: user.data.GeoCity,
          Region: user.data.GeoRegion,
          Gender: user.data.Gender,
          "User ID": user.data.ID,
          UUID: user.data.Extended?.uuid,
          "Access Token": user.data.AccessToken,
          "Avatar URL": user.data.AvatarURL,
        });
        console.groupEnd();
      }

      if (user?.services && user.services.length > 0) {
        console.group("Connected Services");
        user.services.forEach((service) => {
          console.group(`Service: ${service.Service}`);
          console.table({
            "Service ID": service.ServiceID,
            "User ID": service.UserID,
            Username: service.Username,
            "User URL": service.UserURL,
            Token: service.Token,
            "Token Secret": service.TokenSecret,
            Valid: service.Valid,
            "Activity Sharing": service.ActivitySharing,
            "Verified Email": service.VerifiedEmail,
            "Paid Account": service.PaidAccount,
            Followers: service.Followers,
            Likes: service.Likes,
            "Last Updated": service.LastUpdated,
            "Last Login": service.LastLogin,
            "Partner Code": service.PartnerCode,
            "Partner ID": service.PartnerID,
            Domains: service.Domains?.join(", "),
          });
          console.groupEnd();
        });
        console.groupEnd();
      }

      if (user?.jwt) {
        console.group("Authentication");
        console.log("JWT Token:", user.jwt);
        console.log("Auth Token:", user.auth_token);
        console.groupEnd();
      }

      if (user?.optins) {
        console.group("Opt-ins");
        console.log("Opt-ins:", user.optins);
        console.groupEnd();
      }
      console.groupEnd();

      /* eslint-disable @typescript-eslint/no-explicit-any */
      if (spotifyToken && Object.keys(spotifyData).length > 0) {
        console.group("🎵 Spotify Data");

        if (spotifyData.profile) {
          const profile = spotifyData.profile as any;
          console.group("Spotify Profile");
          console.table({
            "Display Name": profile.display_name,
            Email: profile.email,
            Country: profile.country,
            Product: profile.product,
            Followers: profile.followers?.total,
            ID: profile.id,
            URI: profile.uri,
            "External URL": profile.external_urls?.spotify,
          });
          console.groupEnd();
        }

        if (spotifyData.topTracks?.items) {
          const topTracks = spotifyData.topTracks as any;
          console.group("Top Tracks (Medium Term, Top 50)");
          const tracks = topTracks.items
            .slice(0, 50)
            .map((track: any, idx: number) => ({
              Rank: idx + 1,
              Track: track.name,
              "Artist(s)": track.artists.map((a: any) => a.name).join(", "),
              Album: track.album?.name,
              Popularity: track.popularity,
              Duration: `${Math.floor((track.duration_ms || 0) / 60000)}:${String(Math.floor(((track.duration_ms || 0) % 60000) / 1000)).padStart(2, "0")}`,
              Id: track.id,
            }));
          console.table(tracks);
          console.groupEnd();
        }

        if (spotifyData.playlists?.items) {
          const playlistData = spotifyData.playlists as any;
          console.group("User Playlists");
          const playlists = playlistData.items.map((playlist: any) => ({
            Name: playlist.name,
            Tracks: playlist.tracks.total,
            Public: playlist.public,
            Collaborative: playlist.collaborative,
            Owner: playlist.owner.display_name,
          }));
          console.table(playlists);
          console.groupEnd();
        }

        if (
          spotifyData.currentlyPlaying &&
          (spotifyData.currentlyPlaying as any).item
        ) {
          const currentlyPlaying = spotifyData.currentlyPlaying as any;
          console.group("Currently Playing");
          const track = currentlyPlaying.item;
          console.table({
            Track: track.name,
            "Artist(s)": track.artists?.map((a: any) => a.name).join(", "),
            Album: track.album?.name,
            Playing: currentlyPlaying.is_playing,
            Progress: `${Math.floor(currentlyPlaying.progress_ms / 1000)}s / ${Math.floor(track.duration_ms / 1000)}s`,
          });
          console.groupEnd();
        }

        if (spotifyData.recentlyPlayed?.items) {
          const recentlyPlayed = spotifyData.recentlyPlayed as any;
          console.group("Recently Played");
          const recent = recentlyPlayed.items.slice(0, 5).map((item: any) => ({
            Track: item.track.name,
            "Artist(s)": item.track.artists.map((a: any) => a.name).join(", "),
            "Played At": new Date(item.played_at).toLocaleString(),
          }));
          console.table(recent);
          console.groupEnd();
        }

        if ((spotifyData.followedArtists as any)?.artists?.items) {
          const followedArtists = spotifyData.followedArtists as any;
          console.group("Followed Artists");
          const artists = followedArtists.artists.items.map((artist: any) => ({
            Name: artist.name,
            Genres: artist.genres.join(", "),
            Popularity: artist.popularity,
            Followers: artist.followers.total,
          }));
          console.table(artists);
          console.groupEnd();
        }

        if (spotifyData.savedTracks?.items) {
          const savedTracks = spotifyData.savedTracks as any;
          console.group("Saved Tracks (Sample)");
          const saved = savedTracks.items.slice(0, 5).map((item: any) => ({
            Track: item.track.name,
            "Artist(s)": item.track.artists.map((a: any) => a.name).join(", "),
            "Added At": new Date(item.added_at).toLocaleString(),
          }));
          console.table(saved);
          console.log(`Total saved tracks: ${savedTracks.total}`);
          console.groupEnd();
        }

        if (spotifyData.savedAlbums?.items) {
          const savedAlbums = spotifyData.savedAlbums as any;
          console.group("Saved Albums (Sample)");
          const albums = savedAlbums.items.slice(0, 5).map((item: any) => ({
            Album: item.album.name,
            "Artist(s)": item.album.artists.map((a: any) => a.name).join(", "),
            Tracks: item.album.total_tracks,
            "Release Date": item.album.release_date,
            "Added At": new Date(item.added_at).toLocaleString(),
          }));
          console.table(albums);
          console.log(`Total saved albums: ${savedAlbums.total}`);
          console.groupEnd();
        }

        console.log("Full Spotify Data Object:", spotifyData);
        console.groupEnd();
      }
      /* eslint-enable @typescript-eslint/no-explicit-any */

      console.group("🍎 Apple Music");
      console.log("Apple Music Ready:", isAppleReady);
      console.log("Auth Provider:", appState.authProvider);
      if (appState.authProvider === "apple") {
        console.log("User authenticated with Apple Music");
        console.log(
          "Note: Apple Music API provides limited user data through web SDK",
        );
      }
      console.groupEnd();

      console.group("📊 App State");
      console.table({
        "Auth Provider": appState.authProvider,
        "Is Superfan": appState.isSuperfan,
        "Audio Muted": appState.audioMuted,
      });
      console.groupEnd();

      console.group("⚙️ Environment");
      console.table({
        "AE Library Loaded": libraryLoaded,
        "Apple Music Ready": isAppleReady,
        "Spotify Token Available": !!spotifyToken,
        Environment: process.env.NODE_ENV,
      });
      console.groupEnd();

      console.groupEnd(); // End main group

      console.log(
        "%c📝 Developer Note: This data is only visible to authenticated users. " +
          "Gated access is enforced - no data is logged for non-authenticated sessions.",
        "color: #666; font-style: italic;",
      );

      setDataLogged(true);
    };

    // Small delay to ensure all data is loaded
    setTimeout(logUserData, 1000);
  }, [
    user,
    libraryLoaded,
    isAppleReady,
    getServiceToken,
    appState,
    spotifyData,
    isSuperfan,
    dataLogged,
    fetchSpotifyData,
  ]);

  React.useEffect(() => {
    const spotifyToken = getServiceToken(AEService.SPOTIFY);
    if (spotifyToken && Object.keys(spotifyData).length === 0) {
      fetchSpotifyData();
    }
  }, [getServiceToken, spotifyData, fetchSpotifyData]);

  return null;
};

export default UserDataLogger;
