import React, { Component, useState, useEffect } from 'react';

import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableHighlight,
    Platform,
    PermissionsAndroid,
    TouchableOpacity
} from 'react-native';

import Sound from 'react-native-sound';
import { AudioRecorder, AudioUtils } from 'react-native-audio';

const App4 = () => {

    const [currentTime, setcurrentTime] = useState(0.0)
    const [recording, setrecording] = useState(false)
    const [paused, setpaused] = useState(false)
    const [stoppedRecording, setstoppedRecording] = useState(false)
    const [finished, setfinished] = useState(false)
    const [audioPath, setaudioPath] = useState(AudioUtils.DocumentDirectoryPath + '/test.aac')
    const [hasPermission, sethasPermission] = useState(undefined)
    const [recordes, setrecordes] = useState([])

    const prepareRecordingPath = (audioPath) => {
        AudioRecorder.prepareRecordingAtPath(audioPath, {
            SampleRate: 22050,
            Channels: 1,
            AudioQuality: "Low",
            AudioEncoding: "aac",
            AudioEncodingBitRate: 32000
        });
    }
    useEffect(() => {
        AudioRecorder.requestAuthorization().then((isAuthorised) => {
            sethasPermission(isAuthorised)

            if (!isAuthorised) return;
            prepareRecordingPath(audioPath)
            AudioRecorder.onProgress = (data) => {
                setcurrentTime(Math.floor(data.currentTime))
            };

            AudioRecorder.onFinished = (data) => {
                // Android callback comes in the form of a promise instead.
                if (Platform.OS === 'ios') {
                    finishRecording(data.status === "OK", data.audioFileURL, data.audioFileSize)

                }
            };
        });
    }, [])


    const renderButton = (title, onPress, active) => {
        var style = (active) ? styles.activeButtonText : styles.buttonText;

        return (
            <TouchableHighlight style={styles.button} onPress={onPress}>
                <Text style={style}>
                    {title}
                </Text>
            </TouchableHighlight>
        );
    }

    const renderPauseButton = (onPress, active) => {
        var style = (active) ? styles.activeButtonText : styles.buttonText;
        var title = paused ? "RESUME" : "PAUSE";
        return (
            <TouchableHighlight style={styles.button} onPress={onPress}>
                <Text style={style}>
                    {title}
                </Text>
            </TouchableHighlight>
        );
    }

    const pause = async () => {
        if (!recording) {
            console.warn('Can\'t pause, not recording!');
            return;
        }

        try {
            const filePath = await AudioRecorder.pauseRecording();
            setpaused(true)
        } catch (error) {
            console.error(error);
        }
    }

    const resume = async () => {
        if (!paused) {
            console.warn('Can\'t resume, not paused!');
            return;
        }

        try {
            await AudioRecorder.resumeRecording();
            setpaused(false)
        } catch (error) {
            console.error(error);
        }
    }

    const stop = async () => {
        if (!recording) {
            console.warn('Can\'t stop, not recording!');
            return;
        }

        setstoppedRecording(true)
        setrecording(false)
        setpaused(false)
        try {
            const filePath = await AudioRecorder.stopRecording();

            if (Platform.OS === 'android') {
                finishRecording(true, filePath)
            }
            return filePath;
        } catch (error) {
            console.error(error);
        }
    }
    const play = async (item) => {
        if (recording) {
            await stop();
        }

        // These timeouts are a hacky workaround for some issues with react-native-sound.
        // See https://github.com/zmxv/react-native-sound/issues/89.
        setTimeout(() => {
            var sound = new Sound(item, '', (error) => {
                if (error) {
                    console.log('failed to load the sound', error);
                }
            });

            setTimeout(() => {
                sound.play((success) => {
                    if (success) {
                        console.log('successfully finished playing');
                    } else {
                        console.log('playback failed due to audio decoding errors');
                    }
                });
            }, 100);
        }, 100);
    }

    // const play = async () => {
    //     if (recording) {
    //         await stop();
    //     }

    //     // These timeouts are a hacky workaround for some issues with react-native-sound.
    //     // See https://github.com/zmxv/react-native-sound/issues/89.
    //     setTimeout(() => {
    //         var sound = new Sound(audioPath, '', (error) => {
    //             if (error) {
    //                 console.log('failed to load the sound', error);
    //             }
    //         });

    //         setTimeout(() => {
    //             sound.play((success) => {
    //                 if (success) {
    //                     console.log('successfully finished playing');
    //                 } else {
    //                     console.log('playback failed due to audio decoding errors');
    //                 }
    //             });
    //         }, 100);
    //     }, 100);
    // }

    const record = async () => {
        if (recording) {
            console.warn('Already recording!');
            return;
        }

        if (!hasPermission) {
            console.warn('Can\'t record, no permission granted!');
            return;
        }

        if (stoppedRecording) {
            prepareRecordingPath(audioPath);
        }
        setrecording(true)
        setpaused(false)

        try {
            const filePath = await AudioRecorder.startRecording();
        } catch (error) {
            console.error(error);
        }
    }

    const finishRecording = (didSucceed, filePath, fileSize) => {
        //  /data/user/0/com.test/files/test.aac
        setfinished(didSucceed)
        console.log(`Finished recording of duration ${currentTime} seconds at path: ${filePath} and size of ${fileSize || 0} bytes`);
        // filePath = " /data/user/0/com.test/files/" + Math.random().toString() + ".aac"
        console.log("new path==>", filePath)
        let temp = [...recordes]
        temp.push(filePath)
        setrecordes(temp)
    }



    return (
        <View style={styles.container}>
            <View style={styles.controls}>
                {renderButton("RECORD", () => { record() }, recording)}
                {renderButton("PLAY", () => { play() })}
                {renderButton("STOP", () => { stop() })}
                {/* {this._renderButton("PAUSE", () => {this._pause()} )} */}
                {renderPauseButton(() => { paused ? resume() : pause() })}
                <Text style={styles.progressText}>{currentTime}s</Text>

                <FlatList
                    data={recordes}
                    style={{}}
                    renderItem={({ item, index }) => {
                        return (
                            <TouchableOpacity style={[styles.touchable, { marginVertical: 5 }]} onPress={() => play(item)}>
                                <Text style={styles.text}> Play Record {index}</Text>
                            </TouchableOpacity>
                        )
                    }}
                />
            </View>
        </View>
    );

}

var styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#2b608a",
    },
    controls: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
    },
    progressText: {
        paddingTop: 50,
        fontSize: 50,
        color: "#fff"
    },
    button: {
        padding: 20
    },
    disabledButtonText: {
        color: '#eee'
    },
    buttonText: {
        fontSize: 20,
        color: "#fff"
    },
    activeButtonText: {
        fontSize: 20,
        color: "#B81F00"
    },
    touchable: {
        justifyContent: "center",
        alignItems: "center",
        padding: 10,
        borderRadius: 8,
        backgroundColor: "blue",
        marginHorizontal: 20,
        elevation: 3
    },
    text: {
        fontSize: 14,
        color: "#fff"
    }

});

export default App4;