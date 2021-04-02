import React ,{useState , useEffect} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  FlatList,
  Platform,
  PermissionsAndroid,
  View,
  TouchableOpacity
} from 'react-native';

import {check, PERMISSIONS, RESULTS} from 'react-native-permissions';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';


const audioRecorderPlayer = new AudioRecorderPlayer();


const path = Platform.select({
  ios: 'hello.m4a',
  android: 'sdcard/hello.mp4', // should give extra dir name in android. Won't grant permission to the first level of dir.
});



const App = () =>{
  let data = []
  const [recordSecs,setrecordSecs] =useState(null)
  const [recordTime,setrecordTime]= useState(null)
  const [currentPositionSec,setcurrentPositionSec] =useState(null)
  const [ currentDurationSec,setcurrentDurationSec]= useState(null)
  const [playTime,setplayTime] =useState(null)
  const [duration,setduration]= useState(null)
  const [path,setpath]= useState(null)
  const [recordes,setrecordes]= useState([])

  const per  = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Permissions for write access',
            message: 'Give permission to your storage to write a file',
            buttonPositive: 'ok',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('You can use the storage');
        } else {
          console.log('permission denied');
          return;
        }
      } catch (err) {
        console.warn(err);
        return;
      }
    }
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Permissions for write access',
            message: 'Give permission to your storage to write a file',
            buttonPositive: 'ok',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('You can use the camera');
        } else {
          console.log('permission denied');
          return;
        }
      } catch (err) {
        console.warn(err);
        return;
      }
    }


    check(PERMISSIONS.ANDROID.RECORD_AUDIO)
    .then((result) => {
      switch (result) {
        case RESULTS.UNAVAILABLE:
          console.log('This feature is not available (on this device / in this context)');
          break;
        case RESULTS.DENIED:
          console.log('The permission has not been requested / is denied but requestable');
          break;
        case RESULTS.LIMITED:
          console.log('The permission is limited: some actions are possible');
          break;
        case RESULTS.GRANTED:
          console.log('The permission is granted');
          break;
        case RESULTS.BLOCKED:
          console.log('The permission is denied and not requestable anymore');
          break;
      }

    })
    .catch((error) => {
        // …
    });

  }
  
  
   const onStartRecord = async () => {
     console.log("on start record")
    const result = await audioRecorderPlayer.startRecorder();
     audioRecorderPlayer.addRecordBackListener((e) => {
      console.log(" start call back==>" , e)
       setrecordSecs(e.current_position)
       setrecordTime(audioRecorderPlayer.mmssss(Math.floor(e.current_position)))
      return;
    });
    console.log(result);
  };
  
const  onStopRecord = async () => {
  
    const result = await audioRecorderPlayer.stopRecorder();
    audioRecorderPlayer.removeRecordBackListener();
    setrecordSecs(0)
    console.log(" result in stop reacord",result);
    //console.log("pathhhh==>" , path)
    let temp = [...recordes]
    temp.push(result)
    setrecordes(temp)
  };
  
const  onStartPlay = async (item) => {
    console.log('onStartPlay', item);
    const msg = await audioRecorderPlayer.startPlayer(item);
    console.log(msg);
   audioRecorderPlayer.addPlayBackListener((e) => {
    console.log('start play call back ==>' , e);
     setcurrentPositionSec(e.current_position)
     setcurrentDurationSec(e.duration)
     setplayTime(audioRecorderPlayer.mmssss(Math.floor(e.current_position)))
     setduration(audioRecorderPlayer.mmssss(Math.floor(e.duration)))
      return;
    });

  };
  
  // onPausePlay = async () => {
  //   await this.audioRecorderPlayer.pausePlayer();
  // };
  
const  onStopPlay = async () => {
    console.log('onStopPlay');
   audioRecorderPlayer.stopPlayer();
   audioRecorderPlayer.removePlayBackListener();
  };

  useEffect(()=>{
    per()
  },[])


  return (
 <View style={{justifyContent:"center" , alignItems:"center" , paddingTop:200}}>
     
      <View style={styles.row}>
        <TouchableOpacity style={styles.touchable} onPress={()=>onStartRecord()}>
        <Text style={styles.text}> Start Record</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.touchable} onPress={()=>onStopRecord()}>
        <Text style={styles.text}> Stop Record</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.touchable} onPress={()=>onStartPlay()}>
        <Text style={styles.text}> Play Record</Text>
        </TouchableOpacity>
        </View>

        

          <FlatList
          data={recordes}
          style={{}}
          renderItem={({item,index})=>{
            return(
              <TouchableOpacity style={[styles.touchable , {marginVertical:5}]} onPress={()=>onStartPlay(item)}>
              <Text style={styles.text}> Play Record {index}</Text>
              </TouchableOpacity>
            )
          }}
          />


 </View>
  );
};


const styles = StyleSheet.create({
  row:{
flexDirection:"row" ,
paddingHorizontal:50,
marginVertical:50,
//backgroundColor:"red"
  },
  touchable:{
justifyContent:"center" ,
alignItems:"center",
padding:10,
borderRadius:8,
backgroundColor:"blue",
marginHorizontal:20, 
elevation:3
  },
  text:{
    fontSize:14,
    color:"#fff"
  }
})
export default App;
