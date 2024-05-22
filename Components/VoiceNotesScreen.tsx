import { useState, useContext, useEffect, useCallback } from "react";
import { Alert, BackHandler, Dimensions, Platform, StyleSheet, View } from "react-native";
import { Text, Portal, useTheme, IconButton, AnimatedFAB, Icon, Appbar, Checkbox, Menu } from "react-native-paper";
import { AppContext } from "../AppContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { CurvedTransition, Easing, interpolateColor, runOnJS, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { ShareMenuComp } from "./SubComponents/NoteShareMenu";
import { AddToListDialogNotesSc } from "./SubComponents/AddToGroupsDialog";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RenderNoteItem } from "./SubComponents/NoteRenderItem";
import FontistoIcon from 'react-native-vector-icons/Fontisto';
import { MergeDialog } from "./SubComponents/VariableDialogs";
import { useRoute } from "@react-navigation/native";
import { SnackBarAnimated } from "./SubComponents/AnimatedSnackBar";
import { VoiceNoteItem } from "./SubComponents/VoiceNoteItem";
import { Audio } from "expo-av";
import { Sound } from "expo-av/build/Audio";
import { DeleteMultiVNDialog, DeleteVNDialog } from "./SubComponents/VoiceNoteDialogs";

type Props = {
    playSound: (location: string) => void,
    selected: number[],
    setSelected: (value: number[]) => void,
    navigation: any
}

