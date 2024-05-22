import { Button, Dialog, Text } from "react-native-paper";
import { AnimatedDialog } from "./AnimatedDialog";
import { memo } from "react";
import { View } from "react-native";
import Carousel from 'react-native-reanimated-carousel';


export const NoteTypeDialog = memo(({ isDialogVisible, setIsDialogVisible, data, touchable, setTouchable, thisTheme, setIsSnackVisible, goBack,
    deleteNoteKey, binData, setRefList }) => {
    return (
        <AnimatedDialog visible={isDialogVisible}
            animationType={'slide'}
            setVisible={setIsDialogVisible} touchable={touchable}
            setTouchable={setTouchable} thisTheme={thisTheme}>
            {/* <Dialog.Icon icon={"trash-can-outline"} /> */}
            <Dialog.Title style={{ textAlign: 'center' }}>Note Type</Dialog.Title>
            <Dialog.Content>
                <Text>
                    The note will be moved to Bin. You can restore the note again from Bin.
                </Text>
                <Carousel style={{zIndex:200}}
                    loop
                    width={200}
                    height={100}
                    autoPlay={false}
                    data={[1,2,3]}
                    scrollAnimationDuration={500}
                    onSnapToItem={(index) => { }}
                    panGestureHandlerProps={{
                        activeOffsetX: [-10, 10],
                    }}
                    renderItem={({ index }) => (
                        <View
                            style={{
                                flex: 1,
                                borderWidth: 1,
                                justifyContent: 'center',
                            }}
                        >
                            <Text style={{ textAlign: 'center', fontSize: 30 }}>
                                {index}
                            </Text>
                        </View>
                    )}
                />
            </Dialog.Content>

            <Dialog.Actions>
                <View style={{ flexDirection: 'row' }}>
                    <Button
                        labelStyle={{ fontFamily: 'Manrope-Bold' }}
                        // icon={'close'}
                        contentStyle={{ paddingHorizontal: 8 }}
                        onPress={() => {
                            setTouchable(false);
                        }}>
                        Cancel
                    </Button>
                    <Button
                        mode="contained-tonal"
                        // icon={'trash-can-outline'}
                        labelStyle={{ fontFamily: 'Manrope-Bold' }}
                        onPress={() => {
                            setTouchable(false);
                        }}>
                        Ok
                    </Button>
                </View>
            </Dialog.Actions>
        </AnimatedDialog>
    )
})