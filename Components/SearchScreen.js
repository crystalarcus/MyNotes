import { useCallback, useContext, useEffect, useState } from "react";
import { View, Keyboard, BackHandler, Dimensions } from "react-native";
import { Button, Chip, Headline, Icon, List, Searchbar, Surface, Text, useTheme } from "react-native-paper";
import Animated, { CurvedTransition, Easing, FadeInDown, ZoomIn, ZoomInDown, ZoomOut, runOnJS, withDelay, withTiming } from "react-native-reanimated";
import { AppContext } from "../AppContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LottieView from "lottie-react-native";

const FilterComp = ({ index, selectedChips, setSelectedChips, item, isLoaded }) => {
    const borderColor = useTheme().colors.outline;
    return (
        <Animated.View entering={FadeInDown.delay(isLoaded ? 0 : index * 30)
            .duration(350)}
            layout={CurvedTransition.duration(150)}>
            <Chip compact={true}
                textStyle={{ lineHeight: 27 }}
                style={{
                    borderWidth: 1, justifyContent: 'center',
                    borderColor: selectedChips.includes(index) ? 'transparent' : borderColor
                }}
                mode={selectedChips.includes(index) ? 'flat' : 'outlined'}
                onPress={() => {
                    if (selectedChips.includes(index)) {
                        let _list = [...selectedChips]
                        setSelectedChips(_list.filter(_item => _item != index))
                    }
                    else {
                        let _list = [...selectedChips, index]
                        setSelectedChips(_list)
                    }
                }}>{item}</Chip>
        </Animated.View>
    )
}


