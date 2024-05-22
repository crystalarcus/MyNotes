import React, { useCallback, useEffect } from "react";
import { View, TouchableWithoutFeedback, Platform } from "react-native";
import { MD3Theme } from "react-native-paper";
import Animated, { CurvedTransition, Easing, Extrapolation, FadeIn, interpolate, interpolateColor, runOnJS, useAnimatedStyle, useSharedValue, withDelay, withTiming } from "react-native-reanimated";

// export const DialogButton = ({ touchable, props, children, setTouchable }) => {
//     return (
//         <Animated.View entering={ZoomIn.delay(50).withInitialValues({ transform: [{ scale: 0.5 }] })}>
//             <Button disabled={!touchable} style={{
//                 padding: 2, borderRadius: 40, borderColor: thisTheme.colors.primary,
//                 width: 250, paddingHorizontal: 15,
//             }}
//                 mode={props.mode}
//                 onPress={props.onPress}>
//                 <Text>
//                     {props.text}
//                 </Text>
//             </Button>
//         </Animated.View>
//     )
// }
type Props = {
    visible: boolean,
    setVisible: (value: boolean) => void,
    touchable: boolean,
    animationType?: 'slide' | 'fade',
    backDropDisabled?: boolean,
    backgroundColor?: string,
    thisTheme: MD3Theme,
    children: any,
    setTouchable: (value: boolean) => void
}
export const AnimatedDialog = ({ visible, setVisible,
    backDropDisabled,
    touchable, animationType, backgroundColor,
    thisTheme, children, setTouchable }: Props) => {
    const callbackF = () => setVisible(false)
    const AnimatedValue = useSharedValue(0);

    const BackDropStyle = useAnimatedStyle(() => ({
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        opacity: 1,
        backgroundColor: interpolateColor(
            AnimatedValue.value,
            [0, 1],
            ['#0000', '#0006']
        ),
        alignItems: 'center',
        justifyContent: 'center',
    }))
    const outlineView = useAnimatedStyle(() => ({
        backgroundColor: backgroundColor ? backgroundColor : thisTheme.colors.elevation.level3,
        borderRadius: 28,
        width: '85%',
        overflow: 'hidden',
        elevation: interpolate(
            AnimatedValue.value,
            [0, 1],
            [0, 50]
        ),
        maxWidth: Platform.OS == 'web' ? 400 : 800
    }))
    const enteringSlide = useCallback((targetValues) => {
        'worklet';
        const animations = {
            transform: [{ translateY: withTiming(0, { duration: 450, easing: Easing.bezier(0.05, 0.7, 0.1, 1) }) }],
            height: withTiming(targetValues.targetHeight, { duration: 450, easing: Easing.bezier(0.05, 0.7, 0.1, 1) }),
            // opacity: withTiming(1, { duration: 50 })
        }
        const initialValues = {
            transform: [{ translateY: -80 }],
            height: 40,
            // opacity: 0,
        }
        return {
            initialValues,
            animations
        }
    }, [])
    const enteringFade = useCallback((targetValues) => {
        'worklet';
        const animations = {
            transform: [{ scale: withTiming(1, { duration: 450, easing: Easing.bezier(0.05, 0.7, 0.1, 1) }) }],
            opacity: withTiming(1, { duration: 80 }),
        }
        const initialValues = {
            transform: [{ scale: 0.6 }],
            opacity: 0
        }
        return {
            initialValues,
            animations
        }
    }, [])
    const exitingSlide = useCallback((values) => {
        'worklet';
        const animations = {
            transform: [{ translateY: withTiming(-50, { duration: 150, easing: Easing.bezier(0.39, 0.02, 0.17, 0.91) }) }],
            height: withTiming(0, { duration: 150, easing: Easing.bezier(0.39, 0.02, 0.17, 0.91) }),
            opacity: withTiming(0, { duration: 150 })
        }
        const initialValues = {
            height: values.currentHeight,
            transform: [{ translateY: 0 }],

            opacity: 1
        }
        return {
            initialValues,
            animations
        }
    }, [])
    const exitingFade = useCallback((values) => {
        'worklet';
        const animations = {
            transform: [{ scale: withTiming(0.8, { duration: 150, easing: Easing.bezier(0.39, 0.02, 0.17, 0.91) }) }],
            opacity: withTiming(0, { duration: 150 })
        }
        const initialValues = {
            transform: [{ scale: 1 }],
            opacity: 1
        }
        return {
            initialValues,
            animations
        }
    }, [])

    useEffect(() => {
        if (touchable) {
            AnimatedValue.value = withTiming(1, { duration: 500 })
        }
        if (!touchable) {
            AnimatedValue.value = withTiming(0, { duration: 200 }, () => {
                'worklet';
                runOnJS(callbackF)();
            });
        }
    }, [visible, touchable, JSON.stringify(thisTheme.colors.primary)])
    if (!visible) return null;
    return (
        <TouchableWithoutFeedback onPress={() => setTouchable(false)} disabled={backDropDisabled}>
            <Animated.View style={BackDropStyle}>
                <TouchableWithoutFeedback disabled={backDropDisabled}>
                    {touchable ?
                        <Animated.View key={2} entering={animationType == 'slide' ? enteringSlide : enteringFade}
                            exiting={Platform.OS == 'web' ? null : animationType == 'slide' ? exitingSlide : exitingFade}
                            layout={CurvedTransition}
                            pointerEvents={'box-none'}
                            style={outlineView} >
                            <Animated.View children={children}
                                entering={FadeIn.duration(100).delay(50)}>

                            </Animated.View>
                        </Animated.View > : <View></View>
                    }

                </TouchableWithoutFeedback>
            </Animated.View>
        </TouchableWithoutFeedback>
    );
}

