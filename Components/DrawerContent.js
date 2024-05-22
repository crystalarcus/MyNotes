import { memo, useContext, useEffect, useState } from "react";
import { Button, Divider, Drawer, Icon, List, Menu, Text, TouchableRipple, useTheme } from "react-native-paper";
import { Image, Pressable, StyleSheet, View } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { AppContext } from "../AppContext";
import { StackActions } from "@react-navigation/native";
import { ScrollView } from "react-native-gesture-handler";
import { Drawer as DrawerLayout, useDrawerProgress } from "react-native-drawer-layout";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { Easing, interpolate, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";

SplashScreen.preventAutoHideAsync();

export const DrawerContent = ({ navigation }) => {

    const { data, binData, groupList, activeScreen, setActiveScreen } = useContext(AppContext);
    const [open, setOpen] = useState(false);
    const theme = useTheme();
    //#region 
    const navScr = (scrName) => {
        navigation.closeDrawer(); navigation.navigate(scrName, { previous_screen: activeScreen });
        setActiveScreen(scrName);
    }
    const drawerItemTheme = {
        // colors: { onSurfaceVariant: theme.colors.onPrimaryContainer },
        fonts: { labelLarge: { fontFamily: 'Manrope-SemiBold' } },
    }
    const drawerItemActiveTheme = {
        colors: { onSurfaceVariant: theme.colors.onPrimaryContainer },
        fonts: { labelLarge: { fontFamily: 'Manrope-Bold' } },
    }
    const DrawerRightComp = ({ activeName, displaytxt }) => {
        return (
            <Text style={{
                fontFamily: activeScreen == activeName ?
                    'Manrope-Bold' : 'Manrope-SemiBold',
                fontSize: 14
            }}>{displaytxt}</Text>
        )
    }
    const groupsExpandProgress = useSharedValue(0)
    const toggleGroupsAccordian = async () => {
        if (groupsExpandProgress.value == 1) {
            await AsyncStorage.setItem('@drawerExpanded', '0')
            groupsExpandProgress.value = withTiming(0, { duration: 300, easing: Easing.bezier(0, 0, 0, 1) })

        }
        else {
            await AsyncStorage.setItem('@drawerExpanded', '1')
            groupsExpandProgress.value = withTiming(1, { duration: 300, easing: Easing.bezier(0, 0, 0, 1) })

        }
    }
    const groupsAccordianStyle = useAnimatedStyle(() => ({
        overflow: 'hidden',
        opacity: interpolate(
            groupsExpandProgress.value,
            [0.4, 1],
            [0, 1]
        ),
        transform: [
            {
                scaleY: groupsExpandProgress.value,
            },
            {
                translateY: interpolate(
                    groupsExpandProgress.value,
                    [0, 1],
                    [-groupList.length * 25, 0]
                )
            }
        ],
        height: interpolate(
            groupsExpandProgress.value,
            [0, 1],
            [0, groupList.length * 51]
        )
    }))
    const groupsChevronStyle = useAnimatedStyle(() => ({
        transform: [{ rotateZ: `${interpolate(groupsExpandProgress.value, [0, 1], [0, 180])}deg` }]
    }))
    // const drawerProgress = useDrawerProgress();
    const progress = useSharedValue(0)

    useEffect(() => {
        async function loadDrawerData() {
            let op = await AsyncStorage.getItem('@drawerExpanded')
            op == null ? await AsyncStorage.setItem('@drawerExpanded', 'true') :
                groupsExpandProgress.value = (JSON.parse(op));
        }
        groupList.length ? loadDrawerData() : null
    }, [JSON.stringify(groupList), groupsExpandProgress.value])

    //#endregion
    return (
        <DrawerLayout open={open}
            onOpen={() => {
                setOpen(true);
                progress.value = withTiming(1, { duration: 200 })
            }}
            onClose={() => {
                setOpen(false)
                progress.value = withTiming(0, { duration: 200 })
            }}
            renderDrawerContent={() => {
                return <Text>Drawer Content</Text>
            }}
            drawerStyle={{
                backgroundColor: theme.colors.surfaceContainer,
            }}
            style={{
                backgroundColor: theme.colors.surfaceContainer,
                paddingHorizontal: 0,
            }}>
            <Animated.ScrollView>
                <View style={{
                    marginTop: useSafeAreaInsets().top,
                    height: 60,
                    flex: 1,
                    justifyContent: 'center',
                }}>
                    <View style={{ flexDirection: 'row', paddingLeft: '7%', gap: 10, alignItems: 'center' }}>
                        {/* <Image source={require("../assets/gicontrans.png")} style={{ height: 35, width: 35 }}></Image> */}
                        <Icon source={"playlist-edit"}
                            size={40}
                            color={theme.colors.onPrimaryContainer} />
                        <Text style={{
                            ...styles.HeaderText, color: theme.colors.onPrimaryContainer,
                        }}>My Notes</Text>
                    </View>

                </View>
                <Divider style={{ backgroundColor: theme.colors.outlineVariant, height: 1.5 }} />
                <Drawer.Section title={<Text style={{ fontFamily: 'Manrope-SemiBold' }}>Notes</Text>
                } showDivider={false} theme={{
                    // fonts:{titleSmall:theme.fonts.bodySmall}
                }}>
                    <Drawer.Item label="Home"
                        icon="home-outline"
                        // icon="format-list-bulleted-square"
                        theme={activeScreen === 'All Notes' ? drawerItemActiveTheme : drawerItemTheme}
                        active={activeScreen === 'All Notes'}
                        right={() => <DrawerRightComp activeName={"All Notes"} displaytxt={data.length} />}
                        onPress={() => {
                            navigation.closeDrawer(); navigation.navigate("All Notes", { previous_screen: activeScreen });
                            setActiveScreen("All Notes");
                        }} style={styles.DrawerItem}></Drawer.Item>
                    <Drawer.Item label="Voice Notes"
                        icon="volume-high"
                        // right={() => <DrawerRightComp activeName={"Bin"} displaytxt={binData.length} />}
                        theme={activeScreen === 'VoiceNote' ? drawerItemActiveTheme : drawerItemTheme}
                        active={activeScreen === 'VoiceNote'}
                        onPress={() => navScr('VoiceNoteScreen')} style={styles.DrawerItem}></Drawer.Item>
                    <Drawer.Item label="Starred"
                        icon="star-outline"
                        // right={() => <DrawerRightComp activeName={"Bin"} displaytxt={binData.length} />}
                        theme={activeScreen === 'Starred' ? drawerItemActiveTheme : drawerItemTheme}
                        active={activeScreen === 'Starred'}
                        onPress={() => navScr('Starred')} style={styles.DrawerItem}></Drawer.Item>
                    <Drawer.Item label="Bin"
                        icon="trash-can-outline"
                        right={() => <DrawerRightComp activeName={"Bin"} displaytxt={binData.length} />}
                        theme={activeScreen === 'Bin' ? drawerItemActiveTheme : drawerItemTheme}
                        active={activeScreen === 'Bin'}
                        onPress={() => navScr('Bin')} style={styles.DrawerItem}></Drawer.Item>
                    {/* <Drawer.Item label="Test Screen"
                        icon="label-outline"
                        right={() => <DrawerRightComp activeName={"Test"} displaytxt={binData.length} />}
                        theme={activeScreen === 'Test' ? drawerItemActiveTheme : drawerItemTheme}
                        active={activeScreen === 'Test'}
                        onPress={() => navScr('TestScreen')} style={styles.DrawerItem}></Drawer.Item> */}
                </Drawer.Section >
                {/* <Divider style={{ backgroundColor: theme.colors.outlineVariant, height: 0.7 }} /> */}

                <Menu anchor={
                    <TouchableRipple
                        onPress={() => toggleGroupsAccordian()}>
                        <View style={{
                            flexDirection: 'row',
                            paddingHorizontal: 28,
                            height: 56,
                            alignItems: 'center'
                        }}>
                            <Text style={{ width: 226 }}>Groups</Text>
                            <Animated.View style={groupsChevronStyle}>
                                <Icon source={"chevron-down"} size={24} />
                            </Animated.View>
                        </View>
                    </TouchableRipple>
                }>

                </Menu>
                < Animated.View style={groupsAccordianStyle}>
                    {
                        groupList.map((item, index) => {
                            return (
                                <Drawer.Item key={groupList.indexOf(item)} label={item}
                                    icon="layers-outline"
                                    // right={() => <DrawerRightComp activeName={item} displaytxt={groupBadges[index]} />}
                                    theme={activeScreen === item ? drawerItemActiveTheme : drawerItemTheme}
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
                        })
                    }
                </Animated.View >

                < Drawer.Item label="Edit Groups"
                    icon="pencil-outline"
                    theme={activeScreen === 'AddGroup' ? drawerItemActiveTheme : drawerItemTheme}
                    active={activeScreen === 'AddGroup'}
                    onPress={() => {
                        navigation.closeDrawer(); navigation.navigate('Groups', { previous_screen: activeScreen })
                        setActiveScreen('AddGroup')
                    }} style={styles.DrawerItem} />

                {/* <Divider style={{ backgroundColor: theme.colors.outlineVariant, height: 0.7 }} /> */}
                < Drawer.Section title='App' theme={{ fonts: { labelSmall: { fontWeight: '100' } } }} showDivider={false} >
                    <Drawer.Item label="Settings"
                        icon="cog-outline"
                        theme={activeScreen === 'Settings' ? drawerItemActiveTheme : drawerItemTheme}

                        active={activeScreen === 'Settings'}
                        onPress={() => {
                            navigation.closeDrawer(); navigation.navigate('Settings', { previous_screen: activeScreen })
                            setActiveScreen('Settings');
                        }} style={styles.DrawerItem}></Drawer.Item>
                    <Drawer.Item label="About"
                        //  theme={{ fonts: { labelLarge: { fontWeight: '100' } } }}
                        icon="account-circle-outline"
                        theme={activeScreen === 'About' ? drawerItemActiveTheme : drawerItemTheme}

                        active={activeScreen === 'About'}
                        onPress={() => {
                            navigation.closeDrawer(); navigation.navigate('About', { previous_screen: activeScreen });
                            setActiveScreen('About');
                        }} style={styles.DrawerItem} />
                    {/* <Drawer.Item label="Test Screen"
                    //  theme={{ fonts: { labelLarge: { fontWeight: '100' } } }}
                    icon="account-circle-outline"
                    theme={activeScreen === 'All Notes' ? drawerItemActiveTheme : drawerItemTheme}
                    active={activeScreen === 'Scr'}
                    onPress={() => {
                        navigation.closeDrawer();
                        navigation.navigate(
                            'testscr',
                            { previous_screen: activeScreen });
                    }} style={styles.DrawerItem}>
                </Drawer.Item> */}
                </Drawer.Section >
            </Animated.ScrollView>
        </DrawerLayout>
    );
}

const styles = StyleSheet.create({
    HeaderText: {
        fontSize: 30, maxHeight: 70,
        fontFamily: 'ComicNeue-Bold',
    },
    Header: {
        marginLeft: 20,
    },
    DrawerSection: {

    },
    DrawerItem: {
        height: 50,
    }
});
{/* <View style={{ flexDirection: 'row', paddingLeft: '10%' }}>
    <Text style={{
        ...styles.HeaderText, color: theme.colors.primary
    }}>M</Text>
    <Text style={{
        ...styles.HeaderText, color: theme.colors.primary
    }}>Y </Text>
    <Text style={{
        ...styles.HeaderText, color: theme.colors.primary
    }}>N</Text>
    <Text style={{
        ...styles.HeaderText, color: theme.colors.primary
    }}>O</Text>
    <Text style={{
        ...styles.HeaderText, color: theme.colors.primary
    }}>T</Text>
    <Text style={{
        ...styles.HeaderText, color: theme.colors.primary
    }}>E</Text>
    <Text style={{
        ...styles.HeaderText, color: theme.colors.primary
    }}>S</Text>
</View> */}