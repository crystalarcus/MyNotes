import { View } from "react-native";
import { Appbar, Button, Surface, Text } from "react-native-paper";
import { MaterialSwitch } from "./MaterialSwitch";
import { useState } from "react";

export function TestScr({ navigation }) {
    const [value, setValue] = useState(true);
    return (
        <Surface style={{ flex: 1, paddingTop: 20 }}>
            <Appbar.BackAction onPress={() => {
                navigation.goBack();
            }}></Appbar.BackAction>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20 }}>
                <Text>{"Value : " + value}</Text>
                <MaterialSwitch selected={value} onPress={() => {
                    setValue(!value)
                }} />
                <Button onPress={() => setValue(!value)}>Change</Button>
            </View>
        </Surface>
    )
}