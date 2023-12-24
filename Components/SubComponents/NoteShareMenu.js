import { Menu, IconButton, List, Divider, useTheme, Icon } from "react-native-paper";
import { Share } from "react-native";
import { useState } from "react";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import * as Print from "expo-print";

export const ShareMenuComp = ({ item }) => {
    const thisTheme = useTheme();
    //#region 
    const [shareMenuVisible, setShareMenuVisible] = useState(false);

    const shareAsPlainText = async () => {
        try {
            let result = await Share.share({ message: item.title + "\n" + item.content + "\nDate" + item.date });
            setShareMenuVisible(false)
        } catch (error) {
            console.log(error)
        }
    }

    const shareAsTextFile = async () => {
        try {
            let stringNote = item.title + "\n" + item.content + "\nDate" + item.date;
            const tempFileURI = `${FileSystem.cacheDirectory}` + item.title + `.txt`;
            await FileSystem.writeAsStringAsync(tempFileURI, stringNote, { encoding: FileSystem.EncodingType.UTF8 });
            await Sharing.shareAsync(tempFileURI, { mimeType: 'text/plain', dialogTitle: 'Hello' })
            setShareMenuVisible(false)
        } catch (error) {
            console.log(error)
        }
    }
    const shareAsPDF = async () => {
        let htmlContent = '<div style="flex-direction:column;gap: 15px;"><h1 style="font-size: 35; font-family: open-sans;">' + item.title + '</h1><p style="font-size: 27; font-family: sans-serif;">' + item.content + '</p><p style="font-size: 27; font-family: sans-serif;">Date : ' + item.date + '</p></div>';
        htmlContent = htmlContent.replace(/(?:\r\n|\r|\n)/g, '<br>');
        try {
            let { uri } = await Print.printToFileAsync({
                html: htmlContent,
                margins: { top: 10, left: 10, right: 10, bottom: 10 }
            });
            await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: "Share note ?" });
            setShareMenuVisible(false);
        } catch (error) {
            console.log(error)
        }
    }
    //#endregion
    return (
        <Menu visible={shareMenuVisible}
            contentStyle={{ borderRadius: 20 }}
            onDismiss={() => setShareMenuVisible(false)}
            anchor={
                <IconButton icon={'share-variant'}
                    mode="contained"
                    theme={{ colors: { primary: thisTheme.colors.secondary } }}
                    style={{ backgroundColor: 'transparent' }}
                    onPress={() => {
                        setShareMenuVisible(true);
                        // setShareNoteObject(item);
                    }}></IconButton>}>
            <List.Item style={{ paddingRight:0, paddingTop:0, paddingBottom:0 }} 
            title="Share as" 
            right={()=>
            <IconButton icon={()=><Icon source={"close"} size={17}/>}
            onPress={()=>setShareMenuVisible(false)}/>}></List.Item>
            <Divider></Divider>
            <Menu.Item title="Plain Text" onPress={() => shareAsPlainText()} />
            <Menu.Item title="Text File" onPress={() => shareAsTextFile()} />
            <Menu.Item title="PDF" onPress={() => shareAsPDF()} />
        </Menu>
    )

}