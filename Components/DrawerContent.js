import { useCallback, useContext } from "react";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { Divider, Drawer, Text, useTheme } from "react-native-paper";
import { StyleSheet, View } from "react-native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { AppContext } from "../AppContext";
import { StackActions } from "@react-navigation/native";
SplashScreen.preventAutoHideAsync();

export function DrawerContent({ navigation }) {
    const { groupList, activeScreen, setActiveScreen } = useContext(AppContext);
    const theme = useTheme();

    const navScr = (scrName) => {
        navigation.closeDrawer(); navigation.navigate(scrName, { previous_screen: activeScreen });
        setActiveScreen(scrName);
    }
    const navVarScr = (scrName) => {
        navigation.closeDrawer(); navigation.navigate(scrName, { previous_screen: activeScreen });
        setActiveScreen(scrName);
    }
    const drawerItemTheme = {
        colors: { onSurfaceVariant: theme.colors.onPrimaryContainer },
        fonts: { labelLarge:theme.fonts.titleSmall },
        // fonts: { labelLarge: {fontFamily:'Comfortaa'}}
    }

    return (
        <DrawerContentScrollView
            contentContainerStyle={{ marginHorizontal: 0 }}
            style={{
                backgroundColor: theme.colors.surface,
                paddingHorizontal: 0
            }}>
            <View style={{
                height: 80,
                flex: 1,
                justifyContent: 'center',
                // backgroundColor: theme.colors.elevation.level2,
                paddingHorizontal: 0,

            }}>
                <View style={{ flexDirection: 'row' }}>
                    <Text style={{
                        marginLeft: '10%',
                        fontSize: 26, maxHeight: 70,
                        fontFamily: 'Comfortaa',
                        fontWeight: '200',
                        letterSpacing: 7,
                        color: theme.colors.onPrimaryContainer
                    }}>MY </Text>
                    <Text style={{
                        fontSize: 26, maxHeight: 70,
                        fontFamily: 'Comfortaa',
                        fontWeight: '200',
                        letterSpacing: 7,
                        color: theme.colors.onSecondaryContainer
                    }}>NOTES</Text>
                </View>
            </View>
            <Divider style={{ backgroundColor: theme.colors.outlineVariant, height: 1.5 }} />
            <Drawer.Section title='Notes' showDivider={false} theme={{
                // fonts:{titleSmall:theme.fonts.bodySmall}
            }}>
                <Drawer.Item label="All Notes"
                    icon="format-list-bulleted-square"
                    theme={drawerItemTheme}
                    active={activeScreen === 'All Notes'}
                    onPress={() => navScr('All Notes')} style={styles.DrawerItem}></Drawer.Item>
                <Drawer.Item label="Bin"
                    icon="delete-outline"
                    theme={drawerItemTheme}
                    active={activeScreen === 'Bin'}
                    onPress={() => navScr('Bin')} style={styles.DrawerItem}></Drawer.Item>
            </Drawer.Section>
            {/* <Divider style={{ backgroundColor: theme.colors.outlineVariant, height: 0.7 }} /> */}
            <Drawer.Section title="Groups" theme={{ fonts: { labelLarge: { fontWeight: '400' } } }} showDivider={false}>
                {groupList.map((item) => {
                    return (
                        <Drawer.Item key={groupList.indexOf(item)} label={item}
                            icon="label-outline"
                            theme={drawerItemTheme}
                            active={activeScreen === item}
                            onPress={() => {
                                navigation.closeDrawer();
                                activeScreen == "All Notes" ?
                                    navigation.navigate(item, { previous_screen: activeScreen, active: item }) :
                                    navigation.dispatch(
                                        StackActions.replace(item, {
                                            previous_screen: activeScreen, active: item
                                        })
                                    )
                                setActiveScreen(item);
                            }} style={styles.DrawerItem}
                        ></Drawer.Item>
                    );
                })}
                <Drawer.Item label="New"
                    icon="plus"
                    theme={drawerItemTheme}
                    active={activeScreen === 'AddGroup'}
                    onPress={() => {
                        navigation.closeDrawer(); navigation.navigate('Groups', { previous_screen: activeScreen })
                        setActiveScreen('AddGroup')
                    }} style={styles.DrawerItem}>

                </Drawer.Item>
            </Drawer.Section>

            {/* <Divider style={{ backgroundColor: theme.colors.outlineVariant, height: 0.7 }} /> */}
            <Drawer.Section title='App' theme={{ fonts: { labelSmall: { fontWeight: '100' } } }} showDivider={false}>
                <Drawer.Item label="Settings"
                    icon="cog-outline"
                    theme={drawerItemTheme}

                    active={activeScreen === 'Settings'}
                    onPress={() => {
                        navigation.closeDrawer(); navigation.navigate('Settings', { previous_screen: activeScreen })
                        setActiveScreen('Settings');
                    }} style={styles.DrawerItem}></Drawer.Item>
                <Drawer.Item label="About"
                    //  theme={{ fonts: { labelLarge: { fontWeight: '100' } } }}
                    icon="account-circle-outline"
                    theme={drawerItemTheme}

                    active={activeScreen === 'About'}
                    onPress={() => {
                        navigation.closeDrawer(); navigation.navigate('About', { previous_screen: activeScreen });
                        setActiveScreen('About');
                    }} style={styles.DrawerItem} />
                {/* <Drawer.Item label="Test Screen"
                    //  theme={{ fonts: { labelLarge: { fontWeight: '100' } } }}
                    icon="account-circle-outline"
                    theme={drawerItemTheme}
                    active={activeScreen === 'Scr'}
                    onPress={() => {
                        navigation.closeDrawer();
                        navigation.navigate(
                            'testscr',
                            { previous_screen: activeScreen });
                    }} style={styles.DrawerItem}>
                </Drawer.Item> */}
            </Drawer.Section>

        </DrawerContentScrollView >
    );
}

const styles = StyleSheet.create({

    Header: {
        marginLeft: 20,
    },
    DrawerSection: {

    },
    DrawerItem: {
        height: 50,
    }
});