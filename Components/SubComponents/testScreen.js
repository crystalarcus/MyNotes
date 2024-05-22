import { StyleSheet, View } from "react-native";
import { Appbar, Button, List, Searchbar, Surface, Text, useTheme } from "react-native-paper";
import { MaterialSwitch } from "./MaterialSwitch";
import React, { useContext, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SwitchListItem } from "./MaterialSwitchList";
import { AppContext } from "../../AppContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function TestScr({ navigation }) {
    const { appTheme, setAppTheme, } = useContext(AppContext);
    const [value, setValue] = useState(true);
    const thisTheme = useTheme();
    return (
        <Surface style={{
            flex: 1, paddingTop: useSafeAreaInsets().top,
            backgroundColor: thisTheme.colors.surfaceContainerLowest
        }}>
            <Appbar.BackAction onPress={() => {
                navigation.goBack();
            }}></Appbar.BackAction>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <View style={styles.item}>
                    <View style={{ flexDirection: "column" }}>
                        <Text style={{ fontSize: 18 }}>{"Value : " + value.toString()}</Text>
                        <Text style={{ fontSize: 14 }}>Switch On Icon and no stretch animation</Text>
                    </View>
                    <MaterialSwitch
                        onPress={() => setValue(!value)}
                        selected={value}
                        switchOnIcon={'check'} />
                </View>
                <View style={styles.item}>
                    <View style={{ flexDirection: "column" }}>
                        <Text style={{ fontSize: 18 }}>{"Value : " + value.toString()}</Text>
                        <Text style={{ fontSize: 14 }}>No Icon and with stretch animation</Text>
                    </View>
                    <MaterialSwitch
                        stretch={true}
                        onPress={() => setValue(!value)}
                        selected={value} />
                </View>
                <View style={styles.item}>
                    <View style={{ flexDirection: "column" }}>
                        <Text style={{ fontSize: 18 }}>{"Value : " + value.toString()}</Text>
                        <Text style={{ fontSize: 14 }}>Both Switch On and Off Icons</Text>
                    </View>
                    <MaterialSwitch
                        switchOnIcon={'check'}
                        switchOffIcon={'close'}
                        selected={value}
                        onPress={() => setValue(!value)} />
                </View>


                <SwitchListItem
                    titleStyle={{ fontSize: 18 }}
                    description={"List Item Switch"}
                    title={"Value : " + value.toString()}
                    rippleColor={thisTheme.colors.primary}
                    switchIcon={'check'}
                    stretch={true}
                    selected={value}
                    onPress={() => setValue(!value)} />
               
                <SwitchListItem
                    titleStyle={{ fontSize: 18 }}
                    description={"List Item Switch"}
                    title={"Value : " + value.toString()}
                    rippleColor={thisTheme.colors.primary}
                    switchIcon={'check'}
                    switchOnIcon={'check'}
                    stretch={false}
                    selected={value}
                    onPress={() => setValue(!value)} />

                <SwitchListItem
                    switchIcon={'brightness-2'}
                    selected={appTheme == 'dark' ? true : false}
                    onPress={async () => {
                        if (appTheme == 'dark') {
                            setAppTheme('light')
                            await AsyncStorage.setItem('@appTheme', (!appTheme).toString());
                        }
                        else {
                            setAppTheme('dark')
                            await AsyncStorage.setItem('@appTheme', (!appTheme).toString());
                        }
                    }}
                    listStyle={{
                        width: '100%',
                        paddingHorizontal: 6,
                    }} title={"Dark mode"} />
            </View>
        </Surface>
    )
}

const styles = StyleSheet.create({
    item: {
        marginVertical: 20,
        width:'100%',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
        paddingHorizontal: 21
    }
})