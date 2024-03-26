import {
  ArmyBookResponse,
  SpecialRulesItem,
  Unit,
  UpgradePackagesItem,
} from "./api/army-forge/api";
import { RELEVANT_SPECIAL_RULE_KEYS, SPECIAL_RULE_KEYS } from "./constants";
import {
  HeroWithUpgrades,
  PopulatedTier,
  Tier,
  Upgrade,
  UpgradeMap,
  UpgradeSectionAndOption,
} from "./types";

export const isHero = (unit: Unit) =>
  unit.specialRules.some((rule) => rule.key === SPECIAL_RULE_KEYS.HERO);

export const isNotHero = (unit: Unit) =>
  !unit.specialRules.some((rule) => rule.key === SPECIAL_RULE_KEYS.HERO);

// TODO just check against min/max, for case of attached heroes
export const isInTier = (tier: Tier) => (unit: Unit) =>
  unit.cost >= tier.points.min && unit.cost <= tier.points.max;

export const mapUpgradePackagesToSectionsAndOptions = (
  upgradePackages: UpgradePackagesItem[]
): UpgradeSectionAndOption[] => {
  // Use reduce to flatten the array of arrays into a single array
  return upgradePackages.reduce<UpgradeSectionAndOption[]>((acc, upgrade) => {
    // For each package, map its sections to an array of UpgradeSectionAndOption
    const sectionsOptions = upgrade.sections.reduce<UpgradeSectionAndOption[]>(
      (sectionAcc, section) => {
        // For each section, map its options to UpgradeSectionAndOption
        const options = section.options.map((option) => ({
          upgrade,
          section,
          option,
        }));
        // Use the spread operator to concatenate the options for this section to the accumulator for sections
        return [...sectionAcc, ...options];
      },
      []
    );
    // Use the spread operator to concatenate the results for this package to the overall accumulator
    return [...acc, ...sectionsOptions];
  }, []); // Initial value for the accumulator is an empty array
};

export const getHeroCombinations = (
  hero: Unit,
  upgradeMap: UpgradeMap
): HeroWithUpgrades[] => {
  // for each "choose one" upgrade, return
  const heroUpgrades = hero?.upgrades
    ?.map((upgradeId) => upgradeMap[upgradeId])
    ?.filter((upgrade): upgrade is UpgradePackagesItem => upgrade != null);
  const exactlyOneUpgradeOptions = mapUpgradePackagesToSectionsAndOptions(
    heroUpgrades
  )?.filter(({ section }) => section?.select?.type === "exactly");

  return exactlyOneUpgradeOptions?.map((option) => ({
    ...hero,
    selectedUpgrades: [option],
  }));
};

export const getValidUnitsInRange = (units: Unit[], min: number, max: number) =>
  units.filter((unit) => {
    return unit.cost >= min && unit.cost <= max;
  });

export const getValidHeroes = (units: Unit[], tier: Tier): Unit[] =>
  units.filter(isInTier(tier));

export const getValidNonHeroUnits = (units: Unit[], tier: Tier): Unit[] =>
  units.filter((unit) => isInTier(tier) && isHero(unit));

export const getRelevantSpecialRules = (unit: Unit) =>
  unit.specialRules.filter(
    (rule) => rule.key != null && RELEVANT_SPECIAL_RULE_KEYS.includes(rule.key)
  );

export const getMatchingSpecialRuleUpgrade = (
  ruleKeys: string[],
  upgrade: UpgradePackagesItem
): Upgrade | undefined => {
  for (let section of upgrade?.sections ?? []) {
    for (let option of section.options) {
      if (
        ruleKeys.every((ruleKey) => {
          const optionRules: SpecialRulesItem[] = option.gains
            .map((gain) => gain.specialRules)
            .flat()
            .filter(
              (item?: SpecialRulesItem): item is SpecialRulesItem =>
                item != null
            );

          return optionRules.some((optionRule) => optionRule.key === ruleKey);
        })
      ) {
        return {
          section,
          option,
        };
      }
      return undefined;
    }
  }
};

export const getRelevantSpecialRuleUpgrades = () => {};

export const getUnitMaxRange = (unit: Unit): number | null =>
  unit?.equipment
    ?.filter((equipment) =>
      equipment.specialRules?.every(
        (rule) => rule.key !== SPECIAL_RULE_KEYS.LIMITED
      )
    )
    ?.reduce((acc, curr) => Math.max(acc, curr?.range ?? 0), 0);

// export const getRelevantRangeUpgrades = (unit: Unit): Upgrade[] => {
//   const range = getUnitMaxRange(unit);
//   // for each upgrade
//   // filter out sections without range increases
//   // map
//   return unit.upgrades?.map((upgrade) => {});
// };

// export const getMatchingUnitUpgradeOptionForSpecialRules = (
//   unit: Unit,
//   rules: SpecialRulesItem[],
//   upgradesById: UpgradeMap
// ) =>
//   unit.upgrades.find((upgradeId) => {
//     const upgrade = upgradesById[upgradeId];
//     if (upgrade == null) {
//       return false;
//     }
//     return getMatchingSectionAndOption(rules, upgrade);
//   });

type SpawnTier = {
  min: number;
  max: number;
  units: Unit[];
};

export type SpawnTable = {
  army_uid: string;
  factionName: string;
  versionString: string;
  tiers: SpawnTier[];
};

export const combineUnit = ({
  cost,
  size,
  ...unit
}: Unit): Unit & { isCombined: boolean } => ({
  ...unit,
  size: size * 2,
  cost: cost * 2,
  isCombined: true,
});

export const mapUnitToString = ({
  cost,
  defense,
  equipment,
  isCombined,
  name,
  quality,
  size,
  specialRules,
}: Unit & { isCombined?: boolean }) =>
  [
    `1. ${name} (${size})`,
    `Q${quality}+ D${defense}+`,
    `${cost} pts`,
    specialRules.map((rule) => rule.label ?? rule.name).join(", "),
    equipment.length > 0
      ? equipment.map((equipment) => equipment.label).join(", ")
      : null,
  ]
    .filter((part) => part != null)
    .join(" | ");

export const populateTier = (candidates: Unit[], tier: Tier) => {
  const candidateHeroes = candidates.filter(isHero);
  const candidateNonHeroes = candidates.filter(isNotHero);
  const units = [
    ...getValidUnitsInRange(candidateHeroes, tier.points.min, tier.points.max),
    ...getValidUnitsInRange(
      candidateNonHeroes,
      tier.points.min,
      tier.points.max
    ),
    // TODO upgraded units
    // TODO units with attached heroes

    // TODO units with upgraded attached heroes
    ...getValidUnitsInRange(
      candidateNonHeroes.filter((unit) => unit.size > 1),
      tier.points.min / 2,
      tier.points.max / 2
    ).map(combineUnit),
    // TODO combined units with attached heroes
    // TODO combined units with upgraded attached heroes
  ];

  return {
    ...tier,
    units,
  };
};

export const mapPopulatedTierToString = ({ roll, units }: PopulatedTier) =>
  [`\n## ${roll.min} - ${roll.max}`, "", ...units.map(mapUnitToString)].join(
    "\n"
  );

export const buildSpawnTables = (army: ArmyBookResponse, tiers: Tier[]) => {
  const tierStrings = tiers
    .map((tier) => populateTier(army.units, tier))
    .map(mapPopulatedTierToString);

  return [
    `# ${army.name} ${army.versionString} Horde Spawn Table`,
    ...tierStrings,
  ].join("\n");
};
