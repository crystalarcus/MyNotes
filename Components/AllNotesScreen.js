import { Searchbar, Button, Text, AnimatedFAB, Surface, Menu, Portal, Dialog, IconButton, useTheme, TouchableRipple, List, Icon, Appbar, Checkbox } from "react-native-paper";
import { StyleSheet, View, FlatList, Image, SafeAreaView, } from "react-native";
import { useState, useContext, useEffect, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppContext } from "../AppContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { ZoomIn, ZoomOut, interpolate, interpolateColor, runOnJS, runOnUI, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { ShareMenuComp } from "./SubComponents/NoteShareMenu";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();


//#region 
const DeleteNoteDialog = ({ isDialogVisible, setIsDialogVisible,
    data,
    deleteNoteKey, setDeleteNoteKey,
    binData, saveData }) => {
    // const thisTheme = useTheme();

    function removeNote() {
        data.splice(deleteNoteKey, 1);
        const stringObj = JSON.stringify(data);
        saveData(stringObj);
    }
    async function moveToBin(key) {
        var note = data[key]
        binData.push(note);
        jsonString = JSON.stringify(binData);
        await AsyncStorage.setItem('binData', jsonString);
    }

    return (
        <Dialog visible={isDialogVisible} onDismiss={() => setIsDialogVisible(false)}>
            <Dialog.Title>Delete this Note?</Dialog.Title>
            <Dialog.Content>
                <View style={{ flexDirection: 'column', gap: 10 }}>
                    <Text variant="bodyLarge">
                        You can restore files moved to bin but once Deleted, it cannot be restored
                    </Text>

                </View>
            </Dialog.Content>
            <Dialog.Actions style={{ justifyContent: 'center', flexDirection: 'column', gap: 10 }}>
                <Button style={{
                    padding: 5, borderRadius: 40,
                    width: 200, paddingHorizontal: 15
                }}
                    mode="contained"
                    onPress={() => {
                        moveToBin(deleteNoteKey);
                        removeNote(deleteNoteKey);
                        setIsDialogVisible(false);
                        setDeleteNoteKey(0);
                    }}>Move to Bin</Button>
                <Button style={{
                    padding: 5, borderRadius: 40,
                    width: 200, paddingHorizontal: 15
                }}
                    mode="contained-tonal"
                    onPress={() => {
                        removeNote(deleteNoteKey);
                        setIsDialogVisible(false);
                        setDeleteNoteKey(0)
                    }}>Delete Note</Button>
            </Dialog.Actions>
        </Dialog>
    );
}
const DeleteMultiNoteDialog = ({ isDialogVisible, setIsDialogVisible,
    data, setData,
    deleteNoteKeys, setDeleteNoteKeys,
    binData, saveData }) => {

    // const thisTheme = useTheme();

    function removeNote(keys) {
        let _data = [];
        data.forEach(item => {
            if (!keys.includes(item.key)) {
                _data.push(item);
            }
        })
        // console.log(JSON.stringify(data))
        setData(_data)
        const stringObj = JSON.stringify(_data);
        saveData(stringObj);
    }
    async function moveToBin(key) {
        data.forEach(item => {
            if (key.includes(item.key)) {
                binData.push(item);
                // console.log(item.title)
            }
        });
        jsonString = JSON.stringify(binData);
        await AsyncStorage.setItem('binData', jsonString);
    }

    return (
        <Dialog visible={isDialogVisible} onDismiss={() => setIsDialogVisible(false)}>
            <Dialog.Title>Delete this Note?</Dialog.Title>
            <Dialog.Content>
                <View style={{ flexDirection: 'column', gap: 10 }}>
                    <Text variant="bodyLarge">
                        You can restore files moved to bin but once Deleted, it cannot be restored
                    </Text>
                </View>
            </Dialog.Content>
            <Dialog.Actions style={{ justifyContent: 'center', flexDirection: 'column', gap: 10 }}>
                <Button style={{
                    padding: 5, borderRadius: 40,
                    width: 200, paddingHorizontal: 15
                }}
                    mode="contained"
                    onPress={() => {
                        moveToBin(deleteNoteKeys);
                        removeNote(deleteNoteKeys);
                        setIsDialogVisible(false);
                        setDeleteNoteKeys([]);
                    }}>Move to Bin</Button>
                <Button style={{
                    padding: 5, borderRadius: 40,
                    width: 200, paddingHorizontal: 15
                }}
                    mode="contained-tonal"
                    onPress={() => {
                        removeNote(deleteNoteKeys);
                        setIsDialogVisible(false);
                        setDeleteNoteKeys([])
                    }}>Delete Note</Button>
            </Dialog.Actions>
        </Dialog>
    );
}
//#endregion

