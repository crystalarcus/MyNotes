import { useState, useContext } from "react";
import { Appbar, Button, Checkbox, Chip, Dialog, Portal, Surface, Text, TextInput, useTheme } from "react-native-paper";
import { Keyboard, View, FlatList, Dimensions } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppContext } from "../AppContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const GroupItem = ({ group, selectedGroupsList }) => {
    const [checked, setChecked] = useState(selectedGroupsList.includes(group) ? true : false);
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Checkbox status={checked ? 'checked' : 'unchecked'} onPress={() => {
                if (checked) {
                    selectedGroupsList.splice(selectedGroupsList.indexOf(group), 1)
                }
                else {
                    selectedGroupsList.push(group);
                }
                setChecked(!checked);
            }} />
            <Text>{group}</Text>
        </View>
    );
}

const AddToListDialog = ({ visible, setVisible, groupList, selectedGroupsList, navigation }) => {
    return (
        <Dialog visible={visible} onDismiss={() => {
            setVisible(false);
        }}>
            <Dialog.Title>Add Note to List</Dialog.Title>
            <Dialog.Content>
                {/* <Text>{JSON.stringify(groupList)}</Text> */}
                <FlatList data={groupList}
                    ListEmptyComponent={() =>
                        <View>
                            <Text>You have no Groups yet, try creating one</Text>
                            <Button onPress={() => {
                                setVisible(false);
                                navigation.navigate("Groups", { previous_screen: 'CreateNewNoteScreen' });
                            }}>Create a group</Button>
                        </View>
                    }
                    renderItem={({ item }) => <GroupItem group={item} selectedGroupsList={selectedGroupsList} />} />
            </Dialog.Content>
            <Dialog.Actions>
                <Button onPress={() => setVisible(false)}>Done</Button>
            </Dialog.Actions>
        </Dialog>
    );
}


export function CreateVarNoteScreen({ route, navigation }) {
    const { data, setData, groupList,addFromTop } = useContext(AppContext)
    const theme = useTheme();
    const [noteTitle, setNoteTitle] = useState(route.params.title);
    const [noteContent, setNoteContent] = useState(route.params.content);
    const [istitleFocusable, setIstitleFocusable] = useState(true);
    const [isListDialogVisible, setIsListDialogVisible] = useState(false);
    const [selectedGroupsList, setSelectedGroupsList] = useState(route.params.groups);

    async function saveNewNote(obj) {
        let raw = data;
        addFromTop ?
            raw.unshift(obj) :
            raw.push(obj);
        setData(raw);
        const stringObj = JSON.stringify(data);
        await AsyncStorage.setItem('data', stringObj.toString());
    }
    async function saveEditedNote(obj, index) {
        data[index].title = obj.title
        data[index].content = obj.content
        data[index].groups = obj.groups
        const stringObj = JSON.stringify(data);
        await AsyncStorage.setItem('data', stringObj.toString());
    }
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const getNoteDate = () => {
        const date = new Date().getDate();
        const month = months[new Date().getMonth()];
        const day = daysOfWeek[new Date().getDay()];
        return (date.toString() + " " + month + ", " + day);
    }
    const deleteGroupItem = name => {
        filtered = selectedGroupsList.filter(item => item !== name);
        setSelectedGroupsList(filtered);
    }
    return (
        <Surface elevation={1} style={{
            flex: 1,
            justifyContent: 'flex-start',
            paddingTop: useSafeAreaInsets().top,
            //width:Dimensions.get('window').width,
            //height:Dimensions.get('window').height
        }}>
            <Appbar.Header style={{ backgroundColor: theme.colors.elevation.level1 }}>
                <Appbar.BackAction onPress={() => {
                    Keyboard.dismiss();
                    navigation.goBack();
                }} />
                <Appbar.Content title={null}></Appbar.Content>

            </Appbar.Header>
            {/* <Text>{}</Text> */}
            <View flex={1}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {selectedGroupsList.map(item => {
                        return (
                            <View style={{ flexWrap: 'wrap', }}
                                key={selectedGroupsList.indexOf(item)} >
                                <Chip style={{ margin: 5 }} onClose={() => deleteGroupItem(item)}
                                >{item}</Chip>
                            </View>
                        );
                    })}
                </View>

                <TextInput placeholder="Title"
                    focusable={istitleFocusable}
                    autoFocus={true}
                    value={noteTitle}
                    onChangeText={text => setNoteTitle(text)}
                    style={{ backgroundColor: 'transparent', fontSize: 25 }}
                    underlineStyle={{ backgroundColor: 'transparent' }} />
                <TextInput placeholder="Note Content"
                    multiline={true}
                    value={noteContent}
                    style={{ backgroundColor: 'transparent', fontSize: 17 }}
                    onChangeText={text => setNoteContent(text)}
                    FonChangeText={text => setNoteContent(text)}
                    underlineStyle={{ backgroundColor: 'transparent' }}
                    scrollEnabled={true} />
                <View pointerEvents="box-none" style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 20,
                    bottom: 20,
                    flexDirection: 'row',
                    gap: 20,
                    justifyContent: 'flex-end',
                    alignItems: 'flex-end',
                }}>
                    <Button icon='plus' onPress={() => {
                        setIsListDialogVisible(true);
                        Keyboard.dismiss();
                    }}>Add</Button>
                    <Portal>
                        <AddToListDialog visible={isListDialogVisible}
                            setVisible={setIsListDialogVisible}
                            groupList={groupList}
                            navigation={navigation}
                            selectedGroupsList={selectedGroupsList} />
                    </Portal>
                    <Button mode="contained" onPress={() => {
                        let obj = {
                            title: noteTitle,
                            content: noteContent,
                            date: getNoteDate(),
                            key: Date.now(),
                            groups: selectedGroupsList
                        }
                        saveNewNote(obj);
                        Keyboard.dismiss();
                        navigation.goBack();
                    }}>Save</Button>
                </View>
            </View>

        </Surface >
    );
}