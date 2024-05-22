import 'expo-dev-client'
import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { Dimensions, Platform, useColorScheme, } from 'react-native';
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
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

const drawer = createDrawerNavigator();

export default function App() {
  // Settings
  const [appIsReady, setAppIsReady] = useState(false);
  const [appTheme, setAppTheme] = useState('system');
  const [accentColor, setAccentColor] = useState('#DBA430');
  const [noteTemplate, setNoteTemplate] = useState(0);
  const [noteHeight, setNoteHeight] = useState('Medium');
  const [titleFontSize, setTitleFontSize] = useState(120);
  const [contentFontSize, setContentFontSize] = useState(80);
  const [titleFontFamily, setTitleFontFamily] = useState('Roboto');
  const [contentFontFamily, setContentFontFamily] = useState('Roboto');
  const [coloredNote, setColoredNote] = useState(true);
  const [showNoteBorder, setShowNoteBorder] = useState(false);
  const [sortOrder, setSortOrder] = useState(1); // 1 : time/newtoold, 2: time/oldtonew, 3:alpha/atoz,4:alpha/ztoa 
  const [shallBinDelete, setShallBinDelete] = useState(false);
  const [titleBold, setTitleBold] = useState(true);
  const [contentBold, setContentBold] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [showNoteStar, setShowNoteStar] = useState(true);
  const [showNoteDate, setShowNoteDate] = useState(true);
  const [showNoteActionBtns, setShowNoteActionBtns] = useState(true);
  const [binDeletionTime, setBinDeletionTime] = useState(3); //7776000000
  const [binDeletionTimeUnit, setBinDeletionTimeUnit] = useState('Months');
  const [askBeforeDeleting, setAskBeforeDeleting] = useState(true);
  const [voiceNotes, setVoiceNotes] = useState<VoiceNoteType[]>([]);
  // Data
  const [data, setData] = useState([]);
  const [binData, setBinData] = useState([]);
  const [binVNData, setBinVNData] = useState([]);
  const [groupList, setGroupList] = useState([]);
  const { theme, updateTheme } = useMaterial3Theme({ fallbackSourceColor: '#DBA430' }); // 9C4237 006874
  const systemTheme = useColorScheme();
  const [activeScreen, setActiveScreen] = useState('All Notes');
  const UpdateThemeTo = (str: string) => { updateTheme(str); }
  //#region 
  useEffect(() => {
    async function LoadVar(id: string, defaultVal: string) {
      let raw = await AsyncStorage.getItem(id); // get From Storage
      if (raw == null) { // check null
        raw = defaultVal;
        await AsyncStorage.setItem(id, defaultVal);
      }
      return raw;
    }
    async function LoadIsCompact() {  // Load value
      try {
        let loadedVal = await LoadVar('@isCompact', 'false');
        let parsedVal = JSON.parse(loadedVal);
        setIsCompact(parsedVal); // set useState of value
      } catch (error) {
        console.log(error);
      }
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
        let loadedVal = await LoadVar('@titleFontSize', '120');
        let parsedVal = JSON.parse(loadedVal); // convert to number
        setTitleFontSize(parsedVal); // set useState of font
      } catch (error) {
        console.log(error);
      }
    }
    async function LoadContentFontSize() {  // Load Font
      try {
        let loadedVal = await LoadVar('@contentFontSize', '80');
        let parsedVal = JSON.parse(loadedVal); // convert to number
        setContentFontSize(parsedVal); // set useState of font
      } catch (error) {
        console.log(error);
      }
    }
    async function LoadTitleFontFamily() {  // Load Font
      try {
        let loadedVal = await LoadVar('@titleFontFamily', 'Roboto');
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
        let parsedVal = JSON.parse(loadedVal);
        setTitleBold(parsedVal); // set useState of value
      } catch (error) {
        console.log(error);
      }
    }
    async function LoadContentBold() {  // Load value
      try {
        let loadedVal = await LoadVar('@contentBold', 'false');
        let parsedVal = JSON.parse(loadedVal);
        setContentBold(parsedVal); // set useState of value
      } catch (error) {
        console.log(error);
      }
    }
    async function LoadNoteTemplate() {  // Load value
      try {
        let loadedVal = await LoadVar('@noteTemplate', '0');
        let parsedVal = JSON.parse(loadedVal); // convert to bool
        setNoteTemplate(parsedVal); // set useState of var
      } catch (error) {
        console.log(error);
      }
    }
    async function LoadNoteHeight() {  // Load value
      try {
        let loadedVal = await LoadVar('@noteHeight', 'Medium');
        setNoteHeight(loadedVal); // set useState of var
      } catch (error) {
        console.log(error);
      }
    }
    async function LoadShowBorder() {  // Load value
      try {
        let loadedVal = await LoadVar('@showNoteBorder', 'false');
        let parsedVal = JSON.parse(loadedVal); // convert to bool
        setShowNoteBorder(parsedVal); // set useState of var
      } catch (error) {
        console.log(error);
      }
    }
    async function LoadShowNoteStar() {  // Load value
      try {
        let loadedVal = await LoadVar('@showNoteStar', 'true');
        let parsedVal = JSON.parse(loadedVal); // convert to bool
        setShowNoteStar(parsedVal); // set useState of var
      } catch (error) {
        console.log(error);
      }
    }
    async function LoadShowNoteDate() {  // Load value
      try {
        let loadedVal = await LoadVar('@showNoteDate', 'true');
        let parsedVal = JSON.parse(loadedVal); // convert to bool
        setShowNoteDate(parsedVal); // set useState of var
      } catch (error) {
        console.log(error);
      }
    }
    async function LoadShowNoteActionBtns() {  // Load value
      try {
        let loadedVal = await LoadVar('@showNoteActionBtns', 'true');
        let parsedVal = JSON.parse(loadedVal); // convert to bool
        setShowNoteActionBtns(parsedVal); // set useState of var
      } catch (error) {
        console.log(error);
      }
    }
    async function LoadShallBinDelete() {  // Load value
      try {
        let loadedVal = await LoadVar('@shallBinDelete', 'true');
        let parsedVal = JSON.parse(loadedVal); // convert to bool
        setShallBinDelete(parsedVal); // set useState of var
      } catch (error) {
        console.log(error);
      }
    }
    async function LoadAskBeforeDeleting() {  // Load value
      try {
        let loadedVal = await LoadVar('@askBeforeDeleting', 'true');
        let parsedVal = JSON.parse(loadedVal); // convert to bool
        setAskBeforeDeleting(parsedVal); // set useState of var
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
    async function LoadAutoDelete() { // Load addFromTop
      try {
        let _autoDeleteData = JSON.stringify({ time: 3, unit: "Months" })
        let loadedVal = await LoadVar('@autoDelete', _autoDeleteData);
        let parsedVal = JSON.parse(loadedVal); // convert to object
        setBinDeletionTime(parsedVal.time); // set useState of var
        setBinDeletionTimeUnit(parsedVal.unit); // set useState of var
      } catch (error) {
        console.log(error);
      }
    }
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
    async function getVoiceNotes() {
      try {
        var rawdata = await AsyncStorage.getItem('voiceNotes');
        if (rawdata === null) {
          setVoiceNotes([]);
          await AsyncStorage.setItem('voiceNotes', "[]");
          return;
        }
        var jsonValue = JSON.parse(rawdata);
        setVoiceNotes(jsonValue);
      } catch (error) {
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
    async function getBinVNData() {
      let rawBin = await AsyncStorage.getItem('binVNData');
      if (rawBin === null) {
        setBinVNData([]);
        await AsyncStorage.setItem('binVNData', "[]");
        return;
      }
      var jsonValue = JSON.parse(rawBin);
      setBinVNData(jsonValue);
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
    async function Prepare() {
      try {
        getData();
        getVoiceNotes();
        getBinData();
        getGroupList();
        LoadIsCompact();
        LoadAppTheme();
        LoadAccentColor();
        LoadTitleFontSize();
        LoadContentFontSize();
        LoadTitleFontFamily();
        LoadContentFontFamily();
        LoadTitleBold();
        LoadContentBold();
        getBinVNData();
        LoadNoteTemplate();
        LoadNoteHeight();
        LoadShowBorder();
        LoadShowNoteStar();
        LoadShowNoteDate();
        LoadShowNoteActionBtns();
        LoadSortOrder();
        LoadAutoDelete();
        LoadAskBeforeDeleting();
        LoadShallBinDelete();
      } catch (error) {
        console.warn(error)
      } finally {
        setAppIsReady(true)
      }
    }
    Prepare();
  }, [accentColor]);
  const paperTheme = appTheme == 'system' ?
    (systemTheme == 'dark' ? { ...MD3DarkTheme, colors: theme.dark } : { ...MD3LightTheme, colors: theme.light }) :
    (appTheme == 'dark' ? { ...MD3DarkTheme, colors: theme.dark } : { ...MD3LightTheme, colors: theme.light })
  const [fontsLoaded, fontError] = useFonts({
    'Urbanist': require('./assets/fonts/Urbanist-Regular.ttf'),
    'Urbanist-Bold': require('./assets/fonts/Urbanist-SemiBold.ttf'),
    'OpenSans': require('./assets/fonts/OpenSans-Regular.ttf'),
    'OpenSans-Light': require('./assets/fonts/OpenSans-Light.ttf'),
    'OpenSans-Bold': require('./assets/fonts/OpenSans-Medium.ttf'),
    'NotoSans': require('./assets/fonts/NotoSans-Regular.ttf'),
    'NotoSans-Bold': require('./assets/fonts/NotoSans-Medium.ttf'),
    'Nunito': require('./assets/fonts/Nunito-Regular.ttf'),
    'Nunito-Bold': require('./assets/fonts/Nunito-Bold.ttf'),
    'Roboto': require('./assets/fonts/Roboto-Regular.ttf'),
    'Roboto-Medium': require('./assets/fonts/Roboto-Medium.ttf'),
    'Roboto-Bold': require('./assets/fonts/Roboto-Medium.ttf'),
    'Poppins': require('./assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Bold': require('./assets/fonts/Poppins-Medium.ttf'),
    'Manrope': require('./assets/fonts/Manrope-Medium.ttf'),
    'Manrope-Regular': require('./assets/fonts/Manrope-Regular.ttf'),
    'Manrope-SemiBold': require('./assets/fonts/Manrope-SemiBold.ttf'),
    'Manrope-Bold': require('./assets/fonts/Manrope-Bold.ttf'),
    'Comfortaa': require('./assets/fonts/Comfortaa-Regular.ttf'),
    'Comfortaa-Bold': require('./assets/fonts/Comfortaa-SemiBold.ttf'),
    'ComicNeue': require('./assets/fonts/ComicNeue-Regular.ttf'),
    'ComicNeue-Bold': require('./assets/fonts/ComicNeue-Bold.ttf'),
    'Lexend': require('./assets/fonts/Lexend-Light.ttf'),
    'Lexend-Regular': require('./assets/fonts/Lexend-Regular.ttf'),
    'Lexend-Thin': require('./assets/fonts/Lexend-Thin.ttf'),
    'Lexend-Bold': require('./assets/fonts/Lexend-Medium.ttf'),
    'Century Gothic': require('./assets/fonts/Century-Gothic.ttf'),
    'Century Gothic-Bold': require('./assets/fonts/Century-Gothic-Bold.ttf'),
  });
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  //#endregion

  return (
    <PaperProvider theme={{ ...paperTheme, fonts: { ...paperTheme.fonts, headlineSmall: { fontFamily: 'Manrope', fontSize: 24 }, labelLarge: { fontFamily: 'Manrope' }, default: { fontFamily: 'Manrope' } } }}>
      <StatusBar style='auto'></StatusBar>
      <Surface elevation={2} style={Platform.OS == 'web' ? { height: Dimensions.get('window').height } : { flex: 1 }} onLayout={onLayoutRootView}>
        {/* <View style={{ paddingTop: 30, paddingLeft: 30 }}>
          <Text>{JSON.stringify(accentColor)}</Text>
        </View> */}
        <NavigationContainer>
          <AppContext.Provider
            value={{
              data, setData,
              binData, setBinData,
              binVNData, setBinVNData,
              voiceNotes, setVoiceNotes,
              groupList, setGroupList,
              isCompact, setIsCompact,
              appTheme, setAppTheme,
              accentColor, setAccentColor,
              noteTemplate, setNoteTemplate,
              noteHeight, setNoteHeight,
              titleFontSize, setTitleFontSize,
              contentFontSize, setContentFontSize,
              titleFontFamily, setTitleFontFamily,
              titleBold, setTitleBold,
              contentBold, setContentBold,
              contentFontFamily, setContentFontFamily,
              coloredNote, setColoredNote,
              showNoteStar, setShowNoteStar,
              showNoteDate, setShowNoteDate,
              showNoteActionBtns, setShowNoteActionBtns,
              showNoteBorder, setShowNoteBorder,
              sortOrder, setSortOrder,
              activeScreen, setActiveScreen,
              shallBinDelete, setShallBinDelete,
              binDeletionTime, setBinDeletionTime,
              binDeletionTimeUnit, setBinDeletionTimeUnit,
              askBeforeDeleting, setAskBeforeDeleting,
              UpdateThemeTo,
            }}>
            <drawer.Navigator screenOptions={{ headerShown: false, drawerStyle: { width: 300 } }}
              drawerContent={(props) => <DrawerContent {...props} />}>
              <drawer.Screen name='Screens' component={Screens} />
            </drawer.Navigator>
          </AppContext.Provider>
        </NavigationContainer>

      </Surface>

    </PaperProvider >
  );
}

