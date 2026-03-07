import dbClient from "../../../db";
import { NextResponse } from "next/server";
import axios from "axios";
import { findLongestWord } from "./../../tools/func";
import { searchAndPrintLastChars } from "./../../../getodd";

type GameEvent = {
  id: string;
  hometeam: string;
  awayteam: string;
  homeodd: string;
  awayodd: string;
  drawodd: string;
  Esd: string;
};

type StageGames = {
  id: string;
  titleCountry: string;
  subtitle: string;
  events: GameEvent[];
};

//scraps matches details from a source and align
// them well and save in db. this is done for 7
// days of the week on a first request of the day
export async function GET(request: Request) {
  const dd = await request;
  const url = new URL(dd.url);
  const date = url.searchParams.get("date");

  try {
    let givenDate = parseInt(date!);
    if (givenDate > 7) {
      givenDate = 0;
    }
    //get today's date
    const today = new Date();
    const i = givenDate;
    //The particular day
    const nex = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
    //uses West African Time
    const options = { timeZone: "Africa/Lagos" };
    //Breaks date data to a list [2024, 04, 02]
    const dateLst = nex.toLocaleDateString("en-US", options).split("/");
    //Adds a 0 for dates that has one digit
    if (dateLst[0].length === 1) {
      dateLst[0] = "0" + dateLst[0];
    }
    if (dateLst[1].length === 1) {
      dateLst[1] = "0" + dateLst[1];
    }
    const date_ = dateLst[2] + dateLst[0] + dateLst[1];
    const sGames = await dbClient
      .db()
      .then((db) => db.collection("dates_games").findOne({ date: date_ }));

    const oddLst: StageGames[] = [];
    if (!sGames) {
      //scrap the matches data
      const response = await axios.get(
        `https://prod-public-api.livescore.com/v1/api/app/date/soccer/${date_}/1?countryCode=NG&locale=en&MD=1`,
      );
      const gamesJson = response.data;
      // extract details for all events that is active
      const gjLen = gamesJson.Stages.length;
      let eventDit: {
        id: string;
        titleCountry: string;
        subtitle: string;
        events: {
          id: string;
          hometeam: string;
          awayteam: string;
          homeodd: string;
          awayodd: string;
          drawodd: string;
          Esd: string;
        }[];
      } = {
        id: "",
        titleCountry: "",
        subtitle: "",
        events: [],
      };
      for (let i = 0; i < gjLen; i++) {
        const evtLen = gamesJson.Stages[i].Events.length;
        eventDit["id"] = i.toString();
        eventDit["titleCountry"] = gamesJson.Stages[i].Cnm;
        eventDit["subtitle"] = gamesJson.Stages[i].Snm;
        eventDit["events"] = [];
        for (let j = 0; j < evtLen; j++) {
          if (gamesJson.Stages[i].Events[j].Eps === "NS") {
            const Edt: {
              id: string;
              hometeam: string;
              awayteam: string;
              homeodd: string;
              awayodd: string;
              drawodd: string;
              Esd: string;
            } = {
              id: "",
              hometeam: "",
              awayteam: "",
              homeodd: "",
              awayodd: "",
              drawodd: "",
              Esd: "",
            };
            if (givenDate === 0) {
              const hr1 = today.getHours();
              const mn1 = today.getMinutes();
              const hr2 = parseInt(
                gamesJson.Stages[i].Events[j].Esd.toString().substring(8, 10),
              );
              const mn2 = parseInt(
                gamesJson.Stages[i].Events[j].Esd.toString().substring(10, 12),
              );
              if (hr2 > hr1) {
                Edt["id"] = j.toString();
                Edt["hometeam"] = gamesJson.Stages[i].Events[j].T1[0].Nm;
                Edt["awayteam"] = gamesJson.Stages[i].Events[j].T2[0].Nm;

                const Team1 = `${gamesJson.Stages[i].Events[j].T1[0].Nm}`;
                const Team2 = `${gamesJson.Stages[i].Events[j].T2[0].Nm}`;
                const Team1L = findLongestWord(Team1);
                const Team2L = findLongestWord(Team2);
                const bothTeam = `${Team1L}=${Team2L}`;
                const oddG = await searchAndPrintLastChars(
                  bothTeam,
                  "output.txt",
                );
                if (oddG !== "") {
                  const splitStr = oddG.split(" ").reverse();
                  Edt["homeodd"] = splitStr[2];
                  Edt["drawodd"] = splitStr[1];
                  Edt["awayodd"] = splitStr[0];
                } else {
                  Edt["homeodd"] = "1.7";
                  Edt["drawodd"] = "3.1";
                  Edt["awayodd"] = "1.8";
                }

                Edt["Esd"] = gamesJson.Stages[i].Events[j].Esd.toString();
                eventDit["events"].push(Edt);
              }
              if (hr2 === hr1) {
                if (mn2 > mn1) {
                  Edt["id"] = j.toString();
                  Edt["hometeam"] = gamesJson.Stages[i].Events[j].T1[0].Nm;
                  Edt["awayteam"] = gamesJson.Stages[i].Events[j].T2[0].Nm;

                  const Team1 = `${gamesJson.Stages[i].Events[j].T1[0].Nm}`;
                  const Team2 = `${gamesJson.Stages[i].Events[j].T2[0].Nm}`;
                  const Team1L = findLongestWord(Team1);
                  const Team2L = findLongestWord(Team2);
                  const bothTeam = `${Team1L}=${Team2L}`;
                  const oddG: string = await searchAndPrintLastChars(
                    bothTeam,
                    "output.txt",
                  );
                  if (oddG !== "") {
                    const splitStr = oddG.split(" ").reverse();
                    Edt["homeodd"] = splitStr[2];
                    Edt["drawodd"] = splitStr[1];
                    Edt["awayodd"] = splitStr[0];
                  } else {
                    Edt["homeodd"] = "1.7";
                    Edt["drawodd"] = "3.1";
                    Edt["awayodd"] = "1.8";
                  }

                  Edt["Esd"] = gamesJson.Stages[i].Events[j].Esd.toString();
                  eventDit["events"].push(Edt);
                }
              }
            } else {
              Edt["id"] = j.toString();
              Edt["hometeam"] = gamesJson.Stages[i].Events[j].T1[0].Nm;
              Edt["awayteam"] = gamesJson.Stages[i].Events[j].T2[0].Nm;

              const Team1 = `${gamesJson.Stages[i].Events[j].T1[0].Nm}`;
              const Team2 = `${gamesJson.Stages[i].Events[j].T2[0].Nm}`;
              const Team1L = findLongestWord(Team1);
              const Team2L = findLongestWord(Team2);
              const bothTeam = `${Team1L}=${Team2L}`;
              const oddG: string = await searchAndPrintLastChars(
                bothTeam,
                "output.txt",
              );
              if (oddG !== "") {
                const splitStr = oddG.split(" ").reverse();
                Edt["homeodd"] = splitStr[2];
                Edt["drawodd"] = splitStr[1];
                Edt["awayodd"] = splitStr[0];
              } else {
                Edt["homeodd"] = "1.7";
                Edt["drawodd"] = "3.1";
                Edt["awayodd"] = "1.8";
              }
              Edt["Esd"] = gamesJson.Stages[i].Events[j].Esd.toString();
              eventDit["events"].push(Edt);
            }
          }
        }
        if (eventDit.events.length > 0) {
          oddLst.push(eventDit);
        }
        eventDit = {} as {
          id: string;
          titleCountry: string;
          subtitle: string;
          events: {
            id: string;
            hometeam: string;
            awayteam: string;
            homeodd: string;
            awayodd: string;
            drawodd: string;
            Esd: string;
          }[];
        };
      }
      //Save data to db
      await dbClient.db().then((db) =>
        db.collection("dates_games").insertOne({
          date: date_,
          games: oddLst,
        }),
      );
    }
    const dates: { date: string; indent: number }[] = [];
    const todayy = new Date();

    for (let i = 0; i <= 7; i++) {
      const date = new Date(todayy);
      date.setDate(date.getDate() + i);
      const dateString = date.toISOString().split("T")[0];

      dates.push({ date: dateString, indent: i });
    }
    const rem = [];
    if (sGames) {
      const sGamesC = [...sGames.games];
      let evtDit: {
        id: string;
        titleCountry: string;
        subtitle: string;
        events: {
          id: string;
          hometeam: string;
          awayteam: string;
          homeodd: string;
          awayodd: string;
          drawodd: string;
          Esd: string;
        }[];
      } = {
        id: "",
        titleCountry: "",
        subtitle: "",
        events: [],
      };
      const ggameslen = sGamesC.length;
      for (let i = 0; i < ggameslen; i++) {
        evtDit["id"] = sGamesC[i].id;
        evtDit["titleCountry"] = sGamesC[i].titleCountry;
        evtDit["subtitle"] = sGamesC[i].subtitle;
        evtDit["events"] = [];
        const gevtlen = sGamesC[i].events.length;
        for (let j = 0; j < gevtlen; j++) {
          const Edt: {
            id: string;
            hometeam: string;
            awayteam: string;
            homeodd: string;
            awayodd: string;
            drawodd: string;
            Esd: string;
          } = {
            id: "",
            hometeam: "",
            awayteam: "",
            homeodd: "",
            awayodd: "",
            drawodd: "",
            Esd: "",
          };
          const hr1 = today.getHours();
          const mn1 = today.getMinutes();
          const hr2 = parseInt(
            sGamesC[i].events[j].Esd.toString().substring(8, 10),
          );
          const mn2 = parseInt(
            sGamesC[i].events[j].Esd.toString().substring(10, 12),
          );
          if (hr2 > hr1) {
            Edt["id"] = sGamesC[i].events[j].id;
            Edt["hometeam"] = sGamesC[i].events[j].hometeam;
            Edt["awayteam"] = sGamesC[i].events[j].awayteam;
            Edt["homeodd"] = sGamesC[i].events[j].homeodd;
            Edt["drawodd"] = sGamesC[i].events[j].drawodd;
            Edt["awayodd"] = sGamesC[i].events[j].awayodd;
            Edt["Esd"] = sGamesC[i].events[j].Esd;
            evtDit["events"].push(Edt);
          }
          if (hr2 === hr1) {
            if (mn2 > mn1) {
              Edt["id"] = sGamesC[i].events[j].id;
              Edt["hometeam"] = sGamesC[i].events[j].hometeam;
              Edt["awayteam"] = sGamesC[i].events[j].awayteam;
              Edt["homeodd"] = sGamesC[i].events[j].homeodd;
              Edt["drawodd"] = sGamesC[i].events[j].drawodd;
              Edt["awayodd"] = sGamesC[i].events[j].awayodd;
              Edt["Esd"] = sGamesC[i].events[j].Esd;
              evtDit["events"].push(Edt);
            }
          }
        }
        if (evtDit.events.length > 0) {
          rem.push(evtDit);
        }
        evtDit = {} as {
          id: string;
          titleCountry: string;
          subtitle: string;
          events: {
            id: string;
            hometeam: string;
            awayteam: string;
            homeodd: string;
            awayodd: string;
            drawodd: string;
            Esd: string;
          }[];
        };
      }
    }

    return NextResponse.json(
      {
        date: date_,
        datee: dates,
        games: oddLst.length === 0 && sGames ? rem : oddLst,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("GET /api/getgames error:", error);

    return NextResponse.json(
      {
        message: "error fetching data",
        error: error?.message || error,
        stack: error?.stack || null,
      },
      { status: 500 },
    );
  }
}
