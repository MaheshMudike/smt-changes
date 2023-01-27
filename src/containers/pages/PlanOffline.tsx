import { getPlan } from "./Plan";
import { ModalType } from "../../constants/modalTypes";
import { noop } from 'lodash';
import { showModal } from '../../actions/modalActions';
import { closeMenu } from 'src/containers/AppBase';
export default getPlan(
    {
        readEventModalType: ModalType.ReadEventOfflineModal,
    }, 
    {
        //this method is not used in offline mode
        addEventFromDropedItem: undefined,
        showModal,
        changeCalendarRange: () => noop,
        closeMenu,
    });