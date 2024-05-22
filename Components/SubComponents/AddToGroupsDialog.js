import { useState } from "react";
import { Button, Checkbox, Dialog, Text, useTheme } from "react-native-paper";
import { View, FlatList } from "react-native";
import { AnimatedDialog } from "./AnimatedDialog";

const GroupItem = ({ group, selectedGroupsList, setSelectedGroupsList }) => {
    const [checked, setChecked] = useState(selectedGroupsList.includes(group) ? true : false);
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Checkbox status={checked ? 'checked' : 'unchecked'} onPress={() => {
                if (checked) {
                    let raw = [...selectedGroupsList];
                    raw.splice(raw.indexOf(group), 1)
                    setSelectedGroupsList(raw)
                }
                else {
                    setSelectedGroupsList([...selectedGroupsList, group])
                }
                setChecked(!checked);
            }} />
            <Text>{group}</Text>
        </View>
    );
}

export const AddToListDialogCreateSc = ({ visible, setVisible, theme, groupList, selectedGroupsList, navigation, setSelectedGroupsList, touchable, setTouchable }) => {
    return (
        <AnimatedDialog visible={visible} duration={450}
            setVisible={setVisible} touchable={touchable}
            setTouchable={setTouchable} thisTheme={theme}>
            <Dialog.Title>Add Note to List</Dialog.Title>
            <Dialog.Content>
                {/* <Text>{JSON.stringify(groupList)}</Text> */}
                <FlatList data={groupList}
                    ListEmptyComponent={() =>
                        <View>
                            <Text>You have no Groups yet, try creating one</Text>
                        </View>
                    }
                    contentContainerStyle={{ gap: 10 }}
                    renderItem={({ item }) => <GroupItem group={item}
                        setSelectedGroupsList={setSelectedGroupsList}
                        selectedGroupsList={selectedGroupsList} />} />

                <Button icon={"plus"}
                    style={{ marginTop: 10, alignSelf: 'flex-start' }}
                    onPress={() => {
                        navigation.navigate("Groups", { previous_screen: 'CreateNewNoteScreen' });
                        setVisible(false)
                    }}>New Group</Button>
            </Dialog.Content>
            <Dialog.Actions>
                <Button onPress={() => setVisible(false)}>Done</Button>
            </Dialog.Actions>
        </AnimatedDialog >
    );
}
export const AddToListDialogNotesSc = ({ visible, setVisible, theme, groupList, selectedGroupsList, navigation }) => {
    return (
        <Dialog visible={visible}
            style={{ backgroundColor: theme.colors.surfaceContainerLowest }}
            onDismiss={() => {
                setVisible(false);
            }}>
            <Dialog.Title style={{}}>Add Note to List</Dialog.Title>
            <Dialog.Content>
                {/* <Text>{JSON.stringify(groupList)}</Text> */}
                <Text>This groups will be applied to selected notes</Text>

                <FlatList data={groupList} style={{ maxHeight: 200 }}
                    ListEmptyComponent={() =>
                        <View>
                            <Text>You have no Groups yet, try creating one</Text>
                        </View>
                    }
                    renderItem={({ item }) => <GroupItem group={item} selectedGroupsList={selectedGroupsList} />} />

                <Button
                    style={{ marginTop: 10, alignSelf: 'flex-start' }}
                    onPress={() => {
                        navigation.navigate("Groups", { previous_screen: 'CreateNewNoteScreen' });
                        setVisible(false)
                    }}>Add to New Group</Button>
            </Dialog.Content>
            <Dialog.Actions style={{ justifyContent: 'space-evenly' }}>
                <Button mode="contained" onPress={() => setVisible(false)} style={{ width: 120 }} icon={"plus"}>Add</Button>
                <Button mode="contained-tonal" onPress={() => setVisible(false)} style={{ width: 100 }}>Cancel</Button>
            </Dialog.Actions>
        </Dialog >
    );
}
