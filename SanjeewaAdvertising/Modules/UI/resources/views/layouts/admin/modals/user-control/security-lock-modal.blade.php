<!-- ==================================================================
     ADMIN SECURITY PERMISSION MODAL FOR ADMINISTRATORS TAB, PERMISSIONS TAB & ADD ADMIN
     ================================================================== -->
<div class="ap-lock-overlay" id="adminSecurityLockModal">
    <div class="ap-lock-card">
        <div class="ap-lock-icon-wrap" style="background: rgba(114, 46, 209, 0.1); color: #722ed1;">
            <i class="fa-solid fa-shield-halved"></i>
        </div>
        <h3 class="ap-lock-title">Security Verification Required</h3>
        <p class="ap-lock-desc" id="secVerifyDesc">
            This action requires administrator credentials. Please enter your administrator password to proceed.
        </p>

        <form class="ap-lock-form" id="formVerifySecurityAccess">
            <div class="ap-lock-field">
                <label for="secVerifyUsername">Admin Username</label>
                <input type="text" id="secVerifyUsername" placeholder="e.g. admin" required readonly autocomplete="username">
            </div>
            <div class="ap-lock-field">
                <label for="secVerifyPassword">Admin Password</label>
                <input type="password" id="secVerifyPassword" placeholder="••••••••" required autocomplete="current-password">
            </div>

            <div class="ap-lock-error" id="secVerifyError"></div>

            <div class="ap-lock-actions">
                <button type="button" class="ap-lock-btn-cancel" id="btnSecVerifyCancel">
                    <i class="fa-solid fa-xmark"></i> Cancel
                </button>
                <button type="submit" class="ap-lock-btn-submit" id="btnSecVerifySubmit" style="background: #722ed1;">
                    <i class="fa-solid fa-key"></i> Verify & Proceed
                </button>
            </div>
        </form>
    </div>
</div>
