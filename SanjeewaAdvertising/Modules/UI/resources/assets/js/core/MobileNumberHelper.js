/**
 * Generate normalized mobile number search variants for Sri Lankan formats
 * (e.g. "+94779646903", "0779646903", "94779646903", "779646903").
 *
 * @param {string} search
 * @returns {string[]}
 */
export function getMobileSearchVariants(search) {
  const trimmed = String(search ?? "").trim().toLowerCase();
  if (!trimmed) {
    return [];
  }

  const variants = [trimmed];
  const compact = trimmed.replace(/[\s\-()]+/g, "");

  if (!compact || !/^\+?\d+$/.test(compact)) {
    return variants;
  }

  variants.push(compact);

  if (compact.startsWith("+94")) {
    const localCore = compact.slice(3).replace(/^0+/, "");
    if (localCore) {
      variants.push(`0${localCore}`);
      variants.push(`94${localCore}`);
      if (localCore.length >= 7) {
        variants.push(localCore);
      }
    }
  } else if (compact.startsWith("94") && compact.length >= 3) {
    const localCore = compact.slice(2).replace(/^0+/, "");
    variants.push(`+${compact}`);
    if (localCore) {
      variants.push(`0${localCore}`);
      if (localCore.length >= 7) {
        variants.push(localCore);
      }
    }
  } else if (compact.startsWith("0") && compact.length >= 2) {
    const localCore = compact.slice(1).replace(/^0+/, "");
    if (localCore) {
      variants.push(`+94${localCore}`);
      variants.push(`94${localCore}`);
      if (localCore.length >= 7) {
        variants.push(localCore);
      }
    }
  } else if (compact.length === 9 && !compact.startsWith("0")) {
    variants.push(`0${compact}`);
    variants.push(`+94${compact}`);
    variants.push(`94${compact}`);
  }

  return Array.from(new Set(variants));
}

/**
 * Check whether a mobile value matches a search query across Sri Lankan format variants.
 *
 * @param {string|null|undefined} mobile
 * @param {string} query
 * @returns {boolean}
 */
export function matchesMobile(mobile, query) {
  const q = String(query ?? "").trim();
  if (!q) {
    return true;
  }
  if (!mobile) {
    return false;
  }

  const mobileLower = String(mobile).toLowerCase();
  const mobileCompact = mobileLower.replace(/[\s\-()]+/g, "");
  const variants = getMobileSearchVariants(q);

  return variants.some(
    (variant) => mobileLower.includes(variant) || mobileCompact.includes(variant)
  );
}
