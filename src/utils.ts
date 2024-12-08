import {
  ArmyBookResponse,
  SpecialRulesItem,
  Unit,
  UpgradePackagesItem,
} from "./api/army-forge/api";
import {
  RELEVANT_RULE_KEYS_FOR_ATTACHMENT,
  SPECIAL_RULE_KEYS,
} from "./constants";
import {
  PopulatedTier,
  Tier,
  UnitWithAttachment,
  UnitWithUpgrades,
  Upgrade,
  UpgradeMap,
  UpgradeSectionAndOption,
} from "./types";

export const canAttach = (unit: Unit) =>
  Number(
    unit.rules.find((rule) => rule.key === SPECIAL_RULE_KEYS.TOUGH)?.rating ?? 0
  ) <= 6;

export const isHero = (unit: Unit) =>
  unit.rules.some((rule) => rule.key === SPECIAL_RULE_KEYS.HERO);

export const isNotHero = (unit: Unit) =>
  !unit.rules.some((rule) => rule.key === SPECIAL_RULE_KEYS.HERO);

// TODO just check against min/max, for case of attached heroes
export const isInTier = (unit: Unit, min: number, max: number) =>
  unit.cost >= min && unit.cost <= max;

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
): UnitWithUpgrades[] => {
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

export const buildUnitWithUpgradesAndAttachments = (
  unit: Unit,
  hero?: Unit
): UnitWithAttachment => {
  return {
    unit,
    hero,
  };
};

export const getValidUnitsInRange = (units: Unit[], min: number, max: number) =>
  units.filter((unit) => {
    return unit.cost >= min && unit.cost <= max;
  });

export const getValidHeroes = (
  units: Unit[],
  min: number,
  max: number
): Unit[] =>
  units.filter(
    (unit) => isInTier(unit, min, max) && isHero(unit) && canAttach(unit)
  );

export const getValidNonHeroUnits = (
  units: Unit[],
  min: number,
  max: number
): Unit[] => units.filter((unit) => isInTier(unit, min, max) && !isHero(unit));

export const getValidAttachedUnitsInRange = (
  heroes: Unit[],
  units: Unit[],
  min: number,
  max: number
): UnitWithAttachment[] => {
  const validHeroes = getValidHeroes(heroes, min, max);

  const cheapestHero = validHeroes.reduce(
    (cheapest: Unit | null, hero: Unit) => {
      if (cheapest == null) {
        return hero;
      }
      return hero.cost < cheapest.cost ? hero : cheapest;
    },
    null
  );
  if (cheapestHero == null) {
    return [];
  }
  const validUnits = getValidNonHeroUnits(units, min, max).filter(
    (unit) => unit.cost <= max - (cheapestHero?.cost ?? 0)
  );
  return validUnits.reduce(
    (attachedUnits: UnitWithAttachment[], unit: Unit) => {
      return [
        ...attachedUnits,
        ...validHeroes.reduce(
          (unitsWithHero: UnitWithAttachment[], hero: Unit) => {
            return [
              ...unitsWithHero,
              ...(hero.cost + unit.cost < max
                ? [
                    {
                      hero,
                      unit,
                    },
                  ]
                : []),
            ];
          },
          []
        ),
      ];
    },
    []
  );
};

export const getRelevantSpecialRules = (unit: Unit) =>
  unit.rules.filter(
    (rule) =>
      rule.key != null && RELEVANT_RULE_KEYS_FOR_ATTACHMENT.includes(rule.key)
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

// export const getUnitMaxRange = (unit: Unit): number | null =>
//   unit?.items
//     ?.filter((equipment) =>
//       equipment.rules?.every(
//         (rule) => rule.key !== SPECIAL_RULE_KEYS.LIMITED
//       )
//     )
//     ?.reduce((acc, curr) => Math.max(acc, curr?.range ?? 0), 0);

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
  unit,
  hero,
}: UnitWithAttachment & { isCombined?: boolean }) => {
  const { cost, defense, weapons, isCombined, name, quality, size, rules } =
    unit;

  return [
    ...(hero != null
      ? [
          `1. ${hero.name} [${hero.size}]`,
          `Q${hero.quality}+ D${hero.defense}+`,
          `${hero.cost} pts`,
          hero.rules.map((rule) => rule.label ?? rule.name).join(", "),
          hero.weapons.length > 0
            ? weapons
                .map(
                  ({ count, label }) =>
                    `${isCombined ? 2 * count : count}x ${label}`
                )
                .join(", ")
            : null,
          "Joined to:",
        ]
      : []),
    `${hero == null ? "1. " : ""}${name} [${size}]`,
    `Q${quality}+ D${defense}+`,
    `${cost} pts`,
    rules.map((rule) => rule.label ?? rule.name).join(", "),
    weapons.length > 0
      ? weapons
          .map(
            ({ count, label }) => `${isCombined ? 2 * count : count}x ${label}`
          )
          .join(", ")
      : null,
  ]
    .filter((part) => part != null)
    .join(" | ");
};
export const populateTier = (candidates: Unit[], tier: Tier): PopulatedTier => {
  const candidateHeroes = candidates.filter(isHero);
  const candidateNonHeroes = candidates.filter(isNotHero);
  const units: UnitWithAttachment[] = [
    ...getValidUnitsInRange(
      candidateHeroes,
      tier.points.min,
      tier.points.max
    ).map((unit) => {
      return {
        unit,
        hero: undefined,
      };
    }),
    // TODO upgraded units
    ...getValidUnitsInRange(
      candidateNonHeroes,
      tier.points.min,
      tier.points.max
    ).map((unit) => {
      return {
        unit,
        hero: undefined,
      };
    }),
    ...getValidAttachedUnitsInRange(
      candidateHeroes,
      candidateNonHeroes,
      tier.points.min,
      tier.points.max
    ),

    // TODO units with upgraded attached heroes
    ...getValidUnitsInRange(
      candidateNonHeroes.filter((unit) => unit.size > 1),
      tier.points.min / 2,
      tier.points.max / 2
    )
      .map(combineUnit)
      .map((unit) => {
        return {
          unit,
          hero: undefined,
        };
      }),
    ...getValidAttachedUnitsInRange(
      candidateHeroes,
      candidateNonHeroes.filter((unit) => unit.size > 1).map(combineUnit),
      tier.points.min / 2,
      tier.points.max / 2
    ),
    // TODO combined units with upgraded attached heroes
  ];

  return {
    ...tier,
    units,
  };
};

