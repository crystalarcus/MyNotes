import { AllNotes } from './AllNotesScreen';
import { About } from './AboutScreen';
import { Setting } from "./SettingsScreen";
import { AllNotesSearch } from './SearchScreen';
import { CreateNewNoteScreen } from './CreateNewNoteScreen';
import { Bin } from "./BinScreen";
import { Groups } from "./GroupsScreen";
import { useContext } from "react";
import { AppContext } from "../AppContext";
import { VariableGroupScreen } from "./VariableGroupScreen";
import { VariableSearchScreen } from "./VariableSearchScreen";
import { CreateVarNoteScreen } from "./CreateVarNoteScreen";
import { createStackNavigator } from '@react-navigation/stack';
import { TestScr } from './SubComponents/testScreen';
import { SettingsFonts } from './SettingsFontsPage';


const Stack = createStackNavigator();

export const Screens = () => {

    const { groupList } = useContext(AppContext);

    return (
        <Stack.Navigator detachInactiveScreens={false} screenOptions={{
            headerShown: false,
        }}>
            <Stack.Screen name='All Notes' options={{ animation: 'none', animationTypeForReplace: 'push' }} component={AllNotes}></Stack.Screen>
            {/* <Stack.Screen name='testscr' component={TestScr}></Stack.Screen> */}
            <Stack.Screen name='AllNotesSearch' options={{ animationTypeForReplace: 'pop' }} component={AllNotesSearch}></Stack.Screen>
            <Stack.Screen name='VariableSearchScreen' component={VariableSearchScreen}></Stack.Screen>
            <Stack.Screen name='Bin' options={{ animationTypeForReplace: 'pop' }} component={Bin}></Stack.Screen>
            <Stack.Screen name="Groups" component={Groups} options={{ animationTypeForReplace: 'push' }} />
            {groupList.map((item) => {
                return (
                    <Stack.Screen key={groupList.indexOf(item)} name={item} component={VariableGroupScreen} />
                );
            })}
            <Stack.Screen name='Settings' options={{ animationTypeForReplace: 'pop' }} component={Setting}></Stack.Screen>
            <Stack.Screen name='SettingsFonts' options={{ animationTypeForReplace: 'pop' }} component={SettingsFonts}></Stack.Screen>
            <Stack.Screen name='About' options={{ animationTypeForReplace: 'pop' }} component={About}></Stack.Screen>
            <Stack.Screen name='CreateNewNote' component={CreateNewNoteScreen}
                options={{ animationTypeForReplace: 'pop' }}></Stack.Screen>
            <Stack.Screen name='CreateVarNote' component={CreateVarNoteScreen}
                options={{ presentation: 'card', animationTypeForReplace: 'push' }}></Stack.Screen>
        </Stack.Navigator>
    );

}
// transitionSpec: {
//     open: {
//         animation: 'timing',
//         config: {
//             duration: 200
//         }
//     },
//     close: {
//         animation: 'timing',
//         config: {
//             duration: 150
//         }
//     },
// }