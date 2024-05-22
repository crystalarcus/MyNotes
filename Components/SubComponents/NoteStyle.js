import { StyleSheet } from "react-native";

export const NoteStyle = StyleSheet.create({
    itemView: {
        borderRadius: 20,
        shadowColor: 'transparent',
        overflow: 'hidden',

    },
    textContent: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        gap: 8,
    },
    textContentCompact: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
    },

    actionViewMain: {
        display: 'flex',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        overflow: 'visible'
    },
    ActionTextView: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        fontFamily: 'Manrope',
        fontSize: 14
    },
    actionView: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    compactItemView: {
        borderRadius: 20,
        shadowColor: 'transparent',
        overflow: 'hidden',
    }
});