import { useState, useContext, useEffect, useCallback } from "react";
import { BackHandler, FlatList, Share, StyleSheet, View } from "react-native";
import { Searchbar, Surface, Text, Button, Portal, Dialog, List, useTheme, IconButton, TouchableRipple, AnimatedFAB, Icon } from "react-native-paper";
import { AppContext } from "../AppContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import * as Print from "expo-print";
import Animated, { interpolateColor, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { ShareMenuComp } from "./SubComponents/NoteShareMenu";

const DeleteNoteDialog = ({ isDialogVisible, setIsDialogVisible, data, binData, deleteKey, setDeleteKey, activeGroup, getGroupData }) => {
    const thisTheme = useTheme();
    const thisStyle = StyleSheet.create({
        deleteListItem: {
            borderWidth: 2.5,
            borderColor: thisTheme.colors.outline,
            borderRadius: 20,
            backgroundColor: thisTheme.colors.elevation.level4,
            marginVertical: 5
        }
    });

    function removeNoteFromGroup(index, deleteGroup) {
        var filteredGroups = [];
        data[index].groups.forEach(element => {
            if (element != deleteGroup) {
                filteredGroups.push(element)
            }
        });
        data[index].groups = filteredGroups;
    }
    async function moveToBin(key) {
        var note = data[key]
        binData.push(note);
        jsonString = JSON.stringify(binData);
        await AsyncStorage.setItem('binData', jsonString);
    }

    return (
        <Dialog visible={isDialogVisible} style={{ backgroundColor: thisTheme.colors.surface }} onDismiss={() => setIsDialogVisible(false)} >
            <Dialog.Title>Delete Note?</Dialog.Title>
            <Dialog.Content>
                <List.Item title={"Move to Bin"}
                    style={thisStyle.deleteListItem}
                    description={"Note will be moved to Bin and won't be permanently deletd."} />

                <List.Item title={"Remove Note"}
                    style={thisStyle.deleteListItem}
                    description={"Note will be Removed from this group and won't be permanently deletd."}
                    onPress={(item) => {
                        removeNote(deleteKey, activeGroup);
                        getGroupData();
                        setIsDialogVisible(false)
                    }} />

                <List.Item title={"Delete Note"}
                    style={thisStyle.deleteListItem}
                    description={"Note will be permanently deletd. This action can't be undone"}
                    onPress={() => {
                        moveToBin(deleteKey);
                        removeNote(deleteKey);
                        setIsDialogVisible(false);
                        setDeleteKey(0);
                    }} />

            </Dialog.Content>
        </Dialog>
    );
}
// const ShareDialog = ({ visible, setVisible, backgroundColor, titleColor, noteObject }) => {
//     const shareAsPDF = async () => {
//         const htmlContent = '<div style="flex-direction:column;gap: 15px;"><h1 style="font-size: 35; font-family: sans-serif;">' + noteObject.title + '</h1><p style="font-size: 27; font-family: sans-serif;">' + noteObject.content + '</p><p style="font-size: 27; font-family: sans-serif;">Date : ' + noteObject.date + '</p></div>';
//         try {
//             let { uri } = await Print.printToFileAsync({
//                 html: htmlContent,
//                 margins: { top: 10, left: 10, right: 10, bottom: 10 }
//             });
//             await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: "Share note ?" });
//             setVisible(false);
//         } catch (error) {
//             console.log(error)
//         }
//     }
//     const shareAsTextFile = async () => {
//         try {
//             let stringNote = noteObject.title + "\n" + noteObject.content + "\nDate" + noteObject.date;
//             const tempFileURI = `${FileSystem.cacheDirectory}` + noteObject.title + `.txt`;
//             await FileSystem.writeAsStringAsync(tempFileURI, stringNote, { encoding: FileSystem.EncodingType.UTF8 });
//             await Sharing.shareAsync(tempFileURI, { mimeType: 'text/plain', dialogTitle: 'Hello' })
//             setVisible(false)
//         } catch (error) {
//             console.log(error)
//         }
//     }
//     const shareAsPlainText = async () => {
//         try {
//             let result = await Share.share({ message: noteObject.title + "\n" + noteObject.content + "\nDate" + noteObject.date });
//             setVisible(false)
//         } catch (error) {
//             console.log(error)
//         }
//     }
//     return (
//         <Dialog visible={visible} onDismiss={() => setVisible(false)}
//             style={{ backgroundColor: backgroundColor }}>
//             <Dialog.Title>Share File as ?</Dialog.Title>
//             <View style={{ flexDirection: 'column', gap: 15, paddingBottom: 15 }}>

//                 <List.Section>
//                     <List.Item title={"Share as Plain text"}
//                         titleStyle={{ color: titleColor }}
//                         style={{ paddingHorizontal: 24 }}
//                         onPress={() => shareAsPlainText()}
//                         left={() => <List.Icon icon={'text'} color={titleColor} />} />
//                     <List.Item title={"Share as Text file"}
//                         titleStyle={{ color: titleColor }}
//                         style={{ paddingHorizontal: 24 }}
//                         onPress={() => shareAsTextFile()}
//                         left={() => <List.Icon icon={'note-text-outline'} color={titleColor} />} />
//                     <List.Item title={"Share as PDF"}
//                         titleStyle={{ color: titleColor }}
//                         style={{ paddingHorizontal: 24 }}
//                         onPress={() => shareAsPDF()}
//                         left={() => <List.Icon icon={'file-pdf-box'} color={titleColor} />} />
//                 </List.Section>
//             </View>
//         </Dialog>
//     );
// }

export function VariableGroupScreen({ navigation, route }) {
    const activeGroup = route.params.active;
    const previous_screen = route.params.previous_screen
    const thisTheme = useTheme();
    const { data, binData, titleFontSize, contentFontSize, showNoteBorder,
        titleFontFamily, setActiveScreen, titlBold, contentBold,
        contentFontFamily } = useContext(AppContext);
    const [activeNotesList, setActiveNotesList] = useState([]);
    const [isDialogVisible, setIsDialogVisible] = useState(false);
    const [deleteNoteKey, setDeleteNoteKey] = useState(0);
    const insetTop = useSafeAreaInsets().top;

    const ListEmptyComponent = () => {
        return (
            <View style={{ flex: 1, alignItems: 'center', paddingTop: '40%' }}>
                <Icon source={"emoticon-sad-outline"} size={100} color={thisTheme.colors.outline} />
                <Text variant="titleLarge" style={{ color: useTheme().colors.onSurfaceVariant }}>Group Empty</Text>
                <Text variant="bodyLarge" style={{ color: useTheme().colors.outline }}>There are no notes in this group</Text>
                <Text variant="bodyLarge" style={{ color: useTheme().colors.outline }}>Try creating some</Text>
                {/* <Button mode="contained" style={{ marginTop: 40 }}>Create {route.params.active} Note</Button> */}
            </View>
        );
    }
    const getGroupData = () => {
        let d = [];
        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            if (element.groups.includes(activeGroup)) {
                d.push(element)
            }
        }
        setActiveNotesList(d);
    }
    const ScrollY = useSharedValue(0);

    const AnimatedHeaderStyle = useAnimatedStyle(() => ({
        backgroundColor: interpolateColor(
            ScrollY.value,
            [30, 60],
            [thisTheme.colors.surface, thisTheme.colors.elevation.level2],
        ),
        padding: 10,
        paddingTop: insetTop * 1.3,
        height: 90
    }))

    const scrollHandler = useAnimatedScrollHandler((event) => {
        ScrollY.value = event.contentOffset.y;
    });
    function handleGoBack() {
        navigation.goBack();
        setActiveScreen("All Notes");
        return true;
    }
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            getGroupData()
        })
        BackHandler.addEventListener('hardwareBackPress', handleGoBack);
        return () => BackHandler.removeEventListener('hardwareBackPress', handleGoBack);
    });
    return (
        <Surface
            elevation={1}
            style={{ flex: 1, }}
            theme={{ colors: { elevation: { level1: thisTheme.colors.surface } } }}>
            <Animated.View style={AnimatedHeaderStyle}>
                <Searchbar style={styles.Searchbar}
                    theme={{ colors: { elevation: { level3: thisTheme.colors.elevation.level2 } } }}
                    placeholder={"Search " + activeGroup}
                    icon={'menu'}
                    onIconPress={() => {
                        navigation.openDrawer()
                    }}
                    focusable={false}
                    onPressIn={() => {
                        navigation.navigate("VariableSearchScreen", { active: activeGroup });
                    }}
                ></Searchbar>
            </Animated.View>
            {/* <Text>{JSON.stringify(activeNotesList)}</Text> */}
            <Animated.FlatList data={activeNotesList}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                ListEmptyComponent={ListEmptyComponent}
                contentContainerStyle={{ paddingHorizontal: 7, paddingBottom: 0 }}
                extraData={data}
                renderItem={({ item }) => {
                    return (
                        <Surface onPress={() => {
                            navigation.navigate("CreateNewNote", {
                                title: item.title,
                                content: item.content,
                                date: item.date,
                                groups: item.groups,
                                createNew: false,
                                noteID: data.indexOf(item)
                            })
                        }}
                            elevation={1}
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
                            }]}>
                            <TouchableRipple
                                unstable_pressDelay={80}
                                onPress={() => {
                                    navigation.navigate("CreateNewNote", {
                                        title: item.title,
                                        content: item.content,
                                        date: item.date,
                                        groups: item.groups,
                                        createNew: false,
                                        noteID: data.indexOf(item)
                                    })
                                }}>
                                <View>
                                    <View style={styles.textContent}>
                                        <Text variant='headlineMedium' numberOfLines={2} style={
                                            [styles.HeaderStyle,
                                            {
                                                fontFamily: titlBold ? titleFontFamily + "-Medium" : titleFontFamily,
                                                fontSize: titleFontSize / 4.3,
                                                lineHeight: titleFontSize / 4,
                                                color: thisTheme.colors.onPrimaryContainer
                                            }]}>{item.title}</Text>
                                        <Text variant='bodyMedium' numberOfLines={8} style={
                                            [styles.contentStyle, {
                                                fontFamily: contentBold ? contentFontFamily + "-Medium" : contentFontFamily,
                                                fontSize: contentFontSize / 6,
                                                lineHeight: contentFontSize / 5,
                                                color: thisTheme.colors.onSurfaceVariant
                                            }]}>{item.content}</Text>
                                    </View>
                                    <View style={styles.actionViewMain}>
                                        <View style={styles.ActionTextView}>
                                            <Text style={styles.DateText}>{item.date}</Text>
                                        </View>
                                        <View style={styles.actionView}>
                                            <ShareMenuComp item={item} />
                                            <IconButton icon={'delete-outline'}
                                                mode="contained-tonal"
                                                onPress={() => {
                                                    setDeleteNoteKey(data.indexOf(item));
                                                    setIsDialogVisible(true);
                                                }}></IconButton>

                                        </View>
                                    </View>
                                </View>
                            </TouchableRipple>
                        </Surface>
                    );
                }} />
            < Portal >
                <DeleteNoteDialog isDialogVisible={isDialogVisible}
                    setIsDialogVisible={setIsDialogVisible}
                    data={data}
                    getGroupData={getGroupData}
                    binData={binData}
                    deleteKey={deleteNoteKey}
                    setDeleteKey={setDeleteNoteKey}
                    activeGroup={activeGroup} />
            </Portal >
            <View pointerEvents="box-none" style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 20,
                bottom: 20,
                justifyContent: 'flex-end',
                alignItems: 'flex-end'
            }}>
                <AnimatedFAB iconMode='dynamic' color={thisTheme.colors.onPrimary}
                    style={{ backgroundColor: thisTheme.colors.primary }}
                    extended={true}
                    animateFrom='right'
                    onPress={() => {
                        navigation.navigate('CreateVarNote', {
                            title: "",
                            content: "",
                            groups: [activeGroup],
                        });
                    }}
                    label={"Create"} icon='plus'>
                </AnimatedFAB>
            </View>
        </Surface >
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 15,
        flex: 1,
    },
    Searchbar: {
        marginBottom: 7
    },
    itemView: {
        margin: 10,
        borderRadius: 20,
        shadowColor: 'transparent',
        overflow: 'hidden'
    },
    textContent: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: 20,
        paddingBottom: 0,
        gap: 10
    },
    HeaderStyle: {
        display: 'flex',
        alignItems: 'center',
        fontFamily: 'Urbanist',
    },
    contentStyle: {
        fontFamily: 'OpenSans',
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
});