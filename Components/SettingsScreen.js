import { IconButton, Text, Surface, Portal, Dialog, RadioButton, Button, useTheme, List, Appbar, Divider, Icon, Snackbar, SegmentedButtons } from "react-native-paper";
import { BackHandler, ScrollView, StyleSheet, View } from "react-native";
import { useState, useContext, useEffect } from "react";
import { AppContext } from "../AppContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TimePickerDialog } from "./SubComponents/DatePickerDialog";
import { isDynamicThemeSupported, useMaterial3Theme } from "@pchmn/expo-material3-theme";
import Animated, { Extrapolation, interpolate, interpolateColor, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { MaterialSwitch } from "./SubComponents/MaterialSwitch";
import { throttle } from "lodash";


//#region 
const ThemeDialog = ({ themeDialogvisible, setThemeDialogvisible,
    appTheme, setAppTheme }) => {

    const [checked, setChecked] = useState(appTheme);
    async function saveSettings(themeValue) {
        await AsyncStorage.setItem('@appTheme', themeValue);
    }
    const Comp = ({ title, name }) => {
        return (
            <List.Item title={title}
                titleStyle={{ fontSize: 19 }}
                onPress={() => {
                    setAppTheme(name)
                    saveSettings(name);
                    setChecked(name);
                }}
                style={{ paddingHorizontal: 19, paddingVertical: 0 }}
                left={() =>
                    <RadioButton value={name}
                        status={checked === name ? 'checked' : 'unchecked'}
                        onPress={() => {
                            setAppTheme(name)
                            saveSettings(name);
                            setChecked(name);
                        }}></RadioButton>}>
            </List.Item>
        )
    }
    return (
        <Dialog visible={themeDialogvisible}
            onDismiss={() => { setThemeDialogvisible(false) }}>
            <Dialog.Title>Choose Theme</Dialog.Title>
            <Dialog.Content
                style={{ paddingHorizontal: 0 }}
            >
                <View style={{ display: 'flex', flexDirection: 'column' }}>
                    <Comp name={"system"} title={"System default"} />
                    <Comp name={"light"} title={"Light"} />
                    <Comp name={"dark"} title={"Dark"} />
                </View>
            </Dialog.Content>
            <Dialog.Actions>
                <Button onPress={() => { setThemeDialogvisible(false) }}>Done</Button>
            </Dialog.Actions>
        </Dialog>
    );
}
const SortDialog = ({ visible, setVisible, data,
    sortOrder, setSortOrder }) => {

    const [checked, setChecked] = useState(sortOrder);
    const [value, setValue] = useState(sortOrder < 3 ? "time" : "alphabetical");

    const Comp = ({ title, order, disabled }) => {
        const onItemPress = async () => {
            switch (order) {
                case 1:
                    data.sort((a, b) => { return b.key - a.key });
                    break;
                case 2:
                    data.sort((a, b) => { return a.key - b.key });
                    break;
                case 3:
                    data.sort((a, b) => a.title.localeCompare(b.title));
                    break;
                case 4:
                    data.sort((a, b) => b.title.localeCompare(a.title));
                    break;
                default:
                    break;
            }
            setChecked(order);
            setSortOrder(order);
            await AsyncStorage.setItem("data", JSON.stringify(data));
            await AsyncStorage.setItem("@sortOrder", JSON.stringify(order));
        }
        return (
            <List.Item title={title} disabled={disabled}
                titleStyle={{ fontSize: 19 }}
                onPress={() => onItemPress()}
                style={{ paddingHorizontal: 19, paddingVertical: 0 }}
                left={() =>
                    <RadioButton value={order}
                        status={checked == order ? 'checked' : 'unchecked'}
                        onPress={() => onItemPress()}></RadioButton>}>
            </List.Item>
        )
    }
    return (
        <Dialog visible={visible}
            onDismiss={() => { setVisible(false) }}>
            <Dialog.Title>Choose Sort Order</Dialog.Title>
            <Dialog.Content
                style={{ paddingHorizontal: 0 }}>
                <View style={{ display: 'flex', flexDirection: 'column' }}>
                    <SegmentedButtons value={value} style={{ paddingHorizontal: 19 }}
                        onValueChange={setValue}
                        buttons={[
                            {
                                value: 'time',
                                label: 'Time',
                                onPress: () => setValue('time')
                            },
                            {
                                value: 'alphabetical',
                                label: 'Alphabetical',
                                onPress: () => setValue('alphabetical')
                            }
                        ]} />

                    <List.Section title="Sort by name">
                        <Comp title={"Ascending"} order={value == "time" ? 1 : 3} />
                        <Comp title={"Descending"} order={value == "time" ? 2 : 4} />
                    </List.Section>
                </View>
            </Dialog.Content>
            <Dialog.Actions>
                <Button onPress={() => { setVisible(false) }}>Done</Button>
            </Dialog.Actions>
        </Dialog>
    );
}

const ColorButton = ({ color, setThisColor, setAccentColor, setColorDialogvisible, setColorSnackVisible }) => {
    async function saveColor(colorVal) {
        setAccentColor("dynamic");
        await AsyncStorage.setItem('@accentColor', colorVal);
    }
    return (
        <IconButton onPress={() => {
            setColorDialogvisible(false);
            setThisColor(color);
            saveColor(color);
            setColorSnackVisible(true);
        }}
            style={{
                width: 40,
                height: 40,
                backgroundColor: color,
                borderRadius: 30,
            }}>
        </IconButton>
    );
}

const ColorDialog = ({ colorDialogvisible, setColorDialogvisible, UpdateThemeTo, setAccentColor, setColorSnackVisible }) => {
    const thisTheme = useTheme();
    const { theme } = useMaterial3Theme();
    const onUseSystemButtonPress = async () => {
        UpdateThemeTo(theme.light.primary);
        setAccentColor("dynamic");
        await AsyncStorage.setItem('@accentColor', "dynamic")
    }
    return (
        <Dialog visible={colorDialogvisible}
            onDismiss={() => setColorDialogvisible(false)}>
            <Dialog.Title>Choose Accent Color</Dialog.Title>
            <Dialog.Content style={{ paddingHorizontal: 0 }} >
                <GestureHandlerRootView>
                    <ScrollView>
                        <View style={{ padding: 19, flexDirection: 'column', }}>
                            <Text variant="bodyLarge" style={{ alignSelf: 'baseline', fontSize: 19 }}>System Color</Text>
                            {isDynamicThemeSupported ?
                                <View style={{ paddingVertical: 15, flexDirection: 'column', justifyContent: 'center', gap: 10 }}>
                                    <Text variant="bodyMedium">Use Color Palatte used by your device.</Text>
                                    <Button mode="contained" disabled={!isDynamicThemeSupported}
                                        theme={{ colors: { primary: theme.dark.primary } }}
                                        style={{ paddingVertical: 4, paddingHorizontal: 12 }}
                                        onPress={() => onUseSystemButtonPress()}>Apply</Button>
                                </View> :

                                <List.Item title={"Device not supported"} style={{
                                    paddingLeft: 15,
                                    marginTop: 20,
                                    backgroundColor: thisTheme.colors.outlineVariant,
                                    borderRadius: 15,
                                }}
                                    left={() => <List.Icon icon={"information-outline"} />}
                                    description={"This option is not supported on your Device."} />

                            }
                        </View>
                        <View style={{ padding: 19, paddingBottom: 5, gap: 15 }}>
                            <Text variant="titleLarge" style={{ fontSize: 19 }}>Custom Color</Text>
                            <View style={{
                                flexDirection: 'row', gap: 15, alignItems: 'flex-start',
                                flexWrap: 'wrap',
                            }}>
                                {/* <ColorButton color='#9c4237' setThisColor={UpdateThemeTo} setAccentColor={setAccentColor} /> */}
                                {/* <ColorButton color='#00668B' setThisColor={UpdateThemeTo} setAccentColor={setAccentColor} /> */}
                                <ColorButton color='#EA9389' setThisColor={UpdateThemeTo} setAccentColor={setAccentColor} setColorSnackVisible={setColorSnackVisible} setColorDialogvisible={setColorDialogvisible} />
                                <ColorButton color='#DBA430' setThisColor={UpdateThemeTo} setAccentColor={setAccentColor} setColorSnackVisible={setColorSnackVisible} setColorDialogvisible={setColorDialogvisible} />
                                {/* <ColorButton color='#B9AE21' setThisColor={UpdateThemeTo} setAccentColor={setAccentColor} setColorSnackVisible={setColorSnackVisible} setColorDialogvisible={setColorDialogvisible} /> */}
                                <ColorButton color='#46C51E' setThisColor={UpdateThemeTo} setAccentColor={setAccentColor} setColorSnackVisible={setColorSnackVisible} setColorDialogvisible={setColorDialogvisible} />
                                <ColorButton color='#22BEB3' setThisColor={UpdateThemeTo} setAccentColor={setAccentColor} setColorSnackVisible={setColorSnackVisible} setColorDialogvisible={setColorDialogvisible} />
                                <ColorButton color='#7BAFE8' setThisColor={UpdateThemeTo} setAccentColor={setAccentColor} setColorSnackVisible={setColorSnackVisible} setColorDialogvisible={setColorDialogvisible} />
                                <ColorButton color='#CA96EB' setThisColor={UpdateThemeTo} setAccentColor={setAccentColor} setColorSnackVisible={setColorSnackVisible} setColorDialogvisible={setColorDialogvisible} />
                                <ColorButton color='#EB8BCA' setThisColor={UpdateThemeTo} setAccentColor={setAccentColor} setColorSnackVisible={setColorSnackVisible} setColorDialogvisible={setColorDialogvisible} />
                                {/* <ColorButton color='#6750A4' setThisColor={UpdateThemeTo} setAccentColor={setAccentColor} /> */}
                                {/* <IconButton icon='plus' onPress={() => {
                                }} mode="contained"></IconButton> */}
                            </View>
                        </View>
                    </ScrollView>
                </GestureHandlerRootView>
            </Dialog.Content>
            <Dialog.Actions>
                <Button onPress={() => setColorDialogvisible(false)}>Done</Button>
            </Dialog.Actions>
        </Dialog >
    );
}

//#endregion

export function Setting({ navigation, route }) {

    // Variables-------------
    const theme = useTheme(); // import Material Theme from parent
    const previous_screen = route.params.previous_screen;
    const { setActiveScreen } = useContext(AppContext);
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
            [theme.colors.surfaceContainerLowest, theme.colors.surfaceContainer],
        ),
        height: 90,
    }))
    const AnimatedTitleStyle = useAnimatedStyle(() => ({
        opacity: interpolate(
            ScrollY.value,
            [0, 45],
            [1, 0],
            Extrapolation.CLAMP
        ),
        paddingTop: 30,
        paddingBottom: 15,
        paddingHorizontal: 19

    }))
    const scrollHandler = useAnimatedScrollHandler((event) => {
        ScrollY.value = event.contentOffset.y;
    });
    // settings:
    const { data,
        appTheme, UpdateThemeTo, setAppTheme,
        setAccentColor,
        setTitleFontSize,
        setContentFontSize,
        setTitleFontFamily,
        setContentFontFamily,
        setTitleBold,
        setContentBold,
        showNoteBorder, setShowNoteBorder,
        sortOrder, setSortOrder,
        shallBinDelete, setShallBinDelete } = useContext(AppContext);

    const [themeDialogvisible, setThemeDialogvisible] = useState(false); // Theme Dialog
    const [colorDialogvisible, setColorDialogvisible] = useState(false); // Color Dialog

    const [sortDialogVisible, setSortDialogVisible] = useState(false); // SortNote Menu
    const [timePickerVisible, setTimePickerVisible] = useState(false); // TimePicker Dialog Bin
    const [colorSnackVisible, setColorSnackVisible] = useState(false); // Accent Color Source Color Not Notif SnackBar
    const [snackbarText, setSnackBarText] = useState('');
    // Funtions-------------
    function capitalize(s) {
        return s[0].toUpperCase() + s.slice(1);
    }

    const setSettingsToDefault = async () => {
        setAppTheme('system');
        setAccentColor('#EA9389');
        setTitleFontSize(110);
        setContentFontSize(110);
        setTitleFontFamily('Roboto');
        setContentFontFamily('Roboto')
        setTitleBold(true);
        setContentBold(false);
        setSortOrder(1);
        UpdateThemeTo('#EA9389');
        setShowNoteBorder(true);
        await AsyncStorage.setItem('@appTheme', 'system');
        await AsyncStorage.setItem('@titleFontSize', '100');
        await AsyncStorage.setItem('@contentFontSize', '100');
        await AsyncStorage.setItem('@accentColor', '#EA9389');
        await AsyncStorage.setItem('@titleFontFamily', 'Roboto');
        await AsyncStorage.setItem('@contentFontFamily', 'Roboto');
        await AsyncStorage.setItem('@sortOrder', '1');
        await AsyncStorage.setItem('@showNoteBorder', 'true');
        await AsyncStorage.setItem('@titleBold', 'true');
        await AsyncStorage.setItem('@contentBold', 'false');
    }

    function handleGoBack() {
        navigation.goBack();
        setActiveScreen(previous_screen);
        return true;
    }
    useEffect(() => {
        BackHandler.addEventListener('hardwareBackPress', handleGoBack);
        return () => BackHandler.removeEventListener('hardwareBackPress', handleGoBack);
    }, []);
    return (
        <Surface elevation={1} style={{ flex: 1, backgroundColor: theme.colors.surfaceContainerLowest }}>
            <Animated.View style={AnimatedHeaderStyle}>
                <Appbar.Header style={{ backgroundColor: "transparent" }}>
                    <Appbar.BackAction onPress={throttle(() => {
                        setActiveScreen(previous_screen);
                        navigation.goBack();
                    }, 200, { trailing: false })} />
                    <Appbar.Content title={
                        <Animated.View style={AnimatedHeaderTitleStyle}>
                            <Text variant="titleLarge"
                                numberOfLines={1}
                                accessible
                                accessibilityRole="header">Settings</Text>
                        </Animated.View>
                    } style={{ paddingLeft: 10 }} />
                </Appbar.Header>
            </Animated.View>

            <Animated.ScrollView
                scrollEventThrottle={16}
                onScroll={scrollHandler}>
                {/* Seccond AppBarTitle */}
                <Animated.View style={AnimatedTitleStyle}>
                    <Text variant='headlineMedium'>Settings</Text>
                </Animated.View>
                <List.Section title="Appearance"
                    titleStyle={styles.sectionHeaderStyle}>
                    <List.Item title='Theme'
                        unstable_pressDelay={55}
                        titleStyle={styles.titleStyle}
                        right={() =>
                            <View style={{justifyContent:'center'}}>
                                <Text 
                                    style={{ paddingVertical: 'auto', fontSize:18 }}>
                                    {capitalize(appTheme)}</Text>
                            </View>
                        }
                        description={"Theme mode of app"}
                        style={{ paddingHorizontal: 25, paddingVertical: 12, justifyContent: 'center' }}
                        left={() => <List.Icon icon={appTheme == "system" ? "brightness-4" :
                            appTheme == "light" ? "white-balance-sunny" : 'brightness-2'} />}
                        onPress={() => setThemeDialogvisible(true)} />
                    <List.Item title='Accent Color'
                        unstable_pressDelay={55}
                        titleStyle={styles.titleStyle}
                        description='Source color of your app'
                        right={() =>
                            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                <View style={{
                                    height: 33, width: 33,
                                    backgroundColor: theme.colors.primary,
                                    borderRadius: 20
                                }}></View>
                            </View>
                        }
                        style={{ paddingHorizontal: 25, paddingVertical: 12, justifyContent: 'center' }}
                        left={() => <List.Icon icon='palette-outline' />}
                        onPress={() => setColorDialogvisible(true)} />

                    <List.Item title="Font Styling"
                        titleStyle={styles.titleStyle}
                        description="Font styling for notes"
                        onPress={() => navigation.navigate('SettingsFonts')}
                        left={() => <List.Icon icon={"format-text-variant-outline"} />}
                        style={{ paddingHorizontal: 25, paddingVertical: 12, justifyContent: 'center' }} />

                    <List.Item title='Note Border' unstable_pressDelay={55}
                        description="Border around note"
                        titleStyle={styles.titleStyle}
                        style={{ paddingHorizontal: 25, paddingVertical: 12, justifyContent: 'center' }}
                        left={() =>
                            <List.Icon
                                icon={() => <List.Icon icon={'border-outside'} />}
                            />}
                        onPress={async () => {
                            await AsyncStorage.setItem('@showNoteBorder', JSON.stringify(!showNoteBorder));
                            setShowNoteBorder(!showNoteBorder);
                        }}
                        right={() =>
                            <MaterialSwitch selected={showNoteBorder} icon={"check"}
                                onPress={async () => {
                                    await AsyncStorage.setItem('@showNoteBorder', JSON.stringify(!showNoteBorder));
                                    setShowNoteBorder(!showNoteBorder);
                                }} />
                        } />
                </List.Section>
                <Divider></Divider>
                <List.Section title="Behaviour"
                    titleStyle={styles.sectionHeaderStyle}>

                    <List.Item title='Sorting Order' titleStyle={styles.titleStyle}
                        unstable_pressDelay={55}
                        description={
                            sortOrder == 1 ? "New to old" :
                                sortOrder == 2 ? "Old to new" :
                                    sortOrder == 3 ? "A to Z" :
                                        "Z to A"
                        }
                        onPress={() => {
                            setSortDialogVisible(true)
                        }}
                        style={{ paddingHorizontal: 25, height: 80, paddingRight: 10 }}
                        left={() => <List.Icon icon='arrow-up-down' />} />

                    <List.Item title='Auto Empty Bin'
                        unstable_pressDelay={55}
                        titleStyle={styles.titleStyle}
                        // description="Delete notes in bin after specified time bellow"
                        style={{ paddingHorizontal: 25, paddingVertical: 12, justifyContent: 'center' }}
                        left={() => <List.Icon icon='delete-outline' />}
                        onPress={async () => {
                            await AsyncStorage.setItem('@shallBinDelete', JSON.stringify(!shallBinDelete));
                            setShallBinDelete(!shallBinDelete);
                        }}
                        right={() =>
                            <MaterialSwitch selected={shallBinDelete}
                                onPress={async () => {
                                    setShallBinDelete(!shallBinDelete);
                                    await AsyncStorage.setItem('@shallBinDelete', JSON.stringify(!shallBinDelete));
                                }} />} />
                    <List.Item
                        title='Bin Deletion Time'
                        onPress={() => { setTimePickerVisible(true) }}
                        unstable_pressDelay={55}
                        titleStyle={styles.titleStyle}
                        // description="Delete Note in Bin after this time."
                        style={{ paddingHorizontal: 25, paddingVertical: 12, justifyContent: 'center' }}
                        left={() => <List.Icon icon='clock-outline' />}
                        right={() => <Text>{"134 hours"}</Text>} />
                    <TimePickerDialog visible={timePickerVisible} setVisible={setTimePickerVisible} />

                </List.Section>
                <Divider></Divider>
                <List.Section>
                    <List.Item title='Reset Settings'
                        unstable_pressDelay={55}
                        titleStyle={styles.titleStyle}
                        description='Set all Settings to default.'
                        style={{ paddingHorizontal: 25, paddingVertical: 12, justifyContent: 'center' }}
                        left={() => <List.Icon icon='cog-refresh' />}
                        onPress={() => setSettingsToDefault()}></List.Item>
                </List.Section>
                {/* <Text>Note : this screen is still under development, nothing here works.</Text> */}

                <Portal>
                    <ThemeDialog themeDialogvisible={themeDialogvisible}
                        appTheme={appTheme} setAppTheme={setAppTheme}
                        setThemeDialogvisible={setThemeDialogvisible} />
                    <SortDialog visible={sortDialogVisible} data={data}
                        sortOrder={sortOrder} setSortOrder={setSortOrder}
                        setVisible={setSortDialogVisible} />

                    <ColorDialog colorDialogvisible={colorDialogvisible}
                        colorSnackVisible={colorSnackVisible}
                        setColorSnackVisible={setColorSnackVisible}
                        setColorDialogvisible={setColorDialogvisible}
                        UpdateThemeTo={UpdateThemeTo}
                        setAccentColor={setAccentColor}>
                    </ColorDialog>

                    <Snackbar visible={colorSnackVisible}
                        duration={0.5}
                        onDismiss={() => setColorSnackVisible(false)}
                        action={{
                            label: 'OK',
                            onPress: () => {
                                setColorSnackVisible(false);
                            }
                        }}>Accent color changed</Snackbar>
                </Portal>
            </Animated.ScrollView>
        </Surface >

    );
}

const styles = StyleSheet.create({
    titleStyle: {
        fontSize: 17,
        // fontFamily: 'OpenSans',

    },
    sectionHeaderStyle: {
        // fontSize: 15,
        // fontWeight: '100'
    }

});
// Async Storage settings names:
// Theme : @appTheme
// Color : @accentColor
// Font : @titleFontSize
// Font : @ContentFontSize
// Font Family : @fontFam
// Show Border : @showNoteBorder
// Add From Bottom: @addNoteFromBottom
// Delete Note in Bin : @shallBinDelete