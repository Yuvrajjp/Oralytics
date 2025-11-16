/**
 * @typedef {object} OrganismLike
 * @property {string} scientificName
 * @property {string | null | undefined} [commonName]
 */

/**
 * Builds a user-friendly organism label for breadcrumbs or headings.
 * @param {OrganismLike} organism
 */
export function formatOrganismDisplayName(organism) {
  const scientific = organism?.scientificName?.trim();
  const common = organism?.commonName?.trim();

  if (!scientific && !common) {
    return "Unknown organism";
  }

  if (!common) {
    return scientific;
  }

  if (!scientific) {
    return common;
  }

  return `${scientific} (${common})`;
}
