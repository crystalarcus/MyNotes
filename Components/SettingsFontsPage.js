import { useContext, useEffect, useState } from "react";
import {
    Appbar, List, Portal,
    Surface, Text, TouchableRipple, useTheme, Divider
} from "react-native-paper"
import Animated, { Easing, FadeInLeft, FadeInRight, FadeOutLeft, FadeOutRight, interpolateColor, runOnJS, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withDelay, withTiming } from "react-native-reanimated";

import { AppContext } from "../AppContext";
import { View, StyleSheet, BackHandler } from "react-native";
// import { Slider } from "@react-native-assets/slider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Slider } from "@miblanchard/react-native-slider";
import { throttle } from "lodash";
import { FontFamilyDialog } from "./SubComponents/SettingsFontDialogs";
import { MaterialSwitchListItem } from "./SubComponents/MaterialSwitchListItem";


export const SettingsFonts = ({ navigation }) => {

    // Variables
    const { titleFontFamily, setTitleFontFamily, showNoteBorder,
        noteTemplate, noteHeight,
        titleFontSize, contentFontSize, setTitleFontSize,
        setContentFontSize, titleBold, setTitleBold,
        contentBold, setContentBold,
        contentFontFamily, setContentFontFamily, } = useContext(AppContext);
    const [titleDialogvisible, setTitleDialogvisible] = useState(false); // FontFamily Dialog
    const [contentDialogvisible, setContentDialogvisible] = useState(false); // FontFamily Dialog
    const thisTheme = useTheme();
    const [visible, setVisible] = useState(true)
    const [touchable, setTouchable] = useState(false)
    const [titleSliderValue, setTitleSliderValue] = useState(titleFontSize);
    const [contentSliderValue, setContentSliderValue] = useState(contentFontSize);
    async function saveTitleFontSize(fontval) {
        await AsyncStorage.setItem('@titleFontSize', JSON.stringify(fontval));
    }
    async function saveContentFontSize(fontval) {
        await AsyncStorage.setItem('@contentFontSize', JSON.stringify(fontval));
    }
    const [isTitleSliding, setIsTitleSliding] = useState(false)
    const [isContentSliding, setIsContentSliding] = useState(false)
    const onSafeReadPress = async () => {
        setTitleFontSize(130)
        setContentFontSize(90)
        setContentBold(false)
        setTitleBold(true)
        setTitleFontFamily("Lexend")
        setContentFontFamily("Lexend")
        setTitleSliderValue(130)
        setContentSliderValue(90)
        await (AsyncStorage.setItem('@titleFontFamily', 'Lexend'));
        await (AsyncStorage.setItem('@contentFontFamily', 'Lexend'));
        await (AsyncStorage.setItem('@titleFontSize', '130'));
        await (AsyncStorage.setItem('@contentFontSize', '90'));
        await (AsyncStorage.setItem('@titleBold', 'true'));
        await (AsyncStorage.setItem('@contentBold', 'false'));
    }
    const ScrollY = useSharedValue(0);

    const AnimatedHeaderStyle = useAnimatedStyle(() => ({
        backgroundColor: interpolateColor(
            ScrollY.value,
            [50, 80],
            [thisTheme.colors.surface, thisTheme.colors.elevation.level2],
        ),
    }))

    const scrollHandler = useAnimatedScrollHandler((event) => {
        ScrollY.value = event.contentOffset.y;
    });
    const SurfaceStyle = useAnimatedStyle(() => ({
        flex: 1,
        backgroundColor: thisTheme.colors.surface
    }))
    function handleGoBack() {
        setVisible(false)
        return true;
    }
    const callbackF = () => {
        navigation.goBack();
    }
    const enteringAnim = () => {
        'worklet';
        const animations = {
            transform: [
                { translateY: withTiming(0, { duration: 400, easing: Easing.bezier(0.05, 0.7, 0.1, 1) }) }
            ],
        }
        const initialValues = {
            transform: [{ translateY: 200 }],
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
                { translateY: withTiming(200, { duration: 300, easing: Easing.bezier(0.3, 0, 0.8, 0.15) }) }
            ],
            opacity: withDelay(100, withTiming(0, { duration: 200 }))
        }
        const initialValues = {
            transform: [{ translateY: 0 }],
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
    useEffect(() => {
        !visible ? callbackF() : null;
        BackHandler.addEventListener('hardwareBackPress', handleGoBack);
        return () => BackHandler.removeEventListener('hardwareBackPress', handleGoBack);
    }, []);
    if (visible) {
        return (
            <Animated.View entering={enteringAnim} exiting={exitingAnim}
                style={SurfaceStyle}>
                <Animated.View style={AnimatedHeaderStyle}>
                    <Appbar.Header style={{ backgroundColor: "transparent" }}>
                        <Appbar.BackAction onPress={throttle(() => {
                            setVisible(false)
                        }, 200, { trailing: false })} />
                        <Appbar.Content title={
                            <Text variant="titleLarge"
                                style={{ fontFamily: 'Manrope' }}
                                numberOfLines={1}
                                accessible
                                accessibilityRole="header">Font Styling</Text>
                        } style={{ paddingLeft: 10 }} />
                    </Appbar.Header>
                </Animated.View>

                <Animated.ScrollView scrollEventThrottle={16}
                    onScroll={scrollHandler}>
                    <List.Section title="Preview">
                        <Surface elevation={2}
                            style={{
                                backgroundColor: noteTemplate == 0 ? thisTheme.colors.surfaceContainerHigh
                                    : noteTemplate == 1 || noteTemplate == 4 ?
                                        thisTheme.colors.secondaryContainer :
                                        'transparent',
                                borderWidth: 3,
                                borderColor: noteTemplate == 2 || noteTemplate == 3 || noteTemplate == 4 ?
                                    thisTheme.colors.outlineVariant : 'transparent',
                                flexDirection: 'column', gap: 15,
                                marginHorizontal: 19,
                                paddingHorizontal: 15,
                                paddingBottom: 30,
                                paddingTop: 20,
                                marginVertical: 20,
                                borderRadius: 20,
                                shadowColor: 'transparent',
                                overflow: 'hidden',
                            }}>
                            <Text style={{ fontSize: titleSliderValue / 5, fontFamily: titleBold ? titleFontFamily + "-Bold" : titleFontFamily, color: thisTheme.colors.onPrimaryContainer }}>This is Title</Text>
                            <Text style={{ fontSize: contentSliderValue / 5, fontFamily: contentBold ? contentFontFamily + "-Bold" : contentFontFamily, color: thisTheme.colors.onSurfaceVariant }}>This is note content.</Text>
                        </Surface>
                    </List.Section>

                    <List.Section title="Font Family">
                        <List.Item title="Title"
                            style={styles.ListItemStyle}
                            unstable_pressDelay={20}
                            titleStyle={{ fontSize: 17 }}
                            onPress={() => {
                                setTouchable(true)
                                setTitleDialogvisible(true)
                            }}
                            right={() =>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text variant="bodyLarge">{titleFontFamily}</Text>
                                </View>
                            } />
                        <List.Item title="Content"
                            style={styles.ListItemStyle}
                            unstable_pressDelay={20}
                            titleStyle={{ fontSize: 17 }}
                            onPress={() => {
                                setTouchable(true)
                                setContentDialogvisible(true)
                            }}
                            // description={"Font family for content of note"}
                            right={() =>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text variant="bodyLarge">{contentFontFamily}</Text>
                                </View>
                            } />
                    </List.Section>

                    <Divider />
                    <List.Section title="Font Size">
                        <View style={{ flexDirection: 'column', paddingVertical: 20, paddingHorizontal: 32 }}>
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ width: '50%' }}>
                                    <Text style={{ fontSize: 17 }}>Title</Text>
                                </View>
                                {
                                    isTitleSliding ?
                                        null :
                                        <Animated.View style={{ width: '50%', alignItems: 'flex-end' }}
                                            entering={FadeInLeft.duration(180)} exiting={FadeOutLeft.duration(180)}>
                                            <Text variant='bodyLarge'>{titleSliderValue + "%"}</Text>
                                        </Animated.View>
                                }

                            </View>
                            <Slider value={titleSliderValue}
                                startFromZero
                                minimumValue={50}
                                maximumValue={150}
                                step={1}
                                renderThumbComponent={() =>
                                    <TouchableRipple style={{ ...styles.handleStateStyle, backgroundColor: isTitleSliding ? thisTheme.colors.onPrimaryContainer + "10" : "transparent" }}>
                                        <View style={{ ...styles.handleStyle, backgroundColor: thisTheme.colors.primary }} />
                                    </TouchableRipple>

                                }
                                // renderTrackMarkComponent={(index) => <View
                                //     style={{ backgroundColor: (titleSliderValue / 10) - 4 > index ? thisTheme.colors.onPrimary + "38" : thisTheme.colors.onSurfaceVariant + "38", ...styles.TrackMarkStyle }} />}
                                // trackMarks={[50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150]}
                                trackClickable={false}
                                minimumTrackTintColor={thisTheme.colors.primary}
                                maximumTrackTintColor={thisTheme.colors.surfaceVariant}
                                thumbTintColor={thisTheme.colors.primary}
                                onSlidingStart={() => setIsTitleSliding(true)}
                                onValueChange={(value) => {
                                    setTitleSliderValue(value)
                                }}
                                renderAboveThumbComponent={isTitleSliding ? () =>
                                    <Animated.View style={{ ...styles.SliderAboveThumb, backgroundColor: thisTheme.colors.primary }}
                                        entering={FadeInRight.duration(150)} exiting={FadeOutRight.duration(150)}>
                                        <Text style={{ ...styles.SliderAboveThumbText, color: thisTheme.colors.onPrimary }}>{titleSliderValue + "%"}</Text>
                                    </Animated.View> : null}
                                onSlidingComplete={() => {
                                    setTitleFontSize(titleSliderValue)
                                    saveTitleFontSize(titleSliderValue)
                                    setIsTitleSliding(false)
                                }}>
                            </Slider>
                        </View>
                        <View style={{ flexDirection: 'column', paddingVertical: 20, paddingHorizontal: 32 }}>
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ width: '50%' }}>
                                    <Text style={{ fontSize: 17 }}>Content</Text>
                                </View>
                                <View style={{ width: '50%', alignItems: 'flex-end' }}>
                                    <Text variant='bodyLarge'>{
                                        isContentSliding ?
                                            null :
                                            <Animated.View style={{ width: '50%', alignItems: 'flex-end' }}
                                                entering={FadeInLeft.duration(180)} exiting={FadeOutLeft.duration(180)}>
                                                <Text variant='bodyLarge'>{contentSliderValue + "%"}</Text>
                                            </Animated.View>
                                    }</Text>
                                </View>
                            </View>
                            <Slider value={contentSliderValue}
                                minimumValue={50}
                                maximumValue={150}
                                animateTransitions={true}
                                step={1}
                                renderThumbComponent={() =>
                                    <TouchableRipple style={{ ...styles.handleStateStyle, backgroundColor: isContentSliding ? thisTheme.colors.onPrimaryContainer + "28" : "transparent" }}>
                                        <View style={{ ...styles.handleStyle, backgroundColor: thisTheme.colors.primary }} />
                                    </TouchableRipple>
                                }
                                renderTrackMarkComponent={(index) =>
                                    <View
                                        style={{
                                            backgroundColor: (contentFontSize / 10) - 4 > index ? thisTheme.colors.onPrimary + "38" : thisTheme.colors.onSurfaceVariant + "38",
                                            ...styles.TrackMarkStyle
                                        }} />}
                                // trackMarks={[50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150]}
                                trackClickable={false}
                                minimumTrackTintColor={thisTheme.colors.primary}
                                maximumTrackTintColor={thisTheme.colors.surfaceVariant}
                                thumbTintColor={thisTheme.colors.primary}
                                onSlidingStart={() => setIsContentSliding(true)}
                                onValueChange={(value) => {
                                    setContentSliderValue(value)
                                }}
                                renderAboveThumbComponent={isContentSliding ? () =>
                                    <Animated.View style={{ ...styles.SliderAboveThumb, backgroundColor: thisTheme.colors.primary }}
                                        entering={FadeInRight.duration(150)} exiting={FadeOutRight.duration(150)}>
                                        <Text style={{ ...styles.SliderAboveThumbText, color: thisTheme.colors.onPrimary }}>{contentSliderValue + "%"}</Text>
                                    </Animated.View> : null}
                                onSlidingComplete={() => {
                                    setIsContentSliding(false)
                                    setContentFontSize(contentSliderValue)
                                    saveContentFontSize(contentSliderValue)
                                }}>
                            </Slider>
                        </View>
                    </List.Section>

                    <Divider />
                    <List.Section title="Font Weight">
                        <MaterialSwitchListItem title="Use bold font on title"
                            unstable_pressDelay={20}
                            selected={titleBold}
                            onPress={async () => {
                                await AsyncStorage.setItem('@titleBold', JSON.stringify(!titleBold));
                                setTitleBold(!titleBold)
                            }} listStyle={styles.ListItemStyle} />
                        {/* <List.Item

                        right={() =>
                            <MaterialSwitch
                            />}
                    /> */}
                        <MaterialSwitchListItem
                            title="Use bold font on content"
                            selected={contentBold}
                            onPress={async () => {
                                await AsyncStorage.setItem('@contentBold', JSON.stringify(!contentBold));
                                setContentBold(!contentBold);
                            }}
                            listStyle={styles.ListItemStyle} />
                        <Divider />
                        <List.Item left={() => <List.Icon icon={"eye-plus"} />}
                            title="Use safe to read"
                            description="Set settings to readable font family, size and weight to prevent eye strain"
                            style={styles.ListItemStyle}
                            onPress={() => onSafeReadPress()} />
                    </List.Section>
                    <View style={{ height: 40 }} />
                </Animated.ScrollView>
                <Portal>
                    <FontFamilyDialog visible={titleDialogvisible}
                        setVisible={setTitleDialogvisible}
                        value={titleFontFamily}
                        setValue={setTitleFontFamily}
                        id={"@titleFontFamily"}
                        thisTheme={thisTheme}
                        touchable={touchable}
                        setTouchable={setTouchable}
                    />
                    <FontFamilyDialog visible={contentDialogvisible}
                        setVisible={setContentDialogvisible}
                        value={contentFontFamily}
                        setValue={setContentFontFamily}
                        id={"@contentFontFamily"}
                        thisTheme={thisTheme}
                        touchable={touchable}
                        setTouchable={setTouchable}
                    />
                </Portal>
            </Animated.View>
        )
    }
    return null;
}

const styles = StyleSheet.create({

    SliderAboveThumb: {
        height: 40,
        width: 60,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 30
    },
    TrackMarkStyle: {
        height: 5,
        width: 5,
        borderRadius: 5,
    },
    SliderAboveThumbText: {

    },
    ListItemStyle: {
        paddingVertical: 10, paddingHorizontal: 15
    },
    handleStateStyle: {
        height: 40,
        width: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    handleStyle: {
        height: 20,
        width: 20,
        borderRadius: 10,

    }

});