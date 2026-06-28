/******/ (() => { // webpackBootstrap
/******/ 	// runtime can't be in strict mode because a global variable is assign and maybe created.
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   InterActionNeededButton: () => (/* binding */ InterActionNeededButton)
/* harmony export */ });
class InterActionNeededButton
{
    constructor()
    {
        this.patch = null;
        this.fsElement = null;
        this.callbacks = {};
    }

    add(patch, reason, cb)
    {
        this.patch = patch;
        this.callbacks[reason] = cb;
        this.show();
    }

    remove(reason)
    {
        delete this.callbacks[reason];

        if (Object.keys(this.callbacks).length == 0)
        {
            if (this.fsElement) this.fsElement.remove();
            this.fsElement = null;
        }
    }

    show()
    {
        if (!this.fsElement)
        {
            this.fsElement = document.createElement("div");

            const container = this.patch.cgl.canvas.parentElement;
            if (container)container.appendChild(this.fsElement);

            this.fsElement.addEventListener("pointerdown", (e) =>
            {
                for (const i in this.callbacks) this.callbacks[i]();
            });
        }

        this.fsElement.style.padding = "10px";
        this.fsElement.style.position = "absolute";
        this.fsElement.style.right = "20px";
        this.fsElement.style.bottom = "20px";
        this.fsElement.style.width = "24px";
        this.fsElement.style.height = "24px";
        this.fsElement.style.cursor = "pointer";
        this.fsElement.style["border-radius"] = "40px";
        this.fsElement.style.background = "#444";
        this.fsElement.style["z-index"] = "9999";
        this.fsElement.style.display = "block";
        // this.fsElement.dataset.opid = op.id;
        this.fsElement.innerHTML = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"feather feather-volume-2\"><polygon points=\"11 5 6 9 2 9 2 15 6 15 11 19 11 5\"></polygon><path d=\"M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07\"></path></svg>";
    }
}

CABLES.interActionNeededButton = CABLES.interActionNeededButton || new InterActionNeededButton();

})();

var __webpack_export_target__ = (CABLES = typeof CABLES === "undefined" ? {} : CABLES);
for(var i in __webpack_exports__) __webpack_export_target__[i] = __webpack_exports__[i];
if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ })()
;