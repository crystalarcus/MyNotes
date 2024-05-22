import { Text, IconButton, TouchableRipple, Icon, MD3Theme, Divider } from "react-native-paper";
import { View, } from "react-native";
import Animated, {
    CurvedTransition, Easing, FadeInDown, FadeOutUp,
    StretchInX, StretchOutX, ZoomIn, useAnimatedStyle,
    withDelay, withTiming
} from "react-native-reanimated";
import { Dispatch, SetStateAction, useCallback, useContext, useEffect, useState } from "react";
import { AppContext } from "../../AppContext";
import { useRoute } from "@react-navigation/native";
import { NoteStyle } from "./NoteStyle";
import { Audio } from "expo-av";
import { Sound } from "expo-av/build/Audio";
import Menu from "./Menu";

type NoteProps = {
    navigation: any,
    item: Note,
    selected: number[],
    selectedNotes: Note[],
    isLoaded: boolean,
    index: number,
    originalData: object[],
    thisTheme: MD3Theme,
    setSelected: (value: number[]) => void,
    setTouchable: (value: boolean) => void,
    setBackUpData: (value: Note[]) => void,
    setBinChache: (value: Note[]) => void,
    setIsSnackVisible: (value: boolean) => void,
    setIsDialogVisible: (value: boolean) => void,
    setDeleteNoteKey: (value: number) => void,
    setSelectedNotes: (value: object[]) => void
    setShareVisible: (value: boolean) => void,
    setSharingNote: Dispatch<SetStateAction<Note>>,
}