export function AllNotesSearch({ navigation, route }) {
    const { data, groupList } = useContext(AppContext);
    const [filters, setFilters] = useState(route.params.filter ? [...route.params.filter] : [])
    const [isLoaded, setIsLoaded] = useState(false);
    const theme = useTheme();
    const [filter, setFilter] = useState(data)
    const [value, setValue] = useState();
    const height = Dimensions.get('screen').height;
    const onChangeQuery = (text) => {
        setValue(text);
        if (selectedChips.length == 0) {
            text == "" ? setFilter(data) :
                setFilter(data.filter(element => ((element.title.toUpperCase().includes(text.toUpperCase())) ||
                    (element.content.toUpperCase().includes(text.toUpperCase())))))
            return;
        }
        else {

        }
        if (text == "") {
            setFilter(data.filter((element) => {
                let found = false;
                selectedChips.forEach(item => {
                    if (element.groups.includes(groupList[item])) {
                        found = true;
                    }
                })
                return found;
            }));
            return
        }
        setFilter(data.filter((element) => {
            let found = false;
            selectedChips.forEach(item => {
                if (element.groups.includes(groupList[item]) &&
                    (element.title.toUpperCase().includes(text.toUpperCase()) ||
                        element.content.toUpperCase().includes(text.toUpperCase()))) {
                    found = true;
                }
            })
            return found;
        }));
    }
    const [isKeyboardVisible, setKeyboardVisible] = useState(true);
    const [visible, setVisible] = useState(true)
    const [selectedChips, setSelectedChips] = useState([]);
    const deleteGroupItem = name => {
        raw = filters.filter(item => item !== name);
        setFilters(raw);
    }

    function handleGoBack() {
        setVisible(false)
        return true;
    }
    const callbackF = () => {
        navigation.goBack();
    }

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
                { translateY: 300 }],
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
                { scale: withTiming(0.8, { duration: 250, easing: Easing.bezier(0.3, 0, 0.8, 0.15) }) },
                { translateY: withTiming(300, { duration: 250, easing: Easing.bezier(0.3, 0, 0.8, 0.15) }) }
            ],
            opacity: withDelay(100, withTiming(0, { duration: 100 }))
        }
        const initialValues = {
            transform: [{ scale: 1 },
            { translateY: 0 }],
            opacity: 1
        }
        const callback = (finished) => {
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
    const exitScreen = () => {
        // Dismiss the keyboard to avoid ugly transitions
        if (isKeyboardVisible) {
            setTimeout(() => {
                Keyboard.removeAllListeners('keyboardDidHide', onKeyboardDidHide);
                setVisible(false)
            }, 50);
            setVisible(false)
        }
        else {
            setVisible(false)
        }
    };
    const onKeyboardDidHide = async (event) => {
        setKeyboardVisible(false)
    };
    const lottieRef = useCallback((node) => node?.play(), [])
    useEffect(() => {
        setTimeout(() => {
            setIsLoaded(true)
        }, 400);
        BackHandler.addEventListener('hardwareBackPress', handleGoBack);
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => {
                setKeyboardVisible(true); // or some other action
            }
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                setKeyboardVisible(false); // or some other action
            }
        );

        return () => {
            keyboardDidHideListener.remove();
            keyboardDidShowListener.remove();
            BackHandler.removeEventListener('hardwareBackPress', handleGoBack);
        };
    }, []);
    return (
        visible ?
            <Animated.View entering={enteringAnim} key={999} exiting={exitingAnim}
                style={{
                    flex: 1,
                    backgroundColor: theme.colors.surface,
                }}>
                <Animated.View>

                    <View style={{
                        backgroundColor: theme.colors.surfaceContainerHigh,
                        height: useSafeAreaInsets().top
                    }} />
                    <Searchbar mode="view"
                        style={{
                            backgroundColor: theme.colors.surfaceContainerHigh,
                        }}
                        icon='keyboard-backspace'
                        onIconPress={() => {
                            exitScreen()
                        }}
                        placeholder="Search Note"
                        value={value}
                        onChangeText={onChangeQuery}
                        showDivider={false}
                    // autoFocus={true}
                    />

                </Animated.View>

                <Text style={{ padding: 8, fontSize: 14, fontFamily: 'Manrope-SemiBold' }}>Search Filters</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8, gap: 10 }}>
                    {
                        groupList.map((item, index) =>
                            <FilterComp index={index}
                                isLoaded={isLoaded}
                                key={index}
                                item={item}
                                selectedChips={selectedChips}
                                setSelectedChips={setSelectedChips} />)
                    }
                    <Animated.View entering={FadeInDown.delay(isLoaded ? 0 : groupList.length * 80)
                        .duration(350)}
                        layout={CurvedTransition.duration(150)}>
                        <Chip style={{
                            height: 40, borderWidth: 1, justifyContent: 'center',
                            borderColor: selectedChips.includes(groupList.length) ? 'transparent' : theme.colors.outline
                        }}
                            icon={'trash-can-outline'}
                            mode={selectedChips.includes(groupList.length) ? 'flat' : 'outlined'}
                            onPress={() => {
                                if (selectedChips.includes(groupList.length)) {
                                    let _list = [...selectedChips]
                                    setSelectedChips(_list.filter(_item => _item != groupList.length))
                                }
                                else {
                                    let _list = [...selectedChips, groupList.length]
                                    setSelectedChips(_list)
                                }
                            }}>Bin</Chip>
                    </Animated.View>
                    <Animated.View entering={FadeInDown.delay(isLoaded ? 0 : (groupList.length + 1) * 80)
                        .duration(350)}
                        layout={CurvedTransition.duration(150)}>
                        <Chip closeIcon={'star-outline'} onClose={() => {
                            if (selectedChips.includes(groupList.length + 1)) {
                                let _list = [...selectedChips]
                                setSelectedChips(_list.filter(_item => _item != groupList.length + 1))
                            }
                            else {
                                let _list = [...selectedChips, groupList.length + 1]
                                setSelectedChips(_list)
                            }
                        }}
                            icon={selectedChips.includes(groupList.length + 1) ? 'check' : null} style={{
                                height: 40, borderWidth: 1, justifyContent: 'center',
                                borderColor: selectedChips.includes(groupList.length + 1) ? 'transparent' : theme.colors.outline
                            }}
                            mode={selectedChips.includes(groupList.length + 1) ? 'flat' : 'outlined'}
                            onPress={() => {
                                if (selectedChips.includes(groupList.length + 1)) {
                                    let _list = [...selectedChips]
                                    setSelectedChips(_list.filter(_item => _item != groupList.length + 1))
                                }
                                else {
                                    let _list = [...selectedChips, groupList.length + 1]
                                    setSelectedChips(_list)
                                }
                            }}>Starred</Chip>
                    </Animated.View>
                </View>
                <Text style={{ padding: 8, marginTop: 20, fontSize: 14, fontFamily: 'Manrope-SemiBold' }}>Search Results</Text>
                <Animated.FlatList layout={CurvedTransition}
                    data={filter}
                    itemLayoutAnimation={CurvedTransition}
                    style={{ height: '100%' }}
                    ListEmptyComponent={() => {
                        return (
                            data.length == 0 ?
                                <View style={{ flex: 1, alignItems: 'center', paddingTop: '40%' }}>
                                    <Text variant="titleLarge" style={{ color: useTheme().colors.onSurfaceVariant }}>You have no Notes</Text>
                                    <Text variant="bodyLarge" style={{ color: useTheme().colors.outline }}>Try creating some</Text>
                                    <Button mode="contained" style={{ marginTop: 20 }}>Create New Note</Button>
                                </View> :
                                <View style={{ flex: 1, alignItems: 'center', paddingTop: '50%' }}>
                                    <LottieView style={{ marginBottom: 20 }}
                                        autoPlay
                                        loop
                                        source={require('../assets/results.json')} />
                                    <Text variant="titleLarge" style={{ color: useTheme().colors.onSurfaceVariant }}>No notes found</Text>
                                    <Text variant="bodyLarge" style={{ color: useTheme().colors.outline }}>Trying checking spelling</Text>
                                </View>
                        );
                    }}
                    renderItem={({ item, index }) =>
                        <SearchRenderItem
                            item={item} index={index}
                            data={data}
                            isLoaded={isLoaded}
                            theme={theme}
                            navigation={navigation}
                            previous_screen={route.params.previous_screen} />} />
            </Animated.View > : null
    );
}

const SearchRenderItem = ({ item, index, isLoaded, data,
    theme, navigation, previous_screen }) => {
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
                { translateY: 300 }],
            opacity: 0
        }
        return {
            initialValues,
            animations
        }
    }
    return (
        <Animated.View
            entering={enteringAnim}
            // entering={ZoomIn.delay(isLoaded ? 0 : index * 60)
            //     .duration(350)}
            key={item.key}
            style={{
                backgroundColor: theme.colors.surfaceContainerHigh + "99",
                marginHorizontal: 10,
                shadowColor: 'transparent', borderRadius: 16,
                marginVertical: 5
            }}>
            <List.Item title={item.title}
                unstable_pressDelay={40}
                style={{ borderRadius: 20, backgroundColor: theme.colors.surfaceContainerHigh }} borderless={true}
                description={item.content} onPress={() => {
                    navigation.navigate("CreateNewNote", {
                        note: item,
                        createNew: false,
                        noteID: data.indexOf(item),
                        previous_screen: previous_screen
                    })
                }} />
        </Animated.View>
    );
}