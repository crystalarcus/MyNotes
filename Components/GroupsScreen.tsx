import { Appbar, useTheme, Searchbar, List, Text, Button, IconButton, Portal, Dialog, Snackbar, Icon, Menu, MD3Theme, Checkbox } from "react-native-paper";
import { BackHandler, View } from "react-native";
import { memo, useContext, useEffect, useMemo, useState } from "react";
import { AppContext } from "../AppContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { CurvedTransition, Easing, FadeInUp, FadeOutUp, SlideInLeft, SlideOutLeft, ZoomIn, ZoomOut, interpolateColor, runOnJS, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { throttle } from "lodash";
import { AnimatedDialog } from "./SubComponents/AnimatedDialog";

const GroupItem = memo(({ item, groupList, setDeleteGroupKey,
    selected, setSelected, index,
    setTouchable, setIsDelteDialogVisible, theme }:
    {
        item: string, groupList: string[],
        index: number,
        setDeleteGroupKey: (value: number) => void,
        selected: string[],
        setSelected: (value: string[]) => void,
        setTouchable: (value: boolean) => void,
        setIsDelteDialogVisible: (value: boolean) => void, theme: MD3Theme
    }) => {
    const isSelected = () => selected.includes(item);
    let l = groupList.length;
    return (
        <Animated.View
            entering={FadeInUp.delay(300 * index / l)}
            exiting={FadeOutUp.delay(300 * index / l)}
            key={item}
            layout={CurvedTransition}>
            <List.Item left={() => selected.length ? <View style={{ width: 24 }} /> :
                <Animated.View entering={SlideInLeft.delay(300 * index / l).easing(Easing.bezier(0.05, 0.7, 0.1, 1)).duration(300)}
                    exiting={SlideOutLeft.delay(300 * index / l).easing(Easing.bezier(0.39, 0.02, 0.17, 0.91)).duration(300)}
                    style={{ justifyContent: 'center' }}>
                    <List.Icon icon='label-outline' />
                </Animated.View>
            }
                title={item}
                style={{
                    paddingLeft: '6%', height: selected.length ? 65 : 55,
                    justifyContent: 'center',
                    backgroundColor: isSelected() ? theme.colors.elevation.level2 : null,
                }}
                onPress={() => {
                    if (selected.length) {
                        if (isSelected()) {
                            setSelected(
                                selected.filter(value => value != item)
                            )
                        }
                        else {
                            setSelected([...selected, item])
                        }
                    }

                }}
                onLongPress={() => {
                    if (isSelected()) {
                        setSelected(
                            selected.filter(value => value != item)
                        )
                    }
                    else {
                        setSelected([...selected, item])
                    }

                }}
                right={() => selected.length ?
                    <Animated.View entering={ZoomIn.delay(300 * (index + 1) / l)} exiting={ZoomOut} key={1}>
                        <Checkbox status={isSelected() ? 'checked' : 'unchecked'} />
                    </Animated.View> :
                    < Animated.View entering={ZoomIn.delay(300 * (index + 1) / l)} exiting={ZoomOut} key={2}>
                        <IconButton style={{ margin: 0 }} onPress={() => {
                            setDeleteGroupKey(groupList.indexOf(item));
                            setTouchable(true);
                            setIsDelteDialogVisible(true);
                        }} icon='delete-outline' />
                    </Animated.View>}
            />
        </Animated.View >
    )
})

