<!-- ==================================================================
     PERMISSION VERIFICATION MODAL (MANDATORY GATEWAY)
     ================================================================== -->
<div class="ap-lock-overlay" id="adminProfileLockModal">
    <div class="ap-lock-card">
        <div class="ap-lock-icon-wrap">
            <i class="fa-solid fa-lock"></i>
        </div>
        <h3 class="ap-lock-title">Security Permission Required</h3>
        <p class="ap-lock-desc">
            This panel contains sensitive administrator credentials and account configurations. Please verify your administrator username and password to proceed.
        </p>

        <form class="ap-lock-form" id="formVerifyAdminAccess" autocomplete="off">
            <!-- Decoy inputs to trap browser autofill -->
            <input type="text" name="fake_admin_username_trap" style="position: absolute; top: -9999px; left: -9999px; width: 1px; height: 1px;" tabindex="-1" autocomplete="off" aria-hidden="true">
            <input type="password" name="fake_admin_password_trap" style="position: absolute; top: -9999px; left: -9999px; width: 1px; height: 1px;" tabindex="-1" autocomplete="off" aria-hidden="true">

            <div class="ap-lock-field">
                <label for="verifyAdminUsername">Admin Username</label>
                <input type="text" id="verifyAdminUsername" placeholder="e.g. admin" required autocomplete="off" data-lpignore="true" data-1p-ignore="true" data-form-type="other" readonly onfocus="this.removeAttribute('readonly');">
            </div>
            <div class="ap-lock-field">
                <label for="verifyAdminPassword">Admin Password</label>
                <input type="password" id="verifyAdminPassword" placeholder="Password" required autocomplete="new-password" data-lpignore="true" data-1p-ignore="true" data-form-type="other" readonly onfocus="this.removeAttribute('readonly');">
            </div>

            <div class="ap-lock-error" id="verifyAccessError"></div>

            <div class="ap-lock-actions">
                <button type="button" class="ap-lock-btn-cancel" id="btnCancelVerify">
                    <i class="fa-solid fa-arrow-left"></i> Cancel
                </button>
                <button type="submit" class="ap-lock-btn-submit" id="btnVerifyAccessSubmit">
                    <i class="fa-solid fa-key"></i> Verify & Unlock
                </button>
            </div>
        </form>
    </div>
</div>