export function AllNotes({ navigation }) {

    //#region 
    const thisTheme = useTheme();
    const { data, setData, binData,
        setBinData, titleFontSize, contentFontSize,
        titleFontFamily, titleBold, contentBold,
        contentFontFamily, showNoteBorder } = useContext(AppContext);
    const [isItemSelected, setIsItemSelected] = useState(false);
    const [selected, setSelected] = useState([])

    let refList = useMemo(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            refList == null ? refList = true :
                refList = !refList;
        })
    })
    const [deleteNoteKey, setDeleteNoteKey] = useState(0);
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [isDialogVisible, setIsDialogVisible] = useState(false);
    const [isMultiDeleteVisible, setIsMultiDeleteVisible] = useState(false);
    const insetTop = useSafeAreaInsets().top;
    const ListEmptyComp = () => {
        return (
            <View style={{ flex: 1, alignItems: 'center', height: '100%' }}>
                <View style={{ marginTop: "50%" }}>
                    <Icon source={"draw-pen"}
                        size={100}
                        color={thisTheme.colors.onPrimaryContainer} />
                </View>
                <Text variant="headlineMedium"
                    style={{
                        fontFamily: 'OpenSans',
                        color: thisTheme.colors.onSurface,
                        marginTop: 20, marginBottom: 5,
                        fontSize: 21, letterSpacing: 2
                    }}
                >{"You have no Notes"}</Text>
                <Text variant="bodyLarge"
                    style={{ color: thisTheme.colors.outline, }}
                >{"Try writing some"}</Text>

            </View>
        );
    }
    const RenderNoteItem = ({ item }) => {
        return (
            <Surface
                elevation={1}
                theme={{
                    colors: {
                        elevation: {
                            level1: selected.includes(item.key) ? thisTheme.colors.elevation.level5 :
                                showNoteBorder ?
                                    thisTheme.colors.surface :
                                    thisTheme.colors.surfaceContainerHigh
                        }
                    }
                }}
                style={[styles.itemView,
                {
                    borderWidth: selected.includes(item.key) ? 4 :
                        showNoteBorder ?
                            2.3 : 0,
                    borderColor: selected.includes(item.key) ?
                        thisTheme.colors.primary : thisTheme.colors.outlineVariant,
                }]}>
                <TouchableRipple rippleColor={isItemSelected ? "transparent" : thisTheme.colors.surfaceVariant}
                    unstable_pressDelay={80}
                    onPress={() => {
                        if (selected.includes(item.key)) {
                            const newListItems = selected.filter(
                                listItem => listItem !== item.key,
                            );
                            if (newListItems.length == 0) {
                                appBarHeight.value = withTiming(0, { duration: 180 })
                                // setIsItemSelected(false)
                            }
                            return setSelected([...newListItems]);
                        }
                        if (isItemSelected) {
                            return setSelected([...selected, item.key]);
                        }
                        navigation.navigate("CreateNewNote", {
                            title: item.title,
                            content: item.content,
                            date: item.date,
                            groups: item.groups,
                            createNew: false,
                            noteID: data.indexOf(item)
                        })
                    }}
                    onLongPress={() => {
                        if (selected.length) {
                            if (selected.includes(item.key)) {

                                const newListItems = selected.filter(
                                    listItem => listItem !== item.key,
                                );
                                // if (newListItems.length == 0) {
                                //     appBarHeight.value = withTiming(0, { duration: 180 })
                                //     // setIsItemSelected(false)
                                // }
                                return setSelected([...newListItems]);
                            }
                            setSelected([...selected, item.key]);
                        }
                        else {
                            // appBarHeight.value = withTiming(60, { duration: 250 })
                            setSelected([...selected, item.key]);
                            setIsItemSelected(true)

                        }
                    }}>
                    <View>
                        <View style={styles.textContent}>
                            {item.title != "" ?
                                <Text variant='headlineMedium'
                                    numberOfLines={2}
                                    style={{
                                        fontFamily: titleBold ? titleFontFamily + "-Medium" : titleFontFamily,
                                        fontSize: titleFontSize / 4.3,
                                        lineHeight: titleFontSize / 4,
                                        color: thisTheme.colors.onPrimaryContainer
                                    }}>{item.title}</Text> : null}
                            {item.content != "" ?
                                <Text variant='bodyMedium'
                                    numberOfLines={8}
                                    style={{
                                        fontFamily: contentBold ? contentFontFamily + "-Medium" : contentFontFamily,
                                        fontSize: contentFontSize / 6,
                                        lineHeight: contentFontSize / 5,
                                        color: thisTheme.colors.onSurfaceVariant
                                    }}>{item.content}</Text> : null}
                        </View>
                        <View style={styles.actionViewMain}>
                            <View style={styles.ActionTextView}>
                                <Text style={styles.DateText}>{item.date}</Text>
                            </View>
                            {selected.includes(item.key) ?
                                <View style={styles.actionView}>

                                    <Icon source={"check-circle"} color={thisTheme.colors.primary} size={30} />
                                </View> :
                                isItemSelected ?
                                    <View style={styles.actionView}>
                                        <Icon source={"circle-outline"} color={thisTheme.colors.primary} size={30} />
                                    </View>
                                    :
                                    <View style={styles.actionView}>
                                        <ShareMenuComp item={item} />
                                        <IconButton icon={'delete-outline'}
                                            mode="contained-tonal"
                                            style={{ backgroundColor: 'transparent' }}
                                            onPress={() => {
                                                setDeleteNoteKey(data.indexOf(item));
                                                setIsDialogVisible(true);
                                            }}></IconButton>
                                    </View>
                            }
                        </View>
                    </View>
                </TouchableRipple>
            </Surface>
        );
    }

    async function saveData(stringObj) {
        try {
            await AsyncStorage.setItem('data', stringObj);
        } catch (error) {
            console.log(error);
        }
    }

    async function clearData() {
        try {
            await AsyncStorage.setItem('data', '[]');
            setData([]);
            alert('DATA CLEARED');
        } catch (error) {
            console.log(error)
        }
    }

    async function saveData() {
        const stringObj = JSON.stringify(data);
        await AsyncStorage.setItem('data', stringObj.toString());
    }
    //#endregion
    const ScrollY = useSharedValue(0);

    const scrollHandler = useAnimatedScrollHandler((event) => {
        ScrollY.value = event.contentOffset.y;
    });

    const AnimatedHeaderStyle = useAnimatedStyle(() => ({
        backgroundColor: isItemSelected ?
            thisTheme.colors.elevation.level2 :
            interpolateColor(
                ScrollY.value,
                [30, 60],
                [thisTheme.colors.surface, thisTheme.colors.elevation.level2],
            ),
        paddingTop: insetTop + 10,
        height: 90,
        justifyContent: 'center'
    }))

    const appBarHeight = useSharedValue(0);

    // const appBarView = useAnimatedStyle(() => ({
    //     height: appBarHeight.value,
    //     overflow: 'hidden',
    //     opacity: 1,
    //     backgroundColor: isItemSelected ? thisTheme.colors.elevation.level2 : "transparent",
    //     flexDirection: 'row',
    //     alignItems: 'center',
    //     justifyContent: 'center'
    // }))
    const exitingAnimation = () => {
        setIsItemSelected(false)
        console.log("done")
    }
    return (
        <Surface elevation={1}
            style={{ flex: 1, }}
            theme={{ colors: { elevation: { level1: thisTheme.colors.surface } } }}>
            {/* <Text>{JSON.stringify(addFromBottom)}</Text> */}
            <Animated.View style={AnimatedHeaderStyle}>
                {!selected.length ?
                    // <Animated.View entering={ZoomIn}>
                    // isItemSelected ? null :
                    <Searchbar icon='menu'
                        theme={{ colors: { elevation: { level3: thisTheme.colors.elevation.level2 } } }}
                        iconColor={thisTheme.colors.onSurface}
                        onIconPress={() => { navigation.openDrawer() }}
                        focusable={false}
                        onTouchEnd={() => {
                            navigation.navigate('AllNotesSearch')
                        }}
                        traileringIcon={() => {
                            return (
                                <Menu visible={isMenuVisible}
                                    contentStyle={{ borderRadius: 17 }}
                                    anchor={
                                        <IconButton icon='dots-vertical' style={{ marginBottom: 5 }}
                                            onPress={() => setIsMenuVisible(true)} />
                                    }
                                    onDismiss={() => setIsMenuVisible(false)}>
                                    <Menu.Item title='Delete all notes' onPress={() => {
                                        clearData();
                                    }}></Menu.Item>
                                    {/* <Menu.Item title='Delete Bin' onPress={() => {
                                   clearBinData();
                               }
                               }></Menu.Item> */}
                                    <Menu.Item title='Load Dummy Data' onPress={() => {

                                        // console.log(data)
                                        setData(d);
                                    }
                                    }></Menu.Item>
                                </Menu>
                            );

                        }}
                        onTraileringIconPress={() => setIsMenuVisible(true)}
                        mode='bar'
                        placeholder="Search Notes"
                        showDivider={false}
                        inputStyle={{ fontFamily: 'Urbanist' }}
                        style={styles.Searchbar}
                    >
                    </Searchbar >
                    // </Animated.View>
                    :
                    <Animated.View entering={ZoomIn.duration(200).withInitialValues({ height: 30, width: 100 })}
                        exiting={ZoomOut.duration(200).withCallback((finished) => {
                            'worklet';
                            if (finished) {
                                runOnJS(() => exitingAnimation())
                                console.log("abc")
                            }
                        })}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Appbar.Action icon="close" onPress={() => {
                                setSelected([])
                                appBarHeight.value = withTiming(0, { duration: 180 })
                                setIsItemSelected(false)
                            }} />
                            <Checkbox status={selected.length == data.length ? 'checked' : 'unchecked'}
                                onPress={() => {
                                    if (selected.length == data.length) {
                                        setSelected([])
                                        return;
                                    }
                                    let _temp = []
                                    for (let i = 0; i < data.length; i++) {
                                        _temp.push(data[i].key)
                                    }
                                    setSelected(_temp)
                                }} />
                            <Appbar.Content titleStyle={{ fontSize: 19 }} title={(selected.length == data.length ? "All " : "") + selected.length.toString() + " selected"} />
                            <Appbar.Action icon="share-outline" onPress={() => { }} />
                            <Appbar.Action icon={"delete-outline"} onPress={() => { setIsMultiDeleteVisible(true) }} />
                            <Menu visible={isMenuVisible}
                                contentStyle={{ borderRadius: 17 }}
                                anchor={
                                    <IconButton icon='dots-vertical' style={{ marginBottom: 5 }}
                                        onPress={() => setIsMenuVisible(true)} />
                                }
                                onDismiss={() => setIsMenuVisible(false)}>
                                <Menu.Item title='Delete all notes' onPress={() => {
                                    clearData();
                                }}></Menu.Item>
                                {/* <Menu.Item title='Delete Bin' onPress={() => {
                                     clearBinData();
                                 }
                                 }></Menu.Item> */}
                                <Menu.Item title='Load Dummy Data' onPress={() => {

                                    // console.log(data)
                                    setData(d);
                                }
                                }></Menu.Item>
                            </Menu>
                        </View>

                    </Animated.View>
                }


            </Animated.View>
            {/* <Text>{JSON.stringify(selected)}</Text> */}
            < Animated.FlatList
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                data={data}
                containerStyle={{ height: '90%' }}
                extraData={refList}
                contentContainerStyle={{ paddingBottom: 100, }}
                ListEmptyComponent={ListEmptyComp}
                keyExtractor={item => item.key}
                renderItem={item => RenderNoteItem(item)} />

            < Portal >
                <DeleteNoteDialog isDialogVisible={isDialogVisible}
                    setIsDialogVisible={setIsDialogVisible}
                    data={data}
                    deleteNoteKey={deleteNoteKey}
                    setDeleteNoteKey={setDeleteNoteKey}
                    binData={binData}
                    saveData={saveData} />
                <DeleteMultiNoteDialog isDialogVisible={isMultiDeleteVisible}
                    setIsDialogVisible={setIsMultiDeleteVisible}
                    data={data}
                    setData={setData}
                    deleteNoteKeys={selected}
                    setDeleteNoteKeys={setSelected}
                    binData={binData}
                    saveData={saveData} />

            </Portal >
            <View pointerEvents="box-none" style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 20,
                bottom: 20,
                justifyContent: 'flex-end',
                alignItems: 'flex-end'
            }}>
                {
                    isItemSelected ? null :
                        <AnimatedFAB iconMode='dynamic'
                            color={thisTheme.colors.onPrimary}
                            style={{ backgroundColor: thisTheme.colors.primary }}
                            extended={true}
                            animateFrom='right'
                            onPress={() => {
                                navigation.navigate('CreateNewNote', {
                                    title: "",
                                    content: "",
                                    groups: [],
                                    createNew: true,
                                });
                            }}
                            label={"Create"} icon='plus'>
                        </AnimatedFAB>
                }
            </View>
        </Surface >

    );
}

