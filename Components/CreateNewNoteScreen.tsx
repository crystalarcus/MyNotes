import { useState, useContext, useEffect } from "react";
import { Appbar, Button, Chip, IconButton, Portal, Text, TextInput, useTheme } from "react-native-paper";
import { BackHandler, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppContext } from "../AppContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AddToListDialogCreateSc } from "./SubComponents/AddToGroupsDialog";
import Animated, { CurvedTransition, Easing, FadeInDown, ZoomIn, ZoomOut, interpolateColor, runOnJS, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { ShareDialog } from "./SubComponents/NoteShareMenu";
import { DeleteNoteDialog } from "./SubComponents/DeleteDialogs";
import { VoiceNoteItem } from "./SubComponents/VoiceNoteItem";
import { Audio } from "expo-av";
import { Sound } from "expo-av/build/Audio";
import Menu from "./SubComponents/Menu";

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const daysOfWeekShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function CreateNewNoteScreen({ navigation, route }) {

    //#region 
    const { data, setData, binData, groupList, sortOrder } = useContext(AppContext)
    const [isLoaded, setIsLoaded] = useState(false);
    const [createnew, setCreateNew] = useState(route.params.createNew);
    const [previous_screen, setPreviousScreen] = useState(route.params.previous_screen);
    const [voiceNotes, setVoiceNotes] = useState(createnew ? [] : route.params.note.voiceNotes);
    const theme = useTheme();
    const [sound, setSound] = useState<Sound>();
    const topPadding = useSafeAreaInsets().top;
    const [visible, setVisible] = useState(true)
    const [noteTitle, setNoteTitle] = useState(route.params.note.title);
    const [noteContent, setNoteContent] = useState(route.params.note.content);
    const [starred, setStarred] = useState(route.params.note.starred);
    const noteKey = route.params.note.key;
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [istitleFocusable, setIstitleFocusable] = useState(true);
    const [isListDialogVisible, setIsListDialogVisible] = useState(false);
    const [selectedGroupsList, setSelectedGroupsList] = useState(route.params.note.groups);
    const [dialogTouchable, setDialogTouchable] = useState(false);
    const [shareVisible, setShareVisible] = useState(false);
    const [deleteVisible, setDeleteVisible] = useState(false);
    const [timeLine, setTimeLine] = useState(0);


    async function saveNewNote(obj) {
        let raw = data;
        switch (sortOrder) {
            case 1:
                raw.unshift(obj)
                break;
            case 2:
                raw.push(obj)
                break;
            case 3:
                raw.push(obj);
                raw.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 4:
                raw.push(obj);
                raw.sort((a, b) => b.title.localeCompare(a.title));
                break;
            default:
                break;
        }
        setData(raw);
        const stringObj = JSON.stringify(data);
        await AsyncStorage.setItem('data', stringObj.toString());
    }
    const [selected, setSelected] = useState([]);
    let [refList, setRefList] = useState(Date.now());

    async function playSound(location: string) {
        //('Loading Sound');
        const { sound } = await Audio.Sound.createAsync(
            { uri: location },
            { shouldPlay: true }
        )
        sound.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded) {
                setTimeLine(status.positionMillis)
            }
        })
        setSound(sound);
        //('Playing Sound');
        await sound.playAsync();
    }
    async function pauseSound() {
        //('Loading Sound');
        await sound.pauseAsync();
    }
    async function resumeSound() {
        await sound.playAsync();
    }
    async function playFromPoint(value: number) {
        sound.playFromPositionAsync(value);
    }
    async function stopSound() {
        await sound.stopAsync();
        await sound.unloadAsync();
    }
    // const keyboard = useAnimatedKeyboard();
    const ScrollY = useSharedValue(0)
    const scrollHandler = useAnimatedScrollHandler((event) => {
        ScrollY.value = event.contentOffset.y;
    })
    const animViewStyle3 = useAnimatedStyle(() => ({
        // transform: [
        //     { translateY: -keyboard.height.value }
        // ],
        backgroundColor: interpolateColor(
            ScrollY.value,
            [0, 100],
            [theme.colors.surfaceContainerLow, theme.colors.surfaceContainerHigh]
        ),
        width: '100%',
        alignItems: 'center',
        paddingRight: 15,
        flexDirection: 'row',
        gap: 10,
    }))
    async function saveEditedNote(obj, index) {
        data.splice(index, 1, obj);
        const stringObj = JSON.stringify(data);
        await AsyncStorage.setItem('data', stringObj.toString());
    }

    const getNoteDate = () => {
        const date = new Date().getDate();
        const month = monthsShort[new Date().getMonth()];
        const day = daysOfWeekShort[new Date().getDay()];
        return (date.toString() + " " + month + ", " + day);
    }
    const getFullNoteDate = () => {
        const date = new Date().getDate();
        const month = months[new Date().getMonth()];
        const day = daysOfWeek[new Date().getDay()];
        const year = new Date().getFullYear().toString();
        return (date.toString() + " " + month + " " + year + ", " + day);
    }
    const deleteGroupItem = (name: string) => {
        let filtered = selectedGroupsList.filter(item => item !== name);
        setSelectedGroupsList(filtered);
    }
    function handleGoBack() {
        setVisible(false)
        return true;
    }

    const callbackF = () => {
        navigation.goBack();
    }
    const onGoBack = () => {
        setVoiceNotes([...voiceNotes, route.params.note.voiceNotes])
    }
    const enteringAnim = (targetValues) => {
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
                { translateX: createnew ? targetValues.targetWidth : 0 }
            ]
        }
        return {
            initialValues,
            animations
        }
    }
    const exitingAnim = (targetValues) => {
        'worklet';
        const animations = {
            transform: [{ scale: withTiming(0.9, { duration: 200 }) }, { originY: withTiming(100) }],
            opacity: withTiming(0, { duration: 200 })
        }
        const initialValues = {
            transform: [{ scale: 1 }, { originY: 0 }],
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
    const AnimatedHeaderStyle = useAnimatedStyle(() => ({
        backgroundColor: interpolateColor(
            ScrollY.value,
            [0, 100],
            [theme.colors.surfaceContainerLow, theme.colors.surfaceContainerHigh]
        ),
        height: 80,
        paddingTop: topPadding,
        justifyContent: 'center'
    }))

    //#endregion

    useEffect(() => {
        setTimeout(() => {
            setIsLoaded(true)
        }, 400);
        BackHandler.addEventListener('hardwareBackPress', handleGoBack);
        return () => BackHandler.removeEventListener('hardwareBackPress', handleGoBack);
    }, [route.params?.note.voiceNotes]);
    return (
        visible ?
            <Animated.View entering={enteringAnim} exiting={exitingAnim}
                style={[styles.surfaceStyle, {
                    backgroundColor: theme.colors.surfaceContainerLow,
                }]}>
                <Animated.View
                    style={AnimatedHeaderStyle}>
                    <Appbar style={{ backgroundColor: 'transparent' }}>
                        <Animated.View entering={ZoomIn.delay(300).duration(250)} exiting={ZoomOut}>
                            <Appbar.BackAction
                                style={{ backgroundColor: theme.colors.surfaceContainerHighest }}
                                onPress={() => {
                                    if (Platform.OS == 'web') {
                                        callbackF();
                                        return;
                                    }
                                    Keyboard.dismiss();
                                    setVisible(false);
                                    sound ? stopSound() : null
                                }} />
                        </Animated.View>
                        <Appbar.Content title="" />
                        {
                            createnew ? null :
                                <Menu anchorPosition='bottom' theme={theme}
                                    contentStyle={{ marginRight: 12 }}
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
                                                noteDetails: route.params.note
                                            })
                                        }} />
                                </Menu>
                        }

                    </Appbar>
                </Animated.View>
                <Animated.ScrollView
                    onScroll={scrollHandler}
                    style={{ flex: 1 }} >
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                        {selectedGroupsList?.map((item, index) => {
                            return (
                                <Animated.View layout={CurvedTransition.duration(250)}
                                    entering={FadeInDown.delay(isLoaded ? 0 : (index + 1) * 300 / selectedGroupsList.length)
                                        .duration(350)
                                        .springify()
                                        .mass(0.8)
                                        .damping(8.5)}
                                    exiting={ZoomOut}
                                    style={{ flexWrap: 'wrap' }}
                                    key={item} >
                                    <Chip onClose={() => deleteGroupItem(item)}
                                        style={{ margin: 5 }}>{item}</Chip>
                                </Animated.View>
                            );
                        })}
                    </View>
                    {/* <Text>{createnew.toString()}</Text> */}
                    {/* <Text>{JSON.stringify(voiceNotes)}</Text> */}
                    <Animated.View sharedTransitionTag="2"
                        key={54}
                        layout={CurvedTransition.duration(200)}>
                        {/* <Text>{JSON.stringify(voiceNotes)}</Text> */}
                        <TextInput placeholder="Title"
                            focusable={istitleFocusable}
                            placeholderTextColor={theme.colors.outline + "99"}
                            autoFocus={true}
                            value={noteTitle}
                            onChangeText={text => setNoteTitle(text)}
                            contentStyle={{ fontFamily: 'Manrope' }}
                            style={{ backgroundColor: 'transparent', fontSize: 25, }}
                            underlineStyle={{ backgroundColor: 'transparent' }} />
                        <TextInput placeholder="Note Content"
                            multiline={true}
                            placeholderTextColor={theme.colors.outline + "99"}
                            value={noteContent}
                            contentStyle={{ fontFamily: 'Manrope' }}
                            style={{ backgroundColor: 'transparent', fontSize: 17, }}
                            onChangeText={text => setNoteContent(text)}
                            underlineStyle={{ backgroundColor: 'transparent' }}
                            scrollEnabled={false} />
                        <View style={{ marginHorizontal: 12, gap: 12 }}>
                            {
                                voiceNotes?.map((VNote: VoiceNoteType, index: number) =>
                                    <VoiceNoteItem key={index}
                                        sound={sound}
                                        pauseSound={pauseSound}
                                        item={VNote}
                                        index={index}
                                        theme={theme}
                                        playSound={playSound}
                                        resumeSound={resumeSound}
                                        selected={selected}
                                        setSelected={setSelected}
                                        voiceNotes={voiceNotes}
                                        setVoiceNotes={setVoiceNotes}
                                        timeLine={timeLine}
                                        setTimeLine={setTimeLine}
                                        playFromPoint={playFromPoint}
                                        stopSound={stopSound} />)
                            }
                        </View>
                        {/* <Text>{previous_screen}</Text> */}
                        <View style={{ flex: 1 }}>
                            {/* <Sketch
                                ref={sketch => {
                                    this.sketch = sketch;
                                }}
                                strokeColor="#ff69b4"
                                strokeThickness={3}
                            />
                            <Button onPress={this.save} title="Save" /> */}
                        </View>

                        <View style={{ height: 300 }} />
                    </Animated.View>
                </Animated.ScrollView>
                <KeyboardAvoidingView
                    behavior='position' pointerEvents="box-none"
                    style={styles.bottomView}>
                    <Animated.View style={animViewStyle3} layout={CurvedTransition.duration(200)}>
                        <View style={{ width: '50%', alignItems: 'flex-start' }}>
                            <Animated.View entering={ZoomIn.delay(400).duration(350).springify().mass(0.75).damping(5)}
                                style={{ flexDirection: 'row' }}>
                                <IconButton icon={starred ? 'star' : 'star-outline'}
                                    onPress={() => {
                                        setStarred(!starred);
                                    }}></IconButton>
                                <IconButton icon='microphone-outline'
                                    onPress={() => {
                                        Keyboard.dismiss()
                                        navigation.navigate('CreateAudioNote', {
                                            setVoiceNotes: setVoiceNotes,
                                            note: {
                                                title: "",
                                                content: "",
                                                groups: [],
                                                starred: false,
                                                key: Date.now(),
                                                voiceNotes: voiceNotes
                                            },
                                            createNew: createnew,
                                            previous_screen: 'CreateNewNote'
                                        });
                                    }}></IconButton>
                            </Animated.View>
                        </View>
                        <Animated.View entering={ZoomIn.delay(220).duration(150).springify()}
                            pointerEvents="box-none" style={{ width: '22%' }}>
                            <Button icon='plus' onPress={() => {
                                setDialogTouchable(true)
                                setIsListDialogVisible(true);
                                Keyboard.dismiss();
                            }}>Add</Button>
                        </Animated.View>
                        <Animated.View entering={ZoomIn.delay(200).duration(150).springify()}
                            pointerEvents="box-none" style={{ width: '22%' }}>
                            <Button mode='contained-tonal'
                                onPress={() => {
                                    Keyboard.dismiss();
                                    navigation.navigate({ name: previous_screen, params: { date: Date.now() } });
                                    let obj = {
                                        title: noteTitle,
                                        content: noteContent,
                                        starred: starred,
                                        date: createnew ? getNoteDate() : route.params.note.date,
                                        fullDate: createnew ? getFullNoteDate() : route.params.note.fullDate,
                                        timeCreated: createnew ? new Date().toLocaleTimeString() : route.params.note.timeCreated,
                                        modified: getFullNoteDate() + ", " + new Date().toLocaleTimeString(),
                                        modifiedKey: Date.now(),
                                        key: noteKey,
                                        groups: selectedGroupsList,
                                        voiceNotes: voiceNotes
                                    }
                                    createnew ? saveNewNote(obj) : saveEditedNote(obj, route.params.noteID);
                                }}><Text style={{ width: 100, fontFamily: 'Manrope-Bold', color: theme.colors.primary }}>Save</Text></Button>
                        </Animated.View>
                    </Animated.View>
                </KeyboardAvoidingView >
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
                        setData={setData}
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
    functionButton: {
        marginHorizontal: 2.5, marginVertical: 8, height: 30, width: 60,
        backgroundColor: '#39579A', justifyContent: 'center', alignItems: 'center', borderRadius: 5,
    }
});