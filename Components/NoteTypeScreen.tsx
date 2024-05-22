import Animated, { CurvedTransition, Easing, FadeInDown, FadeInUp, interpolateColor, runOnJS, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withDelay, withTiming } from "react-native-reanimated";
import { Text, RadioButton, Button, useTheme, List, Appbar, Divider } from "react-native-paper";
import { Dimensions, StyleSheet, ViewStyle, View } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { useContext, useRef, useState } from "react";
import { AppContext } from "../AppContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialSwitchListItem } from "./SubComponents/MaterialSwitchListItem";

export const NoteTypeScreen = ({ navigation, route }) => {
    const theme = useTheme()
    const callbackF = () => {
        navigation.goBack();
    }
    const [visible, setVisible] = useState(true);
    const dotProg = useSharedValue(0);
    const dotstyle = useAnimatedStyle(() => ({
        transform: [{ translateX: dotProg.value }],
        height: 5, width: 5,
        borderRadius: 5,
        backgroundColor: theme.colors.primary,
        zIndex: 10,
        marginRight: -15
    }))
    const callbackF2 = () => setLoaded(true)
    const [loaded, setLoaded] = useState(false)
    const [saveDisabled, setSaveDisabled] = useState(true);
    const CarouselRef = useRef(null);
    const {
        showNoteStar, setShowNoteStar, showNoteDate, setShowNoteDate,
        showNoteActionBtns, setShowNoteActionBtns, noteHeight, setNoteHeight,
        noteTemplate, setNoteTemplate } = useContext(AppContext);
    const [maxHeight, setMaxHeight] = useState(noteHeight);
    const enteringAnim = () => {
        'worklet';
        const animations = {
            transform: [
                { scale: withTiming(1, { duration: 600, easing: Easing.bezier(0.05, 0.7, 0.1, 1) }) },
                { translateY: withTiming(0, { duration: 250, easing: Easing.bezier(0.05, 0.7, 0.1, 1) }) }
            ],
        }
        const initialValues = {
            transform: [{ scale: 0.7 },
            { translateY: 400 }],
        }
        return {
            initialValues,
            animations
        }
    }

    const exitingAnim = () => {
        'worklet';
        const animations = {
            transform: [
                { scale: withTiming(0.8, { duration: 250, easing: Easing.bezier(0.3, 0, 0.8, 0.15) }) },
                { translateY: withTiming(300, { duration: 250, easing: Easing.bezier(0.3, 0, 0.8, 0.15) }) }
            ],
            opacity: withDelay(100, withTiming(0, { duration: 100 }))
        }
        const initialValues = {
            transform: [{ scale: 1 },
            { translateY: 0 }],
            opacity: 1
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
    const PAGE_WIDTH = Dimensions.get('window').width;
    const baseOptions = {
        vertical: false,
        width: PAGE_WIDTH,
        height: PAGE_WIDTH / 1.7,
    };
    const cardStyle: ViewStyle = {
        flex: 1,
        marginHorizontal: 10,
        borderRadius: 20,
        paddingVertical: 20,
        paddingHorizontal: 40
    }
    const RenderContent = ({ index }: { index: number }) => {
        let value = index == 0 ? 'Filled' : index == 1 ? 'Colored' : index == 2 ? 'Bordered' : index == 3 ? 'Filled Bordered' : 'Colored Bordered';
        return (
            <Animated.View
                entering={loaded ? null : FadeInDown.duration(400)
                    .delay(40)
                    .withCallback(() => {
                        'worklet';
                        runOnJS(callbackF2)();
                    })}
                style={{
                    ...cardStyle,
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    gap: 21,
                    backgroundColor:
                        index == 0 || index == 3 ? theme.colors.surfaceContainerHigh
                            : index == 1 || index == 4 ?
                                theme.colors.secondaryContainer :
                                'transparent',
                    borderWidth: 3,
                    borderColor:
                        index == 2 || index == 3 || index == 4 ?
                            theme.colors.outlineVariant : 'transparent',
                    height: 200,
                }}>
                <Text variant='headlineMedium'
                    numberOfLines={2}
                    style={{
                        fontFamily: 'Manrope',
                        fontSize: 27,
                        color: theme.colors.onSecondaryContainer
                    }}>{value}</Text>
                <Text style={{ fontSize: 21 }}>{"This is a " + value + " note."}</Text>

                {/* {item.starred ? <Icon source={'star'} size={24} color={theme.colors.primary} /> : null} */}
            </Animated.View>
        )
    }
    const ScrollY = useSharedValue(0);
    const scrollHandler = useAnimatedScrollHandler((event) => {
        ScrollY.value = event.contentOffset.y;
    });
    const AppBarStyle = useAnimatedStyle(() => ({
        backgroundColor: interpolateColor(
            ScrollY.value,
            [30, 60],
            [theme.colors.surface, theme.colors.elevation.level3],
        ),
    }));
    return (
        visible ?
            <Animated.View
                entering={enteringAnim}
                exiting={exitingAnim}
                style={[{ backgroundColor: theme.colors.surface }, styles.container]}>

                <Animated.View style={AppBarStyle}>
                    <Appbar.Header style={{ backgroundColor: 'transparent' }}>
                        <Appbar.BackAction onPress={() => { setVisible(false) }} />
                        <Appbar.Content title={<Animated.Text sharedTransitionTag="title" style={{ fontFamily: 'Manrope', fontSize: 21 }}>Note Settings</Animated.Text>} />
                    </Appbar.Header>
                </Animated.View>

                <Animated.ScrollView onScroll={scrollHandler}
                    contentContainerStyle={{ paddingBottom: 40, gap: 16 }}>
                    <View>
                        <Text style={{ marginHorizontal: 18, fontSize: 18, marginBottom: 16 }}>Note Template</Text>
                        <Animated.View entering={FadeInUp.delay(250).delay(300)}
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between', marginHorizontal: 20
                            }}>
                            <Button mode='outlined' style={{ width: '45%' }}
                                disabled={saveDisabled} onPress={() => {
                                    let i = noteTemplate - CarouselRef.current.getCurrentIndex();
                                    CarouselRef.current.scrollTo({ count: i, animated: true });
                                    setSaveDisabled(true);
                                }}
                                labelStyle={{ fontFamily: 'Manrope-Bold' }}>View Current</Button>
                            <Button mode='contained-tonal' disabled={saveDisabled}
                                onPress={async () => {
                                    let i = CarouselRef.current.getCurrentIndex();
                                    await AsyncStorage.setItem('@noteTemplate', i.toString());
                                    setNoteTemplate(i);
                                    setSaveDisabled(true);
                                }} style={{ width: '45%' }}
                                labelStyle={{ fontFamily: 'Manrope-Bold' }}>Select</Button>
                        </Animated.View>
                        <Carousel
                            defaultIndex={route.params.noteTemplate}
                            enabled={loaded}
                            loop
                            ref={CarouselRef}
                            {...baseOptions}
                            style={{
                                marginHorizontal: 0,
                                backgroundColor: theme.colors.surface,
                                overflow: 'visible'
                            }}
                            autoPlay={false}
                            data={[0, 1, 2, 3, 4]}
                            mode="parallax"
                            modeConfig={{
                                parallaxScrollingScale: 0.8,
                                parallaxScrollingOffset: 110,
                                parallaxAdjacentItemScale: 0.6,
                            }}
                            onProgressChange={(offsetProgress, absoluteProgress) => {
                                dotProg.value = absoluteProgress * 15;
                            }}
                            onScrollEnd={(index) => {
                                saveDisabled && index != noteTemplate ?
                                    setSaveDisabled(false) :
                                    index == noteTemplate ? setSaveDisabled(true) : null
                            }}
                            scrollAnimationDuration={500}
                            panGestureHandlerProps={{
                                activeOffsetX: [-10, 10],
                            }}
                            renderItem={({ index }) => (<RenderContent index={index} />)}
                        />
                        <View style={{
                            alignItems: 'center', justifyContent: 'center',
                            flexDirection: 'row', gap: 10,
                            alignSelf: 'center',
                            overflow: 'hidden',
                            height: 8
                        }}>
                            {loaded ?
                                <Animated.View id={noteTemplate == 0 ? '1' : '0'}
                                    entering={FadeInDown.duration(300).delay(600)}
                                    style={dotstyle} layout={CurvedTransition} />
                                : null}
                            <>
                                <Animated.View entering={FadeInDown.duration(350).delay(100)} style={{ height: 5, width: 5, borderRadius: 5, backgroundColor: theme.colors.outlineVariant }} />
                                <Animated.View entering={FadeInDown.duration(350).delay(200)} style={{ height: 5, width: 5, borderRadius: 5, backgroundColor: theme.colors.outlineVariant }} />
                                <Animated.View entering={FadeInDown.duration(350).delay(300)} style={{ height: 5, width: 5, borderRadius: 5, backgroundColor: theme.colors.outlineVariant }} />
                                <Animated.View entering={FadeInDown.duration(350).delay(400)} style={{ height: 5, width: 5, borderRadius: 5, backgroundColor: theme.colors.outlineVariant }} />
                                <Animated.View entering={FadeInDown.duration(350).delay(500)} style={{ height: 5, width: 5, borderRadius: 5, backgroundColor: theme.colors.outlineVariant }} />
                            </>
                        </View>
                    </View>
                    {/* <RadioButton.Group onValueChange={async (value) => {
                        await AsyncStorage.setItem('@noteTemplate', value.toString());
                        let i = parseInt(value) - CarouselRef.current.getCurrentIndex();
                        // CarouselRef.current.next(1)
                        setSaveDisabled(true);
                        setNoteTemplate(parseInt(value));
                        CarouselRef.current.scrollTo({ count: i, animated: true })
                    }} value={noteTemplate.toString()}>
                        <RadioButton.Item mode='android' position='leading' labelStyle={{ textAlign: 'left' }} label="Filled" value="0" />
                        <RadioButton.Item mode='android' position='leading' labelStyle={{ textAlign: 'left' }} label="Colored" value="1" />
                        <RadioButton.Item mode='android' position='leading' labelStyle={{ textAlign: 'left' }} label="Bordered" value="2" />
                        <RadioButton.Item mode='android' position='leading' labelStyle={{ textAlign: 'left' }} label="Filled and Bordered" value="3" />
                        <RadioButton.Item mode='android' position='leading' labelStyle={{ textAlign: 'left' }} label="Colored and Bordered" value="4" />
                    </RadioButton.Group> */}
                    <Divider />

                    <MaterialSwitchListItem selected={showNoteStar}
                        title="Show Star"
                        fluid
                        titleStyle={{ fontSize: 18 }}
                        listStyle={{ paddingHorizontal: 8, paddingVertical: 0 }}
                        description="Show star on starred note"
                        onPress={async () => {
                            await AsyncStorage.setItem('@showNoteStar', (!showNoteStar).toString())
                            setShowNoteStar(!showNoteStar)
                        }} />
                    <MaterialSwitchListItem selected={showNoteDate}
                        title="Show Date"
                        fluid
                        titleStyle={{ fontSize: 18 }}
                        listStyle={{ paddingHorizontal: 8, paddingVertical: 0 }}
                        description="Show date created under note"
                        onPress={async () => {
                            await AsyncStorage.setItem('@showNoteDate', (!showNoteDate).toString())
                            setShowNoteDate(!showNoteDate)
                        }} />
                    <MaterialSwitchListItem selected={showNoteActionBtns}
                        title="Action Buttons"
                        fluid
                        titleStyle={{ fontSize: 18 }}
                        listStyle={{ paddingHorizontal: 8, paddingVertical: 0 }}
                        description="Show Share and Delete buttons"
                        onPress={async () => {
                            await AsyncStorage.setItem('@showNoteActionBtns', (!showNoteActionBtns).toString())
                            setShowNoteActionBtns(!showNoteActionBtns)
                        }} />
                    <Divider />

                    <Text style={{
                        paddingHorizontal: 24,
                        paddingVertical: 0,
                        fontSize: 18
                    }}>Max Height</Text>
                    <RadioButtonItem item={'Large'} checked={maxHeight} setChecked={setMaxHeight} setNoteHeight={setNoteHeight} />
                    <RadioButtonItem item={'Medium'} checked={maxHeight} setChecked={setMaxHeight} setNoteHeight={setNoteHeight} />
                    <RadioButtonItem item={'Small'} checked={maxHeight} setChecked={setMaxHeight} setNoteHeight={setNoteHeight} />
                    <Text>Decides maximum height a note can have, if content overflows</Text>
                </Animated.ScrollView>

            </Animated.View > : null
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column'
    }
})
const RadioButtonItem = ({ item, checked, setChecked, setNoteHeight }) => (
    <RadioButton.Item label={item}
        labelStyle={{ fontFamily: 'Manrope', textAlign: 'left', marginLeft: 8 }}
        value={item}
        status={item == checked ? 'checked' : 'unchecked'}
        style={{ paddingHorizontal: 16, paddingVertical: 0 }}
        position='leading'
        onPress={() => {
            setChecked(item)
            setTimeout(async () => {
                await AsyncStorage.setItem('@noteHeight', item);
                setNoteHeight(item);
            }, 600);
        }} />
)