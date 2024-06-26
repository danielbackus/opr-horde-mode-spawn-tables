import fs from "fs/promises";
import path from "path";

import {
  ArmyBookResponse,
  ArmyBookSummaryResponse,
} from "./api/army-forge/api";
import { buildSpawnTables } from "./utils";

const GAME_SYSTEMS = {
  GRIMDARK_FUTURE: {
    ID: 2,
    NAME: "Grimdark Future",
    SLUG: "grimdark-future",
  },
};
const TIERS_BY_GAME_SYSTEM = {
  [GAME_SYSTEMS.GRIMDARK_FUTURE.ID]: [
    {
      roll: { min: 3, max: 4 },
      points: { min: 0, max: 150 },
    },
    {
      roll: { min: 5, max: 7 },
      points: { min: 155, max: 340 },
    },
    {
      roll: { min: 8, max: 10 },
      points: { min: 345, max: 595 },
    },
    {
      roll: { min: 11, max: 12 },
      points: { min: 600, max: Number.MAX_SAFE_INTEGER },
    },
  ],
};
//
const main = async () => {
  const systems = Object.values(GAME_SYSTEMS);
  await Promise.all(
    systems.map(async (system) => {
      const url = `https://army-forge.onepagerules.com/api/afs/army-books?filters=official&gameSystemSlug=${system.SLUG}&searchText=&page=1&unitCount=0&balanceValid=false&customRules=true&fans=false&sortBy=null`;
      console.log(`Fetching army book summaries for ${system.NAME}`);
      const response = await fetch(url);
      if (response.status !== 200) {
        console.error(
          `Unable to get army book summaries for ${GAME_SYSTEMS.GRIMDARK_FUTURE.NAME}`
        );
        throw new Error(response.statusText);
      }
      const summaries: ArmyBookSummaryResponse = await response.json();
      await Promise.all(
        summaries.map(async (summary) => {
          const url = `https://army-forge.onepagerules.com/api/afs/book/${summary.uid}?gameSystem=${system.ID}`;
          console.log(`Fetching ${summary.name} army book...`);
          const response = await fetch(url);
          if (response.status !== 200) {
            return console.warn(
              `Unable to get ${summary.name} army book`,
              response.statusText
            );
          }
          const armyBook: ArmyBookResponse = await response.json();
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
