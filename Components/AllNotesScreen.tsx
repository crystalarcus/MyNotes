import { Text, Chip, Portal, IconButton, useTheme, Icon, Appbar, Checkbox, TouchableRipple } from "react-native-paper";
import { Alert, Dimensions, Platform, StyleSheet, View, } from "react-native";
import { useState, useContext, useEffect, useRef, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppContext } from "../AppContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { CurvedTransition, Easing, interpolateColor, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { RenderNoteItem } from "./SubComponents/NoteRenderItem";
import { DeleteMultiNoteDialog, DeleteNoteDialog } from "./SubComponents/DeleteDialogs";
import { AddToListDialogNotesSc } from "./SubComponents/AddToGroupsDialog";
import { ShareDialog, ShareMenuComp } from "./SubComponents/NoteShareMenu";
import { SnackBarAnimated } from "./SubComponents/AnimatedSnackBar";
import { SortDialog } from "./SubComponents/SettingsDialog";
import { BottomAppbar } from "./SubComponents/BottomAppBar";
import Menu from "./SubComponents/Menu";
import { MaterialMenu } from "./SubComponents/MaterialMenu";

const SearchMenu = ({ isSearchMenuVisible, setIsSearchMenuVisible,
    setDeleteTouchable, setSortDialogVisible,
    clearData, setIsSnackVisible, setData, thisTheme }) => {

    const onSortOrderPress = useCallback(() => {
        setDeleteTouchable(true);
        setSortDialogVisible(true);
        setIsSearchMenuVisible(false);
    }, [])
    const onDeleteAllPress = useCallback(() => {
        setIsSearchMenuVisible(false)
        clearData();
        setIsSnackVisible(true)
    }, [])
    const onLoadDataPress = useCallback(() => {
        setData(d);
        setIsSearchMenuVisible(false)
    }, [])

    return (
        <Menu visible={isSearchMenuVisible}
            scaleXAnimation={true}
            contentStyle={{ marginRight: 8 }}
            theme={thisTheme}
            anchorPosition='bottom'
            anchor={
                <IconButton icon='dots-vertical'
                    style={{
                        marginLeft: 8,
                        backgroundColor: isSearchMenuVisible ?
                            thisTheme.colors.outline + '55' : null
                    }}
                    onPress={() => setIsSearchMenuVisible(true)} />
            }
            onDismiss={() => setIsSearchMenuVisible(false)}>
            <Menu.Item title='Sort Order' leadingIcon={'arrow-up-down'}
                onPress={() => onSortOrderPress()}></Menu.Item>

            <Menu.Item title='Delete All' leadingIcon={'trash-can-outline'}
                onPress={() => onDeleteAllPress()}></Menu.Item>

            <Menu.Item title='Load Data' leadingIcon={'restore'}
                onPress={() => onLoadDataPress()}></Menu.Item>
        </Menu>
    )
}