export const mapPopulatedTierToString = ({ roll, units }: PopulatedTier) => {
  const formattedTier =
    roll.max >= 12
      ? `\n## ${roll.min}+`
      : `\n## ${roll.min} - ${roll.max}`;
  return [
    formattedTier,
    "",
    ...(units.length > 0 ? units.map(mapUnitToString) : ["No units."]),
  ].join("\n");
};
export const buildSpawnTables = (army: ArmyBookResponse, tiers: Tier[]) => {
  const tierStrings = tiers
    .map((tier) => populateTier(army.units, tier))
    .map(mapPopulatedTierToString);

  return [
    `# ${army.name} ${army.versionString} Horde Spawn Table`,
    ...tierStrings,
  ].join("\n");
};

const LEADER_UPGRADE_HINT = "Leader Upgrades";

const RELEVANT_UPGRADE_HINTS = ["Leader Weapons", "Specialist"];

export const getUnitUpgradeVariations = (
  unit: Unit,
  upgradeMap: UpgradeMap
): UnitWithUpgrades[] => {
  const upgrades = unit.upgrades
    .map((upgradeId) => upgradeMap[upgradeId])
    .filter((upgrade): upgrade is UpgradePackagesItem => upgrade != null);

  const leaderUpgrade: UpgradePackagesItem | undefined = upgrades.find(
    (upgrade) => upgrade.hint.startsWith(LEADER_UPGRADE_HINT)
  );
  const weaponUpgrades = upgrades.filter((upgrade) =>
    RELEVANT_UPGRADE_HINTS.some((relevantHint) =>
      upgrade.hint.startsWith(relevantHint)
    )
  );

  const baseVariations: UnitWithUpgrades[] = [
    unit,
    ...(isHero(unit) && leaderUpgrade != null
      ? [
          {
            ...unit,
            selectedUpgrades: mapUpgradePackagesToSectionsAndOptions([
              leaderUpgrade,
            ]),
          },
        ]
      : []),
  ];

  return [
    ...baseVariations,
    ...baseVariations.map((variation) => {
      return {
        ...variation,
        selectedUpgrades: [...(variation.selectedUpgrades ?? [])],
      };
    }),
  ];
};
