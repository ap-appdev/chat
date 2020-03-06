/**
 * Vuely Global Components
 */
import VuePerfectScrollbar from "vue-perfect-scrollbar";
import { RotateSquare2 } from "vue-loading-spinner";
import AppSectionLoader from "Components/AppSectionLoader/AppSectionLoader";

// delete Confirmation Dialog
import DeleteConfirmationDialog from "Components/DeleteConfirmationDialog/DeleteConfirmationDialog";

const GlobalComponents = {
   install(Vue) {
      Vue.component('deleteConfirmationDialog', DeleteConfirmationDialog);
      Vue.component('vuePerfectScrollbar', VuePerfectScrollbar);
      Vue.component('rotateSquare2', RotateSquare2);
      Vue.component('appSectionLoader', AppSectionLoader);
   }
}

export default GlobalComponents
