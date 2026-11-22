<!-- ==================================================================
     MODAL 1: ADD USER
     ================================================================== -->
<div class="uc-modal-overlay" id="modalAddUser">
    <div class="uc-modal-card">
        <div class="uc-modal-header">
            <h3><i class="fa-solid fa-user-plus" style="color: #1677ff;"></i> Add New User</h3>
            <button type="button" class="uc-modal-close modal-close-trigger"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <form id="formAddUser">
            <div class="uc-modal-body">
                <div class="uc-form-grid">
                    <div class="uc-form-group">
                        <label for="userFirstName">First Name <span class="req">*</span></label>
                        <input type="text" id="userFirstName" placeholder="e.g. Kasun" required maxlength="50">
                    </div>
                    <div class="uc-form-group">
                        <label for="userLastName">Last Name <span class="req">*</span></label>
                        <input type="text" id="userLastName" placeholder="e.g. Bandara" required maxlength="50">
                    </div>
                    <div class="uc-form-group">
                        <label for="userUsername">Username <span class="req">*</span></label>
                        <input type="text" id="userUsername" placeholder="e.g. kasun_p" required maxlength="30">
                    </div>
                    <div class="uc-form-group">
                        <label for="userMobile">Mobile Phone <span class="req">*</span></label>
                        <input type="tel" id="userMobile" placeholder="e.g. 0771234567" required maxlength="15">
                    </div>
                    <div class="uc-form-group">
                        <label for="userPassword">Password <span class="req">*</span></label>
                        <input type="password" id="userPassword" placeholder="Password" required minlength="6" maxlength="255">
                    </div>
                    <div class="uc-form-group">
                        <label for="userPasswordConfirm">Confirm Password <span class="req">*</span></label>
                        <input type="password" id="userPasswordConfirm" placeholder="Password" required minlength="6" maxlength="255">
                    </div>
                    <div class="uc-form-group full">
                        <label for="userStatusSelect">User Status <span class="req">*</span></label>
                        <select id="userStatusSelect" name="user_statuses_id" required>
                            @foreach($userStatuses ?? [] as $status)
                                <option value="{{ $status->id }}" {{ $status->user_status === 'Active' ? 'selected' : '' }}>
                                    {{ $status->user_status }}
                                </option>
                            @endforeach
                        </select>
                    </div>
                </div>
            </div>
            <div class="uc-modal-footer">
                <button type="button" class="ant-btn ant-btn-default modal-close-trigger">Cancel</button>
                <button type="submit" class="ant-btn ant-btn-primary">
                    <i class="fa-solid fa-check"></i> Create User
                </button>
            </div>
        </form>
    </div>
</div>
