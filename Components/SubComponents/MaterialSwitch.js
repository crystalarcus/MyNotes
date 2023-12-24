import { throttle } from "lodash";
import { useEffect, useState } from "react";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import { Icon, TouchableRipple, useTheme } from "react-native-paper"
import Animated, { Easing, interpolate, interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

export const MaterialSwitch = ({ selected, onPress, icon }) => {

    const theme = useTheme();
    const position = useSharedValue(selected ? 20 : 4);
    const handleHeight = useSharedValue(selected ? 24 : 16);
    const [active, setActive] = useState(selected)
    const [isPressed, setIsPressed] = useState(false);
    const pan = Gesture.Pan()
        .activateAfterLongPress(500)
        .runOnJS(true)
        .onStart(() => {
            handleHeight.value = withTiming(28);
            active ? position.value = withTiming(19) : position.value = withTiming(0.1)
        })
        .onChange((event) => {
            if (position.value >= 0 && position.value <= 19) {
                position.value += event.translationX / 30;
            }
        })
        .onEnd(() => {
            setIsPressed(false)
            if (position.value > 12) {
                handleHeight.value = withTiming(24);
                position.value = withTiming(20);
                setActive(false)
                onSwitchPress();
            }
            else {
                handleHeight.value = withTiming(16);
                position.value = withTiming(4);
                setActive(true);
                onSwitchPress();
            }
        })
    const handleOutlineStyle = useAnimatedStyle(() => ({
        backgroundColor: theme.colors.onPrimaryContainer,
        height: 40, width: 40, borderRadius: 20,
        opacity: isPressed ? 0.3 : interpolate(
            position.value,
            [4, 4.1, 19.9, 20],
            [0, 0.28, 0.28, 0]
        )
    }))
    const handleStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: position.value }],
        marginLeft: 2,
        height: handleHeight.value,
        marginVertical: 'auto',
        width: handleHeight.value,
        backgroundColor: interpolateColor(
            position.value,
            [8, 16],
            [theme.colors.outline, theme.colors.onPrimary,]
        ),
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center'
    }))
    const trackStyle = useAnimatedStyle(() => ({
        borderRadius: 20,
        backgroundColor: interpolateColor(
            position.value,
            [8, 16],
            [theme.colors.surfaceVariant, theme.colors.primary],
        ),
        borderColor: interpolateColor(
            position.value,
            [8, 16],
            [theme.colors.outline, theme.colors.primary],
        ),
        borderWidth: 2,
        borderRadius: 16,
        justifyContent: 'center',
        height: 32,
        width: 52,
    }))
    const changeSwitch = () => {
        if (active) {
            position.value = withTiming(4, { duration: 250, easing: Easing.circle });
            handleHeight.value = withTiming(16, { duration: 100, });
            setActive(false);
        }
        else {
            position.value = withTiming(20, { duration: 250, easing: Easing.circle });
            handleHeight.value = withTiming(24, { duration: 100, });
            setActive(true);
        }
    }
    const onSwitchPress = () => {
        onPress != null ? onPress() : null;
    }
    useEffect(() => {
        if (active != selected) {
            changeSwitch();
        }
    })
    return (
        <Animated.View style={trackStyle}>
            <GestureHandlerRootView>
                <GestureDetector gesture={pan}>
                    <TouchableRipple style={{
                        justifyContent: 'center',
                        height: 32,
                        width: 52,
                    }}
                        rippleColor={"transparent"}
                        onPress={throttle(() => onSwitchPress(), 200, { trailing: false })}>
                        <Animated.View style={handleStyle} >
                            <Animated.View style={handleOutlineStyle}>
                                {active && icon != null ? <Icon source={icon} /> : null}
                            </Animated.View>
                        </Animated.View>
                    </TouchableRipple>
                </GestureDetector>
            </GestureHandlerRootView>

        </Animated.View >

    )
}
