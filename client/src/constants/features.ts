/**
 * Feature flags for incremental feature rollout
 * Set to true to enable a feature, false to hide it from the UI
 */
export const FEATURES = {
  SERVICE_CATALOGUE: false,    // Phase 4: Service catalogue with dynamic forms
  ERP_INTEGRATION: false,      // Phase 5: ERP system integration
  MULTI_ORG: false,            // Phase 6: Multi-organization support
} as const;

/**
 * Check if a feature is enabled
 * @param feature - The feature key to check
 * @returns true if the feature is enabled
 */
export const isFeatureEnabled = (feature: keyof typeof FEATURES): boolean => {
  return FEATURES[feature];
};
