import 'expo-dev-client'
import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme, } from 'react-native';
import { MD3DarkTheme, MD3LightTheme, PaperProvider, Surface } from 'react-native-paper';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import { DrawerContent } from './Components/DrawerContent';
import { useCallback, useEffect, useState } from 'react';
import { useMaterial3Theme } from '@pchmn/expo-material3-theme';
import { Screens } from './Components/Navigation';
import { AppContext } from './AppContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { PlatformColor } from 'react-native';
// import { resolveColorSync } from '@klarna/platform-colors';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';

SplashScreen.preventAutoHideAsync();

const drawer = createDrawerNavigator();

export default function App() {
  // Settings
  const [appTheme, setAppTheme] = useState('system');
  const [accentColor, setAccentColor] = useState('#9C4237');
  const [titleFontSize, setTitleFontSize] = useState(100);
  const [contentFontSize, setContentFontSize] = useState(100);
  const [titleFontFamily, setTitleFontFamily] = useState('Roboto');
  const [contentFontFamily, setContentFontFamily] = useState('Roboto');
  const [showNoteBorder, setShowNoteBorder] = useState(true);
  // const [addFromTop, setAddFomTop] = useState("New to Old");
  const [sortOrder, setSortOrder] = useState(1); // 1 : time/newtoold, 2: time/oldtonew, 3:alpha/atoz,4:alpha/ztoa 
  const [shallBinDelete, setShallBinDelete] = useState(false);
  const [titleBold, setTitleBold] = useState(true);
  const [contentBold, setContentBold] = useState(false);


  // Data
  const [data, setData] = useState([]);
  const [binData, setBinData] = useState([]);
  const [groupList, setGroupList] = useState(['Personal', 'Work']);
  const { theme, updateTheme } = useMaterial3Theme({ fallbackSourceColor: '#9C4237' }); // 9C4237 006874
  const systemTheme = useColorScheme();
  const [activeScreen, setActiveScreen] = useState('All Notes');
  const UpdateThemeTo = (str) => { updateTheme(str); }
  //#region 
  useEffect(() => {
    async function LoadVar(id, defaultVal) {
      let raw = await AsyncStorage.getItem(id); // get From Storage
      if (raw == null) { // check null
        raw = defaultVal;
        await AsyncStorage.setItem(id, defaultVal);
      }
      return raw;
    }
    async function LoadAppTheme() { // Load App's theme from storage
      try {
        let loadedVal = await LoadVar('@appTheme', 'system');
        setAppTheme(loadedVal); // set UseState
      } catch (error) {
        console.log(error);
      }
    }

    async function LoadAccentColor() { // Load Accent Color
      try {
        let loadedVal = await LoadVar('@accentColor', '#EA9389');
        setAccentColor(loadedVal); // set useState
        if (accentColor == 'dynamic') { updateTheme(theme.light.primary); }
        else { updateTheme(accentColor); }
      } catch (error) {
        console.log(error);
      }
    }

    async function LoadTitleFontSize() {  // Load Font
      try {
        let loadedVal = await LoadVar('@titleFontSize', '100');
        let parsedVal = JSON.parse(loadedVal); // convert to number
        setTitleFontSize(parsedVal); // set useState of font
      } catch (error) {
        console.log(error);
      }
    }
    async function LoadContentFontSize() {  // Load Font
      try {
        let loadedVal = await LoadVar('@contentFontSize', '100');
        let parsedVal = JSON.parse(loadedVal); // convert to number
        setContentFontSize(parsedVal); // set useState of font
      } catch (error) {
        console.log(error);
      }
    }
    async function LoadTitleFontFamily() {  // Load Font
      try {
        let loadedVal = await LoadVar('@titleFontFamily', 'Roboto-Medium');
        setTitleFontFamily(loadedVal); // set useState of font
      } catch (error) {
        console.log(error);
      }
    }
    async function LoadContentFontFamily() {  // Load Font
      try {
        let loadedVal = await LoadVar('@contentFontFamily', 'Roboto');
        setContentFontFamily(loadedVal); // set useState of font
      } catch (error) {
        console.log(error);
      }
    }
    async function LoadTitleBold() {  // Load value
      try {
        let loadedVal = await LoadVar('@titleBold', 'true');
        parsedVal = JSON.parse(loadedVal);
        setTitleBold(parsedVal); // set useState of value
      } catch (error) {
        console.log(error);
      }
    }
    async function LoadContentBold() {  // Load value
      try {
        let loadedVal = await LoadVar('@contentBold', 'false');
        parsedVal = JSON.parse(loadedVal);
        setContentBold(parsedVal); // set useState of value
      } catch (error) {
        console.log(error);
      }
    }
    async function LoadShowBorder() {  // Load value
      try {
        let loadedVal = await LoadVar('@showNoteBorder', 'true');
        let parsedVal = JSON.parse(loadedVal); // convert to bool
        setShowNoteBorder(parsedVal); // set useState of var
      } catch (error) {
        console.log(error);
      }
    }
    async function LoadSortOrder() { // Load addFromTop
      try {
        let loadedVal = await LoadVar('@sortOrder', '1');
        let parsedVal = JSON.parse(loadedVal); // convert to bool
        setSortOrder(parsedVal); // set useState of var
      } catch (error) {
        console.log(error);
      }
    }
    LoadAppTheme();
    LoadAccentColor();
    LoadTitleFontSize();
    LoadContentFontSize();
    LoadTitleFontFamily();
    LoadContentFontFamily();
    LoadTitleBold();
    LoadContentBold();
    LoadShowBorder();
    LoadSortOrder();
    // updateTheme(accentColor);

    async function getData() {
      try {
        var rawdata = await AsyncStorage.getItem('data');
        if (rawdata === null) {
          setData([]);
          await AsyncStorage.setItem('data', "[]");
          return;
        }
        var jsonValue = JSON.parse(rawdata);
        setData(jsonValue);
      } catch (error) {
        setData([{ name: 'error', dis: error, date: '12 May', key: '1' }]);
      }
    }
    async function getBinData() {
      let rawBin = await AsyncStorage.getItem('binData');
      if (rawBin === null) {
        setBinData([]);
        await AsyncStorage.setItem('binData', "[]");
        return;
      }
      var jsonValue = JSON.parse(rawBin);
      setBinData(jsonValue);
    }
    async function getGroupList() {
      let group = await AsyncStorage.getItem('groupList');
      if (group == null) {
        setGroupList([]);
        await AsyncStorage.setItem('groupList', '[]');
        return;
      }
      var jsonValue = JSON.parse(group);
      setGroupList(jsonValue);
    }
    getData();
    getBinData();
    getGroupList();
  }, [accentColor]);
  const paperTheme = appTheme == 'system' ?
    (systemTheme == 'dark' ? { ...MD3DarkTheme, colors: theme.dark } : { ...MD3LightTheme, colors: theme.light }) :
    (appTheme == 'dark' ? { ...MD3DarkTheme, colors: theme.dark } : { ...MD3LightTheme, colors: theme.light })
  const [fontsLoaded] = useFonts({
    'Urbanist': require('./assets/fonts/Urbanist-Regular.ttf'),
    'Urbanist-Medium': require('./assets/fonts/Urbanist-SemiBold.ttf'),
    'OpenSans': require('./assets/fonts/OpenSans-Regular.ttf'),
    'OpenSans-Medium': require('./assets/fonts/OpenSans-Medium.ttf'),
    'NotoSans': require('./assets/fonts/NotoSans-Regular.ttf'),
    'NotoSans-Medium': require('./assets/fonts/NotoSans-Medium.ttf'),
    'Nunito': require('./assets/fonts/Nunito-Regular.ttf'),
    'Nunito-Medium': require('./assets/fonts/Nunito-Bold.ttf'),
    'Roboto': require('./assets/fonts/Roboto-Regular.ttf'),
    'Roboto-Medium': require('./assets/fonts/Roboto-Medium.ttf'),
    'Comfortaa': require('./assets/fonts/Comfortaa-Regular.ttf'),
    'Comfortaa-Medium': require('./assets/fonts/Comfortaa-SemiBold.ttf'),
    'Lexend': require('./assets/fonts/Lexend-Light.ttf'),
    'Lexend-Regular': require('./assets/fonts/Lexend-Regular.ttf'),
    'Lexend-Thin': require('./assets/fonts/Lexend-Thin.ttf'),
    'Lexend-Medium': require('./assets/fonts/Lexend-Medium.ttf'),
    'Chronograph': require('./assets/fonts/Chronograph-Light.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }
  //#endregion

  return (
    <PaperProvider theme={paperTheme}>
      <StatusBar style='auto'></StatusBar>

      <Surface elevation={2} style={{ flex: 1 }} onLayout={onLayoutRootView}>
        {/* <View style={{ paddingTop: 30, paddingLeft: 30 }}>
          <Text>{JSON.stringify(accentColor)}</Text>
        </View> */}
        <NavigationContainer
          theme={{ colors: { background: paperTheme.colors.background } }}
        >
          <AppContext.Provider value={{
            data, setData,
            binData, setBinData,
            groupList, setGroupList,
            appTheme, setAppTheme,
            accentColor, setAccentColor,
            titleFontSize, setTitleFontSize,
            contentFontSize, setContentFontSize,
            titleFontFamily, setTitleFontFamily,
            titleBold, setTitleBold,
            contentBold, setContentBold,
            contentFontFamily, setContentFontFamily,
            showNoteBorder, setShowNoteBorder,
            sortOrder, setSortOrder,
            activeScreen, setActiveScreen,
            shallBinDelete, setShallBinDelete,
            UpdateThemeTo,
          }}>
            <drawer.Navigator backBehavior='history'
              drawerContent={(props) => (<DrawerContent {...props} />)}
              initialRouteName='All Notes' screenOptions={{ headerShown: false, swipeEnabled: false }}>
              <drawer.Screen name='Screen' component={Screens} />
            </drawer.Navigator>
          </AppContext.Provider>
        </NavigationContainer>

      </Surface>

    </PaperProvider>
  );
}

