import { useCallback, useEffect } from "react";
import { View } from "react-native";
import { Button, Text, Snackbar, useTheme, Surface } from "react-native-paper";
import Animated, { Easing, EntryAnimationsValues, ExitAnimationsValues, runOnJS, withDelay, withTiming } from "react-native-reanimated";

type Props = {
    visible: boolean,
    setVisible: (value: boolean) => void,
    doOnDismiss?: () => void,
    label: string,
    buttonLabel: string,
    onButtonPress: () => void,
    duration?: number,
    bottomMargin: number
}

export const SnackBarAnimated = ({ visible, setVisible, doOnDismiss,
    label, buttonLabel, onButtonPress, duration, bottomMargin }: Props) => {

    const theme = useTheme();
    const enteringAnim = useCallback((targetValues: EntryAnimationsValues) => {
        'worklet';
        const animations = {
            height: withTiming(targetValues.targetHeight, { duration: 550, easing: Easing.bezier(0.05, 0.7, 0.1, 1) }),
            transform: [{
                translateY: withTiming(0, { duration: 550, easing: Easing.bezier(0.05, 0.7, 0.1, 1) })
            }],
            opacity: withTiming(1, { duration: 50 }),
        }
        const initialValues = {
            transform: [{ translateY: 45 }],
            height: 0,
            opacity: 0
        }
        return {
            initialValues,
            animations
        }
    }, [])
    const exitingAnim = useCallback((values: ExitAnimationsValues) => {
        'worklet';
        const animations = {
            height: withTiming(0, { duration: 200, easing: Easing.bezier(0.3, 0, 0.8, 0.15) }),
            transform: [{ translateY: withTiming(values.currentHeight, { duration: 200, easing: Easing.bezier(0.3, 0, 0.8, 0.15) }) }],
            opacity: withDelay(150, withTiming(0, { duration: 50 })),
        }
        const initialValues = {
            transform: [{ translateY: 0 }],
            height: values.currentHeight,
            opacity: 1,
        }
        const callback = (finished: boolean) => {
            'worklet';
            doOnDismiss ?
                runOnJS(doOnDismiss)() : null
        }
        return {
            initialValues,
            animations,
            callback
        }
    }, [])
    useEffect(() => {
        if (visible) {
            setTimeout(() => {
                setVisible(false)
            }, duration ? duration : 2500);
        }
    }, [visible])
    if (visible) {
        return (
            <Animated.View entering={enteringAnim}
                style={{
                    overflow: 'hidden',
                    width: '100%',
                    alignSelf: 'flex-end',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    bottom: bottomMargin,
                }}
                exiting={exitingAnim}>
                <Surface elevation={3} style={{
                    width: '90%',
                    backgroundColor: theme.colors.inverseSurface,
                    minHeight: 48,
                    maxHeight: 68,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderRadius: 4,
                    paddingLeft: 16,
                    paddingRight: 8,
                }}>
                    <Text style={{
                        fontSize: 14,
                        fontFamily: 'Manrope-SemiBold',
                        lineHeight: 20,
                        color: theme.colors.inverseOnSurface,
                        maxWidth: '70%'
                    }}>{label}</Text>
                    <Button onPress={() => {
                        onButtonPress()
                        setVisible(false)
                    }} labelStyle={{ color: theme.colors.inversePrimary }}>{buttonLabel}</Button>
                </Surface>
            </Animated.View >)
    }
}
