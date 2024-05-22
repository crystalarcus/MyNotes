import { IconButton, Text, Dialog, RadioButton, Button, useTheme, List, SegmentedButtons, MD3Theme, TouchableRipple } from "react-native-paper";
import { Dimensions, ScrollView, StyleSheet, View, ViewStyle } from "react-native";
import { useState, useContext, useRef } from "react";
import { AppContext } from "../../AppContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { isDynamicThemeSupported, useMaterial3Theme } from "@pchmn/expo-material3-theme";
import { AnimatedDialog } from "../SubComponents/AnimatedDialog";
import { MaterialSwitchListItem } from "../SubComponents/MaterialSwitchListItem";
import Carousel from "react-native-reanimated-carousel";
// import switchTheme from "react-native-theme-switch-animation";

//#region 

export const ThemeDialog = ({ themeDialogvisible, setThemeDialogvisible,
    touchable, setTouchable,
    appTheme, setAppTheme, thisTheme }) => {
    const saveTheme = async (themeValue: string) => {
        await AsyncStorage.setItem('@appTheme', themeValue);
    }
    async function changeTheme(themeValue: string) {
        switchTheme({
            switchThemeFunction: () => {
                setAppTheme(themeValue)
            },
            animationConfig:
                circular ? {
                    type: 'circular',
                    duration: 500,
                    startingPoint: {
                        cxRatio: Math.random(),
                        cyRatio: Math.random(),
                    }
                } :
                    {
                        type: 'fade',
                        duration: 400,
                    },
        })
        saveTheme(themeValue)
    }
    const [circular, setCircular] = useState(true);
    const onItemPress = (value: string) => {
        changeTheme(value)
    }
    return (
        <AnimatedDialog visible={themeDialogvisible}
            setVisible={setThemeDialogvisible}
            touchable={touchable}
            setTouchable={setTouchable}
            thisTheme={thisTheme}>
            <Dialog.Title style={{ fontFamily: 'Manrope' }}>Choose Theme</Dialog.Title>
            <Dialog.Content style={{ paddingHorizontal: 0 }}>
                <View style={{ display: 'flex', flexDirection: 'column' }}>
                    <RadioButton.Item label={"System default"}
                        value={"system"}
                        status={appTheme == 'system' ? 'checked' : 'unchecked'}
                        position='leading'
                        labelStyle={{ textAlign: 'left', fontSize: 19, fontFamily: 'Manrope' }}
                        mode='android'
                        onPress={() => onItemPress('system')}
                        style={{ paddingHorizontal: 19, paddingVertical: 6 }}
                    ></RadioButton.Item>
                    <RadioButton.Item label={"Light"}
                        value={"light"}
                        status={appTheme == 'light' ? 'checked' : 'unchecked'}
                        position='leading'
                        labelStyle={{ textAlign: 'left', fontSize: 19, fontFamily: 'Manrope' }}
                        mode='android'
                        onPress={() => onItemPress('light')}
                        style={{ paddingHorizontal: 19, paddingVertical: 6 }}
                    ></RadioButton.Item>
                    <RadioButton.Item label={"Dark"}
                        value={"dark"}
                        status={appTheme == 'dark' ? 'checked' : 'unchecked'}
                        position='leading'
                        labelStyle={{ textAlign: 'left', fontSize: 19, fontFamily: 'Manrope' }}
                        mode='android'
                        onPress={() => onItemPress('dark')}
                        style={{ paddingHorizontal: 19, paddingVertical: 6 }}
                    >
                    </RadioButton.Item>
                    <MaterialSwitchListItem
                        title="Circular Animation"
                        fluid={true}
                        titleStyle={styles.titleStyle}
                        listStyle={{ paddingHorizontal: 19 }}
                        selected={circular} onPress={() => setCircular(!circular)} />
                </View>
            </Dialog.Content>
            <Dialog.Actions>
                <View style={{ flexDirection: 'row', gap: 4 }}>
                    <Button onPress={() => {
                        setTouchable(false);
                    }}>Done</Button>
                </View>
            </Dialog.Actions>
        </AnimatedDialog>
    );
}
export const SortDialog = ({ visible, setVisible, data,
    touchable, setTouchable,
    sortOrder, setSortOrder, thisTheme }) => {

    const [checked, setChecked] = useState(sortOrder);
    const [value, setValue] = useState(sortOrder < 3 ? "time" : "alphabetical");

    const Comp = ({ title, order }) => {
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
            <List.Item title={title}
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
        <AnimatedDialog visible={visible}
            setVisible={setVisible}
            touchable={touchable}
            setTouchable={setTouchable}
            thisTheme={thisTheme}>
            <Dialog.Title style={{ fontFamily: 'Manrope', }}>Sort Order</Dialog.Title>
            <Dialog.Content
                style={{ paddingHorizontal: 0, paddingTop: 8 }}>
                <View style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                    {/* <Text style={{ paddingLeft: 21, fontSize: 17 }}>Sort by</Text> */}
                    <SegmentedButtons value={value}
                        style={{ marginHorizontal: 21 }}
                        onValueChange={setValue}
                        buttons={[
                            {
                                value: 'time',
                                label: 'Time',
                                labelStyle: { fontFamily: 'Manrope-Bold' },
                                // icon: 'database-clock',
                                onPress: () => setValue('time'),
                                style: styles.segBtn,
                            },

                            {
                                value: 'alphabetical',
                                label: 'Name',
                                labelStyle: { fontFamily: 'Manrope-Bold' },
                                // icon: 'order-alphabetical-ascending',
                                onPress: () => setValue('alphabetical'),
                                style: styles.segBtn,

                            }
                        ]} />
                    <View>
                        {/* <Divider style={{backgroundColor:thisTheme.colors.outlineVariant}} /> */}
                        {/* <Text style={{ paddingLeft: 21, fontSize: 17 }}>Sort in</Text> */}
                        {/* 
                        <Surface elevation={3} style={{
                            shadowColor: 'transparent',marginTop:5,
                            paddingVertical: 10, borderRadius: 20
                        }}> */}
                        <Comp title={"Ascending order"} order={value == "time" ? 1 : 3} />
                        <Comp title={"Descending order"} order={value == "time" ? 2 : 4} />
                        {/* </Surface> */}
                    </View>
                </View>
            </Dialog.Content>
            <Dialog.Actions>
                <Button onPress={() => { setTouchable(false) }}>Done</Button>
            </Dialog.Actions>
        </AnimatedDialog >
    );
}

