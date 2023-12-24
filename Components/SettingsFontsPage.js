import { useContext, useState } from "react";
import {
    Appbar, Button, List, Menu, Portal, Icon,
    Subheading, Surface, Text, TouchableRipple, useTheme, Divider, TextInput
} from "react-native-paper"
import Animated, { interpolateColor, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from "react-native-reanimated";

import { AppContext } from "../AppContext";
import { View, ScrollView, StyleSheet } from "react-native";
// import { Slider } from "@react-native-assets/slider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialSwitch } from "./SubComponents/MaterialSwitch";
import { Slider } from "@miblanchard/react-native-slider";
import { throttle } from "lodash";
import { FontFamilyDialog } from "./SubComponents/SettingsFontDialogs";


export const SettingsFonts = ({ navigation }) => {

    // Variables
    const { titleFontFamily, setTitleFontFamily, showNoteBorder,
        titleFontSize, contentFontSize, setTitleFontSize,
        setContentFontSize, titleBold, setTitleBold,
        contentBold, setContentBold,
        contentFontFamily, setContentFontFamily, } = useContext(AppContext);
    const [titleDialogvisible, setTitleDialogvisible] = useState(false); // FontFamily Dialog
    const [contentDialogvisible, setContentDialogvisible] = useState(false); // FontFamily Dialog
    const thisTheme = useTheme();
    const [titleSliderValue, setTitleSliderValue] = useState(titleFontSize);
    const [contentSliderValue, setContentSliderValue] = useState(contentFontSize);
    async function saveTitleFontSize(fontval) {
        await AsyncStorage.setItem('@titleFontSize', JSON.stringify(fontval));
    }
    async function saveContentFontSize(fontval) {
        await AsyncStorage.setItem('@contentFontSize', JSON.stringify(fontval));
    }
    const fontList = ['Roboto', 'OpenSans', 'NotoSans', 'Nunito', 'Comfortaa', 'Lexend', 'Urbanist'];
    const [titleMenuVisible, setTitleMenuVisible] = useState(false)
    const [contentMenuVisible, setContentMenuVisible] = useState(false)
    const saveTitleFontFamily = async (id, fontname) => {
        setTitleFontFamily(fontname);
        await (AsyncStorage.setItem(id, fontname));
    }
    const saveContentFontFamily = async (id, fontname) => {
        setContentFontFamily(fontname);
        await (AsyncStorage.setItem(id, fontname));
    }
    const ScrollY = useSharedValue(0);

    const AnimatedHeaderStyle = useAnimatedStyle(() => ({
        backgroundColor: interpolateColor(
            ScrollY.value,
            [50, 80],
            [thisTheme.colors.surface, thisTheme.colors.elevation.level2],
        ),
        height: 90
    }))

    const scrollHandler = useAnimatedScrollHandler((event) => {
        ScrollY.value = event.contentOffset.y;
    });

    return (
        <Surface style={{ flex: 1, backgroundColor: thisTheme.colors.background }}>
            <Animated.View style={AnimatedHeaderStyle}>
                <Appbar.Header style={{ backgroundColor: "transparent" }}>
                    <Appbar.BackAction onPress={throttle(() => {
                        navigation.goBack();
                    }, 200, { trailing: false })} />
                    <Appbar.Content title={
                        <Text variant="titleLarge"
                            numberOfLines={1}
                            accessible
                            accessibilityRole="header">Font Styling</Text>
                    } style={{ paddingLeft: 10 }} />
                </Appbar.Header>
            </Animated.View>

            <Animated.ScrollView scrollEventThrottle={16}
                onScroll={scrollHandler}>
                <Text style={{ fontSize: 15, marginTop: 20, marginBottom: 10, marginHorizontal: 19, color: thisTheme.colors.onSurfaceVariant }}>Preview:</Text>
                <Surface elevation={2}
                    style={{
                        backgroundColor: showNoteBorder ?
                            thisTheme.colors.surface :
                            thisTheme.colors.surfaceContainerHigh,
                        flexDirection: 'column', gap: 15,
                        marginHorizontal: 19,
                        paddingHorizontal: 15,
                        paddingBottom: 30,
                        paddingTop: 20,
                        marginVertical: 20,
                        borderRadius: 20,
                        shadowColor: 'transparent',
                        overflow: 'hidden',
                        borderWidth: showNoteBorder ?
                            2.3 : 0,
                        borderColor: thisTheme.colors.outlineVariant
                    }}>
                    <Text style={{ fontSize: titleSliderValue / 4.3, fontFamily: titleBold ? titleFontFamily + "-Medium" : titleFontFamily, color: thisTheme.colors.onPrimaryContainer }}>This is Title</Text>
                    <Text style={{ fontSize: contentSliderValue / 6, fontFamily: contentBold ? contentFontFamily + "-Medium" : contentFontFamily, color: thisTheme.colors.onSurfaceVariant }}>This is note content.</Text>
                </Surface>
                <Divider />

                <List.Section title="Font Family">
                    <List.Item title="Title"
                        style={{ paddingVertical: 10, paddingHorizontal: 15 }}
                        unstable_pressDelay={40}
                        titleStyle={{ fontSize: 17 }}
                        onPress={() => setTitleDialogvisible(true)}
                        description={"Font family for title of note"}
                        right={() =>
                            <View style={{width:70, alignItems:'center'}}>
                                <Text variant="bodyLarge">{titleFontFamily}</Text>
                            </View>
                        } />
                    <List.Item title="Content"
                        style={{ paddingVertical: 10, paddingHorizontal: 15 }}
                        unstable_pressDelay={40}
                        titleStyle={{ fontSize: 17 }}
                        onPress={() => setContentDialogvisible(true)}
                        // description={"Font family for content of note"}
                        right={() =>
                            <View style={{width:70, alignItems:'center'}}>
                                <Text variant="bodyLarge">{contentFontFamily}</Text>
                            </View>
                        } />
                </List.Section>

                <Divider />
                <List.Section title="Font Size">
                    <View style={{ flexDirection: 'column', paddingVertical: 20, paddingHorizontal: 32 }}>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ width: '50%' }}>
                                <Text variant="bodyLarge">Title</Text>
                            </View>
                            <View style={{ width: '50%', alignItems: 'flex-end' }}>
                                <Text variant='bodyLarge'>{titleSliderValue}%</Text>
                            </View>
                        </View>
                        <Slider value={titleSliderValue}
                            startFromZero

                            minimumValue={50}
                            maximumValue={150}
                            step={10}
                            renderTrackMarkComponent={(index) => <View
                                style={{
                                    backgroundColor: (titleSliderValue / 10) - 4 > index ? thisTheme.colors.onPrimary : thisTheme.colors.onSurfaceVariant,
                                    height: 2,
                                    width: 2,
                                    borderRadius: 3,
                                    opacity: 0.38
                                }} />}
                            trackMarks={[50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150]}
                            trackClickable={false}
                            minimumTrackTintColor={thisTheme.colors.primary}
                            maximumTrackTintColor={thisTheme.colors.surfaceVariant}
                            thumbTintColor={thisTheme.colors.primary}
                            onValueChange={(value) => {
                                setTitleSliderValue(value)
                            }}
                            renderAboveThumbComponent={() =>
                                <View>
                                    <Text>{titleFontSize}</Text>
                                </View>}
                            onSlidingComplete={() => {
                                setTitleFontSize(titleSliderValue)
                                saveTitleFontSize(titleSliderValue)
                            }}>
                        </Slider>
                    </View>
                    <View style={{ flexDirection: 'column', paddingVertical: 20, paddingHorizontal: 19 }}>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ width: '50%' }}>
                                <Text variant="bodyLarge">Content</Text>
                            </View>
                            <View style={{ width: '50%', alignItems: 'flex-end' }}>
                                <Text variant='bodyLarge'>{contentSliderValue}%</Text>
                            </View>
                        </View>
                        <Slider value={contentSliderValue}
                            minimumValue={50}
                            maximumValue={150}
                            animateTransitions={true}
                            step={10}
                            renderTrackMarkComponent={(index) => <View
                                style={{
                                    backgroundColor: (contentFontSize / 10) - 4 > index ? thisTheme.colors.onPrimary : thisTheme.colors.onSurfaceVariant,
                                    height: 2,
                                    width: 2,
                                    borderRadius: 3,
                                    opacity: 0.38
                                }} />}
                            trackMarks={[50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150]}
                            trackClickable={false}
                            minimumTrackTintColor={thisTheme.colors.primary}
                            maximumTrackTintColor={thisTheme.colors.surfaceVariant}
                            thumbTintColor={thisTheme.colors.primary}
                            onValueChange={(value) => {
                                setContentSliderValue(value)
                            }}
                            renderAboveThumbComponent={() =>
                                <View>
                                    <Text>{contentFontSize}</Text>
                                </View>}
                            onSlidingComplete={() => {
                                setContentFontSize(contentSliderValue)
                                saveContentFontSize(contentSliderValue)
                            }}>
                        </Slider>
                    </View>
                </List.Section>

                <Divider />
                <List.Section title="Font Weight">
                    <List.Item
                        title="Use bold font on title"
                        right={() =>
                            <MaterialSwitch selected={titleBold}
                                onPress={async () => {
                                    await AsyncStorage.setItem('@titleBold', JSON.stringify(!titleBold));
                                    setTitleBold(!titleBold);
                                }} />}
                        style={{ paddingVertical: 10, paddingHorizontal: 15 }} />
                    <List.Item
                        title="Use bold font on content"
                        right={() =>
                            <MaterialSwitch selected={contentBold}
                                onPress={async () => {
                                    await AsyncStorage.setItem('@contentBold', JSON.stringify(!contentBold));
                                    setContentBold(!contentBold);
                                }} />}
                        style={{ paddingVertical: 10, paddingHorizontal: 15 }} />
                </List.Section>
            </Animated.ScrollView>
            <Portal>
                <FontFamilyDialog visible={titleDialogvisible}
                    setVisible={setTitleDialogvisible}
                    value={titleFontFamily}
                    setValue={setTitleFontFamily}
                    id={"@titleFontFamily"}
                />
                <FontFamilyDialog visible={contentDialogvisible}
                    setVisible={setContentDialogvisible}
                    value={contentFontFamily}
                    setValue={setContentFontFamily}
                    id={"@contentFontFamily"}

                />
            </Portal>
        </Surface>
    )
}

const styles = StyleSheet.create({
    titleStyle: {
        fontSize: 18,
        // fontFamily: 'OpenSans',

    },
    sectionHeaderStyle: {
        // fontSize: 15,
        // fontWeight: '100'
    }

});