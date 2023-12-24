import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import { FlatList } from "react-native";
import { Dialog, Button, List, RadioButton } from "react-native-paper";

export const FontFamilyDialog = ({ visible, setVisible, id, value, setValue }) => {

    const fontList = ['Roboto', 'OpenSans', 'NotoSans', 'Nunito', 'Comfortaa', 'Lexend', 'Urbanist'];
    const [checked, setChecked] = useState(value);
    const onItemPress = async (item) => {
        setValue(item);
        setChecked(item);
        await AsyncStorage.setItem(id, item);
    }
    return (
        <Dialog visible={visible}
            onDismiss={() => setVisible(false)}>
            <Dialog.Title>Choose Font Family</Dialog.Title>
            <Dialog.Content style={{ flexDirection: 'column', paddingHorizontal: 0 , maxHeight:310}}>
                <FlatList data={fontList}
                    renderItem={({ item }) => {
                        return (
                            <List.Item title={item} 
                            unstable_pressDelay={50}
                            style={{ paddingHorizontal: 19, paddingVertical: 2 }}
                                left={() =>
                                    <RadioButton value={item}
                                        status={item == checked ? 'checked' : 'unchecked'} />}
                                onPress={() => onItemPress(item)} />
                        )
                    }} />
            </Dialog.Content>
            <Dialog.Actions>
                <Button onPress={() => setVisible(false)}>Done</Button>
            </Dialog.Actions>
        </Dialog>
    );
}