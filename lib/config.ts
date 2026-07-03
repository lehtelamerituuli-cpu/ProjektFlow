// Verohallinnon verovapaat korvaukset — päivitä vuosittain
// Lähde: https://www.vero.fi/henkiloasiakkaat/auto/kilometrikorvaus/
export const KM_RATE = 0.28        // € / km, voimassa 2025
export const KM_RATE_YEAR = 2025

// Lakisääteinen tauko: yli BREAK_THRESHOLD h kirjauksista vähennetään BREAK_DEDUCTION h
// Työaikalaki 31 § — 30 min tauko kun päivä yli 6 h
export const BREAK_THRESHOLD_HOURS = 6
export const BREAK_DEDUCTION_HOURS = 0.5
