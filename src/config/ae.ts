const segmentID = "2392739";

export const environment = {
  aeLibrary: `https://sme.theappreciationengine.com/framework/js/492?segment=${segmentID}`,
  returnUrl: typeof window !== "undefined" ? window.location.origin : "",
  presave: {
    spotifyUrl:
      "https://presaves.sonymusicfans.com/?campaign_id=644231&mailing_list_ids=a0S61000001YplPEAS&triggered_sends=&retargeting_consent=0&source_channel=Spotify",
  },
  crm: {
    form: "644231",
    mailingList: "a0S61000001YplPEAS",
    submitUrl: "https://subs.sonymusicfans.com/submit",
    activities: {
      spotify: '{"actions":{"presave":184316}}',
    },
    activitiesOptin: {
      spotify:
        '{"actions":{"presave":184316},"mailing_list_optins":{"a0S61000001YplPEAS":184320}}',
    },
    brandId: "3443735",
    segmentId: segmentID,
  },
  scopes: {
    spotify:
      "playlist-modify-private playlist-modify-public user-follow-modify user-library-read user-read-email user-top-read",
  },
  aeTimeoutDuration: 5000,
};
