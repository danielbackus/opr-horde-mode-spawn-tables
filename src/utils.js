"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUnitUpgradeVariations = exports.buildSpawnTables = exports.mapPopulatedTierToString = exports.populateTier = exports.mapUnitToString = exports.combineUnit = exports.getRelevantSpecialRuleUpgrades = exports.getMatchingSpecialRuleUpgrade = exports.getRelevantSpecialRules = exports.getValidAttachedUnitsInRange = exports.getValidNonHeroUnits = exports.getValidHeroes = exports.getValidUnitsInRange = exports.buildUnitWithUpgradesAndAttachments = exports.getHeroCombinations = exports.mapUpgradePackagesToSectionsAndOptions = exports.isInTier = exports.isNotHero = exports.isHero = exports.canAttach = void 0;
const constants_1 = require("./constants");
const canAttach = (unit) => Number(unit.rules.find((rule) => rule.key === constants_1.SPECIAL_RULE_KEYS.TOUGH)
    ?.rating ?? 0) <= 6;
exports.canAttach = canAttach;
const isHero = (unit) => unit.rules.some((rule) => rule.key === constants_1.SPECIAL_RULE_KEYS.HERO);
exports.isHero = isHero;
const isNotHero = (unit) => !unit.rules.some((rule) => rule.key === constants_1.SPECIAL_RULE_KEYS.HERO);
exports.isNotHero = isNotHero;
// TODO just check against min/max, for case of attached heroes
const isInTier = (unit, min, max) => unit.cost >= min && unit.cost <= max;
exports.isInTier = isInTier;
const mapUpgradePackagesToSectionsAndOptions = (upgradePackages) => {
    // Use reduce to flatten the array of arrays into a single array
    return upgradePackages.reduce((acc, upgrade) => {
        // For each package, map its sections to an array of UpgradeSectionAndOption
        const sectionsOptions = upgrade.sections.reduce((sectionAcc, section) => {
            // For each section, map its options to UpgradeSectionAndOption
            const options = section.options.map((option) => ({
                upgrade,
                section,
                option,
            }));
            // Use the spread operator to concatenate the options for this section to the accumulator for sections
            return [...sectionAcc, ...options];
        }, []);
        // Use the spread operator to concatenate the results for this package to the overall accumulator
        return [...acc, ...sectionsOptions];
    }, []); // Initial value for the accumulator is an empty array
};
exports.mapUpgradePackagesToSectionsAndOptions = mapUpgradePackagesToSectionsAndOptions;
const getHeroCombinations = (hero, upgradeMap) => {
    // for each "choose one" upgrade, return
    const heroUpgrades = hero?.upgrades
        ?.map((upgradeId) => upgradeMap[upgradeId])
        ?.filter((upgrade) => upgrade != null);
    const exactlyOneUpgradeOptions = (0, exports.mapUpgradePackagesToSectionsAndOptions)(heroUpgrades)?.filter(({ section }) => section?.select?.type === "exactly");
    return exactlyOneUpgradeOptions?.map((option) => ({
        ...hero,
        selectedUpgrades: [option],
    }));
};
exports.getHeroCombinations = getHeroCombinations;
const buildUnitWithUpgradesAndAttachments = (unit, hero) => {
    return {
        unit,
        hero,
    };
};
exports.buildUnitWithUpgradesAndAttachments = buildUnitWithUpgradesAndAttachments;
const getValidUnitsInRange = (units, min, max) => units.filter((unit) => {
    return unit.cost >= min && unit.cost <= max;
});
exports.getValidUnitsInRange = getValidUnitsInRange;
const getValidHeroes = (units, min, max) => units.filter((unit) => (0, exports.isInTier)(unit, min, max) && (0, exports.isHero)(unit) && (0, exports.canAttach)(unit));
exports.getValidHeroes = getValidHeroes;
const getValidNonHeroUnits = (units, min, max) => units.filter((unit) => (0, exports.isInTier)(unit, min, max) && !(0, exports.isHero)(unit));
exports.getValidNonHeroUnits = getValidNonHeroUnits;
const getValidAttachedUnitsInRange = (heroes, units, min, max) => {
    const validHeroes = (0, exports.getValidHeroes)(heroes, min, max);
    const cheapestHero = validHeroes.reduce((cheapest, hero) => {
        if (cheapest == null) {
            return hero;
        }
        return hero.cost < cheapest.cost ? hero : cheapest;
    }, null);
    if (cheapestHero == null) {
        return [];
    }
    const validUnits = (0, exports.getValidNonHeroUnits)(units, min, max).filter((unit) => unit.cost <= max - (cheapestHero?.cost ?? 0));
    return validUnits.reduce((attachedUnits, unit) => {
        return [
            ...attachedUnits,
            ...validHeroes.reduce((unitsWithHero, hero) => {
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
            }, []),
        ];
    }, []);
};
exports.getValidAttachedUnitsInRange = getValidAttachedUnitsInRange;
const getRelevantSpecialRules = (unit) => unit.rules.filter((rule) => rule.key != null && constants_1.RELEVANT_RULE_KEYS_FOR_ATTACHMENT.includes(rule.key));
exports.getRelevantSpecialRules = getRelevantSpecialRules;
const getMatchingSpecialRuleUpgrade = (ruleKeys, upgrade) => {
    for (let section of upgrade?.sections ?? []) {
        for (let option of section.options) {
            if (ruleKeys.every((ruleKey) => {
                const optionRules = option.gains
                    .map((gain) => gain.specialRules)
                    .flat()
                    .filter((item) => item != null);
                return optionRules.some((optionRule) => optionRule.key === ruleKey);
            })) {
                return {
                    section,
                    option,
                };
            }
            return undefined;
        }
    }
};
exports.getMatchingSpecialRuleUpgrade = getMatchingSpecialRuleUpgrade;
const getRelevantSpecialRuleUpgrades = () => { };
exports.getRelevantSpecialRuleUpgrades = getRelevantSpecialRuleUpgrades;
const combineUnit = ({ cost, size, ...unit }) => ({
    ...unit,
    size: size * 2,
    cost: cost * 2,
    isCombined: true,
});
exports.combineUnit = combineUnit;
const mapUnitToString = ({ unit, hero, }) => {
    const { cost, defense, weapons, isCombined, name, quality, size, rules, } = unit;
    return [
        ...(hero != null
            ? [
                `1. ${hero.name} [${hero.size}]`,
                `Q${hero.quality}+ D${hero.defense}+`,
                `${hero.cost} pts`,
                hero.rules.map((rule) => rule.label ?? rule.name).join(", "),
                hero.weapons.length > 0
                    ? weapons
                        .map(({ count, label }) => `${isCombined ? 2 * count : count}x ${label}`)
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
                .map(({ count, label }) => `${isCombined ? 2 * count : count}x ${label}`)
                .join(", ")
            : null,
    ]
        .filter((part) => part != null)
        .join(" | ");
};
exports.mapUnitToString = mapUnitToString;
const populateTier = (candidates, tier) => {
    const candidateHeroes = candidates.filter(exports.isHero);
    const candidateNonHeroes = candidates.filter(exports.isNotHero);
    const units = [
        ...(0, exports.getValidUnitsInRange)(candidateHeroes, tier.points.min, tier.points.max).map((unit) => {
            return {
                unit,
                hero: undefined,
            };
        }),
        // TODO upgraded units
        ...(0, exports.getValidUnitsInRange)(candidateNonHeroes, tier.points.min, tier.points.max).map((unit) => {
            return {
                unit,
                hero: undefined,
            };
        }),
        ...(0, exports.getValidAttachedUnitsInRange)(candidateHeroes, candidateNonHeroes, tier.points.min, tier.points.max),
        // TODO units with upgraded attached heroes
        ...(0, exports.getValidUnitsInRange)(candidateNonHeroes.filter((unit) => unit.size > 1), tier.points.min / 2, tier.points.max / 2)
            .map(exports.combineUnit)
            .map((unit) => {
            return {
                unit,
                hero: undefined,
            };
        }),
        ...(0, exports.getValidAttachedUnitsInRange)(candidateHeroes, candidateNonHeroes.filter((unit) => unit.size > 1).map(exports.combineUnit), tier.points.min / 2, tier.points.max / 2),
        // TODO combined units with upgraded attached heroes
    ];
    return {
        ...tier,
        units,
    };
};
exports.populateTier = populateTier;
const mapPopulatedTierToString = ({ roll, units }) => {
    return [
        `\n## ${roll.min} - ${roll.max}`,
        "",
        ...(units.length > 0 ? units.map(exports.mapUnitToString) : ["No units."]),
    ].join("\n");
};
exports.mapPopulatedTierToString = mapPopulatedTierToString;
const buildSpawnTables = (army, tiers) => {
    const tierStrings = tiers
        .map((tier) => (0, exports.populateTier)(army.units, tier))
        .map(exports.mapPopulatedTierToString);
    return [
        `# ${army.name} ${army.versionString} Horde Spawn Table`,
        ...tierStrings,
    ].join("\n");
};
exports.buildSpawnTables = buildSpawnTables;
const LEADER_UPGRADE_HINT = "Leader Upgrades";
const RELEVANT_UPGRADE_HINTS = ["Leader Weapons", "Specialist"];
const getUnitUpgradeVariations = (unit, upgradeMap) => {
    const upgrades = unit.upgrades
        .map((upgradeId) => upgradeMap[upgradeId])
        .filter((upgrade) => upgrade != null);
    const leaderUpgrade = upgrades.find((upgrade) => upgrade.hint.startsWith(LEADER_UPGRADE_HINT));
    const weaponUpgrades = upgrades.filter((upgrade) => RELEVANT_UPGRADE_HINTS.some((relevantHint) => upgrade.hint.startsWith(relevantHint)));
    const baseVariations = [
        unit,
        ...((0, exports.isHero)(unit) && leaderUpgrade != null
            ? [
                {
                    ...unit,
                    selectedUpgrades: (0, exports.mapUpgradePackagesToSectionsAndOptions)([
                        leaderUpgrade,
                    ]),
                },
            ]
            : []),
    ];
    return [
        ...baseVariations,
        ...baseVariations.map(variation => {
            return {
                ...variation,
                selectedUpgrades: [
                    ...variation.selectedUpgrades ?? [],
                ]
            };
        })
    ];
};
exports.getUnitUpgradeVariations = getUnitUpgradeVariations;
