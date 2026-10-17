/**
 * Deterministic qualitative molecular teaching states. No fitted kinetics,
 * experimental atom coordinates, real-time integration or universal stoichiometry.
 * These counts describe ONLY the explicitly specified generic cleavage example.
 */
const snapshot = (step: number, max: number) => Math.max(0, Math.min(max, step));

export function lipidComponents(variant: string) {
  const phospholipid = variant !== 'triglyceride';
  return { glycerolCarbons: 3, fattyAcids: phospholipid ? 2 : 3, acylEsterLinks: phospholipid ? 2 : 3, phosphateHead: phospholipid };
}

export function enzymeBindingState(step: number, variant: string) {
  const phase = snapshot(step, 4), induced = variant === 'induced-fit', bound = phase === 2 || phase === 3;
  return {
    phase, induced, bound, enzymeCount: 1,
    substrateCount: phase < 3 ? 1 : 0, productCount: phase >= 3 ? 2 : 0,
    opening: induced ? bound ? .47 : .67 : .53,
    reusable: phase === 4,
  };
}

export function inhibitionState(step: number, variant: string) {
  const phase = snapshot(step, 3), noncompetitive = variant.startsWith('noncompetitive'), high = variant.endsWith('high');
  const inhibitorBound = phase > 0 && (noncompetitive || !high || phase === 1);
  const substrateWinsOpportunity = !noncompetitive && high && phase >= 2;
  const initialSubstrateCount = high ? 6 : 2, productCount = substrateWinsOpportunity && phase === 3 ? 2 : 0;
  return {
    phase, noncompetitive, high, inhibitorBound, substrateWinsOpportunity,
    enzymeCount: 1, inhibitorCount: 1, initialSubstrateCount,
    substrateCount: initialSubstrateCount - (productCount ? 1 : 0), productCount,
    boundEnzymeInactive: noncompetitive && inhibitorBound,
    // A one-enzyme illustrative outcome; never a claim about an ensemble's rate.
    substrateCanOutcompeteInhibitor: !noncompetitive && high,
  };
}

export function receptorSignalState(step: number) {
  const phase = snapshot(step, 3);
  return { phase, ligandBound: phase === 1 || phase === 2, relayActive: phase === 2, terminating: phase === 3, ligandCompartment: 'extracellular' as const };
}
