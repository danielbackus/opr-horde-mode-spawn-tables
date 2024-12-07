"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const utils_1 = require("./utils");
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
            points: { min: 0, max: 100 },
        },
        {
            roll: { min: 5, max: 7 },
            points: { min: 105, max: 245 },
        },
        {
            roll: { min: 8, max: 10 },
            points: { min: 250, max: 395 },
        },
        {
            roll: { min: 11, max: 12 },
            points: { min: 400, max: Number.MAX_SAFE_INTEGER },
        },
    ],
};
//
const main = async () => {
    const systems = Object.values(GAME_SYSTEMS);
    await Promise.all(systems.map(async (system) => {
        // const orcSummary = MOCK_ARMY_BOOK_SUMMARY_RESPONSE.find(({uid}) => uid === "1wj1ysgxpuuz9bc7")
        // const summaries: ArmyBookSummaryResponse = [
        //   ...(orcSummary != null ? [orcSummary] : [])
        // ];
        const url = "https://army-forge.onepagerules.com/api/army-books?filters=official&gameSystemSlug=grimdark-future&searchText=&page=1&unitCount=0&balanceValid=false&customRules=true&fans=false&sortBy=null";
        // const url = `https://army-forge.onepagerules.com/api/afs/army-books?filters=official&gameSystemSlug=${system.SLUG}&searchText=&page=1&unitCount=0&balanceValid=false&customRules=true&fans=false&sortBy=null`;
        console.log(`Fetching army book summaries for ${system.NAME}`);
        const response = await fetch(url);
        if (response.status !== 200) {
            console.error(`Unable to get army book summaries for ${GAME_SYSTEMS.GRIMDARK_FUTURE.NAME}`, response.statusText);
            throw new Error(response.statusText);
        }
        const summaries = await response.json();
        await Promise.all(summaries.map(async (summary) => {
            const url = `https://army-forge.onepagerules.com/api/army-books/${summary.uid}?gameSystem=${system.ID}`;
            // const url = `https://army-forge.onepagerules.com/api/afs/book/${summary.uid}?gameSystem=${system.ID}`;
            console.log(`Fetching ${summary.name} army book...`);
            const response = await fetch(url);
            if (response.status !== 200) {
                return console.warn(`Unable to get ${summary.name} army book`, response.statusText);
            }
            const armyBook = await response.json();
            // const armyBook = MOCK_ARMY_BOOK_RESPONSE;
            const spawnTableMarkdown = (0, utils_1.buildSpawnTables)(armyBook, TIERS_BY_GAME_SYSTEM[system.ID]);
            console.log(`Built spawn tables for ${armyBook.name}.`);
            const baseDir = path_1.default.normalize(`./output/${system.NAME}`);
            try {
                await promises_1.default.access(baseDir);
            }
            catch (error) {
                await promises_1.default.mkdir(baseDir);
            }
            const filePath = path_1.default.join(baseDir, `${armyBook.name}.md`);
            await promises_1.default.writeFile(filePath, spawnTableMarkdown);
            console.log(`Wrote spawn tables for ${armyBook.name} to ${filePath}`);
        }));
    }));
};
main();
