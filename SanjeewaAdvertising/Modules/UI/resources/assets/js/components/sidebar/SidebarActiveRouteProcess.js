/**
 * SanjeewaAdvertising - Sidebar Active Route Process
 *
 * Parses the current browser URL and synchronizes active states
 * across sidebar links, sub-links, and expandable dropdown groups.
 */

"use strict";

export class SidebarActiveRouteProcess {
  constructor() {
    this.navLinks = [];
    this.dropdowns = [];
  }

  refreshElements() {
    this.navLinks = [...document.querySelectorAll(".sidebar .nav-link, .sidebar .nav-sublink")];
    this.dropdowns = [...document.querySelectorAll(".sidebar .nav-dropdown")];
  }

  initFromUrl() {
    const rawPath = window.location.pathname.replace(/^\/+|\/+$/g, "");
    const parts = rawPath.split("/");
    let route = (parts[0] === "admin" && parts[1]) ? parts[1] : (parts[0] || "dashboard");
    const searchParams = new URLSearchParams(window.location.search);
    const view = searchParams.get("view");
    const slide = searchParams.get("slide");

    if ((route === "dashboard" || route === "") && slide === "1") {
      route = "sales-revenue";
    }

    this.setActiveRoute(route, view);
  }

  setActiveRoute(route, view = null) {
    this.refreshElements();
    let matchedSpecific = false;

    if (route === "payments") {
      const payDropdown = document.getElementById("paymentsDropdown");
      if (payDropdown) payDropdown.classList.add("expanded");
    }

    if (view && view !== "list" && view !== "all") {
      this.navLinks.forEach((link) => {
        const linkRoute = link.getAttribute("data-route");
        const linkView = link.getAttribute("data-view");
        const normalizedView = (view === "invoice" ? "invoice-payment" : (view === "grn" ? "grn-payment" : (view === "expense" ? "expenses" : view)));
        const normalizedLinkView = (linkView === "invoice" ? "invoice-payment" : (linkView === "grn" ? "grn-payment" : (linkView === "expense" ? "expenses" : linkView)));

        if (linkRoute === route && (linkView === view || normalizedLinkView === normalizedView)) {
          link.classList.add("active");
          matchedSpecific = true;
        } else {
          link.classList.remove("active");
        }
      });
    }

    if (!matchedSpecific) {
      const primaryLink = this.navLinks.find((link) =>
        link.getAttribute("data-route") === route &&
        (!link.hasAttribute("data-view") || link.getAttribute("data-view") === "list" || link.getAttribute("data-view") === route)
      );

      let activatedPrimary = false;
      this.navLinks.forEach((link) => {
        if (primaryLink && link === primaryLink) {
          link.classList.add("active");
          activatedPrimary = true;
        } else if (!primaryLink && link.getAttribute("data-route") === route && !activatedPrimary) {
          link.classList.add("active");
          activatedPrimary = true;
        } else {
          link.classList.remove("active");
        }
      });
    }
  }
}

export default SidebarActiveRouteProcess;
