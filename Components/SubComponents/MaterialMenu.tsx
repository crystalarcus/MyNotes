import React, { Fragment, isValidElement, useEffect, useRef, useState } from "react";
import {
    Dimensions,
    I18nManager,
    Keyboard,
    LayoutRectangle,
    NativeEventSubscription,
    Platform,
    Pressable,
    ScrollView,
    ScrollViewProps,
    StyleProp,
    StyleSheet,
    View,
    ViewStyle
} from "react-native"
import { Portal, Surface, useTheme } from "react-native-paper";
import { APPROX_STATUSBAR_HEIGHT } from "react-native-paper/src/constants";
import { InternalTheme } from "react-native-paper/src/types";
import { BackHandler } from "react-native-paper/src/utils/BackHandler/BackHandler";
import { addEventListener } from "react-native-paper/src/utils/addEventListener";
import Animated, { Easing, interpolate, runOnJS, useAnimatedStyle, useSharedValue, withDelay, withTiming } from "react-native-reanimated";

const WINDOW_LAYOUT = Dimensions.get('window');
const SCREEN_INDENT = 8;
const ANIMATION_DURATION_Short = 250;
const ANIMATION_DURATION_Long = 350;
// From the 'Standard easing' section of https://material.io/design/motion/speed.html#easing
const EASING = Easing.bezier(0.05, 0.7, 0.1, 1);

export const MaterialMenu = ({ visible, anchor, onDismiss, contentStyle,
    keyboardShouldPersistTaps, children,
    statusBarHeight = APPROX_STATUSBAR_HEIGHT, style, scaleXAnimation }: Props) => {

    const menu = useRef<View>();
    const theme = useTheme();
    let backHandlerSubscription: NativeEventSubscription | undefined;
    let dimensionsSubscription: NativeEventSubscription | undefined;
    const isCoordinate = (anchor: any): anchor is { x: number; y: number } =>
        !isValidElement(anchor) &&
        typeof anchor?.x === 'number' &&
        typeof anchor?.y === 'number';

    // States
    const [top, setTop] = useState<number>(0);
    const [left, setLeft] = useState<number>(0);
    const [renderd, setRendered] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState<number>(0);
    const [menuLayout, setMenuLayout] = useState<{ width: number, height: number }>({ width: 0, height: 0 });
    const [anchorLayout, setAnchorLayout] = useState<LayoutRectangle>({ width: 500, height: 500, x: 100, y: 100 });
    const [windowLayout, setWindowLayout] = useState({
        width: WINDOW_LAYOUT.width,
        height: WINDOW_LAYOUT.height,
    });

    // Animated Values 
    const opacity = useSharedValue<number>(0);
    const scaleX = useSharedValue<number>(0);
    const scaleY = useSharedValue<number>(0);
    let scrollableMenuHeight = 0;


    //#region 
    // Objects
    const additionalVerticalValue = Platform.select({
        android: statusBarHeight,
        default: 0,
    });

    const pointerEvents = visible ? 'box-none' : 'none';

    const positionStyle = {
        top: isCoordinate(anchor) ? top : top + additionalVerticalValue,
        ...(I18nManager.getConstants().isRTL ? { right: left } : { left: anchorLayout.x }),
    };
    //#endregion


    const animatedStyle = useAnimatedStyle(() => ({

    }))

    // Functions
    // const measureMenuLayout = () =>
    //     new Promise<LayoutRectangle>((resolve) => {
    //         if (menu) {
    //             menu.current.measureInWindow((x, y, width, height) => {
    //                 resolve({ x, y, width, height });
    //             });
    //         }
    //     });

    // const measureAnchorLayout = () =>
    //     new Promise<LayoutRectangle>((resolve) => {
    //         if (isCoordinate(anchor)) {
    //             resolve({ x: anchor.x, y: anchor.y, width: 0, height: 0 });
    //             return;
    //         }

    //         // if (anchor) {
    //         //     anchor.measureInWindow((x, y, width, height) => {
    //         //         resolve({ x, y, width, height });
    //         //     });
    //         // }
    //     });

    const isBrowser = () => Platform.OS === 'web' && 'document' in global;
    const enteringAnim = (targetValues: any) => {
        'worklet';
        const animations = {
            transform: [
                {
                    scaleX: withTiming(1, {
                        duration: scaleXAnimation ?
                            ANIMATION_DURATION_Short :
                            ANIMATION_DURATION_Long * theme.animation.scale,
                        easing: EASING
                    }),
                },
                {
                    scaleY: withTiming(1, {
                        duration: scaleXAnimation ?
                            ANIMATION_DURATION_Short :
                            ANIMATION_DURATION_Long * theme.animation.scale,
                        easing: EASING
                    })
                },
                {
                    translateX: withTiming(0, {
                        duration: scaleXAnimation ?
                            ANIMATION_DURATION_Short :
                            ANIMATION_DURATION_Long * theme.animation.scale,
                        easing: EASING
                    }),
                },
                {
                    translateY: withTiming(0, {
                        duration: scaleXAnimation ?
                            ANIMATION_DURATION_Short :
                            ANIMATION_DURATION_Long * theme.animation.scale,
                        easing: EASING
                    })
                }
            ],
            opacity: withTiming(1, {
                duration: scaleXAnimation ?
                    ANIMATION_DURATION_Short :
                    ANIMATION_DURATION_Long * theme.animation.scale,
                easing: EASING,
            })
        }
        const initialValues = {
            transform: [
                { scaleX: 0 },
                { scaleY: 0 },
                {
                    translateX: (left <= windowLayout.width - menuLayout.width - SCREEN_INDENT) ?
                        -(menuLayout.width) : menuLayout.width
                }, {
                    translateY: (top <=
                        windowLayout.height -
                        menuLayout.height -
                        SCREEN_INDENT -
                        additionalVerticalValue ||
                        // Or if the menu overflows from bottom side
                        (top >=
                            windowLayout.height -
                            menuLayout.height -
                            SCREEN_INDENT -
                            additionalVerticalValue &&
                            // And bottom side of the screen has more space than top side
                            top <= windowLayout.height - top)) ?
                        -((scrollableMenuHeight || menuLayout.height) / 2) :
                        ((scrollableMenuHeight || menuLayout.height) / 2)
                }],
            opacity: 0
        }
        return {
            initialValues,
            animations
        }
    }

    const shadowMenuContainerStyle = useAnimatedStyle(() => ({
        opacity: 1,
        borderRadius: theme.roundness,
        ...(!theme.isV3 && { elevation: 8 }),
    }));

    useEffect(() => {
        console.log(anchorLayout.x);
    }, [visible]);

    return (
        <View collapsable={false}
            onLayout={(event) => {
                setAnchorLayout(event.nativeEvent.layout);
                console.log("anchor : " + JSON.stringify(event.nativeEvent.layout));
            }}>
            {isCoordinate(anchor) ? null : anchor}
            {visible ?
                <Portal>
                    <Pressable accessibilityLabel="Close menu"
                        accessibilityRole="button"
                        onPress={onDismiss}
                        style={styles.pressableOverlay}>
                        <View ref={menu}
                            onLayout={(event) => {
                                const { width, height } = event.nativeEvent.layout;
                                setMenuLayout({ width: width, height: height });
                                console.log("menu : " + JSON.stringify(event.nativeEvent.layout));
                            }}
                            collapsable={false}
                            accessibilityViewIsModal={renderd}
                            style={[styles.wrapper, positionStyle, style]}
                            pointerEvents={pointerEvents}
                            onAccessibilityEscape={onDismiss}>

                            <Animated.View key={222}
                                entering={enteringAnim}
                                pointerEvents={pointerEvents}
                                style={[
                                    styles.shadowMenuContainer,
                                    shadowMenuContainerStyle,
                                    theme.isV3 && {
                                        backgroundColor: theme.colors.surfaceVariant,
                                    },
                                    contentStyle,
                                ]}
                                {...(theme.isV3 && { elevation: 2 })}
                            // theme={theme}
                            >
                                {(scrollableMenuHeight && (
                                    <ScrollView
                                        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
                                    >
                                        {children}
                                    </ScrollView>
                                )) || <Fragment>{children}</Fragment>}
                            </Animated.View>

                        </View>
                    </Pressable>
                </Portal> : null}
        </View>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
    },
    shadowMenuContainer: {
        opacity: 1,
        paddingVertical: 8,
    },
    pressableOverlay: {
        ...StyleSheet.absoluteFillObject,
        ...(Platform.OS === 'web' && {
            cursor: 'default',
        }),
        width: '100%',
    },
});

