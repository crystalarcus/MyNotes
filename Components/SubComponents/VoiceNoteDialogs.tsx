import { Button, Text, Dialog, MD3Theme } from "react-native-paper";
import { View, } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { memo } from "react";
import { AnimatedDialog } from "./AnimatedDialog";
import Animated, { } from "react-native-reanimated";

async function saveData(stringObj) {
    try {
        await AsyncStorage.setItem('voiceNotes', stringObj);
    } catch (error) {
    }
}

export const DeleteVNDialog = ({ isDialogVisible, setIsDialogVisible, voiceNotes,
    touchable, setTouchable, thisTheme, setIsSnackVisible, goBack,
    deleteNoteKey, binVNData, setRefList }: {
        isDialogVisible: boolean, setIsDialogVisible: (value: boolean) => void, voiceNotes: VoiceNoteType[],
        touchable: boolean, setTouchable: (value: boolean) => void,
        thisTheme: MD3Theme, setIsSnackVisible: (value: boolean) => void, goBack?: () => void,
        deleteNoteKey: number, binVNData: VoiceNoteType[], setRefList?: (value) => void
    }) => {

    async function removeNote() {
        let _data = voiceNotes
        _data.splice(deleteNoteKey, 1);
        const stringObj = JSON.stringify(_data);
        saveData(stringObj);
        setRefList ? setRefList(Date.now()) : null;
        await AsyncStorage.setItem('voiceNotes', JSON.stringify(_data));
        setTimeout(() => {
            setIsSnackVisible(true)
        }, 20);
        goBack ? goBack() : null;
        // if (listRef != null) {
        //     list.current?.prepareForLayoutAnimationRender();
        //     LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        // }
    }
    async function moveToBin() {
        var note = voiceNotes[deleteNoteKey]
        binVNData.push(note);
        const jsonString = JSON.stringify(binVNData);
        await AsyncStorage.setItem('binVNData', jsonString);
        removeNote();
    }
    return (
        <AnimatedDialog visible={isDialogVisible}
            animationType={'slide'}
            setVisible={setIsDialogVisible} touchable={touchable}
            setTouchable={setTouchable} thisTheme={thisTheme}>
            <Dialog.Icon icon={"trash-can-outline"} />
            <Dialog.Title style={{ textAlign: 'center' }}>Move to Bin</Dialog.Title>
            <Dialog.Content>
                <Text>
                    The note will be moved to Bin. You can restore the note again from Bin.
                </Text>
            </Dialog.Content>

            <Dialog.Actions>
                <Animated.View style={{ flexDirection: 'row' }}>
                    <Button
                        labelStyle={{ fontFamily: 'Manrope-Bold' }}
                        // icon={'close'}
                        contentStyle={{ paddingHorizontal: 8 }}
                        onPress={() => {
                            setTouchable(false);
                        }}>
                        Cancel
                    </Button>
                    <Button
                        mode="contained-tonal"
                        // icon={'trash-can-outline'}
                        labelStyle={{ fontFamily: 'Manrope-Bold' }}
                        onPress={() => {
                            moveToBin();
                            setTouchable(false);
                        }}>
                        Delete
                    </Button>
                </Animated.View>
            </Dialog.Actions>
        </AnimatedDialog>
    );
}
export const DeleteMultiVNDialog = memo(({ isDialogVisible, setIsDialogVisible,
    voiceNotes, setVoiceNotes, thisTheme, touchable, setTouchable, setRefList, setIsSnackVisible,
    deleteNoteKeys, setDeleteNoteKeys,
    binVNData }: {
        isDialogVisible: boolean, setIsDialogVisible: (value: boolean) => void, voiceNotes: VoiceNoteType[],
        touchable: boolean, setTouchable: (value: boolean) => void, setVoiceNotes: (value: VoiceNoteType[]) => void,
        thisTheme: MD3Theme, setIsSnackVisible: (value: boolean) => void, goBack?: () => void,
        setDeleteNoteKeys: (value: number[]) => void,
        deleteNoteKeys: number[], binVNData: VoiceNoteType[], setRefList?: (value) => void
    }) => {

    async function removeNote() {
        let _data = voiceNotes.filter(item => {
            return !deleteNoteKeys.includes(item.key)
        })

        setVoiceNotes(_data);
        const stringObj = JSON.stringify(voiceNotes);
        saveData(stringObj);
        setRefList(Date.now())
        await AsyncStorage.setItem('voiceNotes', JSON.stringify(_data));
        setTimeout(() => {
            setIsSnackVisible(true)
        }, 120);
    }
    async function moveToBin(keys: number[]) {
        voiceNotes.forEach(item => {
            if (keys.includes(item.key)) {
                binVNData.push(item);
            }
        });
        const jsonString = JSON.stringify(binVNData);
        await AsyncStorage.setItem('binVNData', jsonString);
        removeNote();
    }
    return (
        <AnimatedDialog visible={isDialogVisible}
            animationType={'slide'}
            // backgroundColor={thisTheme.colors.surface}
            setVisible={setIsDialogVisible} touchable={touchable}
            setTouchable={setTouchable} thisTheme={thisTheme}>
            <Dialog.Icon icon={"trash-can-outline"} />
            <Dialog.Title style={{ textAlign: 'center' }}>
                Move to Bin?
            </Dialog.Title>
            <Dialog.Content>
                <View style={{ flexDirection: 'column', gap: 10 }}>
                    <Text variant="bodyLarge" style={{ textAlign: 'center', fontSize: 14, fontFamily: 'Poppins', letterSpacing: -0.2 }}>
                        {deleteNoteKeys.length == 1 ? "The selected note will be moved to Bin. You can restore the note from there." :
                            "The selected notes will be moved to Bin. You can restore the notes from there."
                        }
                    </Text>
                </View>
            </Dialog.Content>
            <Dialog.Actions>
                <Animated.View style={{ flexDirection: 'row' }}>
                    <Button
                        labelStyle={{ fontFamily: 'Manrope-Bold' }}
                        // icon={'close'}
                        contentStyle={{ paddingHorizontal: 8 }}
                        onPress={() => {
                            setTouchable(false);
                        }}>
                        Cancel
                    </Button>
                    <Button
                        mode="contained-tonal"
                        icon={'trash-can-outline'}
                        labelStyle={{ fontFamily: 'Manrope-Bold' }}
                        onPress={() => {
                            moveToBin(deleteNoteKeys);
                            setTouchable(false)
                            setDeleteNoteKeys([]);
                        }}>
                        Delete
                    </Button>
                </Animated.View>
            </Dialog.Actions>
        </AnimatedDialog>

    );
})