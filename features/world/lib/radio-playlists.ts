// The magazine's Spotify playlists, one per issue. Tracking parameters from the
// copied share links (si, utm_source, pi) are dropped: they identify the person
// who copied the link and do nothing for the visitor.
//
// `position` is the CSS object-position that crops the portrait photograph to
// its square: it keeps the face in frame.
export const radioPlaylists: readonly {
  label: string;
  href: string;
  image: string;
  alt: string;
  position: string;
}[] = [
  {
    label: "FIRST ISSUE",
    href: "https://open.spotify.com/playlist/0ObjlLTIOP5tu9dFXYsCEp",
    image: "/world/radio-first-issue.webp",
    alt: "A model in a SWAMP shirt standing in a doorway",
    position: "50% 55%",
  },
  {
    label: "STANDARD ISSUE",
    href: "https://open.spotify.com/playlist/2QXVz89w8mY2EES1aqFvky",
    image: "/world/radio-standard-issue.webp",
    alt: "A model in a brown tee on a couch",
    position: "40% 30%",
  },
];
