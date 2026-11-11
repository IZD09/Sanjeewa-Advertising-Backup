/**
 * User Profile Manager (Bridge & Compatibility Wrapper)
 * Sanjeewa Advertising Digital Printing Management System
 */

"use strict";

import { ProfileManager, UserProfileManager as BaseUserProfileManager } from "../profile.js";

export { ProfileManager, BaseUserProfileManager as UserProfileManager };
export default ProfileManager;
