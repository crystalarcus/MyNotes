import { Appbar, Surface, TextInput, useTheme, Searchbar, Divider, List, Text, Button, RadioButton, IconButton, Portal, Dialog, Snackbar, Icon } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { BackHandler, FlatList, View } from "react-native";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../AppContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { Extrapolation, interpolate, interpolateColor, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { throttle } from "lodash";

export function Groups({ navigation, route }) {
    const theme = useTheme();
    const previous_screen = route.params.previous_screen;
    const { setActiveScreen, groupList, setGroupList } = useContext(AppContext);
    const [groupName, setGroupName] = useState();
    const [focusable, setFocusable] = useState(true);
    const [isDelteDialogVisible, setIsDelteDialogVisible] = useState(false);
    const [deleteGroupKey, setDeleteGroupKey] = useState();
    const [snackVis, setSnackVis] = useState(false);

    async function SaveGroup(item) {
        let rawdata = groupList;
        rawdata.unshift(item);
        setGroupList(rawdata);
        try {
            await AsyncStorage.setItem('groupList', JSON.stringify(rawdata));
        } catch (error) {
            console.log(error);
            alert(error)
        }
    }
    async function DeleteGroup() {
        // let rawdata = groupList;
        // rawdata.splice(deleteGroupKey, 1);
        groupList.splice(deleteGroupKey, 1);
        const stringObj = JSON.stringify(groupList);
        try {
            await AsyncStorage.setItem('groupList', stringObj);
        } catch (error) {
            console.log(error);
            alert(error)
        }
    }
    const ScrollY = useSharedValue(0);

    const AnimatedHeaderStyle = useAnimatedStyle(() => ({
        backgroundColor: interpolateColor(
            ScrollY.value,
            [50, 80],
            [theme.colors.surface, theme.colors.elevation.level2],
        ),
        height: 90
    }))

    const scrollHandler = useAnimatedScrollHandler((event) => {
        ScrollY.value = event.contentOffset.y;
    });
    function handleGoBack() {
        navigation.goBack();
        setActiveScreen(previous_screen);
        return true;
    }
    useEffect(() => {
        BackHandler.addEventListener('hardwareBackPress', handleGoBack);
        return () => BackHandler.removeEventListener('hardwareBackPress', handleGoBack);
    }, []);
    return (
        <Surface elevation={1} style={{ flex: 1, backgroundColor: theme.colors.surface }}>
            <Animated.View style={AnimatedHeaderStyle}>
                <Appbar.Header style={{ backgroundColor: "transparent" }}>
                    <Appbar.BackAction onPress={throttle(() => {
                        setActiveScreen(previous_screen);
                        navigation.goBack();
                    }, 200, { trailing: false })} />
                    <Appbar.Content title={
                        <Animated.View>
                            <Text variant="titleLarge"
                                numberOfLines={1}
                                accessible
                                accessibilityRole="header">Groups</Text>
                        </Animated.View>
                    } style={{ paddingLeft: 10 }} />
                </Appbar.Header>
            </Animated.View>
            <View style={{ borderRadius: 30, gap: 15 }}>
                {/* <Text>{JSON.stringify(groupList)}</Text> */}
                <Animated.ScrollView
                    scrollEventThrottle={16}
                    contentContainerStyle={{ paddingBottom: 0 }}
                    onScroll={scrollHandler}>
                    <Searchbar icon='label' placeholder="Enter Group name"
                        focusable={focusable}
                        value={groupName}
                        clearIcon={() => groupName == null ? null : <Icon source={"plus"} size={21} color={theme.colors.primary} />}
                        onClearIconPress={() => {
                            if (groupList.includes(groupName)) {
                                setSnackVis(true);
                                return;
                            }
                            SaveGroup(groupName);
                            setGroupName();
                        }}
                        style={{ marginHorizontal: 10, marginVertical: 20 }}
                        onChangeText={text => setGroupName(text)} />
                    {groupList.map(item => {
                        return (
                            <List.Item key={groupList.indexOf(item)} left={() => <List.Icon icon='label-outline' />}
                                title={item}
                                style={{ marginLeft: '6%', paddingVertical: 10 }}
                                right={() => <IconButton style={{ padding: 0, margin: 0 }} onPress={() => {
                                    setIsDelteDialogVisible(true);
                                    setDeleteGroupKey(groupList.indexOf(item));
                                }} icon='delete-outline' />}
                            />
                        )
                    })}
                </Animated.ScrollView>

                <Portal>
                    <Dialog style={{ backgroundColor: theme.colors.elevation.level1 }} visible={isDelteDialogVisible} onDismiss={() => setIsDelteDialogVisible(false)}>
                        <Dialog.Title>Delete Note Group ?</Dialog.Title>
                        <Dialog.Content>
                            <Text style={{ paddingVertical: 10, fontSize: 17 }}>Once deleted, it can't be restored back and all notes included in group will be deleted forever.</Text>

                            <Text style={{
                                color: theme.colors.tertiary,
                                fontSize: 17,
                                fontWeight: '700'
                            }}>
                                Note: If the note is included in any other group, then it will not be deleted.
                            </Text>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button onPress={(() => {
                                setIsDelteDialogVisible(false);
                                DeleteGroup(deleteGroupKey);
                            })}>Delete</Button>
                            <Button onPress={(() => { setIsDelteDialogVisible(false) })}>Cancel</Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>
                {/* <Button onPress={async()=>{
                        await AsyncStorage.setItem('groupList', '[]');
                        setGroupList([]);
                    }}>Clear</Button> */}
            </View>
            <Snackbar visible={snackVis} action={{
                label: 'Dismiss',
                onPress: () => {
                    setSnackVis(false)
                },
            }} onDismiss={() => setSnackVis(false)}>Group with same name already exists!</Snackbar>
        </Surface >
    );
}