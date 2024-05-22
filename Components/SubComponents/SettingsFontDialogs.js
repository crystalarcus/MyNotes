import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import { FlatList } from "react-native";
import { Dialog, Button, List, RadioButton, Divider } from "react-native-paper";
import { AnimatedDialog } from "./AnimatedDialog";

export const FontFamilyDialog = ({ visible, setVisible, id, value, setValue, thisTheme, touchable, setTouchable }) => {

    const fontList = ['Roboto', 'Manrope', 'Poppins', 'Comfortaa', 'ComicNeue', 'OpenSans', 'Century Gothic', 'NotoSans', 'Nunito', 'Lexend', 'Urbanist'];
    const [checked, setChecked] = useState(value);
    const saveItem = async () => {
        setValue(checked);
        await AsyncStorage.setItem(id, checked);
    }
    return (
        <AnimatedDialog visible={visible}
            backgroundColor={thisTheme.colors.surface}
            thisTheme={thisTheme}
            setVisible={setVisible}
            touchable={touchable}
            setTouchable={setTouchable}>
            <Dialog.Title>{id == "@titleFontFamily" ? "Title Font Family" : "Content Font Family"}</Dialog.Title>
            <Dialog.Content style={{ flexDirection: 'column', paddingHorizontal: 0, maxHeight: 300, paddingBottom:0 }}>
                <Dialog.ScrollArea style={{paddingHorizontal:0, margin:0}}>
                    <FlatList data={fontList}
                        renderItem={({ item }) => {
                            return (
                                <RadioButton.Item label={item}
                                    labelStyle={{ fontFamily: item, textAlign: 'left', marginLeft: 20 }}
                                    value={item}
                                    status={item == checked ? 'checked' : 'unchecked'}
                                    style={{ paddingHorizontal: 19, paddingVertical: 6 }}
                                    position='leading'
                                    onPress={() => setChecked(item)} />
                            )
                        }} />
                </Dialog.ScrollArea>
            </Dialog.Content>
            <Dialog.Actions>
                <Button style={{ width: 70 }} onPress={() => setTouchable(false)}>Cancel</Button>
                <Button style={{ width: 70 }} onPress={() => {
                    saveItem()
                    setTouchable(false)
                }}>Ok</Button>
            </Dialog.Actions>
        </AnimatedDialog>
    );
}