export const ColorButton = ({ color, setThisColor, setAccentColor,
    thisTheme, setTouchable, setColorSnackVisible, colorName }) => {
    async function saveColor(colorVal) {
        switchTheme({
            switchThemeFunction: () => {
                setAccentColor(colorVal);
            },
            animationConfig: {
                type: 'circular',
                duration: 500,
                startingPoint: {
                    cxRatio: Math.random(),
                    cyRatio: Math.random(),
                }
            }
        })
        await AsyncStorage.setItem('@accentColor', colorVal);
    }
    return (
        <IconButton icon={"blank"} onPress={() => {
            setTouchable(false);
            setThisColor(color);
            saveColor(color);
            setColorSnackVisible(true);
        }}
            style={{
                width: 40,
                height: 40,
                backgroundColor: thisTheme.dark ? useMaterial3Theme({ sourceColor: color }).theme.dark.primaryContainer :
                    useMaterial3Theme({ sourceColor: color }).theme.light.primaryContainer,
                borderRadius: 30,
                borderWidth: 3,
                borderColor: thisTheme.dark ? useMaterial3Theme({ sourceColor: color }).theme.dark.primary :
                    useMaterial3Theme({ sourceColor: color }).theme.light.primary,
            }}>
        </IconButton>
    );
}

export const ColorDialog = ({ colorDialogvisible, setColorDialogvisible, UpdateThemeTo, setAccentColor, setColorSnackVisible, touchable, setTouchable, thisTheme }) => {
    const { theme } = useMaterial3Theme();
    const onUseSystemButtonPress = async () => {
        switchTheme({
            switchThemeFunction: () => {
                setAccentColor("dynamic");
            },
            animationConfig: {
                type: 'circular',
                duration: 500,
                startingPoint: {
                    cxRatio: Math.random(),
                    cyRatio: Math.random(),
                }
            }
        })
        await AsyncStorage.setItem('@accentColor', "dynamic")
    }
    return (
        <AnimatedDialog visible={colorDialogvisible}
            setVisible={setColorDialogvisible}
            touchable={touchable}
            setTouchable={setTouchable}
            thisTheme={thisTheme}
        >
            <Dialog.Title style={{ fontFamily: 'Manrope' }}>Accent Color</Dialog.Title>
            <Dialog.Content style={{ paddingHorizontal: 0 }} >
                <GestureHandlerRootView>
                    <ScrollView>
                        <View style={{ padding: 19, flexDirection: 'column', }}>
                            <Text variant="bodyLarge" style={{ alignSelf: 'baseline', fontSize: 19 }}>System Color</Text>
                            {isDynamicThemeSupported ?
                                <View style={{
                                    paddingVertical: 15, flexDirection: 'column',
                                    justifyContent: 'center', gap: 10,
                                }}>
                                    <Text variant="bodyMedium">Get Color Palatte from your system. You can change it from device settings</Text>
                                    <Text variant="bodyMedium">{"isDakr : " + thisTheme.dark}</Text>

                                    <Button mode="contained" disabled={!isDynamicThemeSupported}
                                        style={{
                                            flex: 1,
                                            backgroundColor: thisTheme.dark ?
                                                useMaterial3Theme().theme.dark.primaryContainer :
                                                useMaterial3Theme().theme.light.primaryContainer,
                                            borderWidth: 2,
                                            borderRadius: 30,
                                            borderColor: thisTheme.dark ?
                                                useMaterial3Theme().theme.dark.primary :
                                                useMaterial3Theme().theme.light.primary,
                                        }}
                                        labelStyle={{
                                            fontFamily: 'Manrope-Bold', fontSize: 16,
                                            color: thisTheme.dark ?
                                                useMaterial3Theme().theme.dark.onPrimaryContainer :
                                                useMaterial3Theme().theme.light.onPrimaryContainer,
                                        }}
                                        onPress={() => {
                                            setColorDialogvisible(false)
                                            UpdateThemeTo(theme.light.primary);
                                            onUseSystemButtonPress()
                                        }}>Apply</Button>

                                </View> :

                                <List.Item title={"Device not supported"} style={{
                                    paddingLeft: 15,
                                    marginTop: 10,
                                    backgroundColor: thisTheme.colors.errorContainer,
                                    borderRadius: 15,
                                }}
                                    left={() => <List.Icon style={{ paddingRight: 8 }} icon={"information-outline"} />}
                                    description={"System colors not available. Use custom color instead"} />

                            }
                        </View>
                        <View style={{ paddingHorizontal: 19, paddingBottom: 5, gap: 15 }}>
                            <Text variant="titleLarge" style={{ fontSize: 19 }}>Custom Color</Text>
                            <View style={{
                                flexDirection: 'row', gap: 15, alignItems: 'flex-start',
                                flexWrap: 'wrap',
                            }}>
                                <ColorButton color='#EA9389' colorName="red" setThisColor={UpdateThemeTo} setAccentColor={setAccentColor} setColorSnackVisible={setColorSnackVisible} setTouchable={setTouchable} thisTheme={thisTheme} />
                                <ColorButton color='#DBA430' colorName="yellow" setThisColor={UpdateThemeTo} setAccentColor={setAccentColor} setColorSnackVisible={setColorSnackVisible} setTouchable={setTouchable} thisTheme={thisTheme} />
                                <ColorButton color='#386A1F' colorName="green" setThisColor={UpdateThemeTo} setAccentColor={setAccentColor} setColorSnackVisible={setColorSnackVisible} setTouchable={setTouchable} thisTheme={thisTheme} />
                                <ColorButton color='#22BEB3' colorName="cyan" setThisColor={UpdateThemeTo} setAccentColor={setAccentColor} setColorSnackVisible={setColorSnackVisible} setTouchable={setTouchable} thisTheme={thisTheme} />
                                <ColorButton color='#7BAFE8' colorName="blue" setThisColor={UpdateThemeTo} setAccentColor={setAccentColor} setColorSnackVisible={setColorSnackVisible} setTouchable={setTouchable} thisTheme={thisTheme} />
                                <ColorButton color='#CA96EB' colorName="purple" setThisColor={UpdateThemeTo} setAccentColor={setAccentColor} setColorSnackVisible={setColorSnackVisible} setTouchable={setTouchable} thisTheme={thisTheme} />
                                {/* <ColorButton color='#EB8BCA' colorName="pink" setThisColor={UpdateThemeTo} setAccentColor={setAccentColor} setColorSnackVisible={setColorSnackVisible} setTouchable={setTouchable} thisTheme={thisTheme} /> */}
                                <ColorButton color='#FFB1C8' colorName="black" setThisColor={UpdateThemeTo} setAccentColor={setAccentColor} setColorSnackVisible={setColorSnackVisible} setTouchable={setTouchable} thisTheme={thisTheme} />
                                {/* <ColorButton color='#00668B' setThisColor={UpdateThemeTo} setAccentColor={setAccentColor} /> */}
                                {/* <ColorButton color='#B9AE21' setThisColor={UpdateThemeTo} setAccentColor={setAccentColor} setColorSnackVisible={setColorSnackVisible} setColorDialogvisible={setColorDialogvisible} /> */}
                                {/* <ColorButton color='#9c4237' setThisColor={UpdateThemeTo} setAccentColor={setAccentColor} /> */}
                                {/* <IconButton icon='plus' onPress={() => {
                                }} mode="contained"></IconButton> */}
                            </View>
                        </View>
                    </ScrollView>
                </GestureHandlerRootView>
            </Dialog.Content>
            <Dialog.Actions>
                <Button onPress={() => setTouchable(false)}>Close</Button>
            </Dialog.Actions>
        </AnimatedDialog >
    );
}
const RadioButtonItem = ({ checked, onPress }:
    { checked: boolean, onPress: () => {} }) => {
    return (
        <RadioButton.Item label={"System default"}
            value={"system"}
            status={checked ? 'checked' : 'unchecked'}
            position='leading'
            labelStyle={{ textAlign: 'left', fontSize: 19, fontFamily: 'Manrope' }}
            mode='android'
            onPress={() => onPress()}
            style={{ paddingHorizontal: 19, paddingVertical: 6 }}
        ></RadioButton.Item>
    )
}
type BinDeletionTimeDialogType = {
    dialogvisible: boolean,
    setdialogvisible: (value: boolean) => void,
    touchable: boolean,
    setTouchable: (value: boolean) => void,
    thisTheme: MD3Theme,
    binDeletionTime: number,
    setBinDeletionTime: (value: number) => void,
    binDeletionTimeUnit: "Months" | "Days" | "Hours",
    setBinDeletionTimeUnit: (value: "Months" | "Days" | "Hours") => void
}
export const BinDeletionTimeDialog = ({ dialogvisible, setdialogvisible,
    touchable, setTouchable, thisTheme, binDeletionTime, setBinDeletionTime,
    binDeletionTimeUnit, setBinDeletionTimeUnit }: BinDeletionTimeDialogType) => {
    const CarouselRef = useRef();
    const PAGE_WIDTH = Dimensions.get('window').width;
    const baseOptions = {
        vertical: true,
        width: 120,
        height: 120,
    };
    const [time, setTime] = useState(binDeletionTime);

    const RenderContent = ({ index }: { index: number }) => {
        return (
            <View style={styles.renderContentStyle}>
                <Text style={styles.renderContentText}>{index + 1}</Text>
            </View>
        )
    }
    const [unit, setUnit] = useState(binDeletionTimeUnit);
    const onDoneClick = async () => {
        setTouchable(false);
        setBinDeletionTime(time);
        setBinDeletionTimeUnit(unit);
        await AsyncStorage.setItem('@autoDelete',
            JSON.stringify({ time: time, unit: unit }));
    }
    return (
        <AnimatedDialog visible={dialogvisible}
            setVisible={setdialogvisible}
            backDropDisabled={true}
            touchable={touchable}
            setTouchable={setTouchable}
            thisTheme={thisTheme}>
            <Dialog.Title style={{ fontFamily: 'Manrope' }}>Bin Deletion Time</Dialog.Title>
            <Dialog.Content style={{ paddingHorizontal: 0 }}>
                <View style={{
                    zIndex: 100, alignItems: 'center', justifyContent: 'space-evenly',
                    marginHorizontal: 24, flexDirection: 'row'
                }}>
                    <Carousel defaultIndex={time - 1}
                        loop
                        ref={CarouselRef}
                        {...baseOptions}
                        style={{
                            marginHorizontal: 0,
                            backgroundColor: thisTheme.colors.surfaceContainerLow,
                            overflow: 'hidden',
                            borderWidth: 1.8,
                            borderColor: thisTheme.colors.outlineVariant,
                            borderRadius: 12,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                        onScrollEnd={(index) => {
                            setTime(index + 1)
                        }}
                        autoPlay={false}
                        data={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]}
                        mode="parallax"
                        modeConfig={{
                            parallaxScrollingScale: 1,
                            parallaxScrollingOffset: 75,
                            parallaxAdjacentItemScale: 0.4,
                        }}
                        renderItem={({ index }) => (<RenderContent index={index} />)} />
                    <View style={{ flexDirection: 'column' }}>
                        <ChipButton onPress={() => setUnit('Hours')} label="Hours"
                            style={{
                                borderBottomLeftRadius: 0,
                                borderBottomRightRadius: 0,
                                borderBottomWidth: 0
                            }}
                            selected={unit == 'Hours'}></ChipButton>
                        <ChipButton onPress={() => setUnit('Days')} label="Days"
                            style={{
                                borderRadius: 0,
                                borderBottomWidth: 0
                            }}
                            selected={unit == 'Days'}></ChipButton>
                        <ChipButton onPress={() => setUnit('Months')} label="Months"
                            style={{
                                borderTopLeftRadius: 0,
                                borderTopRightRadius: 0,
                            }}
                            selected={unit == 'Months'}></ChipButton>
                    </View>
                </View>
                <View style={{ marginHorizontal: 'auto', justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ marginHorizontal: 24, marginVertical: 12, fontSize: 16 }}>
                        Notes in Bin will be deleted after
                    </Text>
                    <Text style={{ fontSize: 24 }}>
                        {time
                            + " "
                            + unit
                        }
                    </Text>
                </View>
            </Dialog.Content>
            <Dialog.Actions style={{ justifyContent: 'space-between' }}>
                <IconButton icon={'keyboard'} />
                <View style={{ flexDirection: 'row' }}>
                    <Button onPress={() => { setTouchable(false) }}>Cancel</Button>
                    <Button mode="contained-tonal"
                        onPress={() => onDoneClick()}>Done</Button>
                </View>
            </Dialog.Actions>
        </AnimatedDialog>
    )
}
const ChipButton = ({ label, onPress, selected, style }:
    { label: string, onPress: () => void, selected: boolean, style?: ViewStyle }) => {
    const theme = useTheme();
    return (
        <View style={{
            overflow: 'hidden',
            borderRadius: 8,
            backgroundColor: selected ?
                theme.colors.primaryContainer :
                theme.colors.surfaceContainer,
            borderWidth: 1,
            borderColor: theme.colors.outline,
            ...style
        }}>
            <TouchableRipple
                onPress={onPress} style={{
                    paddingVertical: 8,
                    paddingHorizontal: 16,
                }}>
                <Text style={{
                    fontFamily: 'Manrope-SemiBold',
                    color: selected ?
                        theme.colors.onPrimaryContainer :
                        theme.colors.onSurface,
                }}>{label}</Text>
            </TouchableRipple>
        </View >
    )
}
//#endregion

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
    },
    renderContentStyle: {
        alignItems: 'center',
        marginTop: 28
    },
    renderContentText: {
        fontSize: 40
    },
    segBtnStyle: {
        borderRadius: 0,
        borderRightWidth: 1
    }

});
