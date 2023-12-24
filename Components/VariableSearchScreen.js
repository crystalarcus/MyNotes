import { useContext, useEffect, useState } from "react";
import { FlatList, Keyboard, View } from "react-native";
import { Button, List, Searchbar, Surface, Text, useTheme } from "react-native-paper";
import { AppContext } from "../AppContext";

export function VariableSearchScreen({ navigation, route }) {

    const { data } = useContext(AppContext);
    const [ActiveData, setActiveData] = useState([]);
    const [notesEmpty, setNotesEmpty] = useState(false);
    const ListEmptyComp = () => {
        return (
            notesEmpty ?
                <View style={{ flex: 1, alignItems: 'center', paddingTop: '40%' }}>
                    <Text variant="titleLarge" style={{ color: useTheme().colors.onSurfaceVariant }}>Group Empty</Text>
                    <Text variant="bodyLarge" style={{ color: useTheme().colors.outline }}>There are no notes in this group</Text>
                    <Text variant="bodyLarge" style={{ color: useTheme().colors.outline }}>Try creating some</Text>
                    <Button mode="contained" style={{ marginTop: 20 }} onPress={() => {
                        navigation.navigate('CreateVarNote', {
                            title: "",
                            content: "",
                            groups: [route.params.active],
                        });
                    }}>Create {route.params.active} Note</Button>
                </View> :
                <View style={{ flex: 1, alignItems: 'center', paddingTop: '40%' }}>
                    <Text variant="titleLarge" style={{ color: useTheme().colors.onSurfaceVariant }}>No results found</Text>
                    <Text variant="bodyLarge" style={{ color: useTheme().colors.outline }}>Try checking your spelling again</Text>
                </View>
        );
    }
    const onChangeQuery = () => {

    }
    const [value, setValue] = useState();
    useEffect(() => {
        let _data = [];
        data.forEach(note => {
            if (note.groups.includes(route.params.active)) {
                _data.push(note);
            }
        });
        _data.length == 0 ? setNotesEmpty(true) : null;
        setActiveData(_data);
    }, []);
    return (
        <Surface style={{ flex: 1 }}>
            <Surface elevation={3} style={{ paddingTop: 20, shadowColor: 'transparent' }}>
                <Searchbar mode="view"
                    icon='keyboard-backspace'
                    onIconPress={() => {
                        navigation.goBack();
                        Keyboard.dismiss();
                    }}
                    placeholder="Search Note"
                    value={value}
                    onChangeText={onChangeQuery}
                    showDivider={false}
                    autoFocus={true}
                />
            </Surface>
            <FlatList
                data={ActiveData}
                ListEmptyComponent={ListEmptyComp}
                renderItem={({ item }) => {
                    return (
                        <Surface elevation={3} style={{ marginHorizontal: 15, marginTop: 10, shadowColor: 'transparent', borderRadius: 20 }}>
                            <List.Item title={item.title} style={{ borderRadius: 20 }} borderless={true}
                                description={item.content} onPress={() => {
                                    navigation.navigate("CreateNewNote", {
                                        title: item.title,
                                        content: item.content,
                                        date: item.date,
                                        groups: item.groups,
                                        createNew: false,
                                        noteID: data.indexOf(item)
                                    })
                                }} />
                        </Surface>
                    );
                }}
            />
        </Surface>
    );
}