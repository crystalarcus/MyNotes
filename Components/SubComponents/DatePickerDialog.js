import { Button, Dialog } from "react-native-paper";
import { TimePickerModal } from "react-native-paper-dates";

export const TimePickerDialog = ({ visible, setVisible }) => {
    return (
        <TimePickerModal
            visible={visible}
            onDismiss={() => setVisible(false)}
            onConfirm={() => { }}
            hours={12}
            minutes={14} />
        // <Dialog>
        //     <Dialog.Title>Pick Time</Dialog.Title>
        //     <Dialog.Content>
        //     </Dialog.Content>
        //     <Dialog.Actions>
        //         <Button onPress={() => setVisible(false)} >Done</Button>
        //     </Dialog.Actions>
        // </Dialog>
    );
}