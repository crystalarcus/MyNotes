import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, useColorScheme, View } from 'react-native';
import { Button, MD3DarkTheme, MD3LightTheme, PaperProvider, Surface, Text, useTheme } from 'react-native-paper';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import { DrawerContent } from './Components/DrawerContent';
import { useEffect, useState } from 'react';
import { useMaterial3Theme } from '@pchmn/expo-material3-theme';
import { Screens } from './Components/Navigation';
import { AppContext, AppContext2, AppContext3 } from './AppContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { PlatformColor } from 'react-native';
// import { resolveColorSync } from '@klarna/platform-colors';

const drawer = createDrawerNavigator();

export default function App() {
  // Settings
  const [appTheme, setAppTheme] = useState('system');
  const [accentColor, setAccentColor] = useState('#9C4237');
  const [appFont, setAppFont] = useState(100);
  const [showNoteBorder, setShowNoteBorder] = useState(true);
  // Data
  const [data, setData] = useState([]);
  const [binData, setBinData] = useState([]);
  const [groupList, setGroupList] = useState(['Personal, Work']);
  const { theme, updateTheme } = useMaterial3Theme({ fallbackSourceColor: '#9C4237' }); // 9C4237 006874
  const systemTheme = useColorScheme();
  const UpdateThemeTo = (str) => { updateTheme(str); }
  //#region 
  useEffect(() => {
    async function LoadAppTheme() { // Load App's theme from storage
      try {
        let raw = await AsyncStorage.getItem('@appTheme'); // get From Storage
        if (raw == null) { // check null
          raw = 'system';
          console.log("not found theme");
          await AsyncStorage.setItem('@appTheme', 'system');
        }
        setAppTheme(raw); // set UseState
      } catch (error) {
        console.log(error);
      }
    }
    async function LoadAccentColor() { // Load Accent Color
      try {
        let raw = await AsyncStorage.getItem('@accentColor'); // get from storage
        if (raw == null) { // check null
          raw = '#9C4237';
          console.log("not found color");
          await AsyncStorage.setItem('@accentColor', 'system');
        }
        setAccentColor(raw); // set useState
        updateTheme(raw)
      } catch (error) {
        console.log(error);
      }
    }
    async function LoadAppFont() {  // Load Font
      try {
        let rawFont = await AsyncStorage.getItem('@appFont'); // load font as string
        if (rawFont == null) { // if no font value exists
          rawFont = '100';
          await AsyncStorage.setItem('@appFont', '100');
        }
        let raw3 = JSON.parse(rawFont); // convert to number
        setAppFont(raw3); // set useState of font
      } catch (error) {
        console.log(error);
      }
    }
    async function LoadShowBorder() {  // Load Font
      try {
        let raw = await AsyncStorage.getItem('@showNoteBorder'); // load var as string
        if (raw == null) { // if no var value exists
          raw = 'true';
          await AsyncStorage.setItem('@showNoteBorder', 'true');
        }
        let raw3 = JSON.parse(raw); // convert to bool
        setShowNoteBorder(raw3); // set useState of var
      } catch (error) {
        console.log(error);
      }
    }
    LoadAppTheme();
    LoadAccentColor();
    LoadAppFont();
    LoadShowBorder();
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
  }, []);
  const paperTheme = appTheme == 'system' ?
    (systemTheme == 'dark' ? { ...MD3DarkTheme, colors: theme.dark } : { ...MD3LightTheme, colors: theme.light }) :
    (appTheme == 'dark' ? { ...MD3DarkTheme, colors: theme.dark } : { ...MD3LightTheme, colors: theme.light })
  //#endregion

  return (
    <PaperProvider theme={paperTheme}>
      <Surface elevation={2} style={{ flex: 1 }}>

        {/* <View style={{ paddingTop: 30, paddingLeft: 30 }}>
          <Text>{accentColor}</Text>
          <Text>{appTheme}</Text>
          <Text>{appFont}</Text>
          <Button onPress={async()=>{
            let yut = await AsyncStorage.getItem('@accentColor');
            setAccentColor(yut)
          }}>Reset</Button>
        </View> */}

        <NavigationContainer
        // theme={{ colors: { background: paperTheme.colors.background } }}
        >
          <AppContext3.Provider value={{
            UpdateThemeTo, appTheme, setAppTheme,
            accentColor, setAccentColor, appFont, setAppFont,
            showNoteBorder, setShowNoteBorder
          }}>
            <AppContext2.Provider value={[groupList, setGroupList]}>
              <AppContext.Provider value={[data, setData, binData, setBinData]}>
                <drawer.Navigator backBehavior='history' drawerContent={(props) => (<DrawerContent {...props} />)}
                  initialRouteName='All Notes' screenOptions={{ headerShown: false }}>
                  <drawer.Screen name='Screen' component={Screens} />
                </drawer.Navigator>
              </AppContext.Provider>
            </AppContext2.Provider>
          </AppContext3.Provider>

        </NavigationContainer>

      </Surface>

      <StatusBar style='hidden'></StatusBar>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  style1: {

  }
});
