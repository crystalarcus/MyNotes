import { createNativeStackNavigator } from '@react-navigation/native-stack';
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
import { SettingsFonts } from './SettingsFontsPage';
import { StarredScreen } from './StarredScreen';
import { NoteDetails } from './NoteDetailsScreen';
import { NoteTypeScreen } from './NoteTypeScreen';
import { CreateAudioNote } from './CreateAudioNoteScreen';
import { VoiceNoteScreen } from './VoiceNotesScreen';
// import { GroupSettings } from './GroupsSettings';
// import { createStackNavigator } from '@react-navigation/stack';
// import { Easing } from 'react-native'


const Stack = createNativeStackNavigator();

export const Screens = () => {

    const { groupList } = useContext(AppContext);

    return (
        <Stack.Navigator
            detachInactiveScreens={true}
            screenOptions={{
                headerShown: false,
            }}>
            {/* <Stack.Screen name='testscr' component={TestScr}></Stack.Screen> */}
            <Stack.Screen name='All Notes' options={{ animation: 'none' }} component={AllNotes}></Stack.Screen>
            <Stack.Screen name='AllNotesSearch' options={{ animation: 'none', presentation: 'transparentModal' }} component={AllNotesSearch}></Stack.Screen>
            {/* <Stack.Screen name='TestScreen' options={{ animation: 'none', presentation: 'transparentModal' }} component={TestScr}></Stack.Screen> */}
            <Stack.Screen name='CreateNewNote' options={{ animation: 'none', presentation: 'transparentModal' }} component={CreateNewNoteScreen}></Stack.Screen>
            <Stack.Screen name='CreateAudioNote' options={{ animation: 'none', presentation: 'transparentModal' }} component={CreateAudioNote}></Stack.Screen>
            <Stack.Screen name='VoiceNoteScreen' options={{ animation: 'none', presentation: 'transparentModal' }} component={VoiceNoteScreen}></Stack.Screen>
            <Stack.Screen name='Bin' options={{ animation: 'none', presentation: 'transparentModal' }} component={Bin}></Stack.Screen>
            <Stack.Screen name="Groups" component={Groups} options={{ animation: 'none', presentation: 'transparentModal' }} />
            {
                groupList.map((item) => {
                    return (
                        <Stack.Screen key={groupList.indexOf(item)} name={item} component={VariableGroupScreen}
                            options={{ animation: 'none', presentation: 'transparentModal' }} />
                    );
                })
            }
            <Stack.Screen name='Starred' options={{ animation: 'none', presentation: 'transparentModal' }} component={StarredScreen}></Stack.Screen>
            <Stack.Screen name='Settings' options={{ animation: 'none', presentation: 'transparentModal' }} component={Setting}></Stack.Screen>
            <Stack.Screen name='SettingsFonts' options={{ animation: 'none', presentation: 'transparentModal' }} component={SettingsFonts}></Stack.Screen>
            <Stack.Screen name='About' options={{ animation: 'none', presentation: 'transparentModal' }} component={About}></Stack.Screen>
            <Stack.Screen name='NoteDetails' options={{ animation: 'none', presentation: 'transparentModal' }} component={NoteDetails}></Stack.Screen>
            <Stack.Screen name='NoteType' component={NoteTypeScreen} options={{ animation: 'none', presentation: 'transparentModal' }}></Stack.Screen>
            {/* <Stack.Screen name='GroupSettings' component={GroupSettings} options={{ animation: 'none', presentation: 'transparentModal' }}></Stack.Screen> */}
        </Stack.Navigator >
    );

}
// export const Screens = () => {

//     const { groupList } = useContext(AppContext);

//     return (
//         <Stack.Navigator
//         detachInactiveScreens={false}
//          screenOptions={{
//             headerShown: false,
//             // transitionSpec: {
//             //     open: {
//             //         animation: 'timing',
//             //         config: {
//             //             duration: 200,
//             //         }
//             //     },
//             //     close: {
//             //         animation: 'timing',
//             //         config: {
//             //             duration: 150
//             //         }
//             //     },
//             // }
//         }}>
//             <Stack.Screen name='All Notes' options={{ animation: 'none', animationTypeForReplace: 'push' }} component={AllNotes}></Stack.Screen>
//             {/* <Stack.Screen name='testscr' component={TestScr}></Stack.Screen> */}
//             <Stack.Screen name='AllNotesSearch' options={{ animationTypeForReplace: 'push', }} component={AllNotesSearch}></Stack.Screen>
//             <Stack.Screen name='VariableSearchScreen' component={VariableSearchScreen}></Stack.Screen>
//             <Stack.Screen name='Bin' options={{ animationTypeForReplace: 'pop' }} component={Bin}></Stack.Screen>
//             <Stack.Screen name="Groups" component={Groups} options={{ presentation: 'card', animationTypeForReplace: 'push' }} />
//             {
//                 groupList.map((item) => {
//                     return (
//                         <Stack.Screen key={groupList.indexOf(item)} name={item} component={VariableGroupScreen} />
//                     );
//                 })
//             }
//             <Stack.Screen name='Settings' options={{
//                 animationTypeForReplace: 'pop', presentation: 'card'
//             }} component={Setting}></Stack.Screen>
//             <Stack.Screen name='SettingsFonts' options={{ animationTypeForReplace: 'pop' }} component={SettingsFonts}></Stack.Screen>
//             <Stack.Screen name='About' options={{ animationTypeForReplace: 'pop' }} component={About}></Stack.Screen>
//             <Stack.Screen name='CreateNewNote' component={CreateNewNoteScreen}
//                 options={{ animationTypeForReplace: 'pop' }}></Stack.Screen>
//             <Stack.Screen name='CreateVarNote' component={CreateVarNoteScreen}
//                 options={{ presentation: 'card', animationTypeForReplace: 'push' }}></Stack.Screen>
//         </Stack.Navigator >
//     );

// }