export function AllNotes({ navigation, route }) {

    //#region 
    const thisTheme = useTheme();
    const { data, setData, setBinData, groupList, binData, sortOrder, setSortOrder } = useContext(AppContext);
    let [refList, setRefList] = useState(Date.now())
    const [isLoaded, setIsLoaded] = useState(false);
    const [visible, setVisible] = useState(true)
    const [selected, setSelected] = useState([])
    const [selectedNotes, setSelectedNotes] = useState([])
    const [deleteNoteKey, setDeleteNoteKey] = useState(0);
    const [isSearchMenuVisible, setIsSearchMenuVisible] = useState(false);
    const [isAppbarMenuVisible, setIsAppbarMenuVisible] = useState(false);
    const [isDialogVisible, setIsDialogVisible] = useState(false);
    const [isMultiDeleteVisible, setIsMultiDeleteVisible] = useState(false);
    const [isListDialogVisible, setIsListDialogVisible] = useState(false);
    const [sortDialogVisible, setSortDialogVisible] = useState(false);
    const [selectedGroupsList, setSelectedGroupsList] = useState([]);
    const [shareVisible, setShareVisible] = useState(false);
    const [deleteTouchable, setDeleteTouchable] = useState(false);
    const [sharingNote, setSharingNote] = useState<Note>();
    const [isSnackVisible, setIsSnackVisible] = useState(false);
    const [backUpData, setBackUpData] = useState([...data]);
    const [binChache, setBinChache] = useState([...binData]);
    const [currentList, setCurrentList] = useState('text');

    const insetTop = useSafeAreaInsets().top;


    const ListEmptyComp = () => {
        return (
            <View style={{ flex: 1, alignItems: 'center', height: '100%' }}>
                <View style={{ marginTop: "20%" }}>
                    <Icon source={"draw-pen"}
                        size={100}
                        color={thisTheme.colors.onPrimaryContainer + "99"} />
                </View>
                <Text
                    style={{
                        fontFamily: 'Manrope-Regular',
                        color: thisTheme.colors.onSurface,
                        marginTop: 20, marginBottom: 5,
                        fontSize: 27,
                    }}
                >{"You have no Notes"}</Text>
                <Text
                    style={{
                        color: thisTheme.colors.outline,
                        fontFamily: 'Manrope',
                        fontSize: 17
                    }}
                >{"Try writing some"}</Text>

            </View>
        );
    }

    async function saveData(stringObj) {
        try {
            await AsyncStorage.setItem('data', stringObj);
        } catch (error) {
        }
    }

    async function clearData() {
        try {
            await AsyncStorage.setItem('data', '[]');
            setData([]);
        } catch (error) {
            alert(error)
        }
    }

    //#endregion
    const ScrollY = useSharedValue(0);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            ScrollY.value = event.contentOffset.y;
            // SearchBarY.value = 0;
        },
    });
    const AnimatedHeaderStyle = useAnimatedStyle(() => ({
        backgroundColor: thisTheme.colors.surfaceContainerHigh,
        marginHorizontal: selected.length ?
            withTiming(0) : withTiming(20),
        marginBottom: 0,
        borderRadius: selected.length ?
            withTiming(0) : withTiming(50),
        justifyContent: 'center',
        width: Platform.OS == 'web' ? 800 : 'auto'
    }))
    const HeaderOuterStyle = useAnimatedStyle(() => ({
        marginHorizontal: 'auto',
        backgroundColor: interpolateColor(
            ScrollY.value,
            [50, 100],
            [thisTheme.colors.surface, thisTheme.colors.surfaceContainerHigh]
        ),
        height: 70,
        justifyContent: 'center'
    }));
    const SearchBarStyle = useAnimatedStyle(() => ({
        overflow: 'hidden',
        marginHorizontal: 0,
        borderRadius: 50,
        paddingVertical: selected.length ? withTiming(12) : withTiming(0)
    }))

    const HeaderOutlineStyle = useAnimatedStyle(() => ({
        height: insetTop + 60, justifyContent: 'center',
        backgroundColor: selected.length ? thisTheme.colors.surfaceContainerHigh : interpolateColor(
            ScrollY.value,
            [50, 100],
            [thisTheme.colors.surface, thisTheme.colors.surfaceContainerHigh]
        ),
        paddingTop: insetTop + 5,
    }))


    const searchBarEntering = () => {
        'worklet';
        const animations = {
            borderRadius: 30,
            opacity: withTiming(1)
        }
        const initialValues = {
            transform: [{ scale: 1 }],
            borderRadius: 0,
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
            opacity: withTiming(1, { duration: 250 }),
            borderRadius: withTiming(0, { duration: 300 }),
            paddingVertical: withTiming(20)
        }
        const initialValues = {
            opacity: 0,
            borderRadius: 30,
            paddingVertical: 0,
        }
        return {
            initialValues,
            animations
        }
    }

    const FlatListRef = useRef(null);
    useEffect(() => {
        !isLoaded ? setTimeout(() => {
            setIsLoaded(true)
        }, 400) : null
        route.params ? setRefList(route.params.date) : null
    }, [JSON.stringify(data), refList])
    return (
        visible ?
            <Animated.View
                style={{ backgroundColor: thisTheme.colors.surface, flex: 1 }}>

                <Animated.View style={HeaderOutlineStyle}>
                    <View style={{
                        backgroundColor: thisTheme.colors.surface,
                    }}>
                        <Animated.View style={HeaderOuterStyle}>
                            <Animated.View style={AnimatedHeaderStyle}>
                                {!selected.length ?
                                    <Animated.View sharedTransitionTag="top"
                                        key={1} entering={searchBarEntering} style={SearchBarStyle}>
                                        <TouchableRipple
                                            focusable={false}
                                            style={[styles.Searchbar, { backgroundColor: thisTheme.colors.surfaceContainerHigh }]}
                                            onPress={() => {
                                                navigation.navigate('AllNotesSearch', { previous_screen: 'All Notes', })
                                            }}
                                        >
                                            <View style={{ flexDirection: 'row', alignSelf: 'stretch' }}>
                                                <IconButton icon={'menu'} style={{ marginHorizontal: 8 }}
                                                    onPress={() => { navigation.openDrawer() }} />
                                                <View style={{ justifyContent: 'center', width: Platform.OS == 'web' ? '87%' : '67%' }}>
                                                    {/*56% for 2 items*/}
                                                    <Text style={{}}>Search Notes</Text>
                                                </View>
                                                {/* <IconButton icon={"view-grid-outline"} onPress={() => { }} /> */}
                                                <SearchMenu isSearchMenuVisible={isSearchMenuVisible}
                                                    setIsSearchMenuVisible={setIsSearchMenuVisible}
                                                    setDeleteTouchable={setDeleteTouchable}
                                                    setSortDialogVisible={setSortDialogVisible}
                                                    clearData={clearData}
                                                    setIsSnackVisible={setIsSnackVisible}
                                                    setData={setData}
                                                    thisTheme={thisTheme} />
                                            </View>
                                        </TouchableRipple >
                                    </Animated.View>
                                    :
                                    <Animated.View key={2} sharedTransitionTag="top"
                                        style={SearchBarStyle}
                                        entering={appBarEntering} >
                                        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 }}>
                                            <Appbar.Action icon="close" onPress={() => {
                                                setSelected([])
                                                setSelectedNotes([])
                                            }} />
                                            <Checkbox status={selected.length == data.length ? 'checked' : 'unchecked'}
                                                onPress={() => {
                                                    if (selected.length == data.length) {
                                                        setSelected([])
                                                        setSelectedNotes([])
                                                        return;
                                                    }
                                                    let _temp = []
                                                    let _tempNotes = []
                                                    for (let i = 0; i < data.length; i++) {
                                                        _temp.push(data[i].key)
                                                        _tempNotes.push(data[i])
                                                    }
                                                    setSelectedNotes(_tempNotes)
                                                    setSelected(_temp)
                                                }} />
                                            <Appbar.Content titleStyle={{ fontSize: 19 }} 
                                            title={selected.length.toString()}
                                            style={{paddingHorizontal:8}} />
                                            {Platform.OS == 'web' ? null : <ShareMenuComp items={selectedNotes} />}
                                            <Appbar.Action icon={"trash-can-outline"}
                                                onPress={() => {
                                                    setBackUpData([...data])
                                                    setBinChache([...binData])
                                                    setDeleteTouchable(true);
                                                    setIsMultiDeleteVisible(true);
                                                }} />
                                            <Menu visible={isAppbarMenuVisible}
                                                anchorPosition='bottom'
                                                contentStyle={{ marginRight: 12 }}
                                                anchor={
                                                    <IconButton icon='dots-vertical'
                                                        style={{
                                                            marginBottom: 5,
                                                            backgroundColor: isAppbarMenuVisible ?
                                                                thisTheme.colors.outline + 38 : null
                                                        }}
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
                        </Animated.View>
                    </View>
                </Animated.View>

                {/* <Text>{JSON.stringify(binData)}</Text> */}

                < Animated.FlatList
                    onScroll={scrollHandler}
                    onScrollEndDrag={() => {
                        if (ScrollY.value < 100 && ScrollY.value > 75) {
                            FlatListRef.current.scrollToOffset({
                                offset: 100,
                                animated: true
                            });
                        }
                        else if (ScrollY.value < 75 && ScrollY.value > 0) {
                            FlatListRef.current.scrollToOffset({
                                offset: 0,
                                animated: true
                            });
                        }
                    }}
                    ref={FlatListRef}
                    layout={CurvedTransition.duration(200)}
                    scrollEventThrottle={16}
                    style={{ height: '90%', marginTop: 8 }}
                    data={data}
                    removeClippedSubviews={false}
                    // stickyHeaderHiddenOnScroll={true}
                    // stickyHeaderIndices={[0]}
                    // ListHeaderComponent={HeaderComponent}
                    itemLayoutAnimation={CurvedTransition.easingY(Easing.bezierFn(0.2, 0, 0, 1)).delay(selected.length ? 0 : 200).duration(400)}
                    extraData={refList}
                    onTouchStart={() => isSnackVisible ? setIsSnackVisible(false) : null}
                    contentContainerStyle={{ paddingTop: 10, paddingBottom: 400 }}
                    ListEmptyComponent={ListEmptyComp}
                    keyExtractor={item => item.key}
                    renderItem={useCallback(({ item, index }) => <RenderNoteItem
                        item={item}
                        index={index}
                        isLoaded={isLoaded}
                        navigation={navigation}
                        originalData={data}
                        selected={selected}
                        setSelected={setSelected}
                        selectedNotes={selectedNotes}
                        setSelectedNotes={setSelectedNotes}
                        thisTheme={thisTheme}
                        // screenName={'All Notes'}
                        setIsDialogVisible={setIsDialogVisible}
                        setDeleteNoteKey={setDeleteNoteKey}
                        setTouchable={setDeleteTouchable}
                        setBinChache={setBinChache}
                        setBackUpData={setBackUpData}
                        setIsSnackVisible={setIsSnackVisible}
                        setSharingNote={setSharingNote}
                        setShareVisible={setShareVisible}
                    // styles={styles}
                    />, [data, selected.length, thisTheme.colors.surface])} />
                <BottomAppbar
                    Actions={[
                        { icon: 'text-box-outline', onPress: () => { }, title: 'Sticky Note' },
                        {
                            icon: 'microphone-outline', onPress: () => {
                                navigation.navigate('CreateAudioNote', {
                                    note: {
                                        title: "",
                                        content: "",
                                        groups: [],
                                        starred: false,
                                        key: Date.now(),
                                        voiceNotes: [],
                                    },
                                    createNew: true,
                                    previous_screen: 'All Notes'
                                });
                            }, title: 'Voice Note'
                        },
                        { icon: 'draw-pen', onPress: () => { }, title: 'Drawing Note' },
                        { icon: 'plus-box-multiple-outline', onPress: () => { }, title: 'Create Group' },
                    ]}
                    FabIcon={'plus'}
                    FabToolTip="Create Note"
                    onFabPress={() => {
                        navigation.navigate('CreateNewNote', {
                            note: {
                                title: "",
                                content: "",
                                groups: [],
                                starred: false,
                                key: Date.now(),
                            },
                            createNew: true,
                            previous_screen: 'All Notes'
                        });
                    }} />
                < View pointerEvents="box-none" style={{
                    position: 'absolute',
                    top: Platform.OS == 'web' ? (Dimensions.get('window').height - 80) :
                        (Dimensions.get('window').height - 36),
                    left: 0,
                    right: 0,
                    bottom: 0,
                    alignItems: 'flex-end',
                    justifyContent: 'flex-start',
                }}>

                    <SnackBarAnimated visible={isSnackVisible}
                        setVisible={setIsSnackVisible}
                        duration={4000}
                        buttonLabel="Undo"
                        bottomMargin={75}
                        onButtonPress={async () => {
                            setData([...backUpData])
                            setBinData([...binChache])
                            await AsyncStorage.setItem('binData', JSON.stringify([...binChache]))
                            saveData(JSON.stringify([...backUpData]))
                        }}
                        label={"Note deleted and moved to Bin"} />
                </View>

                < Portal >
                    <DeleteNoteDialog isDialogVisible={isDialogVisible}
                        setIsDialogVisible={setIsDialogVisible}
                        data={data}
                        deleteNoteKey={deleteNoteKey}
                        binData={binData}
                        thisTheme={thisTheme}
                        setIsSnackVisible={setIsSnackVisible}
                        touchable={deleteTouchable}
                        setTouchable={setDeleteTouchable}
                        setRefList={setRefList} />
                    <DeleteMultiNoteDialog isDialogVisible={isMultiDeleteVisible}
                        setIsDialogVisible={setIsMultiDeleteVisible}
                        data={data}
                        setData={setData}
                        deleteNoteKeys={selected}
                        setDeleteNoteKeys={setSelected}
                        binData={binData}
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
                    <SortDialog visible={sortDialogVisible}
                        setVisible={setSortDialogVisible}
                        data={data}
                        thisTheme={thisTheme}
                        sortOrder={sortOrder}
                        setSortOrder={setSortOrder}
                        touchable={deleteTouchable}
                        setTouchable={setDeleteTouchable} />
                    <ShareDialog thisTheme={thisTheme}
                        note={sharingNote}
                        touchable={deleteTouchable}
                        setTouchable={setDeleteTouchable}
                        visible={shareVisible}
                        setVisible={setShareVisible} />
                </Portal >

            </Animated.View > : null
    );
}