export function Groups({ navigation, route }) {

    //#region 
    const thisTheme = useTheme();
    const [selected, setSelected] = useState([]);
    const previous_screen = route.params.previous_screen;
    const { setActiveScreen, groupList, setGroupList } = useContext(AppContext);
    const [groupName, setGroupName] = useState('');
    const [focusable, setFocusable] = useState(true);
    const [touchable, setTouchable] = useState(false);
    const [isDelteDialogVisible, setIsDelteDialogVisible] = useState(false);
    const [deleteGroupKey, setDeleteGroupKey] = useState(-1);
    const [snackVis, setSnackVis] = useState(false);
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [deleteAllVisible, setDeleteAllVisible] = useState(false);
    //#endregion

    //#region 
    async function SaveGroup(item) {
        let rawdata = [item, ...groupList];
        setGroupList(rawdata);
        try {
            await AsyncStorage.setItem('groupList', JSON.stringify(rawdata));
        } catch (error) {
            console.log(error);
            alert(error)
        }
    }
    async function DeleteGroup() {
        let rawdata = [...groupList];
        rawdata.splice(deleteGroupKey, 1);
        setGroupList(rawdata)
        const stringObj = JSON.stringify(rawdata);
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
            [thisTheme.colors.surface, thisTheme.colors.elevation.level2],
        ),
    }))

    const scrollHandler = useAnimatedScrollHandler((event) => {
        ScrollY.value = event.contentOffset.y;
    });
    const [visible, setVisible] = useState(true)

    function handleGoBack() {
        setVisible(false)
        return true;
    }
    const callbackF = () => {
        navigation.goBack();
        setActiveScreen(previous_screen);
    }
    const enteringAnim = (targetValues) => {
        'worklet';
        const animations = {
            transform: [{ scale: withTiming(1, { duration: 600, easing: Easing.bezier(0.05, 0.7, 0.1, 1) }) }],
        }
        const initialValues = {
            transform: [{ scale: 0.5 }],
        }
        return {
            initialValues,
            animations
        }
    }
    const exitingAnim = (targetValues) => {
        'worklet';
        const animations = {
            transform: [{ scale: withTiming(0.9, { duration: 210 }) }],
            opacity: withTiming(0, { duration: 210 })
        }
        const initialValues = {
            transform: [{ scale: 1 }],
            opacity: 1,
        }
        const callback = (finished: boolean) => {
            'worklet';
            if (finished) {
                runOnJS(callbackF)()
            }
        }
        return {
            initialValues,
            animations,
            callback
        }
    }
    useEffect(() => {
        BackHandler.addEventListener('hardwareBackPress', handleGoBack);
        return () => BackHandler.removeEventListener('hardwareBackPress', handleGoBack);
    }, []);
    //#endregion

    return (
        visible ?
            <Animated.View entering={enteringAnim} exiting={exitingAnim}
                style={{ flex: 1, backgroundColor: thisTheme.colors.surface }}>
                <Animated.View style={AnimatedHeaderStyle}>
                    <Appbar.Header style={{ backgroundColor: "transparent" }}>
                        <Appbar.BackAction onPress={throttle(() => {
                            setVisible(false)
                        }, 200, { trailing: false })} />
                        <Appbar.Content title={'Groups'} style={{ paddingLeft: 10 }} />
                        <Menu visible={isMenuVisible} contentStyle={{ backgroundColor: thisTheme.colors.surfaceContainer }}
                            anchor={
                                <IconButton icon='dots-vertical' style={{}}
                                    onPress={() => setIsMenuVisible(true)} />
                            }
                            onDismiss={() => setIsMenuVisible(false)}>
                            <Menu.Item title='Delete all groups' leadingIcon={'delete-outline'}
                                onPress={async () => {
                                    setTouchable(true);
                                    setDeleteAllVisible(true);
                                    setIsMenuVisible(false)
                                }}></Menu.Item>
                        </Menu>
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
                            clearIcon={() => groupName == "" ? null : <Icon source={"plus"} size={21} color={thisTheme.colors.primary} />}
                            onClearIconPress={() => {
                                if (groupName == "") { return; }
                                if (groupList.includes(groupName)) {
                                    setSnackVis(true);
                                    return;
                                }
                                SaveGroup(groupName);
                                setGroupName('');
                            }}
                            style={{ marginHorizontal: 10, marginVertical: 20 }}
                            onChangeText={text => setGroupName(text)} />
                        {groupList.map((item, index) => {
                            return (
                                <GroupItem
                                    key={item}
                                    theme={thisTheme}
                                    item={item}
                                    index={index}
                                    selected={selected}
                                    setSelected={setSelected}
                                    groupList={groupList}
                                    setDeleteGroupKey={setDeleteGroupKey}
                                    setTouchable={setTouchable}
                                    setIsDelteDialogVisible={setIsDelteDialogVisible} />
                            )
                        })}
                    </Animated.ScrollView>

                    <Portal>
                        <DeleteGroupDialog
                            visible={isDelteDialogVisible}
                            setVisible={setIsDelteDialogVisible}
                            touchable={touchable}
                            setTouchable={setTouchable}
                            thisTheme={thisTheme}
                            DeleteGroup={DeleteGroup} />
                        <DeleteAllGroups
                            visible={deleteAllVisible}
                            setVisible={setDeleteAllVisible}
                            touchable={touchable}
                            setTouchable={setTouchable}
                            thisTheme={thisTheme}
                            setGroupList={setGroupList} />
                    </Portal>
                </View>
                <Snackbar visible={snackVis} action={{
                    label: 'Dismiss',
                    onPress: () => {
                        setSnackVis(false)
                    },
                }} onDismiss={() => setSnackVis(false)}>Group with same name already exists!</Snackbar>
            </Animated.View > : null
    );
}

