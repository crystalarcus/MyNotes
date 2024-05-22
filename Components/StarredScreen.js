import { useState, useContext, useEffect, useCallback } from "react";
import { Alert, BackHandler, StyleSheet, View } from "react-native";
import { Text, Portal, useTheme, IconButton, AnimatedFAB, Appbar, Checkbox, Menu } from "react-native-paper";
import { AppContext } from "../AppContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { CurvedTransition, Easing, interpolateColor, runOnJS, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { ShareMenuComp } from "./SubComponents/NoteShareMenu";
import { DeleteMultiNoteDialog, DeleteNoteDialog } from "./SubComponents/DeleteDialogs";
import { AddToListDialogNotesSc } from "./SubComponents/AddToGroupsDialog";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RenderNoteItem } from "./SubComponents/NoteRenderItem";
import FontistoIcon from 'react-native-vector-icons/Fontisto';
import { SnackBarAnimated } from "./SubComponents/AnimatedSnackBar";
import LottieView from "lottie-react-native";


export const StarredScreen = ({ navigation, route }) => {

    //#region 
    const thisTheme = useTheme();
    const { data, binData, setData, groupList, setActiveScreen, setBinData, sortOrder } = useContext(AppContext);
    const [starredNotesList, setStarredNotesList] = useState([]); // <---------FLATLIST DATA
    const [isLoaded, setIsLoaded] = useState(false);

    const [isDialogVisible, setIsDialogVisible] = useState(false);
    const [deleteNoteKey, setDeleteNoteKey] = useState(0);
    const [isMultiDeleteVisible, setIsMultiDeleteVisible] = useState(false);
    const [isListDialogVisible, setIsListDialogVisible] = useState(false);
    const [selectedGroupsList, setSelectedGroupsList] = useState([]);
    const [isAppbarMenuVisible, setIsAppbarMenuVisible] = useState(false);
    const [deleteTouchable, setDeleteTouchable] = useState(false);
    const [isSnackVisible, setIsSnackVisible] = useState(false);
    const [backUpData, setBackUpData] = useState(data);
    const [binChache, setBinChache] = useState(binData);
    const insetTop = useSafeAreaInsets().top;

    const [selected, setSelected] = useState([])
    const [selectedNotes, setSelectedNotes] = useState([])
    const [visible, setVisible] = useState(true)

    let [refList, setRefList] = useState(Date.now())

    const ListEmptyComponent = () => {
        return (
            <View style={{ flex: 1, alignItems: 'center', paddingTop: '50%', marginTop: "20%" }}>
                <LottieView style={{ marginBottom: 50 }}
                    autoPlay
                    speed={0.5}
                    loop
                    source={require('../assets/StarAnimation.json')} />
                {/* <Icon source={"emoticon-sad-outline"} size={100} color={thisTheme.colors.outline} /> */}
                <Text style={{ color: thisTheme.colors.onSurfaceVariant, fontSize: 21 }}>No starred note</Text>
                <Text style={{ color: thisTheme.colors.outline, paddingHorizontal: 20, fontSize: 15, lineHeight: 50 }}>The notes you star will appear here</Text>
                {/* <Button mode="contained" style={{ marginTop: 40 }}>Create {route.params.active} Note</Button> */}
            </View>
        );
    }
    const getStarredData = () => {
        let d = [];
        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            if (element.starred) {
                d.push(element)
            }
        }
        setStarredNotesList(d);
    }
    async function saveData(stringObj) {
        try {
            await AsyncStorage.setItem('data', stringObj);
        } catch (error) {
            Alert(error);
        }
    }
    //#endregion
    const ScrollY = useSharedValue(0);

    const AnimatedHeaderStyle = useAnimatedStyle(() => ({
        backgroundColor: selected.length ?
            thisTheme.colors.elevation.level3 : interpolateColor(
                ScrollY.value,
                [30, 60],
                [thisTheme.colors.surface, thisTheme.colors.elevation.level3],
            ),
        paddingTop: insetTop + 5,
        height: 70 + (insetTop),
    }))

    const scrollHandler = useAnimatedScrollHandler((event) => {
        ScrollY.value = event.contentOffset.y;
    });
    function handleGoBack() {
        setVisible(false)
        return true;
    }
    const searchBarEntering = () => {
        'worklet';
        const animations = {
            transform: [{ scale: withTiming(1, { duration: 210 }) }],
            opacity: withTiming(1)
        }
        const initialValues = {
            transform: [{ scale: 1.2 }],
            opacity: 0
        }
        return {
            initialValues,
            animations
        }
    }
    const appBarEntering = () => {
        'worklet';
        const animations = {
            transform: [{ scale: withTiming(1, { duration: 210 }) }],
            opacity: withTiming(1)

        }
        const initialValues = {
            transform: [{ scale: 0.8 }],
            opacity: 0
        }
        return {
            initialValues,
            animations
        }
    }
    const callbackF = () => {
        navigation.navigate('All Notes', { date: Date.now() });
        setActiveScreen("All Notes");
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
        const callback = (finished) => {
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
        !isLoaded ? setTimeout(() => {
            setIsLoaded(true)
        }, 400) : null
        getStarredData()
        setRefList(route.params?.date)
        BackHandler.addEventListener('hardwareBackPress', handleGoBack);
        return () => BackHandler.removeEventListener('hardwareBackPress', handleGoBack);
    }, [JSON.stringify(data)]);
    if (visible) {
        return (
            <Animated.View entering={enteringAnim} exiting={exitingAnim}
                style={{ flex: 1, backgroundColor: thisTheme.colors.surface }}>
                <Animated.View style={AnimatedHeaderStyle}>
                    {!selected.length ?
                        <Animated.View key={1} entering={searchBarEntering} style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Appbar.Action icon={'menu'} onPress={() => navigation.openDrawer()} style={{ marginHorizontal: 10 }} />
                            <Appbar.Content title={"Starred"} titleStyle={{ fontFamily: 'Manrope' }} />
                            <IconButton icon={() => <FontistoIcon name="search"
                                size={18} color={thisTheme.colors.onSurfaceVariant} />}
                                onPress={() => { navigation.navigate('AllNotesSearch', { previous_screen: "Starred" }) }} />

                            <Menu visible={isAppbarMenuVisible}
                                contentStyle={{ borderRadius: 14 }}
                                anchor={
                                    <IconButton icon='dots-vertical' style={{ marginBottom: 5 }}
                                        onPress={() => setIsAppbarMenuVisible(true)} />
                                }
                                onDismiss={() => setIsAppbarMenuVisible(false)}>
                                <Menu.Item leadingIcon={'trash-can-outline'} title="Delete notes"
                                ></Menu.Item>
                                <Menu.Item leadingIcon={'folder-outline'} title='Delete group' onPress={() => {
                                }}></Menu.Item>
                            </Menu>
                        </Animated.View>
                        :
                        <Animated.View key={2} entering={appBarEntering} >
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Appbar.Action icon="close" onPress={() => {
                                    setSelected([])
                                    setSelectedNotes([])
                                }} />
                                <Checkbox status={selected.length == starredNotesList.length ? 'checked' : 'unchecked'}
                                    onPress={() => {
                                        if (selected.length == starredNotesList.length) {
                                            setSelected([])
                                            setSelectedNotes([])
                                            return;
                                        }
                                        let _temp = []
                                        let _tempNotes = []
                                        for (let i = 0; i < starredNotesList.length; i++) {
                                            _temp.push(starredNotesList[i].key)
                                            _tempNotes.push(starredNotesList[i])
                                        }
                                        setSelectedNotes(_tempNotes)
                                        setSelected(_temp)
                                    }} />
                                <Appbar.Content titleStyle={{ fontSize: 19 }} title={(selected.length == data.length ? "All " : "") + selected.length.toString() + " selected"} />
                                {Platform.OS == 'web' ? null : <ShareMenuComp items={selectedNotes} colored={false} />}
                                <Appbar.Action icon={"trash-can-outline"}
                                    onPress={() => {
                                        setBackUpData([...data])
                                        setBinChache([...binData])
                                        setDeleteTouchable(true);
                                        setIsMultiDeleteVisible(true);
                                    }} />
                                <Menu visible={isAppbarMenuVisible}
                                    contentStyle={{ borderRadius: 17 }}
                                    anchor={
                                        <IconButton icon='dots-vertical' style={{ marginBottom: 5 }}
                                            onPress={() => setIsAppbarMenuVisible(true)} />
                                    }
                                    onDismiss={() => setIsAppbarMenuVisible(false)}>
                                    <Menu.Item title='Edit Groups'
                                    ></Menu.Item>
                                    <Menu.Item title='Remove Common Groups' onPress={() => {
                                    }}></Menu.Item>
                                </Menu>
                            </View>
                        </Animated.View>
                    }
                </Animated.View>
                {/* <Text>{JSON.stringify(starredNotesList)}</Text> */}

                < Animated.FlatList
                    onScroll={scrollHandler}
                    scrollEventThrottle={16}
                    data={starredNotesList}
                    removeClippedSubviews={false}
                    onTouchStart={() => isSnackVisible ? setIsSnackVisible(false) : null}
                    itemLayoutAnimation={CurvedTransition.easingY(Easing.bezier(0.2, 0, 0, 1)).delay(200).duration(400)}
                    containerStyle={{ height: '90%' }}
                    extraData={refList}
                    contentContainerStyle={{ paddingTop: 10, paddingBottom: 400 }}
                    ListEmptyComponent={ListEmptyComponent}
                    keyExtractor={item => item.key}
                    renderItem={useCallback(({ item, index }) => <RenderNoteItem
                        item={item}
                        index={index}
                        isLoaded={isLoaded}
                        navigation={navigation}
                        selected={selected}
                        setSelected={setSelected}
                        originalData={data}
                        selectedNotes={selectedNotes}
                        setSelectedNotes={setSelectedNotes}
                        thisTheme={thisTheme}
                        setIsDialogVisible={setIsDialogVisible}
                        setDeleteNoteKey={setDeleteNoteKey}
                        setTouchable={setDeleteTouchable}
                        screenName={"Starred"}
                        setBinChache={setBinChache}
                        setBackUpData={setBackUpData}
                        setIsSnackVisible={setIsSnackVisible}
                        styles={styles} />, [data, selected.length, thisTheme.colors.surface])} />

                <View pointerEvents="box-none" style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 20,
                    bottom: 20,
                    justifyContent: 'flex-end',
                    alignItems: 'flex-end'
                }}>
                    <AnimatedFAB iconMode='dynamic' color={thisTheme.colors.onPrimary}
                        style={{ backgroundColor: thisTheme.colors.primary }}
                        extended={true}
                        animateFrom='right'
                        onPress={() => {
                            navigation.navigate('CreateNewNote', {
                                note: {
                                    title: "",
                                    content: "",
                                    groups: [],
                                    starred: true,
                                    key: Date.now(),
                                },
                                createNew: true,
                                previous_screen: 'Starred'
                            });
                        }}
                        label={"Create"} icon='plus'>
                    </AnimatedFAB>
                </View>
                <SnackBarAnimated
                    visible={isSnackVisible}
                    setVisible={setIsSnackVisible}
                    duration={4000}
                    buttonLabel="Undo"
                    onButtonPress={async () => {
                        setData([...backUpData])
                        setBinData([...binChache])
                        await AsyncStorage.setItem('binData', JSON.stringify([...binChache]))
                        saveData(JSON.stringify([...backUpData]))
                    }}
                    label={"Note deleted"} />
                < Portal >
                    <DeleteNoteDialog isDialogVisible={isDialogVisible}
                        setIsDialogVisible={setIsDialogVisible}
                        data={data}
                        setData={setData}
                        deleteNoteKey={deleteNoteKey}
                        setDeleteNoteKey={setDeleteNoteKey}
                        binData={binData}
                        saveData={saveData}
                        thisTheme={thisTheme}
                        touchable={deleteTouchable}
                        setTouchable={setDeleteTouchable}
                        setIsSnackVisible={setIsSnackVisible}
                        setRefList={setRefList} />
                    <DeleteMultiNoteDialog isDialogVisible={isMultiDeleteVisible}
                        setIsDialogVisible={setIsMultiDeleteVisible}
                        data={data}
                        setData={setData}
                        deleteNoteKeys={selected}
                        setDeleteNoteKeys={setSelected}
                        binData={binData}
                        saveData={saveData}
                        thisTheme={thisTheme}
                        touchable={deleteTouchable}
                        setTouchable={setDeleteTouchable}
                        setRefList={setRefList}
                        setIsSnackVisible={setIsSnackVisible} />
                    <AddToListDialogNotesSc visible={isListDialogVisible}
                        theme={thisTheme}
                        setVisible={setIsListDialogVisible}
                        groupList={groupList}
                        navigation={navigation}
                        selectedGroupsList={selectedGroupsList} />
                </Portal >
            </Animated.View>
        )
    }
    else {
        useCallback(() => <View />, [null, null, null])
    }
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 15,
        flex: 1,
    },
    Searchbar: {
        shadowColor: 'transparent',
    },
    itemView: {
        // backgroundColor: '#FFD9E2',
        borderRadius: 20,
        shadowColor: 'transparent',
        overflow: 'hidden',
    },
    textContent: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        padding: 15,
        gap: 10
    },

    contentStyle: {
        fontFamily: 'OpenSans',
    },
    actionViewMain: {
        display: 'flex',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 55

    },
    actionView: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        width: '65%',
        paddingHorizontal: 10,
    },

    ActionTextView: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingLeft: 24,
        width: '35%',
        paddingBottom: 10
    },
    DateText: {
        // fontSize: 16,
        // fontWeight: '600',
    },
});