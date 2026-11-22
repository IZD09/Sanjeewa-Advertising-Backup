<!-- ==================================================================
     ACTIVITIES TAB PERMISSION VERIFICATION MODAL
     ================================================================== -->
<div class="ap-lock-overlay" id="adminActivitiesVerifyModal">
    <div class="ap-lock-card">
        <div class="ap-lock-icon-wrap" style="background: rgba(114, 46, 209, 0.1); color: #722ed1;">
            <i class="fa-solid fa-shield-halved"></i>
        </div>
        <h3 class="ap-lock-title">Activity Audit Permission Required</h3>
        <p class="ap-lock-desc">
            Viewing administrative activity logs is restricted. Please enter your administrator username and password to unlock the Activities tab.
        </p>

        <form class="ap-lock-form" id="formVerifyActivitiesAccess" autocomplete="off">
            <!-- Decoy inputs to trap browser autofill -->
            <input type="text" name="fake_act_username_trap" style="position: absolute; top: -9999px; left: -9999px; width: 1px; height: 1px;" tabindex="-1" autocomplete="off" aria-hidden="true">
            <input type="password" name="fake_act_password_trap" style="position: absolute; top: -9999px; left: -9999px; width: 1px; height: 1px;" tabindex="-1" autocomplete="off" aria-hidden="true">

            <div class="ap-lock-field">
                <label for="verifyActAdminUsername">Admin Username</label>
                <input type="text" id="verifyActAdminUsername" placeholder="e.g. admin" required autocomplete="off" data-lpignore="true" data-1p-ignore="true" data-form-type="other" readonly onfocus="this.removeAttribute('readonly');">
            </div>
            <div class="ap-lock-field">
                <label for="verifyActAdminPassword">Admin Password</label>
                <input type="password" id="verifyActAdminPassword" placeholder="Password" required autocomplete="new-password" data-lpignore="true" data-1p-ignore="true" data-form-type="other" readonly onfocus="this.removeAttribute('readonly');">
            </div>

            <div class="ap-lock-error" id="verifyActAccessError"></div>

            <div class="ap-lock-actions">
                <button type="button" class="ap-lock-btn-cancel" id="btnCancelActivitiesVerify">
                    <i class="fa-solid fa-xmark"></i> Cancel
                </button>
                <button type="submit" class="ap-lock-btn-submit" id="btnSubmitActivitiesVerify" style="background: #722ed1;">
                    <i class="fa-solid fa-key"></i> Verify & Open
                </button>
            </div>
        </form>
    </div>
</div>
