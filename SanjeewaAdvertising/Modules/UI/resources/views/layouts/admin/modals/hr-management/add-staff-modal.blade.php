<!-- ==================================================================
     HR MODAL 1: ADD STAFF MEMBER
     ================================================================== -->
<div class="hr-modal-overlay" id="modalAddStaff">
    <div class="hr-modal-card">
        <div class="hr-modal-header">
            <h3><i class="fa-solid fa-user-plus" style="color: #1677ff;"></i> Add New Staff Member</h3>
            <button type="button" class="hr-modal-close hr-modal-close-trigger" aria-label="Close">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>
        <form id="formAddStaff">
            <div class="hr-modal-body">
                <div class="hr-form-error" id="addStaffError" style="display: none;"></div>
                <div class="hr-form-grid hr-form-grid-single">
                    <div class="hr-form-group">
                        <label for="hrStaffFirstName">First Name <span class="req">*</span></label>
                        <input type="text" id="hrStaffFirstName" name="first_name" placeholder="e.g. Kamal" required maxlength="50">
                    </div>
                    <div class="hr-form-group">
                        <label for="hrStaffLastName">Last Name <span class="req">*</span></label>
                        <input type="text" id="hrStaffLastName" name="last_name" placeholder="e.g. Perera" required maxlength="50">
                    </div>
                    <div class="hr-form-group">
                        <label for="hrStaffNic">NIC Number <span class="req">*</span></label>
                        <input type="text" id="hrStaffNic" name="nic" placeholder="e.g. 199512345678" required maxlength="15">
                    </div>
                    <div class="hr-form-group">
                        <label for="hrStaffMobile">Mobile Phone <span class="req">*</span></label>
                        <input type="tel" id="hrStaffMobile" name="mobile" placeholder="e.g. 0771234567" required maxlength="15">
                    </div>
                </div>
            </div>
            <div class="hr-modal-footer">
                <button type="button" class="ant-btn ant-btn-default hr-modal-close-trigger">Cancel</button>
                <button type="submit" class="ant-btn ant-btn-primary">
                    <i class="fa-solid fa-check"></i> Save Staff Member
                </button>
            </div>
        </form>
    </div>
</div>
