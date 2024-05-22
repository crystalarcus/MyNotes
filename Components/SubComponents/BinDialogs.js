import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert, StyleSheet, View } from "react-native";
import { Text, Button, Dialog } from "react-native-paper";
import Animated, { FadeInUp } from "react-native-reanimated";
import { AnimatedDialog } from "./AnimatedDialog";

export const RestoreDialog = ({ isDialogVisible, setIsDialogVisible, thisTheme,
    restoreKey, data, binData, groupList, setGroupList, sortOrder,
    restoredGrps, setSnackVisible, touchable, setTouchable }) => {

    async function restoreNote() {
        var note = binData[restoreKey];
        data.unshift(note);
        switch (sortOrder) {
            case 1:
                data.sort((a, b) => { return b.key - a.key });
                break;
            case 2:
                data.sort((a, b) => { return a.key - b.key });
                break;
            case 3:
                data.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 4:
                data.sort((a, b) => b.title.localeCompare(a.title));
                break;
            default:
                break;
        }
        binData.splice(restoreKey, 1);
        await AsyncStorage.setItem('data', JSON.stringify(data));
        await AsyncStorage.setItem('binData', JSON.stringify(binData));

        note.groups.forEach(_group => {
            if (!(groupList.includes(_group))) {
                restoredGrps.unshift(_group);
            }
        });

        if (restoredGrps.length != 0) {
            setGroupList([...groupList, ...restoredGrps])
            await AsyncStorage.setItem('groupList', JSON.stringify([...groupList, ...restoredGrps]));
            setSnackVisible(true);
        }
    }
    return (
        <AnimatedDialog visible={isDialogVisible} duration={400}
            animationType={'slide'}
            setVisible={setIsDialogVisible} touchable={touchable}
            setTouchable={setTouchable} thisTheme={thisTheme}
            children={
                <>
                    <Dialog.Icon icon={'autorenew'} />
                    <Dialog.Title style={{ textAlign: 'center' }}>Restore Note</Dialog.Title>
                    <Dialog.Content>
                        <Text style={{ textAlign: 'center' }}>This Note will be restored back and shown in corresponding notes groups </Text>
                    </Dialog.Content>
                    <Dialog.Actions style={styles.dialogAction}>
                        <Animated.View entering={FadeInUp}>
                            <Button mode="contained" icon={'restore'} onPress={() => {
                                restoreNote(restoreKey);
                                setTouchable(false);
                            }}>Restore</Button>
                        </Animated.View>
                        <Animated.View entering={FadeInUp}>
                            <Button mode="contained-tonal" icon={'close'} onPress={() => {
                                setTouchable(false);
                            }}>Cancel</Button>
                        </Animated.View>
                    </Dialog.Actions>
                </>
            }>
        </AnimatedDialog>

    )
}
export const MultiRestoreDialog = ({
    isDialogVisible, setIsDialogVisible, setRestoredGrps, thisTheme,
    selectedNotes, setSelectedNotes, sortOrder, data, groupList, setGroupList,
    binData, setSnackVisible, setSelected, touchable, setTouchable }) => {

    async function restoreNote() {
        let _list = []
        selectedNotes.forEach(note => {
            data.unshift(note);
            binData.splice(binData.indexOf(note), 1);
            note.groups.forEach(item => {
                if (!groupList.includes(item)) {
                    _list.unshift(item);
                }
            })
        });
        _list = Array.from(new Set(_list))
        setRestoredGrps(_list)
        setGroupList([...groupList, ..._list])
        switch (sortOrder) {
            case 1:
                data.sort((a, b) => { return b.key - a.key });
                break;
            case 2:
                data.sort((a, b) => { return a.key - b.key });
                break;
            case 3:
                data.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 4:
                data.sort((a, b) => b.title.localeCompare(a.title));
                break;
            default:
                break;
        }
        // setGroupList([...groupList, ..._list])
        await AsyncStorage.setItem('data', JSON.stringify(data));
        await AsyncStorage.setItem('binData', JSON.stringify(binData));
        await AsyncStorage.setItem('groupList', JSON.stringify([...groupList, ..._list]));
        if (_list.length > 0) {
            setSnackVisible(true)
        }
        setSelectedNotes([])
        setSelected([])
    }
    return (
        <AnimatedDialog visible={isDialogVisible} duration={400}
            animationType={'slide'}
            setVisible={setIsDialogVisible} touchable={touchable}
            setTouchable={setTouchable} thisTheme={thisTheme}>
            <Dialog.Icon icon={'autorenew'} />
            <Dialog.Title style={{ textAlign: 'center' }}>{selectedNotes.length > 1 ? "Restore " + selectedNotes.length + " Notes ?" : "Restore Note"}</Dialog.Title>
            <Dialog.Content>
                <Text style={{ textAlign: 'center' }}>{selectedNotes.length > 1 ? "These Notes will be restored and shown in there corresponding notes groups " : "This Note will be restored and shown in corresponding notes groups "}</Text>
            </Dialog.Content>
            <Dialog.Actions style={styles.dialogAction}>
                <Animated.View entering={FadeInUp} >
                    <Button mode="contained" icon={'restore'}
                        onPress={() => {
                            restoreNote();
                            setTouchable(false);
                        }}>Restore</Button>
                </Animated.View>
                <Animated.View entering={FadeInUp} >
                    <Button mode="contained-tonal" icon={'close'}
                        onPress={() => {
                            setTouchable(false);
                        }}>Cancel</Button>
                </Animated.View>
            </Dialog.Actions>
        </AnimatedDialog>
    )
}

