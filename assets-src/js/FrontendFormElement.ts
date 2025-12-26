import { FrontendForm } from "./FrontendForm.js";

const initializedElements = new Set<FrontendFormElement>();

/**
 * A custom element that automatically initializes an ACF frontend form
 */
export class FrontendFormElement extends HTMLElement {
  /**
   * [initialized] getter and setter
   */
  get initialized(): boolean {
    return this.hasAttribute("initialized");
  }
  set initialized(value: boolean) {
    this.toggleAttribute("initialized", value);
  }

  connectedCallback() {
    this.initialize();
  }

  initialize() {
    if (initializedElements.has(this)) return;
    initializedElements.add(this);
    this.initialized = true;

    const form = this.querySelector("form");
    if (!form) {
      return console.error("No form found");
    }

    if (!form.querySelector("input[name=_acf_screen][value=acf_form]")) {
      return console.error("Something seems off with the acf form");
    }

    const options = JSON.parse(
      this.querySelector("script[data-acfff-options")?.textContent?.trim() ||
        "{}",
    );

    new FrontendForm(form, options);
  }
}

/**
 * Export only the register function
 */
export function register() {
  if (!window.customElements.get("acf-frontend-form")) {
    window.customElements.define("acf-frontend-form", FrontendFormElement);
  }
}