const DeleteGroupDialog = ({ visible, setVisible, touchable, setTouchable, thisTheme, DeleteGroup }) => {
    const WarnHeight = useSharedValue(50);
    const expanderStyle = useAnimatedStyle(() => ({
        height: WarnHeight.value,
        backgroundColor: thisTheme.colors.surfaceVariant,
        overflow: 'hidden',
        paddingLeft: 12,
        borderRadius: 12
    }))
    const [expanded, setExpanded] = useState(false);
    return (
        <AnimatedDialog
            visible={visible}
            setVisible={setVisible}
            touchable={touchable}
            setTouchable={setTouchable}
            thisTheme={thisTheme}>
            <Dialog.Title>Delete Note Group ?</Dialog.Title>
            <Dialog.Content>
                <Text style={{ paddingVertical: 10, fontSize: 17 }}>This action cannot be undone.</Text>
                <View style={{ height: expanded ? 160 : 50 }}>
                    <Animated.View style={expanderStyle}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={{
                                color: thisTheme.colors.tertiary,
                                fontSize: 17,
                                fontWeight: '700'
                            }}>Note</Text>
                            <IconButton icon={'chevron-down'} onPress={() => {
                                if (WarnHeight.value == 50) {
                                    WarnHeight.value = withTiming(160, { duration: 450, easing: Easing.bezier(0.05, 0.7, 0.1, 1) });
                                    setExpanded(true)
                                }
                                else {
                                    setExpanded(false)
                                    WarnHeight.value = withTiming(50, { duration: 450, easing: Easing.bezier(0.05, 0.7, 0.1, 1) });
                                }
                            }} />
                        </View>
                        <Text style={{
                            color: thisTheme.colors.tertiary,
                            fontSize: 17,
                            fontWeight: '700'
                        }}>
                            {"All notes included in group will be deleted forever and if the note is included in any other group, then it will not be deleted."}
                        </Text>
                    </Animated.View>
                </View>
            </Dialog.Content>
            <Dialog.Actions>
                <Animated.View key={9} layout={CurvedTransition.easingY(Easing.bezier(0.05, 0.7, 0.1, 1)).duration(450)} style={{ flexDirection: 'row', gap: 8 }}>
                    <Button onPress={(() => { setTouchable(false) })}>Cancel</Button>
                    <Button mode='contained-tonal' onPress={(() => {
                        setTouchable(false);
                        DeleteGroup();
                    })}>Delete</Button>
                </Animated.View>
            </Dialog.Actions>
        </AnimatedDialog>
    )
}

const DeleteAllGroups = ({ visible, setVisible, touchable, setTouchable,
    thisTheme, setGroupList }) => {
    return (
        <AnimatedDialog visible={visible}
            setVisible={setVisible}
            touchable={touchable}
            setTouchable={setTouchable}
            thisTheme={thisTheme}>
            <Dialog.Title>Delete All Groups ?</Dialog.Title>
            <Dialog.Content>
                <Text style={{ fontSize: 14 }} >This action cannot be undone</Text>
            </Dialog.Content>
            <Dialog.Actions>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Button onPress={() => setTouchable(false)} >No</Button>
                    <Button mode='contained-tonal'
                        onPress={async () => {
                            setGroupList([])
                            await AsyncStorage.setItem('groupList', "[]");
                            setTouchable(false);
                        }} >Yes</Button>
                </View>
            </Dialog.Actions>
        </AnimatedDialog>
    );
}