export const RenderNoteItem = ({ navigation, item, selected, setIsSnackVisible,
    isLoaded, setSelected, index, setTouchable, originalData, setSharingNote,
    setShareVisible, setBackUpData, setBinChache, thisTheme, setIsDialogVisible,
    setDeleteNoteKey, selectedNotes, setSelectedNotes }: NoteProps) => {
    // const noteScale = useSharedValue(1, { duration: 250 });
    const { titleFontSize, contentFontSize, data, setData, binData, coloredNote,
        titleFontFamily, titleBold, contentBold, noteTemplate,
        contentFontFamily, showNoteBorder, noteHeight,
        showNoteActionBtns, showNoteDate, showNoteStar } = useContext(AppContext)
    const lastScreen = useRoute().name;
    const [sound, setSound] = useState<Sound>();
    const [menuVisible, setMenuVisible] = useState(false);
    const selectedPress = useCallback(() => {
        if (selected.includes(item.key)) {
            const newListItems = selected.filter(
                listItem => listItem !== item.key,
            );
            const newNotesListItems = selectedNotes.filter(
                listItem => listItem.key !== item.key,
            );
            // noteScale.value = withTiming(1, { duration: 300 })
            setSelectedNotes([...newNotesListItems]);
            return setSelected([...newListItems]);
        }
        // noteScale.value = withTiming(0.9, { duration: 300 })
        setSelectedNotes([...selectedNotes, item]);
        return setSelected([...selected, item.key]);
    }, [selected])
    const OutlineStyle = useAnimatedStyle(() => (
        {
            borderRadius: 22,
            overflow: 'hidden',
            backgroundColor: selected.includes(item.key) ?
                thisTheme.colors.primaryContainer :
                noteTemplate == 0 ? thisTheme.colors.surfaceContainerHigh
                    : noteTemplate == 1 || noteTemplate == 4 ?
                        thisTheme.colors.secondaryContainer :
                        'transparent',
            borderWidth: 3,
            borderColor: selected.includes(item.key) ?
                thisTheme.colors.outline :
                noteTemplate == 2 || noteTemplate == 3 || noteTemplate == 4 ?
                    thisTheme.colors.outlineVariant : 'transparent',
            marginHorizontal: 16,
            marginBottom: 12,

        }
    ))
    async function playSound(location: string) {
        //('Loading Sound');
        const { sound } = await Audio.Sound.createAsync({ uri: location },
            { shouldPlay: true })
        setSound(sound);
        //('Playing Sound');
        await sound.playAsync();
    }
    const enteringAnim = useCallback((targetValues) => {
        'worklet';
        const animations = {
            transform: [{ scale: withDelay(250, withTiming(1, { duration: 300, easing: Easing.bezier(0.2, 0, 0, 1) })) }],
            height: withDelay(250, withTiming(targetValues.targetHeight, { duration: 400, easing: Easing.bezier(0.2, 0, 0, 1) })),
            opacity: withDelay(250, withTiming(1, { duration: 200 })),
        }
        const initialValues = {
            transform: [{ scale: 0.5 }],
            height: 0,
            opacity: 1
        }
        return {
            initialValues,
            animations
        }
    }, [])
    const beginningAnim = useCallback((targetValues) => {
        'worklet';
        const animations = {
            transform: [{ scale: withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) }) }],
        }
        const initialValues = {
            transform: [{ scale: 0.5 }],
        }
        return {
            initialValues,
            animations
        }
    }, [])
    const exitingAnim = useCallback((values) => {
        'worklet';
        const animations = {
            height: withTiming(0, { duration: 400, easing: Easing.bezier(0.39, 0.02, 0.17, 0.91) }),
            opacity: withDelay(100, withTiming(0, { duration: 300 }))
        }
        const initialValues = {

            height: values.currentHeight,
            opacity: 1
        }
        return {
            initialValues,
            animations
        }
    }, [])
    useEffect(() => {
    }, [selected.length])
    return (
        <Animated.View style={OutlineStyle}
            entering={isLoaded ? enteringAnim : beginningAnim}
            exiting={exitingAnim}>
            <TouchableRipple style={{
                paddingTop: 20, paddingHorizontal: 22,
                paddingBottom: 6
            }} rippleColor={thisTheme.colors.primary + "10"}
                delayLongPress={250}
                unstable_pressDelay={55}
                onPress={() => {
                    if (selected.length) {
                        selectedPress();
                        return;
                    }
                    navigation.navigate("CreateNewNote",
                        {
                            note: item,
                            index: data.indexOf(item),
                            createNew: false,
                            noteID: originalData ? originalData.indexOf(item) : index,
                            previous_screen: lastScreen,
                            setIsSnackVisible: setIsSnackVisible,
                        })
                }}
                onLongPress={() => {
                    selectedPress()
                }}>
                <>
                    <View style={NoteStyle.textContent}>
                        {item.title != "" ?
                            <View style={{
                                width: '100%', flexDirection: 'row',
                                alignItems: 'flex-start', justifyContent: 'space-between'
                            }}>
                                <Text variant='headlineMedium'
                                    numberOfLines={2}
                                    style={{
                                        fontFamily: titleBold ? titleFontFamily + "-Bold" : titleFontFamily,
                                        fontSize: titleFontSize / 5,
                                        lineHeight: titleFontSize / 4.5,
                                        color: selected.includes(item.key) ?
                                            thisTheme.colors.onSecondaryContainer :
                                            thisTheme.colors.onSecondaryContainer,
                                        width: '80%'
                                    }}>{item.title}</Text>
                                {item.starred && showNoteStar ? <Icon source={'star'} size={24} color={thisTheme.colors.primary} /> : null}
                            </View>
                            : null}
                        {item.content != "" ?
                            <Text variant='bodyMedium'
                                numberOfLines={noteHeight == 'Medium' ? 5 : noteHeight == 'Small' ? 4 : 6}
                                style={{
                                    fontFamily: contentBold ? contentFontFamily + "-Bold" : contentFontFamily,
                                    fontSize: contentFontSize / 5,
                                    lineHeight: contentFontSize / 3.6,
                                    color: selected.includes(item.key) ? thisTheme.colors.onSecondaryContainer : thisTheme.colors.onSecondaryContainer
                                }}>{item.content}</Text>
                            : null}
                    </View>
                    <View style={{ marginTop: 8 }}>
                        {item.voiceNotes?.length ?
                            <View style={{
                                flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 16,
                                alignItems: 'center',
                                borderRadius: 30, gap: 12, backgroundColor: thisTheme.colors.surfaceContainer
                            }}>
                                <Icon source={'volume-high'} size={20} />
                                <Text style={{ fontSize: 16 }}>{item.voiceNotes[0].title}</Text>
                            </View>
                            : null}
                    </View>

                    <Animated.View layout={CurvedTransition}
                        style={{ ...NoteStyle.actionViewMain, height: !(showNoteDate || showNoteActionBtns) ? 0 : 55, }}>
                        <View style={NoteStyle.ActionTextView}>
                            {showNoteDate ?
                                <Text style={{ fontFamily: contentFontFamily, fontSize: 16 }}>{item.date}</Text>
                                : null}
                        </View>

                        {
                            selected.length ?
                                <View style={NoteStyle.actionView}>
                                    {selected.includes(item.key) ?
                                        <Animated.View key={1} entering={StretchInX.delay(40).duration(150)} exiting={StretchOutX.duration(40).duration(150)}>
                                            <Icon source={"check-circle"} color={thisTheme.colors.primary} size={33} />
                                        </Animated.View>
                                        :
                                        <Animated.View key={2} entering={StretchInX.delay(40).duration(150)} exiting={StretchOutX.duration(40).duration(150)} >
                                            <Icon source={"circle-outline"} color={thisTheme.colors.primary} size={33} />
                                        </Animated.View>}
                                </View>
                                :
                                showNoteActionBtns ?
                                    <Animated.View entering={FadeInDown.delay(90).duration(300)}
                                        style={NoteStyle.actionView} >
                                        <Menu onDismiss={() => { setMenuVisible(false) }}
                                            theme={thisTheme}
                                            scaleXAnimation={false}
                                            visible={menuVisible} anchorPosition='bottom'
                                            contentStyle={{ marginRight: 12 }}
                                            anchor={<IconButton icon={'dots-vertical'}
                                                style={{
                                                    backgroundColor: menuVisible ?
                                                        thisTheme.colors.primary + "32" : null,
                                                    left: 14
                                                }}
                                                onPress={() => setMenuVisible(true)} />}>
                                            <Menu.Item title={item.starred ? 'Unstar' : 'Star'}
                                                leadingIcon={item.starred ? 'star-off-outline' : 'star-outline'}
                                                onPress={() => {
                                                    let _data = data;
                                                    _data[data.indexOf(item)].starred = !item.starred
                                                    setData(_data)
                                                    console.log(!item.starred);
                                                    setMenuVisible(false)
                                                }} />
                                            <Menu.Item title='Delete' leadingIcon={'trash-can-outline'} onPress={() => {
                                                setMenuVisible(false);
                                                setBackUpData([...data]);
                                                setBinChache([...binData]);
                                                setIsSnackVisible(false);
                                                setDeleteNoteKey(data.indexOf(item));
                                                setTouchable(true);
                                                setIsDialogVisible(true);
                                            }} />
                                            <Menu.Item title='Share' leadingIcon={'share-variant-outline'} onPress={() => {
                                                setMenuVisible(false);
                                                setSharingNote(item);
                                                setShareVisible(true);
                                                setTouchable(true);
                                            }} />
                                            <Divider />
                                            <Menu.Item title='Details' leadingIcon={'information-outline'} onPress={() => {
                                                setMenuVisible(false);
                                                navigation.navigate('NoteDetails',
                                                    {
                                                        noteDetails: item
                                                    })
                                            }} />
                                        </Menu>
                                    </Animated.View>
                                    : null
                        }
                    </Animated.View>
                </>
            </TouchableRipple>
        </Animated.View >
    );
}
//<Animated.View entering={FadeInDown.delay(90).duration(300)} >
//         <ShareMenuComp iconColor={thisTheme.colors.onSurfaceVariant}
//             style={{ backgroundColor: 'transparent' }}
//             items={[item]} />
//     </Animated.View>
//     <Animated.View entering={FadeInDown.delay(180).duration(300)}>
//         <IconButton icon={'trash-can-outline'}
//             mode="contained-tonal"
//             iconColor={thisTheme.colors.onSurfaceVariant}
//             style={{ backgroundColor: 'transparent' }}
//             onPress={() => {
//                 setBackUpData([...data]);
//                 setBinChache([...binData]);
//                 setIsSnackVisible(false);
//                 setDeleteNoteKey(data.indexOf(item));
//                 setTouchable(true);
//                 setIsDialogVisible(true);
//             }}></IconButton>
//     </Animated.View>
export const RenderCompactNoteItem = ({ navigation, item, selected,
    setSelected, index, originalData, setIsSnackVisible,
    thisTheme, selectedNotes, setSelectedNotes }) => {

    const { titleFontSize, contentFontSize, data, coloredNote,
        titleFontFamily, titleBold, contentBold,
        contentFontFamily, showNoteBorder } = useContext(AppContext)
    const lastScreen = useRoute().name;
    const selectedPress = useCallback(() => {
        if (selected.includes(item.key)) {
            const newListItems = selected.filter(
                listItem => listItem !== item.key,
            );
            const newNotesListItems = selectedNotes.filter(
                listItem => listItem.key !== item.key,
            );
            setSelectedNotes([...newNotesListItems]);
            return setSelected([...newListItems]);
        }
        setSelectedNotes([...selectedNotes, item]);
        return setSelected([...selected, item.key]);
    }, [selected])
    const OutlineStyle = useAnimatedStyle(() => (
        {
            width: '96%',
            borderRadius: 15,
            overflow: 'hidden',
            backgroundColor: selected.includes(item.key) ?
                coloredNote ?
                    thisTheme.colors.primaryContainer :
                    thisTheme.colors.surface :
                coloredNote ?
                    thisTheme.colors.secondaryContainer :
                    thisTheme.colors.surfaceContainerHigh,
            borderWidth: 4,
            borderColor: selected.includes(item.key) ?
                thisTheme.colors.outline :
                showNoteBorder ? thisTheme.colors.outlineVariant : 'transparent',
            marginHorizontal: 5,
            marginBottom: 10,
        }
    ))

    const enteringAnim = useCallback(() => {
        'worklet';
        const animations = {
            transform: [{ scale: withDelay((index + 1) * 50, withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) })) }],
            opacity: withDelay((index + 1) * 120, withTiming(1, { duration: 300 }))
        }
        const initialValues = {
            transform: [{ scale: 0.5 }],
            opacity: 0
        }
        return {
            initialValues,
            animations
        }
    }, [])
    useEffect(() => {
    }, [selected.length])
    return (
        <Animated.View style={OutlineStyle}
            layout={CurvedTransition.duration(500)}
            entering={ZoomIn.duration(400)}
            exiting={FadeOutUp}>
            <TouchableRipple style={{}} rippleColor={thisTheme.colors.primary}
                delayLongPress={250}
                unstable_pressDelay={55}
                onPress={() => {
                    if (selected.length) {
                        selectedPress();
                        return;
                    }
                    navigation.navigate("CreateNewNote", {
                        note: item,
                        index: data.indexOf(item),
                        createNew: false,
                        noteID: originalData ? originalData.indexOf(item) : index,
                        previous_screen: lastScreen,
                        setIsSnackVisible: setIsSnackVisible,
                    })
                }}
                onLongPress={() => {
                    selectedPress()
                }}>
                <>
                    <View style={NoteStyle.textContentCompact}>
                        {item.title != "" ?
                            <Text variant='headlineMedium'
                                numberOfLines={2}
                                style={{
                                    fontFamily: titleBold ? titleFontFamily + "-Bold" : titleFontFamily,
                                    fontSize: titleFontSize / 6.5,
                                    lineHeight: titleFontSize / 5,
                                    color: selected.includes(item.key) ? thisTheme.colors.onSecondaryContainer : thisTheme.colors.onSecondaryContainer
                                }}>{item.title}</Text>
                            : null}
                        {item.content != "" ?
                            <Text variant='bodyMedium'
                                numberOfLines={6}
                                style={{
                                    fontFamily: contentBold ? contentFontFamily + "-Bold" : contentFontFamily,
                                    fontSize: contentFontSize / 6,
                                    lineHeight: contentFontSize / 4,
                                    color: selected.includes(item.key) ? thisTheme.colors.onSecondaryContainer : thisTheme.colors.onSecondaryContainer
                                }}>{item.content}</Text>
                            : null}
                    </View>

                </>
            </TouchableRipple>
        </Animated.View >
    );
}
{/* <View style={NoteStyle.actionViewMain}>
{
    selected.length ?
        <View style={NoteStyle.actionView}>
            {selected.includes(item.key) ?
                <Animated.View key={1} entering={StretchInX.delay(40)} exiting={StretchOutX.duration(40)}>
                    <Icon source={"check-circle"} color={thisTheme.colors.primary} size={33} />
                </Animated.View>
                :
                <Animated.View key={2} entering={StretchInX.delay(40)} exiting={StretchOutX.duration(40)} >
                    <Icon source={"circle-outline"} color={thisTheme.colors.primary} size={33} />
                </Animated.View>}
        </View>
        :
        <View style={NoteStyle.actionView} >
            <Animated.View entering={FadeInDown.delay(90).duration(300)} >
                 <ShareMenuComp iconColor={thisTheme.colors.onSurfaceVariant}
                    style={{ backgroundColor: 'transparent' }}
                    items={[item]} colored={showNoteBorder} /> 
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(180).duration(300)}>
                <IconButton icon={'trash-can-outline'}
                    mode="contained-tonal"
                    iconColor={thisTheme.colors.onSurfaceVariant}
                    style={{ backgroundColor: 'transparent' }}
                    onPress={() => {
                        setDeleteNoteKey(data.indexOf(item));
                        setTouchable(true);
                        setIsDialogVisible(true);
                    }}></IconButton>
            </Animated.View>
        </View>
}
</View> */}