/**
 * FormValidator Component Class
 * Dedicated helper class for DOM form and field validations.
 * Provides both static helper utilities and fluent instance methods.
 */

export class FormValidator {
  /**
   * @param {Object} [options={}]
   */
  constructor(options = {}) {
    this.options = options;
  }

  /**
   * Mark input container and element with valid/invalid classes and attributes.
   * @param {HTMLElement|null} fieldContainer
   * @param {HTMLInputElement|null} inputElement
   * @param {boolean} isInvalid
   * @param {string|null} [errorMessage=null]
   */
  static markField(fieldContainer, inputElement, isInvalid, errorMessage = null) {
    if (fieldContainer) {
      fieldContainer.classList.toggle("bad", isInvalid);
      if (errorMessage) {
        const errEl = fieldContainer.querySelector(".err");
        if (errEl) {
          errEl.textContent = errorMessage;
        }
      }
    }

    if (inputElement) {
      inputElement.setAttribute("aria-invalid", String(isInvalid));
    }
  }

  /**
   * Check if a value is non-empty.
   * @param {*} value
   * @returns {boolean}
   */
  static isRequired(value) {
    return value !== null && value !== undefined && String(value).trim().length > 0;
  }

  /**
   * Check if value is a valid email string.
   * @param {string} email
   * @returns {boolean}
   */
  static isEmail(email) {
    if (!email) return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).trim());
  }

  /**
   * Validate identifier (username or email).
   * Minimum 3 characters, non-empty.
   * @param {string} identifier
   * @param {number} [minLength=3]
   * @returns {{ isValid: boolean, message?: string }}
   */
  static validateIdentifier(identifier, minLength = 3) {
    const val = String(identifier || "").trim();

    if (!val) {
      return {
        isValid: false,
        message: "Enter your username or email address.",
      };
    }

    if (val.length < minLength) {
      return {
        isValid: false,
        message: `Username or email must be at least ${minLength} characters.`,
      };
    }

    return { isValid: true };
  }

  /**
   * Validate password string.
   * @param {string} password
   * @param {number} [minLength=1]
   * @returns {{ isValid: boolean, message?: string }}
   */
  static validatePassword(password, minLength = 1) {
    const val = String(password || "");

    if (!val) {
      return {
        isValid: false,
        message: "Enter your password.",
      };
    }

    if (val.length < minLength) {
      return {
        isValid: false,
        message: `Password must be at least ${minLength} characters.`,
      };
    }

    return { isValid: true };
  }

  /**
   * Validate a DOM username / email field element and toggle error state.
   * @param {HTMLInputElement|null} input
   * @param {HTMLElement|null} container
   * @param {number} [minLength=3]
   * @returns {boolean}
   */
  static validateUsernameField(input, container, minLength = 3) {
    if (!input) return true;

    const result = this.validateIdentifier(input.value, minLength);
    this.markField(container, input, !result.isValid, result.message);

    return result.isValid;
  }

  /**
   * Validate a DOM password field element and toggle error state.
   * @param {HTMLInputElement|null} input
   * @param {HTMLElement|null} container
   * @param {number} [minLength=1]
   * @returns {boolean}
   */
  static validatePasswordField(input, container, minLength = 1) {
    if (!input) return true;

    const result = this.validatePassword(input.value, minLength);
    this.markField(container, input, !result.isValid, result.message);

    return result.isValid;
  }

  // --- Instance Method Wrappers for Flexible OOP Usage ---

  mark(fieldContainer, inputElement, isInvalid, errorMessage = null) {
    FormValidator.markField(fieldContainer, inputElement, isInvalid, errorMessage);
  }

  validateUsername(input, container, minLength = 3) {
    return FormValidator.validateUsernameField(input, container, minLength);
  }

  validatePassword(input, container, minLength = 1) {
    return FormValidator.validatePasswordField(input, container, minLength);
  }
}

export default FormValidator;

