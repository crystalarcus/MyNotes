import { Button, Menu, IconButton, List, Divider, useTheme, Icon, Text, TouchableRipple, Dialog } from "react-native-paper";
import { useState } from "react";
import * as FileSystem from "expo-file-system";
import * as Print from "expo-print";
import { Alert, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { AnimatedDialog } from "./AnimatedDialog";
// import Share from "react-native-share";

export const ShareMenuComp = ({ items, style, iconColor }: {
    items: Note[], style?: ((StyleProp<ViewStyle>)), iconColor?: string
}) => {
    const thisTheme = useTheme();
    //#region 
    const [shareMenuVisible, setShareMenuVisible] = useState(false);

    const shareAsPlainText = async () => {
        let str = ""
        items.forEach(item => {
            str = str + item.title + "\n" + item.content + "\nDate" + item.date + "\n\n";
        });
        setShareMenuVisible(false)
        try {
            Share.open({ message: str })
                .then((res) => { })
                .catch((err) => { });
        } catch (error) {
            alert(error)
        }
    }

    const shareAsTextFile = async () => {
        setShareMenuVisible(false)
        let _tempFileURLS = [];
        try {
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                let stringNote = item.title + "\n" + item.content + "\nDate" + item.date;
                const tempFileURI = `${FileSystem.cacheDirectory}` + item.title + `.txt`;
                await FileSystem.writeAsStringAsync(tempFileURI, stringNote, { encoding: FileSystem.EncodingType.UTF8 });
                _tempFileURLS = [..._tempFileURLS, tempFileURI];
            }
            Share.open({ urls: _tempFileURLS })
                .then((res) => { })
                .catch((err) => { });
        } catch (error) {
            alert(error)
        }
    }
    const shareAsPDF = async () => {
        let _URLS = [];
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            let htmlContent = '<div style="flex-direction:column;gap: 15px;"><h1 style="font-size: 35; font-family: open-sans;">' + item.title + '</h1><p style="font-size: 27; font-family: sans-serif;">' + item.content + '</p><p style="font-size: 27; font-family: sans-serif;">Date : ' + item.date + '</p></div>';
            htmlContent = htmlContent.replace(/(?:\r\n|\r|\n)/g, '<br>');
            let { uri } = await Print.printToFileAsync({
                html: htmlContent,
                margins: { top: 10, left: 10, right: 10, bottom: 10 }
            });
            _URLS = [..._URLS, uri];
        }
        setShareMenuVisible(false);
        try {
            Share.open({ urls: _URLS })
                .then((res) => { })
                .catch((err) => { });
        } catch (error) {
            alert(error)
        }
    }
    //#endregion
    return (
        <Menu visible={shareMenuVisible} theme={{ animation: { scale: 0.8 } }}
            contentStyle={{ borderRadius: 20 }}
            onDismiss={() => setShareMenuVisible(false)}
            anchor={
                <IconButton icon={'share-outline'}
                    mode="contained"
                    iconColor={iconColor ? iconColor : thisTheme.colors.onSurfaceVariant}
                    style={style ? style : { backgroundColor: 'transparent' }}
                    onPress={() => {
                        setShareMenuVisible(true);
                        // setShareNoteObject(item);
                    }}></IconButton>}>
            <List.Item style={{ paddingRight: 0, paddingTop: 0, paddingBottom: 0 }}
                title="Share as"
                right={() =>
                    <IconButton style={{ marginVertical: 0 }} icon={() => <Icon source={"close"} size={17} />}
                        onPress={() => setShareMenuVisible(false)} />}></List.Item>
            <Divider></Divider>
            <Menu.Item title="Plain Text" onPress={() => shareAsPlainText()} />
            <Menu.Item title="Text File" onPress={() => shareAsTextFile()} />
            <Menu.Item title="PDF" onPress={() => shareAsPDF()} />
        </Menu>
    )

}
const TopButton = ({ icon, text, onPress, thisTheme }) => {
    return (
        <View style={[styles.TopButtonView1, { backgroundColor: thisTheme.colors.secondaryContainer, }]}>
            <TouchableRipple
                onPress={onPress}
                style={{
                    justifyContent: 'center'
                }}>
                <View style={styles.TopButtonView2} >
                    <Icon source={icon} size={21} color={thisTheme.colors.onSecondaryContainer} />
                    <View style={{ alignItems: 'center' }}>
                        <Text
                            style={{
                                textAlign: 'center',
                                paddingLeft: 16,
                                color: thisTheme.colors.onSecondaryContainer,
                                fontFamily: 'Manrope-SemiBold'
                            }}
                        >{text}</Text>
                    </View>
                </View>
            </TouchableRipple >
        </View>
    )
}
export const ShareDialog = ({ note,
    visible, setVisible, touchable, setTouchable, thisTheme,
}) => {
    //#region 
    const [shareMenuVisible, setShareMenuVisible] = useState(false);

    const shareAsPlainText = async (item) => {
        let str = "";
        str = str + item.title + "\n" + item.content + "\nDate" + item.date + "\n\n";
        setShareMenuVisible(false)
        try {
            Share.open({ message: str })
                .then((res) => { })
                .catch((err) => { });
        } catch (error) {
            alert(error)
        }
    }

    const shareAsTextFile = async (item) => {
        setShareMenuVisible(false)
        try {
            let stringNote = item.title + "\n" + item.content + "\nDate" + item.date;
            let tempFileURI = `${FileSystem.cacheDirectory}` + item.title + `.txt`;
            await FileSystem.writeAsStringAsync(tempFileURI, stringNote, { encoding: FileSystem.EncodingType.UTF8 });
            Share.open({ url: tempFileURI })
                .then((res) => { })
                .catch((err) => { });
        } catch (error) {
            alert(error)
        }
    }
    const shareAsPDF = async (item) => {
        let htmlContent = '<div style="flex-direction:column;gap: 15px;"><h1 style="font-size: 35; font-family: open-sans;">' + item.title + '</h1><p style="font-size: 27; font-family: sans-serif;">' + item.content + '</p><p style="font-size: 27; font-family: sans-serif;">Date : ' + item.date + '</p></div>';
        htmlContent = htmlContent.replace(/(?:\r\n|\r|\n)/g, '<br>');
        let { uri } = await Print.printToFileAsync({
            html: htmlContent,
            margins: { top: 10, left: 10, right: 10, bottom: 10 }
        });
        setShareMenuVisible(false);
        try {
            Share.open({ url: uri })
                .then((res) => { })
                .catch((err) => { });
        } catch (error) {
            alert(error)
        }
    }
    //#endregion
    return (
        <AnimatedDialog visible={visible}
            setVisible={setVisible}
            // animationType={'slide'}
            touchable={touchable}
            setTouchable={setTouchable} thisTheme={thisTheme}>
            <View style={{
                backgroundColor: thisTheme.colors.surfaceContainer
            }}>
                <Dialog.Icon icon={'share-variant'} />
                <Dialog.Title style={{ textAlign: 'center' }}>Share Note as</Dialog.Title>
                <View style={styles.shareView}>

                    <TopButton icon={"text-long"}
                        thisTheme={thisTheme}
                        text={"Plain Text"}
                        onPress={() => shareAsPlainText(note)} />

                    <TopButton icon={"text-box-outline"}
                        thisTheme={thisTheme}
                        text={"Text file (.txt)"}
                        onPress={() => shareAsTextFile(note)} />

                    <TopButton icon={"file-pdf-box"}
                        thisTheme={thisTheme}
                        text={"PDF Document (.pdf)"}
                        onPress={() => shareAsPDF(note)} />

                </View>
                <Dialog.Actions>
                    <Button onPress={() => setTouchable(false)}>Close</Button>
                </Dialog.Actions>
            </View>
        </AnimatedDialog>
    )
}

const styles = StyleSheet.create({
    shareView: {
        flexDirection: 'column',
        gap: 12,
        alignItems: 'center',
        marginBottom: 20
    },

    TopButtonView1: {
        overflow: 'hidden',
        borderRadius: 14,
        width: '80%',
    },
    TopButtonView2: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        height: 60
    }
})