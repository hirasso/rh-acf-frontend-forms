/**
 * Copy this template to acf-autofill-values.js, then edit it's contents
 */

const values = [
  {
    date: new Date(2018, 7, 1),
    from: new Date(2018, 7, 1, 19, 30),
    until: new Date(2018, 7, 1, 22, 15),
    artist_location: "217",
    city: "NYC",
    artist_name: " Princess Nokia",
    sex: "149",
    genres: [{ artist_genre: "405" }, { artist_genre: "406" }],
    label_type: "indie",
    label_indie: "not warner ;)",
    im_the_artist: true,
    music_accounts: [{ link: "https://soundcloud.com/princessnokia92" }],
    social_accounts: [{ link: "https://www.facebook.com/princessnokia92/" }],
    message:
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non",
    email: "mail@rassohilber.com",
    phone: "+4917620020805",
  },
];

export default values;
window.acfAutofillValues = values;