export const DeleteDialog = ({ isDialogVisible, setIsDialogVisible, id, binData, thisTheme, touchable, setTouchable, setId }) => {

    const deleteNote = async () => {
        binData.splice(id, 1);
        setId(-1)
        await AsyncStorage.setItem('binData', JSON.stringify(binData));
    }

    return (
        <AnimatedDialog visible={isDialogVisible} animationType={'slide'}
            setVisible={setIsDialogVisible} touchable={touchable}
            setTouchable={setTouchable} thisTheme={thisTheme}>

            <Dialog.Icon icon={'delete-forever-outline'} />
            <Dialog.Title style={styles.dialogTitle}>Delete Forever?</Dialog.Title>
            <Dialog.Content>
                <View style={styles.contentView}>
                    <Text variant="bodyLarge" style={styles.contentText}>
                        Note will be permanently deleted and cannot be restored back.
                    </Text>
                </View>
            </Dialog.Content>
            <Dialog.Actions >
                <View style={styles.dialogAction}>
                    <Button disabled={!touchable}
                        mode="contained" icon={'trash-can-outline'}
                        onPress={() => {
                            setTouchable(false);
                            deleteNote();
                        }}>
                        <Text style={{ color: thisTheme.colors.onPrimary }}>
                            Delete
                        </Text>
                    </Button>
                    <Button disabled={!touchable}
                        mode="contained-tonal" icon={'close'}
                        onPress={() => {
                            setTouchable(false);
                        }}>
                        <Text style={{ color: thisTheme.colors.onPrimaryContainer }}>
                            Cancel
                        </Text>
                    </Button>
                </View>
            </Dialog.Actions>
        </AnimatedDialog >

    )
}
export const MultiDeleteDialog = ({ isDialogVisible, setIsDialogVisible, selected, setSelected,
    binData, setBinData, touchable, setTouchable, thisTheme }) => {

    const deleteNote = async () => {
        let _list = binData.filter((item, _index) => !selected.includes(_index))
        setBinData(_list)
        setSelected([])
        await AsyncStorage.setItem('binData', JSON.stringify(_list));
    }

    return (
        <AnimatedDialog visible={isDialogVisible} duration={400}
            animationType={'slide'}
            setVisible={setIsDialogVisible} touchable={touchable}
            setTouchable={setTouchable} thisTheme={thisTheme}>
            <Dialog.Icon icon={'delete-forever-outline'} />
            <Dialog.Title style={styles.dialogTitle}>Delete Forever?</Dialog.Title>
            <Dialog.Content>
                <View style={styles.contentView}>
                    <Text variant="bodyLarge" style={styles.contentText}>
                        Selected notes will be permanently deleted and cannot be retrived
                    </Text>
                </View>
            </Dialog.Content>
            <Dialog.Actions>
                <View style={styles.dialogAction}>
                    <Button
                        mode="contained" icon={'trash-can-outline'}
                        onPress={() => {
                            setTouchable(false);
                            deleteNote();
                        }}>
                        <Text style={{ color: thisTheme.colors.onPrimary }}>
                            Delete
                        </Text>
                    </Button>
                    <Button disabled={!touchable}
                        mode="contained-tonal" icon={'close'}
                        onPress={() => {
                            setTouchable(false);
                        }}>
                        <Text style={{ color: thisTheme.colors.onPrimaryContainer }}>
                            Cancel
                        </Text>
                    </Button>
                </View>
            </Dialog.Actions>
        </AnimatedDialog>
    )
}
export const ClearBinDialog = ({ isDialogVisible, setIsDialogVisible,
    setBinData, touchable, setTouchable, thisTheme }) => {

    const callback = () => setTouchable(true)

    async function clearBinData() {
        try {
            await AsyncStorage.setItem('binData', '[]');
            setBinData([]);
        } catch (error) {
            Alert(error);
        }
    }

    return (
        <AnimatedDialog visible={isDialogVisible} duration={400}
            animationType={'slide'}
            setVisible={setIsDialogVisible} touchable={touchable}
            setTouchable={setTouchable} thisTheme={thisTheme}>
            <Dialog.Icon icon={'delete-empty-outline'} />
            <Dialog.Title style={styles.dialogTitle}>Clear Bin?</Dialog.Title>
            <Dialog.Content>
                <View style={styles.contentView}>
                    <Text variant="bodyLarge" style={styles.contentText}>
                        All Notes inside bin will be permanently deleted and cannot be retrived back.
                    </Text>
                </View>
            </Dialog.Content>
            <Dialog.Actions>
                <View style={styles.dialogAction}>
                    <Button disabled={!touchable}
                        mode="contained" icon={'trash-can-outline'}
                        onPress={() => {
                            setTouchable(false);
                            clearBinData();
                        }}>
                        <Text style={{ color: thisTheme.colors.onPrimary }}>
                            Delete
                        </Text>
                    </Button>
                    <Button disabled={!touchable}
                        mode="contained-tonal" icon={'close'}
                        onPress={() => {
                            setTouchable(false);
                        }}>
                        <Text style={{ color: thisTheme.colors.onPrimaryContainer }}>
                            Cancel
                        </Text>
                    </Button>
                </View>
            </Dialog.Actions>
        </AnimatedDialog>
    )
}
export const RestoreAllDialog = ({
    isDialogVisible, setIsDialogVisible, thisTheme, setBinData,
    sortOrder, data, groupList, setGroupList, setRestoredGrps,
    binData, setSnackVisible, touchable, setTouchable }) => {

    async function restoreNote() {
        let _list = [];
        binData.forEach(note => {
            data.unshift(note);
            note.groups.forEach(item => {
                if (!groupList.includes(item)) {
                    _list.unshift(item);
                }
            })
        });
        _list = Array.from(new Set(_list))
        setRestoredGrps(_list)
        setGroupList([...groupList, ..._list])
        setBinData([])
        switch (sortOrder) {
            case 1:
                data.sort((a, b) => { return b.key - a.key });
                break;
            case 2:
                data.sort((a, b) => { return a.key - b.key });
                break;
            case 3:
                data.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 4:
                data.sort((a, b) => b.title.localeCompare(a.title));
                break;
            default:
                break;
        }
        // setGroupList([...groupList, ..._list])
        await AsyncStorage.setItem('data', JSON.stringify(data));
        await AsyncStorage.setItem('binData', "[]");
        await AsyncStorage.setItem('groupList', JSON.stringify([...groupList, ..._list]));
        if (_list.length > 0) {
            setSnackVisible(true)
        }
    }
    return (
        <AnimatedDialog visible={isDialogVisible} duration={400}
            setVisible={setIsDialogVisible} touchable={touchable}
            animationType={'slide'}
            setTouchable={setTouchable} thisTheme={thisTheme}>
            <Dialog.Icon icon={'backup-restore'} />
            <Dialog.Title style={{ textAlign: 'center' }}>Restore all Notes</Dialog.Title>
            <Dialog.Content>
                <Text style={{ textAlign: 'center' }}>All notes and groups which they have will be restored</Text>
            </Dialog.Content>
            <Dialog.Actions style={styles.dialogAction}>
                <Animated.View entering={FadeInUp} >
                    <Button mode="contained" icon={'restore'}
                        onPress={() => {
                            restoreNote();
                            setTouchable(false);
                        }}>Restore</Button>
                </Animated.View>
                <Animated.View entering={FadeInUp} >
                    <Button mode="contained-tonal" icon={'close'}
                        onPress={() => {
                            setTouchable(false);
                        }}>Cancel</Button>
                </Animated.View>
            </Dialog.Actions>
        </AnimatedDialog>
    )
}
const styles = StyleSheet.create({
    dialogTitle: {
        textAlign: 'center',
        fontSize: 23,
        fontFamily: 'Manrope'
    },
    dialogMain: {
        backgroundColor: 'transparent',
        paddingTop: 0,
        shadowColor: 'transparent'
    },
    contentView: { flexDirection: 'column', gap: 10 },
    contentText: {
        textAlign: 'center',
        fontSize: 14,
        fontFamily: 'Poppins',
        letterSpacing: -0.2
    },
    animView: {
        borderRadius: 27,
        paddingVertical: 10, alignItems: 'center',
    },
    dialogAction: { width: '100%', justifyContent: 'space-around', flexDirection: 'row' },
    deleteBtn: {
        padding: 2, borderRadius: 40
    },

})

