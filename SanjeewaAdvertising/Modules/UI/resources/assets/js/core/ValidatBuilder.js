/*************** ERROR CLASSES ***************/

export class UndefinedError extends Error {
    constructor(message) {
        super(message);
        this.name = "UndefinedError";
    }
}

export class InvalideTypeError extends Error {
    constructor(message) {
        super(message);
        this.name = "InvalideTypeError";
    }
}

/*************** VALIDATION BUILDER ***************/

/**
 * A builder class for validating various types of input data,
 * such as text, passwords, NIC numbers, birthdays,
 * emails, and mobile numbers.
 * It collects validation errors and provides
 * a structured validation message.
 */
export class ValidatBuilder {

    /*************** VALIDATION MESSAGE ***************/

    ValidationMessage = class {

        constructor() {
            this.message = "";
            this.status = false;
            this.type = [];
        }

        /**
         * Getters and setters for the validation message,
         * status, and type.
         */
        getMessage() {
            return this.message;
        }

        /**
         * @return The validation status
         * (true if there are validation errors, false otherwise)
         */
        getStatus() {
            return this.status;
        }

        /**
         * @param whichOne - The index of the type to retrieve (1-based index)
         * @return The type at the specified index
         * @throws UndefinedError if the type index is not provided
         * @throws InvalideTypeError if the type index is out of range
         */
        getType(whichOne) {
            if (whichOne === undefined) {
                throw new UndefinedError("Type index is required");
            } else if (
                whichOne < 1 ||
                whichOne > this.type.length
            ) {
                throw new InvalideTypeError("Invalid type index");
            } else {
                return this.type[whichOne - 1];
            }
        }

        /**
         * @return An array of all types
         */
        getAllTypes() {
            return this.type;
        }

        setMessage(message) {
            this.message = message;
        }

        setStatus(status) {
            this.status = status;
        }

        setType(type) {
            this.type.push(type);
        }
    }

    /*************** CONSTRUCTOR ***************/

    constructor() {
        this.VALIDATION_MESSAGE = new this.ValidationMessage();
        this.VALIDATE_LIST = [];
        this.errors = [];
        this.collectAllErrors = false;
    }

    addValidator(validator) {
        this.VALIDATE_LIST.push(validator);
    }

    /*************** COLLECT ALL ERRORS ***************/

    addError(message) {
        if (this.collectAllErrors) {
            this.errors.push(message);
        } else if (!this.VALIDATION_MESSAGE.getStatus()) {
            this.errors = [message];
            this.VALIDATION_MESSAGE.setStatus(true);
        }
    }

    setCollectAllErrors(value) {
        this.collectAllErrors = value;
        return this;
    }

    /*************** VALIDATION ***************/

    validate() {
        for (const validator of this.VALIDATE_LIST) {
            validator.validate();
        }

        if (this.errors.length > 1) {
            this.VALIDATION_MESSAGE.setMessage(
                this.errors.join(", ")
            );
        } else if (this.errors.length === 1) {
            this.VALIDATION_MESSAGE.setMessage(
                this.errors[0]
            );
        } else {
            this.VALIDATION_MESSAGE.setMessage("");
        }

        if (this.VALIDATION_MESSAGE.getMessage()) {
            this.VALIDATION_MESSAGE.setMessage(
                this.VALIDATION_MESSAGE.getMessage().replace(/\.*$/, "") + "."
            );
        }

        return this.VALIDATION_MESSAGE;
    }

    /*************** VALIDATORS ***************/

    addTextValidator(text, type, maxSize, minSize) {
        this.addValidator(
            new this.ValidText(
                text,
                type,
                maxSize,
                minSize,
                this
            )
        );
        return this;
    }

    addPasswordValidator(
        password1,
        password2,
        maxSize = 100,
        minSize = 0
    ) {
        this.addValidator(
            new this.ValidPassword(
                password1,
                password2 !== undefined ? password2 : password1,
                maxSize,
                minSize,
                this
            )
        );
        return this;
    }

    addNICValidator(nic) {
        this.addValidator(
            new this.ValidNIC(nic, this)
        );
        return this;
    }

    addBirthdayValidator(date) {
        this.addValidator(
            new this.ValidBirthday(date, this)
        );
        return this;
    }

    addEmailValidator(email, witchEmail = "email") {
        this.addValidator(
            new this.ValidEmail(
                email,
                witchEmail,
                this
            )
        );
        return this;
    }

    addMobileValidator(mobile, name = "mobile number") {
        this.addValidator(
            new this.ValidMobile(
                mobile,
                name,
                this
            )
        );
        return this;
    }

    /*************** TEXT ***************/

    ValidText = class {
        constructor(text, type, maxSize, minSize, builder) {
            this.text = text;
            this.type = type;
            this.maxSize = maxSize;
            this.minSize = minSize;
            this.builder = builder;
        }

        validate() {
            let type = 0;

            if (this.text === "" || this.text === null || this.text === undefined) {
                this.builder.addError(
                    `${this.builder.VALIDATION_MESSAGE.getStatus() ? "" : "Please "}enter the ${this.type}`
                );
                type = 1;
                this.builder.VALIDATION_MESSAGE.setStatus(true);
            } else if (this.text.length >= this.maxSize) {
                this.builder.addError(
                    `${this.builder.VALIDATION_MESSAGE.getStatus() ? "" : "The "}${this.type} is too long`
                );
                type = 2;
                this.builder.VALIDATION_MESSAGE.setStatus(true);
            } else if (this.text.length <= this.minSize) {
                this.builder.addError(
                    `${this.builder.VALIDATION_MESSAGE.getStatus() ? "" : "The "}${this.type} is too short`
                );
                type = 3;
                this.builder.VALIDATION_MESSAGE.setStatus(true);
            }

            this.builder.VALIDATION_MESSAGE.setType(type);
        }
    }

