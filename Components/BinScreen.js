import { Appbar, Surface, Text, useTheme, Button, Portal, Dialog, Snackbar, Icon } from "react-native-paper";
import { View, Image, BackHandler } from "react-native";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../AppContext";
import { StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { interpolateColor, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { throttle } from "lodash";

export function Bin({ navigation, route }) {
    const { data, binData, setBinData, titleFontSize, contentFontSize, titleBold, contentBold,
        setActiveScreen, groupList, titleFontFamily, showNoteBorder,
        contentFontFamily } = useContext(AppContext);
    const previous_screen = route.params.previous_screen;
    const thisTheme = useTheme();
    const [isDialogVisible, setIsDialogVisible] = useState(false);
    const [isSnackVisible, setSnackVisible] = useState(false);
    const [restoredGrps, setRestoredGrps] = useState([]);
    const [restoreKey, setRestoreKey] = useState(-1);

    const ListEmptyComp = () => {
        return (
            <View style={{ marginTop: '40%', alignItems: 'center', justifyContent: 'center' }}>
                {/* <Image style={{ width: 300, marginTop: 100, height: 200, resizeMode: 'cover' }}
                    source={require('../assets/images/empty-bin.png')} /> */}
                <Icon source={"delete-empty-outline"} size={75}
                 color={thisTheme.colors.primaryContainer} />
                <Text variant='headlineMedium'
                    style={{
                        opacity:0.5, fontFamily:'Lexend',
                        color: thisTheme.colors.onPrimaryContainer,
                        marginTop: 20, marginBottom: 5
                    }}>There's nothing here</Text>
                <Text variant='bodyLarge'
                    style={{ color: thisTheme.colors.outline, }}>You have no notes inside Bin</Text>
            </View>
        );
    }
    async function clearBinData() {
        try {
            await AsyncStorage.setItem('binData', '[]');
            setBinData([]);
        } catch (error) {
            console.log(error);
        }
    }

    async function restoreNote(index) {
        var note = binData[index];
        data.unshift(note);
        data.sort(function (a, b) {
            return b.key - a.key;
        });
        binData.splice(index, 1);
        await AsyncStorage.setItem('data', JSON.stringify(data));
        await AsyncStorage.setItem('binData', JSON.stringify(binData));

        note.groups.forEach(_group => {
            if (!(groupList.includes(_group))) {
                restoredGrps.unshift(_group);
            }
        });

        if (restoredGrps.length != 0) {
            restoredGrps.forEach(_group => {
                groupList.unshift(_group);
            })
            await AsyncStorage.setItem('groupList', JSON.stringify(groupList));
            setSnackVisible(true);
        }
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
        <Surface style={{ flex: 1, backgroundColor: thisTheme.colors.surface }}>
            <Animated.View style={AnimatedHeaderStyle}>
                <Appbar.Header style={{ backgroundColor: "transparent" }}>
                    <Appbar.BackAction onPress={throttle(() => {
                        setActiveScreen(previous_screen);
                        navigation.goBack();
                    }, 200, { trailing: false })} />
                    <Appbar.Content title={
                        <Animated.View>
                            <Text variant="titleLarge"
                                numberOfLines={1}
                                accessible
                                accessibilityRole="header">Bin</Text>
                        </Animated.View>
                    } style={{ paddingLeft: 10 }} />
                </Appbar.Header>
            </Animated.View>
            {/* <Button onPress={console.log(JSON.stringify(binData))}>press</Button> */}
            <Animated.FlatList
                scrollEventThrottle={16}
                onScroll={scrollHandler}
                data={binData}
                ListEmptyComponent={ListEmptyComp}
                keyExtractor={item => item.key}
                renderItem={({ item }) => {
                    return (
                        <Surface elevation={1}
                            theme={{
                                colors: {
                                    elevation: {
                                        level1: showNoteBorder ?
                                            thisTheme.colors.surface :
                                            thisTheme.colors.elevation.level3
                                    }
                                }
                            }}
                            style={[styles.itemView,
                            {
                                borderWidth: showNoteBorder ?
                                    2.3 : 0,
                                borderColor: thisTheme.colors.outlineVariant
                            }]}
                        >
                            <View style={styles.textContent}>
                                <Text variant='headlineMedium' numberOfLines={2}
                                    style={{
                                        fontFamily: titleBold ? titleFontFamily + "-Medium" : titleFontFamily,
                                        fontSize: titleFontSize / 4.3,
                                        lineHeight: titleFontSize / 4,
                                        color: thisTheme.colors.onPrimaryContainer,
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}>
                                    {item.title}
                                </Text>
                                <Text variant='bodyMedium' numberOfLines={4}
                                    style={{
                                        fontFamily: contentBold ? contentFontFamily + "-Medium" : contentFontFamily,
                                        fontSize: contentFontSize / 6,
                                        lineHeight: contentFontSize / 5,
                                        color: thisTheme.colors.onSurfaceVariant
                                    }}>
                                    {item.content}
                                </Text>
                            </View>
                            <View style={styles.actionViewMain}>
                                <View style={styles.ActionTextView}>
                                    <Text style={styles.DateText}>{item.date}</Text>
                                </View>
                                <View style={styles.actionView}>
                                    <Button mode='contained'
                                        style={styles.actionButton}
                                        onPress={() => {
                                            setRestoreKey(binData.indexOf(item));
                                            setIsDialogVisible(true);
                                        }}>Restore</Button>
                                </View>
                            </View>
                        </Surface>
                    );
                }} />
            < Portal >
                <Dialog visible={isDialogVisible} onDismiss={() => {
                    setIsDialogVisible(false);
                    setRestoreKey(-1);
                }}>
                    <Dialog.Title>Restore this note ?</Dialog.Title>
                    <Dialog.Content>
                        <Text>This Note will be restored back and shown in corresponding notes list </Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => {
                            restoreNote(restoreKey);
                            setIsDialogVisible(false);
                        }}>Restore</Button>
                        <Button onPress={() => {
                            setIsDialogVisible(false);
                        }}>Cancel</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal >
            <Button mode="contained" style={styles.clearButton}
                onPress={() => clearBinData()}>Clear Bin</Button>
            {/* <Button onPress={() => setSnackVisible(!isSnackVisible)}>show/hide</Button> */}
            <Snackbar onDismiss={() => {
                setSnackVisible(false);
                setRestoredGrps([]);
            }}
                visible={isSnackVisible}
                action={{
                    label: 'Ok',
                    onPress: () => {
                        setSnackVisible(false);
                        // setRestoredGrps([]);
                    }
                }}
            >{`Added ${restoredGrps.toString()} to groups list, because the note you restored included those groups`}</Snackbar>
        </Surface >
    );
}

const styles = StyleSheet.create({
    itemView: {
        margin: 10,
        borderRadius: 20,
        shadowColor: 'transparent'
    },
    textContent: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        paddingTop: 24,
        paddingLeft: 24,
        paddingRight: 24,
        paddingBottom: 0,
        gap: 15
    },
    HeaderStyle: {
        display: 'flex',
        alignItems: 'center',
    },
    actionViewMain: {
        display: 'flex',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: 0,
        height: 88,
    },
    actionView: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        height: 80,
        width: '65%',
        gap: 15,
        padding: 20
    },
    actionButton: {
    },
    ActionTextView: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingLeft: 24,
        height: 80,
        width: '35%',
    },
    DateText: {
        // fontSize: 16,
        // fontWeight: '600',
    },
    createButton: {
        marginLeft: 30
    },
    clearButton: {
        margin: 20,
        marginHorizontal: '10%',
        paddingVertical: 5,
        borderRadius: 30
    }
});