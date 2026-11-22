<!-- ==================================================================
     MODAL 2: ADD ADMINISTRATOR
     ================================================================== -->
<div class="uc-modal-overlay" id="modalAddAdmin">
    <div class="uc-modal-card">
        <div class="uc-modal-header">
            <h3><i class="fa-solid fa-shield-halved" style="color: #722ed1;"></i> Provision New Administrator</h3>
            <button type="button" class="uc-modal-close modal-close-trigger"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <form id="formAddAdmin">
            <div class="uc-modal-body">
                <div class="uc-form-grid">
                    <div class="uc-form-group">
                        <label for="adminFirstName">First Name <span class="req">*</span></label>
                        <input type="text" id="adminFirstName" placeholder="e.g. Sanjeewa" required>
                    </div>
                    <div class="uc-form-group">
                        <label for="adminLastName">Last Name <span class="req">*</span></label>
                        <input type="text" id="adminLastName" placeholder="e.g. Pushpakumara" required>
                    </div>
                    <div class="uc-form-group">
                        <label for="adminUsername">Admin Username <span class="req">*</span></label>
                        <input type="text" id="adminUsername" placeholder="e.g. admin_sanjeewa" required>
                    </div>
                    <div class="uc-form-group">
                        <label for="adminEmail">Email Address <span class="req">*</span></label>
                        <input type="email" id="adminEmail" placeholder="admin@advertising.lk" required>
                    </div>
                    <div class="uc-form-group">
                        <label for="adminMobile">Mobile Phone <span class="req">*</span></label>
                        <input type="tel" id="adminMobile" placeholder="e.g. 0777112233" required>
                    </div>
                    <div class="uc-form-group">
                        <label for="adminTypeSelect">Admin Privilege Type <span class="req">*</span></label>
                        <select id="adminTypeSelect" name="admin_types_id" required>
                            @foreach($adminTypes ?? [] as $type)
                                <option value="{{ $type->id }}" {{ $type->admin_type === 'Administrator' ? 'selected' : '' }}>
                                    {{ $type->admin_type }}
                                </option>
                            @endforeach
                        </select>
                    </div>
                    <div class="uc-form-group">
                        <label for="adminPassword">Password <span class="req">*</span></label>
                        <input type="password" id="adminPassword" placeholder="Password" required minlength="6" maxlength="255">
                    </div>
                    <div class="uc-form-group">
                        <label for="adminPasswordConfirm">Confirm Password <span class="req">*</span></label>
                        <input type="password" id="adminPasswordConfirm" placeholder="Password" required minlength="6" maxlength="255">
                    </div>
                    <div class="uc-form-group full">
                        <label for="adminStatusSelect">Account Status <span class="req">*</span></label>
                        <select id="adminStatusSelect" name="admin_statuses_id" required>
                            @foreach($adminStatuses ?? [] as $status)
                                <option value="{{ $status->id }}" {{ $status->admin_statas === 'Active' ? 'selected' : '' }}>
                                    {{ $status->admin_statas }}
                                </option>
                            @endforeach
                        </select>
                    </div>
                </div>
            </div>
            <div class="uc-modal-footer">
                <button type="button" class="ant-btn ant-btn-default modal-close-trigger">Cancel</button>
                <button type="submit" class="ant-btn ant-btn-secondary">
                    <i class="fa-solid fa-shield-check"></i> Provision Admin
                </button>
            </div>
        </form>
    </div>
</div>