type Props = {
    /**
     * Whether the Menu is currently visible.
     */
    visible: boolean;
    /**
     * The anchor to open the menu from. In most cases, it will be a button that opens the menu.
     */
    anchor: React.ReactNode | { x: number; y: number };
    /**
     * Whether the menu should open at the top of the anchor or at its bottom.
     * Applied only when anchor is a node, not an x/y position.
     */
    anchorPosition?: 'top' | 'bottom';
    /**
     * Extra margin to add at the top of the menu to account for translucent status bar on Android.
     * If you are using Expo, we assume translucent status bar and set a height for status bar automatically.
     * Pass `0` or a custom value to and customize it.
     * This is automatically handled on iOS.
     */
    statusBarHeight?: number;
    /**
     * Callback called when Menu is dismissed. The `visible` prop needs to be updated when this is called.
     */
    onDismiss?: () => void;
    /**
     * Accessibility label for the overlay. This is read by the screen reader when the user taps outside the menu.
     */
    overlayAccessibilityLabel?: string;
    /**
     * Content of the `Menu`.
     */
    children: React.ReactNode;
    /**
     * Style of menu's inner content.
     */
    contentStyle?: StyleProp<ViewStyle>;
    style?: StyleProp<ViewStyle>;
    /**
     * @optional
     */
    theme: InternalTheme;
    /**
     * Inner ScrollView prop
     */
    keyboardShouldPersistTaps?: ScrollViewProps['keyboardShouldPersistTaps'];
    /**
     * testID to be used on tests.
     */
    testID?: string;

    scaleXAnimation?: boolean;
};