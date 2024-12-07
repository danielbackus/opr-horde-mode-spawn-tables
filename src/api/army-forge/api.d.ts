type ArmyBookSummaryResponse = ArmyBookSummaryResponseItem[];
export interface ArmyBookSummaryResponseItem {
    uid: string;
    enabledGameSystems: number[];
    name: string;
    hint: string | null;
    background: string;
    unitCount: number;
    modifiedAt: string;
    official: boolean;
    versionString: string;
    coverImagePath: null | string;
    coverImageCredit: null | string;
    bannerImagePath: string | null;
    isLive: boolean;
    factionId: null | string;
    factionName: null | string;
    factionRelation: null | string;
    username: string;
    balanceValid: boolean;
    balanceValidReason: number;
    popularity: number;
    downvotes: number;
    overallVotes: number;
    flavouredUid: string;
    armyForgeUrl: string;
    creator: boolean;
    isCreator: boolean;
}

export interface ArmyBookResponse {
    uid: string;
    gameSystemKey: string;
    enabledGameSystems: number[];
    name: string;
    hint: string;
    background: string;
    backgroundFull: string;
    units: UnitsItem[];
    upgradePackages: UpgradePackagesItem[];
    rules?: SpecialRulesItem[];
    specialRules?: SpecialRulesItem[];
    customRules: any[];
    customWeapons: CustomWeaponsItem[];
    spells: SpellsItem[];
    modifiedAt: string;
    official: boolean;
    versionString: string;
    coverImagePath: any;
    coverImageCredit: any;
    bannerImagePath: string | null;
    isLive: boolean;
    factionId: null;
    factionName: null;
    factionRelation: null;
    popularity: number;
    downvotes: number;
    partnerSettings: PartnerSettings;
    balanceValid: boolean;
    balanceValidReason: number;
    username: string;
    voted: null;
    armyForgeUrl: string;
    creator: boolean;
    isCreator: boolean;
    gameSystemId: number;
    gameSystemSlug: string;
    fullname?: string;
    aberration: string;
    universe?: string;
    shortname?: string;
    flavouredUid: string;
}
export interface UnitsItem {
    id: string;
    cost: number;
    name: string;
    size: number;
    type?: number;
    valid: boolean;
    defense: number;
    quality: number;
    upgrades: string[];
    weapons: EquipmentItem[];
    rules: SpecialRulesItem[];
    items: unknown[];
    isNarrative?: boolean;
    disabled?: boolean;
    disabledSections?: unknown;
    bases: any;
    hasCustomRule: boolean;
    disabledSections: string[];
    hasBalanceInvalid: boolean;
    disabledUpgradeSections: string[];
    key?: string;
}
export type Unit = UnitsItem;
export interface EquipmentItem {
    id: string;
    name: string;
    type: string;
    count: number;
    label: string;
    range?: number;
    attacks: number | string;
    weaponId: string;
    specialRules: SpecialRulesItem[];
    originalCount: number;
}
export interface SpecialRulesItem {
    key?: string;
    name?: string;
    rating?: string | number;
    modify?: boolean;
    additional?: boolean;
    id?: number | string;
    label?: string;
    type?: string;
    description?: string;
    hasRating?: boolean | null;
    aliasedRuleId?: string | number | null;
}
export interface UpgradePackagesItem {
    uid: string;
    hint: string;
    sections: SectionsItem[];
    calcErrors: boolean;
}
export interface SectionsItem {
    id: string;
    uid: string;
    label: string;
    options: OptionsItem[];
    parentPackageUid: string;
    type: string;
    variant: string;
    targets?: string[];
    affects?: Affects;
    select?: Select;
    isHeroUpgrade?: boolean;
    model?: boolean;
}
export interface OptionsItem {
    uid: string;
    cost?: number;
    type: string;
    costs?: CostsItem[];
    gains: GainsItem[];
    label: string;
    proposedVersion?: string;
    parentPackageUid?: string;
    parentSectionUid?: string;
    parentSectionId?: string;
    proposedCostHint?: ProposedCostHintItem[];
    id: string;
    proposedCost?: number;
}
export interface CostsItem {
    cost: number;
    unitId: string;
}
export interface GainsItem {
    name: string;
    type: string;
    count: number;
    label: string;
    bases?: any;
    range?: number;
    attacks?: number | string;
    weaponId?: string;
    specialRules?: SpecialRulesItem[];
    id?: string;
    content?: ContentItem[];
    key?: string;
    modify?: boolean;
    rating?: string;
}
export interface ProposedCostHintItem {
    isValid: boolean;
    unitName: string;
    newCostPrecise: string;
    newCostRounded: number;
}
export interface Affects {
    type: string;
    value?: number;
}
export interface ContentItem {
    key?: string;
    name: string;
    type: string;
    label?: string;
    rating?: string | number;
    modify?: boolean;
    id?: string;
    range?: number;
    attacks?: number;
    weaponId?: string;
    rules?: SpecialRulesItem[];
    count?: number;
}
export interface Select {
    type: string;
    value?: number;
}
export interface CustomWeaponsItem {
    id: string;
    name: string;
    label?: string;
    parentId?: string;
    range?: number;
    attacks?: number | string;
    specialRules?: SpecialRulesItem[];
    type?: string;
}
export interface SpellsItem {
    id: string;
    name: string;
    type: number;
    effect: string;
    threshold: number;
    spellbookId: string;
    effectSkirmish: string;
}