import { useContext, useState } from "react";
import { View, FlatList, Keyboard } from "react-native";
import { Button, List, Searchbar, Surface, Text, useTheme } from "react-native-paper";
import { AppContext } from "../AppContext";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export function AllNotesSearch({ navigation }) {
    const { data } = useContext(AppContext);
    const theme = useTheme();
    const [filter, setFilter] = useState(data)
    const [value, setValue] = useState();
    const onChangeQuery = (text) => {
        setValue(text);
        setFilter(data.filter((element) => {
            return (element.title.toUpperCase().includes(text.toUpperCase())) ||
                (element.content.toUpperCase().includes(text.toUpperCase()))
        }));
    }

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
            <FlatList data={filter} style={{ height: '100%' }}
                ListEmptyComponent={() => {
                    return (
                        data.length == 0 ?
                            <View style={{ flex: 1, alignItems: 'center', paddingTop: '40%' }}>
                                <Text variant="titleLarge" style={{ color: useTheme().colors.onSurfaceVariant }}>You have no Notes</Text>
                                <Text variant="bodyLarge" style={{ color: useTheme().colors.outline }}>Try creating some</Text>
                                <Button mode="contained" style={{ marginTop: 20 }}>Create New Note</Button>
                            </View> :
                            <View style={{ flex: 1, alignItems: 'center', paddingTop: '40%' }}>
                                <Text variant="titleLarge" style={{ color: useTheme().colors.onSurfaceVariant }}>No notes found</Text>
                                <Text variant="bodyLarge" style={{ color: useTheme().colors.outline }}>Trying checking spelling</Text>
                            </View>

                    );
                }}
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
                }} />
        </Surface>
    );
}