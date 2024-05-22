import { Appbar, Text, useTheme, Button, Portal, Checkbox, IconButton } from "react-native-paper";
import { View, BackHandler } from "react-native";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../AppContext";
import { StyleSheet } from "react-native";
import Animated, { CurvedTransition, Easing, ZoomIn, ZoomInDown, interpolateColor, runOnJS, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withDelay, withTiming } from "react-native-reanimated";
import { throttle } from "lodash";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BinRenderItem } from "./SubComponents/BinRenderItem";
import LottieView from "lottie-react-native";
import { ClearBinDialog, DeleteDialog, MultiDeleteDialog, MultiRestoreDialog, RestoreAllDialog, RestoreDialog } from "./SubComponents/BinDialogs";
import { SnackBarAnimated } from "./SubComponents/AnimatedSnackBar";
import Menu from "./SubComponents/Menu";

export const Bin = ({ navigation, route }) => {

    //#region 
    const [visible, setVisible] = useState(true)
    const { data, binData, setBinData, setActiveScreen,
        groupList, setGroupList, sortOrder } = useContext(AppContext);
    const previous_screen = route.params.previous_screen;
    const thisTheme = useTheme();
    const [isRestoreDialogVisible, setIsRestoreDialogVisible] = useState(false);
    const [isDeleteDialogVisible, setIsDeleteDialogVisible] = useState(false);
    const [isMultiRestoreDialogVisible, setIsMultiRestoreDialogVisible] = useState(false);
    const [isMultiDeleteDialogVisible, setIsMultiDeleteDialogVisible] = useState(false);
    const [isClearBinDialogVisible, setIsClearBinDialogVisible] = useState(false);
    const [isRestoreAllVisible, setIsRestoreAllVisible] = useState(false);
    const [isSnackVisible, setSnackVisible] = useState(false);
    const [deleteMenuVisible, setDeleteMenuVisible] = useState(false);
    const [dialogTouchable, setDialogTouchable] = useState(false);
    const [restoredGrps, setRestoredGrps] = useState([]);
    const [actionKey, setActionKey] = useState(-1);
    const [selectedNotes, setSelectedNotes] = useState([])
    const [selected, setSelected] = useState([])
    const insetTop = useSafeAreaInsets().top;

    const ListEmptyComp = () => {
        return (
            <View style={{ flex: 1, alignItems: 'center', paddingTop: '60%', marginTop: "10%" }}>
                {/* <Image style={{ width: 300, marginTop: 100, height: 200, resizeMode: 'cover' }}
                    source={require('../assets/images/empty-bin.png')} /> */}
                <LottieView style={{ marginBottom: 30 }}
                    autoPlay
                    speed={0.5}
                    loop
                    source={require('../assets/BinAnimation.json')} />
                <Text variant='headlineMedium'
                    style={{ ...styles.ListEmptyCompText, color: thisTheme.colors.onPrimaryContainer, }}>There's nothing here</Text>
                <Text
                    style={{
                        color: thisTheme.colors.outline, fontFamily: 'Manrope',
                        fontSize: 17
                    }}>You have no notes inside Bin</Text>
            </View>
        );
    }
    const ScrollY = useSharedValue(0);

    const AnimatedHeaderStyle = useAnimatedStyle(() => ({
        backgroundColor: selected.length ?
            thisTheme.colors.elevation.level2 : interpolateColor(
                ScrollY.value,
                [50, 80],
                [thisTheme.colors.surface, thisTheme.colors.elevation.level2],
            ),
        paddingTop: insetTop + 10,
        paddingHorizontal: 10,
        paddingBottom: 10,
        height: 90,
        justifyContent: 'center'
    }))
    const SurfaceStyle = useAnimatedStyle(() => ({ flex: 1, backgroundColor: thisTheme.colors.surface }))

    const scrollHandler = useAnimatedScrollHandler((event) => {
        ScrollY.value = event.contentOffset.y;
    });
    const appBarEntering = () => {
        'worklet';
        const animations = {
            transform: [{ scale: withTiming(1, { duration: 210 }) }],
            opacity: withTiming(1)
        }
        const initialValues = {
            transform: [{ scale: 1.2 }],
            opacity: 0
        }
        return {
            initialValues,
            animations
        }
    }
    const selectedBarEntering = () => {
        'worklet';
        const animations = {
            transform: [{ scale: withTiming(1, { duration: 210 }) }],
            opacity: withTiming(1)

        }
        const initialValues = {
            transform: [{ scale: 0.8 }],
            opacity: 0
        }
        return {
            initialValues,
            animations
        }
    }
    function handleGoBack() {
        setVisible(false)
        return true;
    }
    const callbackF = () => {
        navigation.goBack();
        setActiveScreen(previous_screen);
    }
    const enteringAnim = () => {
        'worklet';
        const animations = {
            transform: [{ scale: withTiming(1, { duration: 500, easing: Easing.bezier(0.05, 0.7, 0.1, 1) }) }],

        }
        const initialValues = {
            transform: [{ scale: 0.5 }],
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
                { scale: withTiming(0.8, { duration: 300, easing: Easing.bezier(0.3, 0, 0.8, 0.15) }) },
            ],
            opacity: withDelay(100, withTiming(0, { duration: 200 }))
        }
        const initialValues = {
            transform: [{ scale: 1 }],
            opacity: 1
        }
        const callback = (finished: boolean) => {
            'worklet';
            if (finished) {
                runOnJS(callbackF)()
            }
        }
        return {
            initialValues,
            animations,
            callback
        }
    }
    useEffect(() => {
        !visible ? callbackF() : null;
        BackHandler.addEventListener('hardwareBackPress', handleGoBack);
        return () => BackHandler.removeEventListener('hardwareBackPress', handleGoBack);
    }, [groupList.length]);
    //#endregion

    if (visible) {
        return (
            <Animated.View entering={enteringAnim} exiting={exitingAnim}
                style={SurfaceStyle}>
                <Animated.View style={AnimatedHeaderStyle}>
                    {!selected.length ?
                        <Animated.View key={1} entering={appBarEntering}>
                            <View style={{ backgroundColor: "transparent", flexDirection: 'row', alignItems: 'center' }}>
                                <Appbar.BackAction onPress={throttle(() => {
                                    setVisible(false);
                                }, 2000, { trailing: false })} />
                                <Appbar.Content title={
                                    <Animated.View>
                                        <Text variant="titleLarge"
                                            numberOfLines={1}
                                            accessible
                                            accessibilityRole="header">Bin</Text>
                                    </Animated.View>
                                } style={{ paddingLeft: 10 }} />

                                <Menu visible={deleteMenuVisible} scaleXAnimation
                                    anchorPosition='bottom' theme={thisTheme}
                                    onDismiss={() => setDeleteMenuVisible(false)}
                                    anchor={
                                        <IconButton
                                            icon={"dots-vertical"}
                                            onPress={() => setDeleteMenuVisible(true)} />
                                    }>
                                    <Menu.Item title="Clear Bin" leadingIcon={"trash-can-outline"}
                                        onPress={() => {
                                            setDialogTouchable(true)
                                            setIsClearBinDialogVisible(true)
                                            setDeleteMenuVisible(false)
                                        }} />
                                    <Menu.Item title="Restore all" leadingIcon={"restore"}
                                        onPress={() => {
                                            setDialogTouchable(true)
                                            setIsRestoreAllVisible(true)
                                            setDeleteMenuVisible(false)
                                        }} />
                                </Menu>
                            </View>
                        </Animated.View>
                        :
                        <Animated.View key={2} entering={selectedBarEntering}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Appbar.Action icon="close" onPress={() => {
                                    setSelected([])
                                    setSelectedNotes([])
                                }} />
                                <Checkbox status={selected.length == binData.length ? 'checked' : 'unchecked'}
                                    onPress={() => {
                                        if (selected.length == binData.length) {
                                            setSelected([])
                                            setSelectedNotes([])
                                            return;
                                        }
                                        let _temp = []
                                        let _tempNotes = []
                                        for (let i = 0; i < binData.length; i++) {
                                            _temp.push(i)
                                            _tempNotes.push(binData[i])
                                        }
                                        setSelectedNotes(_tempNotes)
                                        setSelected(_temp)
                                    }} />
                                <Appbar.Content titleStyle={{ fontSize: 19 }} title={(selected.length == binData.length ? "All " : "") + selected.length.toString() + " selected"} />
                            </View>
                        </Animated.View>
                    }
                </Animated.View>

                <Animated.FlatList
                    scrollEventThrottle={16}
                    removeClippedSubviews={false}
                    onScroll={scrollHandler}
                    data={binData}
                    itemLayoutAnimation={CurvedTransition.easingY(Easing.inOut(Easing.cubic)).duration(500)}
                    ListEmptyComponent={ListEmptyComp}
                    contentContainerStyle={{ paddingBottom: 50 }}
                    keyExtractor={(item) => item.key.toString()}
                    renderItem={({ item, index }) =>
                        <BinRenderItem
                            item={item}
                            index={index}
                            route={route}
                            selected={selected}
                            setSelected={setSelected}
                            selectedNotes={selectedNotes}
                            setSelectedNotes={setSelectedNotes}
                            setRestoredGrps={setRestoredGrps}
                            setSnackVisible={setSnackVisible}
                            thisTheme={thisTheme}
                            setIsDialogVisible={setIsRestoreDialogVisible}
                            setDeleteVisible={setIsDeleteDialogVisible}
                            binData={binData}
                            setActionKey={setActionKey}
                            setDialogTouchable={setDialogTouchable}
                        />
                    }
                />
                < Portal >
                    <RestoreDialog
                        isDialogVisible={isRestoreDialogVisible}
                        setIsDialogVisible={setIsRestoreDialogVisible}
                        restoreKey={actionKey}
                        data={data}
                        binData={binData}
                        restoredGrps={restoredGrps}
                        groupList={groupList}
                        setGroupList={setGroupList}
                        touchable={dialogTouchable}
                        thisTheme={thisTheme}
                        setTouchable={setDialogTouchable}
                        setSnackVisible={setSnackVisible}
                        sortOrder={sortOrder} />
                    <MultiRestoreDialog
                        isDialogVisible={isMultiRestoreDialogVisible}
                        setIsDialogVisible={setIsMultiRestoreDialogVisible}
                        selectedNotes={selectedNotes}
                        setSelectedNotes={setSelectedNotes}
                        setRestoredGrps={setRestoredGrps}
                        sortOrder={sortOrder}
                        data={data}
                        groupList={groupList}
                        setGroupList={setGroupList}
                        binData={binData}
                        setSnackVisible={setSnackVisible}
                        setSelected={setSelected}
                        touchable={dialogTouchable}
                        thisTheme={thisTheme}
                        setTouchable={setDialogTouchable}
                    />
                    <DeleteDialog isDialogVisible={isDeleteDialogVisible}
                        setIsDialogVisible={setIsDeleteDialogVisible}
                        binData={binData}
                        thisTheme={thisTheme}
                        id={actionKey}
                        setId={setActionKey}
                        touchable={dialogTouchable}
                        setTouchable={setDialogTouchable} />
                    <MultiDeleteDialog isDialogVisible={isMultiDeleteDialogVisible}
                        setIsDialogVisible={setIsMultiDeleteDialogVisible}
                        binData={binData}
                        setBinData={setBinData}
                        selected={selected}
                        setSelected={setSelected}
                        touchable={dialogTouchable}
                        setTouchable={setDialogTouchable}
                        thisTheme={thisTheme} />
                    <ClearBinDialog isDialogVisible={isClearBinDialogVisible}
                        setIsDialogVisible={setIsClearBinDialogVisible}
                        setBinData={setBinData}
                        touchable={dialogTouchable}
                        setTouchable={setDialogTouchable}
                        thisTheme={thisTheme} />
                    <RestoreAllDialog isDialogVisible={isRestoreAllVisible}
                        setIsDialogVisible={setIsRestoreAllVisible}
                        setRestoredGrps={setRestoredGrps}
                        sortOrder={sortOrder}
                        data={data}
                        groupList={groupList}
                        setGroupList={setGroupList}
                        binData={binData}
                        setBinData={setBinData}
                        setSnackVisible={setSnackVisible}
                        touchable={dialogTouchable}
                        thisTheme={thisTheme}
                        setTouchable={setDialogTouchable} />
                </Portal >
                {selected.length ?
                    <Animated.View entering={ZoomInDown.duration(210)
                        .withInitialValues({ transform: [{ translateY: 50 }, { scale: 0.8 }] })}
                        style={{ backgroundColor: thisTheme.colors.surfaceContainerLow, ...styles.bottomBar }}>
                        <Animated.View entering={ZoomIn.delay(80).duration(200).springify().stiffness(200).mass(0.75).damping(13)}>
                            <Button mode='contained' style={{ ...styles.bottomBarBtn, borderColor: thisTheme.colors.primary }}
                                onPress={() => {
                                    setDialogTouchable(true);
                                    setIsMultiRestoreDialogVisible(true);
                                }} icon='restore' >Restore</Button>
                        </Animated.View>
                        <Animated.View entering={ZoomIn.delay(80).duration(200).springify().stiffness(200).mass(0.75).damping(13)}>
                            <Button mode='outlined' style={{ ...styles.bottomBarBtn, borderColor: thisTheme.colors.primary }}
                                onPress={() => {
                                    setDialogTouchable(true)
                                    setIsMultiDeleteDialogVisible(true);
                                }} icon='trash-can-outline'>Delete</Button>
                        </Animated.View>
                    </Animated.View>
                    : null}
                {/* <Button onPress={() => setSnackVisible(!isSnackVisible)}>show/hide</Button> */}
                <SnackBarAnimated bottomMargin={40}
                    label={`Added ${restoredGrps.toString()} group to groups list`}
                    doOnDismiss={() => {
                        setSnackVisible(false);
                        setRestoredGrps([]);
                    }}
                    setVisible={(setSnackVisible)}
                    visible={isSnackVisible}
                    buttonLabel='close'
                    onButtonPress={() => {
                        setSnackVisible(false);
                    }}
                ></SnackBarAnimated>

            </Animated.View >
        )
    }
    return null
}

const styles = StyleSheet.create({

    ListEmptyCompText: {
        opacity: 0.5, fontFamily: 'Manrope-Regular',
        marginTop: 20, marginBottom: 5,
    },
    bottomBar: {
        paddingTop: 15,
        paddingBottom: 5,
        flexDirection: 'row',
        justifyContent: 'space-evenly'
    },
    bottomBarBtn: {
        width: 150,
        height: 43,
        borderRadius: 25,
        justifyContent: 'center',
    }
});