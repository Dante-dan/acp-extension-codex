import type {SessionConfigOption} from "@agentclientprotocol/sdk";
import type * as acp from "@agentclientprotocol/sdk";
import type {ServiceTier} from "./app-server/ServiceTier";
import type {Model} from "./app-server/v2";

export const FAST_MODE_CONFIG_ID = "fast-mode";
export const FAST_MODE_CATEGORY = "model_config";
export const FAST_MODE_ON = "on";
export const FAST_MODE_OFF = "off";

const FAST_MODE_DESCRIPTION = "1.5x speed, increased usage";

export function modelSupportsFast(model: Model | undefined): boolean {
    return model?.additionalSpeedTiers?.includes("fast") ?? false;
}

export function resolveFastServiceTier(fastModeEnabled: boolean, currentModelSupportsFast: boolean): ServiceTier | null {
    return fastModeEnabled && currentModelSupportsFast ? "fast" : null;
}

export function clientSupportsBooleanConfigOptions(clientCapabilities?: acp.ClientCapabilities | null): boolean {
    return clientCapabilities?.session?.configOptions?.boolean != null;
}

export function createFastModeConfigOption(fastModeEnabled: boolean, useBooleanConfigOption = false): SessionConfigOption {
    if (useBooleanConfigOption) {
        return {
            id: FAST_MODE_CONFIG_ID,
            name: "Fast mode",
            description: FAST_MODE_DESCRIPTION,
            category: FAST_MODE_CATEGORY,
            type: "boolean",
            currentValue: fastModeEnabled,
        };
    }

    return {
        id: FAST_MODE_CONFIG_ID,
        name: "Fast mode",
        description: FAST_MODE_DESCRIPTION,
        category: FAST_MODE_CATEGORY,
        type: "select",
        currentValue: fastModeEnabled ? FAST_MODE_ON : FAST_MODE_OFF,
        options: [
            {
                value: FAST_MODE_OFF,
                name: "Off",
                description: "Default speed, normal usage",
            },
            {
                value: FAST_MODE_ON,
                name: "On",
                description: FAST_MODE_DESCRIPTION,
            },
        ],
    };
}

// Native catalog ids are not the legacy ServiceTier enum (Fast may be "priority").
export const SERVICE_TIER_CONFIG_ID = "service-tier";
export function catalogServiceTiers(model: Model | undefined) {
    return model?.serviceTiers ?? [];
}
export function createServiceTierConfigOption(model: Model | undefined, selected: string | null): SessionConfigOption {
    const tiers = catalogServiceTiers(model);
    const value = selected ?? "inherit";
    return {
        id: SERVICE_TIER_CONFIG_ID,
        name: "Service tier",
        description: "Native model catalog choices. Faster tiers may increase usage or cost; availability depends on your account.",
        category: FAST_MODE_CATEGORY,
        type: "select",
        currentValue: value,
        options: [
            {value: "inherit", name: "Inherit", description: "Keep the native thread's configured tier"},
            {value: "default", name: "Standard", description: "Explicitly request standard speed"},
            ...tiers.filter(t => t.id !== "default" && t.id !== "inherit").map(t => ({value: t.id, name: t.name, description: t.description})),
            ...(selected && selected !== "default" && !tiers.some(t => t.id === selected)
                ? [{value: selected, name: `${selected} (unavailable)`, description: "Select an available tier before sending a message"}] : []),
        ],
    };
}