    /*************** PASSWORD ***************/

    ValidPassword = class {
        constructor(password1, password2, maxSize, minSize, builder) {
            this.password1 = password1;
            this.password2 = password2 !== undefined ? password2 : password1;
            this.maxSize = maxSize;
            this.minSize = minSize;
            this.builder = builder;
        }

        validate() {
            let type = 0;

            const checkPassword = new ValidatBuilder()
                .setCollectAllErrors(false)
                .addTextValidator(
                    this.password1,
                    "password",
                    this.maxSize,
                    this.minSize
                )
                .validate();

            if (checkPassword.getStatus()) {
                this.builder.addError(
                    checkPassword.getMessage().replace(/\.*$/, "")
                );
                type = checkPassword.getType(1);
                this.builder.VALIDATION_MESSAGE.setStatus(
                    checkPassword.getStatus()
                );
            } else if (
                this.password2 === "" ||
                this.password2 === null
            ) {
                this.builder.addError(
                    `${this.builder.VALIDATION_MESSAGE.getStatus() ? "" : "Please "}confirm password`
                );
                type = 4;
                this.builder.VALIDATION_MESSAGE.setStatus(true);
            } else if (
                this.password1 !== this.password2
            ) {
                this.builder.addError(
                    `${this.builder.VALIDATION_MESSAGE.getStatus() ? "passwords" : "Passwords"} do not match`
                );
                type = 5;
                this.builder.VALIDATION_MESSAGE.setStatus(true);
            }

            this.builder.VALIDATION_MESSAGE.setType(type);
        }
    }

    /*************** NIC ***************/

    ValidNIC = class {
        constructor(nic, builder) {
            this.nic = nic;
            this.builder = builder;
        }

        validate() {
            let type = 0;

            if (this.nic === "" || this.nic === null || this.nic === undefined) {
                this.builder.addError(
                    `${this.builder.VALIDATION_MESSAGE.getStatus() ? "" : "Please "}enter NIC number`
                );
                type = 6;
                this.builder.VALIDATION_MESSAGE.setStatus(true);
            } else if (
                this.nic.length !== 10 &&
                this.nic.length !== 12
            ) {
                this.builder.addError(
                    "Invalid NIC number"
                );
                type = 7;
                this.builder.VALIDATION_MESSAGE.setStatus(true);
            }

            this.builder.VALIDATION_MESSAGE.setType(type);
        }
    }

    /*************** BIRTHDAY ***************/

    ValidBirthday = class {
        constructor(date, builder) {
            this.date = date;
            this.builder = builder;
        }

        validate() {
            const regex = /^\d{4}-\d{2}-\d{2}$/;
            let type = 0;

            if (this.date === "" || this.date === null || this.date === undefined) {
                this.builder.addError(
                    `${this.builder.VALIDATION_MESSAGE.getStatus() ? "" : "Please "}enter the date of birth`
                );
                type = 8;
                this.builder.VALIDATION_MESSAGE.setStatus(true);
            } else if (!regex.test(this.date)) {
                this.builder.addError(
                    "Invalid date format"
                );
                type = 9;
                this.builder.VALIDATION_MESSAGE.setStatus(true);
            } else if (
                new Date(this.date) > new Date()
            ) {
                this.builder.addError(
                    "Invalid birthday"
                );
                type = 10;
                this.builder.VALIDATION_MESSAGE.setStatus(true);
            }

            this.builder.VALIDATION_MESSAGE.setType(type);
        }
    }

    /*************** EMAIL ***************/

    ValidEmail = class {
        constructor(email, witchEmail, builder) {
            this.email = email;
            this.witchEmail = witchEmail;
            this.builder = builder;
        }

        validate() {
            const regex =
                /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
            let type = 0;

            if (this.email === "" || this.email === null || this.email === undefined) {
                this.builder.addError(
                    `${this.builder.VALIDATION_MESSAGE.getStatus() ? "" : "Please "}enter the ${this.witchEmail} address`
                );
                type = 11;
                this.builder.VALIDATION_MESSAGE.setStatus(true);
            } else if (!regex.test(this.email)) {
                this.builder.addError(
                    `Invalid ${this.witchEmail} address`
                );
                type = 12;
                this.builder.VALIDATION_MESSAGE.setStatus(true);
            }

            this.builder.VALIDATION_MESSAGE.setType(type);
        }
    }

    /*************** MOBILE ***************/

    ValidMobile = class {
        constructor(mobile, name, builder) {
            this.mobile = mobile;
            this.name = name;
            this.builder = builder;
        }

        validate() {
            const regex =
                /^[0][7][01245678][0-9]{7}$/;
            let type = 0;

            if (this.name === "" || this.name === null || this.name === undefined) {
                this.name = "mobile number";
            }

            if (this.mobile === "" || this.mobile === null || this.mobile === undefined) {
                this.builder.addError(
                    `${this.builder.VALIDATION_MESSAGE.getStatus() ? "" : "Please "}enter the ${this.name}`
                );
                this.builder.VALIDATION_MESSAGE.setStatus(true);
                type = 13;
            } else if (!regex.test(this.mobile)) {
                this.builder.addError(
                    `Invalid ${this.name}`
                );
                this.builder.VALIDATION_MESSAGE.setStatus(true);
                type = 14;
            }

            this.builder.VALIDATION_MESSAGE.setType(type);
        }
    }
}

export default ValidatBuilder;

