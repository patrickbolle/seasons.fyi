import "./App.css";
import { useEffect, useState } from "react";
import axios from "axios";
const SpotifyWebApi = require("spotify-web-api-node");
var spotifyApi = new SpotifyWebApi();

function App() {
  const [token, setToken] = useState("");
  const [winterResults, setWinterResults] = useState([]);
  const [springResults, setSpringResults] = useState([]);
  const [summerResults, setSummerResults] = useState([]);
  const [autumnResults, setAutumnResults] = useState([]);

  let apiOffset = 0;
  let allLikedTracks = [];
  const fetchFunction = async (e) => {
    if (!localStorage.getItem("allLikedTracks")) {
      spotifyApi
        .getMySavedTracks({
          limit: 50,
          offset: apiOffset,
        })
        .then(
          function (data) {
            console.log("Done!");
            const actualTracks = data.body.items;
            console.log(actualTracks);
            const cleanedTracks = actualTracks.map((track) => {
              return {
                date: track.added_at,
                artists: track.track.artists,
              };
            });
            console.log(cleanedTracks);
            if (cleanedTracks.length > 0) {
              allLikedTracks.push(...cleanedTracks);
              apiOffset = apiOffset + 50;
              fetchFunction();
            } else {
              console.log(allLikedTracks);
              localStorage.setItem(
                "allLikedTracks",
                JSON.stringify(allLikedTracks)
              );
              console.log(
                "Fetch is complete! A total of " +
                  allLikedTracks.length +
                  " liked songs were found."
              );
              processSongs();
            }
          },
          function (err) {
            console.log("Something went wrong!", err);
          }
        );
    } else {
      console.log("Found songs in local storage, go to process them now");
      processSongs();
    }
  };

  function processSongs() {
    console.log(JSON.parse(localStorage.getItem("allLikedTracks")));
    const allLikedTracks = JSON.parse(localStorage.getItem("allLikedTracks"));
    // this gives an object with dates as keys
    const groups = allLikedTracks.reduce((groups, track) => {
      const date = track.date.split("T")[0].split("-")[1];
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(track);
      return groups;
    }, {});

    // Edit: to add it in the array format instead
    const groupArrays = Object.keys(groups).map((date) => {
      return {
        date,
        tracks: groups[date],
      };
    });

    const winterFilter = groupArrays.filter(
      (group) => group.date == "12" || group.date == "01" || group.date == "02"
    );

    const springFilter = groupArrays.filter(
      (group) => group.date == "03" || group.date == "04" || group.date == "05"
    );

    const summerFilter = groupArrays.filter(
      (group) => group.date == "06" || group.date == "07" || group.date == "08"
    );
    const autumnFilter = groupArrays.filter(
      (group) => group.date == "09" || group.date == "10" || group.date == "11"
    );

    let winterCombined = winterFilter.map((e) => Object.values(e));
    winterCombined = [
      ...winterCombined[0][1],
      ...winterCombined[1][1],
      ...winterCombined[2][1],
    ];
    winterCombined = [
      ...winterCombined
        .reduce((mp, o) => {
          if (!mp.has(o.artists[0].name))
            mp.set(o.artists[0].name, { ...o, count: 0 });
          mp.get(o.artists[0].name).count++;
          return mp;
        }, new Map())
        .values(),
    ];

    winterCombined.sort((a, b) => parseFloat(b.count) - parseFloat(a.count));
    setWinterResults(winterCombined);

    // Spring array functions
    let springCombined = springFilter.map((e) => Object.values(e));
    springCombined = [
      ...springCombined[0][1],
      ...springCombined[1][1],
      ...springCombined[2][1],
    ];
    springCombined = [
      ...springCombined
        .reduce((mp, o) => {
          if (!mp.has(o.artists[0].name))
            mp.set(o.artists[0].name, { ...o, count: 0 });
          mp.get(o.artists[0].name).count++;
          return mp;
        }, new Map())
        .values(),
    ];

    springCombined.sort((a, b) => parseFloat(b.count) - parseFloat(a.count));
    setSpringResults(springCombined);

    // Summer array functions
    let summerCombined = summerFilter.map((e) => Object.values(e));
    summerCombined = [
      ...summerCombined[0][1],
      ...summerCombined[1][1],
      ...summerCombined[2][1],
    ];
    summerCombined = [
      ...summerCombined
        .reduce((mp, o) => {
          if (!mp.has(o.artists[0].name))
            mp.set(o.artists[0].name, { ...o, count: 0 });
          mp.get(o.artists[0].name).count++;
          return mp;
        }, new Map())
        .values(),
    ];

    summerCombined.sort((a, b) => parseFloat(b.count) - parseFloat(a.count));
    setSummerResults(summerCombined);

    // Autumn array functions
    let autumnCombined = autumnFilter.map((e) => Object.values(e));
    autumnCombined = [
      ...autumnCombined[0][1],
      ...autumnCombined[1][1],
      ...autumnCombined[2][1],
    ];
    autumnCombined = [
      ...autumnCombined
        .reduce((mp, o) => {
          if (!mp.has(o.artists[0].name))
            mp.set(o.artists[0].name, { ...o, count: 0 });
          mp.get(o.artists[0].name).count++;
          return mp;
        }, new Map())
        .values(),
    ];

    autumnCombined.sort((a, b) => parseFloat(b.count) - parseFloat(a.count));
    setAutumnResults(autumnCombined);
  }

  const renderResults = () => {};

  // Logout function
  const logout = () => {
    setToken("");
    window.localStorage.removeItem("token");
  };

  // Grab the current hash token and store it so we can use it later
  useEffect(() => {
    const hash = window.location.hash;
    let token = window.localStorage.getItem("token");

    if (!token && hash) {
      token = hash
        .substring(1)
        .split("&")
        .find((elem) => elem.startsWith("access_token"))
        .split("=")[1];

      window.location.hash = "";
      window.localStorage.setItem("token", token);
    }

    console.log(token);
    spotifyApi.setAccessToken(token);
    setToken(token);
  }, []);

  const scopes = ["user-top-read", "user-library-read"];

  return (
    <div className="App">
      <div className="navbar bg-base-100">
        <div className="flex-1">
          <a className="btn btn-ghost normal-case text-xl">seasons.fyi</a>
        </div>
        <div className="flex-none">
          <ul className="menu menu-horizontal p-0">
            <li>
              <a onClick={fetchFunction}>Fetch Data</a>
            </li>
            <li>
              <a
                href={`${process.env.REACT_APP_AUTH_ENDPOINT}?client_id=${
                  process.env.REACT_APP_CLIENT_ID
                }&redirect_uri=${
                  process.env.REACT_APP_REDIRECT_URI
                }&scope=${scopes.join("%20")}&response_type=${
                  process.env.REACT_APP_RESPONSE_TYPE
                }`}
              >
                Login to Spotify
              </a>
            </li>
            <li>
              <a onClick={logout}>Logout</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="grid grid-cols-4">
        <div className="h-screen bg-gradient-to-r from-cyan-500 to-blue-500">
          Winter
          {winterResults.map((result) => (
            <p key={result.date + "/" + result.artists[0].id}>
              {result.artists[0].name} / {result.count}
            </p>
          ))}
        </div>
        <div className="h-screen bg-gradient-to-r from-sky-500 to-indigo-500">
          Spring
          {springResults.map((result) => (
            <p key={result.date + "/" + result.artists[0].id}>
              {result.artists[0].name} / {result.count}
            </p>
          ))}
        </div>
        <div className="h-screen bg-gradient-to-r from-violet-500 to-fuchsia-500">
          Summer
          {summerResults.map((result) => (
            <p key={result.date + "/" + result.artists[0].id}>
              {result.artists[0].name} / {result.count}
            </p>
          ))}
        </div>
        <div className="h-screen bg-gradient-to-r from-purple-500 to-pink-500">
          Autumn
          {autumnResults.map((result) => (
            <p key={result.date + "/" + result.artists[0].id}>
              {result.artists[0].name} / {result.count}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
