import { Button, Checkbox, Dialog, List, Text } from "react-native-paper"
import { AnimatedDialog } from "./AnimatedDialog"
import { FlatList } from "react-native";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const MergeDialog = ({ isDialogVisible, setIsDialogVisible,
    groupList, thisTheme, touchable, setTouchable, data, setData,
    activeGroup, activeNotesList, order }) => {

    const [checkList, setCheckList] = useState([]);

    const onListItemPress = (item) => {
        if (checkList.includes(item)) {
            setCheckList(checkList.filter(element => item != element))
        }
        else {
            setCheckList([...checkList, item])
        }
    }
    const onMergeClick = async () => {
        let _data = data;
        activeNotesList.forEach(element => {
            // let i = _data.indexOf(element);
            _data = _data.filter(item => item != element)
            element.groups = Array.from(new Set([...element.groups, ...checkList]));
            _data.push(element)
            console.log(JSON.stringify(element.groups));
        });
        switch (order) {
            case 1:
                _data.sort((a, b) => { return b.key - a.key });
                break;
            case 2:
                _data.sort((a, b) => { return a.key - b.key });
                break;
            case 3:
                _data.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 4:
                _data.sort((a, b) => b.title.localeCompare(a.title));
                break;
            default:
                break;
        }
        setData(_data)
        await AsyncStorage.setItem('data', JSON.stringify(_data))
    }

    return (
        <AnimatedDialog visible={isDialogVisible}
            setVisible={setIsDialogVisible} touchable={touchable}
            setTouchable={setTouchable} thisTheme={thisTheme}>
            <Dialog.Title>Merge Group</Dialog.Title>
            <Dialog.Content style={{ paddingHorizontal: 0 }}>
                <Text style={{ paddingHorizontal: 24 }}>Merge note from this group to other groups</Text>
                <FlatList style={{ width: '100%' }}
                    data={groupList}
                    renderItem={({ item }) => {
                        return (
                            <List.Item
                                title={item}
                                left={() =>
                                    <Checkbox status={checkList.includes(item) ? 'checked' : 'unchecked'} />
                                }
                                onPress={() => onListItemPress(item)}
                            />
                        )
                    }}
                />
            </Dialog.Content>
            <Dialog.Actions>
                <Button onPress={() => {
                    setIsDialogVisible(false);
                    onMergeClick()
                }} >Add</Button>
                <Button onPress={() => setIsDialogVisible(false)} >Cancel</Button>
            </Dialog.Actions>
        </AnimatedDialog >
    )
}