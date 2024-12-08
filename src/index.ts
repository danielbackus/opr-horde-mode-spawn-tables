import fs from "fs/promises";
import path from "path";

import {
  ArmyBookResponse,
  ArmyBookSummaryResponse,
} from "./api/army-forge/api";
import { buildSpawnTables } from "./utils";
import { MOCK_ARMY_BOOK_RESPONSE, MOCK_ARMY_BOOK_SUMMARY_RESPONSE } from "./api/army-forge/mocks";

const GAME_SYSTEMS = {
  GRIMDARK_FUTURE: {
    ID: 2,
    NAME: "Grimdark Future",
    SLUG: "grimdark-future",
  },
  AGE_OF_FANTASY: {
    ID: 4,
    NAME: "Age of Fantasy",
    SLUG: "age-of-fantasy",
  }
};
const TIERS_BY_GAME_SYSTEM = {
  [GAME_SYSTEMS.GRIMDARK_FUTURE.ID]: [
    {
      roll: { min: 3, max: 4 },
      points: { min: 0, max: 100 },
    },
    {
      roll: { min: 5, max: 6 },
      points: { min: 105, max: 245 },
    },
    {
      roll: { min: 7, max: 9 },
      points: { min: 250, max: 395 },
    },
    {
      roll: { min: 10, max: Number.MAX_SAFE_INTEGER },
      points: { min: 400, max: Number.MAX_SAFE_INTEGER },
    },
  ],
  [GAME_SYSTEMS.AGE_OF_FANTASY.ID]: [
    {
      roll: { min: 3, max: 4 },
      points: { min: 0, max: 100 },
    },
    {
      roll: { min: 5, max: 6 },
      points: { min: 105, max: 245 },
    },
    {
      roll: { min: 7, max: 9 },
      points: { min: 250, max: 395 },
    },
    {
      roll: { min: 10, max: Number.MAX_SAFE_INTEGER },
      points: { min: 400, max: Number.MAX_SAFE_INTEGER },
    },
  ],
};
//
const main = async () => {
  const systems = Object.values(GAME_SYSTEMS);
  await Promise.all(
    systems.map(async (system) => {
      // const orcSummary = MOCK_ARMY_BOOK_SUMMARY_RESPONSE.find(({uid}) => uid === "1wj1ysgxpuuz9bc7")
      // const summaries: ArmyBookSummaryResponse = [
      //   ...(orcSummary != null ? [orcSummary] : [])
      // ];
      const url = `https://army-forge.onepagerules.com/api/army-books?filters=official&gameSystemSlug=${system.SLUG}&searchText=&page=1&unitCount=0&balanceValid=false&customRules=true&fans=false&sortBy=null`;
      
      console.log(`Fetching army book summaries for ${system.NAME}`);
      const response = await fetch(url);
      if (response.status !== 200) {
        console.error(
          `Unable to get army book summaries for ${system.NAME}`,
          response.statusText
        );
        throw new Error(response.statusText);
      }
      const summaries: ArmyBookSummaryResponse = await response.json();
      await Promise.all(
        summaries.map(async (summary) => {
          const url = `https://army-forge.onepagerules.com/api/army-books/${summary.uid}?gameSystem=${system.ID}`;
          
          console.log(`Fetching ${summary.name} army book...`);
          const response = await fetch(url);
          if (response.status !== 200) {
            return console.warn(
              `Unable to get ${summary.name} army book`,
              response.statusText
            );
          }
          const armyBook: ArmyBookResponse = await response.json();
          // const armyBook = MOCK_ARMY_BOOK_RESPONSE;
          const spawnTableMarkdown = buildSpawnTables(
            armyBook,
            TIERS_BY_GAME_SYSTEM[system.ID]
          );
          console.log(`Built spawn tables for ${armyBook.name}.`);
          const baseDir = path.normalize(`./output/${system.NAME}`);
          try {
            await fs.access(baseDir);
          } catch (error) {
            await fs.mkdir(baseDir);
          }
          const filePath = path.join(baseDir, `${armyBook.name}.md`);
          await fs.writeFile(filePath, spawnTableMarkdown);
          console.log(`Wrote spawn tables for ${armyBook.name} to ${filePath}`);
        })
      );
    })
  );
};

main();
