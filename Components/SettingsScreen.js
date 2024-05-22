import { IconButton, Text, Portal, Dialog, RadioButton, Button, useTheme, List, Appbar, Divider, Snackbar, SegmentedButtons } from "react-native-paper";
import { BackHandler, Platform, ScrollView, StyleSheet, View } from "react-native";
import { useState, useContext, useEffect, useRef } from "react";
import { AppContext } from "../AppContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { isDynamicThemeSupported, useMaterial3Theme } from "@pchmn/expo-material3-theme";
import Animated, { Easing, Extrapolation, SharedTransition, interpolate, interpolateColor, runOnJS, scrollTo, useAnimatedRef, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withDelay, withTiming } from "react-native-reanimated";
import { throttle } from "lodash";
import { AnimatedDialog } from "./SubComponents/AnimatedDialog";
import { MaterialSwitchListItem } from "./SubComponents/MaterialSwitchListItem";
import { BinDeletionTimeDialog, ColorDialog, SortDialog, ThemeDialog } from "./SubComponents/SettingsDialog";

// import { setAppIcon } from "expo-dynamic-app-icon";


export function Setting({ navigation, route }) {

    //#region 
    // Variables-------------
    const theme = useTheme(); // import Material Theme from parent
    const previous_screen = route.params.previous_screen;
    const [touchable, setTouchable] = useState(false);

    const ScrollY = useSharedValue(0);
    const AnimatedHeaderTitleStyle = useAnimatedStyle(() => ({
        opacity: interpolate(
            ScrollY.value,
            [45, 60],
            [0, 1],
            Extrapolation.CLAMP
        )
    }))
    const AnimatedHeaderStyle = useAnimatedStyle(() => ({
        backgroundColor: interpolateColor(
            ScrollY.value,
            [45, 50],
            [theme.dark ? theme.colors.surfaceContainerLowest :
                theme.colors.elevation.level1, theme.dark ?
                theme.colors.surfaceContainer : theme.colors.elevation.level3],
        ),
        // alignItems:'center',
        justifyContent: 'center'
    }))
    const AnimatedTitleStyle = useAnimatedStyle(() => ({
        opacity: interpolate(
            ScrollY.value,
            [0, 45],
            [1, 0],
            Extrapolation.CLAMP
        ),
        paddingTop: 20,
        paddingBottom: 15,
        paddingHorizontal: 19

    }))
    const scrollViewRef = useAnimatedRef();

    const scrollHandler = useAnimatedScrollHandler(
        {
            onEndDrag: () => {
                if (ScrollY.value < 70 && ScrollY.value > 45) {
                    scrollTo(
                        scrollViewRef,
                        0,
                        70,
                        true
                    );
                }
                else if (ScrollY.value < 45 && ScrollY.value > 0) {
                    scrollTo(
                        scrollViewRef,
                        0,
                        0,
                        true
                    );
                }
            },
            onScroll: (event) => {
                ScrollY.value = event.contentOffset.y;
            }
        }
    );
    // settings:
    const { data,
        appTheme,
        setAppTheme,
        UpdateThemeTo,
        accentColor,
        setAccentColor,
        noteTemplate,
        setTitleFontSize,
        setContentFontSize,
        setTitleFontFamily,
        setContentFontFamily,
        setTitleBold,
        setContentBold,
        setShowNoteBorder,
        setColoredNote,
        sortOrder, setSortOrder,
        shallBinDelete, setShallBinDelete,
        binDeletionTime, setBinDeletionTime,
        binDeletionTimeUnit, setBinDeletionTimeUnit,
        askBeforeDeleting, setAskBeforeDeleting,
        setActiveScreen } = useContext(AppContext);

    const [themeDialogvisible, setThemeDialogvisible] = useState(false); // Theme Dialog
    const [colorDialogvisible, setColorDialogvisible] = useState(false); // Color Dialog
    const [binDeletionDialogVisible, setBinDeletionDialogvisible] = useState(false); // Color Dialog

    const [sortDialogVisible, setSortDialogVisible] = useState(false); // SortNote Menu
    const [colorSnackVisible, setColorSnackVisible] = useState(false); // Accent Color Source Color Not Notif SnackBar
    //#endregion

    // Funtions-------------
    function capitalize(s) {
        return s[0].toUpperCase() + s.slice(1);
    }

    const setSettingsToDefault = async () => {
        setAppTheme('system');
        setAccentColor('#EA9389');
        setTitleFontSize(125);
        setContentFontSize(85);
        setTitleFontFamily('Roboto');
        setContentFontFamily('Roboto')
        setTitleBold(false);
        setContentBold(false);
        setColoredNote(true);
        setShowNoteBorder(false);
        setSortOrder(1);
        UpdateThemeTo('#EA9389');
        await AsyncStorage.setItem('@appTheme', 'system');
        await AsyncStorage.setItem('@titleFontSize', '125');
        await AsyncStorage.setItem('@contentFontSize', '85');
        await AsyncStorage.setItem('@accentColor', '#EA9389');
        await AsyncStorage.setItem('@titleFontFamily', 'Manrope');
        await AsyncStorage.setItem('@contentFontFamily', 'Manrope');
        await AsyncStorage.setItem('@sortOrder', '1');
        await AsyncStorage.setItem('@coloredNote', 'true');
        await AsyncStorage.setItem('@showNoteBorder', 'false');
        await AsyncStorage.setItem('@titleBold', 'false');
        await AsyncStorage.setItem('@contentBold', 'false');
    }
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
            transform: [{ scale: withTiming(1, { duration: 400, easing: Easing.bezier(0.05, 0.7, 0.1, 1) }) }],
            opacity: withTiming(1, { duration: 40 })
        }
        const initialValues = {
            transform: [{ scale: 0.5 }],
            opacity: 0,
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
                { scale: withTiming(0.8, { duration: 300, easing: Easing.bezier(0.3, 0, 0.8, 0.15) }) },
            ],
            opacity: withDelay(100, withTiming(0, { duration: 200 }))
        }
        const initialValues = {
            transform: [{ scale: 1 }],
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
        visible ? < Animated.View style={{ flex: 1, backgroundColor: theme.dark ? theme.colors.surfaceContainerLowest : theme.colors.elevation.level1 }}
            entering={enteringAnim} exiting={exitingAnim} >
            {/* <Surface elevation={1} style={{ flex: 1, backgroundColor: theme.dark ? theme.colors.surfaceContainerLowest : theme.colors.elevation.level1 }}> */}

            < Animated.View style={AnimatedHeaderStyle} >
                <Appbar.Header style={{ backgroundColor: "transparent" }}>
                    <Appbar.BackAction onPress={throttle(() => {
                        Platform.OS == 'web' ? callbackF() :
                            setVisible(false);
                    }, 2000, { trailing: false })} />
                    <Appbar.Content title={
                        <Animated.View style={AnimatedHeaderTitleStyle}>
                            <Text variant="titleLarge"
                                numberOfLines={1}
                                accessible
                                style={{ fontFamily: 'Manrope' }}
                                accessibilityRole="header">Settings</Text>
                        </Animated.View>
                    } style={{ paddingLeft: 10 }} />
                </Appbar.Header>
            </Animated.View >

            <Animated.ScrollView
                ref={scrollViewRef}
                scrollEventThrottle={16}
                onScroll={scrollHandler}>
                {/* Seccond AppBarTitle */}
                <Animated.View style={AnimatedTitleStyle}>
                    <Text variant='headlineMedium' style={{ fontFamily: 'Manrope' }}>Settings</Text>
                </Animated.View>
                <List.Section title="Appearance"
                    titleStyle={styles.sectionHeaderStyle}>
                    <List.Item title='Theme'
                        unstable_pressDelay={30}
                        titleStyle={styles.titleStyle}
                        description={capitalize(appTheme)}
                        style={{ paddingLeft: 25, paddingRight: 12, paddingVertical: 12, justifyContent: 'center' }}
                        left={() => <List.Icon style={{ paddingRight: 8 }} icon={appTheme == "system" ? "brightness-4" :
                            appTheme == "light" ? "white-balance-sunny" : 'brightness-2'} />}
                        onPress={() => {
                            setTouchable(true)
                            setThemeDialogvisible(true)
                        }} />
                    <List.Item title='Accent Color'
                        unstable_pressDelay={55}
                        titleStyle={styles.titleStyle}
                        description={accentColor == 'dynamic' ? 'Using system color' : 'Using custom color'}
                        right={() =>
                            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                <View style={{
                                    height: 33, width: 33,
                                    backgroundColor: theme.colors.primary,
                                    borderRadius: 20
                                }}></View>
                            </View>
                        }
                        style={styles.ListItemStyle}
                        left={() => <List.Icon style={{ paddingRight: 8 }} icon='palette-outline' />}
                        onPress={() => {
                            setTouchable(true)
                            setColorDialogvisible(true)
                        }} />

                    <List.Item title='Note Settings'
                        description="Note Template and Personalization"
                        onPress={() => {
                            navigation.navigate('NoteType', { noteTemplate: noteTemplate })
                        }}
                        left={() => <List.Icon style={{ paddingRight: 8 }} icon={"text-box-outline"} />}
                        style={styles.ListItemStyle} />

                    <List.Item title="Font Styling"
                        titleStyle={styles.titleStyle}
                        description="Font styling for notes"
                        onPress={() => {
                            navigation.navigate('SettingsFonts');

                        }}
                        left={() => <List.Icon style={{ paddingRight: 8 }} icon={"format-text-variant-outline"} />}
                        style={styles.ListItemStyle} />

                </List.Section>
                {/* <Divider></Divider> */}
                <List.Section title="Behaviour"
                    titleStyle={styles.sectionHeaderStyle}>

                    <List.Item title='Sorting Order' titleStyle={styles.titleStyle}
                        unstable_pressDelay={55}
                        description={
                            sortOrder == 1 ? "Time ● Ascending" :
                                sortOrder == 2 ? "Time ● Descending" :
                                    sortOrder == 3 ? "Alphabetical ● Ascending" :
                                        "Alphabetical ● Descending"
                        }
                        onPress={() => {
                            setTouchable(true)
                            setSortDialogVisible(true)
                        }}
                        style={{ paddingHorizontal: 25, height: 80, paddingRight: 10 }}
                        left={() => <List.Icon style={{ paddingRight: 8 }} icon='arrow-up-down' />} />

                    <MaterialSwitchListItem title='Ask before Deleting'
                        description={"Show dialog to confirm before moving note to bin"}
                        leftIcon='alert-circle-check-outline'
                        fluid={true}
                        titleStyle={styles.titleStyle}
                        listStyle={styles.ListItemStyle}
                        selected={askBeforeDeleting}
                        onPress={async () => {
                            await AsyncStorage.setItem('@askBeforeDeleting', JSON.stringify(!askBeforeDeleting));
                            setAskBeforeDeleting(!askBeforeDeleting);
                        }} />
                    <MaterialSwitchListItem title='Auto Delete'
                        description={"Auto delete notes in bin"}
                        leftIcon='delete-clock-outline'
                        fluid={true}
                        titleStyle={styles.titleStyle}
                        listStyle={styles.ListItemStyle}
                        selected={shallBinDelete}
                        onPress={async () => {
                            await AsyncStorage.setItem('@shallBinDelete', JSON.stringify(!shallBinDelete));
                            setShallBinDelete(!shallBinDelete);
                        }} />
                    <List.Item
                        title='Auto Delete Time'
                        description={shallBinDelete ?
                            binDeletionTime.toString() + " " + binDeletionTimeUnit :
                            "*Turn on Auto Delete to enable this"}
                        onPress={() => {
                            setTouchable(true)
                            setBinDeletionDialogvisible(true)
                        }}
                        disabled={!shallBinDelete}
                        unstable_pressDelay={55}
                        titleStyle={[styles.titleStyle, {
                            color: shallBinDelete ?
                                theme.colors.onSurface :
                                theme.colors.onSurfaceDisabled
                        }]}
                        descriptionStyle={{
                            color: shallBinDelete ?
                                theme.colors.onSurface :
                                theme.colors.onSurfaceDisabled
                        }}
                        style={styles.ListItemStyle}
                        left={() =>
                            <List.Icon style={{ paddingRight: 8 }}
                                color={shallBinDelete ?
                                    theme.colors.onSurface :
                                    theme.colors.onSurfaceDisabled}
                                icon='clock-outline' />}
                    />
                    {/* <TimePickerDialog visible={datePickerVisible} setVisible={setDatePickerVisible} /> */}
                </List.Section>
                <Divider></Divider>
                <List.Section>
                    <List.Item title='Reset Settings'
                        unstable_pressDelay={55}
                        titleStyle={styles.titleStyle}
                        description='Set all Settings to default.'
                        style={styles.ListItemStyle}
                        left={() => <List.Icon style={{ paddingRight: 8 }} icon='cog-refresh' />}
                        onPress={() => setSettingsToDefault()}></List.Item>
                </List.Section>
                {/* <Text>Note : this screen is still under development, nothing here works.</Text> */}

                <Portal>
                    <ThemeDialog themeDialogvisible={themeDialogvisible}
                        thisTheme={theme}
                        appTheme={appTheme} setAppTheme={setAppTheme}
                        setThemeDialogvisible={setThemeDialogvisible}
                        touchable={touchable} setTouchable={setTouchable} />
                    <SortDialog visible={sortDialogVisible} data={data}
                        thisTheme={theme}
                        sortOrder={sortOrder} setSortOrder={setSortOrder}
                        setVisible={setSortDialogVisible}
                        touchable={touchable}
                        setTouchable={setTouchable}
                    />

                    <ColorDialog colorDialogvisible={colorDialogvisible}
                        colorSnackVisible={colorSnackVisible}
                        setColorSnackVisible={setColorSnackVisible}
                        setColorDialogvisible={setColorDialogvisible}
                        UpdateThemeTo={UpdateThemeTo}
                        setAccentColor={setAccentColor}
                        touchable={touchable}
                        setTouchable={setTouchable}
                        thisTheme={theme} >
                    </ColorDialog>

                    <BinDeletionTimeDialog dialogvisible={binDeletionDialogVisible}
                        setdialogvisible={setBinDeletionDialogvisible}
                        touchable={touchable}
                        setTouchable={setTouchable}
                        binDeletionTime={binDeletionTime}
                        setBinDeletionTime={setBinDeletionTime}
                        binDeletionTimeUnit={binDeletionTimeUnit}
                        setBinDeletionTimeUnit={setBinDeletionTimeUnit}
                        thisTheme={theme} />
                    {/* <DatePickerDialog datePickerVisible={datePickerVisible} setDatePickerVisible={setDatePickerVisible} /> */}

                    <Snackbar visible={colorSnackVisible}
                        duration={2500}
                        onDismiss={() => setColorSnackVisible(false)}
                        action={{
                            label: 'OK',
                            onPress: () => {
                                setColorSnackVisible(false);
                            }
                        }}>Accent color changed</Snackbar>

                </Portal>
            </Animated.ScrollView>
            {/* </Surface > */}
        </Animated.View > : null
    );
}

const styles = StyleSheet.create({
    sectionHeaderStyle: {
        fontFamily: 'Manrope-SemiBold'
    },
    segBtn: {
        paddingHorizontal: 0,
        borderWidth: 1.3
    },
    titleStyle: {
        fontSize: 17,
        fontFamily: 'Manrope',
    },
    ListItemStyle: {
        paddingHorizontal: 25,
        paddingVertical: 15,
        justifyContent: 'center'
    }

});
//#region 
// Async Storage settings names:
// Theme : @appTheme
// Color : @accentColor
// Font : @titleFontSize
// Font : @ContentFontSize
// Font Family : @fontFam
// Show Border : @showNoteBorder
// Add From Bottom: @addNoteFromBottom
// Delete Note in Bin : @shallBinDelete

{/* <MaterialSwitchListItem title='Compact View'
                        description={"Smaller notes with two\ncolumns"}
                        fluid={true}
                        titleStyle={styles.titleStyle}
                        listStyle={styles.ListItemStyle}
                        leftIcon={"border-outside"}
                        selected={isCompact}
                        onPress={async () => {
                            await AsyncStorage.setItem('@isCompact', JSON.stringify(!isCompact));
                            setIsCompact(!isCompact);
                        }} /> */}
//#endregion