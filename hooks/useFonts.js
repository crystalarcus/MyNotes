import * as Font from "expo-font";
 
export default useFonts = async () =>
  await Font.loadAsync({
    'Montserrat-Regular': require('../assets/fonts/Montserrat-Regular.ttf'),
  });