const styles = StyleSheet.create({

    Searchbar: {
        shadowColor: 'transparent',
        borderRadius: 50,
        alignItems: 'center'
    },
    createButton: {
        marginLeft: 30
    },
    topBtnViews: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 0,
        height: 70,
    },
    topBtns: {
        width: 170,
        height: 60,
    },
    labelHeader: {
        fontFamily: 'Manrope-SemiBold',
        fontSize: 16
    }
});


var d = [
    {
        "title": "Determinant",
        "content": "The Determinant is a scalar value that is a function of the entries of a square matrix. It characterizes some properties of the matrix.",
        "date": "1 Aug, Tue",
        "fullDate": "1 August 2023, Tuesday",
        "timeCreated": "11:13:23",
        "modified": "11:13:23",
        "modifiedKey": 1690903047353,
        "key": 1690903047353,
        "groups": [
            "College",
            "Maths",
        ],
        "voiceNotes": [],
        "starred": false
    },
    {
        "title": "Matrix",
        "content": "Matrix is a set of numbers arranged in rows and columns so as to form a rectangular array. The numbers are called the elements, or entries, of the matrix.",
        "date": "2 Jan, Tue",
        "fullDate": "1 August 2023, Tuesday",
        "timeCreated": "1:12:23",
        "modified": "1:12:23",
        "modifiedKey": 1704201411592,
        "key": 1704201411592,
        "groups": [
            "College",
            "Maths",
        ],
        "voiceNotes": [],
        "starred": true
    },
    {
        "title": "Grocerry",
        "content": "Apples, \nBananas, \nStrawberries, \nAvocados, \nBell Peppers, \nCarrots, \nBroccoli, \nGarlic, \nLemons/ Limes, \nOnion, \nParsley, \nCilantro, \nBasil",
        "date": "1 Aug, Tue",
        "fullDate": "1 August 2023, Tuesday",
        "timeCreated": "11:02:53",
        "modified": "11:02:53",
        "modifiedKey": 1690903247353,
        "key": 1690903247353,
        "groups": [
            "Personal"
        ],
        "voiceNotes": [],
        "starred": true
    },
    {
        "title": "Center of Mass ",
        "content": "The center of mass is the unique point at the center of a distribution of mass in space that has the property that the weighted position vectors relative to this point sum to zero. In analogy to statistics, the center of mass is the mean location of a distribution of mass in space.",
        "date": "16 Dec, Sat",
        "fullDate": "1 August 2023, Tuesday",
        "timeCreated": "12:32:26",
        "modified": "12:32:26",
        "modifiedKey": 1702710585038,
        "key": 1702710585038,
        "groups": [
            "College",
            "Physics"
        ],
        "voiceNotes": [],
        "starred": false
    },
    {
        "title": "Trignometric Identities",
        "content": "Trigonometry Formulas\nsin(−θ) = -sin θ\ncos(−θ) = cos θ\ntan(−θ) = -tan θ\ncosec(−θ) = -cosecθ\nsec(−θ) = sec θ\ncot(−θ) = -cot θ\nProduct to Sum Formulas\nsin x sin y = 1/2 [cos(x-y) - cos(x+y)]\ncos x cos y = 1/2[cos(x-y) + cos(x+y)]\nsin x cos y = 1/2[sin(x+y) + sin(x-y)]\ncos x sin y = 1/2[sin(x+y) - sin(x-y)]\nSum to Product Formulas\nsin x + sin y = 2 sin [(x+y)/2] cos [(x-y)/2]\nsin x - sin y = 2 cos [(x+y)/2] sin [(x-y)/2]\ncos x + cos y = 2 cos [(x+y)/2] cos [(x-y)/2]\ncos x - cos y = -2 sin [(x+y)/2] sin [(x-y)/2]\nIdentities\nsin2 A + cos2 A = 1\n1+tan2 A = sec2 A\n1+cot2 A = cosec2 A",
        "date": "16 Dec, Sat",
        "fullDate": "1 August 2023, Tuesday",
        "timeCreated": "11:15:26",
        "modified": "11:15:26",
        "modifiedKey": 1702710586038,
        "key": 1702710586038,
        "groups": [
            "College",
            "Maths"
        ],
        "voiceNotes": [],
        "starred": true
    },
    {
        "title": "Carbocation ",
        "content": "Carbocation are reactive intermediates in which carbon bearing the positive charge, sp2 hybridised, plannar and having 6e- in their valence shell.",
        "date": "21 Dec, Thu",
        "fullDate": "1 August 2023, Tuesday",
        "timeCreated": "4:53:36",
        "modified": "4:53:36",
        "modifiedKey": 1702910585038,
        "key": 1702910585038,
        "groups": [
            "College",
            "Chemistry",
        ],
        "voiceNotes": [],
        "starred": true
    },
    {
        "title": "Alkenes ",
        "content": "Alkenes are a class of hydrocarbons. They are unsaturated compounds with at least one carbon-to-carbon double bond. The double bond makes alkenes more reactive than alkanes. Olefin is another term used to describe alkenes.",
        "date": "27 Dec, Wed",
        "fullDate": "1 August 2023, Tuesday",
        "timeCreated": "6:42:29",
        "modified": "6:42:29",
        "modifiedKey": 1703010585038,
        "key": 1703010585038,
        "groups": [
            "College",
            "Chemistry",
        ],
        "voiceNotes": [],
        "starred": false
    },
    {
        "title": "Musical Notes Structure",
        "content": "In English-speaking countries, musical notes are named A, B, C, D, E, F, and G. The names of the notes are always capitalized and are always in that order. The musical alphabet is in ascending order by pitch, A, B, C, D, E, F, and G. After G, the cycle repeats going back to A. Western music typically uses 12 notes: C, D, E, F, G, A, and B, plus five flats and equivalent sharps. The flats and sharps are: C sharp/D flat, D sharp/E flat, F sharp/G flat, G sharp/A flat, and A sharp/B flat.",
        "date": "1 Jan, Mon",
        "fullDate": "1 August 2023, Tuesday",
        "timeCreated": "5:16:33",
        "modified": "5:16:33",
        "modifiedKey": 1703201411592,
        "key": 1703201411592,
        "groups": [
            "College",
            "Physics",
        ],
        "voiceNotes": [],
        "starred": true
    },
    {
        "title": "Bose-Einstein condensate ",
        "content": "Bose-Einstein condensate (BEC), a state of matter in which separate atoms or subatomic particles, cooled to near absolute zero , coalesce into a single quantum mechanical entity—that is, one that can be described by a wave function—on a near-macroscopic scale. This form of matter was predicted in 1924 by Albert Einstein on the basis of the quantum formulations of the Indian physicist Satyendra Nath Bose.BEC theory traces back to 1924, when Bose considered how groups of photons behave. Photons belong to one of the two great classes of elementary or submicroscopic particles defined by whether their quantum spin is a nonnegative integer (0, 1, 2, …) or an odd half integer (1/2, 3/2, …). The former type, called bosons, includes photons, whose spin is 1. The latter type, called fermions, includes electrons, whose spin is 1/2.",
        "date": "1 Aug, Tue",
        "fullDate": "1 August 2023, Tuesday",
        "timeCreated": "4:12:33",
        "modified": "4:12:33",
        "modifiedKey": 1690902947353,
        "key": 1690902947353,
        "groups": [
            "College",
            "Physics",
        ],
        "voiceNotes": [],
        "starred": false
    },
]

