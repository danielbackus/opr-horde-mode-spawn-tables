import { OptionsItem, SectionsItem, Unit, UnitsItem, UpgradePackagesItem } from "./api/army-forge/api";

type MinMax = {
  min: number;
  max: number;
};

export type Tier = {
  roll: MinMax;
  points: MinMax;
};

export type PopulatedTier = Tier & {
  units: Unit[];
}

export type UpgradeSectionAndOption = {
  upgrade: UpgradePackagesItem;
  section: SectionsItem;
  option: OptionsItem;
};

export type HeroWithUpgrades = Omit<UnitsItem, "upgrades"> & {
  selectedUpgrades: UpgradeSectionAndOption[];
};

export type UpgradeMap = {
  [key in string]?: UpgradePackagesItem;
};

export type Upgrade = { section: SectionsItem; option: OptionsItem };
