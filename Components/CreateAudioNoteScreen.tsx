import { useState, useContext, useEffect, useCallback } from "react";
import { Appbar, Button, Checkbox, Chip, Dialog, Icon, IconButton, Menu, Portal, Subheading, Text, TextInput, useTheme } from "react-native-paper";
import { BackHandler, Keyboard, Platform, ScrollView, StyleSheet, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppContext } from "../AppContext";
import { AddToListDialogCreateSc } from "./SubComponents/AddToGroupsDialog";
import Animated, { CurvedTransition, Easing, EntryAnimationsValues, FadeInRight, FadeOutLeft, FadeOutRight, ZoomIn, ZoomOut, interpolate, interpolateColor, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { ShareDialog } from "./SubComponents/NoteShareMenu";
import { DeleteNoteDialog } from "./SubComponents/DeleteDialogs";
import { Audio } from 'expo-av';
import { Recording, Sound } from "expo-av/build/Audio";
import { AnimatedDialog } from "./SubComponents/AnimatedDialog";
import * as FileSystem from "expo-file-system";


export function CreateAudioNote({ navigation, route }) {

    //#region 
    const { data, binData, groupList } = useContext(AppContext)
    const { voiceNotes } = route.params?.note
    const setVoiceNotes = route.params.setVoiceNotes;
    const [isLoaded, setIsLoaded] = useState(false);
    const [sound, setSound] = useState<Sound>();
    const createnew = route.params.createNew;
    const theme = useTheme();
    const [visible, setVisible] = useState(true)
    const [starred, setStarred] = useState(route.params.note.starred);
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [audioLocation, setAudioLocation] = useState<string>();
    const [isListDialogVisible, setIsListDialogVisible] = useState(false);
    const [nameDialogVisible, setNameDialogVisible] = useState(false);
    const [selectedGroupsList, setSelectedGroupsList] = useState(route.params.note.groups);
    const [dialogTouchable, setDialogTouchable] = useState(false);
    const [shareVisible, setShareVisible] = useState(false);
    const [deleteVisible, setDeleteVisible] = useState(false);
    const [length, setLength] = useState(0);
    const [recordingStatus, setRecordingStatus] = useState<Audio.RecordingStatus>();
    const [title, setTitle] = useState('');
    const [placeholder, setPlaceHolder] = useState('');
    const [selected, setSelected] = useState([]);
    const [isDoneRec, setIsDoneRec] = useState(false);
    const [goback, setGoback] = useState(true);
    const [meterings, setMeterings] = useState([]);
    const loadTitle = () => {
        let i = 1;
        let _title = "VoiceNote" + i.toString();
        let done = false;
        while (!done) {
            voiceNotes.forEach(_note => {
                if (_note.title == _title) {
                    i++;
                    _title = "VoiceNote" + i.toString();
                }
            })
            done = true;
        }
        setPlaceHolder(_title);
    }

    // const keyboard = useAnimatedKeyboard();

    function handleGoBack() {
        setVisible(false)
        return true;
    }

    const callbackF = () => {
        goback ? navigation.goBack() :
            navigation.navigate("CreateNewNote", {
                note: route.params.note,
                createnew: createnew
            })
    }
    const enteringAnim = (targetValues: EntryAnimationsValues) => {
        'worklet';
        const animations = {
            transform: [
                { scale: withTiming(1, { duration: 500, easing: Easing.bezier(0.05, 0.7, 0.1, 1) }) },
                { translateY: withTiming(0, { duration: 350, easing: Easing.bezier(0.05, 0.7, 0.1, 1) }) },
                { translateX: withTiming(0, { duration: 350, easing: Easing.bezier(0.05, 0.7, 0.1, 1) }) }]
        }
        const initialValues = {
            transform: [
                { scale: 0.6 },
                { translateY: createnew ? targetValues.targetHeight : 0 },
                { translateX: createnew ? -75 : 0 }
            ]
        }
        return {
            initialValues,
            animations
        }
    }
    const exitingAnim = useCallback(() => {
        'worklet';
        const animations = {
            transform: [{ scale: withTiming(0.9, { duration: 200 }) }, { originY: withTiming(100) }],
            opacity: withTiming(0, { duration: 200 })
        }
        const initialValues = {
            transform: [{ scale: 1 }, { originY: 0 }],
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
    }, [])
    //#endregion

    // Recording Functions
    //#region 
    const recordingAnim = useSharedValue(0);
    const [isPaused, setIsPaused] = useState(false);
    const [recording, setRecording] = useState<Recording>();
    const [permissionResponse, requestPermission] = Audio.usePermissions();

    async function startRecording() {
        try {
            if (permissionResponse.status !== 'granted') {
                //('Requesting permission..');
                await requestPermission();
            }
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            //('Starting recording..');
            const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
            recording.setOnRecordingStatusUpdate((status: Audio.RecordingStatus) => {
                setRecordingStatus(status);
            })
            setRecording(recording);
            setIsPaused(false)
            recordingAnim.value = withTiming(1)
            //('Recording started');
        } catch (err) {
            console.error('Failed to start recording', err);
        }
    }
    async function stopRecording() {
        setRecording(undefined);
        setIsPaused(false)
        recordingAnim.value = withTiming(0)

        await recording.stopAndUnloadAsync();
        await Audio.setAudioModeAsync(
            {
                allowsRecordingIOS: false,
            }
        );
        setLength(recording._finalDurationMillis);
    }
    async function pauseRecording() {
        const status = (await recording.getStatusAsync()).isRecording
        if (status) {
            setIsPaused(true)
            //('paused');
            await recording.pauseAsync();
        }
        else {
            setIsPaused(false)
            //('stared');
            await recording.startAsync();
        }
    }
    async function cancelRecording() {
        stopRecording();
        await FileSystem.deleteAsync(recording.getURI());
    }
    const saveNote = async () => {
        const vNote: VoiceNoteType = {
            title: title == "" ? placeholder : title,
            uri: audioLocation,
            date: new Date().toString(),
            key: Date.now(),
            type: "voice",
            durationMili: length,
            durationString: new Date(length).toISOString().slice(11, 19)
        }
        await AsyncStorage.setItem('voiceNotes', JSON.stringify([...voiceNotes, vNote]))
        setVoiceNotes([...voiceNotes, vNote]);
    }

    //#endregion

    const MicStyle = useAnimatedStyle(() => ({
        backgroundColor: interpolateColor(
            recordingAnim.value,
            [1, 0],
            [theme.colors.primary, theme.colors.primaryContainer]
        ),
        height: 100,
        width: 100,
        borderRadius: interpolate(
            recordingAnim.value,
            [0, 1],
            [50, 20]
        ),
        padding: 0,
        overflow: 'hidden'
    }))

    useEffect(() => {
        // if (recordingStatus?.isRecording) {
        //     var myInter = setInterval(() => {
        //         setMeterings([...meterings, (-1000 / recordingStatus.metering)]);
        //     }, 500);
        // }
        // else {
        //     clearInterval(myInter)
        // }
        if (sound) {
            return () => {
                //('Unloading Sound');
                sound.unloadAsync();
            }
        }
        BackHandler.addEventListener('hardwareBackPress', handleGoBack);
        return () => BackHandler.removeEventListener('hardwareBackPress', handleGoBack);
    }, [recording, isPaused]);

    return (
        visible ?
            <Animated.View entering={enteringAnim} exiting={exitingAnim}
                style={[styles.surfaceStyle, {
                    backgroundColor: theme.colors.surface,
                }]}>
                <ScrollView contentContainerStyle={styles.surfaceStyle}>
                    {!(selected.length) ?
                        <Appbar.Header style={{ backgroundColor: 'transparent' }} mode='small'>
                            <Appbar.BackAction
                                onPress={() => {
                                    if (Platform.OS == 'web') {
                                        if (sound) {
                                            //('Unloading Sound');
                                            sound.unloadAsync();
                                        }
                                        callbackF();
                                        return;
                                    }
                                    Keyboard.dismiss();
                                    setVisible(false)
                                }} />
                            <Appbar.Content title="Voice Note"></Appbar.Content>
                            {
                                createnew ? null :
                                    <Menu
                                        onDismiss={() => setIsMenuVisible(false)}
                                        visible={isMenuVisible}
                                        anchor={
                                            <Appbar.Action icon={'dots-vertical'}
                                                onPress={() => {
                                                    setIsMenuVisible(true)
                                                    Keyboard.dismiss();
                                                }} />
                                        }>
                                        <Menu.Item title="Delete" leadingIcon="trash-can-outline" onPress={() => {
                                            setIsMenuVisible(false)
                                            setDialogTouchable(true)
                                            setDeleteVisible(true)
                                        }} />
                                        <Menu.Item title="Share" leadingIcon="share-variant-outline" onPress={() => {
                                            setIsMenuVisible(false);
                                            setDialogTouchable(true);
                                            setShareVisible(true)
                                        }} />
                                        <Menu.Item title="Details" leadingIcon="information-outline"
                                            onPress={() => {
                                                setIsMenuVisible(false)
                                                navigation.navigate('NoteDetails', {
                                                    noteDetails: route.params.note,
                                                })
                                            }} />
                                    </Menu>
                            }
                        </Appbar.Header>
                        :
                        <Appbar.Header style={{ backgroundColor: 'transparent' }} mode='small'>
                            <Animated.View style={{ flexDirection: 'row', padding: 8, alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                <Checkbox status='unchecked' />
                                <Appbar.Content title="Select All" titleStyle={{ fontSize: 18 }} />
                                <Appbar.Action onPress={() => {
                                    selected.forEach(async (id) => {
                                        let path = voiceNotes[id].uri
                                        await FileSystem.deleteAsync(path);
                                        let vn = voiceNotes;
                                        vn.splice(id, 1)
                                        setVoiceNotes(vn)
                                        setSelected([])
                                    })
                                }} icon={'trash-can-outline'} />
                                <Appbar.Action onPress={() => { }} icon={'share-outline'} />
                            </Animated.View>
                        </Appbar.Header>
                    }

                    <Text>{createnew}</Text>
                    {/* Title TextInput */}
                    <TextInput label={'Title'}
                        mode='outlined'
                        placeholder={placeholder}
                        placeholderTextColor={theme.colors.outline + "99"}
                        onFocus={() => loadTitle()}
                        value={title}
                        right={
                            title == "" ? null :
                                <TextInput.Icon icon={'close'}
                                    onPress={() => setTitle("")} />
                        }
                        clearButtonMode='while-editing'
                        onChangeText={(text) => { setTitle(text); }}
                        style={{ marginHorizontal: 20 }} />
                    <View style={{
                        flexDirection: 'row', alignItems: 'center',
                        position: 'absolute', top: 200, height: 400,
                        gap: 8
                    }}>
                        {/* {
                            meterings.map((metering) =>
                                <Animated.View style={{
                                    height: metering,
                                    width: 20,
                                    backgroundColor: theme.colors.primary
                                }} key={metering}></Animated.View>
                            )
                        } */}
                    </View >
                    <View style={{
                        alignItems: 'center',
                        flex: 1,
                        justifyContent: 'flex-end',
                        bottom: 180
                    }}>
                        <Text style={{
                            textAlign: 'center',
                            fontFamily: 'OpenSans-Light',
                            fontSize: 48
                        }} >{recordingStatus?.canRecord ? new Date(recordingStatus?.durationMillis).toISOString().slice(11, 19) : "00:00:00"}</Text>
                    </View>
                    <View style={{
                        alignItems: 'center',
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: 24,
                    }}>
                        {isDoneRec ?
                            <View style={{
                                flexDirection: 'row',
                                justifyContent: 'space-evenly',
                                width: '100%',
                            }}>
                                <Button icon={'replay'} mode="outlined" style={styles.actionButtons}
                                    onPress={() => {

                                    }}>Retake</Button>
                                <Button icon={'check'} mode="contained" style={styles.actionButtons}
                                    onPress={() => {
                                        saveNote();
                                        setGoback(false);
                                        setVisible(false);
                                    }}>Save</Button>
                            </View> :
                            <View style={{ flexDirection: 'row', gap: 14 }}>
                                {recording ? <Animated.View layout={CurvedTransition} key={'second'} style={{ justifyContent: 'center' }}
                                    entering={FadeInRight.withInitialValues({ transform: [{ translateX: 100 }], opacity: 0 })}
                                    exiting={FadeOutRight}>
                                    <IconButton mode='contained' onPress={() => {
                                        stopRecording();
                                        setAudioLocation(recording.getURI());
                                        setIsDoneRec(true);
                                        if (title == "") { setTitle(placeholder) }
                                    }}
                                        style={{
                                            height: 80,
                                            width: 80,
                                            borderRadius: 50,
                                            margin: 0,
                                            borderColor: theme.colors.outlineVariant,
                                        }}
                                        icon={() =>
                                            <Animated.View entering={ZoomIn.delay(200)}
                                                key={12}
                                                exiting={ZoomOut}>
                                                <Icon source={'stop'}
                                                    size={40} />
                                            </Animated.View>
                                        } />
                                </Animated.View> : null}

                                <Animated.View layout={CurvedTransition.duration(250)} key={'main'} style={MicStyle}>
                                    <IconButton onPress={recording ?
                                        pauseRecording : startRecording}
                                        style={{
                                            height: 100,
                                            width: 100,
                                            borderRadius: 20,
                                            backgroundColor: 'transparent',
                                            margin: 0
                                        }}
                                        icon={() => recording && !isPaused ?
                                            <Animated.View entering={ZoomIn.delay(100).duration(250)}
                                                key={12}
                                                exiting={ZoomOut.duration(250)}>
                                                <Icon source={'pause'}
                                                    size={40}
                                                    color={recording ?
                                                        theme.colors.onPrimary :
                                                        theme.colors.onPrimaryContainer
                                                    } />
                                            </Animated.View> :
                                            <Animated.View entering={ZoomIn.delay(100).duration(250)}
                                                key={13}
                                                exiting={ZoomOut.duration(250)}>
                                                <Icon source={recording ? 'play' : 'microphone'}
                                                    size={40}
                                                    color={recording ?
                                                        theme.colors.onPrimary :
                                                        theme.colors.onPrimaryContainer
                                                    } />
                                            </Animated.View>

                                        } />
                                </Animated.View>

                                {recording ? <Animated.View layout={CurvedTransition} key={'cancel'} style={{ justifyContent: 'center' }}
                                    entering={FadeInRight.withInitialValues({ transform: [{ translateX: -100 }], opacity: 0 })}
                                    exiting={FadeOutLeft}>
                                    <IconButton mode='outlined' onPress={cancelRecording}
                                        style={{
                                            height: 80,
                                            width: 80,
                                            borderRadius: 50,
                                            margin: 0,
                                            borderColor: theme.colors.outlineVariant,
                                        }}
                                        icon={() =>
                                            <Animated.View entering={ZoomIn.delay(200)}
                                                key={12}
                                                exiting={ZoomOut}>
                                                <Icon source={'close'}
                                                    size={40} />
                                            </Animated.View>
                                        } />
                                </Animated.View> : null}
                            </View>}
                        {/* {recording ? 'Stop Recording' : 'Start Recording'} */}

                    </View>

                </ScrollView>

                <Portal>
                    <AddToListDialogCreateSc visible={isListDialogVisible}
                        theme={theme}
                        setVisible={setIsListDialogVisible}
                        groupList={groupList}
                        navigation={navigation}
                        selectedGroupsList={selectedGroupsList}
                        setSelectedGroupsList={setSelectedGroupsList}
                        touchable={dialogTouchable}
                        setTouchable={setDialogTouchable} />
                    <ShareDialog thisTheme={theme}
                        note={route.params.note}
                        touchable={dialogTouchable}
                        setTouchable={setDialogTouchable}
                        visible={shareVisible}
                        setVisible={setShareVisible} />
                    <DeleteNoteDialog isDialogVisible={deleteVisible}
                        setIsDialogVisible={setDeleteVisible}
                        data={data}
                        deleteNoteKey={route.params.index}
                        binData={binData}
                        goBack={() => {
                            Keyboard.dismiss();
                            setVisible(false)
                        }}
                        thisTheme={theme}
                        setIsSnackVisible={route.params.setIsSnackVisible}
                        touchable={dialogTouchable}
                        setTouchable={setDialogTouchable} />
                    <NameDialog visible={nameDialogVisible}
                        setVisible={setNameDialogVisible}
                        theme={theme}
                        duration={length}
                        touchable={dialogTouchable}
                        setTouchable={setDialogTouchable}
                        voiceNotes={voiceNotes}
                        setVoiceNotes={setVoiceNotes}
                        location={audioLocation} />
                </Portal>

            </Animated.View > :
            <View />
    );
}

const styles = StyleSheet.create({
    surfaceStyle: {
        flex: 1,
        height: '100%',
        justifyContent: 'flex-start',
    },
    bottomView: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        gap: 20,
        justifyContent: 'flex-end',
    },
    strokeColorButton: {
        marginHorizontal: 2.5, marginVertical: 8, width: 30, height: 30, borderRadius: 15,
    },
    strokeWidthButton: {
        marginHorizontal: 2.5, marginVertical: 8, width: 30, height: 30, borderRadius: 15,
        justifyContent: 'center', alignItems: 'center', backgroundColor: '#39579A'
    },
    actionButtons: {
        width: 10,
        minWidth: 115
    }
});

const NameDialog = ({ visible, theme, touchable, setVisible, setTouchable,
    setVoiceNotes, voiceNotes, location, duration }) => {
    const [text, setText] = useState("");
    const saveToStorage = async (vNote) => {

    }
    return (
        <AnimatedDialog visible={visible}
            thisTheme={theme}
            touchable={touchable}
            setTouchable={(setTouchable)}
            setVisible={setVisible}>
            <Dialog.Title>Voice Note Name</Dialog.Title>
            <Dialog.Content>
                <TextInput
                    placeholder={null}
                    value={text}
                    label={"Name"}
                    onChangeText={text => setText(text)}
                />
            </Dialog.Content>
            <Dialog.Actions>
                <Button onPress={async () => {
                    await FileSystem.deleteAsync(location);
                    setTouchable(false);
                }}>Cancel</Button>
                <Button onPress={() => { }}>Done</Button>
            </Dialog.Actions>
        </AnimatedDialog>
    )
}