import { Appbar, Button, List, Surface, Text, Title, useTheme } from "react-native-paper";
import { BackHandler, Image, StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import * as Clipboard from 'expo-clipboard';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppContext } from "../AppContext";
import { useContext, useEffect } from "react";
import Animated, { Extrapolation, interpolate, interpolateColor, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from "react-native-reanimated";

export function About({ navigation, route }) {
    const theme = useTheme();
    const previous_screen = route.params.previous_screen;
    const { setActiveScreen } = useContext(AppContext);

    function goBack() {
        navigation.goBack();
        setActiveScreen(previous_screen);
        return true;
    }
    const ScrollY = useSharedValue(0);
    const AnimatedHeaderTitleStyle = useAnimatedStyle(() => ({
        opacity: interpolate(
            ScrollY.value,
            [70, 100],
            [0, 1],
            Extrapolation.CLAMP
        )
    }))
    const AnimatedHeaderStyle = useAnimatedStyle(() => ({
        backgroundColor: interpolateColor(
            ScrollY.value,
            [70, 100],
            [theme.colors.elevation.level1, theme.colors.elevation.level5],
        ),
        height: 90
    }))
    const AnimatedTitleStyle = useAnimatedStyle(() => ({
        opacity: interpolate(
            ScrollY.value,
            [0, 45],
            [1, 0],
            Extrapolation.CLAMP
        ),
        paddingTop: 30
    }))
    const scrollHandler = useAnimatedScrollHandler((event) => {
        ScrollY.value = event.contentOffset.y;
    });
    useEffect(() => {
        BackHandler.addEventListener('hardwareBackPress', goBack);
        return () => BackHandler.removeEventListener('hardwareBackPress', goBack);
    }, []);
    return (
        <Surface style={{ paddingTop: useSafeAreaInsets().top * 1.3, height: '100%' }}>
            <Animated.View style={AnimatedHeaderStyle}>
                <Appbar.Header style={{ backgroundColor: "transparent" }}>
                    <Appbar.BackAction onPress={() => {
                        setActiveScreen(previous_screen);
                        navigation.goBack();
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
                    <View style={{ flex: 1, alignItems: 'center', marginBottom: 30 }} >
                        <Image source={require("../assets/Frame.png")} style={{ height: 200, width: 200 }} />
                        <Text style={{ fontSize: 24, fontFamily: 'Lexend' }} >My Notes</Text>
                        <Text style={{ fontSize: 17, fontFamily: 'Lexend' }} >version 1.3</Text>
                    </View>
                    <List.Subheader>Developed By</List.Subheader>
                    <List.Item title="Crystal" description="Developer and Designer" style={{ marginLeft: 20 }}
                    />

                </View>

                <View style={{}}>
                    <List.Subheader>Contact</List.Subheader>
                    <List.Section>
                        <List.Item title='crystalarcus@gmail.com'
                            description="Email"
                            left={() => <List.Icon icon='email-outline' />}
                            right={() => <Button children="Copy" icon="content-copy" onPress={
                                () => { Clipboard.setStringAsync("crystalarcus@gmail.com") }
                            } />} style={{ marginLeft: 20 }} />
                        {/* <Divider></Divider> */}
                        <List.Item title='+91 9130082535' description="Phone"
                            left={() => <List.Icon icon='phone-outline' />}
                            right={() => <Button children="Copy" icon="content-copy" onPress={
                                () => { Clipboard.setStringAsync("+91 9130082535") }
                            } />} style={{ marginLeft: 20 }} />
                        {/* <Divider></Divider> */}
                        <List.Item title='+91 9130082535' description="WhatsApp"
                            left={() => <List.Icon icon='whatsapp' />}
                            right={() => <Button children="Copy" icon="content-copy" onPress={
                                () => { Clipboard.setStringAsync("+91 9130082535") }
                            } />} style={{ marginLeft: 20 }} />
                        {/* <Divider></Divider> */}
                        <List.Item title='crystal_arcus' description="Instagram"
                            left={() => <List.Icon icon='instagram' />}
                            right={() => <Button children="Copy" icon="content-copy" onPress={
                                () => { Clipboard.setStringAsync("crystal_arcus") }
                            } />} style={{ marginLeft: 20 }} />
                    </List.Section>
                </View>
            </Animated.ScrollView>
        </Surface>

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
    }
});