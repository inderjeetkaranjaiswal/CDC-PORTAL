export interface EligibilityResult {
  permissibleDuration: number | null;
  eligibilityStatus: 'Approved' | 'Conditionally Approved' | 'Not Eligible';
}

export const calculateEligibility = (
  attendance: number,
  spfBand: string | null,
  cdcBand: string | null,
  proposedDuration: number
): EligibilityResult => {
  // STEP 1: Attendance check
  if (attendance < 75) {
    return {
      permissibleDuration: 0,
      eligibilityStatus: 'Not Eligible',
    };
  }

  // If bands are not set yet, it's still pending
  if (!spfBand || !cdcBand) {
    return {
      permissibleDuration: null,
      eligibilityStatus: 'Not Eligible', // Default until bands are set
    };
  }

  let permissibleDuration = 0;
  let eligibilityStatus: 'Approved' | 'Conditionally Approved' | 'Not Eligible' = 'Not Eligible';

  // STEP 2: Band logic
  if (spfBand === 'A' && cdcBand === 'A') {
    permissibleDuration = 6;
    eligibilityStatus = 'Approved';
  } else if ((spfBand === 'A' || spfBand === 'B') && (cdcBand === 'A' || cdcBand === 'B')) {
    permissibleDuration = 6;
    eligibilityStatus = 'Approved';
  } else if ((spfBand === 'C' || spfBand === 'D') && (cdcBand === 'A' || cdcBand === 'B')) {
    permissibleDuration = 3;
    eligibilityStatus = 'Conditionally Approved';
  } else if ((spfBand === 'C' || spfBand === 'D') && (cdcBand === 'C' || cdcBand === 'D')) {
    permissibleDuration = 0;
    eligibilityStatus = 'Not Eligible';
  }

  // STEP 3: Duration check
  if (eligibilityStatus !== 'Not Eligible' && proposedDuration > permissibleDuration) {
    eligibilityStatus = 'Conditionally Approved';
  }

  return {
    permissibleDuration,
    eligibilityStatus,
  };
};
