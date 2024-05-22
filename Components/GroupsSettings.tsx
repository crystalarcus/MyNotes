import Animated, { CurvedTransition, Easing, FadeInDown, FadeInUp, interpolateColor, runOnJS, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withDelay, withTiming } from "react-native-reanimated";
import { Text, RadioButton, Button, useTheme, List, Appbar, Divider } from "react-native-paper";
import { Dimensions, StyleSheet, ViewStyle, View } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { useContext, useRef, useState } from "react";
import { AppContext } from "../AppContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialSwitchListItem } from "./SubComponents/MaterialSwitchListItem";

export const GroupSettings = ({ navigation, route }) => {

    const theme = useTheme()
    const {
        showNoteStar, setShowNoteStar, showNoteDate, setShowNoteDate,
        showNoteActionBtns, setShowNoteActionBtns, noteHeight, setNoteHeight,
        noteTemplate, setNoteTemplate } = useContext(AppContext);

    const callbackF = () => {
        navigation.goBack();
    }
    const [visible, setVisible] = useState(true);
    const previous_screen = route.params.previous_screen;
    const [noteDeleted, setNoteDeleted] = useState(0)

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
    return (
        visible ?
            <Animated.View style={{ flex: 1, backgroundColor: theme.colors.surface }}
                entering={enteringAnim} exiting={exitingAnim}>
                <Animated.View style={AppBarStyle}>
                    <Appbar.Header style={{ backgroundColor: 'transparent' }}>
                        <Appbar.BackAction onPress={() => { setVisible(false) }} />
                        <Appbar.Content title="Groups Settings" />
                    </Appbar.Header>
                </Animated.View>
                <>
                    <List.Item title="When note is moved to Bin" />

                    <RadioButtonItem label={'Keep all groups'}
                        item={'noteDeleted'} checked={noteDeleted} setChecked={setNoteDeleted} />
                    <RadioButtonItem label={'Remove all groups from it'}
                        item={'noteDeleted'} checked={noteDeleted} setChecked={setNoteDeleted} />
                </>
                <>
                    <List.Item title="When note is restored from Bin" style={{ marginTop: 16 }} />

                    <RadioButtonItem label={'Create groups which are not present'}
                        item={'noteDeleted'} checked={noteDeleted} setChecked={setNoteDeleted} />
                    <RadioButtonItem label={'Remove groups which are not present from note'}
                        item={'noteDeleted'} checked={noteDeleted} setChecked={setNoteDeleted} />
                    <RadioButtonItem label={'Ask what to do'}
                        item={'noteDeleted'} checked={noteDeleted} setChecked={setNoteDeleted} />
                </>
                <>
                    <List.Item title="When groups has only one note, and note is deleted"
                        titleNumberOfLines={4} style={{ marginTop: 16 }} />
                    <RadioButtonItem label={'Delete group'}
                        item={'noteDeleted'} checked={noteDeleted} setChecked={setNoteDeleted} />
                    <RadioButtonItem label={'Keep the Group'}
                        item={'noteDeleted'} checked={noteDeleted} setChecked={setNoteDeleted} />
                </>


            </Animated.View> : null
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column'
    }
})
const RadioButtonItem = ({ label, item, checked, setChecked, setNoteHeight }:
    { label: string, item: any, checked: any, setChecked: any, setNoteHeight?: any }) => (
    <RadioButton.Item label={label}
        labelStyle={{ fontFamily: 'Manrope', textAlign: 'left', marginLeft: 8 }}
        value={item}
        status={item == checked ? 'checked' : 'unchecked'}
        style={{ paddingHorizontal: 16, paddingVertical: 0 }}
        position='leading'
        onPress={() => {
            // setChecked(item)
            // setTimeout(async () => {
            //     await AsyncStorage.setItem('@noteHeight', item);
            //     setNoteHeight(item);
            // }, 600);
        }} />
)