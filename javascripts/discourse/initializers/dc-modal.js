import { withPluginApi } from "discourse/lib/plugin-api";
import { on } from "discourse-common/utils/decorators";
import computed from "discourse-common/utils/decorators";

export default {
  name: "dc-modal",
  initialize() {
    withPluginApi("0.8", api => {
      api.modifyClass("component:d-modal", {
        /**
         * There is no way to prevent scrolling without affect the current
         * scroll position. Thus we add JS in order to prevent the scroll
         * but save the position for usage after close modal
         */
        @on("didInsertElement")
        keepScrollPosition() {
          this.appEvents.on("modal:body-shown", this, "_saveScrollPosition");
        },

        _saveScrollPosition() {
          this._scrollPosition = $(document).scrollTop();
          $("body").css({ overflow: "hidden", height: "100%" });
          this.appEvents.on(
            "modal:body-dismissed",
            this,
            "_restoreScrollPosition"
          );
        },

        _restoreScrollPosition() {
          $("body").css({ overflow: "initial", height: "auto" });
          $(document).scrollTop(this._scrollPosition);
        },

        @computed("dismissable", "showCloseButton")
        shouldShowCloseButton(dismissable, showCloseButton) {
          return showCloseButton || dismissable;
        },

        _modalBodyShown(data) {
          if (this.isDestroying || this.isDestroyed) {
            return;
          }

          if (data.fixed) {
            this.element.classList.remove("hidden");
          }

          if (data.title) {
            this.set("title", I18n.t(data.title));
          } else if (data.rawTitle) {
            this.set("title", data.rawTitle);
          }

          if (data.subtitle) {
            this.set("subtitle", I18n.t(data.subtitle));
          } else if (data.rawSubtitle) {
            this.set("subtitle", data.rawSubtitle);
          } else {
            // if no subtitle provided, makes sure the previous subtitle
            // of another modal is not used
            this.set("subtitle", null);
          }

          if ("dismissable" in data) {
            this.set("dismissable", data.dismissable);
          } else {
            this.set("dismissable", true);
          }

          if ("showCloseButton" in data) {
            this.set("showCloseButton", data.showCloseButton);
          } else {
            this.set("showCloseButton", false);
          }

          if ("showLogo" in data) {
            this.set("showLogo", data.showLogo);
          } else {
            this.set("showLogo", false);
          }
        }
      });
    });
  }
};
