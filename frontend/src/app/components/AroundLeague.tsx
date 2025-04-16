"use client"

import { $standings } from "@/lib/store";
import { useStore } from "@nanostores/react";
import React, { useState, useEffect } from "react";
import { Team, Division } from "@/data/types";
import useQueryLeague from "../hooks/use-query-league";

// const standingsData = [
//   {
//     team: "York Revolution",
//     wins: 80,
//     losses: 45,
//     pct: 0.64,
//     streak: "5W",
//     last10: "7-3",
//   },
//   {
//     team: "Lancaster Stormers",
//     wins: 71,
//     losses: 55,
//     pct: 0.563,
//     streak: "1W",
//     last10: "6-4",
//   },
//   {
//     team: "Long Island Ducks",
//     wins: 64,
//     losses: 62,
//     pct: 0.508,
//     streak: "6L",
//     last10: "3-7",
//   },
//   {
//     team: "Staten Island FerryHawks",
//     wins: 55,
//     losses: 69,
//     pct: 0.444,
//     streak: "1L",
//     last10: "6-4",
//   },
//   {
//     team: "Hagerstown Flying Boxcars",
//     wins: 36,
//     losses: 89,
//     pct: 0.288,
//     streak: "3L",
//     last10: "2-8",
//   },
//   {
//     team: "Gastonia Baseball Club",
//     wins: 83,
//     losses: 43,
//     pct: 0.659,
//     streak: "2W",
//     last10: "6-4",
//   },
//   {
//     team: "High Point Rockers",
//     wins: 74,
//     losses: 52,
//     pct: 0.587,
//     streak: "6W",
//     last10: "8-2",
//   },
//   {
//     team: "Charleston Dirty Birds",
//     wins: 69,
//     losses: 57,
//     pct: 0.548,
//     streak: "2L",
//     last10: "2-8",
//   },
//   {
//     team: "Southern Maryland Blue Crabs",
//     wins: 53,
//     losses: 72,
//     pct: 0.424,
//     streak: "2L",
//     last10: "3-7",
//   },
//   {
//     team: "Lexington Legends",
//     wins: 42,
//     losses: 83,
//     pct: 0.336,
//     streak: "2W",
//     last10: "7-3",
//   },
// ];



const AroundLeague = () => {
  const { loadStandings } = useQueryLeague();

  const [standingsData, setStandingsData] = useState<Division[]>([]);
  const [year, setYear] = useState("2025");
  const [view, setView] = useState("Overall");
  const [lastUpdated, setLastUpdated] = useState("");
  const allStandingsData = useStore($standings);

  useEffect(() => {
    if (allStandingsData?.standings?.conference) {
      // console.log(view.toUpperCase());
      const data = allStandingsData.standings.conference.find(
        (conf) => conf.name === view.toUpperCase()
      );

      console.log(data)

      const sortedDivisions = data?.division.map((division) => ({
        ...division,
        team: [...division.team].sort(
          (a, b) => parseFloat(b.pct) - parseFloat(a.pct)
        )
      })) ?? [];

      setStandingsData(sortedDivisions);
      setYear(allStandingsData.year);
      setLastUpdated(allStandingsData.updatedAt);
    }
  }, [allStandingsData, view]);

  useEffect(() => {
    loadStandings();
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md border border-gray-300">
      <h2 className="text-2xl font-bold mb-4 text-center text-alpbBlue">
        Standings
      </h2>
      <div>
      {standingsData.map((division) => (
        <table className="min-w-full border-collapse">
          <thead className="bg-alpbBlue text-white">
            <tr>
              <th className="border border-gray-300 p-2">Team</th>
              <th className="border border-gray-300 p-2">W</th>
              <th className="border border-gray-300 p-2">L</th>
              <th className="border border-gray-300 p-2">PCT</th>
              <th className="border border-gray-300 p-2">Streak</th>
              <th className="border border-gray-300 p-2">Last 10</th>
            </tr>
          </thead>
          <tbody>
            {division.team.map((team, index) => (
              <tr key={index} className="hover:bg-gray-100">
                <td className="border border-gray-300 p-2">{team.teamname}</td>
                <td className="border border-gray-300 p-2">{team.wins}</td>
                <td className="border border-gray-300 p-2">{team.losses}</td>
                <td className="border border-gray-300 p-2">{team.pct}</td>
                <td className="border border-gray-300 p-2">{team.streak}</td>
                <td className="border border-gray-300 p-2">{team.last10}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ))}
      </div>
    </div>
  );
};

export default AroundLeague;