const styles = StyleSheet.create({

    Searchbar: {
        shadowColor: 'transparent',
    },
    itemView: {
        // backgroundColor: '#FFD9E2',
        marginVertical: 10,
        borderRadius: 20,
        shadowColor: 'transparent',
        overflow: 'hidden',
        marginHorizontal: 10
    },
    textContent: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: 20,
        gap: 10
    },
    DateText: {
        // fontSize: 16,
        // fontWeight: '600',
    },
    actionViewMain: {
        display: 'flex',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingBottom: 10
    },
    actionView: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        width: '65%',
        paddingHorizontal: 20,
        height: 30
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
    createButton: {
        marginLeft: 30
    },

});
var d = [
    {
        "title": "Determinant",
        "content": "The Determinant is a scalar value that is a function of the entries of a square matrix. It characterizes some properties of the matrix.",
        "date": "1 Aug, Tue",
        "groups": [
            "College"
        ],
        "key": 1690903047353
    },
    {
        "title": "Matrix",
        "content": "Matrix is a set of numbers arranged in rows and columns so as to form a rectangular array. The numbers are called the elements, or entries, of the matrix.",
        "date": "1 Aug, Tue",
        "groups": [
            "College"
        ],
        "key": 1690902947353
    },
    {
        "title": "Grocerry",
        "content": "Apples, \nBananas, \nStrawberries, \nAvocados, \nBell Peppers, \nCarrots, \nBroccoli, \nGarlic, \nLemons/ Limes, \nOnion, \nParsley, \nCilantro, \nBasil",
        "date": "1 Aug, Tue",
        "groups": [
            "Personal"
        ],
        "key": 1690903247353
    },
    {
        "title": "Center of Mass ",
        "content": "The center of mass is the unique point at the center of a distribution of mass in space that has the property that the weighted position vectors relative to this point sum to zero. In analogy to statistics, the center of mass is the mean location of a distribution of mass in space.",
        "date": "16 Dec, Sat",
        "key": 1702710585038,
        "groups": [
            "College"
        ]
    }
]
