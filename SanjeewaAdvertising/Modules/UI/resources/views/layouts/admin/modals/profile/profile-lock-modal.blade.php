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

        <form class="ap-lock-form" id="formVerifyAdminAccess">
            <div class="ap-lock-field">
                <label for="verifyAdminUsername">Admin Username</label>
                <input type="text" id="verifyAdminUsername" placeholder="e.g. admin" required autocomplete="username">
            </div>
            <div class="ap-lock-field">
                <label for="verifyAdminPassword">Admin Password</label>
                <input type="password" id="verifyAdminPassword" placeholder="••••••••" required autocomplete="current-password">
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
