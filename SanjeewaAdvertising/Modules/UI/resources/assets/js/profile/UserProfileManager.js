/**
 * User Profile Manager Class (Bridge & Compatibility Wrapper)
 * Sanjeewa Advertising Digital Printing Management System
 */

"use strict";

import { ProfileManager, UserProfileManager as BaseUserProfileManager } from "../profile.js";

export class UserProfileManager extends BaseUserProfileManager {}

export { ProfileManager };
export default ProfileManager;
