import { Slider } from "@miblanchard/react-native-slider"
import { Sound } from "expo-av/build/Audio"
import { useEffect, useState } from "react"
import { StyleSheet, View } from "react-native"
import { Icon, IconButton, MD3Theme, Text, TouchableRipple } from "react-native-paper"
import Animated, { Easing, FadeInUp, FadeOutUp, ZoomIn, ZoomOut, interpolate, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"
import * as FileSystem from "expo-file-system";
import Menu from "./Menu"
type Props = {
    index: number,
    item: VoiceNoteType,
    theme: MD3Theme,
    playSound: (location: string) => void,
    pauseSound: () => void,
    resumeSound: () => void,
    voiceNotes: VoiceNoteType[],
    setVoiceNotes: (value: VoiceNoteType[]) => void,
    selected: number[],
    setSelected: (value: number[]) => void,
    sound: Sound,
    timeLine: number,
    setTimeLine: (value: number) => void,
    playFromPoint: (value: number) => void,
    stopSound: () => void,
}

export const VoiceNoteItem = ({ index, item, theme, playSound,
    selected, timeLine, setTimeLine, playFromPoint,
    setSelected, voiceNotes, setVoiceNotes,
    sound, pauseSound, resumeSound, stopSound }: Props) => {

    const [expanded, setExpanded] = useState(false);
    const [isMenuVisible, setisMenuVisible] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const outerHeight = useSharedValue(0)
    const outerStyle = useAnimatedStyle(() => ({
        height: interpolate(
            outerHeight.value,
            [0, 1],
            [60, 165]
        ),
        overflow: 'hidden',
        borderRadius: 35,
        marginHorizontal: 0, marginVertical: 0,
        backgroundColor: theme.colors.primaryContainer,
        borderColor: selected.includes(item.key) ?
            theme.colors.primary :
            "transparent",
        borderWidth: 1.8
    }))
    const playerStyle = useAnimatedStyle(() => ({
        transform: [{
            translateY: interpolate(
                outerHeight.value,
                [0, 1],
                [-18, 0]
            )
        }],
        opacity: interpolate(
            outerHeight.value,
            [0.5, 1],
            [0, 1]
        ),
        paddingHorizontal: 18
    }))
    const onPress = () => {
        if (selected.length) {
            onLongPress();
            return;
        }
        if (expanded) {
            stopSound();
            outerHeight.value = withTiming(0, { duration: 300, easing: Easing.bezier(0.39, 0.02, 0.17, 0.91) });
        }
        else {
            outerHeight.value = withTiming(1, { duration: 450, easing: Easing.bezier(0.05, 0.7, 0.1, 1) })
            playSound(item.uri);
            setIsPlaying(true);
        }
        setExpanded(!expanded)
    }
    const onLongPress = () => {
        selected.includes(item.key) ?
            setSelected(selected.filter(element => {
                return element != item.key;
            })) :
            setSelected([...selected, item.key])
    }
    async function deleteVN() {
        await FileSystem.deleteAsync(item.uri);
    }
    useEffect(() => {
        if (expanded) {

        }
    }, [expanded, selected])

    return (
        <Animated.View style={outerStyle}>
            <View style={{ height: 60, justifyContent: 'center' }}>
                <TouchableRipple
                    style={styles.voiceNoteStyle}
                    onPress={onPress}
                    onLongPress={onLongPress}>
                    <View style={{
                        height: '100%',
                        flexDirection: 'row', paddingHorizontal: 8,
                        alignItems: 'center', width: '100%',
                        justifyContent: 'space-between',
                    }}>
                        <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center', }}>
                            {expanded ?
                                <Animated.View entering={ZoomIn.delay(120).duration(200)}
                                    key={12}
                                    exiting={ZoomOut.duration(200)}>
                                    <Icon source={'close'} size={24}
                                        color={theme.colors.onPrimaryContainer} />
                                </Animated.View> :
                                <Animated.View entering={ZoomIn.delay(120).duration(200)}
                                    key={13}
                                    exiting={ZoomOut.duration(200)}>
                                    <Icon source={'volume-high'} size={24}
                                        color={theme.colors.onSurface} />
                                </Animated.View>}
                            <Text numberOfLines={1} style={{
                                fontSize: 18,
                                color: theme.colors.onPrimaryContainer,
                                width: '74%',
                                overflow: 'scroll',
                            }}>{item.title}</Text>
                        </View>
                        <Menu visible={isMenuVisible} 
                        theme={theme}
                        onDismiss={() => setisMenuVisible(false)}
                            anchor={<IconButton icon={'dots-vertical'}
                                iconColor={expanded ? theme.colors.onPrimaryContainer : theme.colors.onSurface}
                                style={{ margin: 0 }}
                                onPress={() => { setisMenuVisible(true) }} />}>
                            <Menu.Item title="Delete" leadingIcon={'trash-can-outline'}
                                onPress={() => {
                                    let VN = voiceNotes.filter(vn => vn.key != item.key);
                                    setVoiceNotes([...VN]);
                                    deleteVN();
                                }} />
                            <Menu.Item title="Share" leadingIcon={'account-plus-outline'}
                                onPress={() => { setisMenuVisible(false); }} />
                        </Menu>
                    </View>
                </TouchableRipple>
            </View>
            {sound ? <Animated.View style={playerStyle}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, justifyContent: 'space-between' }}>

                    <Text style={{ color: theme.colors.onPrimaryContainer, fontSize: 16 }}>{item.durationString[1] == '0' ? item.durationString.substring(3, 8) : item.durationString}</Text>

                    <IconButton icon={isPlaying ? 'pause' : 'play'}
                        iconColor={theme.colors.primaryContainer}
                        onPress={async () => {
                            if (isPlaying) {
                                pauseSound();
                                setIsPlaying(false);
                            }
                            else {
                                resumeSound();
                                setIsPlaying(true)
                            }
                        }}
                        style={{
                            margin: 0, backgroundColor: theme.colors.onPrimaryContainer,
                        }} />

                    <Text style={{ color: theme.colors.onPrimaryContainer, fontSize: 16 }}>{item.durationString[1] == '0' ? item.durationString.substring(3, 8) : item.durationString}</Text>

                </View>
                <Slider
                    value={timeLine}
                    onSlidingComplete={(value) => {
                        setIsPlaying(true);
                        playFromPoint(value[0]);
                    }}
                    step={100}
                    maximumValue={item.durationMili}
                    thumbTintColor={theme.colors.onPrimaryContainer}
                    minimumTrackTintColor={theme.colors.onPrimaryContainer}
                    maximumTrackTintColor={theme.colors.surfaceContainerLowest} />
            </Animated.View> : null}
        </Animated.View>
    )
}