export const VoiceNoteScreen = ({ navigation }: Props) => {

    const { voiceNotes, setVoiceNotes, binVNData, setBinVNData, groupList, setActiveScreen, sortOrder } = useContext(AppContext);
    const [sound, setSound] = useState<Sound>();
    const theme = useTheme();
    const [isLoaded, setIsLoaded] = useState(false);
    const [deleteNoteKey, setDeleteNoteKey] = useState(0);

    const [isDialogVisible, setIsDialogVisible] = useState(false);
    const [isMultiDeleteVisible, setIsMultiDeleteVisible] = useState(false);
    const [isListDialogVisible, setIsListDialogVisible] = useState(false);
    const [isMergeDialogVisible, setIsMergeDialogVisible] = useState(false);
    const [selectedGroupsList, setSelectedGroupsList] = useState([]);
    const [isAppbarMenuVisible, setIsAppbarMenuVisible] = useState(false);
    const [deleteTouchable, setDeleteTouchable] = useState(false);
    const [isSnackVisible, setIsSnackVisible] = useState(false);
    const [backUpData, setBackUpData] = useState(voiceNotes);
    const [binChache, setBinChache] = useState(binVNData);
    const insetTop = useSafeAreaInsets().top;

    const [selected, setSelected] = useState([]);
    const [selectedNotes, setSelectedNotes] = useState([]);
    const [visible, setVisible] = useState(true);

    let [refList, setRefList] = useState(Date.now());

    async function playSound(location: string) {
        //('Loading Sound');
        const { sound } = await Audio.Sound.createAsync({ uri: location },
            { shouldPlay: true })
        setSound(sound);
        //('Playing Sound');
        await sound.playAsync();
    }

    //#region 
    async function saveData(stringObj: string) {
        try {
            await AsyncStorage.setItem('voiceNotes', stringObj);
        } catch (error) {
            alert(error);
        }
    }
    //#endregion

    //#region 
    const ScrollY = useSharedValue(0);

    const AnimatedHeaderStyle = useAnimatedStyle(() => ({
        backgroundColor: selected.length ?
            theme.colors.elevation.level3 : interpolateColor(
                ScrollY.value,
                [30, 60],
                [theme.colors.surface, theme.colors.elevation.level3],
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
    //#endregion
    return (
        <Animated.View entering={enteringAnim} exiting={exitingAnim}
            style={{ flex: 1, backgroundColor: theme.colors.surface }}>

            <Animated.View style={AnimatedHeaderStyle}>
                {!selected.length ?
                    <Animated.View key={1} entering={searchBarEntering} style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Appbar.Action icon={'menu'} onPress={() => navigation.openDrawer()} style={{ marginHorizontal: 10 }} />
                        <Appbar.Content title={"Voice Notes"} titleStyle={{ fontFamily: 'Manrope' }} />
                        <IconButton icon={() => <FontistoIcon name="search"
                            size={18} color={theme.colors.onSurfaceVariant} />}
                            onPress={() => { navigation.navigate('AllNotesSearch', { previous_screen: "voiceNotesScreen", filter: ["VoiceNotes"] }) }} />

                        <Menu visible={isAppbarMenuVisible}
                            contentStyle={{ borderRadius: 17 }}
                            anchor={
                                <IconButton icon='dots-vertical' style={{ marginBottom: 5 }}
                                    onPress={() => setIsAppbarMenuVisible(true)} />
                            }
                            onDismiss={() => setIsAppbarMenuVisible(false)}>
                            <Menu.Item leadingIcon={'plus'} title='Merge group'
                                onPress={() => {
                                    setDeleteTouchable(true);
                                    setIsMergeDialogVisible(true);
                                }}
                            ></Menu.Item>
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
                            <Checkbox status={selected.length == voiceNotes.length ? 'checked' : 'unchecked'}
                                onPress={() => {
                                    if (selected.length == voiceNotes.length) {
                                        setSelected([])
                                        setSelectedNotes([])
                                        return;
                                    }
                                    let _temp = []
                                    let _tempNotes = []
                                    for (let i = 0; i < voiceNotes.length; i++) {
                                        _temp.push(voiceNotes[i].key)
                                        _tempNotes.push(voiceNotes[i])
                                    }
                                    setSelectedNotes(_tempNotes)
                                    setSelected(_temp)
                                }} />
                            <Appbar.Content titleStyle={{ fontSize: 19 }} title={(selected.length == voiceNotes.length ? "All " : "") + selected.length.toString() + " selected"} />
                            {/* {Platform.OS == 'web' ? null : <ShareMenuComp items={selectedNotes}/>} */}
                            <Appbar.Action icon={"trash-can-outline"}
                                onPress={() => {
                                    setBackUpData([...voiceNotes])
                                    setBinChache([...binVNData])
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

            <Animated.FlatList data={voiceNotes}
                renderItem={({ item, index }) =>
                    <VoiceNoteItem
                        key={index}
                        item={item}
                        index={index}
                        theme={theme}
                        voiceNotes={voiceNotes}
                        playSound={playSound}
                        selected={selected}
                        setSelected={setSelected} />
                } />
            <Portal>
                <DeleteVNDialog isDialogVisible={isDialogVisible}
                    setIsDialogVisible={setIsDialogVisible}
                    deleteNoteKey={deleteNoteKey}
                    binVNData={binVNData}
                    voiceNotes={voiceNotes}
                    thisTheme={theme}
                    touchable={deleteTouchable}
                    setTouchable={setDeleteTouchable}
                    setRefList={setRefList}
                    setIsSnackVisible={setIsSnackVisible} />
                <DeleteMultiVNDialog isDialogVisible={isMultiDeleteVisible}
                    setIsDialogVisible={setIsMultiDeleteVisible}
                    deleteNoteKeys={selected}
                    voiceNotes={voiceNotes}
                    setVoiceNotes={setVoiceNotes}
                    setDeleteNoteKeys={setSelected}
                    binVNData={binVNData}
                    thisTheme={theme}
                    touchable={deleteTouchable}
                    setTouchable={setDeleteTouchable}
                    setRefList={setRefList}
                    setIsSnackVisible={setIsSnackVisible} />
            </Portal>

            <SnackBarAnimated visible={isSnackVisible}
                setVisible={setIsSnackVisible}
                duration={4000}
                buttonLabel="Undo"
                bottomMargin={60}
                onButtonPress={async () => {
                    setVoiceNotes([...backUpData])
                    setBinVNData([...binChache])
                    await AsyncStorage.setItem('binData', JSON.stringify([...binChache]))
                    saveData(JSON.stringify([...backUpData]))
                }}
                label={"Note deleted and moved to Bin"} />
        </Animated.View>
    );
}