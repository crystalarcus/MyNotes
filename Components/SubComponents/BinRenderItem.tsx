import { Text, IconButton, TouchableRipple, Icon, MD3Theme } from "react-native-paper";
import { View, } from "react-native";
import Animated, { Easing, FadeInDown, StretchInX, StretchOutX, useAnimatedStyle, useSharedValue, withDelay, withTiming } from "react-native-reanimated";
import { memo, useCallback, useContext, useEffect } from "react";
import { AppContext } from "../../AppContext";
import { NoteStyle } from "./NoteStyle";

type Props = {
    route: any,
    item: Note,
    selected: number[],
    index: number,
    binData: Note[],
    thisTheme: MD3Theme,
    setActionKey: (value: number) => void,
    selectedNotes: Note[],
    setSelected: (value: number[]) => void,
    setDeleteVisible: (value: boolean) => void,
    setDialogTouchable: (value: boolean) => void,
    setIsDialogVisible: (value: boolean) => void,
    setSelectedNotes: (value: Note[]) => void,
    setSnackVisible: (value: boolean) => void,
    setRestoredGrps: (value: number[]) => void,
}

export const BinRenderItem = memo(({ route, item, selected, setSelected, index, binData,
    setDeleteVisible, setDialogTouchable, thisTheme, setIsDialogVisible, setActionKey, setRestoredGrps,
    selectedNotes, setSelectedNotes, setSnackVisible }: Props) => {
    const { titleFontSize, contentFontSize,
        titleFontFamily, titleBold, contentBold, noteTemplate,
        contentFontFamily, noteHeight,
        showNoteActionBtns, showNoteDate, showNoteStar } = useContext(AppContext)
    const selectedPress = () => {
        if (selected.includes(index)) {
            const newListItems = selected.filter(
                listItem => listItem !== index,
            );
            const newNotesListItems = selectedNotes.filter(
                (listItem, _index) => _index !== index,
            );
            noteScale.value = withTiming(1, { duration: 250 })
            setSelectedNotes([...newNotesListItems]);
            return setSelected([...newListItems]);
        }
        setSelectedNotes([...selectedNotes, item]);
        return setSelected([...selected, index]);
    }
    const noteScale = useSharedValue(1);

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
    const enteringAnim = useCallback((targetValues) => {
        'worklet';
        const animations = {
            transform: [{ scale: withDelay(200, withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) })) }],
            height: withDelay(200, withTiming(targetValues.targetHeight, { duration: 700, easing: Easing.bezier(0.05, 0.7, 0.1, 1) })),
            opacity: withDelay(200, withTiming(1, { duration: 400 })),
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
    const exitingAnim = useCallback((values) => {
        'worklet';
        const animations = {
            height: withTiming(0, { duration: 500, easing: Easing.bezier(0.39, 0.02, 0.17, 0.91) }),
            opacity: withDelay(100, withTiming(0, { duration: 400 }))
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
        // selected.length ? null : noteScale.value = withTiming(1, { duration: 250 }),
        //     selected.includes(index) ? noteScale.value = withTiming(0.93, { duration: 200 }) : null
    }, [selected.length, route?.params?.updateTime])
    return (
        <Animated.View style={OutlineStyle} entering={enteringAnim}
            exiting={exitingAnim}>
            <TouchableRipple rippleColor={thisTheme.colors.primary + "10"}
                style={{ paddingVertical: 20, paddingHorizontal: 22 }}
                unstable_pressDelay={45}
                delayLongPress={120}
                onPress={() => {
                    if (selected.length) {
                        selectedPress();
                        return;
                    }
                }}
                onLongPress={() => {
                    setSnackVisible(false)
                    selectedPress()
                }}>
                <>
                    <View style={NoteStyle.textContent}>
                        {item.title != "" ?
                            <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Text variant='headlineMedium'
                                    numberOfLines={2}
                                    style={{
                                        fontFamily: titleBold ? titleFontFamily + "-Bold" : titleFontFamily,
                                        fontSize: titleFontSize / 5,
                                        lineHeight: titleFontSize / 4,
                                        color: selected.includes(item.key) ? thisTheme.colors.onSecondaryContainer : thisTheme.colors.onSecondaryContainer
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

                    <View
                        style={{ ...NoteStyle.actionViewMain, height: !(showNoteDate || showNoteActionBtns) ? 0 : 55 }}>
                        <View style={NoteStyle.ActionTextView}>
                            {showNoteDate ?
                                <Text style={{ fontFamily: contentFontFamily + '-Bold', fontSize: 16 }}>{item.date}</Text>
                                : null}
                        </View>
                        {
                            selected.length ?
                                <View style={NoteStyle.actionView}>
                                    {selected.includes(index) ?
                                        <Animated.View key={1} entering={StretchInX.delay(40)} exiting={StretchOutX.duration(40)}>
                                            <Icon source={"check-circle"} color={thisTheme.colors.primary} size={33} />
                                        </Animated.View>
                                        :
                                        <Animated.View key={2} entering={StretchInX.delay(40)} exiting={StretchOutX.duration(40)} >
                                            <Icon source={"circle-outline"} color={thisTheme.colors.primary} size={33} />
                                        </Animated.View>}
                                </View>
                                :
                                showNoteActionBtns ? <View style={NoteStyle.actionView} >
                                    <Animated.View entering={FadeInDown.delay(90).duration(300)} >
                                        <IconButton icon={"restore"}
                                            mode={"contained"}
                                            iconColor={thisTheme.colors.onSurfaceVariant}
                                            style={{ backgroundColor: 'transparent' }}
                                            onPress={() => {
                                                setSnackVisible(false);
                                                setRestoredGrps([]);
                                                setActionKey(binData.indexOf(item));
                                                setDialogTouchable(true);
                                                setIsDialogVisible(true);
                                            }}></IconButton>
                                    </Animated.View>
                                    <Animated.View entering={FadeInDown.delay(180).duration(300)}>
                                        <IconButton icon={'trash-can-outline'}
                                            mode="contained-tonal"
                                            iconColor={thisTheme.colors.onSurfaceVariant}
                                            style={{ backgroundColor: 'transparent' }}
                                            onPress={() => {
                                                setActionKey(binData.indexOf(item));
                                                setDialogTouchable(true);
                                                setDeleteVisible(true);
                                            }}></IconButton>
                                    </Animated.View>
                                </View> : null
                        }
                    </View>
                </>
            </TouchableRipple>
        </Animated.View>
    );
})
