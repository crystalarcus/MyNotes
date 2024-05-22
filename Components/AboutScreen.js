import { Appbar, Button, List, Text, useTheme } from "react-native-paper";
import { BackHandler, Image, StyleSheet, View } from "react-native";
import * as Clipboard from 'expo-clipboard';
import { AppContext } from "../AppContext";
import { useContext, useEffect, useState } from "react";
import Animated, { Easing, interpolateColor, runOnJS, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withDelay, withTiming } from "react-native-reanimated";

export function About({ navigation, route }) {
    const theme = useTheme();
    const previous_screen = route.params.previous_screen;
    const { setActiveScreen } = useContext(AppContext);

    const ScrollY = useSharedValue(0);

    const AnimatedHeaderStyle = useAnimatedStyle(() => ({
        backgroundColor: interpolateColor(
            ScrollY.value,
            [70, 100],
            [theme.colors.elevation.level1, theme.colors.elevation.level5],
        ),
        height: 90
    }))
    const scrollHandler = useAnimatedScrollHandler((event) => {
        ScrollY.value = event.contentOffset.y;
    });
    const [visible, setVisible] = useState(true)

    function handleGoBack() {
        setVisible(false)
        return true;
    }
    const callbackF = () => {
        navigation.goBack();
        setActiveScreen(previous_screen);
    }
    const enteringAnim = () => {
        'worklet';
        const animations = {
            transform: [
                { scale: withTiming(1, { duration: 300, easing: Easing.bezier(0.05, 0.7, 0.1, 1) }) },
                { translateY: withTiming(0, { duration: 300, easing: Easing.bezier(0.05, 0.7, 0.1, 1) }) }
            ],
            opacity: withTiming(1, { duration: 100 })
        }
        const initialValues = {
            transform: [{ scale: 0.8 },
            { translateY: 400 }],
            opacity: 0
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
    useEffect(() => {
        BackHandler.addEventListener('hardwareBackPress', handleGoBack);
        return () => BackHandler.removeEventListener('hardwareBackPress', handleGoBack);
    }, []);
    return (
        visible ?
            <Animated.View entering={enteringAnim} exiting={exitingAnim}
                style={{
                    height: '100%', backgroundColor: theme.colors.elevation.level1
                }}>
                <Animated.View style={AnimatedHeaderStyle}>
                    <Appbar.Header style={{ backgroundColor: "transparent" }}>
                        <Appbar.BackAction onPress={() => {
                            setVisible(false)
                        }} />
                        <Appbar.Content title={
                            <Animated.View>
                                <Text variant="titleLarge"
                                    numberOfLines={1}
                                    accessible
                                    accessibilityRole="header">About</Text>
                            </Animated.View>
                        } style={{ paddingLeft: 10 }} />
                    </Appbar.Header>
                </Animated.View>

                <Animated.ScrollView scrollEventThrottle={16}
                    onScroll={scrollHandler} contentContainerStyle={{}}>
                    <View style={{}}>
                        <View style={{ flex: 1, alignItems: 'center', marginVertical: 18 }} >
                            <Image source={require("../assets/gicontrans.png")} style={{ height: 80, width: 80 }} />
                            <Text style={{ fontSize: 30, fontFamily: 'Manrope' }} >My Notes</Text>
                            <Text style={{ fontSize: 17, fontFamily: 'Manrope' }} >version 1.4.7</Text>
                        </View>
                        <List.Subheader>Developed By</List.Subheader>
                        <List.Item title="Crystal" description="Developer and Designer" style={{ marginLeft: 20 }}
                        />

                    </View>

                    <View style={{}}>
                        <List.Subheader>Contact</List.Subheader>
                        <List.Section>
                            <List.Item title='crystalarcus@gmail.com'
                                titleStyle={styles.titleStyle}
                                descriptionStyle={styles.titleStyle}
                                description="Email"
                                left={() => <List.Icon icon='email-outline' />}
                                right={() => <Button children="Copy" icon="content-copy" onPress={
                                    () => { Clipboard.setStringAsync("crystalarcus@gmail.com") }
                                } />} style={{ marginLeft: 20 }} />
                            {/* <Divider></Divider> */}
                            <List.Item title='+91 9130082535' description="Phone"
                                titleStyle={styles.titleStyle}
                                descriptionStyle={styles.titleStyle}
                                left={() => <List.Icon icon='phone-outline' />}
                                right={() => <Button children="Copy" icon="content-copy" onPress={
                                    () => { Clipboard.setStringAsync("+91 9130082535") }
                                } />} style={{ marginLeft: 20 }} />
                            {/* <Divider></Divider> */}
                            <List.Item title='+91 9130082535' description="WhatsApp"
                                titleStyle={styles.titleStyle}
                                descriptionStyle={styles.titleStyle}
                                left={() => <List.Icon icon='whatsapp' />}
                                right={() => <Button children="Copy" icon="content-copy" onPress={
                                    () => { Clipboard.setStringAsync("+91 9130082535") }
                                } />} style={{ marginLeft: 20 }} />
                            {/* <Divider></Divider> */}
                            <List.Item title='crystal_arcus' description="Instagram"
                                titleStyle={styles.titleStyle}
                                descriptionStyle={styles.titleStyle}
                                left={() => <List.Icon icon='instagram' />}
                                right={() => <Button children="Copy" icon="content-copy" onPress={
                                    () => { Clipboard.setStringAsync("crystal_arcus") }
                                } />} style={{ marginLeft: 20 }} />
                        </List.Section>
                    </View>
                </Animated.ScrollView>
            </Animated.View> : null

    );
}
const styles = StyleSheet.create({
    view1: {
        flex: 1,
        flexDirection: 'row',
        height: 17,
        alignItems: 'center'
    },
    MainView: {
        flex: 0.3,
        flexDirection: 'column',
        gap: 5,
        height: 200
    },
    icon: {
        fontSize: 21
    },
    secondView: {
        flex: 1,
        gap: 20
    },
    titleStyle: {
        fontFamily: 'Manrope'
    }
});