export const VoiceNoteDisplay = ({ item, theme }: { item: VoiceNoteType, theme: MD3Theme }) => {
    return (
        <View style={{
            flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 16,
            alignItems: 'center',
            borderRadius: 30, gap: 12, backgroundColor: theme.colors.surfaceContainer
        }}>
            <Icon source={'volume-high'} size={20} />
            <Text style={{ fontSize: 16 }}>{item.title}</Text>
        </View>
    )
}

export const VoiceNoteBinItem = ({ item, theme, playSound, selected, setSelected }: Props) => {

    const [expanded, setExpanded] = useState(false);
    const outerHeight = useSharedValue(0)
    const outerStyle = useAnimatedStyle(() => ({
        height: interpolate(
            outerHeight.value,
            [0, 1],
            [70, 175]
        ),
        overflow: 'hidden',
        borderRadius: 35,
        marginHorizontal: 18, marginVertical: 8,
        backgroundColor: expanded || selected.includes(item.key) ?
            theme.colors.primaryContainer :
            theme.colors.surfaceContainer,
        borderColor: selected.includes(item.key) ?
            theme.colors.primary :
            "transparent",
        borderWidth: 1.8
    }))
    const titleStyle = useAnimatedStyle(() => ({
        fontSize: interpolate(
            outerHeight.value,
            [0, 1],
            [16, 22],
        ),

    }))
    const onPress = () => {
        if (selected.length) {
            onLongPress();
            return;
        }
        // playSound(item.uri);
        expanded ?
            outerHeight.value = withTiming(0, { duration: 300, easing: Easing.bezier(0.39, 0.02, 0.17, 0.91) }) :
            outerHeight.value = withTiming(1, { duration: 500, easing: Easing.bezier(0.05, 0.7, 0.1, 1) })

        setExpanded(!expanded)
    }
    const onLongPress = () => {
        selected.includes(item.key) ?
            setSelected(selected.filter(element => {
                return element != item.key;
            })) :
            setSelected([...selected, item.key])
    }

    useEffect(() => {
        if (expanded) {

        }
    }, [expanded, selected])

    return (
        <Animated.View entering={FadeInUp}
            exiting={FadeOutUp}
            style={outerStyle}>
            <View style={{ height: 70, justifyContent: 'center' }}>
                <TouchableRipple
                    style={styles.voiceNoteStyle}
                    onPress={onPress}
                    onLongPress={onLongPress}>
                    <View style={{
                        flexDirection: 'row', paddingHorizontal: 8,
                        alignItems: 'center', width: '100%',
                        justifyContent: 'space-between'
                    }}>
                        <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center', }}>
                            <Icon source={expanded ? 'close' : 'volume-high'} size={24} />
                            <Animated.Text style={titleStyle}>{item.title}</Animated.Text>
                        </View>
                        <IconButton icon={'trash-can-outline'}
                            style={{ margin: 0 }}
                            onPress={() => { }} />
                    </View>
                </TouchableRipple>
            </View>
            <View
                style={{ paddingHorizontal: 18 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, justifyContent: 'space-between' }}>
                    <Text>00:34</Text>
                    <IconButton icon={'pause'}
                        // iconColor={theme.colors.onPrimary}
                        onPress={() => { }}
                        style={{ margin: 0 }} />
                    <Text>01:12</Text>
                    {/* <IconButton icon={() => <MaterialIcon name="replay-5" size={30} />}
                            // iconColor={theme.colors.onPrimaryContainer}
                            style={{ margin: 0, }} /> */}
                    {/* <IconButton icon={'fast-forward-5'}
                        // iconColor={theme.colors.onPrimaryContainer}
                        style={{ margin: 0, }} /> */}
                </View>
                <Slider
                    thumbTintColor={theme.colors.primary}
                    minimumTrackTintColor={theme.colors.primary}
                    maximumTrackTintColor={theme.colors.outlineVariant} />
            </View>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    voiceNoteStyle: {
        paddingLeft: 12,
        paddingRight: 0,
        justifyContent: 'center',
        borderRadius: 35,
        height: 60,
    },
})