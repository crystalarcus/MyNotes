import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { Appbar, FAB, Surface, Tooltip, useTheme } from 'react-native-paper';
import { IconSource } from 'react-native-paper/lib/typescript/components/Icon';
import Animated, { Easing, EntryAnimationsValues, SlideInDown, SlideInUp, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BOTTOM_APPBAR_HEIGHT = 72;
const MEDIUM_FAB_HEIGHT = 56;
type actionButton = {
    icon: IconSource,
    onPress: () => void,
    title?: string,
}
export const BottomAppbar = ({ Actions, FabIcon, onFabPress, FabToolTip, hidden }:
    { Actions: actionButton[], FabIcon: IconSource, onFabPress: () => void, FabToolTip?: string, hidden?: boolean }) => {
    const { bottom } = useSafeAreaInsets();
    const theme = useTheme();
    if (hidden) { return null }
    const enteringAnim = (targetValues: EntryAnimationsValues) => {
        'worklet';
        const animations = {
            transform: [{ translateY: withTiming(0, { duration: 500, easing: Easing.bezier(0.05, 0.7, 0.1, 1) }) }],
        }
        const initialValues = {
            transform: [{ translateY: BOTTOM_APPBAR_HEIGHT }],
        }
        return {
            initialValues,
            animations
        }
    }
    const exitingAnim = (targetValues: EntryAnimationsValues) => {
        'worklet';
        const animations = {
            transform: [{ translateY: withTiming(70, { duration: 450, easing: Easing.bezier(0.05, 0.7, 0.1, 1) }) }],
        }
        const initialValues = {
            transform: [{ translateY: 0 }],
        }
        return {
            initialValues,
            animations
        }
    }
    return (
        <Animated.View entering={enteringAnim} exiting={exitingAnim}>
            <Appbar
                style={[
                    styles.bottom,
                    {
                        height: BOTTOM_APPBAR_HEIGHT + bottom,
                        backgroundColor: theme.colors.elevation.level2,
                        paddingBottom: bottom,
                    },
                ]}
            >
                {
                    Actions.length ?
                        Actions.map((item, index) => (
                            <Tooltip title={item.title}
                                key={index} >
                                <Appbar.Action
                                    accessibilityLabel='abc'
                                    icon={item.icon}
                                    onPress={item.onPress} />
                            </Tooltip>
                        )) : null
                }
                <View style={[
                    styles.fab,
                    { top: (BOTTOM_APPBAR_HEIGHT - MEDIUM_FAB_HEIGHT) / 2 },
                ]}>
                    <Tooltip title={FabToolTip}>
                        <Surface style={{borderRadius:16}}>
                            <FAB
                                // style={{backgroundColor:theme.colors.primary}}
                                // color={theme.colors.onPrimary}
                                mode="flat"
                                size="medium"
                                icon={FabIcon}
                                onPress={onFabPress}
                            />
                        </Surface>
                    </Tooltip>
                </View>


            </Appbar>
        </Animated.View >
    );
}

const styles = StyleSheet.create({
    bottom: {
        backgroundColor: 'pink',
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
    },
    fab: {
        position: 'absolute',
        right: 16,
    },
});
