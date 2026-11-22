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
            This action requires administrator credentials. Please enter your administrator username and password to proceed.
        </p>

        <form class="ap-lock-form" id="formVerifySecurityAccess" autocomplete="off">
            <!-- Decoy inputs to trap browser autofill -->
            <input type="text" name="fake_sec_username_trap" style="position: absolute; top: -9999px; left: -9999px; width: 1px; height: 1px;" tabindex="-1" autocomplete="off" aria-hidden="true">
            <input type="password" name="fake_sec_password_trap" style="position: absolute; top: -9999px; left: -9999px; width: 1px; height: 1px;" tabindex="-1" autocomplete="off" aria-hidden="true">

            <div class="ap-lock-field">
                <label for="secVerifyUsername">Admin Username</label>
                <input type="text" id="secVerifyUsername" placeholder="e.g. admin" required autocomplete="off" data-lpignore="true" data-1p-ignore="true" data-form-type="other" readonly onfocus="this.removeAttribute('readonly');">
            </div>
            <div class="ap-lock-field">
                <label for="secVerifyPassword">Admin Password</label>
                <input type="password" id="secVerifyPassword" placeholder="Password" required autocomplete="new-password" data-lpignore="true" data-1p-ignore="true" data-form-type="other" readonly onfocus="this.removeAttribute('readonly');">
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