{/* <MasonryFlashList
                        contentContainerStyle={{ paddingVertical: 10, paddingHorizontal: 5 }}
                        data={data}
                        ref={listRef}
                        numColumns={2}
                        estimatedItemSize={500}
                        keyExtractor={(item) => {
                            return item.key;
                        }}
                        renderItem={useCallback(({ item, index }) => {
                            return (
                                <RenderCompactNoteItem
                                    item={item}
                                    index={index}
                                    navigation={navigation}
                                    selected={selected}
                                    setSelected={setSelected}
                                    setBackUpData={setBackUpData}
                                    selectedNotes={selectedNotes}
                                    setSelectedNotes={setSelectedNotes}
                                    thisTheme={thisTheme}
                                    setIsDialogVisible={setIsDialogVisible}
                                    setDeleteNoteKey={setDeleteNoteKey}
                                    setBinChache={setBinChache}
                                    setTouchable={setDeleteTouchable}
                                    setIsSnackVisible={setIsSnackVisible}
                                    screenName={'All Notes'} />
                            )
                        }, [data.length, selected.length, JSON.stringify(thisTheme)])} />  */}

{/* {
                        selected.length ? null :
                            <Animated.View
                                sharedTransitionTag={'tag1'}
                                style={{
                                    width: 110
                                }}>
                                <AnimatedFAB
                                    iconMode={Platform.OS == 'web' ? 'static' : 'dynamic'}
                                    color={thisTheme.colors.onPrimary}
                                    style={{ backgroundColor: thisTheme.colors.primary, right:20 }}
                                    extended={true}
                                    elevation={4}
                                    animateFrom='right'
                                    onPress={() => {
                                        navigation.navigate('CreateNewNote', {
                                            note: {
                                                title: "",
                                                content: "",
                                                groups: [],
                                                starred: false,
                                                key: Date.now(),
                                            },
                                            createNew: true,
                                            previous_screen: 'All Notes'
                                        });
                                    }}
                                    label={Platform.OS == 'web' ? null : "Create"} icon='plus'>
                                </AnimatedFAB>
                            </Animated.View>
                    } */}