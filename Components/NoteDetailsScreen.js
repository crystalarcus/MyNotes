import Animated, { Easing, FadeInDown, FadeOutDown, runOnJS, withDelay, withTiming } from 'react-native-reanimated'
import { Appbar, Divider, List, Text, useTheme } from 'react-native-paper'
import { useEffect, useState } from 'react';
import { BackHandler, StyleSheet } from 'react-native';

export const NoteDetails = ({ navigation, route }) => {
    const thisTheme = useTheme();
    const [visible, setVisible] = useState(true);
    const goBack = () => navigation.goBack()
    const enteringAnim = () => {
        'worklet';
        const animations = {
            transform: [
                { translateY: withTiming(0, { duration: 300, easing: Easing.bezier(0.05, 0.7, 0.1, 1) }) }
            ],
            opacity: withTiming(1, { duration: 50 })
        }
        const initialValues = {
            transform: [
                { translateY: 400 }],
            opacity: 0
        }
        return {
            initialValues,
            animations
        }
    }
    const exitingAnim = () => {
        'worklet';
        const animations = {
            transform: [
                { translateY: withTiming(200, { duration: 150, easing: Easing.bezier(0.3, 0, 0.8, 0.15) }) }
            ],
            opacity: withDelay(50, withTiming(0, { duration: 100 }))
        }
        const initialValues = {
            transform: [
                { translateY: 0 }],
            opacity: 1
        }
        const callback = (finished) => {
            'worklet';
            if (finished) {
                runOnJS(goBack)()
            }
        }
        return {
            initialValues,
            animations,
            callback
        }
    }
    function handleGoBack() {
        setVisible(false)
        return true;
    }
    useEffect(() => {
        BackHandler.addEventListener('hardwareBackPress', handleGoBack);
        return () => BackHandler.removeEventListener('hardwareBackPress', handleGoBack);
    }, []);
    if (visible) {
        return (
            <Animated.View entering={enteringAnim}
                exiting={exitingAnim}
                style={{ backgroundColor: thisTheme.colors.elevation.level2, flex: 1 }}>
                <Appbar.Header style={{ backgroundColor: 'transparent' }}>
                    <Appbar.BackAction onPress={() => { setVisible(false) }} />
                    <Appbar.Content title='Details' />
                </Appbar.Header>

                <List.Item title={route.params.noteDetails.title}
                    style={{ borderBottomWidth: 1, borderBottomColor: thisTheme.colors.outlineVariant }}
                    titleStyle={[styles.titleStyle, { fontSize: 21 }]}
                    titleNumberOfLines={1000}
                    description={'Title'} />

                <List.Item title={route.params.noteDetails.fullDate + ", " + route.params.noteDetails.timeCreated}
                    style={{ borderBottomWidth: 1, borderBottomColor: thisTheme.colors.outlineVariant }}
                    titleStyle={styles.titleStyle}
                    titleNumberOfLines={1000}
                    description={'Date created'} />

                <List.Item title={route.params.noteDetails.modified}
                    style={{ borderBottomWidth: 1, borderBottomColor: thisTheme.colors.outlineVariant }}
                    titleStyle={styles.titleStyle}
                    titleNumberOfLines={1000}
                    description={'Date Modified'} />
                <Text style={{ fontSize: 18, margin: 15 }}>Groups</Text>
                {
                    route.params.noteDetails.groups.map((item, index) =>
                        <List.Item title={item}
                            style={{ paddingHorizontal: 20, paddingVertical: 0 }}
                            left={() => <List.Icon icon={'circle-medium'} />}
                            key={index} />)
                }
                <Divider style={{ backgroundColor: thisTheme.colors.outline, marginVertical: 20 }} />
            </Animated.View>
        )
    }
}
const styles = StyleSheet.create({
    titleStyle: {
        fontSize: 18,
        lineHeight: 36
    }
})